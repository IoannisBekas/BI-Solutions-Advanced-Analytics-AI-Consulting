import { useEffect, useState } from "react";
import { withSiteBase } from "@/lib/site";
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

export function CookieConsent() {
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
      setError("Your browser could not save this choice. Optional measurement remains off unless already allowed.");
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
      <h2 id="cookie-consent-title" className="text-base font-semibold">Cookies & measurement</h2>
      <p id="cookie-consent-description" className="mt-2 text-sm leading-relaxed text-gray-200">
        Essential storage keeps the site working. With your permission, Google Analytics helps us understand visits and Google Ads measures which ads lead to project enquiries. Both are optional. Your form contents are not sent to Google Ads.
      </p>
      <fieldset className="my-4 space-y-3">
        <legend className="sr-only">Optional measurement choices</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" className="h-5 w-5 shrink-0 accent-white" checked={choices.analytics} onChange={(event) => setChoices({ ...choices, analytics: event.target.checked })} />
          Analytics (Google Analytics)
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" className="h-5 w-5 shrink-0 accent-white" checked={choices.ads} onChange={(event) => setChoices({ ...choices, ads: event.target.checked })} />
          Ad measurement (Google Ads)
        </label>
      </fieldset>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={buttonClass} onClick={() => save({ analytics: false, ads: false })}>Reject optional</button>
        <button type="button" className={buttonClass} onClick={() => save({ analytics: true, ads: true })}>Accept both</button>
        <button type="button" className={buttonClass + " col-span-2"} onClick={() => save(choices)}>Save choices</button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-200">{error}</p>}
      <p className="mt-3 text-xs leading-relaxed text-gray-300">
        Change or withdraw permission using Cookie settings. Changing an existing choice may reload the page. <a href={withSiteBase("/privacy-policy")} className="underline">Privacy Policy</a>
      </p>
    </section>
  ) : (
    <button type="button" onClick={() => { setChoices(readMeasurementConsent() || { analytics: false, ads: false }); setVisible(true); }} className="fixed bottom-3 left-3 z-[120] min-h-11 rounded-full border border-gray-300 bg-white px-4 text-xs font-medium text-gray-900 shadow-sm">
      Cookie settings
    </button>
  );
}
