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
      "BI Solutions Group helps organizations worldwide build BI, AI, data, web, content operations, digital products, managed support models, and practical capability through training and mentorship.",
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
      "Business intelligence, AI, data foundations, web applications, and content operations — from strategy through to a handoff your team can keep running.",
    needLabel: "I want to",
    timingLabel: "Timeline",
    submit: "Start a project",
    scroll: "Scroll",
    needs: {
      "business-intelligence": "See and understand my data",
      "ai-automation": "Automate a workflow with AI",
      "data-strategy": "Build a reliable data foundation",
      "web-app": "Launch a website or web app",
      "content-operations": "Scale content or a digital product",
      "team-enablement": "Upskill my team",
      "career-mentorship": "Grow my data or AI career",
      "not-sure": "Clarify what I need",
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
      "Six ways to build better systems, decisions, products, and capabilities.",
    seeAll: "See all services",
    explore: "Explore",
    items: {
      "content-operations-automation": {
        title: "Content operations & digital products",
        description:
          "AI-assisted systems for content repurposing, editorial workflows, coordinated distribution, and specialized digital products.",
      },
      "data-career-enablement-mentorship": {
        title: "Enablement & mentorship",
        description:
          "Role-based team workshops, practical training, adoption support, and personalized career mentorship.",
      },
    },
  },
  footer: {
    tagline:
      "Business intelligence, AI, data foundations, web applications, content operations, managed support, enablement, and mentorship for practical progress.",
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
      "Η BI Solutions Group βοηθά οργανισμούς διεθνώς με BI, AI, υποδομές δεδομένων, web εφαρμογές, content operations, ψηφιακά προϊόντα, διαχειριζόμενη υποστήριξη, εκπαίδευση και mentoring.",
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
      "Business intelligence, τεχνητή νοημοσύνη, υποδομές δεδομένων, web εφαρμογές και content operations — από τη στρατηγική μέχρι την παράδοση που η ομάδα σας μπορεί να συντηρεί.",
    needLabel: "Θέλω να",
    timingLabel: "Χρονοδιάγραμμα",
    submit: "Ξεκινήστε έργο",
    scroll: "Κύλιση",
    needs: {
      "business-intelligence": "Κατανοήσω καλύτερα τα δεδομένα μου",
      "ai-automation": "Αυτοματοποιήσω μια διαδικασία με AI",
      "data-strategy": "Δημιουργήσω αξιόπιστη βάση δεδομένων",
      "web-app": "Δημιουργήσω site ή web εφαρμογή",
      "content-operations": "Κλιμακώσω περιεχόμενο ή ψηφιακό προϊόν",
      "team-enablement": "Αναβαθμίσω τις δεξιότητες της ομάδας μου",
      "career-mentorship": "Εξελίξω την καριέρα μου σε data ή AI",
      "not-sure": "Ξεκαθαρίσω τι χρειάζομαι",
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
      "Έξι τρόποι για καλύτερα συστήματα, αποφάσεις, προϊόντα και δεξιότητες.",
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
      "content-operations-automation": {
        title: "Content operations & ψηφιακά προϊόντα",
        description:
          "Συστήματα με υποστήριξη AI για επαναχρησιμοποίηση περιεχομένου, ροές έγκρισης, συντονισμένη διανομή και εξειδικευμένα ψηφιακά προϊόντα.",
      },
      "data-career-enablement-mentorship": {
        title: "Εκπαίδευση & mentoring",
        description:
          "Εκπαίδευση ομάδων ανά ρόλο, πρακτικά workshops, υποστήριξη υιοθέτησης και εξατομικευμένο mentoring καριέρας.",
      },
    },
  },
  footer: {
    tagline:
      "Business intelligence, AI, υποδομές δεδομένων, web εφαρμογές, content operations, διαχειριζόμενη υποστήριξη, εκπαίδευση και mentoring.",
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
      "BI Solutions Group unterstützt Unternehmen weltweit mit BI, KI, Datenfundamenten, Webanwendungen, Content Operations, digitalen Produkten, Managed Support, Training und Mentoring.",
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
      "Business Intelligence, KI, Datenfundamente, Webanwendungen und Content Operations — von der Strategie bis zur Übergabe, die Ihr Team selbst weiterführen kann.",
    needLabel: "Ich möchte",
    timingLabel: "Zeitrahmen",
    submit: "Projekt starten",
    scroll: "Scrollen",
    needs: {
      "business-intelligence": "Meine Daten besser verstehen",
      "ai-automation": "Einen Prozess mit KI automatisieren",
      "data-strategy": "Eine verlässliche Datenbasis schaffen",
      "web-app": "Eine Website oder Web-App starten",
      "content-operations": "Content oder ein digitales Produkt skalieren",
      "team-enablement": "Mein Team weiterbilden",
      "career-mentorship": "Meine Daten- oder KI-Karriere entwickeln",
      "not-sure": "Klären, was ich brauche",
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
      "Sechs Wege zu besseren Systemen, Entscheidungen, Produkten und Fähigkeiten.",
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
      "content-operations-automation": {
        title: "Content Operations & digitale Produkte",
        description:
          "KI-gestützte Systeme für Content-Repurposing, redaktionelle Abläufe, koordinierte Distribution und spezialisierte digitale Produkte.",
      },
      "data-career-enablement-mentorship": {
        title: "Enablement & Mentoring",
        description:
          "Rollenbasierte Team-Workshops, praxisnahes Training, Adoptionsbegleitung und persönliches Karriere-Mentoring.",
      },
    },
  },
  footer: {
    tagline:
      "Business Intelligence, KI, Datenfundamente, Webanwendungen, Content Operations, Managed Support, Enablement und Mentoring.",
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
