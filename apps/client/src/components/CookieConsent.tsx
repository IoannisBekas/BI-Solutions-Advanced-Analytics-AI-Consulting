import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { withSiteBase } from "@/lib/site";
import { getStoredAiSearchReferral } from "@/lib/referralTracking";

const COOKIE_CONSENT_KEY = "cookie-consent";
const GA_ID = "G-M1276CBX6M";
const COOKIE_BODY =
  "We use essential cookies and basic analytics to improve the site experience.";
const COOKIE_BODY_SHORT =
  "Essential cookies and basic analytics.";
const COOKIE_LINK_LABEL =
  "Privacy Policy";
const COOKIE_DECLINE_LABEL = "Decline";
const COOKIE_ACCEPT_LABEL = "Accept";
const COOKIE_TITLE = "Cookies & Analytics";

function loadGA() {
  if (document.querySelector(`script[src*="gtag/js?id=${GA_ID}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  (window as Window & { dataLayer?: unknown[] }).dataLayer =
    (window as Window & { dataLayer?: unknown[] }).dataLayer || [];

  const analyticsWindow = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };

  function gtag(...args: unknown[]) {
    analyticsWindow.dataLayer?.push(args);
  }

  analyticsWindow.gtag = gtag;

  gtag("js", new Date());
  gtag("config", GA_ID);

  const referral = getStoredAiSearchReferral();
  if (referral) {
    gtag("event", "ai_search_referral", {
      ai_source: referral.source,
      referrer_domain: referral.referrerDomain,
      landing_path: referral.landingPath,
    });
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);

    if (!consent) {
      const timer = window.setTimeout(() => setVisible(true), 1000);
      return () => window.clearTimeout(timer);
    }

    if (consent === "accepted") {
      loadGA();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    loadGA();
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 220 }}
          className="fixed inset-x-3 bottom-3 z-50 sm:left-auto sm:right-5 sm:w-[18rem]"
          role="dialog"
          aria-label={COOKIE_TITLE}
        >
          <div className="rounded-[1.5rem] border border-white/10 bg-black/95 px-3 py-2 text-white shadow-2xl shadow-black/30 backdrop-blur-xl sm:px-4 sm:py-3">
            <div className="flex items-start gap-3 sm:block">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 sm:text-[11px]">
                  {COOKIE_TITLE}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-gray-300 sm:mt-2 sm:text-[13px] sm:leading-relaxed">
                  <span className="sm:hidden">{COOKIE_BODY_SHORT}</span>
                  <span className="hidden sm:inline">{COOKIE_BODY}</span>{" "}
                  <a
                    href={withSiteBase("/privacy-policy")}
                    className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
                  >
                    {COOKIE_LINK_LABEL}
                  </a>
                  .
                </p>
              </div>
              <div className="flex w-[7.5rem] shrink-0 flex-col gap-1.5 sm:mt-3 sm:w-auto sm:flex-row sm:gap-2">
                <button
                  onClick={handleDecline}
                  className="flex-1 rounded-full border border-white/15 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-white/35 hover:text-white sm:py-2"
                >
                  {COOKIE_DECLINE_LABEL}
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-gray-200 sm:py-2"
                >
                  {COOKIE_ACCEPT_LABEL}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
