import type { Locale } from "./config";

/**
 * Translated UI copy. Keys missing from a locale fall back to English, so a
 * partially translated locale degrades to English rather than showing blanks.
 *
 * Shared component copy lives here. Page-specific and long-form copy is
 * generated into pageTranslations.generated.ts from its English source.
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
    contact: string;
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
    cookieSettings: string;
    backToTop: string;
    rights: string;
  };
}

const en: TranslationCatalogue = {
  home: {
    seoTitle: "AI, BI & Web App Development",
    seoDescription:
      "Data, Analytics & AI consulting from Greece: strategy, engineering, automation, web development, content operations and training for international teams.",
  },
  nav: {
    services: "Services",
    caseStudies: "Case Studies",
    insights: "Insights",
    about: "About",
    startProject: "Start a project",
    contact: "Contact",
    language: "Language",
  },
  hero: {
    eyebrow: "Senior-led delivery · International",
    title: "Better reporting. Practical AI. Systems that last.",
    subtitle:
      "Power BI consulting, AI automation, and data engineering for US and international teams. Work directly with a senior consultant, from a clear scope to a documented handoff.",
    needLabel: "I want to",
    timingLabel: "Timeline",
    submit: "Start a project",
    scroll: "Scroll",
    needs: {
      "business-intelligence": "See and understand my data",
      "ai-automation": "Automate a workflow with AI",
      "data-strategy": "Build a reliable data foundation",
      "web-app": "Launch a website, web app, or improve search visibility",
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
      "Business intelligence, AI, data foundations, web applications, search visibility, content operations, managed support, enablement, and mentorship for practical progress.",
    company: "Company",
    services: "Services",
    resources: "Resources",
    servicesOverview: "Services overview",
    insights: "Insights",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookieSettings: "Cookie settings",
    backToTop: "Back to top",
    rights: "All rights reserved.",
  },
};

const el: TranslationCatalogue = {
  home: {
    seoTitle: "AI, BI και ανάπτυξη διαδικτυακών εφαρμογών",
    seoDescription:
      "Συμβουλευτική δεδομένων και AI από την Ελλάδα: BI, αυτοματισμοί, ανάπτυξη ιστοσελίδων, διαχείριση περιεχομένου και εκπαίδευση για διεθνείς ομάδες.",
  },
  nav: {
    services: "Υπηρεσίες",
    caseStudies: "Μελέτες περίπτωσης",
    insights: "Άρθρα",
    about: "Σχετικά",
    startProject: "Ξεκινήστε ένα έργο",
    contact: "Επικοινωνία",
    language: "Γλώσσα",
  },
  hero: {
    eyebrow: "Υλοποίηση από έμπειρο σύμβουλο · Διεθνώς",
    title: "Καθαρή εικόνα μέσα από την πολυπλοκότητα",
    subtitle:
      "Επιχειρηματική ευφυΐα, τεχνητή νοημοσύνη, υποδομές δεδομένων, διαδικτυακές εφαρμογές και διαχείριση περιεχομένου, από τη στρατηγική έως μια λύση που η ομάδα σας μπορεί να συντηρεί.",
    needLabel: "Θέλω να",
    timingLabel: "Χρονοδιάγραμμα",
    submit: "Ξεκινήστε ένα έργο",
    scroll: "Κύλιση",
    needs: {
      "business-intelligence": "Κατανοήσω καλύτερα τα δεδομένα μου",
      "ai-automation": "Αυτοματοποιήσω μια διαδικασία με AI",
      "data-strategy": "Δημιουργήσω αξιόπιστη υποδομή δεδομένων",
      "web-app": "Δημιουργήσω ιστοσελίδα ή εφαρμογή ή βελτιώσω την προβολή στην αναζήτηση",
      "content-operations": "Αναπτύξω το περιεχόμενο ή ένα ψηφιακό προϊόν",
      "team-enablement": "Αναβαθμίσω τις δεξιότητες της ομάδας μου",
      "career-mentorship": "Εξελίξω την καριέρα μου στα δεδομένα ή την AI",
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
        title: "Επιχειρηματική ευφυΐα",
        description:
          "Σχεδιάζουμε επίπεδα αναφορών, σημασιολογικά μοντέλα και δομές διακυβέρνησης ώστε τα dashboards να είναι αξιόπιστα και εύκολα στη συντήρηση.",
      },
      "advanced-analytics-ai": {
        title: "Συμβουλευτική AI",
        description:
          "Σχεδιάζουμε και υλοποιούμε ροές προγνωστικής ανάλυσης και AI που περνούν από το πείραμα στην καθημερινή λειτουργία.",
      },
      "data-strategy-governance": {
        title: "Υποδομές δεδομένων",
        description:
          "Θέτουμε την αρχιτεκτονική, την ποιότητα, την πρόσβαση και τη διακυβέρνηση ώστε η ανάλυση και η AI να κλιμακώνονται με έλεγχο.",
      },
      "website-app-development": {
        title: "Ιστοσελίδες και προβολή στην αναζήτηση",
        description:
          "Δημιουργούμε γρήγορες, προσβάσιμες ιστοσελίδες και διαδικτυακές εφαρμογές με τεχνικό SEO, οργανωμένο περιεχόμενο και μέτρηση απόδοσης για προβολή στην Google και στις απαντήσεις AI.",
      },
      "content-operations-automation": {
        title: "Διαχείριση περιεχομένου και ψηφιακά προϊόντα",
        description:
          "Συστήματα με υποστήριξη AI για επαναχρησιμοποίηση περιεχομένου, ροές έγκρισης, συντονισμένη διανομή και εξειδικευμένα ψηφιακά προϊόντα.",
      },
      "data-career-enablement-mentorship": {
        title: "Εκπαίδευση και επαγγελματική καθοδήγηση",
        description:
          "Εκπαίδευση ομάδων ανά ρόλο, πρακτικά εργαστήρια, υποστήριξη στην υιοθέτηση νέων εργαλείων και εξατομικευμένη επαγγελματική καθοδήγηση.",
      },
    },
  },
  footer: {
    tagline:
      "Επιχειρηματική ευφυΐα, AI, υποδομές δεδομένων, διαδικτυακές εφαρμογές, προβολή στην αναζήτηση, διαχείριση περιεχομένου, συνεχής υποστήριξη, εκπαίδευση και επαγγελματική καθοδήγηση.",
    company: "Εταιρεία",
    services: "Υπηρεσίες",
    resources: "Πόροι",
    servicesOverview: "Επισκόπηση υπηρεσιών",
    insights: "Άρθρα",
    privacy: "Πολιτική απορρήτου",
    terms: "Όροι χρήσης",
    cookieSettings: "Ρυθμίσεις cookies",
    backToTop: "Επιστροφή στην κορυφή",
    rights: "Με επιφύλαξη παντός δικαιώματος.",
  },
};

const de: TranslationCatalogue = {
  home: {
    seoTitle: "KI-, BI- & Web-App-Entwicklung",
    seoDescription:
      "Daten-, Analytics- und KI-Beratung aus Griechenland: Strategie, Data Engineering, Automatisierung, Webentwicklung, Content und Schulungen für internationale Teams.",
  },
  nav: {
    services: "Leistungen",
    caseStudies: "Fallstudien",
    insights: "Einblicke",
    about: "Über uns",
    startProject: "Projekt starten",
    contact: "Kontakt",
    language: "Sprache",
  },
  hero: {
    eyebrow: "Umsetzung durch Senior-Berater · International",
    title: "Klarheit statt Komplexität",
    subtitle:
      "Business Intelligence, KI, Datengrundlagen, Webanwendungen und Content-Prozesse: von der Strategie bis zu einer Lösung, die Ihr Team selbst warten und weiterentwickeln kann.",
    needLabel: "Ich möchte",
    timingLabel: "Zeitrahmen",
    submit: "Projekt starten",
    scroll: "Scrollen",
    needs: {
      "business-intelligence": "Meine Daten besser verstehen",
      "ai-automation": "Einen Prozess mit KI automatisieren",
      "data-strategy": "Eine verlässliche Datenbasis schaffen",
      "web-app": "Eine Website oder Web-App starten oder die Suchsichtbarkeit verbessern",
      "content-operations": "Content oder ein digitales Produkt skalieren",
      "team-enablement": "Mein Team weiterbilden",
      "career-mentorship": "Meine Karriere im Daten- oder KI-Bereich weiterentwickeln",
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
        title: "Datengrundlagen",
        description:
          "Wir legen Architektur, Qualität, Zugriff und Governance fest, damit Analytics und KI kontrolliert skalieren.",
      },
      "website-app-development": {
        title: "Webentwicklung & Suchsichtbarkeit",
        description:
          "Wir entwickeln schnelle, barrierearme Websites und Webanwendungen mit technischem SEO, strukturierten Inhalten und Messung für Sichtbarkeit in Google und KI-gestützten Antworten.",
      },
      "content-operations-automation": {
        title: "Content-Prozesse und digitale Produkte",
        description:
          "KI-gestützte Systeme zur Wiederverwendung von Inhalten, für redaktionelle Abläufe, koordinierte Verbreitung und spezialisierte digitale Produkte.",
      },
      "data-career-enablement-mentorship": {
        title: "Weiterbildung und Mentoring",
        description:
          "Rollenbezogene Team-Workshops, praxisnahe Schulungen, Unterstützung bei der Einführung neuer Werkzeuge und persönliches Karriere-Mentoring.",
      },
    },
  },
  footer: {
    tagline:
      "Business Intelligence, KI, Datengrundlagen, Webanwendungen, Sichtbarkeit in der Suche, Content-Prozesse, laufender Support, Weiterbildung und Mentoring.",
    company: "Unternehmen",
    services: "Leistungen",
    resources: "Ressourcen",
    servicesOverview: "Leistungsübersicht",
    insights: "Einblicke",
    privacy: "Datenschutzerklärung",
    terms: "Nutzungsbedingungen",
    cookieSettings: "Cookie-Einstellungen",
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
export const TRANSLATED_ROUTES = new Set([
  "/",
  "/services",
  "/about",
  "/start-a-project",
  "/privacy-policy",
  "/terms-of-service",
  "/blog",
]);

export function isTranslatedRoute(route: string) {
  return (
    TRANSLATED_ROUTES.has(route) ||
    route.startsWith("/blog/") ||
    route.startsWith("/case-studies/") ||
    route === "/projects" ||
    route.startsWith("/projects/")
  );
}
