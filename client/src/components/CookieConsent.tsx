import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

const COOKIE_CONSENT_KEY = "cookie-consent";
const GA_ID = "G-M1276CBX6M";

function loadGA() {
  if (document.querySelector(`script[src*="gtag/js?id=${GA_ID}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
  gtag("js", new Date());
  gtag("config", GA_ID);
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    } else if (consent === "accepted") {
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
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-black text-white rounded-2xl border border-white/10 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl">
            <p className="text-sm text-gray-300 leading-relaxed flex-1">
              Αυτός ο ιστότοπος χρησιμοποιεί cookies για τη βελτίωση της εμπειρίας σας.
              Διαβάστε την{" "}
              <Link
                href="/privacy-policy"
                className="underline text-white hover:text-gray-300 transition-colors"
              >
                Πολιτική Απορρήτου
              </Link>{" "}
              μας για περισσότερες πληροφορίες.
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={handleDecline}
                className="px-5 py-2 text-sm text-gray-400 hover:text-white border border-white/20 hover:border-white/40 rounded-full transition-colors"
              >
                Απόρριψη
              </button>
              <button
                onClick={handleAccept}
                className="px-5 py-2 text-sm bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-colors"
              >
                Αποδοχή
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
