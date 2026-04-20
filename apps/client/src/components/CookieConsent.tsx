import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { withSiteBase } from "@/lib/site";

const COOKIE_CONSENT_KEY = "cookie-consent";
const GA_ID = "G-M1276CBX6M";
const COOKIE_BODY =
  "\u0391\u03c5\u03c4\u03cc\u03c2 \u03bf \u03b9\u03c3\u03c4\u03cc\u03c4\u03bf\u03c0\u03bf\u03c2 \u03c7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03b9\u03b5\u03af cookies \u03b3\u03b9\u03b1 \u03b2\u03b1\u03c3\u03b9\u03ba\u03ac analytics \u03ba\u03b1\u03b9 \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03b2\u03b5\u03bb\u03c4\u03b9\u03ce\u03bd\u03bf\u03c5\u03bc\u03b5 \u03c4\u03b7\u03bd \u03b5\u03bc\u03c0\u03b5\u03b9\u03c1\u03af\u03b1 \u03c3\u03b1\u03c2.";
const COOKIE_LINK_LABEL =
  "\u03a0\u03bf\u03bb\u03b9\u03c4\u03b9\u03ba\u03ae \u0391\u03c0\u03bf\u03c1\u03c1\u03ae\u03c4\u03bf\u03c5";
const COOKIE_DECLINE_LABEL = "\u0391\u03c0\u03cc\u03c1\u03c1\u03b9\u03c8\u03b7";
const COOKIE_ACCEPT_LABEL = "\u0391\u03c0\u03bf\u03b4\u03bf\u03c7\u03ae";

function loadGA() {
  if (document.querySelector(`script[src*="gtag/js?id=${GA_ID}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  (window as Window & { dataLayer?: unknown[][] }).dataLayer =
    (window as Window & { dataLayer?: unknown[][] }).dataLayer || [];

  function gtag(...args: unknown[]) {
    (window as Window & { dataLayer?: unknown[][] }).dataLayer?.push(
      args as unknown[],
    );
  }

  gtag("js", new Date());
  gtag("config", GA_ID);
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
          className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-6 sm:max-w-sm"
        >
          <div className="rounded-3xl border border-white/10 bg-black/95 px-5 py-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Cookies
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              {COOKIE_BODY}{" "}
              <a
                href={withSiteBase("/privacy-policy")}
                className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
              >
                {COOKIE_LINK_LABEL}
              </a>
              .
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDecline}
                className="flex-1 rounded-full border border-white/15 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-white/35 hover:text-white"
              >
                {COOKIE_DECLINE_LABEL}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200"
              >
                {COOKIE_ACCEPT_LABEL}
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
