import type { Locale } from "./config";

/**
 * Translated UI copy. Keys missing from a locale fall back to English, so a
 * partially translated locale degrades to English rather than showing blanks.
 *
 * Long-form content (blog posts, service detail pages, legal pages) is not
 * covered here — those live in their own data modules and are still English.
 */
export interface TranslationCatalogue {
  home: {
    seoTitle: string;
    seoDescription: string;
  };
  nav: {
    services: string;
    caseStudies: string;
    insights: string;
    about: string;
    startProject: string;
    language: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    needLabel: string;
    timingLabel: string;
    submit: string;
    scroll: string;
    needs: Record<string, string>;
    timings: Record<string, string>;
  };
  services: {
    eyebrow: string;
    heading: string;
    seeAll: string;
    explore: string;
    items: Record<string, { title: string; description: string }>;
  };
  footer: {
    tagline: string;
    company: string;
    services: string;
    resources: string;
    servicesOverview: string;
    insights: string;
    privacy: string;
    terms: string;
    backToTop: string;
    rights: string;
  };
}

const en: TranslationCatalogue = {
  home: {
    seoTitle: "AI, BI & Web App Development",
    seoDescription:
      "BI Solutions Group helps organizations worldwide build BI dashboards, analytics systems, AI workflows, data strategies, modern web applications, and stronger data careers through personalized mentorship.",
  },
  nav: {
    services: "Services",
    caseStudies: "Case Studies",
    insights: "Insights",
    about: "About",
    startProject: "Start a project",
    language: "Language",
  },
  hero: {
    eyebrow: "Senior-led delivery · International",
    title: "Clarity from complexity",
    subtitle:
      "Business intelligence, AI, data foundations, and web applications — from strategy through to a handoff your team can keep running.",
    needLabel: "I need",
    timingLabel: "Timeline",
    submit: "Start a project",
    scroll: "Scroll",
    needs: {
      "business-intelligence": "BI dashboards & reporting",
      "ai-automation": "AI workflows & automation",
      "data-strategy": "Data strategy & cloud",
      "web-app": "A website or web app",
      "career-mentorship": "Data career mentorship",
      "not-sure": "Not sure yet",
    },
    timings: {
      asap: "As soon as practical",
      "1-3-months": "Within 1–3 months",
      "3-6-months": "Within 3–6 months",
      later: "Exploring for later",
    },
  },
  services: {
    eyebrow: "What we do",
    heading:
      "Five ways to build better systems, decisions, and data careers.",
    seeAll: "See all services",
    explore: "Explore",
    items: {
      "data-career-enablement-mentorship": {
        title: "Enablement & mentorship",
        description:
          "Personalized one-to-one guidance for people entering or advancing in data, BI, analytics, and AI careers.",
      },
    },
  },
  footer: {
    tagline:
      "Business intelligence, AI workflows, data strategy, focused web apps, and data career mentorship for practical progress at every level.",
    company: "Company",
    services: "Services",
    resources: "Resources",
    servicesOverview: "Services overview",
    insights: "Insights",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    backToTop: "Back to top",
    rights: "All rights reserved.",
  },
};

const el: TranslationCatalogue = {
  home: {
    seoTitle: "Ανάπτυξη AI, BI & Web εφαρμογών",
    seoDescription:
      "Η BI Solutions Group βοηθά οργανισμούς διεθνώς να δημιουργήσουν dashboards BI, συστήματα ανάλυσης, ροές AI, στρατηγική δεδομένων και web εφαρμογές, ενώ προσφέρει εξατομικευμένο mentoring για καριέρα στα data.",
  },
  nav: {
    services: "Υπηρεσίες",
    caseStudies: "Μελέτες περίπτωσης",
    insights: "Άρθρα",
    about: "Σχετικά",
    startProject: "Ξεκινήστε έργο",
    language: "Γλώσσα",
  },
  hero: {
    eyebrow: "Υλοποίηση από senior σύμβουλο · Διεθνώς",
    title: "Καθαρή εικόνα μέσα από την πολυπλοκότητα",
    subtitle:
      "Business intelligence, τεχνητή νοημοσύνη, υποδομές δεδομένων και web εφαρμογές — από τη στρατηγική μέχρι την παράδοση που η ομάδα σας μπορεί να συντηρεί.",
    needLabel: "Χρειάζομαι",
    timingLabel: "Χρονοδιάγραμμα",
    submit: "Ξεκινήστε έργο",
    scroll: "Κύλιση",
    needs: {
      "business-intelligence": "Dashboards & αναφορές BI",
      "ai-automation": "Ροές AI & αυτοματοποίηση",
      "data-strategy": "Στρατηγική δεδομένων & cloud",
      "web-app": "Ιστοσελίδα ή web εφαρμογή",
      "career-mentorship": "Mentoring για καριέρα στα data",
      "not-sure": "Δεν είμαι σίγουρος ακόμη",
    },
    timings: {
      asap: "Το συντομότερο δυνατό",
      "1-3-months": "Σε 1–3 μήνες",
      "3-6-months": "Σε 3–6 μήνες",
      later: "Διερεύνηση για αργότερα",
    },
  },
  services: {
    eyebrow: "Τι κάνουμε",
    heading:
      "Πέντε τρόποι για καλύτερα συστήματα, αποφάσεις και καριέρες στα data.",
    seeAll: "Δείτε όλες τις υπηρεσίες",
    explore: "Περισσότερα",
    items: {
      "business-intelligence-semantic-modeling": {
        title: "Business intelligence",
        description:
          "Σχεδιάζουμε επίπεδα αναφορών, σημασιολογικά μοντέλα και δομές διακυβέρνησης ώστε τα dashboards να είναι αξιόπιστα και εύκολα στη συντήρηση.",
      },
      "advanced-analytics-ai": {
        title: "Συμβουλευτική AI",
        description:
          "Σχεδιάζουμε και υλοποιούμε προβλεπτικές και AI ροές εργασίας που περνούν από το πείραμα στην καθημερινή λειτουργία.",
      },
      "data-strategy-governance": {
        title: "Υποδομές δεδομένων",
        description:
          "Θέτουμε την αρχιτεκτονική, την ποιότητα, την πρόσβαση και τη διακυβέρνηση ώστε η ανάλυση και η AI να κλιμακώνονται με έλεγχο.",
      },
      "website-app-development": {
        title: "Ανάπτυξη web",
        description:
          "Φτιάχνουμε σύγχρονα sites και στοχευμένες web εφαρμογές που συνδέουν δεδομένα, αυτοματισμό και καθαρή εμπειρία χρήσης.",
      },
      "data-career-enablement-mentorship": {
        title: "Εξέλιξη & mentoring",
        description:
          "Εξατομικευμένη καθοδήγηση για όσους ξεκινούν ή εξελίσσονται σε καριέρες data, BI, analytics και AI.",
      },
    },
  },
  footer: {
    tagline:
      "Business intelligence, ροές AI, στρατηγική δεδομένων, στοχευμένες web εφαρμογές και mentoring για πρακτική επαγγελματική εξέλιξη στα data.",
    company: "Εταιρεία",
    services: "Υπηρεσίες",
    resources: "Πόροι",
    servicesOverview: "Επισκόπηση υπηρεσιών",
    insights: "Άρθρα",
    privacy: "Πολιτική απορρήτου",
    terms: "Όροι χρήσης",
    backToTop: "Επιστροφή στην κορυφή",
    rights: "Με επιφύλαξη παντός δικαιώματος.",
  },
};

const de: TranslationCatalogue = {
  home: {
    seoTitle: "KI-, BI- & Web-App-Entwicklung",
    seoDescription:
      "BI Solutions Group unterstützt Unternehmen weltweit mit BI-Dashboards, Analysesystemen, KI-Workflows, Datenstrategien und Webanwendungen sowie Fachkräfte mit persönlichem Mentoring für Datenkarrieren.",
  },
  nav: {
    services: "Leistungen",
    caseStudies: "Fallstudien",
    insights: "Insights",
    about: "Über uns",
    startProject: "Projekt starten",
    language: "Sprache",
  },
  hero: {
    eyebrow: "Beratung durch Senior-Experten · International",
    title: "Klarheit statt Komplexität",
    subtitle:
      "Business Intelligence, KI, Datenfundamente und Webanwendungen — von der Strategie bis zur Übergabe, die Ihr Team selbst weiterführen kann.",
    needLabel: "Ich brauche",
    timingLabel: "Zeitrahmen",
    submit: "Projekt starten",
    scroll: "Scrollen",
    needs: {
      "business-intelligence": "BI-Dashboards & Reporting",
      "ai-automation": "KI-Workflows & Automatisierung",
      "data-strategy": "Datenstrategie & Cloud",
      "web-app": "Website oder Webanwendung",
      "career-mentorship": "Mentoring für die Datenkarriere",
      "not-sure": "Noch unklar",
    },
    timings: {
      asap: "So bald wie möglich",
      "1-3-months": "In 1–3 Monaten",
      "3-6-months": "In 3–6 Monaten",
      later: "Erst einmal sondieren",
    },
  },
  services: {
    eyebrow: "Was wir tun",
    heading:
      "Fünf Wege zu besseren Systemen, Entscheidungen und Datenkarrieren.",
    seeAll: "Alle Leistungen ansehen",
    explore: "Mehr erfahren",
    items: {
      "business-intelligence-semantic-modeling": {
        title: "Business Intelligence",
        description:
          "Wir gestalten Reporting-Schichten, semantische Modelle und Governance-Strukturen, damit Dashboards verlässlich und wartbar bleiben.",
      },
      "advanced-analytics-ai": {
        title: "KI-Beratung",
        description:
          "Wir entwickeln prädiktive und KI-gestützte Workflows, die vom Experiment in den produktiven Betrieb übergehen.",
      },
      "data-strategy-governance": {
        title: "Datenfundamente",
        description:
          "Wir legen Architektur, Qualität, Zugriff und Governance fest, damit Analytics und KI kontrolliert skalieren.",
      },
      "website-app-development": {
        title: "Webentwicklung",
        description:
          "Wir bauen moderne Websites und fokussierte Webanwendungen, die Daten, Automatisierung und klare Bedienung verbinden.",
      },
      "data-career-enablement-mentorship": {
        title: "Entwicklung & Mentoring",
        description:
          "Persönliche Begleitung für Menschen, die in Daten-, BI-, Analytics- und KI-Berufe einsteigen oder sich darin weiterentwickeln.",
      },
    },
  },
  footer: {
    tagline:
      "Business Intelligence, KI-Workflows, Datenstrategie, fokussierte Webanwendungen und Mentoring für praktische Entwicklung in Datenberufen.",
    company: "Unternehmen",
    services: "Leistungen",
    resources: "Ressourcen",
    servicesOverview: "Leistungsübersicht",
    insights: "Insights",
    privacy: "Datenschutzerklärung",
    terms: "Nutzungsbedingungen",
    backToTop: "Nach oben",
    rights: "Alle Rechte vorbehalten.",
  },
};

export const catalogues: Record<Locale, TranslationCatalogue> = { en, el, de };

/**
 * Routes with genuine translated content. Only these advertise hreflang
 * alternates — pointing search engines at untranslated duplicates hurts more
 * than it helps.
 */
export const TRANSLATED_ROUTES = new Set(["/"]);
