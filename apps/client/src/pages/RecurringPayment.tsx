import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOCALE_TAGS } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";

const copy = {
  en: {
    test: "Test mode · no real charges",
    description: "Set up the same card payment every month until you cancel.",
    amount: "Monthly amount in EUR",
    range: "Enter an amount from €1 to €1,000.",
    email: "Email address",
    consent: (amount: string) => `I agree to pay ${amount} now and authorise BI Solutions Group to charge the same card ${amount} each month until I cancel.`,
    continue: "Continue to Revolut",
    resume: "Continue setup",
    loading: "Opening secure Revolut checkout…",
    secure: "Revolut collects your card and billing details securely.",
    cadence: (amount: string) => `${amount} every month`,
    checking: "Checking monthly payment status…",
    verify: "Check status",
    pending: "Your monthly payment is awaiting confirmation.",
    active: "Your monthly payment is active.",
    overdue: "A monthly payment is overdue.",
    paused: "Monthly payments are paused.",
    cancelled: "Future monthly charges have been cancelled.",
    finished: "The monthly payment has ended.",
    failed: "Checkout was not completed. You can try again.",
    unavailable: "We couldn’t complete the request. Please try again.",
    invalid: "This management link is invalid or no longer available.",
    closed: "This setup is closed. Check its status before starting again.",
    preparing: "Revolut is preparing this setup. Continue again in a moment.",
    cancel: "Cancel monthly payments",
    cancelPrompt: "Cancel future monthly charges?",
    cancelConfirm: "Confirm cancellation",
    back: "Keep monthly payments",
    manage: "Copy management link",
    copied: "Management link copied.",
    keepLink: "Save this private link to check or cancel your monthly payment from another device.",
    another: "Set up a new monthly payment",
    hosted: "Open Revolut Checkout",
  },
  el: {
    test: "Δοκιμαστική λειτουργία · χωρίς πραγματικές χρεώσεις",
    description: "Ρυθμίστε την ίδια πληρωμή με κάρτα κάθε μήνα μέχρι να την ακυρώσετε.",
    amount: "Μηνιαίο ποσό σε ευρώ",
    range: "Πληκτρολογήστε ποσό από 1 € έως 1.000 €.",
    email: "Διεύθυνση email",
    consent: (amount: string) => `Συμφωνώ να πληρώσω ${amount} τώρα και εξουσιοδοτώ την BI Solutions Group να χρεώνει την ίδια κάρτα με ${amount} κάθε μήνα μέχρι να ακυρώσω.`,
    continue: "Συνέχεια στη Revolut",
    resume: "Συνέχεια ρύθμισης",
    loading: "Άνοιγμα ασφαλούς πληρωμής Revolut…",
    secure: "Η Revolut συλλέγει με ασφάλεια τα στοιχεία κάρτας και χρέωσης.",
    cadence: (amount: string) => `${amount} κάθε μήνα`,
    checking: "Έλεγχος κατάστασης μηνιαίας πληρωμής…",
    verify: "Έλεγχος κατάστασης",
    pending: "Η μηνιαία πληρωμή σας αναμένει επιβεβαίωση.",
    active: "Η μηνιαία πληρωμή σας είναι ενεργή.",
    overdue: "Μια μηνιαία πληρωμή είναι εκπρόθεσμη.",
    paused: "Οι μηνιαίες πληρωμές έχουν τεθεί σε παύση.",
    cancelled: "Οι επόμενες μηνιαίες χρεώσεις ακυρώθηκαν.",
    finished: "Η μηνιαία πληρωμή έχει λήξει.",
    failed: "Η πληρωμή δεν ολοκληρώθηκε. Μπορείτε να δοκιμάσετε ξανά.",
    unavailable: "Το αίτημα δεν ολοκληρώθηκε. Δοκιμάστε ξανά.",
    invalid: "Ο σύνδεσμος διαχείρισης δεν είναι έγκυρος ή δεν είναι πλέον διαθέσιμος.",
    closed: "Αυτή η ρύθμιση έχει κλείσει. Ελέγξτε την κατάστασή της πριν ξεκινήσετε ξανά.",
    preparing: "Η Revolut ετοιμάζει τη ρύθμιση. Δοκιμάστε να συνεχίσετε σε λίγο.",
    cancel: "Ακύρωση μηνιαίων πληρωμών",
    cancelPrompt: "Να ακυρωθούν οι επόμενες μηνιαίες χρεώσεις;",
    cancelConfirm: "Επιβεβαίωση ακύρωσης",
    back: "Διατήρηση μηνιαίων πληρωμών",
    manage: "Αντιγραφή συνδέσμου διαχείρισης",
    copied: "Ο σύνδεσμος διαχείρισης αντιγράφηκε.",
    keepLink: "Κρατήστε αυτόν τον ιδιωτικό σύνδεσμο για έλεγχο ή ακύρωση από άλλη συσκευή.",
    another: "Νέα μηνιαία πληρωμή",
    hosted: "Άνοιγμα Revolut Checkout",
  },
  de: {
    test: "Testmodus · keine echten Abbuchungen",
    description: "Richten Sie bis zur Kündigung jeden Monat dieselbe Kartenzahlung ein.",
    amount: "Monatsbetrag in EUR",
    range: "Geben Sie einen Betrag zwischen 1 € und 1.000 € ein.",
    email: "E-Mail-Adresse",
    consent: (amount: string) => `Ich stimme zu, jetzt ${amount} zu zahlen, und ermächtige BI Solutions Group, bis zur Kündigung jeden Monat ${amount} von derselben Karte abzubuchen.`,
    continue: "Weiter zu Revolut",
    resume: "Einrichtung fortsetzen",
    loading: "Sicherer Revolut Checkout wird geöffnet…",
    secure: "Revolut erfasst Ihre Karten- und Abrechnungsdaten sicher.",
    cadence: (amount: string) => `${amount} pro Monat`,
    checking: "Status der monatlichen Zahlung wird geprüft…",
    verify: "Status prüfen",
    pending: "Ihre monatliche Zahlung wartet auf Bestätigung.",
    active: "Ihre monatliche Zahlung ist aktiv.",
    overdue: "Eine monatliche Zahlung ist überfällig.",
    paused: "Die monatlichen Zahlungen sind pausiert.",
    cancelled: "Künftige monatliche Abbuchungen wurden storniert.",
    finished: "Die monatliche Zahlung ist beendet.",
    failed: "Die Zahlung wurde nicht abgeschlossen. Sie können es erneut versuchen.",
    unavailable: "Die Anfrage konnte nicht abgeschlossen werden. Versuchen Sie es erneut.",
    invalid: "Dieser Verwaltungslink ist ungültig oder nicht mehr verfügbar.",
    closed: "Diese Einrichtung ist geschlossen. Prüfen Sie den Status, bevor Sie erneut beginnen.",
    preparing: "Revolut bereitet die Einrichtung vor. Setzen Sie sie gleich erneut fort.",
    cancel: "Monatliche Zahlungen kündigen",
    cancelPrompt: "Künftige monatliche Abbuchungen stornieren?",
    cancelConfirm: "Kündigung bestätigen",
    back: "Monatliche Zahlungen beibehalten",
    manage: "Verwaltungslink kopieren",
    copied: "Verwaltungslink kopiert.",
    keepLink: "Speichern Sie diesen privaten Link, um Ihre monatliche Zahlung auf einem anderen Gerät zu prüfen oder zu kündigen.",
    another: "Neue monatliche Zahlung einrichten",
    hosted: "Revolut Checkout öffnen",
  },
};

type Status = "pending" | "active" | "overdue" | "paused" | "cancelled" | "finished";
type Result = { status: Status; amountMinor: number };
type Checkout = { token?: string; checkoutUrl?: string; statusToken: string; amountMinor: number; sandbox: boolean };
type Attempt = { amount: string; email: string; id: string };
type Management = { token: string; awaitingConfirmation: boolean };
type Notice = "checking" | "failed" | "unavailable" | "invalid" | "closed" | "preparing" | "copied";
type Props = {
  normalizeAmount: (value: string) => string | null;
  storageKey: string;
  linkPrefix: string;
  sandbox: boolean;
  onBusyChange: (busy: boolean) => void;
};

const managementTokenPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}\.[\w-]{43}$/i;
const inputStyle = "mt-2 min-h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-950 outline-none focus-visible:border-gray-950 focus-visible:ring-2 focus-visible:ring-gray-300";
const validStatuses = new Set<Status>(["pending", "active", "overdue", "paused", "cancelled", "finished"]);

class RecurringRequestError extends Error {
  constructor(readonly code: string, readonly statusToken?: string) {
    super(code);
  }
}

async function requestRecurring<T>(path: "checkout" | "status" | "cancel", payload: object): Promise<T> {
  const response = await fetch(`/api/recurring-payments/${path}`, {
    method: "POST",
    mode: "cors",
    referrerPolicy: "no-referrer",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body) throw new RecurringRequestError(body?.code ?? "unavailable", body?.statusToken);
  return body as T;
}

export default function RecurringPayment({ normalizeAmount, storageKey, linkPrefix, sandbox, onBusyChange }: Props) {
  const { locale } = useLocale();
  const t = copy[locale];
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>();
  const [management, setManagement] = useState<Management | null>(null);
  const [result, setResult] = useState<Result>();
  const [showResume, setShowResume] = useState(false);
  const [askCancel, setAskCancel] = useState(false);
  const [hostedUrl, setHostedUrl] = useState("");
  const [showManagementLink, setShowManagementLink] = useState(false);
  const attempt = useRef<Attempt | null>(null);
  const managed = useRef<Management | null>(null);
  const checkoutWidget = useRef<{ destroy: () => void } | null>(null);
  const mounted = useRef(false);
  const operation = useRef(false);

  useEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);

  function updateManagement(next: Management | null) {
    managed.current = next;
    setManagement(next);
    try {
      if (next) window.localStorage.setItem(storageKey, JSON.stringify(next));
      else window.localStorage.removeItem(storageKey);
    } catch {
      // The current page and the copyable management link remain available.
    }
  }

  async function getStatus(path: "status" | "cancel", token: string, waitForActivation = false) {
    setBusy(true);
    setNotice("checking");
    try {
      let next = await requestRecurring<Result>(path, { token });
      // The checkout callback can arrive before Revolut activates the subscription.
      if (waitForActivation) {
        for (const delay of [1_000, 2_000, 3_000]) {
          if (next.status !== "pending") break;
          await new Promise<void>((resolve) => window.setTimeout(resolve, delay));
          if (!mounted.current || managed.current?.token !== token) return;
          next = await requestRecurring<Result>(path, { token });
        }
      }
      if (!mounted.current || managed.current?.token !== token) return;
      if (!validStatuses.has(next.status) || !Number.isSafeInteger(next.amountMinor) || next.amountMinor < 100 || next.amountMinor > 100_000) {
        throw new RecurringRequestError("unavailable");
      }
      setResult(next);
      setAmount((next.amountMinor / 100).toFixed(2));
      setNotice(undefined);
      if (next.status !== "pending") {
        setShowResume(false);
        setHostedUrl("");
      }
      if (next.status === "cancelled" || next.status === "finished") {
        try { window.localStorage.removeItem(storageKey); } catch {}
      }
    } catch (error) {
      if (mounted.current && managed.current?.token === token) {
        setNotice(error instanceof RecurringRequestError && error.code === "invalid" ? "invalid" : "unavailable");
      }
    } finally {
      if (mounted.current && managed.current?.token === token) {
        operation.current = false;
        setBusy(false);
      }
    }
  }

  useEffect(() => {
    mounted.current = true;

    function restore() {
      let restored: Management | null = null;
      const fragment = window.location.hash;
      if (fragment.startsWith(linkPrefix)) {
        const token = fragment.slice(linkPrefix.length);
        // Strip the capability before loading a payment provider script.
        window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
        if (!managementTokenPattern.test(token)) {
          setNotice("invalid");
          return;
        }
        restored = { token, awaitingConfirmation: false };
      } else {
        try {
          const saved = JSON.parse(window.localStorage.getItem(storageKey) || "null");
          if (typeof saved?.token === "string" && managementTokenPattern.test(saved.token)) {
            restored = { token: saved.token, awaitingConfirmation: saved.awaitingConfirmation === true };
          }
        } catch {
          // Ignore an unavailable or malformed browser entry.
        }
      }
      if (restored) {
        updateManagement(restored);
        void getStatus("status", restored.token);
      }
    }

    function restoreOnReturn(event: PageTransitionEvent) {
      if (event.persisted) restore();
    }
    restore();
    window.addEventListener("hashchange", restore);
    window.addEventListener("pageshow", restoreOnReturn);
    return () => {
      mounted.current = false;
      checkoutWidget.current?.destroy();
      checkoutWidget.current = null;
      window.removeEventListener("hashchange", restore);
      window.removeEventListener("pageshow", restoreOnReturn);
    };
  }, [linkPrefix, storageKey]);

  async function startCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (operation.current || busy || !consent) return;
    const normalized = normalizeAmount(amount);
    if (!normalized) return;
    const nextEmail = email.trim().toLowerCase();
    const statusToken = managed.current?.token;
    const id = attempt.current?.amount === normalized && attempt.current.email === nextEmail
      ? attempt.current.id
      : statusToken?.split(".")[0] ?? crypto.randomUUID();
    attempt.current = { amount: normalized, email: nextEmail, id };
    operation.current = true;
    setBusy(true);
    setNotice(undefined);
    setHostedUrl("");
    let fallbackUrl = "";
    try {
      const order = await requestRecurring<Checkout>("checkout", { amount: normalized, email: nextEmail, consent: true, attemptId: id });
      if (!mounted.current) return;
      if (order.sandbox !== sandbox || !managementTokenPattern.test(order.statusToken) || order.amountMinor !== Math.round(Number(normalized) * 100)) {
        throw new RecurringRequestError("unavailable");
      }
      updateManagement({ token: order.statusToken, awaitingConfirmation: false });
      setResult({ status: "pending", amountMinor: order.amountMinor });
      setShowResume(false);
      if (order.checkoutUrl) {
        const expectedOrigin = sandbox ? "https://sandbox-checkout.revolut.com" : "https://checkout.revolut.com";
        const url = new URL(order.checkoutUrl);
        if (url.origin === expectedOrigin && url.pathname.startsWith("/payment-link/") && !url.username && !url.password) {
          fallbackUrl = url.href;
        }
      }
      if (!order.token) {
        throw new RecurringRequestError("unavailable");
      }

      const { default: RevolutCheckout } = await import("@revolut/checkout");
      const instance = await RevolutCheckout(order.token, sandbox ? "sandbox" : "prod");
      if (!mounted.current) {
        instance.destroy();
        return;
      }
      checkoutWidget.current = instance;

      const finishCheckout = (accepted: boolean) => {
        checkoutWidget.current = null;
        if (!mounted.current) return;
        if (accepted) {
          updateManagement({ token: order.statusToken, awaitingConfirmation: true });
          void getStatus("status", order.statusToken, true);
        } else {
          operation.current = false;
          setBusy(false);
          setNotice("failed");
          setShowResume(true);
        }
      };

      instance.payWithPopup({
        email: nextEmail,
        locale,
        savePaymentMethodFor: "merchant",
        onSuccess: () => finishCheckout(true),
        onError: () => finishCheckout(false),
        onCancel: () => finishCheckout(false),
      });
    } catch (error) {
      if (!mounted.current) return;
      if (error instanceof RecurringRequestError) {
        if (error.code === "closed" && error.statusToken && managementTokenPattern.test(error.statusToken)) {
          updateManagement({ token: error.statusToken, awaitingConfirmation: false });
          void getStatus("status", error.statusToken);
          return;
        }
        if (error.code === "conflict" && error.statusToken && managementTokenPattern.test(error.statusToken)) {
          updateManagement({ token: error.statusToken, awaitingConfirmation: false });
          setShowResume(true);
          setNotice("preparing");
        } else {
          setNotice(error.code === "closed" ? "closed" : "unavailable");
        }
      } else {
        setNotice("unavailable");
      }
      if (fallbackUrl) {
        setHostedUrl(fallbackUrl);
        setShowResume(false);
      } else if (managed.current && !managed.current.awaitingConfirmation) {
        setShowResume(true);
      }
      operation.current = false;
      setBusy(false);
    }
  }

  function newPayment() {
    updateManagement(null);
    attempt.current = null;
    setAmount("");
    setEmail("");
    setConsent(false);
    setResult(undefined);
    setNotice(undefined);
    setShowResume(false);
    setAskCancel(false);
    setHostedUrl("");
    setShowManagementLink(false);
  }

  function managementLink() {
    if (!management) return "";
    const link = new URL(window.location.pathname, window.location.origin);
    link.hash = linkPrefix.slice(1) + management.token;
    return link.href;
  }

  async function copyManagementLink() {
    try {
      await navigator.clipboard.writeText(managementLink());
      setNotice("copied");
    } catch {
      setShowManagementLink(true);
    }
  }

  const normalized = normalizeAmount(amount);
  const money = new Intl.NumberFormat(LOCALE_TAGS[locale], { style: "currency", currency: "EUR" });
  const displayAmount = normalized ? money.format(Number(normalized)) : "";
  const showForm = !management || showResume;
  const terminal = result?.status === "cancelled" || result?.status === "finished";
  const canResume = result?.status === "pending" && management && !management.awaitingConfirmation && !showResume && !hostedUrl;
  const canCancel = management && result && !terminal;
  const message = notice ? t[notice] : busy ? t.loading : result ? t[result.status] : null;

  return (
    <div className="mt-5 min-w-0">
      {sandbox && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">{t.test}</p>}
      {!management && <p className="mt-4 text-sm leading-relaxed text-gray-600">{t.description}</p>}
      {management && result && (
        <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 font-heading text-xl font-bold text-gray-950 tabular-nums">{t.cadence(money.format(result.amountMinor / 100))}</p>
      )}
      {message && (
        <p role="status" className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm leading-relaxed ${result?.status === "active" && !notice ? "border-emerald-100 bg-emerald-50 text-emerald-900" : "border-gray-200 bg-gray-50 text-gray-800"}`}>
          {result?.status === "active" && !notice && <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
          {message}
        </p>
      )}
      {showForm && (
        <form onSubmit={startCheckout} className="mt-5 space-y-4">
          {!management && (
            <div>
              <label htmlFor="monthly-amount" className="text-sm font-semibold text-gray-950">{t.amount}</label>
              <input id="monthly-amount" name="amount" type="text" inputMode="decimal" autoComplete="off" maxLength={8} required disabled={busy}
                className={inputStyle} value={amount} aria-invalid={Boolean(amount && !normalized)} aria-describedby="monthly-amount-hint"
                onChange={(event) => { setAmount(event.target.value); setConsent(false); }} />
              <p id="monthly-amount-hint" className={amount && !normalized ? "mt-2 text-sm text-red-700" : "mt-2 text-sm text-gray-600"}>{t.range}</p>
            </div>
          )}
          <div>
            <label htmlFor="monthly-email" className="text-sm font-semibold text-gray-950">{t.email}</label>
            <input id="monthly-email" name="email" type="email" autoComplete="email" maxLength={254} required disabled={busy}
              className={inputStyle} value={email} onChange={(event) => { setEmail(event.target.value); setConsent(false); }} />
          </div>
          {displayAmount && (
            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-900">
              <input type="checkbox" checked={consent} required disabled={busy} onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 size-4 shrink-0 accent-gray-950" />
              {t.consent(displayAmount)}
            </label>
          )}
          <Button type="submit" className="min-h-12 w-full rounded-xl text-base" disabled={busy || !normalized || !consent}>
            {t.continue}<ArrowRight aria-hidden="true" />
          </Button>
          <p className="flex items-start gap-2 text-sm leading-relaxed text-gray-600">
            <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{t.secure}
          </p>
        </form>
      )}
      {hostedUrl && (
        <Button asChild className="mt-4 min-h-12 w-full rounded-xl text-base">
          <a href={hostedUrl} rel="noreferrer">{t.hosted}<ArrowRight aria-hidden="true" /></a>
        </Button>
      )}
      {management && !terminal && (
        <div className="mt-4 flex flex-wrap gap-2">
          {canResume && <Button type="button" className="min-h-11 rounded-xl" disabled={busy} onClick={() => { setConsent(false); setShowResume(true); }}>{t.resume}</Button>}
          <Button type="button" variant="outline" className="min-h-11 rounded-xl" disabled={busy} onClick={() => void getStatus("status", management.token)}>{t.verify}</Button>
          {canCancel && !askCancel && <Button type="button" variant="outline" className="min-h-11 rounded-xl" disabled={busy} onClick={() => setAskCancel(true)}>{t.cancel}</Button>}
        </div>
      )}
      {canCancel && askCancel && (
        <div className="mt-4 rounded-xl border border-gray-200 p-3">
          <p className="text-sm font-semibold text-gray-900">{t.cancelPrompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" className="min-h-11 rounded-xl" disabled={busy} onClick={() => { setAskCancel(false); void getStatus("cancel", management.token); }}>{t.cancelConfirm}</Button>
            <Button type="button" variant="outline" className="min-h-11 rounded-xl" disabled={busy} onClick={() => setAskCancel(false)}>{t.back}</Button>
          </div>
        </div>
      )}
      {management && result && !terminal && (
        <div className="mt-5 border-t border-gray-200 pt-4">
          <p className="text-sm leading-relaxed text-gray-600">{t.keepLink}</p>
          <Button type="button" variant="outline" className="mt-3 min-h-11 rounded-xl" onClick={() => void copyManagementLink()}>{t.manage}</Button>
          {showManagementLink && (
            <input aria-label={t.manage} type="text" readOnly value={managementLink()} onFocus={(event) => event.currentTarget.select()} className={inputStyle} />
          )}
        </div>
      )}
      {(terminal || notice === "invalid") && <Button type="button" variant="outline" className="mt-4 min-h-11 rounded-xl" onClick={newPayment}>{t.another}</Button>}
    </div>
  );
}
