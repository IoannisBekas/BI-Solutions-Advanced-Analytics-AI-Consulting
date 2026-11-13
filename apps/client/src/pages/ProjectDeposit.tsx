import { useEffect, useState } from "react";
import { ArrowUpRight, CircleCheck, CreditCard, LockKeyhole } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { useLocale, useLocalizedHref } from "@/i18n/LocaleProvider";
import { LOCALES, LOCALE_TAGS } from "@/i18n/config";
import { withAssetBase } from "@/lib/site";

const copy = {
  en: {
    title: "Project deposit",
    description: "Review the deposit amount agreed in your proposal.",
    reference: "Proposal reference",
    amount: "Deposit amount",
    pay: "Pay by card",
    checkout: "Card payment takes place on Revolut Checkout.",
    sandbox: "Test mode · no real charge",
    loading: "Checking your payment link…",
    missing: "Open the payment link shared with your proposal.",
    invalid: "This payment link is invalid. Check the link in your proposal.",
    expired: "This payment link has expired. Ask us for a new one.",
    unavailable: "Card payment is temporarily unavailable. Please try again later.",
    processing: "Revolut is processing the payment. Check the status again shortly.",
    paid: "Your deposit has been paid.",
    closed: "This link can no longer accept payment. Ask us for a new one.",
    refresh: "Check payment status",
    retry: "Try again",
    help: "If you need help, contact the team that sent your proposal.",
    privacy: "Privacy policy",
  },
  el: {
    title: "Προκαταβολή έργου",
    description: "Δείτε το ποσό προκαταβολής που συμφωνήσατε στην προσφορά.",
    reference: "Κωδικός προσφοράς",
    amount: "Ποσό προκαταβολής",
    pay: "Πληρωμή με κάρτα",
    checkout: "Η πληρωμή με κάρτα γίνεται στο Revolut Checkout.",
    sandbox: "Δοκιμαστική λειτουργία · χωρίς πραγματική χρέωση",
    loading: "Γίνεται έλεγχος του συνδέσμου πληρωμής…",
    missing: "Ανοίξτε τον σύνδεσμο πληρωμής που λάβατε μαζί με την προσφορά.",
    invalid: "Ο σύνδεσμος πληρωμής δεν είναι έγκυρος. Ελέγξτε τον σύνδεσμο στην προσφορά σας.",
    expired: "Ο σύνδεσμος πληρωμής έχει λήξει. Ζητήστε μας νέο σύνδεσμο.",
    unavailable: "Η πληρωμή με κάρτα είναι προσωρινά μη διαθέσιμη. Δοκιμάστε ξανά αργότερα.",
    processing: "Η Revolut επεξεργάζεται την πληρωμή. Ελέγξτε ξανά σε λίγο.",
    paid: "Η προκαταβολή σας εξοφλήθηκε.",
    closed: "Ο σύνδεσμος δεν δέχεται πλέον πληρωμές. Ζητήστε μας νέο σύνδεσμο.",
    refresh: "Έλεγχος κατάστασης πληρωμής",
    retry: "Δοκιμάστε ξανά",
    help: "Για βοήθεια, επικοινωνήστε με την ομάδα που σας έστειλε την προσφορά.",
    privacy: "Πολιτική απορρήτου",
  },
  de: {
    title: "Projektanzahlung",
    description: "Prüfen Sie den im Angebot vereinbarten Anzahlungsbetrag.",
    reference: "Angebotsreferenz",
    amount: "Anzahlungsbetrag",
    pay: "Mit Karte bezahlen",
    checkout: "Die Kartenzahlung erfolgt über Revolut Checkout.",
    sandbox: "Testmodus · keine echte Abbuchung",
    loading: "Ihr Zahlungslink wird geprüft…",
    missing: "Öffnen Sie den Zahlungslink, den Sie mit Ihrem Angebot erhalten haben.",
    invalid: "Dieser Zahlungslink ist ungültig. Prüfen Sie den Link in Ihrem Angebot.",
    expired: "Dieser Zahlungslink ist abgelaufen. Bitten Sie uns um einen neuen Link.",
    unavailable: "Die Kartenzahlung ist vorübergehend nicht verfügbar. Versuchen Sie es später erneut.",
    processing: "Revolut verarbeitet die Zahlung. Prüfen Sie den Status in Kürze erneut.",
    paid: "Ihre Anzahlung wurde bezahlt.",
    closed: "Über diesen Link sind keine Zahlungen mehr möglich. Bitten Sie uns um einen neuen Link.",
    refresh: "Zahlungsstatus prüfen",
    retry: "Erneut versuchen",
    help: "Bei Fragen wenden Sie sich an das Team, das Ihnen das Angebot geschickt hat.",
    privacy: "Datenschutzerklärung",
  },
};

type Deposit = {
  reference: string;
  amountMinor: number;
  currency: "EUR";
  status: "payable" | "processing" | "paid" | "closed" | "unavailable";
  checkoutUrl?: string;
  sandbox: boolean;
};

type PageState =
  | { deposit: Deposit }
  | { message: "loading" | "missing" | "invalid" | "expired" | "unavailable" };

export default function ProjectDeposit() {
  const { locale } = useLocale();
  const localizedHref = useLocalizedHref();
  const t = copy[locale];
  const [state, setState] = useState<PageState>({ message: "loading" });
  const [attempt, setAttempt] = useState(0);

  function refresh() {
    setAttempt((count) => count + 1);
  }

  useEffect(() => {
    let request: AbortController | undefined;
    async function checkStatus() {
      request?.abort();
      const token = window.location.hash.slice(1);
      if (!token) {
        setState({ message: "missing" });
        return;
      }

      setState({ message: "loading" });
      const controller = new AbortController();
      request = controller;
      try {
        const response = await fetch("/api/project-deposits/status", {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          referrerPolicy: "no-referrer",
          signal: controller.signal,
        });
        if (!response.ok) {
          const message = response.status === 404 ? "invalid"
            : response.status === 410 ? "expired" : "unavailable";
          if (!controller.signal.aborted) setState({ message });
          return;
        }
        const deposit: Deposit = await response.json();
        if (!controller.signal.aborted) setState({ deposit });
      } catch {
        if (!controller.signal.aborted) setState({ message: "unavailable" });
      }
    }

    const onHashChange = () => void checkStatus();
    function refreshOnReturn(event: PageTransitionEvent) {
      if (event.persisted) void checkStatus();
    }
    void checkStatus();
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("pageshow", refreshOnReturn);
    return () => {
      request?.abort();
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("pageshow", refreshOnReturn);
    };
  }, [attempt]);

  const deposit = "deposit" in state ? state.deposit : null;
  const checkoutUrl = deposit?.status === "payable" ? deposit.checkoutUrl : undefined;
  const message = "message" in state ? state.message
    : state.deposit.status === "payable" ? (checkoutUrl ? null : "unavailable")
      : state.deposit.status;
  const retryLabel = message === "processing" ? t.refresh : t.retry;

  return (
    <main id="main-content" className="grid min-h-dvh place-items-center bg-gray-50 px-4 py-10 sm:px-6 sm:py-16">
      <Seo title={t.title} description={t.description} path="/pay-deposit" robots="noindex,nofollow,noarchive" translatedLocales={LOCALES} />
      <div className="w-full min-w-0 max-w-lg">
        <a href={localizedHref("/")} className="mb-6 inline-flex min-h-11 items-center gap-3 rounded-lg px-1 text-sm font-semibold tracking-tight text-gray-950 hover:text-blue-800">
          <img src={withAssetBase("assets/brand/bi-solutions-group-mark.png")} alt="" width={28} height={28} />
          BI Solutions Group
        </a>
        <section aria-labelledby="deposit-title" className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl shadow-gray-950/[0.05] sm:p-9">
          <h1 id="deposit-title" className="break-words font-heading text-[clamp(1.55rem,7.7vw,1.875rem)] font-bold tracking-tight text-gray-950 sm:text-4xl">{t.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">{t.description}</p>

          {deposit && (
            <dl className="mt-6 min-w-0 space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
              <div>
                <dt className="text-sm font-medium text-gray-600">{t.reference}</dt>
                <dd className="mt-1 [overflow-wrap:anywhere] text-sm font-semibold text-gray-900"><code>{deposit.reference}</code></dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">{t.amount}</dt>
                <dd className="mt-1 [overflow-wrap:anywhere] font-heading text-3xl font-bold tracking-tight text-gray-950 tabular-nums sm:text-4xl">
                  {new Intl.NumberFormat(LOCALE_TAGS[locale], { style: "currency", currency: deposit.currency }).format(deposit.amountMinor / 100)}
                </dd>
              </div>
            </dl>
          )}
          {deposit?.sandbox && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">{t.sandbox}</p>}

          {checkoutUrl && (
            <div className="mt-6">
              <Button asChild className="min-h-12 w-full rounded-xl text-base">
                <a href={checkoutUrl} rel="noreferrer">
                  <CreditCard aria-hidden="true" />
                  {t.pay}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </Button>
              <p className="mt-3 flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-gray-600 sm:text-sm">
                <LockKeyhole aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                {t.checkout}
              </p>
            </div>
          )}
          <div role="status" aria-live="polite">
            {message && (
              <p className={`mt-6 flex items-start gap-2 rounded-xl border p-3 text-sm leading-relaxed ${message === "paid" ? "border-emerald-100 bg-emerald-50 text-emerald-900" : "border-gray-200 bg-gray-50 text-gray-800"}`}>
                {message === "paid" && <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
                {t[message]}
              </p>
            )}
          </div>
          {(message === "processing" || message === "unavailable") && (
            <Button type="button" variant="outline" className="mt-4 min-h-11 w-full rounded-xl" onClick={refresh}>{retryLabel}</Button>
          )}
        </section>
        <p className="mt-5 text-sm leading-relaxed text-gray-600">{t.help}</p>
        <a href={localizedHref("/privacy-policy")} className="mt-1 inline-flex min-h-11 items-center rounded-sm text-sm text-gray-600 underline underline-offset-4 hover:text-gray-950">{t.privacy}</a>
      </div>
    </main>
  );
}
