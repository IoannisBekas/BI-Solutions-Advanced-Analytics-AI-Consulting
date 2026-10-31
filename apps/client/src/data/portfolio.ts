import projects from "@shared/portfolio-projects.json";
import { localePrefix, type Locale } from "@/i18n/config";
import type { CaseStudy } from "@/data/caseStudies";

export const portfolioProjects = projects;
export type PortfolioProject = (typeof projects)[number];
export type PortfolioCopy = Record<Locale, string>;

export const portfolioCategories = [
  {
    slug: "health-wellness",
    name: {
      en: "Health, wellness & medical",
      el: "Υγεία, ευεξία & ιατρικά",
      de: "Gesundheit, Wellness & Medizin",
    },
    description: {
      en: "Therapy centres, psychology, Pilates and dental care. These interfaces help visitors understand services and find a clear route to an appointment enquiry.",
      el: "Κέντρα θεραπειών, ψυχολογία, pilates και οδοντιατρική φροντίδα. Οι ιστοσελίδες βοηθούν τον επισκέπτη να κατανοήσει τις υπηρεσίες και να βρει εύκολα τον τρόπο επικοινωνίας για ραντεβού.",
      de: "Therapiezentren, Psychologie, Pilates und Zahnmedizin. Diese Oberflächen machen Leistungen verständlich und führen übersichtlich zur Terminanfrage.",
    },
  },
  {
    slug: "food-local-business",
    name: {
      en: "Food & local businesses",
      el: "Εστίαση & τοπικές επιχειρήσεις",
      de: "Gastronomie & lokale Unternehmen",
    },
    description: {
      en: "Restaurants, coffee shops, retail services and direct ordering. Distinctive identities work alongside practical menus, service information and local contact paths.",
      el: "Εστιατόρια, καφέ, τοπικές υπηρεσίες και άμεσες παραγγελίες. Η ξεχωριστή ταυτότητα συνδυάζεται με εύχρηστους καταλόγους, πληροφορίες υπηρεσιών και άμεση επικοινωνία.",
      de: "Restaurants, Cafés, lokale Dienstleistungen und Direktbestellungen. Eigenständige Markenidentitäten verbinden sich mit praktischen Menüs, Leistungsinformationen und lokalen Kontaktwegen.",
    },
  },
  {
    slug: "hospitality-real-estate",
    name: {
      en: "Travel, hospitality & real estate",
      el: "Τουρισμός, φιλοξενία & ακίνητα",
      de: "Reisen, Gastgewerbe & Immobilien",
    },
    description: {
      en: "Boutique accommodation, yacht charters and property showcases. Photography, destination context and enquiry journeys support considered travel and property decisions.",
      el: "Boutique καταλύματα, ναυλώσεις σκαφών και παρουσιάσεις ακινήτων. Η φωτογραφία, οι πληροφορίες προορισμού και οι διαδρομές επικοινωνίας στηρίζουν την επιλογή καταλύματος, ταξιδιού ή ακινήτου.",
      de: "Boutique-Unterkünfte, Yachtcharter und Immobilienpräsentationen. Fotografie, Standortinformationen und Anfragewege unterstützen fundierte Reise- und Immobilienentscheidungen.",
    },
  },
  {
    slug: "corporate-commerce",
    name: {
      en: "Corporate, ecommerce & personal brands",
      el: "Εταιρικά, ηλεκτρονικό εμπόριο & προσωπικά brands",
      de: "Unternehmen, E-Commerce & persönliche Marken",
    },
    description: {
      en: "B2B websites, accounting services, apparel retail, automotive and coaching. Each project arranges the offer around discovery, comparison and the next customer action.",
      el: "B2B ιστοσελίδες, λογιστικές υπηρεσίες, ένδυση, αυτοκίνητα και coaching. Κάθε έργο οργανώνει την προσφορά γύρω από την αναζήτηση, τη σύγκριση και το επόμενο βήμα του πελάτη.",
      de: "B2B-Websites, Buchhaltung, Modehandel, Fahrzeuge und Coaching. Jedes Projekt strukturiert das Angebot rund um Entdeckung, Vergleich und den nächsten Kundenschritt.",
    },
  },
  {
    slug: "web-apps-dashboards",
    name: {
      en: "Web apps & interactive dashboards",
      el: "Web εφαρμογές & διαδραστικά dashboards",
      de: "Webanwendungen & interaktive Dashboards",
    },
    description: {
      en: "Finance education, watch-market research, real-estate telemetry and subscription analytics. Explore interactive products that make complex information easier to navigate. Research views and simulations are presented as portfolio examples.",
      el: "Εκπαίδευση χρηματοοικονομικών, έρευνα αγοράς ρολογιών, παρακολούθηση ακινήτων και analytics συνδρομών. Διαδραστικά προϊόντα κάνουν τις σύνθετες πληροφορίες πιο προσιτές. Οι ερευνητικές προβολές και προσομοιώσεις παρουσιάζονται ως παραδείγματα portfolio.",
      de: "Finanzbildung, Uhrenmarktforschung, Immobilien-Telemetrie und Abonnementanalysen. Interaktive Produkte machen komplexe Informationen zugänglich. Forschungsansichten und Simulationen werden als Portfolio-Beispiele vorgestellt.",
    },
  },
];

export const portfolioCopy = {
  title: {
    en: "Projects & case studies",
    el: "Έργα & μελέτες περίπτωσης",
    de: "Projekte & Fallstudien",
  },
  heading: {
    en: "Work across data, applications and the web.",
    el: "Έργα σε δεδομένα, εφαρμογές και ιστοσελίδες.",
    de: "Projekte für Daten, Anwendungen und Websites.",
  },
  description: {
    en: "Explore Power BI case studies, websites, ecommerce concepts and interactive applications by BI Solutions Group, with project context, interface previews and delivery details.",
    el: "Εξερευνήστε μελέτες περίπτωσης Power BI, ιστοσελίδες, concepts ηλεκτρονικού εμπορίου και διαδραστικές εφαρμογές της BI Solutions Group, με περιγραφή έργου, προεπισκοπήσεις και στοιχεία υλοποίησης.",
    de: "Entdecken Sie Power-BI-Fallstudien, Websites, E-Commerce-Konzepte und interaktive Anwendungen der BI Solutions Group mit Projektkontext, Vorschauen und Umsetzungsdetails.",
  },
  caseStudiesDescription: {
    en: "Client delivery and independent Power BI demonstrations, with the reporting challenge, approach and delivered capabilities.",
    el: "Έργο πελάτη και ανεξάρτητες επιδείξεις Power BI, με το πρόβλημα αναφορών, την προσέγγιση και τις δυνατότητες που παραδόθηκαν.",
    de: "Kundenprojekte und unabhängige Power-BI-Demonstrationen mit Aufgabenstellung, Vorgehen und gelieferten Funktionen.",
  },
  caseStudyDetails: {
    en: "Read the case study",
    el: "Δείτε τη μελέτη περίπτωσης",
    de: "Fallstudie lesen",
  },
  all: { en: "All projects", el: "Όλα τα έργα", de: "Alle Projekte" },
  view: { en: "Project view", el: "Προβολή έργων", de: "Projektansicht" },
  browseCategory: { en: "Browse by industry", el: "Επιλογή κλάδου έργων", de: "Nach Branche auswählen" },
  compact: { en: "Compact", el: "Σύνοψη", de: "Kompakt" },
  cards: { en: "Cards", el: "Κάρτες", de: "Karten" },
  search: { en: "Search projects", el: "Αναζήτηση έργων", de: "Projekte durchsuchen" },
  searchPlaceholder: {
    en: "Search by name, industry or service…",
    el: "Αναζήτηση με όνομα, κλάδο ή υπηρεσία…",
    de: "Nach Name, Branche oder Leistung suchen…",
  },
  clearSearch: { en: "Clear search", el: "Καθαρισμός αναζήτησης", de: "Suche löschen" },
  noResults: {
    en: "No projects match your search.",
    el: "Δεν βρέθηκαν έργα για αυτή την αναζήτηση.",
    de: "Keine Projekte entsprechen Ihrer Suche.",
  },
  details: {
    en: "Explore the project",
    el: "Δείτε το έργο",
    de: "Projekt entdecken",
  },
  live: {
    en: "Visit the live project",
    el: "Επισκεφθείτε το έργο",
    de: "Live-Projekt besuchen",
  },
  newTab: {
    en: "Opens in a new tab",
    el: "Ανοίγει σε νέα καρτέλα",
    de: "Öffnet in einem neuen Tab",
  },
  overview: {
    en: "Project overview",
    el: "Επισκόπηση έργου",
    de: "Projektüberblick",
  },
  features: {
    en: "Experience highlights",
    el: "Χαρακτηριστικά της εμπειρίας",
    de: "Merkmale des Erlebnisses",
  },
  preview: {
    en: "Real interface preview",
    el: "Πραγματική προεπισκόπηση διεπαφής",
    de: "Echte Oberflächenvorschau",
  },
  captureNote: {
    en: "Captured from the public project on 31 October 2026. The live interface may change.",
    el: "Λήψη από το δημόσιο έργο στις 31 Οκτωβρίου 2026. Η ζωντανή διεπαφή ενδέχεται να αλλάξει.",
    de: "Am 31. Oktober 2026 vom öffentlichen Projekt aufgenommen. Die Live-Oberfläche kann sich ändern.",
  },
  note: {
    en: "The collection includes published websites, independent concepts and research tools. Each entry describes the interface; it does not imply a client endorsement or a measured business result.",
    el: "Η συλλογή περιλαμβάνει δημοσιευμένα websites, ανεξάρτητα concepts και ερευνητικά εργαλεία. Κάθε καταχώριση περιγράφει τη διεπαφή, χωρίς να υποδηλώνει σύσταση πελάτη ή μετρημένο επιχειρηματικό αποτέλεσμα.",
    de: "Die Sammlung umfasst veröffentlichte Websites, unabhängige Konzepte und Forschungswerkzeuge. Jeder Eintrag beschreibt die Oberfläche, ohne eine Kundenempfehlung oder ein gemessenes Geschäftsergebnis zu behaupten.",
  },
  related: {
    en: "More projects in this industry",
    el: "Περισσότερα έργα του κλάδου",
    de: "Weitere Projekte dieser Branche",
  },
  service: {
    en: "Explore the related service",
    el: "Δείτε τη σχετική υπηρεσία",
    de: "Passende Leistung entdecken",
  },
  start: {
    en: "Discuss a similar project",
    el: "Συζητήστε ένα αντίστοιχο έργο",
    de: "Ein ähnliches Projekt besprechen",
  },
  homeLink: {
    en: "Explore all website & app projects",
    el: "Δείτε όλα τα έργα ιστοσελίδων & εφαρμογών",
    de: "Alle Website- & App-Projekte entdecken",
  },
  nav: { en: "Projects", el: "Έργα", de: "Projekte" },
  alt: {
    en: "Website interface preview",
    el: "Προεπισκόπηση διεπαφής ιστοσελίδας",
    de: "Vorschau der Website-Oberfläche",
  },
} satisfies Record<string, PortfolioCopy>;

export function projectImage(
  project: PortfolioProject,
  variant: "cover" | "800" | "social" = "cover",
) {
  return `/assets/projects/${project.slug}/${variant}.webp`;
}

// Search metadata describes the production domain, even in a mounted preview.
export function portfolioCanonicalUrl(path: string, locale: Locale) {
  return `https://www.bisolutions.group${localePrefix(locale)}${path}`;
}

export function caseStudyLocale(caseStudy: CaseStudy, locale: Locale): Locale {
  return caseStudy.translatedLocales &&
    !caseStudy.translatedLocales.includes(locale)
    ? "en"
    : locale;
}

export function projectCategory(project: PortfolioProject) {
  return portfolioCategories.find(
    (category) => category.slug === project.category,
  )!;
}
