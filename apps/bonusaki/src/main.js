import "./styles.css";

const QR_URL = new URL("../qr.svg", import.meta.url).href;
const API = {
  campaign: "/api/bonusaki/campaign",
  events: "/api/bonusaki/events",
  issue: "/api/bonusaki/rewards/issue",
  validate: "/api/bonusaki/rewards/validate",
  redeem: "/api/bonusaki/rewards/redeem",
};

const SESSION_KEY = "bonusaki_demo_session";
const CASHIER_PIN_KEY = "bonusaki_cashier_pin";

const REWARD_DISPLAY = {
  burger: { icon: "🍔", label: "Δωρεάν burger" },
  fries: { icon: "🍟", label: "Δωρεάν πατάτες" },
  pizza: { icon: "🍕", label: "Κομμάτι pizza" },
  dessert: { icon: "🍰", label: "Δωρεάν επιδόρπιο" },
  drink: { icon: "🥤", label: "Δωρεάν αναψυκτικό" },
  "soft-drink": { icon: "🥤", label: "Δωρεάν αναψυκτικό" },
  coffee: { icon: "☕", label: "Δωρεάν καφές" },
};

const FALLBACK_REWARDS = [
  { emoji: "burger", label: "Free burger", weight: 25 },
  { emoji: "fries", label: "Free fries", weight: 20 },
  { emoji: "pizza", label: "Pizza slice", weight: 15 },
  { emoji: "dessert", label: "Free dessert", weight: 15 },
  { emoji: "drink", label: "Free soft drink", weight: 15 },
  { emoji: "coffee", label: "Free coffee", weight: 10 },
];

const star = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#FBD03B" stroke="#1b1b1b" stroke-width="2.2" stroke-linejoin="round"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>';
const STARS = `<div class="flex justify-center gap-0.5">${star}${star}${star}</div>`;

const tabs = document.getElementById("tabs");
const screen = document.getElementById("screen");
const appState = {
  campaign: null,
  currentReward: null,
  currentToken: null,
  currentCode: null,
  currentExpiresAt: null,
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getParams() {
  return new URLSearchParams(window.location.search);
}

function getAttribution() {
  const params = getParams();
  return {
    merchant: (params.get("merchant") || "").slice(0, 80),
    campaign: (params.get("campaign") || "").slice(0, 80),
    qr: (params.get("qr") || "").slice(0, 80),
    verify: (params.get("verify") || "").slice(0, 160),
  };
}

function getCampaignIdentity() {
  const attribution = getAttribution();
  return {
    merchantSlug: attribution.merchant || undefined,
    campaignSlug: attribution.campaign || undefined,
    qrCode: attribution.qr || undefined,
    qrVerify: attribution.verify || undefined,
  };
}

function getSessionId() {
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return "";
  }
}

function readStoredCashierPin() {
  try {
    return sessionStorage.getItem(CASHIER_PIN_KEY) || "";
  } catch {
    return "";
  }
}

function writeStoredCashierPin(pin) {
  try {
    if (pin) {
      sessionStorage.setItem(CASHIER_PIN_KEY, pin);
    }
  } catch {}
}

function trackDemoEvent(eventName, metadata = {}) {
  const payload = {
    eventName,
    surface: "bonusaki_demo",
    path: window.location.pathname,
    sessionId: getSessionId(),
    metadata: {
      ...getAttribution(),
      ...metadata,
    },
  };

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload.metadata, product: "bonusaki" });
  } catch {}

  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(API.events, new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(API.events, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await readJson(response);
  if (!response.ok) {
    const error = new Error(data.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);
  if (!response.ok) {
    const error = new Error(data.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function rewardKey(reward) {
  const raw = String(reward?.emoji || reward?.id || reward?.label || "").toLowerCase();
  if (raw.includes("soft") || raw.includes("drink")) return "drink";
  if (raw.includes("fries")) return "fries";
  if (raw.includes("pizza")) return "pizza";
  if (raw.includes("dessert")) return "dessert";
  if (raw.includes("coffee")) return "coffee";
  if (raw.includes("burger")) return "burger";
  return raw.replace(/^bonusaki-reward-/, "") || "coffee";
}

function displayReward(reward) {
  const key = rewardKey(reward);
  const display = REWARD_DISPLAY[key];
  return {
    icon: display?.icon || (/\p{Extended_Pictographic}/u.test(String(reward?.emoji || "")) ? reward.emoji : "🎁"),
    label: display?.label || reward?.label || "Bonusaki reward",
    description: reward?.description || "",
    weight: Number(reward?.weight || 0),
  };
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("el-GR", { day: "numeric", month: "short", year: "numeric" });
}

function statusCopy(status) {
  const map = {
    issued: { badge: "ΕΓΚΥΡΟ", tone: "text-green-700", bg: "bg-green-300" },
    redeemed: { badge: "ΕΞΑΡΓΥΡΩΘΗΚΕ", tone: "text-neutral-700", bg: "bg-neutral-200" },
    expired: { badge: "ΕΛΗΞΕ", tone: "text-amber-700", bg: "bg-amber-200" },
    void: { badge: "ΑΚΥΡΟ", tone: "text-red-700", bg: "bg-red-300" },
  };
  return map[status] || map.void;
}

function selectTab(tab) {
  [...tabs.children].forEach((button) => button.setAttribute("aria-selected", button.dataset.tab === tab));
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tab;
  });
  if (tab === "customer") renderCustomer("form");
  if (tab === "cashier") renderCashierControls();
}

tabs.addEventListener("click", (event) => {
  const button = event.target.closest(".tabbtn");
  if (!button) return;
  const tab = button.dataset.tab;
  trackDemoEvent("bonusaki_demo_tab", { tab });
  selectTab(tab);
});

function updateShellCopy(campaign) {
  const merchant = campaign?.merchant?.name || "Kafe Gonia";
  const pilot = campaign?.pilot;
  const live = Boolean(pilot?.pilotEnabled && pilot?.tokenSigningConfigured);
  const badge = document.querySelector("header span.rounded-full");
  if (badge) badge.textContent = live ? "live pilot" : "pilot setup";
  document.title = live
    ? `Bonusaki - ${merchant} live reward pilot`
    : "Bonusaki - production reward pilot";

  const intro = document.querySelector(".mx-auto.max-w-5xl.px-4.py-6 > p");
  if (intro) {
    intro.innerHTML = live
      ? `<strong>${escapeHtml(merchant)} live pilot:</strong> κάθε έγκυρο QR εκδίδει ένα πραγματικό server-side reward. Το δώρο εξαργυρώνεται μία φορά στο ταμείο με validation code και cashier PIN.`
      : `<strong>Bonusaki production pilot setup:</strong> το UI είναι συνδεδεμένο με τα production APIs, αλλά η έκδοση πραγματικών rewards ενεργοποιείται μόνο όταν μπουν τα production secrets και ανοίξει το pilot.`;
  }
}

async function loadCampaign() {
  const identity = getCampaignIdentity();
  const params = new URLSearchParams();
  if (identity.merchantSlug) params.set("merchantSlug", identity.merchantSlug);
  if (identity.campaignSlug) params.set("campaignSlug", identity.campaignSlug);
  const suffix = params.toString() ? `?${params}` : "";
  try {
    appState.campaign = await getJson(`${API.campaign}${suffix}`);
    updateShellCopy(appState.campaign);
    renderMerchantDashboard();
  } catch (error) {
    updateShellCopy(null);
    renderMerchantDashboard();
  }
}

async function issueReward(customerEmail) {
  const identity = getCampaignIdentity();
  return postJson(API.issue, {
    merchantSlug: identity.merchantSlug,
    campaignSlug: identity.campaignSlug,
    qrCode: identity.qrCode,
    qrVerify: identity.qrVerify,
    customerEmail: customerEmail || undefined,
    sessionId: getSessionId(),
    source: "customer_scan",
  });
}

function renderIssueError(error) {
  const code = error?.data?.code || "unknown";
  const copy = {
    pilot_disabled: "Το pilot δεν είναι ενεργό ακόμα. Ζήτησε από το κατάστημα να ενεργοποιήσει την καμπάνια.",
    campaign_unavailable: "Η καμπάνια δεν είναι διαθέσιμη αυτή τη στιγμή.",
    daily_limit_reached: "Το σημερινό όριο δώρων έχει συμπληρωθεί.",
    reward_unavailable: "Δεν υπάρχει διαθέσιμο δώρο αυτή τη στιγμή.",
    invalid_qr: "Το QR δεν είναι έγκυρο για αυτή την καμπάνια.",
    qr_already_used: "Αυτό το QR έχει ήδη χρησιμοποιηθεί.",
  }[code] || "Δεν μπορέσαμε να εκδώσουμε δώρο. Δοκίμασε ξανά στο ταμείο.";

  trackDemoEvent("bonusaki_reward_issue_failed", { code });
  screen.innerHTML = `
    <div class="flex h-full flex-col items-center justify-center px-5 text-ink">
      <div class="pop w-full rounded-3xl border-2 border-ink bg-white p-6 text-center shadow-pop">
        ${STARS}
        <div class="mt-3 text-4xl">⛔</div>
        <div class="mt-2 font-display text-xl font-bold">Δεν εκδόθηκε δώρο</div>
        <p class="mt-2 text-sm font-semibold text-ink/70">${escapeHtml(copy)}</p>
        <div class="mt-4 rounded-xl border-2 border-ink bg-cream px-3 py-2 text-xs font-semibold text-ink/60">
          Κωδικός: ${escapeHtml(code)}
        </div>
        <button id="retry-play" class="mt-4 w-full rounded-2xl border-2 border-ink bg-sun px-4 py-2.5 text-sm font-bold shadow-popsm">Πίσω</button>
      </div>
    </div>`;
  document.getElementById("retry-play").addEventListener("click", () => renderCustomer("form"));
}

async function startCustomerPlay(method) {
  const emailInput = document.getElementById("email");
  const customerEmail = (emailInput?.value || "").trim();
  if (customerEmail && !emailInput.checkValidity()) {
    emailInput.focus();
    emailInput.reportValidity();
    return;
  }

  const playButton = document.getElementById("play");
  if (playButton) {
    playButton.disabled = true;
    playButton.textContent = "Εκδίδεται δώρο...";
  }

  trackDemoEvent("bonusaki_reward_issue_start", { method });
  try {
    const issued = await issueReward(customerEmail);
    appState.currentReward = issued.reward;
    appState.currentToken = issued.token;
    appState.currentCode = issued.publicCode;
    appState.currentExpiresAt = issued.expiresAt;
    trackDemoEvent("bonusaki_reward_issued", {
      reward: issued.reward?.id || issued.reward?.label || "unknown",
      publicCode: issued.publicCode,
    });
    renderCustomer("scratch");
  } catch (error) {
    renderIssueError(error);
  }
}

function renderCustomer(state, celebrate = true) {
  if (state === "form") {
    appState.currentReward = null;
    appState.currentToken = null;
    appState.currentCode = null;
    appState.currentExpiresAt = null;
    const attribution = getAttribution();
    const qrLabel = attribution.qr ? `QR ${escapeHtml(attribution.qr)}` : "QR καταστήματος";
    screen.innerHTML = `
      <div class="flex h-full flex-col px-5 pt-7 text-ink">
        <div class="text-center">
          ${STARS}
          <div class="mt-1 font-display text-2xl font-bold">Σκάναρε &amp; κέρδισε</div>
          <p class="mt-1 text-sm text-ink/70">Πραγματικό δώρο για εξαργύρωση στο ταμείο</p>
        </div>
        <div class="scanframe relative mx-auto mt-5 grid aspect-square w-44 place-items-center rounded-3xl border-2 border-ink bg-sky shadow-pop">
          <span class="cnr tl"></span><span class="cnr tr"></span><span class="cnr bl"></span><span class="cnr br"></span>
          <div class="flex items-end gap-1">
            <span class="text-5xl">☕</span>
            <div class="relative"><span class="text-6xl">🥡</span>
              <img src="${QR_URL}" alt="" class="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded bg-white p-0.5" />
            </div>
          </div>
        </div>
        <div class="mx-auto mt-3 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold shadow-popsm">${qrLabel}</div>
        <div class="mt-auto pb-7 pt-5">
          <div class="flex items-center gap-2 rounded-2xl border-2 border-ink bg-white px-3 py-2.5 shadow-popsm">
            <span>✉️</span>
            <input id="email" type="email" placeholder="Το email σου (προαιρετικό)" class="w-full bg-transparent text-sm outline-none placeholder:text-ink/40" />
          </div>
          <p class="mt-2 text-[11px] font-semibold leading-snug text-ink/55">Το email χρησιμοποιείται για το reward και campaign reporting. Το δώρο ισχύει μία φορά.</p>
          <button id="play" class="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-sun px-4 py-3 font-display text-lg font-bold shadow-pop transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">Συνέχεια →</button>
        </div>
      </div>`;
    document.getElementById("play").addEventListener("click", () => startCustomerPlay("button"));
    document.getElementById("email").addEventListener("keydown", (event) => {
      if (event.key === "Enter") startCustomerPlay("enter");
    });
  }

  if (state === "scratch") {
    const reward = displayReward(appState.currentReward);
    trackDemoEvent("bonusaki_scratch_view");
    screen.innerHTML = `
      <div class="flex h-full flex-col items-center justify-center px-6 text-ink">
        <div class="mb-3 font-display text-base font-bold">Ξύσε για να αποκαλύψεις!</div>
        <div class="relative h-44 w-full overflow-hidden rounded-2xl border-2 border-ink shadow-pop">
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-sun to-sky text-ink">
            <div class="text-4xl">${reward.icon}</div>
            <div class="px-4 text-center font-display text-xl font-bold">${escapeHtml(reward.label)}</div>
          </div>
          <canvas id="scratch" class="absolute inset-0 h-full w-full"></canvas>
        </div>
        <button id="reveal" class="mt-4 text-xs font-semibold underline">αποκάλυψη αμέσως</button>
      </div>`;
    requestAnimationFrame(() => initScratch(document.getElementById("scratch"), () => {
      trackDemoEvent("bonusaki_scratch_completed");
      renderCustomer("done");
    }));
    document.getElementById("reveal").addEventListener("click", () => {
      trackDemoEvent("bonusaki_reveal_now");
      renderCustomer("done");
    });
  }

  if (state === "done") {
    const reward = displayReward(appState.currentReward);
    trackDemoEvent("bonusaki_reward_view", {
      reward: appState.currentReward?.id || appState.currentReward?.label || "unknown",
      publicCode: appState.currentCode,
    });
    screen.innerHTML = `
      <div class="flex h-full flex-col items-center justify-center px-5 text-ink">
        <div class="pop w-full rounded-3xl border-2 border-ink bg-white p-6 text-center shadow-pop">
          ${STARS}
          <div class="mt-2 text-xs font-bold uppercase tracking-wide text-ink/50">Κέρδισες</div>
          <div class="mt-1 text-4xl">${reward.icon}</div>
          <div class="mt-1 font-display text-2xl font-bold">${escapeHtml(reward.label)}</div>
          <div class="mt-4 rounded-xl border-2 border-ink bg-cream px-3 py-2 font-mono text-sm tracking-wider">${escapeHtml(appState.currentCode || "")}</div>
          <div class="mt-3 text-xs font-semibold text-ink/60">Δείξε αυτόν τον κωδικό στο ταμείο. Δεν αρκεί screenshot χωρίς validation.</div>
          <div class="mt-3 grid gap-2">
            <button data-wallet-provider="pass" class="rounded-2xl border-2 border-ink bg-ink px-4 py-2.5 text-sm font-bold text-white shadow-popsm transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">Προβολή reward pass</button>
            <button data-open-cashier class="rounded-2xl border-2 border-ink bg-white px-4 py-2.5 text-sm font-bold shadow-popsm transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">Άνοιγμα ταμείου για δοκιμή</button>
          </div>
        </div>
        <button id="again" class="mt-4 text-xs font-semibold underline">νέο QR / νέα προσπάθεια</button>
      </div>`;
    screen.querySelector("[data-wallet-provider]").addEventListener("click", () => addToWallet("pass"));
    screen.querySelector("[data-open-cashier]").addEventListener("click", () => openCashierWithCode(appState.currentCode));
    document.getElementById("again").addEventListener("click", () => renderCustomer("form"));
    if (celebrate) confettiBurst();
  }
}

function barcodeBars(seed) {
  let hash = 0;
  for (const character of String(seed)) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  let output = "";
  for (let index = 0; index < 48; index += 1) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    const width = 2 + ((hash >> 28) & 3);
    const on = (hash >> 23) & 1;
    output += `<div style="width:${width}px;background:${on ? "#111" : "#fff"}"></div>`;
  }
  return output;
}

function addToWallet(provider) {
  const reward = displayReward(appState.currentReward);
  const code = appState.currentCode || "";
  trackDemoEvent("bonusaki_pass_view", { provider, publicCode: code });
  screen.innerHTML = `
    <div class="flex h-full flex-col px-4 pt-5 text-ink">
      <div class="mb-3 flex items-center justify-between text-xs">
        <button data-return-reward class="font-semibold opacity-80 active:scale-95">‹ Πίσω</button>
        <span class="rounded-full border-2 border-ink bg-white px-2.5 py-0.5 font-semibold">Bonusaki pass</span>
      </div>
      <div class="pop overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-pop">
        <div class="flex items-center gap-2 border-b-2 border-ink bg-sun/50 px-4 py-3">
          <div class="grid h-7 w-7 place-items-center rounded-lg border-2 border-ink bg-sun text-sm font-bold">B</div>
          <div class="font-display text-sm font-bold">${escapeHtml(appState.campaign?.merchant?.name || "Kafe Gonia")}</div>
        </div>
        <div class="px-4 pb-3 pt-4">
          <div class="text-[11px] uppercase tracking-wide text-ink/50">Ανταμοιβή</div>
          <div class="font-display text-xl font-bold">${reward.icon} ${escapeHtml(reward.label)}</div>
          <div class="mt-3 flex justify-between">
            <div><div class="text-[11px] uppercase tracking-wide text-ink/50">Λήγει</div><div class="text-sm font-semibold">${escapeHtml(formatDate(appState.currentExpiresAt))}</div></div>
            <div class="text-right"><div class="text-[11px] uppercase tracking-wide text-ink/50">Κατάσταση</div><div class="text-sm font-bold text-green-600">Έγκυρο</div></div>
          </div>
        </div>
        <div class="border-t-2 border-dashed border-ink px-4 py-4">
          <div class="flex h-14 items-stretch justify-center overflow-hidden">${barcodeBars(code)}</div>
          <div class="mt-2 text-center font-mono text-xs tracking-[0.24em] text-ink/60">${escapeHtml(code)}</div>
        </div>
      </div>
      <div class="pop mt-4 rounded-2xl border-2 border-ink bg-green-300 px-4 py-3 text-sm font-semibold shadow-popsm">
        Δείξε τον κωδικό στο ταμείο. Ο υπάλληλος πρέπει να τον κάνει validate και redeem.
      </div>
      <button data-copy-code class="mx-auto mt-4 text-xs font-semibold underline">αντιγραφή κωδικού</button>
    </div>`;
  screen.querySelector("[data-return-reward]").addEventListener("click", () => renderCustomer("done", false));
  screen.querySelector("[data-copy-code]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code);
      screen.querySelector("[data-copy-code]").textContent = "αντιγράφηκε";
    } catch {}
  });
}

function initScratch(canvas, onReveal) {
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  context.scale(dpr, dpr);
  context.fillStyle = "#c9a227";
  context.fillRect(0, 0, rect.width, rect.height);
  context.fillStyle = "#7a6210";
  context.font = "bold 16px Fredoka, system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText("✦ ξύσε εδώ ✦", rect.width / 2, rect.height / 2);
  context.globalCompositeOperation = "destination-out";
  let drawing = false;
  let revealed = false;

  function scratch(clientX, clientY) {
    if (revealed) return;
    const box = canvas.getBoundingClientRect();
    context.beginPath();
    context.arc(clientX - box.left, clientY - box.top, 22, 0, Math.PI * 2);
    context.fill();
    if (cleared(context, box.width, box.height) > 0.5) {
      revealed = true;
      onReveal();
    }
  }

  canvas.addEventListener("pointerdown", (event) => {
    drawing = true;
    scratch(event.clientX, event.clientY);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (drawing) scratch(event.clientX, event.clientY);
  });
  canvas.addEventListener("pointerup", () => { drawing = false; });
  canvas.addEventListener("pointerleave", () => { drawing = false; });
}

function cleared(context, width, height) {
  const step = 12;
  let clear = 0;
  let total = 0;
  try {
    const data = context.getImageData(0, 0, Math.max(1, width), Math.max(1, height)).data;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const alpha = data[(Math.floor(y) * Math.floor(width) + Math.floor(x)) * 4 + 3];
        if (alpha === 0) clear += 1;
        total += 1;
      }
    }
  } catch {
    return 0;
  }
  return total ? clear / total : 0;
}

function confettiBurst() {
  const canvas = document.getElementById("confetti");
  const context = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const colors = ["#FBD03B", "#9FD8F5", "#34d399", "#60a5fa", "#f87171", "#fb923c"];
  const parts = [];
  for (let index = 0; index < 110; index += 1) {
    parts.push({
      x: innerWidth * (0.35 + Math.random() * 0.3),
      y: innerHeight * 0.3,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -9 - 3,
      g: 0.28,
      color: colors[index % colors.length],
      size: 4 + Math.random() * 5,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.35,
    });
  }
  let tick = 0;
  (function frame() {
    tick += 1;
    context.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach((part) => {
      part.vy += part.g;
      part.x += part.vx;
      part.y += part.vy;
      part.rot += part.vr;
      context.save();
      context.translate(part.x, part.y);
      context.rotate(part.rot);
      context.fillStyle = part.color;
      context.fillRect(-part.size / 2, -part.size / 2, part.size, part.size * 1.6);
      context.restore();
    });
    if (tick < 110) requestAnimationFrame(frame);
    else context.clearRect(0, 0, canvas.width, canvas.height);
  })();
}

function renderMerchantDashboard() {
  const rewards = appState.campaign?.rewards?.length ? appState.campaign.rewards : FALLBACK_REWARDS;
  const bars = document.getElementById("scanbars");
  if (bars) {
    const heights = [30, 42, 38, 55, 60, 48, 70, 65, 80, 72, 90, 77, 95, 88];
    bars.innerHTML = heights.map((height) => `<div class="flex-1 rounded-t border-2 border-ink bg-sky" style="height:${height}%"></div>`).join("");
  }

  const distEl = document.getElementById("dist");
  if (distEl) {
    const maxWeight = Math.max(...rewards.map((reward) => Number(reward.weight || 0)), 1);
    distEl.innerHTML = rewards.map((reward) => {
      const display = displayReward(reward);
      const issued = Number(reward.issuedCount || 0);
      const redeemed = Number(reward.redeemedCount || 0);
      const width = Math.max(6, Math.round((Number(reward.weight || 0) / maxWeight) * 100));
      return `<div>
        <div class="flex justify-between text-xs"><span class="font-semibold">${display.icon} ${escapeHtml(display.label)}</span><span class="text-ink/60">${issued} δόθηκαν · ${redeemed} εξαργ.</span></div>
        <div class="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-ink bg-white"><div class="h-full bg-sun" style="width:${width}%"></div></div>
      </div>`;
    }).join("");
  }

  const tiersEl = document.getElementById("tiers");
  if (!tiersEl) return;
  const tiers = rewards.map((reward) => {
    const display = displayReward(reward);
    return { icon: display.icon, label: display.label, weight: Number(reward.weight || 0) };
  });

  function meter() {
    const sum = tiers.reduce((total, tier) => total + (Number(tier.weight) || 0), 0);
    const meterEl = document.getElementById("weightmeter");
    if (!meterEl) return;
    meterEl.innerHTML = `
      <span class="text-ink/70">Σύνολο ${sum}</span>
      <div class="h-2 w-20 overflow-hidden rounded-full border-2 border-ink bg-white"><div class="h-full bg-green-400 transition-all" style="width:${Math.min(100, sum)}%"></div></div>`;
  }

  tiersEl.innerHTML = tiers.map((tier, index) => `
    <div class="flex items-center gap-2 rounded-xl border-2 border-ink bg-cream px-3 py-2">
      <span class="text-xl">${tier.icon}</span>
      <span class="flex-1 truncate text-sm font-semibold">${escapeHtml(tier.label)}</span>
      <input type="number" data-w="${index}" value="${tier.weight}" class="w-14 rounded-lg border-2 border-ink bg-white px-2 py-1 text-right text-sm font-bold outline-none">
      <span class="text-xs text-ink/50">w</span>
    </div>`).join("");
  tiersEl.querySelectorAll("[data-w]").forEach((input) => {
    input.addEventListener("input", () => {
      tiers[Number(input.dataset.w)].weight = Number(input.value) || 0;
      meter();
    });
  });
  meter();
}

function normalizePublicCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 80);
}

function renderCashierResult(kind, title, subtitle, redemption) {
  const resultEl = document.getElementById("redeem-result");
  if (!resultEl) return;
  const tone = {
    ok: "bg-green-300",
    warn: "bg-amber-200",
    used: "bg-neutral-200",
    bad: "bg-red-300",
  }[kind] || "bg-white";
  const reward = displayReward(redemption?.reward);
  const status = redemption?.status ? statusCopy(redemption.status) : null;
  resultEl.innerHTML = `<div class="pop rounded-2xl border-2 border-ink ${tone} p-5 text-center shadow-pop">
    <div class="text-4xl">${kind === "ok" ? "✅" : kind === "used" ? "🚫" : kind === "warn" ? "⚠️" : "⛔"}</div>
    <div class="mt-1 font-display text-2xl font-bold">${escapeHtml(title)}</div>
    <div class="mt-1 text-sm font-semibold text-ink/80">${escapeHtml(subtitle)}</div>
    ${redemption ? `
      <div class="mt-3 rounded-xl border-2 border-ink bg-white/70 px-3 py-2 text-left text-xs font-semibold">
        <div>${reward.icon} ${escapeHtml(reward.label)}</div>
        <div class="mt-1 font-mono">${escapeHtml(redemption.publicCode || "")}</div>
        <div class="mt-1 ${status?.tone || ""}">${escapeHtml(status?.badge || redemption.status || "")}</div>
      </div>` : ""}
  </div>`;
}

async function validateCashierCode() {
  const publicCode = normalizePublicCode(document.getElementById("cashier-code")?.value);
  if (!publicCode) {
    renderCashierResult("warn", "Βάλε κωδικό", "Πληκτρολόγησε τον public reward code από το pass.");
    return null;
  }
  try {
    const data = await postJson(API.validate, { publicCode });
    const redemption = data.redemption;
    const status = redemption.status;
    if (status === "issued") {
      renderCashierResult("ok", "ΕΓΚΥΡΟ", "Μπορεί να εξαργυρωθεί μία φορά.", redemption);
    } else if (status === "redeemed") {
      renderCashierResult("used", "ΗΔΗ ΕΞΑΡΓΥΡΩΘΗΚΕ", "Μην δώσεις ξανά το reward.", redemption);
    } else {
      renderCashierResult("bad", "ΜΗ ΕΞΑΡΓΥΡΩΣΙΜΟ", "Το reward δεν είναι πλέον ενεργό.", redemption);
    }
    trackDemoEvent("bonusaki_cashier_validate", { publicCode, status });
    return redemption;
  } catch (error) {
    renderCashierResult("bad", "ΑΚΥΡΟ", error?.data?.code || "Ο κωδικός δεν βρέθηκε.");
    trackDemoEvent("bonusaki_cashier_validate_failed", { publicCode, code: error?.data?.code || "unknown" });
    return null;
  }
}

async function redeemCashierCode() {
  const publicCode = normalizePublicCode(document.getElementById("cashier-code")?.value);
  const cashierPin = String(document.getElementById("cashier-pin")?.value || "").trim();
  const cashierId = String(document.getElementById("cashier-id")?.value || "").trim();
  if (!publicCode || !cashierPin) {
    renderCashierResult("warn", "Λείπει κωδικός ή PIN", "Το ταμείο χρειάζεται public code και cashier PIN.");
    return;
  }

  writeStoredCashierPin(cashierPin);
  try {
    const data = await postJson(API.redeem, { publicCode, cashierPin, cashierId: cashierId || "cashier" });
    renderCashierResult("ok", "ΕΞΑΡΓΥΡΩΘΗΚΕ", "Δώσε τώρα το reward στον πελάτη.", data.redemption);
    trackDemoEvent("bonusaki_cashier_redeem", { publicCode, status: "redeemed" });
  } catch (error) {
    const code = error?.data?.code || "unknown";
    const redemption = error?.data?.redemption;
    const title = code === "invalid_cashier_pin"
      ? "ΛΑΘΟΣ PIN"
      : code === "already_redeemed"
        ? "ΗΔΗ ΕΞΑΡΓΥΡΩΘΗΚΕ"
        : code === "cashier_validation_disabled"
          ? "ΤΑΜΕΙΟ ΜΗ ΕΝΕΡΓΟ"
          : "ΔΕΝ ΕΞΑΡΓΥΡΩΘΗΚΕ";
    renderCashierResult(code === "already_redeemed" ? "used" : "bad", title, code, redemption);
    trackDemoEvent("bonusaki_cashier_redeem_failed", { publicCode, code });
  }
}

function renderCashierControls() {
  const container = document.querySelector('[data-panel="cashier"] .mx-auto.max-w-sm');
  if (!container) return;
  const params = getParams();
  const prefill = normalizePublicCode(params.get("code") || appState.currentCode || "");
  container.innerHTML = `
    <div class="text-center">
      <h1 class="font-display text-2xl font-bold">Έλεγχος δώρου</h1>
      <p class="mt-1 text-sm text-ink/70">Validate πρώτα, redeem μόνο όταν δώσεις το reward.</p>
    </div>
    <div id="redeem-result" class="mt-4"></div>
    <form id="cashier-form" class="mt-4 rounded-2xl border-2 border-ink bg-white p-4 shadow-pop">
      <label class="block text-xs font-bold uppercase tracking-wide text-ink/60" for="cashier-code">Reward code</label>
      <input id="cashier-code" value="${escapeHtml(prefill)}" class="mt-1 w-full rounded-xl border-2 border-ink bg-cream px-3 py-2 font-mono text-sm font-bold outline-none" placeholder="BA-XXXXXXXXXX" autocomplete="off" />
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wide text-ink/60" for="cashier-pin">Cashier PIN</label>
          <input id="cashier-pin" type="password" value="${escapeHtml(readStoredCashierPin())}" class="mt-1 w-full rounded-xl border-2 border-ink bg-cream px-3 py-2 text-sm font-bold outline-none" autocomplete="off" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wide text-ink/60" for="cashier-id">Cashier ID</label>
          <input id="cashier-id" value="cashier" class="mt-1 w-full rounded-xl border-2 border-ink bg-cream px-3 py-2 text-sm font-bold outline-none" autocomplete="off" />
        </div>
      </div>
      <div class="mt-4 grid gap-2">
        <button id="validate-reward" type="button" class="rounded-xl border-2 border-ink bg-white px-4 py-2.5 text-sm font-bold shadow-popsm transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">Validate</button>
        <button id="redeem-reward" type="submit" class="rounded-xl border-2 border-ink bg-sun px-4 py-2.5 text-sm font-bold shadow-popsm transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">Redeem reward</button>
      </div>
    </form>
    <p class="mt-3 text-center text-[11px] text-ink/50">Screenshots δεν γίνονται δεκτά χωρίς επιτυχημένο server validation.</p>`;
  document.getElementById("validate-reward").addEventListener("click", validateCashierCode);
  document.getElementById("cashier-form").addEventListener("submit", (event) => {
    event.preventDefault();
    redeemCashierCode();
  });
  if (prefill) validateCashierCode();
}

function openCashierWithCode(code) {
  selectTab("cashier");
  const input = document.getElementById("cashier-code");
  if (input && code) input.value = code;
}

function simulateRedeem(kind) {
  const map = {
    ok: ["ok", "ΕΓΚΥΡΟ", "Η παλιά προσομοίωση αντικαταστάθηκε από live validation."],
    used: ["used", "ΗΔΗ ΕΞΑΡΓΥΡΩΘΗΚΕ", "Χρησιμοποίησε πραγματικό code για έλεγχο."],
    invalid: ["bad", "ΑΚΥΡΟ", "Χρησιμοποίησε πραγματικό code για έλεγχο."],
  };
  const selected = map[kind] || map.invalid;
  renderCashierResult(selected[0], selected[1], selected[2]);
}

trackDemoEvent("bonusaki_demo_loaded");
renderCustomer("form");
renderCashierControls();
renderMerchantDashboard();
loadCampaign();

const initialParams = getParams();
if (initialParams.get("tab") === "cashier" || initialParams.get("cashier") === "1" || initialParams.get("code")) {
  selectTab("cashier");
}
