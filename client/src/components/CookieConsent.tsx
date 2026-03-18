import { useState, useEffect } from "react";
import { Link } from "wouter";

const CONSENT_KEY = "bisolutions-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
    if (typeof window.enableAnalytics === "function") {
      window.enableAnalytics();
    }
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl shadow-black/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600 leading-relaxed">
            We use cookies to analyze site traffic and improve your experience.
            See our{" "}
            <Link href="/cookies" className="underline font-medium text-black">
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline font-medium text-black">
              Privacy Policy
            </Link>
            .
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              onClick={decline}
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
