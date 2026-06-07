import "./styles.css";

const QR_URL = new URL("../qr.svg", import.meta.url).href;
const EVENT_ENDPOINT = "/api/bonusaki/events";
const SESSION_KEY = "bonusaki_demo_session";

function getAttribution(){
  const params = new URLSearchParams(window.location.search);
  return {
    merchant: (params.get("merchant") || "").slice(0, 80),
    campaign: (params.get("campaign") || "").slice(0, 80),
    qr: (params.get("qr") || "").slice(0, 80),
  };
}

function getSessionId(){
  try{
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if(!sessionId){
      sessionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }catch(e){
    return "";
  }
}

function trackDemoEvent(eventName, metadata = {}){
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

  try{
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload.metadata, product: "bonusaki" });
  }catch(e){}

  try{
    const body = JSON.stringify(payload);
    if(navigator.sendBeacon){
      navigator.sendBeacon(EVENT_ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(EVENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }catch(e){}
}

trackDemoEvent("bonusaki_demo_loaded");

// ---------- tab switching ----------
const tabs = document.getElementById('tabs');
tabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.tabbtn'); if(!btn) return;
  const tab = btn.dataset.tab;
  trackDemoEvent("bonusaki_demo_tab", { tab });
  [...tabs.children].forEach(b => b.setAttribute('aria-selected', b===btn));
  document.querySelectorAll('[data-panel]').forEach(p => p.hidden = (p.dataset.panel !== tab));
  if(tab==='customer') renderCustomer('form');
});

// ---------- shared bits ----------
const star = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#FBD03B" stroke="#1b1b1b" stroke-width="2.2" stroke-linejoin="round"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>';
const STARS = `<div class="flex justify-center gap-0.5">${star}${star}${star}</div>`;
function randCode(){ const a='0123456789ABCDEFGHJKMNPQRSTVWXYZ'; let s=''; for(let i=0;i<10;i++) s+=a[Math.floor(Math.random()*a.length)]; return s; }

// ---------- customer flow ----------
const PRIZES = [
  { emoji:'🍔', label:'Burger',     reward:'Δωρεάν Burger',     weight:25 },
  { emoji:'🍟', label:'Πατάτες',    reward:'Δωρεάν πατάτες',    weight:20 },
  { emoji:'🍕', label:'Pizza',      reward:'Κομμάτι Pizza',     weight:15 },
  { emoji:'🍰', label:'Επιδόρπιο',  reward:'Δωρεάν επιδόρπιο',  weight:15 },
  { emoji:'🥤', label:'Αναψυκτικό', reward:'Δωρεάν αναψυκτικό', weight:15 },
  { emoji:'☕', label:'Καφές',      reward:'Δωρεάν καφές',      weight:10 },
];
function pickPrize(){
  const total = PRIZES.reduce((s,p)=>s+p.weight,0);
  let r = Math.random()*total;
  for(const p of PRIZES){ if(r < p.weight) return p; r -= p.weight; }
  return PRIZES[PRIZES.length-1];
}
let currentPrize = null;
let currentCode = null;
const screen = document.getElementById('screen');

function renderCustomer(state, celebrate=true){
  if(state==='form'){
    currentCode = null;
    screen.innerHTML = `
      <div class="flex h-full flex-col px-5 pt-7 text-ink">
        <div class="text-center">
          ${STARS}
          <div class="mt-1 font-display text-2xl font-bold">Σκάναρε &amp; κέρδισε</div>
          <p class="mt-1 text-sm text-ink/70">Δώρα για φαγητό και ροφήματα</p>
        </div>
        <div class="scanframe relative mx-auto mt-5 grid aspect-square w-44 place-items-center rounded-3xl border-2 border-ink bg-sky shadow-pop">
          <span class="cnr tl"></span><span class="cnr tr"></span><span class="cnr bl"></span><span class="cnr br"></span>
          <div class="flex items-end gap-1">
            <span class="text-5xl">☕</span>
            <div class="relative"><span class="text-6xl">🥡</span>
              <img src="${QR_URL}" class="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded bg-white p-0.5" />
            </div>
          </div>
        </div>
        <div class="mt-auto pb-7 pt-5">
          <div class="flex items-center gap-2 rounded-2xl border-2 border-ink bg-white px-3 py-2.5 shadow-popsm">
            <span>✉️</span>
            <input id="email" type="email" placeholder="Το email σου" class="w-full bg-transparent text-sm outline-none placeholder:text-ink/40" />
          </div>
          <button id="play" class="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-sun px-4 py-3 font-display text-lg font-bold shadow-pop transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">Συνέχεια →</button>
        </div>
      </div>`;
    document.getElementById('play').addEventListener('click', () => {
      trackDemoEvent("bonusaki_demo_play_start", { method: "button" });
      currentPrize = pickPrize();
      renderCustomer('scratch');
    });
    document.getElementById('email').addEventListener('keydown', e => { if(e.key==='Enter'){ trackDemoEvent("bonusaki_demo_play_start", { method: "enter" }); currentPrize=pickPrize(); renderCustomer('scratch'); }});
  }

  if(state==='scratch'){
    trackDemoEvent("bonusaki_demo_scratch_view");
    screen.innerHTML = `
      <div class="flex h-full flex-col items-center justify-center px-6 text-ink">
        <div class="mb-3 font-display text-base font-bold">Ξύσε για να αποκαλύψεις!</div>
        <div class="relative h-44 w-full overflow-hidden rounded-2xl border-2 border-ink shadow-pop">
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-sun to-sky text-ink">
            <div class="text-4xl">${currentPrize.emoji}</div>
            <div class="px-4 text-center font-display text-xl font-bold">${currentPrize.reward}</div>
          </div>
          <canvas id="scratch" class="absolute inset-0 h-full w-full"></canvas>
        </div>
        <button id="reveal" class="mt-4 text-xs font-semibold underline">αποκάλυψη αμέσως</button>
      </div>`;
    requestAnimationFrame(() => initScratch(document.getElementById('scratch'), () => {
      trackDemoEvent("bonusaki_demo_scratch_completed");
      renderCustomer('done');
    }));
    document.getElementById('reveal').addEventListener('click', () => {
      trackDemoEvent("bonusaki_demo_reveal_now");
      renderCustomer('done');
    });
  }

  if(state==='done'){
    if(currentCode === null) currentCode = randCode();
    trackDemoEvent("bonusaki_demo_reward_view", { reward: currentPrize ? currentPrize.label : "unknown" });
    screen.innerHTML = `
      <div class="flex h-full flex-col items-center justify-center px-5 text-ink">
        <div class="pop w-full rounded-3xl border-2 border-ink bg-white p-6 text-center shadow-pop">
          ${STARS}
          <div class="mt-2 text-xs font-bold uppercase tracking-wide text-ink/50">Κέρδισες</div>
          <div class="mt-1 text-4xl">${currentPrize.emoji}</div>
          <div class="mt-1 font-display text-2xl font-bold">${currentPrize.reward}</div>
          <div class="mt-4 rounded-xl border-2 border-ink bg-cream px-3 py-2 font-mono text-sm tracking-wider">SD-${currentCode}</div>
          <div class="mt-4 text-xs font-semibold text-ink/60">Πρόσθεσε στο πορτοφόλι σου:</div>
          <div class="mt-2 grid gap-2">
            <button data-wallet-provider="apple" class="rounded-2xl border-2 border-ink bg-ink px-4 py-2.5 text-sm font-bold text-white shadow-popsm transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"> Apple Wallet</button>
            <button data-wallet-provider="google" class="rounded-2xl border-2 border-ink bg-white px-4 py-2.5 text-sm font-bold shadow-popsm transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">Google Wallet</button>
          </div>
        </div>
        <button id="again" class="mt-4 text-xs font-semibold underline">παίξε ξανά</button>
      </div>`;
    screen.querySelectorAll('[data-wallet-provider]').forEach(button => {
      button.addEventListener('click', () => addToWallet(button.dataset.walletProvider));
    });
    document.getElementById('again').addEventListener('click', () => renderCustomer('form'));
    if(celebrate) confettiBurst();
  }
}

// ---------- wallet pass (mock of the added Apple/Google Wallet pass) ----------
function barcodeBars(seed){
  let h = 0; for(const ch of String(seed)) h = (h*31 + ch.charCodeAt(0)) >>> 0;
  let out = '';
  for(let i=0;i<48;i++){
    h = (h*1103515245 + 12345) >>> 0;
    const w = 2 + ((h >> 28) & 3);
    const on = (h >> 23) & 1;
    out += `<div style="width:${w}px;background:${on ? '#111' : '#fff'}"></div>`;
  }
  return out;
}
function addToWallet(provider){
  const apple = provider === 'apple';
  trackDemoEvent("bonusaki_demo_wallet_preview", { provider: apple ? "apple" : "google" });
  if(currentCode === null) currentCode = randCode();
  const code = 'SD-' + currentCode;
  const reward = currentPrize ? currentPrize.reward : 'Δωρεάν καφές';
  const emoji = currentPrize ? currentPrize.emoji : '☕';
  const exp = new Date(Date.now() + 30*24*60*60*1000)
    .toLocaleDateString('el-GR', { day:'numeric', month:'short', year:'numeric' });
  screen.innerHTML = `
    <div class="flex h-full flex-col px-4 pt-5 text-ink">
      <div class="mb-3 flex items-center justify-between text-xs">
        <button data-return-reward class="font-semibold opacity-80 active:scale-95">‹ Πίσω</button>
        <span class="rounded-full border-2 border-ink bg-white px-2.5 py-0.5 font-semibold">${apple ? 'Apple Wallet' : 'Google Wallet'}</span>
      </div>
      <div class="pop overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-pop">
        <div class="flex items-center gap-2 border-b-2 border-ink bg-sun/50 px-4 py-3">
          <div class="grid h-7 w-7 place-items-center rounded-lg border-2 border-ink bg-sun text-sm font-bold">B</div>
          <div class="font-display text-sm font-bold">Καφέ Γωνία</div>
        </div>
        <div class="px-4 pb-3 pt-4">
          <div class="text-[11px] uppercase tracking-wide text-ink/50">Ανταμοιβή</div>
          <div class="font-display text-xl font-bold">${emoji} ${reward}</div>
          <div class="mt-3 flex justify-between">
            <div><div class="text-[11px] uppercase tracking-wide text-ink/50">Λήγει</div><div class="text-sm font-semibold">${exp}</div></div>
            <div class="text-right"><div class="text-[11px] uppercase tracking-wide text-ink/50">Κατάσταση</div><div class="text-sm font-bold text-green-600">Έγκυρο</div></div>
          </div>
        </div>
        <div class="border-t-2 border-dashed border-ink px-4 py-4">
          <div class="flex h-14 items-stretch justify-center overflow-hidden">${barcodeBars(code)}</div>
          <div class="mt-2 text-center font-mono text-xs tracking-[0.3em] text-ink/60">${code}</div>
        </div>
      </div>
      <div class="pop mt-4 flex items-center gap-2 rounded-2xl border-2 border-ink bg-green-300 px-4 py-3 text-sm font-semibold shadow-popsm">
        <span class="text-lg leading-none">✓</span> Προστέθηκε στο ${apple ? 'Apple' : 'Google'} Wallet — δείξ’ το στο ταμείο.
      </div>
      <button data-play-again class="mx-auto mt-4 text-xs font-semibold underline">παίξε ξανά</button>
    </div>`;
  screen.querySelector('[data-return-reward]').addEventListener('click', () => renderCustomer('done', false));
  screen.querySelector('[data-play-again]').addEventListener('click', () => renderCustomer('form'));
}

// ---------- scratch canvas ----------
function initScratch(canvas, onReveal){
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width*dpr; canvas.height = rect.height*dpr;
  ctx.scale(dpr,dpr);
  ctx.fillStyle = '#c9a227'; ctx.fillRect(0,0,rect.width,rect.height);
  ctx.fillStyle = '#7a6210'; ctx.font = 'bold 16px Fredoka, system-ui, sans-serif'; ctx.textAlign='center';
  ctx.fillText('✦ ξύσε εδώ ✦', rect.width/2, rect.height/2);
  ctx.globalCompositeOperation = 'destination-out';
  let drawing=false, revealed=false;
  function scratch(cx,cy){
    if(revealed) return;
    const r = canvas.getBoundingClientRect();
    ctx.beginPath(); ctx.arc(cx-r.left, cy-r.top, 22, 0, Math.PI*2); ctx.fill();
    if(cleared(ctx, r.width, r.height) > 0.5){ revealed=true; onReveal(); }
  }
  canvas.addEventListener('pointerdown', e => { drawing=true; scratch(e.clientX,e.clientY); });
  canvas.addEventListener('pointermove', e => { if(drawing) scratch(e.clientX,e.clientY); });
  canvas.addEventListener('pointerup', () => drawing=false);
  canvas.addEventListener('pointerleave', () => drawing=false);
}
function cleared(ctx,w,h){
  const step=12; let c=0,t=0;
  try{
    const d = ctx.getImageData(0,0,Math.max(1,w),Math.max(1,h)).data;
    for(let y=0;y<h;y+=step){ for(let x=0;x<w;x+=step){
      const a = d[(Math.floor(y)*Math.floor(w)+Math.floor(x))*4+3];
      if(a===0) c++; t++;
    }}
  }catch(e){ return 0; }
  return t? c/t : 0;
}

// ---------- confetti ----------
function confettiBurst(){
  const c = document.getElementById('confetti'); const ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const colors = ['#FBD03B','#9FD8F5','#34d399','#60a5fa','#f87171','#fb923c'];
  const parts = [];
  for(let i=0;i<110;i++){
    parts.push({ x: innerWidth*(.35+Math.random()*.3), y: innerHeight*0.3,
      vx:(Math.random()-.5)*9, vy:Math.random()*-9-3, g:0.28,
      col:colors[i%colors.length], size:4+Math.random()*5, rot:Math.random()*6, vr:(Math.random()-.5)*.35 });
  }
  let t=0;
  (function frame(){
    t++; ctx.clearRect(0,0,c.width,c.height);
    parts.forEach(p=>{ p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.col;
      ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.6); ctx.restore(); });
    if(t<110) requestAnimationFrame(frame); else ctx.clearRect(0,0,c.width,c.height);
  })();
}

// ---------- merchant dashboard ----------
(function(){
  const bars = document.getElementById('scanbars');
  const heights = [30,42,38,55,60,48,70,65,80,72,90,77,95,88];
  bars.innerHTML = heights.map(h => `<div class="flex-1 rounded-t border-2 border-ink bg-sky" style="height:${h}%"></div>`).join('');

  const distEl = document.getElementById('dist');
  const totalScans = 1300;
  const maxW = Math.max(...PRIZES.map(p=>p.weight));
  distEl.innerHTML = PRIZES.map(p => {
    const issued = Math.round(totalScans*p.weight/100);
    const redeemed = Math.round(issued*0.48);
    return `<div>
      <div class="flex justify-between text-xs"><span class="font-semibold">${p.emoji} ${p.label}</span><span class="text-ink/60">${issued} δόθηκαν · ${redeemed} εξαργ.</span></div>
      <div class="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-ink bg-white"><div class="h-full bg-sun" style="width:${Math.round(p.weight/maxW*100)}%"></div></div>
    </div>`;
  }).join('');

  const tiers = PRIZES.map(p => ({ emoji:p.emoji, label:p.label, pct:p.weight }));
  const tiersEl = document.getElementById('tiers');
  function renderTiers(){
    tiersEl.innerHTML = tiers.map((t,i) => `
      <div class="flex items-center gap-2 rounded-xl border-2 border-ink bg-cream px-3 py-2">
        <span class="text-xl">${t.emoji}</span>
        <span class="flex-1 truncate text-sm font-semibold">${t.label}</span>
        <input type="number" data-w="${i}" value="${t.pct}" class="w-14 rounded-lg border-2 border-ink bg-white px-2 py-1 text-right text-sm font-bold outline-none">
        <span class="text-xs text-ink/50">%</span>
      </div>`).join('');
    tiersEl.querySelectorAll('[data-w]').forEach(inp => inp.oninput = () => { tiers[+inp.dataset.w].pct = +inp.value||0; meter(); });
    meter();
  }
  function meter(){
    const sum = tiers.reduce((s,t)=>s+(+t.pct||0),0);
    const ok = sum===100;
    document.getElementById('weightmeter').innerHTML = `
      <span class="${ok?'text-green-700':'text-amber-700'}">Σύνολο ${sum}%</span>
      <div class="h-2 w-20 overflow-hidden rounded-full border-2 border-ink bg-white"><div class="h-full ${ok?'bg-green-400':'bg-amber-400'} transition-all" style="width:${Math.min(100,sum)}%"></div></div>
      <span class="${ok?'text-green-700':'text-amber-700'}">${ok?'✓':(sum<100?'κάτω':'πάνω')}</span>`;
  }
  renderTiers();
})();

// ---------- cashier ----------
function simulateRedeem(kind){
  trackDemoEvent("bonusaki_demo_cashier_simulation", { result: kind });
  const el = document.getElementById('redeem-result');
  const map = {
    ok:     { bg:'bg-green-300',   icon:'✅', big:'ΕΓΚΥΡΟ',             sub:'Δωρεάν Burger 🍔 · SD-'+randCode() },
    used:   { bg:'bg-neutral-200', icon:'🚫', big:'ΧΡΗΣΙΜΟΠΟΙΗΘΗΚΕ',   sub:'Δωρεάν καφές ☕ · πριν 12 λεπτά' },
    invalid:{ bg:'bg-red-300',     icon:'⛔', big:'ΑΚΥΡΟ / ΠΛΑΣΤΟ',     sub:'Ο κωδικός δεν αντιστοιχεί σε έγκυρο pass' },
  };
  const m = map[kind];
  el.innerHTML = `<div class="pop rounded-2xl border-2 border-ink ${m.bg} p-5 text-center shadow-pop">
    <div class="text-4xl">${m.icon}</div>
    <div class="mt-1 font-display text-2xl font-bold">${m.big}</div>
    <div class="mt-1 text-sm font-semibold text-ink/80">${m.sub}</div>
  </div>`;
}

document.querySelectorAll('[data-redeem-kind]').forEach(button => {
  button.addEventListener('click', () => simulateRedeem(button.dataset.redeemKind));
});

renderCustomer('form');
