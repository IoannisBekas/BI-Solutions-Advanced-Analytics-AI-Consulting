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
    description: string;
    choices: string;
    analytics: string;
    ads: string;
    reject: string;
    accept: string;
    save: string;
    error: string;
    change: string;
    privacy: string;
    settings: string;
  }
> = {
  en: {
    title: "Cookies & measurement",
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
    settings: "Cookie settings",
  },
  el: {
    title: "Cookies & μέτρηση",
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
    settings: "Ρυθμίσεις cookies",
  },
  de: {
    title: "Cookies & Messung",
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
    settings: "Cookie-Einstellungen",
  },
};

export function CookieConsent() {
  const { locale } = useLocale();
  const localizedHref = useLocalizedHref();
  const copy = cookieCopy[locale];
  const [visible, setVisible] = useState(false);
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
    window.addEventListener("storage", syncConsent);
    return () => window.removeEventListener("storage", syncConsent);
  }, []);

  useEffect(() => {
    const consent = readMeasurementConsent();
    if (!consent) {
      setVisible(true);
      return;
    }
    setChoices(consent);
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
    setVisible(false);
    setError("");
    applyMeasurementConsent(consent);
  };

  const buttonClass = "min-h-11 rounded-full border border-gray-400 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return visible ? (
    <section
      className="fixed inset-x-3 bottom-3 z-[120] max-h-[85dvh] overflow-y-auto rounded-2xl border border-white/20 bg-gray-950 p-5 text-white shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[26rem]"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <h2 id="cookie-consent-title" className="text-base font-semibold">{copy.title}</h2>
      <p id="cookie-consent-description" className="mt-2 text-sm leading-relaxed text-gray-200">
        {copy.description}
      </p>
      <fieldset className="my-4 space-y-3">
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
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={buttonClass} onClick={() => save({ analytics: false, ads: false })}>{copy.reject}</button>
        <button type="button" className={buttonClass} onClick={() => save({ analytics: true, ads: true })}>{copy.accept}</button>
        <button type="button" className={buttonClass + " col-span-2"} onClick={() => save(choices)}>{copy.save}</button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-200">{error}</p>}
      <p className="mt-3 text-xs leading-relaxed text-gray-300">
        {copy.change} <a href={localizedHref("/privacy-policy")} className="underline">{copy.privacy}</a>
      </p>
    </section>
  ) : (
    <button type="button" onClick={() => { setChoices(readMeasurementConsent() || { analytics: false, ads: false }); setVisible(true); }} className="fixed bottom-3 left-3 z-[120] min-h-11 rounded-full border border-gray-300 bg-white px-4 text-xs font-medium text-gray-900 shadow-sm">
      {copy.settings}
    </button>
  );
}
