import { CalendarClock, Mail } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { BOOKING_URL, CONTACT_EMAIL } from "@/lib/contact";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";

export const directContactCopy: Record<
  Locale,
  { title: string; body: string; emailLabel: string; booking: string }
> = {
  en: {
    title: "Prefer to talk first?",
    body: "Email us or book a short introductory call. You do not need a written brief.",
    emailLabel: "Email",
    booking: "Book an intro call",
  },
  el: {
    title: "Προτιμάτε να μιλήσουμε πρώτα;",
    body: "Στείλτε μας email ή κλείστε μια σύντομη εισαγωγική κλήση. Δεν χρειάζεται γραπτή περιγραφή του έργου.",
    emailLabel: "Email",
    booking: "Κλείστε μια εισαγωγική κλήση",
  },
  de: {
    title: "Lieber erst sprechen?",
    body: "Schreiben Sie uns eine E-Mail oder buchen Sie ein kurzes Kennenlerngespräch. Ein schriftliches Briefing ist nicht nötig.",
    emailLabel: "E-Mail",
    booking: "Kennenlerngespräch buchen",
  },
};

export type DirectContactPlacement = "start_project" | "footer";

/** Only counted for visitors who allowed analytics; it never includes what they write. */
export function trackDirectContact(method: "email" | "booking", placement: DirectContactPlacement) {
  trackEvent("contact_click", { method, placement });
}

/** Email and call-booking routes for visitors who would rather not fill in the form. */
export function DirectContactPanel({ placement }: { placement: DirectContactPlacement }) {
  const { locale } = useLocale();
  const copy = directContactCopy[locale];

  if (!CONTACT_EMAIL && !BOOKING_URL) return null;

  const linkClass =
    "inline-flex min-h-11 items-center gap-2.5 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5" data-direct-contact>
      <p className="text-sm font-semibold text-gray-900">{copy.title}</p>
      <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{copy.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CONTACT_EMAIL && (
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className={linkClass}
            aria-label={`${copy.emailLabel}: ${CONTACT_EMAIL}`}
            onClick={() => trackDirectContact("email", placement)}
          >
            <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="break-all">{CONTACT_EMAIL}</span>
          </a>
        )}
        {BOOKING_URL && (
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            onClick={() => trackDirectContact("booking", placement)}
          >
            <CalendarClock aria-hidden="true" className="h-4 w-4 shrink-0" />
            {copy.booking}
          </a>
        )}
      </div>
    </div>
  );
}
