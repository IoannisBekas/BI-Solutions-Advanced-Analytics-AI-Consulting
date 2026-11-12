import { useEffect, useState } from "react";
import { useLocale, useLocalizedHref } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";
import {
  COOKIE_CONSENT_KEY,
  applyMeasurementConsent,
  initializeMeasurement,
  readMeasurementConsent,
  saveMeasurementConsent,
  trackEvent,
  type MeasurementConsent,
} from "@/lib/analytics";
import { captureAiSearchReferral, clearAiSearchReferral, getStoredAiSearchReferral } from "@/lib/referralTracking";

const cookieCopy: Record<
  Locale,
  {
    title: string;
    summary: string;
    description: string;
    customize: string;
    hide: string;
    choices: string;
    analytics: string;
    ads: string;
    reject: string;
    accept: string;
    save: string;
    error: string;
    change: string;
    privacy: string;
  }
> = {
  en: {
    title: "Cookies & measurement",
    summary: "We use Google Analytics and Google Ads measurement only with your permission. Both are optional.",
    customize: "Customize",
    hide: "Hide options",
    description: "Essential storage keeps the site working. With your permission, Google Analytics helps us understand visits and Google Ads measures which ads lead to project enquiries. Both are optional. Your form contents are not sent to Google Ads.",
    choices: "Optional measurement choices",
    analytics: "Analytics (Google Analytics)",
    ads: "Ad measurement (Google Ads)",
    reject: "Reject optional",
    accept: "Accept both",
    save: "Save choices",
    error: "Your browser could not save this choice. Optional measurement remains off unless already allowed.",
    change: "Change or withdraw permission using Cookie settings. Changing an existing choice may reload the page.",
    privacy: "Privacy Policy",
  },
  el: {
    title: "Cookies & μέτρηση",
    summary: "Χρησιμοποιούμε το Google Analytics και τη μέτρηση Google Ads μόνο με την άδειά σας. Και τα δύο είναι προαιρετικά.",
    customize: "Προσαρμογή",
    hide: "Απόκρυψη επιλογών",
    description: "Η απαραίτητη αποθήκευση διατηρεί τον ιστότοπο λειτουργικό. Με την άδειά σας, το Google Analytics μας βοηθά να κατανοούμε τις επισκέψεις και το Google Ads μετρά ποιες διαφημίσεις οδηγούν σε αιτήματα έργων. Και τα δύο είναι προαιρετικά. Το περιεχόμενο των φορμών σας δεν αποστέλλεται στο Google Ads.",
    choices: "Προαιρετικές επιλογές μέτρησης",
    analytics: "Analytics (Google Analytics)",
    ads: "Μέτρηση διαφημίσεων (Google Ads)",
    reject: "Απόρριψη προαιρετικών",
    accept: "Αποδοχή και των δύο",
    save: "Αποθήκευση επιλογών",
    error: "Το πρόγραμμα περιήγησης δεν μπόρεσε να αποθηκεύσει αυτή την επιλογή. Η προαιρετική μέτρηση παραμένει απενεργοποιημένη, εκτός αν είχε ήδη επιτραπεί.",
    change: "Αλλάξτε ή ανακαλέστε την άδεια από τις Ρυθμίσεις cookies. Η αλλαγή μιας αποθηκευμένης επιλογής ενδέχεται να επαναφορτώσει τη σελίδα.",
    privacy: "Πολιτική απορρήτου",
  },
  de: {
    title: "Cookies & Messung",
    summary: "Wir nutzen Google Analytics und die Google-Ads-Messung nur mit Ihrer Erlaubnis. Beides ist optional.",
    customize: "Anpassen",
    hide: "Optionen ausblenden",
    description: "Notwendige Speicherung hält die Website funktionsfähig. Mit Ihrer Erlaubnis hilft Google Analytics uns, Besuche zu verstehen, und Google Ads misst, welche Anzeigen zu Projektanfragen führen. Beides ist optional. Ihre Formularinhalte werden nicht an Google Ads gesendet.",
    choices: "Optionale Messeinstellungen",
    analytics: "Analyse (Google Analytics)",
    ads: "Anzeigenmessung (Google Ads)",
    reject: "Optionale ablehnen",
    accept: "Beide akzeptieren",
    save: "Auswahl speichern",
    error: "Ihr Browser konnte diese Auswahl nicht speichern. Optionale Messung bleibt deaktiviert, sofern sie nicht bereits erlaubt war.",
    change: "Sie können Ihre Einwilligung über die Cookie-Einstellungen ändern oder widerrufen. Beim Ändern einer gespeicherten Auswahl wird die Seite möglicherweise neu geladen.",
    privacy: "Datenschutzerklärung",
  },
};

export const OPEN_COOKIE_SETTINGS_EVENT = "bi-open-cookie-settings";

export function CookieConsent() {
  const { locale } = useLocale();
  const localizedHref = useLocalizedHref();
  const copy = cookieCopy[locale];
  const [visible, setVisible] = useState(true);
  // The first-visit notice stays compact; the per-purpose options open on
  // request, or straight away when the visitor asks for Cookie settings.
  const [expanded, setExpanded] = useState(false);
  const [choices, setChoices] = useState<MeasurementConsent>({ analytics: false, ads: false });
  const [error, setError] = useState("");

  useEffect(() => {
    const syncConsent = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY || event.key === null) {
        applyMeasurementConsent(readMeasurementConsent() || { analytics: false, ads: false });
        setChoices(readMeasurementConsent() || { analytics: false, ads: false });
        setVisible(!readMeasurementConsent());
      }
    };
    const openSettings = () => {
      setChoices(readMeasurementConsent() || { analytics: false, ads: false });
      document.documentElement.removeAttribute("data-cookie-consent");
      setExpanded(true);
      setVisible(true);
    };

    window.addEventListener("storage", syncConsent);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);

    return () => {
      window.removeEventListener("storage", syncConsent);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    };
  }, []);

  useEffect(() => {
    const consent = readMeasurementConsent();
    if (!consent) {
      document.documentElement.removeAttribute("data-cookie-consent");
      setVisible(true);
      return;
    }
    setChoices(consent);
    document.documentElement.setAttribute("data-cookie-consent", "saved");
    initializeMeasurement();
    if (consent.analytics) {
      captureAiSearchReferral();
      const referral = getStoredAiSearchReferral();
      if (referral) trackEvent("ai_search_referral", {
        ai_source: referral.source,
        referrer_domain: referral.referrerDomain,
        landing_path: referral.landingPath,
      });
    }
  }, []);

  const save = (consent: MeasurementConsent) => {
    if (!saveMeasurementConsent(consent)) {
      setError(copy.error);
      return;
    }
    setChoices(consent);
    if (consent.analytics) captureAiSearchReferral();
    else clearAiSearchReferral();
    document.documentElement.setAttribute("data-cookie-consent", "saved");
    setVisible(false);
    setExpanded(false);
    setError("");
    applyMeasurementConsent(consent);
  };

  const buttonClass = "min-h-11 rounded-full border border-gray-400 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  if (!visible) return null;

  // Collapsed, the notice is a compact card on phones and a short bar on wide
  // screens, so it stays clear of the page's main call to action. Expanded, it
  // becomes a settings card.
  const layoutClass = expanded
    ? "sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[26rem] sm:p-5"
    : "sm:inset-x-5 sm:bottom-5 sm:p-5 lg:bottom-4 lg:mx-auto lg:max-w-6xl lg:py-3.5";

  return (
    <section
      data-cookie-consent-banner
      className={`fixed inset-x-3 bottom-3 z-[120] max-h-[85dvh] overflow-y-auto rounded-2xl border border-white/20 bg-gray-950 p-4 text-white shadow-2xl ${layoutClass}`}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className={expanded ? undefined : "lg:flex lg:items-center lg:gap-6"}>
        <div className="min-w-0 lg:flex-1">
          {/* The wide bar drops the visible heading to stay short; it still names the dialog. */}
          <h2 id="cookie-consent-title" className={expanded ? "text-base font-semibold" : "text-base font-semibold lg:sr-only"}>{copy.title}</h2>
          <p id="cookie-consent-description" className={expanded ? "mt-1.5 text-sm leading-snug text-gray-200" : "mt-1.5 text-sm leading-snug text-gray-200 lg:mt-0"}>
            {expanded ? copy.description : copy.summary}{" "}
            <a
              href={localizedHref("/privacy-policy")}
              className="underline decoration-white/40 underline-offset-4 hover:text-white"
            >
              {copy.privacy}
            </a>
          </p>
        </div>
        <div id="cookie-consent-options" hidden={!expanded}>
          <fieldset className="mt-3 space-y-1">
            <legend className="sr-only">{copy.choices}</legend>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" className="h-5 w-5 shrink-0 accent-white" checked={choices.analytics} onChange={(event) => setChoices({ ...choices, analytics: event.target.checked })} />
              {copy.analytics}
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" className="h-5 w-5 shrink-0 accent-white" checked={choices.ads} onChange={(event) => setChoices({ ...choices, ads: event.target.checked })} />
              {copy.ads}
            </label>
          </fieldset>
        </div>
        <div className={expanded ? "mt-3" : "mt-3 flex flex-col lg:mt-0 lg:shrink-0 lg:flex-row-reverse lg:items-center lg:gap-4"}>
          {/* Reject and accept stay side by side and equally weighted in every layout. */}
          <div className={expanded ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-2 lg:w-[26rem]"}>
            <button type="button" className={buttonClass} onClick={() => save({ analytics: false, ads: false })}>{copy.reject}</button>
            <button type="button" className={buttonClass} onClick={() => save({ analytics: true, ads: true })}>{copy.accept}</button>
            {expanded && (
              <button type="button" className={buttonClass + " col-span-2"} onClick={() => save(choices)}>{copy.save}</button>
            )}
          </div>
          <button
            type="button"
            className="mt-1 min-h-11 self-start text-xs text-gray-200 underline decoration-white/40 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:mt-0 lg:self-auto"
            aria-expanded={expanded}
            aria-controls="cookie-consent-options"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? copy.hide : copy.customize}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-200">{error}</p>}
      {expanded && <p className="text-xs leading-relaxed text-gray-300">{copy.change}</p>}
    </section>
  );
}
