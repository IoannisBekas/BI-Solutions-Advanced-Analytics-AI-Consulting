type PageTranslationOverrides = Record<string, { el: string; de: string }>;

// Curated corrections for phrases where literal machine translation changes the
// business meaning. These are applied after the generated translation catalogue.
export const pageTranslationOverrides: PageTranslationOverrides = {
  "Risenfire workforce & capacity reporting": {"el": "Αναφορές φόρτου και διαθεσιμότητας προσωπικού για τη Risenfire", "de": "Personal- und Kapazitätsreporting für Risenfire"},
  "Client project · Public delivery account": {"el": "Έργο πελάτη · Δημόσια παρουσίαση υλοποίησης", "de": "Kundenprojekt · Öffentlicher Projektbericht"},
  "A Power BI workload and availability dashboard connecting operational data from Common Data Service / Dataverse to a centralized reporting layer for team capacity, scheduled work, and project workload.": {"el": "Dashboard Power BI για τον φόρτο και τη διαθεσιμότητα προσωπικού, που συνδέει δεδομένα από Common Data Service / Dataverse με κεντρικές αναφορές δυναμικότητας ομάδας, προγραμματισμένης εργασίας και φόρτου έργων.", "de": "Ein Power-BI-Dashboard für Arbeitslast und Verfügbarkeit, das Betriebsdaten aus Common Data Service / Dataverse mit zentralen Berichten zu Teamkapazität, geplanter Arbeit und Projektauslastung verbindet."},
  "A Power BI workforce workload and availability dashboard.": {"el": "Dashboard Power BI για τον φόρτο και τη διαθεσιμότητα προσωπικού.", "de": "Ein Power-BI-Dashboard für Arbeitslast und Personalverfügbarkeit."},
  "Workflow illustration of Dataverse operational data feeding a Power BI semantic model and workforce reporting for Risenfire; not a dashboard screenshot": {"el": "Διάγραμμα ροής από λειτουργικά δεδομένα Dataverse προς σημασιολογικό μοντέλο Power BI και αναφορές προσωπικού για τη Risenfire, όχι screenshot dashboard", "de": "Ablaufdiagramm von Dataverse-Betriebsdaten über ein semantisches Power-BI-Modell zum Personalreporting für Risenfire; kein Dashboard-Screenshot"},
  "Explore a public client delivery account alongside independent portfolio analyses. Each case explains the relationship, data context, reporting problem, and delivered work.": { el: "Δείτε μια δημόσια παρουσίαση έργου πελάτη και ανεξάρτητες αναλύσεις portfolio. Κάθε μελέτη εξηγεί τη σχέση με τον οργανισμό, τα δεδομένα, το πρόβλημα αναφορών και το έργο που παραδόθηκε.", de: "Entdecken Sie einen öffentlichen Kundenprojektbericht und unabhängige Portfolioanalysen. Jeder Fall erläutert die Beziehung zur Organisation, den Datenkontext, die Reporting-Aufgabe und die gelieferte Arbeit." },
  "This connects <a href=\"/services/ai-automation-consulting\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI automation consulting</a> with <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI governance and literacy</a>. Teams need both the workflow and the habits to use it responsibly.": { el: "\u0391\u03c5\u03c4\u03cc \u03c3\u03c5\u03bd\u03b4\u03ad\u03b5\u03b9 \u03c4\u03b7 <a href=\"/services/ai-automation-consulting\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">\u03c3\u03c5\u03bc\u03b2\u03bf\u03c5\u03bb\u03b5\u03c5\u03c4\u03b9\u03ba\u03ae \u03b1\u03c5\u03c4\u03bf\u03bc\u03b1\u03c4\u03bf\u03c0\u03bf\u03af\u03b7\u03c3\u03b7\u03c2 \u03bc\u03b5 AI</a> \u03bc\u03b5 \u03c4\u03b7 <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">\u03b4\u03b9\u03b1\u03ba\u03c5\u03b2\u03ad\u03c1\u03bd\u03b7\u03c3\u03b7 \u03ba\u03b1\u03b9 \u03c4\u03b7\u03bd \u03b5\u03be\u03bf\u03b9\u03ba\u03b5\u03af\u03c9\u03c3\u03b7 \u03bc\u03b5 \u03c4\u03b7\u03bd AI</a>. \u039f\u03b9 \u03bf\u03bc\u03ac\u03b4\u03b5\u03c2 \u03c7\u03c1\u03b5\u03b9\u03ac\u03b6\u03bf\u03bd\u03c4\u03b1\u03b9 \u03c4\u03cc\u03c3\u03bf \u03c4\u03b7 \u03c1\u03bf\u03ae \u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1\u03c2 \u03cc\u03c3\u03bf \u03ba\u03b1\u03b9 \u03c4\u03b9\u03c2 \u03ba\u03b1\u03c4\u03ac\u03bb\u03bb\u03b7\u03bb\u03b5\u03c2 \u03c0\u03c1\u03b1\u03ba\u03c4\u03b9\u03ba\u03ad\u03c2 \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03c4\u03b7 \u03c7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03b9\u03bf\u03cd\u03bd \u03c5\u03c0\u03b5\u03cd\u03b8\u03c5\u03bd\u03b1.", de: "Dies verbindet <a href=\"/services/ai-automation-consulting\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">KI-Automatisierungsberatung</a> mit <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">KI-Governance und Alphabetisierung</a>. Teams benötigen sowohl den Arbeitsablauf als auch die Gewohnheiten, um ihn verantwortungsvoll zu nutzen." },
  "BI Solutions connects this roadmap work across <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">data strategy</a>, <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">BI</a>, and <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI</a>. The goal is early value plus better operating discipline.": { el: "\u0397 BI Solutions \u03c3\u03c5\u03bd\u03b4\u03ad\u03b5\u03b9 \u03b1\u03c5\u03c4\u03cc\u03bd \u03c4\u03bf\u03bd \u03bf\u03b4\u03b9\u03ba\u03cc \u03c7\u03ac\u03c1\u03c4\u03b7 \u03bc\u03b5 \u03c4\u03b7 <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">\u03c3\u03c4\u03c1\u03b1\u03c4\u03b7\u03b3\u03b9\u03ba\u03ae \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd</a>, \u03c4\u03b7\u03bd <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">\u03b5\u03c0\u03b9\u03c7\u03b5\u03b9\u03c1\u03b7\u03bc\u03b1\u03c4\u03b9\u03ba\u03ae \u03b5\u03c5\u03c6\u03c5\u0390\u03b1</a> \u03ba\u03b1\u03b9 \u03c4\u03b7\u03bd <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI</a>. \u03a3\u03c4\u03cc\u03c7\u03bf\u03c2 \u03b5\u03af\u03bd\u03b1\u03b9 \u03b7 \u03ad\u03b3\u03ba\u03b1\u03b9\u03c1\u03b7 \u03b4\u03b7\u03bc\u03b9\u03bf\u03c5\u03c1\u03b3\u03af\u03b1 \u03b1\u03be\u03af\u03b1\u03c2 \u03ba\u03b1\u03b9 \u03b7 \u03ba\u03b1\u03bb\u03cd\u03c4\u03b5\u03c1\u03b7 \u03bf\u03c1\u03b3\u03ac\u03bd\u03c9\u03c3\u03b7 \u03c4\u03b7\u03c2 \u03bb\u03b5\u03b9\u03c4\u03bf\u03c5\u03c1\u03b3\u03af\u03b1\u03c2.", de: "BI Solutions verbindet diese Roadmap-Arbeit über die <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Datenstrategie</a>, <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">BI</a> und <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI</a>. Das Ziel ist eine frühzeitige Wertschöpfung und eine bessere Betriebsdisziplin." },
  "BI Solutions connects this planning to <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">cloud migration</a>, <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">business intelligence</a>, and <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI consulting</a> so the strategy turns into visible delivery rather than remaining a document.": { el: "\u0397 BI Solutions \u03c3\u03c5\u03bd\u03b4\u03ad\u03b5\u03b9 \u03b1\u03c5\u03c4\u03cc\u03bd \u03c4\u03bf\u03bd \u03c3\u03c7\u03b5\u03b4\u03b9\u03b1\u03c3\u03bc\u03cc \u03bc\u03b5 \u03c4\u03b7 <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">\u03bc\u03b5\u03c4\u03ac\u03b2\u03b1\u03c3\u03b7 \u03c3\u03c4\u03bf cloud</a>, \u03c4\u03b7\u03bd <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">\u03b5\u03c0\u03b9\u03c7\u03b5\u03b9\u03c1\u03b7\u03bc\u03b1\u03c4\u03b9\u03ba\u03ae \u03b5\u03c5\u03c6\u03c5\u0390\u03b1</a> \u03ba\u03b1\u03b9 \u03c4\u03b7 <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">\u03c3\u03c5\u03bc\u03b2\u03bf\u03c5\u03bb\u03b5\u03c5\u03c4\u03b9\u03ba\u03ae AI</a>, \u03ce\u03c3\u03c4\u03b5 \u03b7 \u03c3\u03c4\u03c1\u03b1\u03c4\u03b7\u03b3\u03b9\u03ba\u03ae \u03bd\u03b1 \u03bf\u03b4\u03b7\u03b3\u03b5\u03af \u03c3\u03b5 \u03c3\u03c5\u03b3\u03ba\u03b5\u03ba\u03c1\u03b9\u03bc\u03ad\u03bd\u03b7 \u03c5\u03bb\u03bf\u03c0\u03bf\u03af\u03b7\u03c3\u03b7 \u03ba\u03b1\u03b9 \u03bd\u03b1 \u03bc\u03b7 \u03bc\u03ad\u03bd\u03b5\u03b9 \u03b1\u03c0\u03bb\u03ce\u03c2 \u03ad\u03bd\u03b1 \u03ad\u03b3\u03b3\u03c1\u03b1\u03c6\u03bf.", de: "BI Solutions verbindet diese Planung mit der <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Cloud-Migration</a>, <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300\". underline-offset-4 hover:text-gray-600\">Business Intelligence</a> und <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">KI-Beratung</a>, damit die Strategie zu einer sichtbaren Umsetzung wird, anstatt ein Dokument zu bleiben." },
  "Last updated: October 20, 2026": {
    el: "Τελευταία ενημέρωση: 20 Οκτωβρίου 2026",
    de: "Zuletzt aktualisiert: 20. Oktober 2026",
  },
  "Digital product delivery:": {
    el: "Παράδοση ψηφιακών προϊόντων:",
    de: "Bereitstellung digitaler Produkte:",
  },
  "Your email, selected pack, AI experience, PDF language, request time, and download time when you request an AI learning product. We use these details to send your selected PDF through Resend and support access. Requesting a pack does not subscribe you to marketing emails.": {
    el: "Το email σας, το επιλεγμένο pack, η εμπειρία σας με την AI, η γλώσσα του PDF, η ώρα αιτήματος και η ώρα λήψης όταν ζητάτε ένα προϊόν εκμάθησης AI. Χρησιμοποιούμε αυτά τα στοιχεία για να σας στείλουμε το επιλεγμένο PDF μέσω του Resend και να υποστηρίξουμε την πρόσβασή σας. Το αίτημα για ένα pack δεν σας εγγράφει σε διαφημιστικά email.",
    de: "Ihre E-Mail-Adresse, das ausgewählte Paket, Ihre KI-Erfahrung, die PDF-Sprache sowie die Zeitpunkte der Anfrage und des Downloads, wenn Sie ein KI-Lernprodukt anfordern. Wir verwenden diese Angaben, um Ihnen das ausgewählte PDF über Resend zu senden und den Zugriff zu unterstützen. Die Anforderung eines Pakets meldet Sie nicht für Werbe-E-Mails an.",
  },
  "Digital product download links expire after 7 days. Delivery records become eligible for deletion after 30 days and are removed on the next product access or download request.": {
    el: "Οι σύνδεσμοι λήψης ψηφιακών προϊόντων λήγουν μετά από 7 ημέρες. Τα αρχεία παράδοσης μπορούν να διαγραφούν μετά από 30 ημέρες και αφαιρούνται στο επόμενο αίτημα πρόσβασης ή λήψης προϊόντος.",
    de: "Downloadlinks für digitale Produkte laufen nach 7 Tagen ab. Zustellungsdatensätze werden nach 30 Tagen zur Löschung freigegeben und bei der nächsten Zugriffs- oder Downloadanfrage entfernt.",
  },
  "Advanced Analytics & AI Consulting": {
    el: "Προηγμένη ανάλυση δεδομένων & συμβουλευτική AI",
    de: "Erweiterte Analytik und KI-Beratung",
  },
  "Analytics (Google Analytics)": {
    el: "Ανάλυση επισκεψιμότητας (Google Analytics)",
    de: "Analyse (Google Analytics)",
  },
  "Business Intelligence & Power BI": {
    el: "Επιχειρηματική ευφυΐα & Power BI",
    de: "Business Intelligence und Power BI",
  },
  "BI & Analytics": {
    el: "BI & ανάλυση δεδομένων",
    de: "BI & Analytik",
  },
  "Business Intelligence": {
    el: "Επιχειρηματική ευφυΐα",
    de: "Business Intelligence",
  },
  "AI Literacy": {
    el: "Κατανόηση της AI",
    de: "KI-Kompetenz",
  },
  "AI Literacy for Teams": {
    el: "Κατανόηση της AI για ομάδες",
    de: "KI-Kompetenz für Teams",
  },
  "AI Readiness": {
    el: "Ετοιμότητα για AI",
    de: "KI-Bereitschaft",
  },
  "AI Consulting": {
    el: "Συμβουλευτική AI",
    de: "KI-Beratung",
  },
  "Advanced Analytics": {
    el: "Προηγμένη ανάλυση δεδομένων",
    de: "Erweiterte Analytik",
  },
  "Cloud & Data": {
    el: "Cloud & δεδομένα",
    de: "Cloud & Daten",
  },
  "Cloud Migration": {
    el: "Μετάβαση στο cloud",
    de: "Cloud-Migration",
  },
  "Cloud Warehouse": {
    el: "Αποθήκη δεδομένων στο cloud",
    de: "Cloud-Warehouse",
  },
  "MLOps & AI": {
    el: "MLOps & AI",
    de: "MLOps und KI",
  },
  "Generative AI & LLMs": {
    el: "Παραγωγική τεχνητή νοημοσύνη & LLMs",
    de: "Generative KI und LLMs",
  },
  "Predictive Analytics": {
    el: "Προγνωστική ανάλυση",
    de: "Prädiktive Analytik",
  },
  "Predictive analytics & ML": {
    el: "Προγνωστική ανάλυση & ML",
    de: "Prädiktive Analysen und ML",
  },
  "Insights": {
    el: "Άρθρα και γνώσεις",
    de: "Einblicke",
  },
  "Cloud Data Warehouse vs Spreadsheets": {
    el: "Αποθήκη δεδομένων cloud έναντι υπολογιστικών φύλλων",
    de: "Cloud Data Warehouse vs. Tabellenkalkulationen",
  },
  "4. Bonusaki Demo and Merchant Pilots": {
    el: "4. Επίδειξη του Bonusaki και πιλοτικές εφαρμογές με επιχειρήσεις",
    de: "4. Bonusaki-Demo und Händlerpiloten",
  },
  "Previous slide": {
    el: "Προηγούμενη διαφάνεια",
    de: "Vorherige Folie",
  },
  "Next slide": {
    el: "Επόμενη διαφάνεια",
    de: "Nächste Folie",
  },
  "Review quotations are shown in their original wording.": {
    el: "Τα αποσπάσματα των κριτικών εμφανίζονται στην αρχική τους διατύπωση.",
    de: "Rezensionszitate werden im Originalwortlaut angezeigt.",
  },
  "Data foundations": {
    el: "Υποδομές δεδομένων",
    de: "Datenfundamente",
  },
  "Senior-led delivery for international organizations, adapted to their operating environment, governance requirements, and adoption realities.": {
    el: "Υλοποίηση υπό την καθοδήγηση έμπειρου συμβούλου για διεθνείς οργανισμούς, προσαρμοσμένη στο λειτουργικό τους περιβάλλον, στις απαιτήσεις διακυβέρνησης και στις πραγματικές συνθήκες υιοθέτησης.",
    de: "Senior-geführte Umsetzung für internationale Organisationen, abgestimmt auf ihr Betriebsumfeld, ihre Governance-Anforderungen und die tatsächlichen Voraussetzungen der Einführung.",
  },
  "Ingestion, transformation, warehouse or lakehouse, and semantic-layer design": {
    el: "Σχεδιασμός εισαγωγής και μετασχηματισμού δεδομένων, data warehouse ή lakehouse και σημασιολογικού επιπέδου",
    de: "Konzeption von Datenaufnahme und -transformation, Data Warehouse oder Lakehouse sowie der semantischen Schicht",
  },
  "Responsible-use policies, standards, approval paths, and practical guardrails": {
    el: "Πολιτικές υπεύθυνης χρήσης, πρότυπα, διαδικασίες έγκρισης και πρακτικές δικλίδες ασφαλείας",
    de: "Richtlinien und Standards für verantwortungsvolle Nutzung, klare Freigabewege und praktische Schutzmaßnahmen",
  },
  "Internal playbooks, office hours, adoption support, and progress reviews that help new capability become normal practice": {
    el: "Εσωτερικοί οδηγοί, ώρες υποστήριξης, βοήθεια στην υιοθέτηση και αξιολογήσεις προόδου που εντάσσουν τις νέες δυνατότητες στην καθημερινή πρακτική",
    de: "Interne Leitfäden, Sprechstunden, Einführungsunterstützung und Fortschrittskontrollen, damit neue Fähigkeiten zur täglichen Praxis werden",
  },
  "Fractional data and AI leadership": {
    el: "Εξωτερική ηγεσία δεδομένων και AI μερικής απασχόλησης",
    de: "Externe Daten- und KI-Leitung in Teilzeit",
  },
  "Target-state cloud architecture across Snowflake, BigQuery, Fabric, Databricks, or Azure": {
    el: "Αρχιτεκτονική-στόχος στο cloud με Snowflake, BigQuery, Fabric, Databricks ή Azure",
    de: "Zielarchitektur in der Cloud mit Snowflake, BigQuery, Fabric, Databricks oder Azure",
  },
  "Content intake, transcription, editorial calendars, review gates, asset libraries, and publishing workflows": {
    el: "Παραλαβή περιεχομένου, μεταγραφή, συντακτικά ημερολόγια, στάδια έγκρισης, βιβλιοθήκες υλικού και ροές δημοσίευσης",
    de: "Content-Erfassung, Transkription, Redaktionskalender, Freigabeschritte, Asset-Bibliotheken und Veröffentlichungsworkflows",
  },
  "Ownership maps, stewardship playbooks, and decision-ready implementation roadmaps": {
    el: "Χαρτογράφηση υπευθύνων, οδηγοί διαχείρισης δεδομένων και οδικοί χάρτες υλοποίησης έτοιμοι για λήψη αποφάσεων",
    de: "Verantwortlichkeitskarten, Leitfäden für Data Stewardship und entscheidungsreife Umsetzungs-Roadmaps",
  },
  "A shared version of performance that finance, operations, and leadership can reconcile": {
    el: "Μια κοινή εικόνα απόδοσης που μπορούν να συμφωνήσουν τα οικονομικά, οι λειτουργίες και η διοίκηση",
    de: "Ein gemeinsames Leistungsbild, das Finanzen, Betrieb und Führung miteinander abstimmen können",
  },
  "Executive decision hubs and operational Power BI applications": {
    el: "Κόμβοι λήψης αποφάσεων για στελέχη και λειτουργικές εφαρμογές Power BI",
    de: "Entscheidungszentren für Führungskräfte und operative Power-BI-Anwendungen",
  },
  "A single governed route from operational sources to metrics, dashboards, and AI systems": {
    el: "Μια ενιαία, ελεγχόμενη διαδρομή από τις λειτουργικές πηγές έως τις μετρήσεις, τα dashboards και τα συστήματα AI",
    de: "Ein einheitlicher, gesteuerter Weg von operativen Quellen zu Kennzahlen, Dashboards und KI-Systemen",
  },
  "Data contracts, quality tests, cataloguing, lineage, and observability standards": {
    el: "Συμβάσεις δεδομένων, έλεγχοι ποιότητας, καταλογογράφηση, ιχνηλασιμότητα προέλευσης και πρότυπα παρατηρησιμότητας",
    de: "Datenverträge, Qualitätstests, Katalogisierung, Herkunftsnachverfolgung und Beobachtbarkeitsstandards",
  },
  "Sensitive data reaches dashboards or AI workflows without sufficient access and lineage controls": {
    el: "Ευαίσθητα δεδομένα φτάνουν σε dashboards ή ροές εργασιών AI χωρίς επαρκείς ελέγχους πρόσβασης και ιχνηλασιμότητας προέλευσης",
    de: "Sensible Daten gelangen ohne ausreichende Zugriffs- und Herkunftskontrollen in Dashboards oder KI-Workflows",
  },
  "dbt is useful when SQL logic has become scattered across reports, notebooks, and local scripts. It helps teams organize transformations, add tests, document lineage, and treat analytics logic more like production code.": {
    el: "Το dbt είναι χρήσιμο όταν η λογική SQL έχει διασκορπιστεί σε αναφορές, notebooks και τοπικά scripts. Βοηθά τις ομάδες να οργανώνουν μετασχηματισμούς, να προσθέτουν ελέγχους, να τεκμηριώνουν την προέλευση των δεδομένων και να αντιμετωπίζουν τη λογική analytics περισσότερο ως κώδικα παραγωγής.",
    de: "dbt ist nützlich, wenn SQL-Logik über Berichte, Notebooks und lokale Skripte verteilt ist. Es hilft Teams, Transformationen zu organisieren, Tests hinzuzufügen, die Datenherkunft zu dokumentieren und Analytics-Logik wie Produktionscode zu behandeln.",
  },
};
