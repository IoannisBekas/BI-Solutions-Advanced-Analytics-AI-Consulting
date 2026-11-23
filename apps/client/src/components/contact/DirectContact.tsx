import { CalendarClock, ClipboardPenLine, Mail } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { BOOKING_URL, CONTACT_EMAIL, START_PROJECT_PATH, introCallRequestHref } from "@/lib/contact";
import { useLocale, useLocalizedHref } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";

const directContactCopy: Record<
  Locale,
  { title: string; body: string; emailLabel: string; booking: string; request: string; requestBody: string; emailBody: string; brief: string }
> = {
  en: {
    title: "Prefer to talk first?",
    body: "Email us or book a short introductory call. You do not need a written brief.",
    emailLabel: "Email",
    booking: "Book an intro call",
    request: "Request an intro call",
    requestBody: "Email us or request a short introductory call.",
    emailBody: "You can also reach us directly by email.",
    brief: "Send a project brief",
  },
  el: {
    title: "Προτιμάτε να μιλήσουμε πρώτα;",
    body: "Στείλτε μας email ή κλείστε μια σύντομη εισαγωγική κλήση. Δεν χρειάζεται γραπτή περιγραφή του έργου.",
    emailLabel: "Email",
    booking: "Κλείστε μια εισαγωγική κλήση",
    request: "Ζητήστε μια εισαγωγική κλήση",
    requestBody: "Στείλτε μας email ή ζητήστε μια σύντομη εισαγωγική κλήση.",
    emailBody: "Μπορείτε επίσης να επικοινωνήσετε απευθείας μέσω email.",
    brief: "Στείλτε περιγραφή έργου",
  },
  de: {
    title: "Lieber erst sprechen?",
    body: "Schreiben Sie uns eine E-Mail oder buchen Sie ein kurzes Kennenlerngespräch. Ein schriftliches Briefing ist nicht nötig.",
    emailLabel: "E-Mail",
    booking: "Kennenlerngespräch buchen",
    request: "Kennenlerngespräch anfragen",
    requestBody: "Schreiben Sie uns eine E-Mail oder fragen Sie ein kurzes Kennenlerngespräch an.",
    emailBody: "Sie können uns auch direkt per E-Mail erreichen.",
    brief: "Projekt kurz beschreiben",
  },
};

export type DirectContactPlacement =
  | "start_project"
  | "footer"
  | "homepage"
  | "about"
  | "services"
  | "service-detail"
  | "us-consulting";

/** Only counted for visitors who allowed analytics; it never includes what they write. */
export function trackDirectContact(method: "email" | "booking" | "intro_request" | "brief", placement: DirectContactPlacement) {
  trackEvent("contact_click", { method, placement });
}

export function IntroCallLink({
  placement,
  projectHref,
  className,
  showIcon = true,
}: {
  placement: DirectContactPlacement;
  projectHref?: string;
  className?: string;
  showIcon?: boolean;
}) {
  const { locale } = useLocale();
  const localizedHref = useLocalizedHref();
  const copy = directContactCopy[locale];
  const href = BOOKING_URL || introCallRequestHref(projectHref || localizedHref(START_PROJECT_PATH));

  return (
    <a
      href={href}
      target={BOOKING_URL ? "_blank" : undefined}
      rel={BOOKING_URL ? "noopener noreferrer" : undefined}
      className={className}
      onClick={() => trackDirectContact(BOOKING_URL ? "booking" : "intro_request", placement)}
    >
      {showIcon && <CalendarClock aria-hidden="true" className="h-4 w-4 shrink-0" />}
      {BOOKING_URL ? copy.booking : copy.request}
    </a>
  );
}


export function DirectContactPanel({
  placement,
  projectHref,
  showIntro = true,
}: {
  placement: DirectContactPlacement;
  projectHref?: string;
  showIntro?: boolean;
}) {
  const { locale } = useLocale();
  const copy = directContactCopy[locale];

  if (!CONTACT_EMAIL && !showIntro && !projectHref) return null;

  const linkClass =
    "inline-flex min-h-11 items-center gap-2.5 rounded-full border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5" data-direct-contact>
      <p className="text-sm font-semibold text-gray-900">{copy.title}</p>
      <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{showIntro ? (BOOKING_URL ? copy.body : copy.requestBody) : copy.emailBody}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CONTACT_EMAIL && (
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className={linkClass}
            aria-label={`${copy.emailLabel}: ${CONTACT_EMAIL}`}
            onClick={() => trackDirectContact("email", placement)}
          >
            <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="break-all" translate="no">{CONTACT_EMAIL}</span>
          </a>
        )}
        {showIntro && <IntroCallLink placement={placement} projectHref={projectHref} className={linkClass} />}
        {projectHref && (
          <a
            href={projectHref}
            className={linkClass}
            onClick={() => trackDirectContact("brief", placement)}
          >
            <ClipboardPenLine aria-hidden="true" className="h-4 w-4 shrink-0" />
            {copy.brief}
          </a>
        )}
      </div>
    </div>
  );
}
