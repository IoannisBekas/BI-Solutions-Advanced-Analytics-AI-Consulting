import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, CreditCard, LockKeyhole } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { useLocale, useLocalizedHref } from "@/i18n/LocaleProvider";
import { LOCALES, LOCALE_TAGS } from "@/i18n/config";
import { withAssetBase } from "@/lib/site";

const copy = {
  en: {
    title: "Pay by card",
    description: "Enter the amount you agreed with BI Solutions Group.",
    amount: "Amount in EUR",
    range: "Enter an amount from €1 to €1,000.",
    continue: "Continue to card payment",
    loading: "Preparing secure checkout…",
    secure: "Revolut securely collects your card and billing details.",
    change: "Change amount",
    verify: "Check payment status",
    checking: "Checking payment status…",
    waiting: "Your payment is awaiting confirmation. Check the status again shortly.",
    failed: "Payment was not confirmed. You can try again in the checkout below.",
    closed: "This payment attempt has ended.",
    paid: "Payment confirmed.",
    another: "Make another payment",
    hosted: "Open Revolut Checkout",
    widgetUnavailable: "The payment form couldn’t load on this page.",
    unavailable: "Card payment is temporarily unavailable. Please try again later.",
    statusUnavailable: "We couldn’t check the payment status. Check again before retrying your payment.",
    test: "Test mode · no real charge",
    privacy: "Privacy policy",
  },
  el: {
    title: "Πληρωμή με κάρτα",
    description: "Συμπληρώστε το ποσό που συμφωνήσατε με την BI Solutions Group.",
    amount: "Ποσό σε ευρώ",
    range: "Πληκτρολογήστε ποσό από 1 € έως 1.000 €.",
    continue: "Συνέχεια στην πληρωμή",
    loading: "Προετοιμασία ασφαλούς πληρωμής…",
    secure: "Η Revolut συλλέγει με ασφάλεια τα στοιχεία της κάρτας και της χρέωσής σας.",
    change: "Αλλαγή ποσού",
    verify: "Έλεγχος κατάστασης πληρωμής",
    checking: "Έλεγχος της κατάστασης πληρωμής…",
    waiting: "Η πληρωμή αναμένει επιβεβαίωση. Ελέγξτε ξανά σε λίγο.",
    failed: "Η πληρωμή δεν επιβεβαιώθηκε. Μπορείτε να δοκιμάσετε ξανά παρακάτω.",
    closed: "Αυτή η προσπάθεια πληρωμής έχει κλείσει.",
    paid: "Η πληρωμή επιβεβαιώθηκε.",
    another: "Νέα πληρωμή",
    hosted: "Άνοιγμα Revolut Checkout",
    widgetUnavailable: "Η φόρμα πληρωμής δεν φορτώθηκε σε αυτή τη σελίδα.",
    unavailable: "Η πληρωμή με κάρτα είναι προσωρινά μη διαθέσιμη. Δοκιμάστε ξανά αργότερα.",
    statusUnavailable: "Δεν ήταν δυνατός ο έλεγχος της πληρωμής. Ελέγξτε ξανά πριν δοκιμάσετε νέα χρέωση.",
    test: "Δοκιμαστική λειτουργία · χωρίς πραγματική χρέωση",
    privacy: "Πολιτική απορρήτου",
  },
  de: {
    title: "Mit Karte bezahlen",
    description: "Geben Sie den mit BI Solutions Group vereinbarten Betrag ein.",
    amount: "Betrag in EUR",
    range: "Geben Sie einen Betrag zwischen 1 € und 1.000 € ein.",
    continue: "Weiter zur Kartenzahlung",
    loading: "Sichere Kartenzahlung wird vorbereitet…",
    secure: "Revolut erfasst Ihre Karten- und Abrechnungsdaten sicher.",
    change: "Betrag ändern",
    verify: "Zahlungsstatus prüfen",
    checking: "Zahlungsstatus wird geprüft…",
    waiting: "Die Zahlung wartet auf Bestätigung. Prüfen Sie den Status in Kürze erneut.",
    failed: "Die Zahlung wurde nicht bestätigt. Sie können es unten erneut versuchen.",
    closed: "Dieser Zahlungsversuch ist beendet.",
    paid: "Zahlung bestätigt.",
    another: "Weitere Zahlung",
    hosted: "Revolut Checkout öffnen",
    widgetUnavailable: "Das Zahlungsformular konnte auf dieser Seite nicht geladen werden.",
    unavailable: "Die Kartenzahlung ist vorübergehend nicht verfügbar. Versuchen Sie es später erneut.",
    statusUnavailable: "Der Zahlungsstatus konnte nicht geprüft werden. Prüfen Sie ihn erneut, bevor Sie zahlen.",
    test: "Testmodus · keine echte Abbuchung",
    privacy: "Datenschutzerklärung",
  },
};

type EnabledConfig = { enabled: true; publicKey: string; sandbox: boolean };
type Config = EnabledConfig | { enabled: false };
type Attempt = { amount: string; id: string; statusToken?: string; awaitingConfirmation?: boolean };
type Checkout = { token: string; statusToken: string; amountMinor: number; checkoutUrl?: string };
type PaymentResult = { status: "payable" | "processing" | "paid" | "closed"; amountMinor: number };
type Notice = "checking" | "waiting" | "failed" | "closed" | "paid" | "unavailable" | "widgetUnavailable" | "statusUnavailable";

const attemptKey = "bi-direct-payment";

function parseAmount(value: string) {
  const trimmed = value.trim();
  if (!/^\d{1,4}(?:[.,]\d{1,2})?$/.test(trimmed)) return null;
  const amount = Number(trimmed.replace(",", "."));
  return amount >= 1 && amount <= 1000 ? amount.toFixed(2) : null;
}

function saveAttempt(attempt: Attempt | null) {
  try {
    if (attempt) window.sessionStorage.setItem(attemptKey, JSON.stringify(attempt));
    else window.sessionStorage.removeItem(attemptKey);
  } catch {
    // Keep the current in-memory attempt if the browser disallows storage.
  }
}

class PaymentRequestError extends Error {
  constructor(readonly code: string, readonly statusToken?: string) {
    super(code);
  }
}

async function requestPayment<T>(path: "checkout" | "status", payload: object) {
  const response = await fetch("/api/direct-payments/" + path, {
    method: "POST",
    mode: "cors",
    referrerPolicy: "no-referrer",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body) throw new PaymentRequestError(body?.code || "unavailable", body?.statusToken);
  return body as T;
}

export default function DirectPayment() {
  const { locale } = useLocale();
  const localizedHref = useLocalizedHref();
  const t = copy[locale];
  const [config, setConfig] = useState<Config>();
  const [amount, setAmount] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [session, setSession] = useState<Attempt | null>(null);
  const [activeAmount, setActiveAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>();
  const [submitting, setSubmitting] = useState(false);
  const [widgetUnavailable, setWidgetUnavailable] = useState(false);
  const target = useRef<HTMLDivElement>(null);
  const attempt = useRef<Attempt | null>(null);
  const verifying = useRef(false);
  const pendingConfirmation = useRef(false);

  function updateAttempt(next: Attempt | null) {
    attempt.current = next;
    saveAttempt(next);
    setSession(next);
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(attemptKey) || "null");
      if (saved && parseAmount(saved.amount) === saved.amount && typeof saved.id === "string") {
        const restored = {
          amount: saved.amount,
          id: saved.id,
          statusToken: typeof saved.statusToken === "string" ? saved.statusToken : undefined,
          awaitingConfirmation: saved.awaitingConfirmation === true,
        };
        attempt.current = restored;
        pendingConfirmation.current = restored.awaitingConfirmation;
        setSession(restored);
        setAmount(restored.amount);
        if (restored.statusToken) {
          setNotice("waiting");
          void verifyStatus("restore");
        }
      }
    } catch {
      // A malformed browser entry is ignored.
    }

    const controller = new AbortController();
    void fetch("/api/direct-payments/config", { signal: controller.signal })
      .then(async (response) => response.ok ? await response.json() as Config : { enabled: false } as const)
      .then(setConfig)
      .catch(() => {
        if (!controller.signal.aborted) setConfig({ enabled: false });
      });
    function verifyAfterReturn(event: PageTransitionEvent) {
      if (event.persisted && attempt.current?.statusToken) {
        setSubmitting(false);
        void verifyStatus("restore");
      }
    }
    window.addEventListener("pageshow", verifyAfterReturn);
    return () => {
      controller.abort();
      window.removeEventListener("pageshow", verifyAfterReturn);
    };
  }, []);

  async function verifyStatus(reason: "success" | "failed" | "restore") {
    const current = attempt.current;
    if (!current?.statusToken) return;
    if (reason === "success") {
      pendingConfirmation.current = true;
      updateAttempt({ ...current, awaitingConfirmation: true });
    }
    if (verifying.current) return;
    verifying.current = true;
    setNotice("checking");
    try {
      const result = await requestPayment<PaymentResult>("status", { token: current.statusToken });
      if (attempt.current?.id !== current.id) return;
      if (result.amountMinor !== Math.round(Number(current.amount) * 100)) throw new Error("amount");
      switch (result.status) {
        case "paid":
        case "closed":
          pendingConfirmation.current = false;
          setNotice(result.status);
          setActiveAmount(null);
          break;
        case "processing":
          pendingConfirmation.current = true;
          updateAttempt({ ...current, awaitingConfirmation: true });
          setNotice("waiting");
          setActiveAmount(null);
          break;
        case "payable":
          setNotice(pendingConfirmation.current ? "waiting" : reason === "failed" ? "failed" : undefined);
          if (pendingConfirmation.current) setActiveAmount(null);
          break;
        default:
          throw new Error("Unexpected payment status");
      }
    } catch (error) {
      if (attempt.current?.id === current.id) {
        setNotice(error instanceof PaymentRequestError && error.code === "invalid" && !pendingConfirmation.current ? "closed" : "statusUnavailable");
        setActiveAmount(null);
      }
    } finally {
      verifying.current = false;
    }
  }

  async function checkoutOrder(current: Attempt) {
    const order = await requestPayment<Checkout>("checkout", { amount: current.amount, attemptId: current.id });
    if (attempt.current?.id !== current.id || order.amountMinor !== Math.round(Number(current.amount) * 100)) {
      throw new PaymentRequestError("unavailable");
    }
    updateAttempt({ ...current, statusToken: order.statusToken });
    return order;
  }

  function checkoutRequestFailed(error: unknown) {
    if (error instanceof PaymentRequestError && error.code === "closed") {
      if (error.statusToken && attempt.current) {
        updateAttempt({ ...attempt.current, statusToken: error.statusToken });
        void verifyStatus("restore");
      } else {
        setNotice("closed");
        setActiveAmount(null);
      }
    } else {
      setNotice("unavailable");
    }
  }

  useEffect(() => {
    if (!config?.enabled || !activeAmount || !target.current) return;
    let dispose = false;
    let widget: { destroy: () => void } | undefined;
    const host = target.current;
    const publicToken = config.publicKey;
    const mode = config.sandbox ? "sandbox" : "prod";

    async function mountCheckout() {
      try {
        const { default: RevolutCheckout } = await import("@revolut/checkout");
        if (dispose) return;
        widget = await RevolutCheckout.embeddedCheckout({
          publicToken,
          mode,
          locale,
          target: host,
          async createOrder() {
            const current = attempt.current;
            if (!current || current.amount !== activeAmount || dispose) throw new Error("unavailable");
            setSubmitting(true);
            try {
              const order = await checkoutOrder(current);
              if (dispose) throw new Error("unavailable");
              return { publicId: order.token };
            } catch (error) {
              if (!dispose) {
                setSubmitting(false);
                checkoutRequestFailed(error);
              }
              throw error;
            }
          },
          onSuccess() {
            if (!dispose) {
              setSubmitting(false);
              void verifyStatus("success");
            }
          },
          onError({ orderId }) {
            if (!dispose) {
              setSubmitting(false);
              if (orderId && attempt.current?.statusToken) void verifyStatus("failed");
            }
          },
          onCancel() {
            if (!dispose) {
              setSubmitting(false);
              if (attempt.current?.statusToken) void verifyStatus("failed");
            }
          },
        });
        if (dispose) widget.destroy();
        else setLoading(false);
      } catch {
        if (!dispose) {
          setLoading(false);
          setWidgetUnavailable(true);
          setNotice("widgetUnavailable");
        }
      }
    }

    void mountCheckout();
    return () => {
      dispose = true;
      widget?.destroy();
    };
  }, [activeAmount, config, locale]);

  function startCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!config?.enabled) return;
    const normalized = parseAmount(amount);
    setInvalid(!normalized);
    if (!normalized) return;
    if (attempt.current?.amount !== normalized) updateAttempt({ amount: normalized, id: window.crypto.randomUUID() });
    setNotice(undefined);
    setWidgetUnavailable(false);
    setLoading(true);
    setActiveAmount(normalized);
  }

  function editAmount() {
    setActiveAmount(null);
    setLoading(false);
    setWidgetUnavailable(false);
    setNotice(undefined);
  }

  function startNewPayment() {
    pendingConfirmation.current = false;
    updateAttempt(null);
    setAmount("");
    editAmount();
  }

  async function openHostedCheckout() {
    const current = attempt.current;
    if (!current || submitting) return;
    setSubmitting(true);
    try {
      const order = await checkoutOrder(current);
      if (!order.checkoutUrl) throw new PaymentRequestError("unavailable");
      const link = document.createElement("a");
      link.href = order.checkoutUrl;
      link.rel = "noreferrer";
      link.click();
    } catch (error) {
      setSubmitting(false);
      checkoutRequestFailed(error);
    }
  }

  const amountInCheckout = activeAmount || (session?.statusToken ? session.amount : null);
  const formattedAmount = amountInCheckout && new Intl.NumberFormat(LOCALE_TAGS[locale], { style: "currency", currency: "EUR" }).format(Number(amountInCheckout));
  const final = notice === "paid" || notice === "closed";
  const verificationNeeded = notice === "waiting" || notice === "checking" || notice === "statusUnavailable";
  const showAmountForm = !activeAmount && !final && !verificationNeeded;
  const feedback = notice ? t[notice] : !config ? t.loading : !config.enabled ? t.unavailable : null;

  return (
    <main id="main-content" className="min-h-dvh bg-gray-50 px-4 py-8 sm:px-6 sm:py-14">
      <Seo title={t.title} description={t.description} path="/pay" robots="noindex,follow" translatedLocales={LOCALES} />
      <div className="mx-auto w-full min-w-0 max-w-xl">
        <a href={localizedHref("/")} className="mb-4 inline-flex min-h-11 items-center gap-3 rounded-lg px-1 text-sm font-semibold tracking-tight text-gray-950 hover:text-blue-800">
          <img src={withAssetBase("assets/brand/bi-solutions-group-mark.png")} alt="" width={28} height={28} />
          BI Solutions Group
        </a>
        <section aria-labelledby="direct-payment-title" className="min-w-0 rounded-[2rem] border border-gray-200 bg-white p-4 shadow-xl shadow-gray-950/[0.05] sm:p-8">
          <h1 id="direct-payment-title" className="text-balance font-heading text-[clamp(1.55rem,7.7vw,1.875rem)] font-bold tracking-tight text-gray-950 sm:text-4xl">{t.title}</h1>
          {showAmountForm && <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">{t.description}</p>}
          {config?.enabled && config.sandbox && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">{t.test}</p>}

          {showAmountForm && config?.enabled && (
            <form className="mt-6" onSubmit={startCheckout}>
              <label htmlFor="payment-amount" className="text-sm font-semibold text-gray-950">{t.amount}</label>
              <div className="relative mt-2">
                <input
                  id="payment-amount"
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={amount}
                  onChange={(event) => { setAmount(event.target.value); setInvalid(false); }}
                  maxLength={8}
                  required
                  aria-invalid={invalid}
                  aria-describedby="payment-amount-hint"
                  className="min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 pr-10 text-base text-gray-950 outline-none focus-visible:border-gray-950 focus-visible:ring-2 focus-visible:ring-gray-300"
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-gray-500" aria-hidden="true">€</span>
              </div>
              <p id="payment-amount-hint" className={invalid ? "mt-2 text-sm text-red-700" : "mt-2 text-sm text-gray-600"} role={invalid ? "alert" : undefined}>{t.range}</p>
              <Button type="submit" className="mt-5 min-h-12 w-full rounded-xl text-base">
                {t.continue}
                <ArrowRight aria-hidden="true" />
              </Button>
            </form>
          )}

          {!showAmountForm && formattedAmount && (
            <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 font-heading text-2xl font-bold text-gray-950 tabular-nums">{formattedAmount}</p>
          )}
          <div role="status" aria-live="polite">
            {feedback && <p className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm leading-relaxed ${notice === "paid" ? "border-emerald-100 bg-emerald-50 text-emerald-900" : "border-gray-200 bg-gray-50 text-gray-800"}`}>
              {notice === "paid" && <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
              {feedback}
            </p>}
          </div>
          {activeAmount && (
            <div className="mt-4 min-w-0">
              {loading && <p role="status" className="py-3 text-sm text-gray-600">{t.loading}</p>}
              <div ref={target} translate="no" className="min-w-0 [&>iframe]:min-w-0!" />
              {widgetUnavailable && (
                <Button type="button" className="min-h-12 w-full rounded-xl text-base" disabled={submitting} onClick={() => void openHostedCheckout()}>
                  {t.hosted}
                  <ArrowRight aria-hidden="true" />
                </Button>
              )}
              <p className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {t.secure}
              </p>
              <Button type="button" variant="outline" className="mt-4 min-h-11 rounded-xl" disabled={submitting || verificationNeeded} onClick={editAmount}>{t.change}</Button>
            </div>
          )}
          {verificationNeeded && <Button type="button" variant="outline" className="mt-4 min-h-11 rounded-xl" disabled={notice === "checking"} onClick={() => void verifyStatus("restore")}>{t.verify}</Button>}
          {final && <Button type="button" variant="outline" className="mt-4 min-h-11 rounded-xl" onClick={startNewPayment}><CreditCard aria-hidden="true" />{t.another}</Button>}
        </section>
        <a href={localizedHref("/privacy-policy")} className="mt-2 inline-flex min-h-11 items-center rounded-sm text-sm text-gray-600 underline underline-offset-4 hover:text-gray-950">{t.privacy}</a>
      </div>
    </main>
  );
}
