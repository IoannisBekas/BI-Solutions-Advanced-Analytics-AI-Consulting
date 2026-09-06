import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/LocaleProvider";
import { LOCALE_TAGS, localePrefix, type Locale } from "@/i18n/config";
import { trackEvent, trackLeadConversion } from "@/lib/analytics";
import {
  projectNeedGroups,
  projectNeedOptions,
  projectTimingOptions,
  resolveProjectNeed,
  resolveProjectTiming,
} from "@/lib/projectIntent";

const serviceNeedMap: Record<string, FormValues["need"]> = {
  "business-intelligence-semantic-modeling": "business-intelligence",
  "ai-business-intelligence": "business-intelligence",
  "advanced-analytics-ai": "ai-automation",
  "ai-strategy-readiness": "ai-automation",
  "ai-automation-consulting": "ai-automation",
  "generative-ai-llm-consulting": "ai-automation",
  "predictive-analytics-machine-learning": "ai-automation",
  "ai-governance-literacy-adoption": "ai-automation",
  "mlops-model-monitoring": "ai-automation",
  "ai-consulting-greece": "ai-automation",
  "data-strategy-governance": "data-strategy",
  "website-app-development": "web-app",
  "content-operations-automation": "content-operations",
  "data-career-enablement-mentorship": "team-enablement",
};

const budgetOptions = [
  "Not decided yet",
  "Under €5,000",
  "€5,000–€15,000",
  "€15,000–€40,000",
  "€40,000+",
] as const;

type FormValues = {
  name: string;
  email: string;
  company: string;
  need: string;
  description: string;
  timing: string;
  budget: string;
  consent: boolean;
};

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

/**
 * Where the brief is posted.
 *
 * The site is served as static files, so the bundled Express route at
 * /api/contact only exists when the server is deployed too — on static hosting
 * it answers 403 and every submission fails. Setting VITE_CONTACT_ENDPOINT to a
 * form service (Formspree, Web3Forms) points submissions at that instead, with
 * no code change. Both accept this JSON shape.
 */
const CONTACT_ENDPOINT =
  import.meta.env.VITE_CONTACT_ENDPOINT || "/api/contact";

const initialFormValues: FormValues = {
  name: "",
  email: "",
  company: "",
  need: "",
  description: "",
  timing: "",
  budget: "",
  consent: false,
};

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-950 shadow-sm shadow-black/[0.02] outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-black focus:ring-2 focus:ring-black/10";

const startProjectCopy: Record<Locale, {
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  schemaName: string;
  schemaDescription: string;
  projectEyebrow: string;
  mentorshipEyebrow: string;
  projectTitle: string;
  mentorshipTitle: string;
  introduction: string;
  startingPointTitle: string;
  startingPointBody: string;
  responseTitle: string;
  responseBody: string;
  successTitle: string;
  successBody: string;
  returnHome: string;
  projectFormTitle: string;
  mentorshipFormTitle: string;
  requiredNote: string;
  name: string;
  email: string;
  workEmail: string;
  company: string;
  careerStage: string;
  careerStagePlaceholder: string;
  achievement: string;
  selectNeed: string;
  projectDescription: string;
  careerDescription: string;
  projectPlaceholder: string;
  careerPlaceholder: string;
  timing: string;
  selectTiming: string;
  budget: string;
  optional: string;
  preferNot: string;
  consent: string;
  privacy: string;
  error: string;
  sending: string;
  sendProject: string;
  sendMentorship: string;
  needGroups: Record<string, string>;
  needs: Record<string, string>;
  timings: Record<string, string>;
  budgets: Record<string, string>;
}> = {
  en: {
    seoTitle: "Start a Project",
    seoDescription: "Tell BI Solutions Group about your BI, AI, data, automation, web application, or mentorship need and get a considered next step.",
    keywords: ["hire Power BI consultant", "international AI consultant", "business intelligence project", "international data strategy consultant", "fractional data leadership", "managed analytics support", "content operations consulting", "corporate AI training", "data career mentorship"],
    schemaName: "Start a project with BI Solutions Group",
    schemaDescription: "Share a business intelligence, AI, data strategy, automation, digital product, content operations, managed support, enablement, or mentorship requirement with BI Solutions Group.",
    projectEyebrow: "Start a project",
    mentorshipEyebrow: "Mentorship enquiry",
    projectTitle: "Bring the problem. We’ll clarify the right next step.",
    mentorshipTitle: "Bring your goal. We’ll shape the right next step.",
    introduction: "Share the essentials about your reporting, AI, data, automation, digital product, content operation, team capability, or career goal. Your brief helps make the first conversation focused and useful.",
    startingPointTitle: "A useful starting point",
    startingPointBody: "A business bottleneck, repeated workflow, reporting gap, product idea, or career goal is enough. You do not need a finished technical specification or learning plan.",
    responseTitle: "A considered response",
    responseBody: "The brief is reviewed before the next step is suggested. If the work is not a good fit, that will be made clear as well.",
    successTitle: "Your brief was sent.",
    successBody: "Thank you for sharing the context. BI Solutions Group will review the request and follow up using the email address you provided.",
    returnHome: "Return to the homepage",
    projectFormTitle: "Tell us about the project",
    mentorshipFormTitle: "Tell us about your career goals",
    requiredNote: "Fields marked with an asterisk are required.",
    name: "Name",
    email: "Email",
    workEmail: "Work email",
    company: "Company",
    careerStage: "Current role or career stage",
    careerStagePlaceholder: "For example: entry level, data analyst, BI developer",
    achievement: "What would you like to achieve?",
    selectNeed: "Select the closest option",
    projectDescription: "Project description",
    careerDescription: "Career goals and support needed",
    projectPlaceholder: "What needs to improve, who will use the result, and what would a useful outcome look like?",
    careerPlaceholder: "What is your current experience, where do you want to go next, and what would you like help with?",
    timing: "Desired timing",
    selectTiming: "Select a timeframe",
    budget: "Budget range",
    optional: "optional",
    preferNot: "Prefer not to say",
    consent: "I agree that BI Solutions Group may use this information to respond to my enquiry. See the",
    privacy: "Privacy Policy",
    error: "We could not send your brief. Please wait a moment and try again.",
    sending: "Sending…",
    sendProject: "Send project brief",
    sendMentorship: "Send mentorship enquiry",
    needGroups: {
      "Build or improve": "Build or improve",
      "Training and career development": "Training and career development",
      "Advisory and ongoing support": "Advisory and ongoing support",
      Other: "Other",
    },
    needs: Object.fromEntries(projectNeedOptions.map((option) => [option.value, option.label])),
    timings: Object.fromEntries(projectTimingOptions.map((option) => [option.value, option.label])),
    budgets: Object.fromEntries(budgetOptions.map((option) => [option, option])),
  },
  el: {
    seoTitle: "Ξεκινήστε ένα έργο",
    seoDescription: "Περιγράψτε στη BI Solutions Group την ανάγκη σας για BI, AI, δεδομένα, αυτοματοποίηση, web εφαρμογή ή mentoring και λάβετε μια τεκμηριωμένη πρόταση για το επόμενο βήμα.",
    keywords: ["σύμβουλος Power BI", "σύμβουλος τεχνητής νοημοσύνης", "έργο business intelligence", "σύμβουλος στρατηγικής δεδομένων", "διαχειριζόμενη υποστήριξη analytics", "εταιρική εκπαίδευση AI", "mentoring καριέρας δεδομένων"],
    schemaName: "Ξεκινήστε ένα έργο με τη BI Solutions Group",
    schemaDescription: "Μοιραστείτε με τη BI Solutions Group μια ανάγκη για business intelligence, AI, στρατηγική δεδομένων, αυτοματοποίηση, ψηφιακό προϊόν, content operations, υποστήριξη, εκπαίδευση ή mentoring.",
    projectEyebrow: "Ξεκινήστε ένα έργο",
    mentorshipEyebrow: "Αίτημα mentoring",
    projectTitle: "Φέρτε το πρόβλημα. Θα ξεκαθαρίσουμε το σωστό επόμενο βήμα.",
    mentorshipTitle: "Φέρτε τον στόχο σας. Θα διαμορφώσουμε το σωστό επόμενο βήμα.",
    introduction: "Μοιραστείτε τα βασικά για τις αναφορές, την AI, τα δεδομένα, την αυτοματοποίηση, το ψηφιακό προϊόν, το content operation, τις δυνατότητες της ομάδας ή τον στόχο καριέρας σας. Η σύντομη περιγραφή βοηθά η πρώτη συζήτηση να είναι εστιασμένη και χρήσιμη.",
    startingPointTitle: "Ένα χρήσιμο σημείο εκκίνησης",
    startingPointBody: "Ένα επιχειρηματικό εμπόδιο, μια επαναλαμβανόμενη διαδικασία, ένα κενό στις αναφορές, μια ιδέα προϊόντος ή ένας στόχος καριέρας αρκεί. Δεν χρειάζεστε ολοκληρωμένες τεχνικές προδιαγραφές ή πλάνο μάθησης.",
    responseTitle: "Μια προσεκτικά μελετημένη απάντηση",
    responseBody: "Η περιγραφή εξετάζεται πριν προταθεί το επόμενο βήμα. Αν το έργο δεν ταιριάζει στις υπηρεσίες μας, θα σας το πούμε ξεκάθαρα.",
    successTitle: "Η περιγραφή σας στάλθηκε.",
    successBody: "Ευχαριστούμε για τις πληροφορίες. Η BI Solutions Group θα εξετάσει το αίτημα και θα επικοινωνήσει στη διεύθυνση email που δώσατε.",
    returnHome: "Επιστροφή στην αρχική σελίδα",
    projectFormTitle: "Πείτε μας για το έργο",
    mentorshipFormTitle: "Πείτε μας για τους στόχους καριέρας σας",
    requiredNote: "Τα πεδία με αστερίσκο είναι υποχρεωτικά.",
    name: "Όνομα",
    email: "Email",
    workEmail: "Επαγγελματικό email",
    company: "Εταιρεία",
    careerStage: "Τρέχων ρόλος ή στάδιο καριέρας",
    careerStagePlaceholder: "Για παράδειγμα: αρχικό επίπεδο, data analyst, BI developer",
    achievement: "Τι θα θέλατε να πετύχετε;",
    selectNeed: "Επιλέξτε την πιο κοντινή επιλογή",
    projectDescription: "Περιγραφή έργου",
    careerDescription: "Στόχοι καριέρας και υποστήριξη που χρειάζεστε",
    projectPlaceholder: "Τι χρειάζεται να βελτιωθεί, ποιοι θα χρησιμοποιούν το αποτέλεσμα και πώς θα έμοιαζε ένα χρήσιμο αποτέλεσμα;",
    careerPlaceholder: "Ποια είναι η εμπειρία σας σήμερα, πού θέλετε να φτάσετε και σε τι θα θέλατε βοήθεια;",
    timing: "Επιθυμητό χρονοδιάγραμμα",
    selectTiming: "Επιλέξτε χρονικό ορίζοντα",
    budget: "Εύρος προϋπολογισμού",
    optional: "προαιρετικό",
    preferNot: "Προτιμώ να μην απαντήσω",
    consent: "Συμφωνώ ότι η BI Solutions Group μπορεί να χρησιμοποιήσει αυτές τις πληροφορίες για να απαντήσει στο αίτημά μου. Δείτε την",
    privacy: "Πολιτική απορρήτου",
    error: "Δεν μπορέσαμε να στείλουμε την περιγραφή σας. Περιμένετε λίγο και δοκιμάστε ξανά.",
    sending: "Αποστολή…",
    sendProject: "Αποστολή περιγραφής έργου",
    sendMentorship: "Αποστολή αιτήματος mentoring",
    needGroups: {
      "Build or improve": "Δημιουργία ή βελτίωση",
      "Training and career development": "Εκπαίδευση και ανάπτυξη καριέρας",
      "Advisory and ongoing support": "Συμβουλευτική και συνεχής υποστήριξη",
      Other: "Άλλο",
    },
    needs: {
      "business-intelligence": "Business intelligence και αναφορές",
      "ai-automation": "Ροές AI και αυτοματοποίηση",
      "data-strategy": "Data engineering και υποδομές cloud",
      "web-app": "Ιστότοπος ή web εφαρμογή",
      "content-operations": "Σύστημα περιεχομένου ή ψηφιακό προϊόν",
      "team-enablement": "Εκπαίδευση και ενδυνάμωση ομάδας",
      "career-mentorship": "Ατομικό mentoring καριέρας",
      "advisory-sprint": "Διαγνωστικό ή στρατηγικό sprint",
      "project-implementation": "Έργο υλοποίησης",
      "fractional-leadership": "Fractional ηγεσία δεδομένων και AI",
      "managed-operations": "Διαχειριζόμενη υποστήριξη BI, δεδομένων ή AI",
      "product-walkthrough": "Παρουσίαση προϊόντος",
      "not-sure": "Βοήθεια για να ορίσω τη σωστή προσέγγιση",
    },
    timings: {
      asap: "Το συντομότερο δυνατό",
      "1-3-months": "Σε 1–3 μήνες",
      "3-6-months": "Σε 3–6 μήνες",
      later: "Διερεύνηση για αργότερα",
    },
    budgets: {
      "Not decided yet": "Δεν έχει αποφασιστεί ακόμη",
      "Under €5,000": "Κάτω από €5.000",
      "€5,000–€15,000": "€5.000–€15.000",
      "€15,000–€40,000": "€15.000–€40.000",
      "€40,000+": "€40.000+",
    },
  },
  de: {
    seoTitle: "Projekt starten",
    seoDescription: "Beschreiben Sie BI Solutions Group Ihren Bedarf an BI, KI, Daten, Automatisierung, Webanwendungen oder Mentoring und erhalten Sie einen fundierten nächsten Schritt.",
    keywords: ["Power-BI-Berater beauftragen", "internationaler KI-Berater", "Business-Intelligence-Projekt", "Berater für Datenstrategie", "Managed Analytics Support", "KI-Unternehmenstraining", "Datenkarriere Mentoring"],
    schemaName: "Projekt mit BI Solutions Group starten",
    schemaDescription: "Teilen Sie BI Solutions Group Ihren Bedarf an Business Intelligence, KI, Datenstrategie, Automatisierung, digitalen Produkten, Content Operations, Managed Support, Enablement oder Mentoring mit.",
    projectEyebrow: "Projekt starten",
    mentorshipEyebrow: "Mentoring-Anfrage",
    projectTitle: "Bringen Sie das Problem mit. Wir klären den richtigen nächsten Schritt.",
    mentorshipTitle: "Bringen Sie Ihr Ziel mit. Wir gestalten den richtigen nächsten Schritt.",
    introduction: "Beschreiben Sie die wesentlichen Punkte zu Reporting, KI, Daten, Automatisierung, digitalem Produkt, Content Operations, Teamkompetenzen oder Karriereziel. Ihr Briefing macht das erste Gespräch fokussiert und hilfreich.",
    startingPointTitle: "Ein sinnvoller Ausgangspunkt",
    startingPointBody: "Ein geschäftlicher Engpass, ein wiederkehrender Ablauf, eine Reporting-Lücke, eine Produktidee oder ein Karriereziel genügt. Sie benötigen weder eine fertige technische Spezifikation noch einen vollständigen Lernplan.",
    responseTitle: "Eine fundierte Antwort",
    responseBody: "Das Briefing wird geprüft, bevor der nächste Schritt vorgeschlagen wird. Wenn die Aufgabe nicht zu uns passt, sagen wir das ebenfalls klar.",
    successTitle: "Ihr Briefing wurde gesendet.",
    successBody: "Vielen Dank für den Kontext. BI Solutions Group prüft die Anfrage und meldet sich über die von Ihnen angegebene E-Mail-Adresse.",
    returnHome: "Zurück zur Startseite",
    projectFormTitle: "Erzählen Sie uns von Ihrem Projekt",
    mentorshipFormTitle: "Erzählen Sie uns von Ihren Karrierezielen",
    requiredNote: "Mit einem Sternchen markierte Felder sind Pflichtfelder.",
    name: "Name",
    email: "E-Mail",
    workEmail: "Geschäftliche E-Mail",
    company: "Unternehmen",
    careerStage: "Aktuelle Rolle oder Karrierestufe",
    careerStagePlaceholder: "Zum Beispiel: Berufseinstieg, Data Analyst, BI Developer",
    achievement: "Was möchten Sie erreichen?",
    selectNeed: "Wählen Sie die passendste Option",
    projectDescription: "Projektbeschreibung",
    careerDescription: "Karriereziele und benötigte Unterstützung",
    projectPlaceholder: "Was soll verbessert werden, wer wird das Ergebnis nutzen und wie sähe ein hilfreiches Ergebnis aus?",
    careerPlaceholder: "Welche Erfahrung haben Sie, wohin möchten Sie sich entwickeln und wobei wünschen Sie Unterstützung?",
    timing: "Gewünschter Zeitrahmen",
    selectTiming: "Zeitrahmen auswählen",
    budget: "Budgetrahmen",
    optional: "optional",
    preferNot: "Keine Angabe",
    consent: "Ich stimme zu, dass BI Solutions Group diese Informationen zur Beantwortung meiner Anfrage verwenden darf. Siehe",
    privacy: "Datenschutzerklärung",
    error: "Ihr Briefing konnte nicht gesendet werden. Bitte warten Sie einen Moment und versuchen Sie es erneut.",
    sending: "Wird gesendet…",
    sendProject: "Projektbriefing senden",
    sendMentorship: "Mentoring-Anfrage senden",
    needGroups: {
      "Build or improve": "Aufbauen oder verbessern",
      "Training and career development": "Training und Karriereentwicklung",
      "Advisory and ongoing support": "Beratung und laufende Unterstützung",
      Other: "Sonstiges",
    },
    needs: {
      "business-intelligence": "Business Intelligence und Reporting",
      "ai-automation": "KI-Workflows und Automatisierung",
      "data-strategy": "Data Engineering und Cloud-Grundlagen",
      "web-app": "Website oder Webanwendung",
      "content-operations": "Content-System oder digitales Produkt",
      "team-enablement": "Teamtraining und Enablement",
      "career-mentorship": "Individuelles Karriere-Mentoring",
      "advisory-sprint": "Diagnose- oder Roadmap-Sprint",
      "project-implementation": "Umsetzungsprojekt",
      "fractional-leadership": "Fractional Data & AI Leadership",
      "managed-operations": "Managed Support für BI, Daten oder KI",
      "product-walkthrough": "Produktvorstellung",
      "not-sure": "Hilfe bei der Wahl des richtigen Ansatzes",
    },
    timings: {
      asap: "So bald wie möglich",
      "1-3-months": "In 1–3 Monaten",
      "3-6-months": "In 3–6 Monaten",
      later: "Erst einmal sondieren",
    },
    budgets: {
      "Not decided yet": "Noch nicht entschieden",
      "Under €5,000": "Unter 5.000 €",
      "€5,000–€15,000": "5.000–15.000 €",
      "€15,000–€40,000": "15.000–40.000 €",
      "€40,000+": "40.000 €+",
    },
  },
};

export default function StartProject() {
  const { locale } = useLocale();
  const copy = startProjectCopy[locale];
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: copy.schemaName,
    url: `https://www.bisolutions.group${localePrefix(locale)}/start-a-project`,
    description: copy.schemaDescription,
    inLanguage: LOCALE_TAGS[locale],
  }), [copy.schemaDescription, copy.schemaName, locale]);
  const [form, setForm] = useState<FormValues>(initialFormValues);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const hasTrackedStart = useRef(false);
  const hasTrackedValidationError = useRef(false);
  const attribution = useRef({ source: "direct", context: "start-project-page" });
  const isMentorship = form.need === "career-mentorship";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service")?.trim().toLowerCase() || "";
    const product = params.get("product")?.trim().toLowerCase() || "";
    const demo = params.get("demo")?.trim().toLowerCase() || "";
    const article = params.get("article")?.trim() || "";
    const matchingNeed = resolveProjectNeed(
      params.get("need") ||
        serviceNeedMap[service] ||
        (product ? "product-walkthrough" : ""),
    );
    const matchingTiming = resolveProjectTiming(params.get("timing"));

    if (matchingNeed || matchingTiming) {
      setForm((current) => ({
        ...current,
        need: matchingNeed?.value ?? current.need,
        timing: matchingTiming?.label ?? current.timing,
      }));
    }

    let referrer = "direct";
    if (document.referrer) {
      try {
        referrer = new URL(document.referrer).hostname;
      } catch {
        referrer = "referral";
      }
    }

    const contextParts = [
      service && `service:${service}`,
      product && `product:${product}`,
      demo && `demo:${demo}`,
      article && `article:${article}`,
    ].filter(Boolean);

    attribution.current = {
      source: (params.get("source")?.trim() || referrer).slice(0, 200),
      context: (
        params.get("context")?.trim() ||
        contextParts.join(" | ") ||
        "start-project-page"
      ).slice(0, 300),
    };
  }, []);

  const updateField = <Field extends keyof FormValues>(
    field: Field,
    value: FormValues[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const trackFormStart = () => {
    if (hasTrackedStart.current) return;
    hasTrackedStart.current = true;
    trackEvent("contact_form_start", {
      source: attribution.current.source,
      context: attribution.current.context,
      selected_need: form.need || undefined,
    });
  };

  const handleInvalid = () => {
    if (hasTrackedValidationError.current) return;
    hasTrackedValidationError.current = true;
    trackEvent("contact_form_error", {
      reason: "validation",
      selected_need: form.need || undefined,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    hasTrackedValidationError.current = false;

    const selectedNeed =
      projectNeedOptions.find((option) => option.value === form.need)?.label ??
      form.need;
    const message = [
      `Company or career stage: ${form.company}`,
      `Enquiry type: ${selectedNeed}`,
      `Desired timing: ${form.timing}`,
      isMentorship
        ? "Budget range: Not requested"
        : `Budget range: ${form.budget || "Not provided"}`,
      "Privacy consent: Yes",
      "",
      "Enquiry details:",
      form.description,
      "",
      "Submission context:",
      `Source: ${attribution.current.source}`,
      `Context: ${attribution.current.context}`,
      `Page: ${window.location.pathname}`,
    ].join("\n");

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `New enquiry — ${selectedNeed}`,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Contact request failed with status ${response.status}`);
      }

      setStatus("success");
      trackLeadConversion();
      trackEvent("contact_form_submit", {
        selected_need: form.need,
        desired_timing: form.timing,
        budget_range: isMentorship
          ? "not_requested"
          : form.budget || "not_provided",
        source: attribution.current.source,
        context: attribution.current.context,
      });
    } catch (error) {
      console.error("Unable to submit project enquiry:", error);
      setStatus("error");
      trackEvent("contact_form_error", {
        reason: "submission",
        selected_need: form.need,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/start-a-project"
        keywords={copy.keywords}
        structuredData={structuredData}
      />
      <Navbar />

      <main className="relative overflow-hidden pb-24 pt-32 md:pb-32 md:pt-40">
        <div className="bi-hero-backdrop pointer-events-none absolute inset-x-0 top-0 h-[34rem]" />
        <div className="site-container relative grid gap-12 px-6 md:px-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <section className="lg:sticky lg:top-36 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              {isMentorship ? copy.mentorshipEyebrow : copy.projectEyebrow}
            </p>
            <h1 className="mt-6 max-w-xl text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              {isMentorship
                ? copy.mentorshipTitle
                : copy.projectTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
              {copy.introduction}
            </p>

            <div className="mt-10 space-y-4">
              <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm shadow-black/[0.03] backdrop-blur-sm">
                <h2 className="text-base font-semibold">{copy.startingPointTitle}</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {copy.startingPointBody}
                </p>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm shadow-black/[0.03] backdrop-blur-sm">
                <h2 className="text-base font-semibold">{copy.responseTitle}</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {copy.responseBody}
                </p>
              </div>
            </div>

          </section>

          <section
            aria-labelledby="project-form-title"
            className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-2xl shadow-black/[0.06] sm:p-8 lg:p-10"
          >
            {status === "success" ? (
              <div
                className="flex min-h-[36rem] flex-col items-start justify-center"
                role="status"
                aria-live="polite"
              >
                <h2 className="text-3xl sm:text-4xl">{copy.successTitle}</h2>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-600">
                  {copy.successBody}
                </p>
                <Button asChild variant="outline" className="mt-8 h-11 rounded-full px-6">
                  <Link href="/">{copy.returnHome}</Link>
                </Button>
              </div>
            ) : (
              <>
                <h2 id="project-form-title" className="text-2xl sm:text-3xl">
                  {isMentorship
                    ? copy.mentorshipFormTitle
                    : copy.projectFormTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {copy.requiredNote}
                </p>

                <form
                  className="mt-8 space-y-6"
                  onFocusCapture={trackFormStart}
                  onInvalidCapture={handleInvalid}
                  onSubmit={handleSubmit}
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="text-sm font-medium text-gray-800">
                      {copy.name} <span aria-hidden="true">*</span>
                      <input
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        maxLength={200}
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        className={fieldClassName}
                      />
                    </label>
                    <label className="text-sm font-medium text-gray-800">
                      {isMentorship ? copy.email : copy.workEmail}{" "}
                      <span aria-hidden="true">*</span>
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        value={form.email}
                        onChange={(event) => updateField("email", event.target.value)}
                        className={fieldClassName}
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-medium text-gray-800">
                    {isMentorship ? copy.careerStage : copy.company}{" "}
                    <span aria-hidden="true">*</span>
                    <input
                      name="company"
                      type="text"
                      autoComplete={isMentorship ? "off" : "organization"}
                      required
                      maxLength={200}
                      value={form.company}
                      onChange={(event) => updateField("company", event.target.value)}
                      placeholder={
                        isMentorship
                          ? copy.careerStagePlaceholder
                          : undefined
                      }
                      className={fieldClassName}
                    />
                  </label>

                  <label className="block text-sm font-medium text-gray-800">
                    {copy.achievement} <span aria-hidden="true">*</span>
                    <select
                      name="need"
                      required
                      value={form.need}
                      onChange={(event) => updateField("need", event.target.value)}
                      className={fieldClassName}
                    >
                      <option value="" disabled>
                        {copy.selectNeed}
                      </option>
                      {projectNeedGroups.map((group) => (
                        <optgroup key={group.label} label={copy.needGroups[group.label]}>
                          {group.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {copy.needs[option.value]}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-gray-800">
                    {isMentorship ? copy.careerDescription : copy.projectDescription}{" "}
                    <span aria-hidden="true">*</span>
                    <textarea
                      name="description"
                      required
                      rows={7}
                      maxLength={3000}
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      placeholder={
                        isMentorship
                          ? copy.careerPlaceholder
                          : copy.projectPlaceholder
                      }
                      className={`${fieldClassName} min-h-44 resize-y py-3 leading-relaxed`}
                    />
                  </label>

                  <div
                    className={`grid gap-6 ${isMentorship ? "" : "sm:grid-cols-2"}`}
                  >
                    <label className="text-sm font-medium text-gray-800">
                      {copy.timing} <span aria-hidden="true">*</span>
                      <select
                        name="timing"
                        required
                        value={form.timing}
                        onChange={(event) =>
                          updateField("timing", event.target.value)
                        }
                        className={fieldClassName}
                      >
                        <option value="" disabled>
                          {copy.selectTiming}
                        </option>
                        {projectTimingOptions.map((option) => (
                          <option key={option.value} value={option.label}>
                            {copy.timings[option.value]}
                          </option>
                        ))}
                      </select>
                    </label>
                    {!isMentorship && (
                      <label className="text-sm font-medium text-gray-800">
                        {copy.budget} <span className="text-gray-400">({copy.optional})</span>
                        <select
                          name="budget"
                          value={form.budget}
                          onChange={(event) =>
                            updateField("budget", event.target.value)
                          }
                          className={fieldClassName}
                        >
                          <option value="">{copy.preferNot}</option>
                          {budgetOptions.map((option) => (
                            <option key={option} value={option}>
                              {copy.budgets[option]}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
                    <input
                      name="consent"
                      type="checkbox"
                      required
                      checked={form.consent}
                      onChange={(event) =>
                        updateField("consent", event.target.checked)
                      }
                      className="mt-1 h-4 w-4 shrink-0 accent-black"
                    />
                    <span>
                      {copy.consent}{" "}
                      <Link
                        href="/privacy-policy"
                        className="font-medium text-black underline decoration-black/20 underline-offset-4 hover:decoration-black"
                      >
                        {copy.privacy}
                      </Link>
                      .
                    </span>
                  </label>

                  {status === "error" ? (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-900"
                    >
                      {copy.error}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={status === "submitting"}
                    className="h-12 w-full rounded-full text-base sm:w-auto sm:px-7"
                  >
                    {status === "submitting"
                      ? copy.sending
                      : isMentorship
                        ? copy.sendMentorship
                        : copy.sendProject}
                    {status !== "submitting" ? (
                      <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                    ) : null}
                  </Button>
                </form>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
