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
  "This connects <a href=\"/services/ai-automation-consulting\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI automation consulting</a> with <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI governance and literacy</a>. Teams need both the workflow and the habits to use it responsibly.": {
    "el": "Αυτό συνδέει τη <a href=\"/services/ai-automation-consulting\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">συμβουλευτική αυτοματισμών AI</a> με τη <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">διακυβέρνηση και εκπαίδευση στην AI</a>. Οι ομάδες χρειάζονται τόσο τη ροή εργασίας όσο και τις πρακτικές υπεύθυνης χρήσης της.",
    "de": "Dies verbindet <a href=\"/services/ai-automation-consulting\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Beratung zur KI-Automatisierung</a> mit <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">KI-Governance und KI-Kompetenz</a>. Teams brauchen sowohl den Workflow als auch die Routinen für seine verantwortungsvolle Nutzung."
  },
  "BI Solutions connects this roadmap work across <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">data strategy</a>, <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">BI</a>, and <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI</a>. The goal is early value plus better operating discipline.": {
    "el": "Η BI Solutions συνδέει αυτό το πλάνο με τη <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">στρατηγική δεδομένων</a>, το <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">BI</a> και την <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI</a>. Στόχος είναι η έγκαιρη δημιουργία αξίας και η καλύτερη οργάνωση της λειτουργίας.",
    "de": "BI Solutions verbindet diese Roadmap mit <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Datenstrategie</a>, <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">BI</a> und <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">KI</a>. Ziel sind früher Nutzen und verlässliche betriebliche Abläufe."
  },
  "BI Solutions connects this planning to <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">cloud migration</a>, <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">business intelligence</a>, and <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI consulting</a> so the strategy turns into visible delivery rather than remaining a document.": {
    "el": "Η BI Solutions συνδέει αυτόν τον σχεδιασμό με τη <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">μετάβαση στο cloud</a>, την <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">επιχειρηματική ευφυΐα</a> και τη <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">συμβουλευτική AI</a>, ώστε η στρατηγική να οδηγεί σε συγκεκριμένη υλοποίηση και να μην παραμένει ένα έγγραφο.",
    "de": "BI Solutions verbindet diese Planung mit <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Cloud-Migration</a>, <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Business Intelligence</a> und <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">KI-Beratung</a>, damit aus der Strategie eine konkrete Umsetzung wird."
  },
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
    "el": "Άρθρα",
    "de": "Einblicke"
  },
  "Cloud Data Warehouse vs Spreadsheets": {
    el: "Αποθήκη δεδομένων cloud έναντι υπολογιστικών φύλλων",
    de: "Cloud Data Warehouse vs. Tabellenkalkulationen",
  },
  "4. Bonusaki Demo and Merchant Pilots": {
    "el": "4. Επίδειξη του Bonusaki και πιλοτικές εφαρμογές με επιχειρήσεις",
    "de": "4. Bonusaki-Demo und Pilotprojekte mit Händlern"
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
    "el": "Υποδομές δεδομένων",
    "de": "Datengrundlagen"
  },
  "Senior-led delivery for international organizations, adapted to their operating environment, governance requirements, and adoption realities.": {
    "el": "Υλοποίηση από έμπειρο σύμβουλο για διεθνείς οργανισμούς, προσαρμοσμένη στο περιβάλλον λειτουργίας τους, στις απαιτήσεις διακυβέρνησης και στις πραγματικές συνθήκες υιοθέτησης νέων λύσεων.",
    "de": "Umsetzung durch einen erfahrenen Berater für internationale Organisationen, abgestimmt auf ihr Arbeitsumfeld, ihre Governance-Anforderungen und die praktischen Voraussetzungen für die Einführung neuer Lösungen."
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
    "el": "Χαρτογράφηση αρμοδιοτήτων, οδηγοί διαχείρισης δεδομένων και πλάνα υλοποίησης που υποστηρίζουν τη λήψη αποφάσεων",
    "de": "Übersichten der Verantwortlichkeiten, Leitfäden für Data Stewardship und Umsetzungspläne als Entscheidungsgrundlage"
  },
  "A shared version of performance that finance, operations, and leadership can reconcile": {
    "el": "Κοινή εικόνα της απόδοσης, με στοιχεία που μπορούν να συμφωνήσουν μεταξύ τους η οικονομική διεύθυνση, οι επιχειρησιακές ομάδες και η διοίκηση",
    "de": "Ein gemeinsames Bild der Unternehmensleistung mit Kennzahlen, die Finanzbereich, operative Teams und Geschäftsführung miteinander abstimmen können"
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
  "A business bottleneck, repeated workflow, reporting gap, product idea, or career goal is enough. You do not need a finished technical specification or learning plan.": {
    "el": "Αρκεί να περιγράψετε ένα πρόβλημα της επιχείρησης, μια επαναλαμβανόμενη διαδικασία, μια έλλειψη στις αναφορές, μια ιδέα προϊόντος ή έναν επαγγελματικό στόχο. Δεν χρειάζεστε έτοιμες τεχνικές προδιαγραφές ή πρόγραμμα εκπαίδευσης.",
    "de": "Ein betrieblicher Engpass, ein wiederkehrender Arbeitsablauf, eine Lücke im Reporting, eine Produktidee oder ein Karriereziel genügen. Sie brauchen weder fertige technische Anforderungen noch einen ausgearbeiteten Lernplan."
  },
  "A clearer value proposition and shorter path from first visit to qualified enquiry": {
    "el": "Σαφέστερη πρόταση αξίας και συντομότερη διαδρομή από την πρώτη επίσκεψη έως ένα ουσιαστικό αίτημα συνεργασίας",
    "de": "Ein klareres Wertversprechen und ein kürzerer Weg vom ersten Besuch bis zur qualifizierten Anfrage"
  },
  "A considered response": {
    "el": "Προσεκτικά μελετημένη απάντηση",
    "de": "Eine durchdachte Antwort"
  },
  "A consistent production rhythm with named owners, review standards, and fewer handoff delays": {
    "el": "Σταθερός ρυθμός παραγωγής περιεχομένου, με ορισμένους υπευθύνους, κριτήρια ελέγχου και λιγότερες καθυστερήσεις μεταξύ των σταδίων",
    "de": "Ein verlässlicher Produktionsrhythmus mit klar benannten Verantwortlichen, Qualitätsstandards und weniger Verzögerungen bei Übergaben"
  },
  "A planning range helps scope the work. It is not a quote or a currency conversion.": {
    "el": "Ένα ενδεικτικό εύρος προϋπολογισμού βοηθά να προσδιορίσουμε το αντικείμενο του έργου. Δεν αποτελεί οικονομική προσφορά ούτε μετατροπή νομίσματος.",
    "de": "Ein vorläufiger Budgetrahmen hilft, den Projektumfang einzugrenzen. Er ist weder ein Angebot noch eine Währungsumrechnung."
  },
  "A reliable path from operational systems to trusted analytics, AI, and accountable ownership.": {
    "el": "Αξιόπιστη σύνδεση των λειτουργικών συστημάτων με την ανάλυση δεδομένων και την AI, με σαφείς αρμοδιότητες.",
    "de": "Eine verlässliche Verbindung von operativen Systemen zu Datenanalysen und KI, mit klar geregelten Verantwortlichkeiten."
  },
  "A repeatable operating system for turning expertise into coordinated content, useful assets, and measurable digital products.": {
    "el": "Ένα επαναλήψιμο σύστημα εργασίας που μετατρέπει την τεχνογνωσία σε συντονισμένο περιεχόμενο, χρήσιμο υλικό και ψηφιακά προϊόντα με μετρήσιμα αποτελέσματα.",
    "de": "Ein wiederholbarer Arbeitsprozess, der Fachwissen in abgestimmte Inhalte, nützliche Materialien und digitale Produkte mit messbaren Ergebnissen umsetzt."
  },
  "A sequenced target architecture aligned to the decisions and workloads the business needs": {
    "el": "Αρχιτεκτονική-στόχος με σαφή στάδια υλοποίησης, προσαρμοσμένη στις αποφάσεις και στις ανάγκες επεξεργασίας της επιχείρησης",
    "de": "Eine Zielarchitektur mit klaren Umsetzungsschritten, abgestimmt auf die Entscheidungen und Verarbeitungslasten des Unternehmens"
  },
  "AI Consulting & Automation": {
    "el": "Συμβουλευτική και αυτοματισμοί AI",
    "de": "KI-Beratung und Automatisierung"
  },
  "AI automation": {
    "el": "Αυτοματισμοί με AI",
    "de": "KI-Automatisierung"
  },
  "AI automation & workflows": {
    "el": "Αυτοματισμοί και ροές εργασίας με AI",
    "de": "KI-Automatisierung und Workflows"
  },
  "AI designed around real work, approved knowledge, measurable quality, and clear human control.": {
    "el": "AI σχεδιασμένη για πραγματικές εργασίες, με εγκεκριμένες πηγές γνώσης, μετρήσιμη ποιότητα και σαφή ανθρώπινο έλεγχο.",
    "de": "KI für konkrete Aufgaben, mit freigegebenen Wissensquellen, messbarer Qualität und klarer menschlicher Kontrolle."
  },
  "AI readiness assessment across data, processes, people, and technology": {
    "el": "Αξιολόγηση ετοιμότητας για AI ως προς τα δεδομένα, τις διαδικασίες, το ανθρώπινο δυναμικό και την τεχνολογία",
    "de": "Bewertung der KI-Bereitschaft in den Bereichen Daten, Prozesse, Personal und Technologie"
  },
  "AI system and use-case inventory with business-focused risk categorization": {
    "el": "Καταγραφή συστημάτων AI και περιπτώσεων χρήσης, με κατηγοριοποίηση των κινδύνων για την επιχείρηση",
    "de": "Bestandsaufnahme von KI-Systemen und Anwendungsfällen mit einer Einordnung der geschäftlichen Risiken"
  },
  "About": {
    "el": "Σχετικά",
    "de": "Über uns"
  },
  "Accept both": {
    "el": "Αποδοχή και των δύο",
    "de": "Beide akzeptieren"
  },
  "Add metric-grounded commentary, natural-language access, and reviewable AI assistance to governed business intelligence workflows.": {
    "el": "Προσθέστε σχολιασμό που βασίζεται σε δείκτες, πρόσβαση σε φυσική γλώσσα και ελέγξιμη υποστήριξη AI στις ελεγχόμενες ροές εργασίας επιχειρηματικής ευφυΐας.",
    "de": "Ergänzen Sie kontrollierte BI-Workflows um kennzahlenbasierte Kommentare, Abfragen in natürlicher Sprache und überprüfbare KI-Unterstützung."
  },
  "Add senior direction for roadmaps, architecture, vendors, governance, investment, and executive decisions.": {
    "el": "Αξιοποιήστε την καθοδήγηση έμπειρου συμβούλου για τον σχεδιασμό υλοποίησης, την αρχιτεκτονική, τους προμηθευτές, τη διακυβέρνηση, τις επενδύσεις και τις διοικητικές αποφάσεις.",
    "de": "Nutzen Sie erfahrene Beratung für Roadmaps, Architektur, Anbieterauswahl, Governance, Investitionen und Managemententscheidungen."
  },
  "Assess where AI can create value, prioritize feasible use cases, and turn scattered ideas into a sequenced roadmap with clear ownership.": {
    "el": "Αξιολογήστε πού μπορεί η AI να προσφέρει αξία, δώστε προτεραιότητα σε εφικτές εφαρμογές και μετατρέψτε τις διάσπαρτες ιδέες σε πλάνο με σαφή στάδια και υπευθύνους.",
    "de": "Bewerten Sie das Wertschöpfungspotenzial von KI, priorisieren Sie realisierbare Anwendungsfälle und entwickeln Sie daraus eine Roadmap mit klaren Schritten und Verantwortlichkeiten."
  },
  "Automated narrative commentary, summaries, and management-report drafting": {
    "el": "Αυτόματη σύνταξη σχολίων, περιλήψεων και προσχεδίων αναφορών προς τη διοίκηση",
    "de": "Automatisierte Kommentare, Zusammenfassungen und Entwürfe für Managementberichte"
  },
  "Automated validation, evaluation, testing, and approval gates": {
    "el": "Αυτοματοποιημένοι έλεγχοι επικύρωσης, αξιολόγησης και δοκιμών, με στάδια έγκρισης",
    "de": "Automatisierte Validierung, Bewertung und Tests mit klaren Freigabeschritten"
  },
  "B.Sc. in Mathematics & Minor in Economics": {
    "el": "Πτυχίο Μαθηματικών (B.Sc.) με δευτερεύουσα ειδίκευση στα Οικονομικά",
    "de": "B.Sc. in Mathematik mit Nebenfach Wirtschaftswissenschaften"
  },
  "Better adoption of approved data and AI tools through shared standards, examples, and support": {
    "el": "Ευρύτερη αξιοποίηση των εγκεκριμένων εργαλείων δεδομένων και AI, με κοινά πρότυπα, παραδείγματα και υποστήριξη",
    "de": "Bessere Nutzung freigegebener Daten- und KI-Werkzeuge durch gemeinsame Standards, Beispiele und Unterstützung"
  },
  "Bring the problem. We’ll clarify the right next step.": {
    "el": "Περιγράψτε μας το πρόβλημα. Θα σας βοηθήσουμε να βρείτε το κατάλληλο επόμενο βήμα.",
    "de": "Schildern Sie uns Ihr Anliegen. Gemeinsam klären wir den passenden nächsten Schritt."
  },
  "Budget currency": {
    "el": "Νόμισμα προϋπολογισμού",
    "de": "Budgetwährung"
  },
  "Budget range": {
    "el": "Εύρος προϋπολογισμού",
    "de": "Budgetrahmen"
  },
  "Build AI-assisted systems that turn long-form expertise into approved content, coordinated distribution, and sellable digital products.": {
    "el": "Δημιουργήστε συστήματα με AI που μετατρέπουν εκτενές υλικό τεχνογνωσίας σε εγκεκριμένο περιεχόμενο, συντονισμένη διανομή και εμπορεύσιμα ψηφιακά προϊόντα.",
    "de": "Entwickeln Sie KI-gestützte Systeme, die ausführliche Fachinhalte in freigegebenen Content, koordinierte Verbreitung und vermarktbare digitale Produkte umwandeln."
  },
  "Build fast, accessible websites and bespoke web applications with the technical foundations, content structure, and measurement needed for visibility across Google Search and AI answer surfaces.": {
    "el": "Δημιουργήστε γρήγορες, προσβάσιμες ιστοσελίδες και εξατομικευμένες διαδικτυακές εφαρμογές, με την τεχνική υποδομή, τη δομή περιεχομένου και τη μέτρηση που χρειάζονται για να εμφανίζονται στην αναζήτηση Google και στις απαντήσεις AI.",
    "de": "Entwickeln Sie schnelle, barrierefreie Websites und individuelle Webanwendungen mit den technischen Grundlagen, der Inhaltsstruktur und der Erfolgsmessung für Sichtbarkeit in der Google-Suche und in KI-generierten Antworten."
  },
  "Build lasting capability through role-based workshops, office hours, practical training, or one-to-one guidance.": {
    "el": "Αναπτύξτε δεξιότητες με διάρκεια μέσα από εργαστήρια ανά ρόλο, ώρες υποστήριξης, πρακτική εκπαίδευση και ατομική καθοδήγηση.",
    "de": "Bauen Sie nachhaltige Kompetenzen durch rollenbezogene Workshops, Sprechstunden, praxisnahe Schulungen oder individuelle Beratung auf."
  },
  "Business intelligence, AI, data and cloud foundations, web development, technical SEO and AI-search visibility, digital products, training, and mentorship.": {
    "el": "Επιχειρηματική ευφυΐα, τεχνητή νοημοσύνη, υποδομές δεδομένων και cloud, ανάπτυξη ιστοσελίδων, τεχνικό SEO και προβολή στις απαντήσεις AI, ψηφιακά προϊόντα, εκπαίδευση και επαγγελματική καθοδήγηση.",
    "de": "Business Intelligence, KI, Daten- und Cloud-Infrastruktur, Webentwicklung, technisches SEO und Sichtbarkeit in KI-Antworten, digitale Produkte, Schulung und Mentoring."
  },
  "Business intelligence, applied AI, data foundations, web applications, content operations, digital products, and enablement—presented in one place and shaped around practical progress.": {
    "el": "Επιχειρηματική ευφυΐα, εφαρμοσμένη AI, υποδομές δεδομένων, διαδικτυακές εφαρμογές, διαχείριση περιεχομένου, ψηφιακά προϊόντα και εκπαίδευση, συγκεντρωμένα σε ένα σημείο και προσαρμοσμένα σε πρακτικές ανάγκες.",
    "de": "Business Intelligence, angewandte KI, Dateninfrastruktur, Webanwendungen, Content-Prozesse, digitale Produkte und Weiterbildung: an einem Ort gebündelt und auf konkrete Fortschritte ausgerichtet."
  },
  "Capability development": {
    "el": "Ανάπτυξη δεξιοτήτων",
    "de": "Kompetenzentwicklung"
  },
  "Change or withdraw permission using Cookie settings. Changing an existing choice may reload the page.": {
    "el": "Αλλάξτε ή ανακαλέστε τη συγκατάθεσή σας από τις ρυθμίσεις cookies. Η αλλαγή μιας υπάρχουσας επιλογής μπορεί να προκαλέσει επαναφόρτωση της σελίδας.",
    "de": "Ändern oder widerrufen Sie Ihre Einwilligung über die Cookie-Einstellungen. Wenn Sie eine bestehende Auswahl ändern, wird die Seite möglicherweise neu geladen."
  },
  "Clarify the current state, priority decisions, delivery risks, and the most valuable next move.": {
    "el": "Αποσαφηνίστε την τρέχουσα κατάσταση, τις αποφάσεις που προέχουν, τους κινδύνους υλοποίησης και το επόμενο βήμα με τη μεγαλύτερη αξία.",
    "de": "Klären Sie die Ausgangslage, vorrangige Entscheidungen, Umsetzungsrisiken und den nächsten Schritt mit dem größten Nutzen."
  },
  "Classification, risk, propensity, and prioritization models": {
    "el": "Μοντέλα ταξινόμησης, κινδύνου, πιθανότητας συμπεριφοράς και προτεραιοποίησης",
    "de": "Modelle für Klassifizierung, Risiken, Verhaltenswahrscheinlichkeiten und Priorisierung"
  },
  "Clear accountability for critical data products, definitions, access, and quality incidents": {
    "el": "Σαφείς αρμοδιότητες για κρίσιμα προϊόντα δεδομένων, ορισμούς, πρόσβαση και ζητήματα ποιότητας",
    "de": "Klare Verantwortlichkeiten für kritische Datenprodukte, Definitionen, Zugriffsrechte und Qualitätsprobleme"
  },
  "Clearer service, expertise, and entity signals for search and AI answer surfaces": {
    "el": "Σαφέστερη παρουσίαση υπηρεσιών, τεχνογνωσίας και εταιρικής ταυτότητας για τις μηχανές αναζήτησης και τα συστήματα απαντήσεων AI",
    "de": "Klarere Angaben zu Leistungen, Fachkompetenz und Unternehmensidentität für Suchmaschinen und KI-Antwortsysteme"
  },
  "Company LinkedIn": {
    "el": "Η εταιρεία στο LinkedIn",
    "de": "Unternehmensprofil auf LinkedIn"
  },
  "Connect": {
    "el": "Επικοινωνία",
    "de": "Kontakt"
  },
  "Content Operations & Digital Products": {
    "el": "Διαχείριση περιεχομένου και ψηφιακά προϊόντα",
    "de": "Content-Prozesse und digitale Produkte"
  },
  "Content operations": {
    "el": "Διαχείριση περιεχομένου",
    "de": "Content-Prozesse"
  },
  "Content operations & digital products": {
    "el": "Διαχείριση περιεχομένου και ψηφιακά προϊόντα",
    "de": "Content-Prozesse und digitale Produkte"
  },
  "Content systems": {
    "el": "Συστήματα διαχείρισης περιεχομένου",
    "de": "Content-Systeme"
  },
  "Cookies & measurement": {
    "el": "Cookies και μέτρηση επισκεψιμότητας",
    "de": "Cookies und Erfolgsmessung"
  },
  "Corporate websites and custom web apps built for speed, accessibility, and qualified conversion": {
    "el": "Εταιρικές ιστοσελίδες και εξατομικευμένες διαδικτυακές εφαρμογές με έμφαση στην ταχύτητα, την προσβασιμότητα και την προσέλκυση κατάλληλων αιτημάτων συνεργασίας",
    "de": "Unternehmenswebsites und individuelle Webanwendungen mit Fokus auf Geschwindigkeit, Barrierefreiheit und qualifizierte Anfragen"
  },
  "Create the governed cloud data foundation that makes reporting, analytics, and AI trustworthy enough to scale.": {
    "el": "Δημιουργήστε υποδομές δεδομένων στο cloud με σαφείς κανόνες διαχείρισης, ώστε οι αναφορές, η ανάλυση δεδομένων και η AI να μπορούν να επεκταθούν με αξιοπιστία.",
    "de": "Schaffen Sie eine Cloud-Datengrundlage mit klarer Governance, damit Reporting, Datenanalysen und KI zuverlässig skalieren können."
  },
  "Create the policies, roles, controls, learning, and review practices needed to use AI responsibly and turn approved tools into everyday capability.": {
    "el": "Θεσπίστε πολιτικές, ρόλους, ελέγχους, εκπαίδευση και διαδικασίες αξιολόγησης για υπεύθυνη χρήση της AI και καθημερινή αξιοποίηση των εγκεκριμένων εργαλείων.",
    "de": "Schaffen Sie Richtlinien, Rollen, Kontrollen, Schulungen und Prüfverfahren für den verantwortungsvollen KI-Einsatz und die tägliche Nutzung freigegebener Werkzeuge."
  },
  "Customer portals, booking flows, operational tools, consent-aware analytics, CRM links, and API integrations": {
    "el": "Πύλες πελατών, διαδικασίες κρατήσεων, εργαλεία καθημερινής λειτουργίας, ανάλυση επισκεψιμότητας που σέβεται τη συγκατάθεση, συνδέσεις CRM και διασυνδέσεις API",
    "de": "Kundenportale, Buchungsabläufe, operative Werkzeuge, einwilligungsbasierte Webanalysen, CRM-Anbindungen und API-Integrationen"
  },
  "DAX, refresh, relationship, and report-performance optimization": {
    "el": "Βελτιστοποίηση DAX, ανανέωσης δεδομένων, σχέσεων μεταξύ πινάκων και απόδοσης αναφορών",
    "de": "Optimierung von DAX, Datenaktualisierung, Tabellenbeziehungen und Berichtsleistung"
  },
  "Data Scientist & AI Developer": {
    "el": "Επιστήμονας δεδομένων και προγραμματιστής AI",
    "de": "Data Scientist und KI-Entwickler"
  },
  "Data Scientist & AI Developer with 9+ years of experience delivering high-impact analytical, customer-insight, and product-innovation work. Responsible for managing projects and implementing solutions.": {
    "el": "Επιστήμονας δεδομένων και προγραμματιστής AI με πάνω από 9 χρόνια εμπειρίας σε έργα ανάλυσης δεδομένων, κατανόησης πελατών και καινοτομίας προϊόντων με ουσιαστικό αντίκτυπο. Υπεύθυνος για τη διαχείριση έργων και την υλοποίηση λύσεων.",
    "de": "Data Scientist und KI-Entwickler mit mehr als 9 Jahren Erfahrung in wirkungsvollen Projekten zu Datenanalyse, Kundenverständnis und Produktinnovation. Verantwortlich für Projektmanagement und die Umsetzung von Lösungen."
  },
  "Data Strategy & Cloud": {
    "el": "Στρατηγική δεδομένων και cloud",
    "de": "Datenstrategie und Cloud"
  },
  "Data and AI enablement and mentorship": {
    "el": "Εκπαίδευση και καθοδήγηση σε δεδομένα και AI",
    "de": "Weiterbildung und Mentoring für Daten und KI"
  },
  "Data strategy and cloud foundations": {
    "el": "Στρατηγική δεδομένων και υποδομές cloud",
    "de": "Datenstrategie und Cloud-Infrastruktur"
  },
  "Deployment architecture, environments, version control, and release workflows": {
    "el": "Αρχιτεκτονική εγκατάστασης, περιβάλλοντα λειτουργίας, έλεγχος εκδόσεων και διαδικασίες διάθεσης νέων εκδόσεων",
    "de": "Bereitstellungsarchitektur, Betriebsumgebungen, Versionsverwaltung und Release-Prozesse"
  },
  "Design and deploy production AI systems that automate real work, use governed business knowledge, and remain measurable after launch.": {
    "el": "Σχεδιάστε και θέστε σε παραγωγική λειτουργία συστήματα AI που αυτοματοποιούν πραγματικές εργασίες, αξιοποιούν ελεγχόμενες εταιρικές πηγές γνώσης και έχουν μετρήσιμη απόδοση μετά την έναρξη λειτουργίας.",
    "de": "Entwickeln und betreiben Sie produktionsreife KI-Systeme, die konkrete Aufgaben automatisieren, kontrollierte Unternehmensquellen nutzen und auch nach dem Start messbare Ergebnisse liefern."
  },
  "Design useful assistants, retrieval systems, and generative AI applications around approved knowledge, measurable behavior, and business review.": {
    "el": "Σχεδιάστε χρήσιμους βοηθούς, συστήματα ανάκτησης πληροφοριών και εφαρμογές παραγωγικής AI, με εγκεκριμένες πηγές γνώσης, μετρήσιμη συμπεριφορά και έλεγχο από την επιχείρηση.",
    "de": "Entwickeln Sie hilfreiche Assistenten, Systeme zur Informationssuche und generative KI-Anwendungen mit freigegebenen Wissensquellen, messbarem Verhalten und fachlicher Prüfung."
  },
  "Desired timing": {
    "el": "Επιθυμητό χρονοδιάγραμμα",
    "de": "Gewünschter Zeitrahmen"
  },
  "Develop individual and team capability through role-based workshops, practical training, one-to-one mentorship, project guidance, and adoption support.": {
    "el": "Αναπτύξτε ατομικές και ομαδικές δεξιότητες μέσα από εργαστήρια ανά ρόλο, πρακτική εκπαίδευση, ατομική καθοδήγηση, υποστήριξη έργων και βοήθεια στην υιοθέτηση νέων εργαλείων.",
    "de": "Stärken Sie individuelle und teamweite Kompetenzen durch rollenbezogene Workshops, praxisnahe Schulungen, individuelles Mentoring, Projektbegleitung und Unterstützung bei der Einführung neuer Werkzeuge."
  },
  "Diagnostic or roadmap sprint": {
    "el": "Σύντομη φάση διάγνωσης ή σχεδιασμού υλοποίησης",
    "de": "Kompakte Analyse- oder Roadmap-Phase"
  },
  "Digital products and content operations": {
    "el": "Ψηφιακά προϊόντα και διαχείριση περιεχομένου",
    "de": "Digitale Produkte und Content-Prozesse"
  },
  "Discuss mentorship": {
    "el": "Συζητήστε τις ανάγκες καθοδήγησής σας",
    "de": "Mentoring besprechen"
  },
  "Discuss this service": {
    "el": "Συζητήστε αυτή την υπηρεσία",
    "de": "Diese Leistung besprechen"
  },
  "Document intake, extraction, classification, validation, and routing": {
    "el": "Παραλαβή εγγράφων, εξαγωγή στοιχείων, ταξινόμηση, επικύρωση και δρομολόγηση",
    "de": "Dokumenteneingang, Datenextraktion, Klassifizierung, Validierung und Weiterleitung"
  },
  "Enablement & Mentorship": {
    "el": "Εκπαίδευση και επαγγελματική καθοδήγηση",
    "de": "Weiterbildung und Mentoring"
  },
  "Enablement & mentorship": {
    "el": "Εκπαίδευση και επαγγελματική καθοδήγηση",
    "de": "Weiterbildung und Mentoring"
  },
  "Entity, authorship, and evidence signals that improve readiness for search features and AI-generated answers": {
    "el": "Στοιχεία εταιρικής ταυτότητας, συντάκτη και τεκμηρίωσης που βοηθούν την εμφάνιση στην αναζήτηση και στις απαντήσεις AI",
    "de": "Angaben zu Unternehmensidentität, Urheberschaft und Belegen, die die Sichtbarkeit in Suchfunktionen und KI-generierten Antworten unterstützen"
  },
  "Essential storage keeps the site working. With your permission, Google Analytics helps us understand visits and Google Ads measures which ads lead to project enquiries. Both are optional. Your form contents are not sent to Google Ads.": {
    "el": "Η απαραίτητη αποθήκευση δεδομένων διασφαλίζει τη λειτουργία του ιστοτόπου. Με τη συγκατάθεσή σας, το Google Analytics μάς βοηθά να κατανοούμε τις επισκέψεις και το Google Ads μετρά ποιες διαφημίσεις οδηγούν σε αιτήματα συνεργασίας. Και τα δύο είναι προαιρετικά. Το περιεχόμενο των φορμών σας δεν αποστέλλεται στο Google Ads.",
    "de": "Technisch notwendige Speicherung stellt den Betrieb der Website sicher. Mit Ihrer Einwilligung hilft uns Google Analytics, Besuche auszuwerten, und Google Ads misst, welche Anzeigen zu Projektanfragen führen. Beides ist optional. Ihre Formulareingaben werden nicht an Google Ads übermittelt."
  },
  "Exchange – Financial Mathematics, Stockholm University": {
    "el": "Πρόγραμμα ανταλλαγής — Χρηματοοικονομικά Μαθηματικά, Πανεπιστήμιο Στοκχόλμης",
    "de": "Austauschstudium – Finanzmathematik, Universität Stockholm"
  },
  "Executive dashboards organised around decisions, exceptions, and accountable owners": {
    "el": "Dashboards διοίκησης με επίκεντρο τις αποφάσεις, τις αποκλίσεις και τους αρμόδιους υπευθύνους",
    "de": "Management-Dashboards mit Fokus auf Entscheidungen, Abweichungen und klare Verantwortlichkeiten"
  },
  "Fast, focused websites and applications engineered for performance, conversion, and discoverability across search engines, answer features, and AI-powered experiences.": {
    "el": "Γρήγορες ιστοσελίδες και εφαρμογές με σαφή στόχο, σχεδιασμένες για υψηλή απόδοση, μετατροπή επισκεπτών σε πελάτες και προβολή στις μηχανές αναζήτησης και στις απαντήσεις AI.",
    "de": "Schnelle Websites und Anwendungen mit klarem Fokus auf Leistung, Kundengewinnung und Auffindbarkeit in Suchmaschinen sowie KI-gestützten Antwortfunktionen."
  },
  "GPA: 9.3/10": {
    "el": "Μέσος όρος βαθμολογίας: 9,3/10",
    "de": "Notendurchschnitt: 9,3/10"
  },
  "I agree that BI Solutions Group may use this information to respond to my enquiry. See the": {
    "el": "Συμφωνώ να χρησιμοποιήσει η BI Solutions Group αυτές τις πληροφορίες για να απαντήσει στο αίτημά μου. Δείτε την",
    "de": "Ich bin damit einverstanden, dass BI Solutions Group diese Angaben zur Beantwortung meiner Anfrage verwendet. Weitere Informationen finden Sie in der"
  },
  "In parallel, I advise cross-functional teams and leadership across North America and Europe on high-impact data initiatives—helping organizations leverage state-of-the-art tooling, modern data stacks, and emerging AI frameworks—supporting global brands including Fujitsu, LG, Nespresso, Collins Aerospace, Coca-Cola, and PepsiCo, as well as high-growth SMEs.": {
    "el": "Παράλληλα, συμβουλεύω ομάδες από διαφορετικές λειτουργίες και διοικήσεις στη Βόρεια Αμερική και την Ευρώπη για έργα δεδομένων με ουσιαστικό αντίκτυπο. Βοηθώ οργανισμούς να αξιοποιούν σύγχρονα εργαλεία, τεχνολογικές υποδομές δεδομένων και νέα πλαίσια AI, υποστηρίζοντας διεθνείς εταιρείες όπως οι Fujitsu, LG, Nespresso, Collins Aerospace, Coca-Cola και PepsiCo, καθώς και ταχέως αναπτυσσόμενες μικρομεσαίες επιχειρήσεις.",
    "de": "Parallel dazu berate ich funktionsübergreifende Teams und Führungskräfte in Nordamerika und Europa bei wirkungsvollen Datenprojekten. Ich unterstütze sie beim Einsatz moderner Werkzeuge, Datenplattformen und neuer KI-Frameworks und begleite dabei internationale Unternehmen wie Fujitsu, LG, Nespresso, Collins Aerospace, Coca-Cola und PepsiCo sowie wachstumsstarke KMU."
  },
  "Integration with existing governed semantic models, KPI definitions, and reporting controls": {
    "el": "Διασύνδεση με υπάρχοντα σημασιολογικά μοντέλα υπό διακυβέρνηση, ορισμούς KPI και ελέγχους αναφορών",
    "de": "Anbindung an bestehende semantische Modelle mit klarer Governance, KPI-Definitionen und Reporting-Kontrollen"
  },
  "Internal assistants, copilots, and task-specific generative AI applications": {
    "el": "Εσωτερικοί βοηθοί, copilots και εφαρμογές παραγωγικής AI για συγκεκριμένες εργασίες",
    "de": "Interne Assistenten, Copiloten und generative KI-Anwendungen für konkrete Aufgaben"
  },
  "International delivery": {
    "el": "Υλοποίηση έργων διεθνώς",
    "de": "Internationale Projektumsetzung"
  },
  "KPI dictionaries, ownership rules, release controls, and model documentation": {
    "el": "Λεξικά KPI, καθορισμός αρμοδιοτήτων, έλεγχοι διάθεσης εκδόσεων και τεκμηρίωση μοντέλων",
    "de": "KPI-Verzeichnisse, klare Zuständigkeiten, Release-Kontrollen und Modelldokumentation"
  },
  "Learn about Ioannis Bekas, BI Solutions Group, and the background behind the company’s analytics, AI, and data strategy practice.": {
    "el": "Γνωρίστε τον Ιωάννη Μπέκα, την BI Solutions Group και την εμπειρία πίσω από τις υπηρεσίες ανάλυσης δεδομένων, AI και στρατηγικής δεδομένων της εταιρείας.",
    "de": "Lernen Sie Ioannis Bekas, BI Solutions Group und die Erfahrung hinter den Leistungen für Datenanalyse, KI und Datenstrategie kennen."
  },
  "Let's Connect": {
    "el": "Ας επικοινωνήσουμε",
    "de": "Lassen Sie uns ins Gespräch kommen"
  },
  "M.Sc. in Operational Research, Analytics & Decision Making": {
    "el": "Μεταπτυχιακό (M.Sc.) στην Επιχειρησιακή Έρευνα, την Ανάλυση Δεδομένων και τη Λήψη Αποφάσεων",
    "de": "M.Sc. in Operations Research, Datenanalyse und Entscheidungsfindung"
  },
  "Managed operations and support": {
    "el": "Συνεχής λειτουργική διαχείριση και υποστήριξη",
    "de": "Laufender Betrieb und Support"
  },
  "Membership, access, payments, fulfillment, licensing, and product-analytics workflows": {
    "el": "Ροές διαχείρισης συνδρομών, πρόσβασης, πληρωμών, παράδοσης προϊόντων, αδειών χρήσης και ανάλυσης χρήσης προϊόντων",
    "de": "Prozesse für Mitgliedschaften, Zugriffsrechte, Zahlungen, Produktauslieferung, Lizenzierung und Produktanalyse"
  },
  "Move machine learning and LLM workflows into maintainable operation with versioning, deployment, evaluation, monitoring, and clear ownership.": {
    "el": "Θέστε τις ροές μηχανικής μάθησης και LLM σε συντηρήσιμη παραγωγική λειτουργία, με διαχείριση εκδόσεων, εγκατάσταση, αξιολόγηση, παρακολούθηση και σαφείς αρμοδιότητες.",
    "de": "Überführen Sie Machine-Learning- und LLM-Workflows in einen wartbaren Betrieb mit Versionsverwaltung, Bereitstellung, Bewertung, Überwachung und klaren Verantwortlichkeiten."
  },
  "My expertise spans data engineering, statistical analysis, artificial intelligence, and interactive data visualization, with a focus on building advanced analytical tools and scalable data models for predictive analytics and automation.": {
    "el": "Η εξειδίκευσή μου καλύπτει τη μηχανική δεδομένων, τη στατιστική ανάλυση, την τεχνητή νοημοσύνη και τη διαδραστική οπτικοποίηση δεδομένων. Εστιάζω στη δημιουργία προηγμένων εργαλείων ανάλυσης και επεκτάσιμων μοντέλων δεδομένων για προγνωστική ανάλυση και αυτοματισμούς.",
    "de": "Meine Fachgebiete sind Data Engineering, statistische Analyse, künstliche Intelligenz und interaktive Datenvisualisierung. Mein Schwerpunkt liegt auf leistungsfähigen Analysewerkzeugen und skalierbaren Datenmodellen für prädiktive Analysen und Automatisierung."
  },
  "Not sure where your need belongs?": {
    "el": "Δεν είστε σίγουροι ποια υπηρεσία καλύπτει την ανάγκη σας;",
    "de": "Sie sind nicht sicher, welche Leistung zu Ihrem Anliegen passt?"
  },
  "One authoritative long-form asset becomes a coordinated campaign without rebuilding every format manually": {
    "el": "Ένα τεκμηριωμένο, εκτενές υλικό μετατρέπεται σε συντονισμένη καμπάνια, χωρίς χειροκίνητη αναδημιουργία κάθε μορφής περιεχομένου",
    "de": "Aus einem fundierten, ausführlichen Inhalt entsteht eine abgestimmte Kampagne, ohne jedes Format manuell neu erstellen zu müssen"
  },
  "One governed view of the business—from source data to the decisions people make every day.": {
    "el": "Ενιαία εικόνα της επιχείρησης με σαφείς κανόνες διαχείρισης, από τα αρχικά δεδομένα έως τις καθημερινές αποφάσεις.",
    "de": "Ein einheitlicher Blick auf das Unternehmen mit klarer Governance, von den Quelldaten bis zu den täglichen Entscheidungen."
  },
  "One-to-one mentorship for entry-level candidates and professionals progressing toward senior, consulting, or leadership roles": {
    "el": "Ατομική καθοδήγηση για υποψηφίους που ξεκινούν την καριέρα τους και επαγγελματίες που εξελίσσονται προς ανώτερους, συμβουλευτικούς ή διοικητικούς ρόλους",
    "de": "Individuelles Mentoring für Berufseinsteiger und Fachkräfte auf dem Weg zu Senior-, Beratungs- oder Führungspositionen"
  },
  "Practical enablement that helps individuals and teams build stronger skills, judgment, adoption, and evidence of progress.": {
    "el": "Πρακτική εκπαίδευση που βοηθά άτομα και ομάδες να αναπτύξουν δεξιότητες και κριτική σκέψη, να αξιοποιούν νέα εργαλεία και να τεκμηριώνουν την πρόοδό τους.",
    "de": "Praxisnahe Weiterbildung, die Einzelpersonen und Teams dabei unterstützt, Kompetenzen und Urteilsvermögen aufzubauen, neue Werkzeuge zu nutzen und Fortschritte nachzuweisen."
  },
  "Prefer not to say": {
    "el": "Προτιμώ να μην απαντήσω",
    "de": "Keine Angabe"
  },
  "Python and Statistics for Financial Analysis – HKUST": {
    "el": "Python και Στατιστική για Χρηματοοικονομική Ανάλυση — HKUST",
    "de": "Python und Statistik für die Finanzanalyse – HKUST"
  },
  "Reject optional": {
    "el": "Απόρριψη προαιρετικών",
    "de": "Optionale ablehnen"
  },
  "Reliable foundations, governance, and cloud delivery.": {
    "el": "Αξιόπιστες υποδομές, διακυβέρνηση δεδομένων και υλοποίηση στο cloud.",
    "de": "Verlässliche Datengrundlagen, Governance und Cloud-Umsetzung."
  },
  "Repurposing systems that turn long-form audio or video into approved short-form assets, articles, newsletters, and campaigns": {
    "el": "Συστήματα επαναχρησιμοποίησης περιεχομένου που μετατρέπουν εκτενές ηχητικό ή οπτικοακουστικό υλικό σε εγκεκριμένα σύντομα βίντεο και άλλο υλικό, άρθρα, ενημερωτικά δελτία και καμπάνιες",
    "de": "Systeme zur Wiederverwendung von Inhalten, die längere Audio- oder Videobeiträge in freigegebene Kurzformate, Artikel, Newsletter und Kampagnen umwandeln"
  },
  "Repurposing systems, distribution workflows, and digital assets.": {
    "el": "Συστήματα επαναχρησιμοποίησης περιεχομένου, ροές διανομής και ψηφιακό υλικό.",
    "de": "Systeme zur Wiederverwendung von Inhalten, Verteilungsprozesse und digitale Materialien."
  },
  "Retrieval-augmented generation and enterprise search over approved content": {
    "el": "Παραγωγή απαντήσεων με ανάκτηση πληροφοριών (RAG) και εταιρική αναζήτηση σε εγκεκριμένο περιεχόμενο",
    "de": "Retrieval-Augmented Generation (RAG) und unternehmensinterne Suche in freigegebenen Inhalten"
  },
  "Reusable knowledge assets that can support lead generation, customer education, or direct revenue": {
    "el": "Επαναχρησιμοποιήσιμο υλικό γνώσης που υποστηρίζει την προσέλκυση υποψήφιων πελατών, την εκπαίδευση πελατών ή την άμεση δημιουργία εσόδων",
    "de": "Wiederverwendbare Wissensmaterialien zur Gewinnung potenzieller Kunden, zur Kundenschulung oder zur direkten Umsatzgenerierung"
  },
  "Role-based access, GDPR-aware controls, retention rules, and governance workflows": {
    "el": "Πρόσβαση βάσει ρόλων, έλεγχοι που λαμβάνουν υπόψη τον GDPR, κανόνες διατήρησης δεδομένων και ροές διακυβέρνησης",
    "de": "Rollenbasierte Zugriffsrechte, DSGVO-orientierte Kontrollen, Aufbewahrungsregeln und Governance-Prozesse"
  },
  "Role-based data and AI literacy workshops for executives, managers, analysts, and operational teams": {
    "el": "Εργαστήρια κατανόησης δεδομένων και AI, προσαρμοσμένα στους ρόλους στελεχών, διευθυντών, αναλυτών και επιχειρησιακών ομάδων",
    "de": "Rollenbezogene Workshops zur Daten- und KI-Kompetenz für Führungskräfte, Manager, Analysten und operative Teams"
  },
  "Search analytics": {
    "el": "Ανάλυση απόδοσης στην αναζήτηση",
    "de": "Analyse der Suchleistung"
  },
  "Search engine optimization (SEO), answer engine optimization (AEO), and generative engine optimization (GEO) foundations for organic discovery": {
    "el": "Βάσεις για οργανική προβολή μέσω SEO και βελτιστοποίησης για μηχανές απαντήσεων (AEO) και παραγωγικής AI (GEO)",
    "de": "Grundlagen für organische Sichtbarkeit durch SEO sowie die Optimierung für Antwortsysteme (AEO) und generative KI-Suchsysteme (GEO)"
  },
  "See every service": {
    "el": "Δείτε όλες τις υπηρεσίες",
    "de": "Alle Leistungen ansehen"
  },
  "See what our clients say about our data and AI consultancy services.": {
    "el": "Δείτε τι λένε οι πελάτες μας για τις συμβουλευτικές υπηρεσίες μας σε δεδομένα και AI.",
    "de": "Lesen Sie, was unsere Kunden über unsere Daten- und KI-Beratung sagen."
  },
  "Select the closest option": {
    "el": "Επιλέξτε αυτό που σας ταιριάζει περισσότερο",
    "de": "Wählen Sie die am besten passende Option"
  },
  "Semantic HTML & SSR": {
    "el": "Σημασιολογική HTML και SSR",
    "de": "Semantisches HTML und SSR"
  },
  "Send project brief": {
    "el": "Αποστολή περιγραφής έργου",
    "de": "Projektbeschreibung senden"
  },
  "Share the essentials about your reporting, AI, data, automation, digital product, content operation, team capability, or career goal. Your brief helps make the first conversation focused and useful.": {
    "el": "Περιγράψτε συνοπτικά τις ανάγκες σας σε αναφορές, AI, δεδομένα, αυτοματισμούς, ψηφιακά προϊόντα, διαχείριση περιεχομένου, εκπαίδευση ομάδας ή επαγγελματική εξέλιξη. Έτσι, η πρώτη συζήτηση θα είναι πιο στοχευμένη και χρήσιμη.",
    "de": "Beschreiben Sie kurz Ihr Anliegen zu Reporting, KI, Daten, Automatisierung, digitalen Produkten, Content-Prozessen, Teamentwicklung oder Ihrer Karriere. Ihre Angaben helfen, das erste Gespräch gezielt und nützlich zu gestalten."
  },
  "Share the reporting problem, AI workflow, data foundation, or digital product you need to move forward.": {
    "el": "Περιγράψτε το πρόβλημα στις αναφορές σας, τη ροή εργασίας AI, την υποδομή δεδομένων ή το ψηφιακό προϊόν που χρειάζεστε για το επόμενο βήμα.",
    "de": "Beschreiben Sie die Herausforderung im Reporting, den KI-Workflow, die Datengrundlage oder das digitale Produkt, das Sie für Ihren nächsten Schritt benötigen."
  },
  "Stronger practical judgment developed through work participants can explain, defend, and improve": {
    "el": "Ανάπτυξη πρακτικής κρίσης μέσα από εργασίες που οι συμμετέχοντες μπορούν να εξηγήσουν, να τεκμηριώσουν και να βελτιώσουν",
    "de": "Stärkeres praktisches Urteilsvermögen durch Aufgaben, deren Ergebnisse die Teilnehmenden erklären, begründen und verbessern können"
  },
  "Stronger technical eligibility for crawling, indexing, and organic discovery": {
    "el": "Καλύτερες τεχνικές προϋποθέσεις για ανίχνευση, ευρετηρίαση και οργανική προβολή",
    "de": "Bessere technische Voraussetzungen für Crawling, Indexierung und organische Sichtbarkeit"
  },
  "Tabular semantic models with reusable measures and role-based access": {
    "el": "Σημασιολογικά μοντέλα πινάκων με επαναχρησιμοποιήσιμα μέτρα υπολογισμού και πρόσβαση βάσει ρόλων",
    "de": "Tabellarische semantische Modelle mit wiederverwendbaren Measures und rollenbasiertem Zugriff"
  },
  "Team enablement or mentorship": {
    "el": "Εκπαίδευση ομάδας ή επαγγελματική καθοδήγηση",
    "de": "Teamweiterbildung oder Mentoring"
  },
  "Team training, adoption support, and career development.": {
    "el": "Εκπαίδευση ομάδων, υποστήριξη στην υιοθέτηση νέων εργαλείων και επαγγελματική εξέλιξη.",
    "de": "Teamschulung, Unterstützung bei der Einführung neuer Werkzeuge und Karriereentwicklung."
  },
  "Technical University of Crete & Hellenic Army Academy": {
    "el": "Πολυτεχνείο Κρήτης και Στρατιωτική Σχολή Ευελπίδων",
    "de": "Technische Universität Kreta und Griechische Heeresakademie"
  },
  "Tell BI Solutions Group about your BI, AI, data, automation, web application, or mentorship need and get a considered next step.": {
    "el": "Περιγράψτε στην BI Solutions Group τις ανάγκες σας σε BI, AI, δεδομένα, αυτοματισμούς, διαδικτυακές εφαρμογές ή επαγγελματική καθοδήγηση, για να σας προτείνουμε ένα κατάλληλο επόμενο βήμα.",
    "de": "Schildern Sie BI Solutions Group Ihr Anliegen zu BI, KI, Daten, Automatisierung, Webanwendungen oder Mentoring und erhalten Sie eine fundierte Empfehlung für den nächsten Schritt."
  },
  "The brief is reviewed before the next step is suggested. If the work is not a good fit, that will be made clear as well.": {
    "el": "Εξετάζουμε την περιγραφή του έργου σας πριν προτείνουμε το επόμενο βήμα. Αν το αντικείμενο δεν ταιριάζει στις υπηρεσίες μας, θα σας το πούμε ξεκάθαρα.",
    "de": "Wir prüfen Ihre Projektbeschreibung, bevor wir den nächsten Schritt empfehlen. Falls Ihr Anliegen nicht zu unseren Leistungen passt, sagen wir Ihnen das offen."
  },
  "The complete service atlas": {
    "el": "Όλες οι υπηρεσίες σε ένα σημείο",
    "de": "Alle Leistungen im Überblick"
  },
  "Thesis: “Artificial Intelligence Touchpoints with Multi-Criteria Decision Analysis”": {
    "el": "Διπλωματική εργασία: «Σημεία σύγκλισης της Τεχνητής Νοημοσύνης με την Πολυκριτήρια Ανάλυση Αποφάσεων»",
    "de": "Abschlussarbeit: „Schnittstellen zwischen künstlicher Intelligenz und multikriterieller Entscheidungsanalyse“"
  },
  "Turn fragmented reporting into a governed decision system with reliable Power BI models, trusted KPIs, and fast executive dashboards.": {
    "el": "Μετατρέψτε τις αποσπασματικές αναφορές σε ενιαίο σύστημα υποστήριξης αποφάσεων, με σαφείς κανόνες διαχείρισης, αξιόπιστα μοντέλα Power BI, έγκυρους KPI και γρήγορα dashboards διοίκησης.",
    "de": "Entwickeln Sie aus fragmentierten Berichten ein einheitliches System zur Entscheidungsunterstützung mit klarer Governance, zuverlässigen Power-BI-Modellen, belastbaren KPIs und schnellen Management-Dashboards."
  },
  "Typical stack": {
    "el": "Ενδεικτικές τεχνολογίες",
    "de": "Typische Technologien"
  },
  "Use-case discovery and value, feasibility, and risk prioritization": {
    "el": "Εντοπισμός περιπτώσεων χρήσης και προτεραιοποίηση βάσει αξίας, εφικτότητας και κινδύνου",
    "de": "Ermittlung und Priorisierung von Anwendungsfällen nach Nutzen, Machbarkeit und Risiko"
  },
  "Web & Search Visibility": {
    "el": "Ιστοσελίδες και προβολή στην αναζήτηση",
    "de": "Webentwicklung und Sichtbarkeit in der Suche"
  },
  "Web & search visibility": {
    "el": "Ιστοσελίδες και προβολή στην αναζήτηση",
    "de": "Webentwicklung und Sichtbarkeit in der Suche"
  },
  "Web apps & search visibility": {
    "el": "Διαδικτυακές εφαρμογές και προβολή στην αναζήτηση",
    "de": "Webanwendungen und Sichtbarkeit in der Suche"
  },
  "Web development and search visibility": {
    "el": "Ανάπτυξη ιστοσελίδων και προβολή στην αναζήτηση",
    "de": "Webentwicklung und Sichtbarkeit in der Suche"
  },
  "Websites and apps with technical SEO and AI-search foundations.": {
    "el": "Ιστοσελίδες και εφαρμογές με τεχνικό SEO και υποδομή για εμφάνιση στις απαντήσεις AI.",
    "de": "Websites und Anwendungen mit technischem SEO und Grundlagen für die Sichtbarkeit in KI-Antworten."
  },
  "What are you trying to improve?": {
    "el": "Τι θέλετε να βελτιώσετε;",
    "de": "Was möchten Sie verbessern?"
  },
  "What needs to improve, who will use the result, and what would a useful outcome look like?": {
    "el": "Τι χρειάζεται βελτίωση, ποιος θα χρησιμοποιήσει τη λύση και ποιο αποτέλεσμα θα είχε πρακτική αξία;",
    "de": "Was soll verbessert werden, wer wird die Lösung nutzen und welches Ergebnis wäre für Sie hilfreich?"
  },
  "Work email": {
    "el": "Επαγγελματικό email",
    "de": "Geschäftliche E-Mail-Adresse"
  },
  "Workflow discovery, process mapping, and automation opportunity assessment": {
    "el": "Αποτύπωση ροών εργασίας, χαρτογράφηση διαδικασιών και αξιολόγηση δυνατοτήτων αυτοματοποίησης",
    "de": "Analyse von Arbeitsabläufen, Prozessmodellierung und Bewertung von Automatisierungsmöglichkeiten"
  },
  "1. Data Controller": {
    "el": "1. Υπεύθυνος επεξεργασίας δεδομένων",
    "de": "1. Verantwortlicher für die Datenverarbeitung"
  },
  "5. Your GDPR Rights": {
    "el": "5. Τα δικαιώματά σας βάσει του GDPR",
    "de": "5. Ihre DSGVO-Rechte"
  },
  "6 min read": {
    "el": "Χρόνος ανάγνωσης: 6 λεπτά",
    "de": "6 Min. Lesezeit"
  },
  "6. Cookies": {
    "el": "6. Cookies",
    "de": "6. Cookies"
  },
  "7 min read": {
    "el": "Χρόνος ανάγνωσης: 7 λεπτά",
    "de": "7 Min. Lesezeit"
  },
  "8 min read": {
    "el": "Χρόνος ανάγνωσης: 8 λεπτά",
    "de": "8 Min. Lesezeit"
  },
  "A KPI dictionary gives teams shared definitions for metrics, owners, formulas, and business context before dashboards multiply.": {
    "el": "Ένα λεξικό KPI παρέχει κοινά συμφωνημένους ορισμούς για δείκτες, υπευθύνους, τύπους υπολογισμού και επιχειρηματικό πλαίσιο, πριν πολλαπλασιαστούν τα dashboards.",
    "de": "Ein KPI-Verzeichnis schafft gemeinsame Definitionen für Kennzahlen, Verantwortliche, Formeln und den geschäftlichen Kontext, bevor immer mehr Dashboards entstehen."
  },
  "A clear demonstration of how strategic workforce indicators and operational applicant detail can coexist.": {
    "el": "Σαφές παράδειγμα συνδυασμού στρατηγικών δεικτών προσωπικού με αναλυτικά στοιχεία υποψηφίων.",
    "de": "Ein anschauliches Beispiel für die Verbindung strategischer Personalkennzahlen mit operativen Bewerberdaten."
  },
  "A clearer way to explore country-office audit risk and implementation": {
    "el": "Σαφέστερη διερεύνηση των ελεγκτικών κινδύνων και της εφαρμογής συστάσεων στα γραφεία ανά χώρα",
    "de": "Prüfungsrisiken und die Umsetzung von Empfehlungen in Länderbüros übersichtlich untersuchen"
  },
  "A coherent demonstration of global-to-local laboratory monitoring in Power BI.": {
    "el": "Ολοκληρωμένο παράδειγμα εργαστηριακής παρακολούθησης στο Power BI, από τη συνολική εικόνα έως τα τοπικά στοιχεία.",
    "de": "Ein schlüssiges Beispiel für Laborüberwachung in Power BI, von der globalen Übersicht bis zu lokalen Details."
  },
  "A current average pH indicator and an integrated feedback entry point.": {
    "el": "Δείκτης της τρέχουσας μέσης τιμής pH και ενσωματωμένη δυνατότητα υποβολής σχολίων.",
    "de": "Eine Kennzahl zum aktuellen durchschnittlichen pH-Wert und eine integrierte Möglichkeit zur Rückmeldung."
  },
  "A drill-through applicant view with experience, salary, assessment, and feedback context.": {
    "el": "Αναλυτική προβολή υποψηφίου μέσω drill-through, με στοιχεία εμπειρίας, μισθού, αξιολόγησης και σχολίων.",
    "de": "Eine Drillthrough-Ansicht mit Details zu Erfahrung, Gehalt, Bewertung und Rückmeldungen eines Bewerbers."
  },
  "A four-page Power BI demonstration that brings audit ratings, country risk, expenditure, and recommendation implementation into one navigable reporting experience.": {
    "el": "Δείγμα αναφοράς Power BI τεσσάρων σελίδων που συνδυάζει αξιολογήσεις ελέγχου, κινδύνους ανά χώρα, δαπάνες και πρόοδο εφαρμογής συστάσεων σε ένα ενιαίο περιβάλλον πλοήγησης.",
    "de": "Ein vierseitiges Power-BI-Beispiel, das Prüfungsbewertungen, Länderrisiken, Ausgaben und die Umsetzung von Empfehlungen in einem durchgängigen Bericht zusammenführt."
  },
  "A global application funnel from applied through screened, interviewed, and hired.": {
    "el": "Συνολική απεικόνιση των σταδίων πρόσληψης, από την υποβολή αίτησης έως την προεπιλογή, τη συνέντευξη και την πρόσληψη.",
    "de": "Eine globale Übersicht der Bewerbungsphasen von der Einreichung über die Vorauswahl und das Vorstellungsgespräch bis zur Einstellung."
  },
  "A lightweight data quality checklist can prevent dashboard errors, weak AI outputs, and repeated manual corrections.": {
    "el": "Μια σύντομη λίστα ελέγχου ποιότητας δεδομένων μπορεί να αποτρέψει σφάλματα στα dashboards, χαμηλής ποιότητας αποτελέσματα AI και επαναλαμβανόμενες χειροκίνητες διορθώσεις.",
    "de": "Eine übersichtliche Checkliste für die Datenqualität kann Dashboard-Fehler, schwache KI-Ausgaben und wiederholte manuelle Korrekturen verhindern."
  },
  "A practical AI policy should explain allowed use cases, sensitive data rules, review expectations, and escalation paths.": {
    "el": "Μια πρακτική πολιτική AI πρέπει να διευκρινίζει τις επιτρεπόμενες χρήσεις, τους κανόνες για ευαίσθητα δεδομένα, τους απαιτούμενους ελέγχους και τις διαδικασίες αναφοράς ζητημάτων.",
    "de": "Eine praxistaugliche KI-Richtlinie sollte zulässige Anwendungsfälle, Regeln für sensible Daten, erforderliche Prüfungen und Eskalationswege festlegen."
  },
  "A reusable Power BI pattern for recruitment, workforce planning, and talent intelligence.": {
    "el": "Επαναχρησιμοποιήσιμο πρότυπο Power BI για προσλήψεις, προγραμματισμό στελέχωσης και ανάλυση ανθρώπινου δυναμικού.",
    "de": "Ein wiederverwendbares Power-BI-Muster für Personalgewinnung, Personalplanung und die Analyse von Personaldaten."
  },
  "A reusable reporting pattern for environmental, scientific, and quality-control datasets.": {
    "el": "Επαναχρησιμοποιήσιμο πρότυπο αναφορών για περιβαλλοντικά και επιστημονικά δεδομένα, καθώς και δεδομένα ποιοτικού ελέγχου.",
    "de": "Ein wiederverwendbares Berichtsmuster für Umwelt-, Wissenschafts- und Qualitätskontrolldatensätze."
  },
  "A short brief is enough to start. We review the context and suggest the next step before you commit to a project.": {
    "el": "Μια σύντομη περιγραφή αρκεί για να ξεκινήσουμε. Εξετάζουμε τις ανάγκες σας και προτείνουμε το επόμενο βήμα, πριν δεσμευτείτε για κάποιο έργο.",
    "de": "Eine kurze Beschreibung genügt für den Anfang. Wir prüfen Ihr Anliegen und empfehlen den nächsten Schritt, bevor Sie sich für ein Projekt entscheiden."
  },
  "A single demonstration flow for moving from portfolio-level audit status to country-office detail.": {
    "el": "Ενιαία ροή παρουσίασης από τη συνολική εικόνα των ελέγχων έως τα αναλυτικά στοιχεία κάθε γραφείου ανά χώρα.",
    "de": "Ein durchgängiger Ablauf von der Gesamtübersicht des Prüfungsstatus bis zu den Details einzelner Länderbüros."
  },
  "A smaller, higher-signal resource library for buyers comparing analytics, AI workflow, reporting, and web app consulting decisions.": {
    "el": "Μια επιλεγμένη συλλογή ουσιαστικών οδηγών για όσους εξετάζουν λύσεις ανάλυσης δεδομένων, ροών AI, αναφορών και διαδικτυακών εφαρμογών.",
    "de": "Eine gezielte Auswahl fundierter Ressourcen für Unternehmen, die Beratung zu Datenanalysen, KI-Workflows, Reporting und Webanwendungen vergleichen."
  },
  "A traceable path from funnel patterns to the underlying candidate and role context.": {
    "el": "Δυνατότητα μετάβασης από τα μοτίβα των σταδίων πρόσληψης στα αντίστοιχα στοιχεία υποψηφίων και θέσεων.",
    "de": "Ein nachvollziehbarer Weg von Mustern im Bewerbungsprozess zu den zugehörigen Bewerber- und Stellendaten."
  },
  "A two-page Power BI demonstration connecting global recruitment activity and funnel analysis with drill-through applicant, role, interview, and hiring detail.": {
    "el": "Δείγμα αναφοράς Power BI δύο σελίδων που συνδέει τη διεθνή δραστηριότητα προσλήψεων και την ανάλυση των σταδίων επιλογής με αναλυτικά στοιχεία υποψηφίων, θέσεων, συνεντεύξεων και προσλήψεων μέσω drill-through.",
    "de": "Ein zweiseitiges Power-BI-Beispiel, das internationale Recruiting-Aktivitäten und Bewerbungsphasen über Drillthrough mit Details zu Bewerbern, Stellen, Gesprächen und Einstellungen verbindet."
  },
  "AI Assistant Governance: What Company Policy Should Cover": {
    "el": "Διακυβέρνηση βοηθών AI: τι πρέπει να καλύπτει η εταιρική πολιτική",
    "de": "Governance für KI-Assistenten: Was eine Unternehmensrichtlinie abdecken sollte"
  },
  "AI Consulting for Greek Businesses: Practical Use Cases Beyond Hype": {
    "el": "Συμβουλευτική AI για ελληνικές επιχειρήσεις: πρακτικές εφαρμογές πέρα από τον ενθουσιασμό",
    "de": "KI-Beratung für griechische Unternehmen: Praktische Anwendungen jenseits des Hypes"
  },
  "AI Document Workflows for Professional Services": {
    "el": "Ροές επεξεργασίας εγγράφων με AI για επαγγελματικές υπηρεσίες",
    "de": "KI-gestützte Dokumentenprozesse für professionelle Dienstleistungen"
  },
  "AI Literacy for Teams: How to Adopt AI Without Creating Operational Risk": {
    "el": "Κατανόηση της AI για ομάδες: πώς να την υιοθετήσετε χωρίς νέους λειτουργικούς κινδύνους",
    "de": "KI-Kompetenz für Teams: KI einführen, ohne betriebliche Risiken zu schaffen"
  },
  "AI literacy helps teams understand what AI can do, where it fails, and how to use it responsibly inside real business workflows.": {
    "el": "Η εκπαίδευση στην AI βοηθά τις ομάδες να κατανοούν τις δυνατότητες και τους περιορισμούς της και να τη χρησιμοποιούν υπεύθυνα στις πραγματικές διαδικασίες της επιχείρησης.",
    "de": "KI-Kenntnisse helfen Teams zu verstehen, was KI leisten kann, wo sie versagt und wie sie in realen Geschäftsabläufen verantwortungsvoll eingesetzt werden kann."
  },
  "AI projects depend on data foundations. Without clear ownership, quality, and access rules, AI becomes harder to trust and harder to scale.": {
    "el": "Τα έργα AI χρειάζονται αξιόπιστες υποδομές δεδομένων. Χωρίς σαφείς αρμοδιότητες και κανόνες ποιότητας και πρόσβασης, είναι δυσκολότερο να εμπιστευθεί κανείς την AI και να επεκτείνει τη χρήση της.",
    "de": "KI-Projekte brauchen verlässliche Datengrundlagen. Ohne klare Verantwortlichkeiten sowie Qualitäts- und Zugriffsregeln lassen sich KI-Systeme schwerer vertrauenswürdig betreiben und skalieren."
  },
  "An executive landing page with audit-result summaries and a global office map.": {
    "el": "Αρχική σελίδα για τη διοίκηση, με συνοπτικά αποτελέσματα ελέγχων και παγκόσμιο χάρτη γραφείων.",
    "de": "Eine Einstiegsseite für Führungskräfte mit zusammengefassten Prüfungsergebnissen und einer Weltkarte der Standorte."
  },
  "An implementation tracker for recommendations made, completed, and outstanding.": {
    "el": "Παρακολούθηση των συστάσεων που έχουν διατυπωθεί, υλοποιηθεί ή παραμένουν σε εκκρεμότητα.",
    "de": "Eine Übersicht der ausgesprochenen, umgesetzten und noch offenen Empfehlungen."
  },
  "An independent Power BI analysis showing how recruitment activity, funnel stages, sources, and applicant detail work together.": {
    "el": "Ανεξάρτητο δείγμα ανάλυσης Power BI που συνδυάζει τη δραστηριότητα προσλήψεων, τα στάδια επιλογής, τις πηγές και τα αναλυτικά στοιχεία υποψηφίων.",
    "de": "Ein unabhängiges Power-BI-Analysebeispiel, das Recruiting-Aktivitäten, Auswahlphasen, Bewerberquellen und Bewerberdetails zusammenführt."
  },
  "An independent Power BI portfolio analysis showing a global water laboratory monitoring experience across regions, dates, water types, and isotope measures.": {
    "el": "Ανεξάρτητο δείγμα ανάλυσης Power BI για την παρακολούθηση εργαστηρίων υδάτων διεθνώς, ανά περιοχή, ημερομηνία, τύπο νερού και ισοτοπικές μετρήσεις.",
    "de": "Ein unabhängiges Power-BI-Analysebeispiel zur weltweiten Überwachung von Wasserlaboren nach Region, Datum, Wasserart und Isotopenmessung."
  },
  "Analytics Roadmap: What to Do in the First 90 Days": {
    "el": "Πλάνο ανάλυσης δεδομένων: τι να κάνετε τις πρώτες 90 ημέρες",
    "de": "Analytics-Roadmap: Was in den ersten 90 Tagen zu tun ist"
  },
  "Analytics cookies:": {
    "el": "Cookies ανάλυσης επισκεψιμότητας:",
    "de": "Analyse-Cookies:"
  },
  "Analytics growth needs governance. Clear ownership, access controls, and GDPR-aware processes help teams scale without weakening trust.": {
    "el": "Η επέκταση της ανάλυσης δεδομένων χρειάζεται διακυβέρνηση. Σαφείς αρμοδιότητες, έλεγχοι πρόσβασης και διαδικασίες που λαμβάνουν υπόψη τον GDPR βοηθούν τις ομάδες να αναπτύσσονται χωρίς να χάνουν την εμπιστοσύνη.",
    "de": "Wachsende Datenanalysen brauchen Governance. Klare Verantwortlichkeiten, Zugriffskontrollen und DSGVO-orientierte Prozesse ermöglichen Skalierung, ohne das Vertrauen zu schwächen."
  },
  "Anthropic AI:": {
    "el": "Anthropic AI:",
    "de": "Anthropic AI:"
  },
  "BI & reporting": {
    "el": "BI και αναφορές",
    "de": "BI und Reporting"
  },
  "BI Consulting: When Dashboards Become Business Infrastructure": {
    "el": "Συμβουλευτική BI: όταν τα dashboards γίνονται επιχειρηματική υποδομή",
    "de": "BI-Beratung: Wenn Dashboards zur Geschäftsinfrastruktur werden"
  },
  "BI Solutions Group provides business consulting, data analytics, artificial intelligence, business intelligence, and digital transformation services. Our products and services may include AI Advisor, Quantus, Power BI Solutions, Bonusaki, and website or application portfolio services.": {
    "el": "Η BI Solutions Group παρέχει υπηρεσίες επιχειρηματικής συμβουλευτικής, ανάλυσης δεδομένων, τεχνητής νοημοσύνης, επιχειρηματικής ευφυΐας και ψηφιακού μετασχηματισμού. Στα προϊόντα και στις υπηρεσίες μας μπορεί να περιλαμβάνονται τα AI Advisor, Quantus, Power BI Solutions και Bonusaki, καθώς και οι υπηρεσίες ιστοσελίδων ή εφαρμογών που παρουσιάζονται στη συλλογή έργων μας.",
    "de": "BI Solutions Group bietet Unternehmensberatung, Datenanalysen, künstliche Intelligenz, Business Intelligence und digitalen Wandel. Zu unseren Produkten und Leistungen können AI Advisor, Quantus, Power BI Solutions und Bonusaki sowie die in unserem Portfolio vorgestellten Website- und Anwendungsleistungen gehören."
  },
  "BI Solutions Group, based in Greece, is the controller of the personal data processed through this website and our services.": {
    "el": "Η BI Solutions Group, με έδρα την Ελλάδα, είναι υπεύθυνη για την επεξεργασία των προσωπικών δεδομένων μέσω αυτού του ιστοτόπου και των υπηρεσιών μας.",
    "de": "Die BI Solutions Group mit Sitz in Griechenland ist der Verantwortliche für die personenbezogenen Daten, die über diese Website und unsere Dienste verarbeitet werden."
  },
  "Because this is an independent demonstration rather than a client engagement, outcomes are described as delivered capabilities—not invented performance metrics.": {
    "el": "Πρόκειται για ανεξάρτητο δείγμα έργου και όχι για συνεργασία με πελάτη. Γι’ αυτό παρουσιάζονται οι λειτουργίες που υλοποιήθηκαν, χωρίς επινοημένους δείκτες απόδοσης.",
    "de": "Es handelt sich um ein unabhängiges Beispiel und nicht um einen Kundenauftrag. Daher beschreiben die Ergebnisse die umgesetzten Funktionen, ohne erfundene Leistungskennzahlen."
  },
  "Bonusaki demo events:": {
    "el": "Συμβάντα της επίδειξης Bonusaki:",
    "de": "Bonusaki-Demo-Events:"
  },
  "Bonusaki pilot data:": {
    "el": "Δεδομένα πιλοτικής λειτουργίας του Bonusaki:",
    "de": "Bonusaki-Pilotdaten:"
  },
  "Breadcrumb": {
    "el": "Διαδρομή πλοήγησης",
    "de": "Navigationspfad"
  },
  "Cloud Data Warehouse vs Spreadsheets: When the Move Becomes Worth It": {
    "el": "Αποθήκη δεδομένων στο cloud ή υπολογιστικά φύλλα: πότε αξίζει η μετάβαση",
    "de": "Cloud Data Warehouse oder Tabellenkalkulationen: Wann sich der Wechsel lohnt"
  },
  "Concrete report outputs": {
    "el": "Συγκεκριμένα παραδοτέα αναφορών",
    "de": "Konkrete Reporting-Ergebnisse"
  },
  "Connect leadership-level recruitment activity with record-level applicant investigation.": {
    "el": "Συνδέστε τη συνολική εικόνα προσλήψεων για τη διοίκηση με τη διερεύνηση κάθε υποψηφίου ξεχωριστά.",
    "de": "Verbinden Sie die Recruiting-Übersicht für Führungskräfte mit der Analyse einzelner Bewerberdatensätze."
  },
  "Country-office audit reporting spans several audiences and questions: where risk is concentrated, how audit ratings vary, and whether recommendations are being implemented. The portfolio brief was to make those questions explorable without losing the detail behind each office.": {
    "el": "Οι αναφορές ελέγχων για τα γραφεία ανά χώρα απευθύνονται σε διαφορετικά κοινά και ερωτήματα: πού συγκεντρώνεται ο κίνδυνος, πώς διαφέρουν οι αξιολογήσεις και αν υλοποιούνται οι συστάσεις. Στόχος αυτού του δείγματος έργου ήταν να μπορούν να διερευνηθούν αυτά τα ερωτήματα χωρίς να χάνονται τα αναλυτικά στοιχεία κάθε γραφείου.",
    "de": "Prüfungsberichte für Länderbüros richten sich an verschiedene Zielgruppen und beantworten unterschiedliche Fragen: Wo konzentrieren sich Risiken, wie unterscheiden sich die Bewertungen und werden Empfehlungen umgesetzt? Das Analysebeispiel sollte diese Fragen untersuchbar machen, ohne die Details einzelner Büros zu verlieren."
  },
  "Curated BI Solutions resources on business intelligence, semantic modeling, AI workflows, data strategy, and web app delivery.": {
    "el": "Επιλεγμένοι οδηγοί της BI Solutions για επιχειρηματική ευφυΐα, σημασιολογική μοντελοποίηση, ροές εργασίας AI, στρατηγική δεδομένων και ανάπτυξη διαδικτυακών εφαρμογών.",
    "de": "Ausgewählte Ressourcen von BI Solutions zu Business Intelligence, semantischer Modellierung, KI-Workflows, Datenstrategie und Webanwendungen."
  },
  "Dashboard Requirements: What to Define Before a Power BI Build": {
    "el": "Απαιτήσεις dashboard: τι να ορίσετε πριν από την υλοποίηση στο Power BI",
    "de": "Dashboard-Anforderungen: Was vor der Umsetzung in Power BI feststehen sollte"
  },
  "Data Quality Checklist for Analytics Projects": {
    "el": "Λίστα ελέγχου ποιότητας δεδομένων για έργα ανάλυσης",
    "de": "Datenqualitäts-Checkliste für Analytics-Projekte"
  },
  "Data Strategy Before AI: Why Companies Need Better Foundations First": {
    "el": "Στρατηγική δεδομένων πριν από την AI: γιατί οι εταιρείες χρειάζονται πρώτα καλύτερες υποδομές",
    "de": "Datenstrategie vor KI: Warum Unternehmen zuerst bessere Grundlagen brauchen"
  },
  "Deeper guides for teams planning AI, analytics, and delivery work.": {
    "el": "Αναλυτικοί οδηγοί για ομάδες που σχεδιάζουν έργα AI, ανάλυσης δεδομένων και υλοποίησης λύσεων.",
    "de": "Vertiefende Leitfäden für Teams, die KI-, Analyse- und Umsetzungsprojekte planen."
  },
  "Delivered": {
    "el": "Παραδοτέο",
    "de": "Umgesetzt"
  },
  "Evaluation and ownership": {
    "el": "Αξιολόγηση και αρμοδιότητες",
    "de": "Bewertung und Verantwortlichkeiten"
  },
  "Executive and operational dashboards with agreed KPIs, clear filters, and the detail people need to act.": {
    "el": "Dashboards διοίκησης και καθημερινής λειτουργίας, με συμφωνημένους KPI, σαφή φίλτρα και τις λεπτομέρειες που χρειάζονται οι χρήστες για να ενεργήσουν.",
    "de": "Management- und operative Dashboards mit abgestimmten KPIs, klaren Filtern und den Details, die Mitarbeitende für Entscheidungen benötigen."
  },
  "Explore an audit-compliance dashboard covering risk, expenditure, and recommendation progress. This uses mock data and was not commissioned by or endorsed by UNICEF.": {
    "el": "Εξερευνήστε ένα dashboard παρακολούθησης συμμόρφωσης προς συστάσεις ελέγχων, με στοιχεία κινδύνων, δαπανών και προόδου υλοποίησης. Χρησιμοποιεί εικονικά δεδομένα και δεν δημιουργήθηκε κατόπιν ανάθεσης ούτε εγκρίθηκε από τη UNICEF.",
    "de": "Entdecken Sie ein Dashboard zur Prüfungsnachverfolgung mit Risiken, Ausgaben und dem Fortschritt von Empfehlungen. Es verwendet synthetische Daten und wurde weder von UNICEF beauftragt noch von UNICEF bestätigt."
  },
  "Explore the decisions behind better reporting, AI, and digital delivery.": {
    "el": "Εξερευνήστε τις αποφάσεις που οδηγούν σε καλύτερες αναφορές, λύσεις AI και ψηφιακές υλοποιήσεις.",
    "de": "Entdecken Sie die Entscheidungen hinter besserem Reporting, KI-Lösungen und digitalen Projekten."
  },
  "Explore the related service": {
    "el": "Δείτε τη σχετική υπηρεσία",
    "de": "Die zugehörige Leistung ansehen"
  },
  "Explore the service behind dashboard strategy, semantic models, KPI definitions, access, governance, and Power BI delivery.": {
    "el": "Δείτε την υπηρεσία που καλύπτει τη στρατηγική dashboards, τα σημασιολογικά μοντέλα, τους ορισμούς KPI, την πρόσβαση, τη διακυβέρνηση και την υλοποίηση στο Power BI.",
    "de": "Erfahren Sie mehr über unsere Leistungen für Dashboard-Strategie, semantische Modelle, KPI-Definitionen, Zugriffsrechte, Governance und die Umsetzung in Power BI."
  },
  "Filter insights by topic": {
    "el": "Φιλτράρισμα άρθρων ανά θέμα",
    "de": "Beiträge nach Thema filtern"
  },
  "Find answers in approved company knowledge": {
    "el": "Βρείτε απαντήσεις σε εγκεκριμένες εταιρικές πηγές γνώσης",
    "de": "Antworten in freigegebenen Wissensquellen des Unternehmens finden"
  },
  "Format": {
    "el": "Μορφή",
    "de": "Format"
  },
  "Founder of BI Solutions Group. Data, analytics, and AI consulting with a clear scope, direct communication, and documented delivery.": {
    "el": "Ιδρυτής της BI Solutions Group. Συμβουλευτική δεδομένων, ανάλυσης και AI με σαφές αντικείμενο, άμεση επικοινωνία και τεκμηριωμένη υλοποίηση.",
    "de": "Gründer von BI Solutions Group. Beratung zu Daten, Analysen und KI mit klarem Projektumfang, direkter Kommunikation und dokumentierter Umsetzung."
  },
  "Global talent acquisition": {
    "el": "Διεθνείς προσλήψεις προσωπικού",
    "de": "Internationale Personalgewinnung"
  },
  "Google Ads:": {
    "el": "Google Ads:",
    "de": "Google Ads:"
  },
  "Google Analytics and Google Ads measurement are optional and have separate choices in our cookie notice. Neither is loaded until you permit the relevant measurement. We remember your choices in local storage for up to 180 days. Previous consent to analytics alone does not enable advertising measurement. You can reject both, choose either, or change and withdraw permission using the Cookie settings button. Changing a saved choice may reload the page; save any unfinished form first.": {
    "el": "Η μέτρηση μέσω Google Analytics και Google Ads είναι προαιρετική, με ξεχωριστές επιλογές στην ειδοποίηση cookies. Κανένα από τα δύο δεν φορτώνεται πριν επιτρέψετε την αντίστοιχη μέτρηση. Αποθηκεύουμε τις επιλογές σας τοπικά για έως 180 ημέρες. Προηγούμενη συγκατάθεση μόνο για ανάλυση επισκεψιμότητας δεν ενεργοποιεί τη διαφημιστική μέτρηση. Μπορείτε να απορρίψετε και τα δύο, να επιλέξετε ένα από τα δύο ή να αλλάξετε και να ανακαλέσετε τη συγκατάθεσή σας από το κουμπί «Ρυθμίσεις cookies». Η αλλαγή αποθηκευμένης επιλογής μπορεί να προκαλέσει επαναφόρτωση της σελίδας· αποθηκεύστε πρώτα τυχόν μη ολοκληρωμένη φόρμα.",
    "de": "Die Messung über Google Analytics und Google Ads ist optional. Unser Cookie-Hinweis bietet dafür getrennte Auswahlmöglichkeiten. Beide Dienste werden erst nach Ihrer jeweiligen Einwilligung geladen. Wir speichern Ihre Auswahl bis zu 180 Tage lokal. Eine frühere Einwilligung allein in die Webanalyse aktiviert keine Werbemessung. Sie können beide ablehnen, einen der Dienste auswählen oder Ihre Einwilligung über „Cookie-Einstellungen“ ändern und widerrufen. Eine Änderung kann die Seite neu laden; sichern Sie zuvor unvollständige Formulareingaben."
  },
  "Grouped candidate, job, interview, and hiring information into a consistent review flow.": {
    "el": "Τα στοιχεία υποψηφίων, θέσεων, συνεντεύξεων και προσλήψεων οργανώθηκαν σε ενιαία ροή αξιολόγησης.",
    "de": "Bewerber-, Stellen-, Gesprächs- und Einstellungsdaten wurden zu einem einheitlichen Prüfablauf zusammengeführt."
  },
  "Home": {
    "el": "Αρχική",
    "de": "Startseite"
  },
  "IFC-style talent analytics dashboard": {
    "el": "Dashboard ανάλυσης ανθρώπινου δυναμικού τύπου IFC",
    "de": "Dashboard für Personalanalysen im IFC-Stil"
  },
  "If a live merchant pilot is enabled, reward issue and redemption records, signed redemption tokens, cashier validation activity, merchant campaign data, and hashed customer email values where an email is provided.": {
    "el": "Αν ενεργοποιηθεί πιλοτική λειτουργία με πραγματική επιχείρηση, καταγράφονται η έκδοση και η εξαργύρωση ανταμοιβών, τα ψηφιακά υπογεγραμμένα διακριτικά εξαργύρωσης, οι ενέργειες επιβεβαίωσης από ταμίες, τα δεδομένα της καμπάνιας της επιχείρησης και οι κατακερματισμένες τιμές email πελατών, όπου παρέχεται διεύθυνση email.",
    "de": "Bei einem aktivierten Pilotbetrieb mit einem Händler werden Prämienausgaben und -einlösungen, signierte Einlösungstoken, Bestätigungen durch Kassenpersonal, Händlerkampagnendaten und gehashte Kunden-E-Mail-Adressen erfasst, sofern eine E-Mail-Adresse angegeben wird."
  },
  "If a post maps to a real delivery problem in your team, we can move that conversation into concrete architecture, product, or implementation work.": {
    "el": "Αν ένα άρθρο αφορά πραγματική ανάγκη υλοποίησης της ομάδας σας, μπορούμε να μετατρέψουμε τη συζήτηση σε συγκεκριμένο έργο αρχιτεκτονικής, προϊόντος ή ανάπτυξης.",
    "de": "Wenn ein Beitrag eine konkrete Umsetzungsaufgabe Ihres Teams anspricht, können wir daraus ein Architektur-, Produkt- oder Implementierungsprojekt entwickeln."
  },
  "If you believe your rights have not been respected, you may lodge a complaint with the Hellenic Data Protection Authority at": {
    "el": "Εάν πιστεύετε ότι τα δικαιώματά σας δεν έχουν γίνει σεβαστά, μπορείτε να υποβάλετε καταγγελία στην Ελληνική Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα στη διεύθυνση",
    "de": "Wenn Sie der Ansicht sind, dass Ihre Rechte nicht gewahrt wurden, können Sie sich bei der griechischen Datenschutzbehörde beschweren. Weitere Informationen finden Sie unter"
  },
  "Independent Power BI audit-compliance demonstration using mock data": {
    "el": "Ανεξάρτητο δείγμα Power BI για παρακολούθηση συμμόρφωσης προς συστάσεις ελέγχων, με εικονικά δεδομένα",
    "de": "Unabhängiges Power-BI-Beispiel zur Prüfungsnachverfolgung mit synthetischen Daten"
  },
  "Independent Power BI demonstration of a country-office audit compliance dashboard": {
    "el": "Ανεξάρτητο δείγμα dashboard Power BI για παρακολούθηση ελέγχων στα γραφεία ανά χώρα",
    "de": "Unabhängiges Power-BI-Beispiel für ein Dashboard zur Prüfungsnachverfolgung in Länderbüros"
  },
  "Independent Power BI demonstration of a global talent acquisition dashboard": {
    "el": "Ανεξάρτητο δείγμα dashboard Power BI για διεθνείς προσλήψεις προσωπικού",
    "de": "Unabhängiges Power-BI-Beispiel für ein Dashboard zur internationalen Personalgewinnung"
  },
  "Independent Power BI demonstration of a global water laboratory analysis dashboard": {
    "el": "Ανεξάρτητο δείγμα dashboard Power BI για ανάλυση δεδομένων εργαστηρίων υδάτων διεθνώς",
    "de": "Unabhängiges Power-BI-Beispiel für ein Dashboard zur weltweiten Analyse von Wasserlabordaten"
  },
  "Independent dashboard design and development": {
    "el": "Ανεξάρτητος σχεδιασμός και ανάπτυξη dashboard",
    "de": "Unabhängige Konzeption und Entwicklung eines Dashboards"
  },
  "Independent portfolio analysis": {
    "el": "Ανεξάρτητο δείγμα ανάλυσης δεδομένων",
    "de": "Unabhängiges Analysebeispiel"
  },
  "Independent portfolio demonstration": {
    "el": "Ανεξάρτητο δείγμα έργου",
    "de": "Unabhängiges Projektbeispiel"
  },
  "Ioannis Bekas, founder of BI Solutions Group": {
    "el": "Ιωάννης Μπέκας, ιδρυτής της BI Solutions Group",
    "de": "Ioannis Bekas, Gründer der BI Solutions Group"
  },
  "KPI Dictionary: The Small BI Asset That Prevents Big Reporting Arguments": {
    "el": "Λεξικό KPI: ένα μικρό εργαλείο BI που προλαμβάνει μεγάλες διαφωνίες στις αναφορές",
    "de": "KPI-Verzeichnis: Ein kleines BI-Werkzeug, das große Diskussionen über Berichte verhindert"
  },
  "Keep source, location, diversity, qualifications, and funnel status available for comparison.": {
    "el": "Διατηρήστε διαθέσιμα για σύγκριση τα στοιχεία προέλευσης, τοποθεσίας, διαφορετικότητας, προσόντων και σταδίου επιλογής των υποψηφίων.",
    "de": "Halten Sie Angaben zu Bewerberquelle, Standort, Diversität, Qualifikationen und Auswahlphase vergleichbar verfügbar."
  },
  "Legal": {
    "el": "Νομικές πληροφορίες",
    "de": "Rechtliche Informationen"
  },
  "Legitimate interests:": {
    "el": "Έννομα συμφέροντα:",
    "de": "Berechtigte Interessen:"
  },
  "MLOps for Small and Mid-Sized Teams: How to Productionize AI Workflows": {
    "el": "MLOps για μικρές και μεσαίες ομάδες: πώς να θέσετε τις ροές AI σε παραγωγική λειτουργία",
    "de": "MLOps für kleine und mittlere Teams: KI-Workflows in den produktiven Betrieb überführen"
  },
  "MLOps is not only for large technology companies. Smaller teams also need versioning, deployment habits, and reliable AI workflow operations.": {
    "el": "Το MLOps δεν αφορά μόνο μεγάλες τεχνολογικές εταιρείες. Και οι μικρότερες ομάδες χρειάζονται διαχείριση εκδόσεων, σταθερές διαδικασίες εγκατάστασης και αξιόπιστη λειτουργία των ροών AI.",
    "de": "MLOps ist nicht nur für große Technologieunternehmen gedacht. Auch kleinere Teams brauchen Versionsverwaltung, verlässliche Bereitstellungsprozesse und einen stabilen Betrieb ihrer KI-Workflows."
  },
  "Make time-series behavior readable without hiding the current pH and temperature context.": {
    "el": "Παρουσιάστε ευανάγνωστα τις μεταβολές στον χρόνο, χωρίς να χάνονται οι τρέχουσες τιμές pH και θερμοκρασίας.",
    "de": "Machen Sie zeitliche Verläufe verständlich, ohne die aktuellen pH- und Temperaturwerte auszublenden."
  },
  "Meet Ioannis": {
    "el": "Γνωρίστε τον Ιωάννη",
    "de": "Ioannis kennenlernen"
  },
  "Model Monitoring for AI Workflows: What to Watch After Launch": {
    "el": "Παρακολούθηση μοντέλων σε ροές AI: τι να ελέγχετε μετά την έναρξη λειτουργίας",
    "de": "Modellüberwachung für KI-Workflows: Was Sie nach der Einführung beachten sollten"
  },
  "Your name and email address, plus a password stored as a hash.": {
    "el": "Το όνομα και η διεύθυνση email σας, καθώς και ο κωδικός πρόσβασης αποθηκευμένος ως κρυπτογραφικό αποτύπωμα (hash).",
    "de": "Ihr Name und Ihre E-Mail-Adresse sowie Ihr als Hash gespeichertes Passwort."
  },
  "Open article": {
    "el": "Άνοιγμα άρθρου",
    "de": "Artikel öffnen"
  },
  "Paired filterable time-series charts with current summary measures for faster orientation.": {
    "el": "Τα φιλτραριζόμενα γραφήματα χρονοσειρών συνδυάστηκαν με συνοπτικούς δείκτες της τρέχουσας κατάστασης για ταχύτερη κατανόηση.",
    "de": "Filterbare Zeitreihendiagramme wurden mit aktuellen Kennzahlen kombiniert, um einen schnelleren Überblick zu ermöglichen."
  },
  "Practical guides for BI, AI, data strategy, and web app delivery.": {
    "el": "Πρακτικοί οδηγοί για BI, AI, στρατηγική δεδομένων και ανάπτυξη διαδικτυακών εφαρμογών.",
    "de": "Praktische Leitfäden für BI, KI, Datenstrategie und Web-App-Bereitstellung."
  },
  "Predictive Analytics: Common Forecasting Mistakes Business Teams Make": {
    "el": "Προγνωστική ανάλυση: συνηθισμένα λάθη πρόβλεψης στις επιχειρήσεις",
    "de": "Prädiktive Analysen: Häufige Prognosefehler in Unternehmen"
  },
  "Pretty dashboards can hide weak models. Clean semantic modeling is what makes Power BI reports faster, clearer, and easier to govern.": {
    "el": "Ένα καλαίσθητο dashboard μπορεί να κρύβει αδύναμα μοντέλα. Η σωστή σημασιολογική μοντελοποίηση κάνει τις αναφορές Power BI πιο γρήγορες, σαφείς και εύκολες στη διαχείριση.",
    "de": "Hübsche Dashboards können schwache Modelle verbergen. Eine saubere semantische Modellierung macht Power BI-Berichte schneller, klarer und einfacher zu verwalten."
  },
  "Privacy enquiries can be submitted through the": {
    "el": "Μπορείτε να υποβάλετε αιτήματα σχετικά με το απόρρητο μέσω της",
    "de": "Für Datenschutzanfragen nutzen Sie bitte unsere"
  },
  "Privacy policy and data protection information for BI Solutions Group.": {
    "el": "Πολιτική απορρήτου και πληροφορίες προστασίας δεδομένων της BI Solutions Group.",
    "de": "Datenschutzbestimmungen und Datenschutzinformationen der BI Solutions Group."
  },
  "Prompt Workflow Design: Turning AI Prompts Into Repeatable Business Processes": {
    "el": "Σχεδιασμός ροών με prompts: από τις εντολές AI σε επαναλήψιμες επιχειρηματικές διαδικασίες",
    "de": "Workflows mit Prompts gestalten: KI-Anweisungen in wiederholbare Geschäftsprozesse überführen"
  },
  "Prompts create more value when they become reusable workflows with inputs, review rules, outputs, and ownership.": {
    "el": "Τα prompts προσφέρουν περισσότερη αξία όταν εντάσσονται σε επαναχρησιμοποιήσιμες ροές εργασίας, με καθορισμένα δεδομένα εισόδου, κανόνες ελέγχου, αποτελέσματα και υπευθύνους.",
    "de": "Prompts schaffen mehr Wert, wenn sie Teil wiederverwendbarer Workflows mit definierten Eingaben, Prüfregeln, Ergebnissen und Verantwortlichkeiten sind."
  },
  "Public evidence": {
    "el": "Δημόσια τεκμηρίωση",
    "de": "Öffentlich zugängliche Nachweise"
  },
  "Read experience and background": {
    "el": "Δείτε την εμπειρία και το επαγγελματικό υπόβαθρο",
    "de": "Erfahrung und Hintergrund ansehen"
  },
  "Record privacy-safe actions such as demo views, tab switches, scratch-card interactions, wallet-preview clicks, and cashier simulation outcomes. These events do not include reward secrets or customer email addresses.": {
    "el": "Καταγράφονται ενέργειες που προστατεύουν το απόρρητο, όπως προβολές της επίδειξης, αλλαγές καρτελών, αλληλεπιδράσεις με ξυστά, κλικ στην προεπισκόπηση πορτοφολιού και αποτελέσματα προσομοίωσης ταμείου. Τα συμβάντα αυτά δεν περιλαμβάνουν μυστικούς κωδικούς ανταμοιβών ή διευθύνσεις email πελατών.",
    "de": "Erfasst werden datenschutzschonende Aktionen wie Demoaufrufe, Tab-Wechsel, Rubbellos-Interaktionen, Klicks auf die Wallet-Vorschau und Ergebnisse der Kassensimulation. Diese Ereignisse enthalten weder geheime Prämiendaten noch E-Mail-Adressen von Kunden."
  },
  "Recruitment data connected from application funnel to candidate detail": {
    "el": "Δεδομένα προσλήψεων που συνδέουν τα στάδια επιλογής με τα αναλυτικά στοιχεία υποψηφίων",
    "de": "Recruiting-Daten von den Bewerbungsphasen bis zu den Details einzelner Kandidaten"
  },
  "Recruitment reporting must serve several levels at once: leadership needs a global funnel view, while recruiters and hiring managers need to inspect an individual application. The portfolio brief was to connect both without turning the dashboard into a dense data table.": {
    "el": "Οι αναφορές προσλήψεων εξυπηρετούν διαφορετικές ανάγκες: η διοίκηση χρειάζεται συνολική εικόνα των σταδίων επιλογής, ενώ οι υπεύθυνοι προσλήψεων εξετάζουν κάθε αίτηση ξεχωριστά. Στόχος του δείγματος έργου ήταν να συνδεθούν και οι δύο οπτικές, χωρίς το dashboard να μετατραπεί σε έναν δυσανάγνωστο πίνακα δεδομένων.",
    "de": "Recruiting-Berichte müssen mehrere Ebenen abdecken: Führungskräfte brauchen eine Gesamtübersicht der Auswahlphasen, während Personalverantwortliche einzelne Bewerbungen prüfen. Das Projektbeispiel sollte beides verbinden, ohne das Dashboard in eine überladene Datentabelle zu verwandeln."
  },
  "Refresh setup, performance checks, documentation, and walkthroughs so your team can maintain the work.": {
    "el": "Ρύθμιση ανανέωσης δεδομένων, έλεγχοι απόδοσης, τεκμηρίωση και παρουσιάσεις χρήσης, ώστε η ομάδα σας να μπορεί να συντηρεί τη λύση.",
    "de": "Einrichtung der Datenaktualisierung, Leistungsprüfungen, Dokumentation und Einweisungen, damit Ihr Team die Lösung selbst warten kann."
  },
  "Related service": {
    "el": "Σχετική υπηρεσία",
    "de": "Zugehörige Leistung"
  },
  "Relationship note:": {
    "el": "Διευκρίνιση για τη σχέση με τον οργανισμό:",
    "de": "Hinweis zur Beziehung zur Organisation:"
  },
  "Resend:": {
    "el": "Resend:",
    "de": "Resend:"
  },
  "Role metadata covering recruiter, department, grade, and employment type.": {
    "el": "Στοιχεία της θέσης εργασίας: υπεύθυνος προσλήψεων, τμήμα, βαθμίδα και τύπος απασχόλησης.",
    "de": "Stellenangaben zu Personalverantwortlichem, Abteilung, Einstufung und Beschäftigungsart."
  },
  "Scientific monitoring data becomes difficult to compare when laboratories, geographies, dates, water types, and measurement dimensions all need to remain visible. The portfolio brief was to create a compact view that supports both global scanning and specific comparisons.": {
    "el": "Η σύγκριση δεδομένων επιστημονικής παρακολούθησης γίνεται δύσκολη όταν πρέπει να παραμένουν ορατά τα εργαστήρια, οι περιοχές, οι ημερομηνίες, οι τύποι νερού και οι παράμετροι μέτρησης. Στόχος του δείγματος έργου ήταν μια συμπαγής προβολή για γρήγορη συνολική επισκόπηση και συγκεκριμένες συγκρίσεις.",
    "de": "Wissenschaftliche Messdaten lassen sich schwer vergleichen, wenn Labore, Standorte, Zeitpunkte, Wasserarten und Messparameter gleichzeitig sichtbar bleiben müssen. Das Projektbeispiel sollte eine kompakte Ansicht für den schnellen Gesamtüberblick und gezielte Vergleiche bieten."
  },
  "See a reporting problem made explorable.": {
    "el": "Δείτε πώς ένα πρόβλημα αναφορών μετατρέπεται σε διαδραστική ανάλυση.",
    "de": "Erleben Sie, wie eine Reporting-Frage interaktiv untersucht werden kann."
  },
  "See our": {
    "el": "Δείτε την",
    "de": "Lesen Sie unsere"
  },
  "Start with a practical buyer question.": {
    "el": "Ξεκινήστε με ένα πρακτικό ερώτημα για την επιλογή λύσης.",
    "de": "Beginnen Sie mit einer konkreten Frage zur Auswahl einer Lösung."
  },
  "Started with the decisions each audience would need to make, then separated overview, risk, and implementation views.": {
    "el": "Αρχικά προσδιορίστηκαν οι αποφάσεις κάθε ομάδας χρηστών και στη συνέχεια διαχωρίστηκαν οι προβολές συνολικής εικόνας, κινδύνων και υλοποίησης.",
    "de": "Zunächst wurden die Entscheidungen der jeweiligen Zielgruppen ermittelt. Anschließend entstanden getrennte Ansichten für Überblick, Risiken und Umsetzung."
  },
  "Store user preferences where supported.": {
    "el": "Αποθηκεύουν τις προτιμήσεις των χρηστών, όπου υποστηρίζεται αυτή η δυνατότητα.",
    "de": "Speichern Benutzereinstellungen, soweit diese Funktion unterstützt wird."
  },
  "Strong dashboards start before design. Define decisions, users, KPIs, sources, refresh needs, and ownership before building visuals.": {
    "el": "Τα αξιόπιστα dashboards ξεκινούν πριν από τον οπτικό σχεδιασμό. Καθορίστε αποφάσεις, χρήστες, KPI, πηγές, ανάγκες ανανέωσης και υπευθύνους πριν δημιουργήσετε τις απεικονίσεις.",
    "de": "Gute Dashboards beginnen vor dem visuellen Design. Definieren Sie Entscheidungen, Nutzer, KPIs, Quellen, Aktualisierungsbedarf und Verantwortlichkeiten, bevor Sie Visualisierungen erstellen."
  },
  "Structured the first page around the application funnel and the dimensions that influence it.": {
    "el": "Η πρώτη σελίδα οργανώθηκε γύρω από τα στάδια της διαδικασίας πρόσληψης και τους παράγοντες που τα επηρεάζουν.",
    "de": "Die erste Seite wurde nach den Phasen des Bewerbungsprozesses und ihren Einflussfaktoren gegliedert."
  },
  "Submit a privacy enquiry through the": {
    "el": "Υποβάλετε αίτημα σχετικά με το απόρρητο μέσω της",
    "de": "Für Datenschutzanfragen nutzen Sie bitte unsere"
  },
  "Submit an enquiry through the": {
    "el": "Υποβάλετε αίτημα μέσω της",
    "de": "Für Anfragen nutzen Sie bitte unsere"
  },
  "Tell us what needs to work better.": {
    "el": "Πείτε μας τι χρειάζεται να λειτουργεί καλύτερα.",
    "de": "Sagen Sie uns, was besser funktionieren muss."
  },
  "Terms of service for BI Solutions Group products and consulting services.": {
    "el": "Όροι χρήσης για τα προϊόντα και τις συμβουλευτικές υπηρεσίες της BI Solutions Group.",
    "de": "Nutzungsbedingungen für Produkte und Beratungsleistungen der BI Solutions Group."
  },
  "The first 90 days of analytics work should clarify priorities, data sources, reporting pain, governance gaps, and a delivery backlog.": {
    "el": "Οι πρώτες 90 ημέρες ενός έργου ανάλυσης δεδομένων πρέπει να ξεκαθαρίζουν τις προτεραιότητες, τις πηγές δεδομένων, τα προβλήματα στις αναφορές, τα κενά διακυβέρνησης και τη λίστα εργασιών προς υλοποίηση.",
    "de": "Die ersten 90 Tage eines Analyseprojekts sollten Prioritäten, Datenquellen, Reporting-Probleme, Governance-Lücken und die anstehenden Umsetzungsaufgaben klären."
  },
  "The public project notes document the filters, measurements, representative-data status, and interactive demonstration.": {
    "el": "Οι δημόσιες σημειώσεις του έργου περιγράφουν τα φίλτρα, τις μετρήσεις, τη χρήση αντιπροσωπευτικών δεδομένων και τη διαδραστική επίδειξη.",
    "de": "Die öffentlichen Projektnotizen beschreiben Filter, Messgrößen, den Einsatz repräsentativer Daten und die interaktive Demonstration."
  },
  "The public project notes document the report pages, filters, mock-data status, and interactive demonstration.": {
    "el": "Οι δημόσιες σημειώσεις του έργου περιγράφουν τις σελίδες αναφορών, τα φίλτρα, τη χρήση εικονικών δεδομένων και τη διαδραστική επίδειξη.",
    "de": "Die öffentlichen Projektnotizen beschreiben Berichtsseiten, Filter, den Einsatz synthetischer Daten und die interaktive Demonstration."
  },
  "The public project notes document the report pages, recruitment logic, synthetic-data status, and interactive demonstration.": {
    "el": "Οι δημόσιες σημειώσεις του έργου περιγράφουν τις σελίδες αναφορών, τη λογική προσλήψεων, τη χρήση συνθετικών δεδομένων και τη διαδραστική επίδειξη.",
    "de": "Die öffentlichen Projektnotizen beschreiben Berichtsseiten, Recruiting-Logik, den Einsatz synthetischer Daten und die interaktive Demonstration."
  },
  "The service terms for BI Solutions Group consulting, products, AI workflows, and website use.": {
    "el": "Όροι χρήσης για τη συμβουλευτική, τα προϊόντα, τις ροές AI και τον ιστότοπο της BI Solutions Group.",
    "de": "Die Servicebedingungen für BI Solutions Group-Beratung, Produkte, KI-Workflows und Website-Nutzung."
  },
  "These terms are governed by Greek law. Any dispute arising from use of our services will be subject to the competent courts of Thessaloniki, Greece. Before starting legal proceedings, we encourage good-faith resolution by submitting an enquiry through the": {
    "el": "Οι παρόντες όροι διέπονται από το ελληνικό δίκαιο. Για κάθε διαφορά από τη χρήση των υπηρεσιών μας αρμόδια είναι τα δικαστήρια της Θεσσαλονίκης, στην Ελλάδα. Πριν από την έναρξη δικαστικής διαδικασίας, ενθαρρύνουμε την καλόπιστη επίλυση της διαφοράς με την υποβολή αιτήματος μέσω της",
    "de": "Diese Bedingungen unterliegen griechischem Recht. Für Streitigkeiten aus der Nutzung unserer Dienste sind die zuständigen Gerichte in Thessaloniki, Griechenland, zuständig. Vor einem Gerichtsverfahren empfehlen wir eine einvernehmliche Klärung. Nutzen Sie dafür bitte unsere"
  },
  "This demonstration was created independently with fully synthetic data. It was not commissioned by, affiliated with, or endorsed by IFC or the World Bank Group.": {
    "el": "Το δείγμα αυτό δημιουργήθηκε ανεξάρτητα, με πλήρως συνθετικά δεδομένα. Δεν αποτελεί ανάθεση του IFC ή του Ομίλου της Παγκόσμιας Τράπεζας, ούτε συνδέεται με αυτούς ή έχει εγκριθεί από αυτούς.",
    "de": "Dieses Beispiel wurde unabhängig mit vollständig synthetischen Daten erstellt. Es wurde weder von der IFC noch von der Weltbankgruppe beauftragt oder bestätigt und steht in keiner Verbindung zu ihnen."
  },
  "This demonstration was created independently with mock data. It was not commissioned by, affiliated with, or endorsed by UNICEF.": {
    "el": "Το δείγμα αυτό δημιουργήθηκε ανεξάρτητα, με εικονικά δεδομένα. Δεν αποτελεί ανάθεση της UNICEF, ούτε συνδέεται με αυτήν ή έχει εγκριθεί από αυτήν.",
    "de": "Dieses Beispiel wurde unabhängig mit synthetischen Daten erstellt. Es wurde weder von UNICEF beauftragt noch bestätigt und steht in keiner Verbindung zu UNICEF."
  },
  "This demonstration was created independently with representative laboratory data. It was not commissioned by, affiliated with, or endorsed by the IAEA.": {
    "el": "Το δείγμα αυτό δημιουργήθηκε ανεξάρτητα, με αντιπροσωπευτικά εργαστηριακά δεδομένα. Δεν αποτελεί ανάθεση του ΔΟΑΕ, ούτε συνδέεται με αυτόν ή έχει εγκριθεί από αυτόν.",
    "de": "Dieses Beispiel wurde unabhängig mit repräsentativen Labordaten erstellt. Es wurde weder von der IAEA beauftragt noch bestätigt und steht in keiner Verbindung zu ihr."
  },
  "Time-series views for isotope concentration and temperature.": {
    "el": "Προβολές χρονοσειρών για τη συγκέντρωση ισοτόπων και τη θερμοκρασία.",
    "de": "Zeitreihenansichten für Isotopenkonzentration und Temperatur."
  },
  "To exercise your rights, submit a request through the": {
    "el": "Για να ασκήσετε τα δικαιώματά σας, υποβάλετε αίτημα μέσω της",
    "de": "Zur Ausübung Ihrer Rechte nutzen Sie bitte unsere"
  },
  "To provide services you request or use.": {
    "el": "Για να παρέχουμε τις υπηρεσίες που ζητάτε ή χρησιμοποιείτε.",
    "de": "Um von Ihnen angeforderte oder genutzte Dienste bereitzustellen."
  },
  "Transmit malicious code or harmful content.": {
    "el": "Μετάδοση κακόβουλου κώδικα ή επιβλαβούς περιεχομένου.",
    "de": "Schadcode oder schädliche Inhalte übermitteln."
  },
  "Turn the ideas into a scoped BI, analytics, or AI workflow.": {
    "el": "Μετατρέψτε τις ιδέες σε ροή εργασίας BI, ανάλυσης δεδομένων ή AI με σαφώς καθορισμένο αντικείμενο.",
    "de": "Entwickeln Sie aus den Ideen einen klar abgegrenzten BI-, Analyse- oder KI-Workflow."
  },
  "Use automated access tools without permission.": {
    "el": "Χρήση εργαλείων αυτοματοποιημένης πρόσβασης χωρίς άδεια.",
    "de": "Automatisierte Zugriffswerkzeuge ohne Erlaubnis verwenden."
  },
  "Used a dedicated drill-through page to protect readability while preserving applicant detail.": {
    "el": "Χρησιμοποιήθηκε ξεχωριστή σελίδα drill-through για ευανάγνωστη παρουσίαση, διατηρώντας τα αναλυτικά στοιχεία κάθε υποψηφίου.",
    "de": "Es wurde eine spezielle Drill-Through-Seite verwendet, um die Lesbarkeit zu gewährleisten und gleichzeitig die Details des Bewerbers beizubehalten."
  },
  "Used consistent year, status, and observation-group filters so questions can carry across report pages.": {
    "el": "Χρησιμοποιήθηκαν κοινά φίλτρα έτους, κατάστασης και ομάδας παρατήρησης, ώστε η διερεύνηση να συνεχίζεται με το ίδιο πλαίσιο σε όλες τις σελίδες αναφορών.",
    "de": "Einheitliche Filter für Jahr, Status und Beobachtungsgruppe ermöglichen die Untersuchung derselben Fragestellung über mehrere Berichtsseiten hinweg."
  },
  "Used for advertising measurement when you allow it. Google tags can process online identifiers, page and device information, IP addresses, and enquiry-event information. Google may process data outside your country. See Google's": {
    "el": "Χρησιμοποιείται για διαφημιστική μέτρηση με τη συγκατάθεσή σας. Οι ετικέτες Google μπορούν να επεξεργάζονται διαδικτυακά αναγνωριστικά, πληροφορίες σελίδας και συσκευής, διευθύνσεις IP και στοιχεία συμβάντων υποβολής αιτημάτων. Η Google ενδέχεται να επεξεργάζεται δεδομένα εκτός της χώρας σας. Δείτε τις",
    "de": "Wird mit Ihrer Einwilligung für die Werbemessung verwendet. Google-Tags können Online-Kennungen, Seiten- und Geräteinformationen, IP-Adressen und Daten zu Anfrageereignissen verarbeiten. Google verarbeitet Daten möglicherweise außerhalb Ihres Landes. Weitere Informationen finden Sie in Googles"
  },
  "We define review and escalation points around the consequences of errors. Sensitive decisions and exceptions should have clear human ownership.": {
    "el": "Καθορίζουμε τα σημεία ανθρώπινου ελέγχου και παραπομπής ζητημάτων ανάλογα με τις συνέπειες των σφαλμάτων. Οι ευαίσθητες αποφάσεις και οι εξαιρέσεις πρέπει να έχουν σαφώς ορισμένο ανθρώπινο υπεύθυνο.",
    "de": "Wir legen Prüf- und Eskalationspunkte nach den möglichen Fehlerfolgen fest. Für sensible Entscheidungen und Ausnahmen muss klar sein, wer die menschliche Verantwortung trägt."
  },
  "What Greek businesses should expect from modern website and web app development: positioning, speed, conversion paths, and maintainable delivery.": {
    "el": "Τι να περιμένουν οι ελληνικές επιχειρήσεις από τη σύγχρονη ανάπτυξη ιστοσελίδων και διαδικτυακών εφαρμογών: σαφή τοποθέτηση, ταχύτητα, εύκολη μετάβαση από την επίσκεψη στην επικοινωνία ή αγορά και μια λύση που συντηρείται.",
    "de": "Was griechische Unternehmen von moderner Website- und Web-App-Entwicklung erwarten sollten: klare Positionierung, Geschwindigkeit, nachvollziehbare Wege zur Anfrage oder zum Kauf und eine wartbare Lösung."
  },
  "With your permission, Google Ads uses identifiers and successful enquiry events to measure whether advertising leads to enquiries. We do not send the form's name, email, company, or project description to Google Ads. Enhanced conversions and advertising personalization are not enabled by this implementation.": {
    "el": "Με τη συγκατάθεσή σας, το Google Ads χρησιμοποιεί αναγνωριστικά και συμβάντα επιτυχούς υποβολής αιτημάτων για να μετρά αν οι διαφημίσεις οδηγούν σε επικοινωνία. Δεν αποστέλλουμε στο Google Ads το όνομα, το email, την εταιρεία ή την περιγραφή έργου που συμπληρώνετε στη φόρμα. Η παρούσα υλοποίηση δεν ενεργοποιεί τις βελτιωμένες μετατροπές ή την εξατομίκευση διαφημίσεων.",
    "de": "Mit Ihrer Einwilligung nutzt Google Ads Kennungen und erfolgreiche Anfrageereignisse, um zu messen, ob Werbung zu Anfragen führt. Wir senden den Namen, die E-Mail-Adresse, das Unternehmen oder die Projektbeschreibung des Formulars nicht an Google Ads. Erweiterte Conversions und Werbepersonalisierung werden durch diese Implementierung nicht ermöglicht."
  },
  "project enquiry form": {
    "el": "φόρμα επικοινωνίας για έργα",
    "de": "Projektanfrage"
  },
  "5 min read": {
    "el": "Χρόνος ανάγνωσης: 5 λεπτά",
    "de": "5 Min. Lesezeit"
  },
  "A KPI dictionary documents the metric name, business definition, formula, source, owner, refresh cadence, and acceptable use. It does not need to be complicated to be valuable.": {
    "el": "Ένα λεξικό KPI καταγράφει το όνομα κάθε δείκτη, τον επιχειρηματικό ορισμό, τον τύπο υπολογισμού, την πηγή, τον υπεύθυνο, τη συχνότητα ανανέωσης και την ενδεδειγμένη χρήση του. Δεν χρειάζεται να είναι περίπλοκο για να είναι χρήσιμο.",
    "de": "Ein KPI-Verzeichnis dokumentiert für jede Kennzahl den Namen, die fachliche Definition, die Formel, die Quelle, die verantwortliche Person, den Aktualisierungsrhythmus und die zulässige Verwendung. Es muss nicht kompliziert sein, um nützlich zu sein."
  },
  "A Power BI report can look impressive while the underlying model is quietly creating problems. Slow visuals, duplicated measures, unclear naming, ambiguous relationships, and inconsistent KPI definitions usually start below the report canvas.": {
    "el": "Μια αναφορά Power BI μπορεί να φαίνεται εντυπωσιακή, ενώ το μοντέλο δεδομένων δημιουργεί προβλήματα στο παρασκήνιο. Αργές απεικονίσεις, διπλοί υπολογισμοί, ασαφείς ονομασίες, αμφίσημες σχέσεις και ασυνεπείς ορισμοί KPI συνήθως έχουν την αφετηρία τους στο μοντέλο και όχι στην εμφάνιση της αναφοράς.",
    "de": "Ein Power BI-Bericht kann beeindruckend aussehen, während das zugrunde liegende Modell stillschweigend Probleme verursacht. Langsame Grafiken, doppelte Kennzahlen, unklare Benennungen, mehrdeutige Beziehungen und inkonsistente KPI-Definitionen beginnen normalerweise unterhalb des Berichtsbereichs."
  },
  "A business website is no longer just a digital brochure. For many Greek companies, it is the first sales conversation, the first credibility check, and the first place where a potential client decides whether the company feels serious enough to contact.": {
    "el": "Μια εταιρική ιστοσελίδα δεν είναι πλέον απλώς ένα ψηφιακό φυλλάδιο. Για πολλές ελληνικές επιχειρήσεις αποτελεί την πρώτη επαφή με τον πελάτη και το πρώτο δείγμα αξιοπιστίας. Εκεί ο υποψήφιος πελάτης κρίνει αν η εταιρεία αποπνέει τον επαγγελματισμό που χρειάζεται για να επικοινωνήσει μαζί της.",
    "de": "Eine Unternehmenswebsite ist längst mehr als eine digitale Broschüre. Für viele griechische Unternehmen ist sie der erste Kundenkontakt und der erste Nachweis von Glaubwürdigkeit. Hier entscheiden potenzielle Kunden, ob das Unternehmen professionell genug wirkt, um Kontakt aufzunehmen."
  },
  "A company does not need an enterprise data platform before every AI experiment. It does need a minimum foundation for serious use: known data owners, documented priority datasets, clear access rules, basic data-quality checks, and a decision about what sensitive information must stay out of uncontrolled tools.": {
    "el": "Μια εταιρεία δεν χρειάζεται ολοκληρωμένη εταιρική πλατφόρμα δεδομένων πριν από κάθε πείραμα AI. Χρειάζεται όμως μια ελάχιστη υποδομή για ουσιαστική χρήση: ορισμένους υπευθύνους δεδομένων, τεκμηριωμένα σύνολα δεδομένων προτεραιότητας, σαφείς κανόνες πρόσβασης, βασικούς ελέγχους ποιότητας και απόφαση για το ποια ευαίσθητα στοιχεία δεν επιτρέπεται να εισάγονται σε μη ελεγχόμενα εργαλεία.",
    "de": "Ein Unternehmen braucht nicht vor jedem KI-Experiment eine vollständige Datenplattform. Für einen ernsthaften Einsatz benötigt es jedoch eine Mindestgrundlage: benannte Datenverantwortliche, dokumentierte prioritäre Datensätze, klare Zugriffsregeln, grundlegende Qualitätsprüfungen und eine Festlegung, welche sensiblen Informationen nicht in unkontrollierte Werkzeuge gelangen dürfen."
  },
  "A dashboard requirements workshop checklist": {
    "el": "Λίστα ελέγχου για συνάντηση προσδιορισμού απαιτήσεων dashboard",
    "de": "Eine Workshop-Checkliste für Dashboard-Anforderungen"
  },
  "A dictionary creates shared language": {
    "el": "Ένα λεξικό δημιουργεί κοινή γλώσσα",
    "de": "Ein Wörterbuch schafft eine gemeinsame Sprache"
  },
  "A fair comparison should include workflow fit, integration effort, security, reporting needs, change frequency, user adoption, and whether the process creates competitive advantage.": {
    "el": "Μια ουσιαστική σύγκριση εξετάζει την καταλληλότητα για τη ροή εργασίας, την προσπάθεια διασύνδεσης, την ασφάλεια, τις ανάγκες αναφορών, τη συχνότητα αλλαγών, την αποδοχή από τους χρήστες και το αν η διαδικασία προσφέρει ανταγωνιστικό πλεονέκτημα.",
    "de": "Ein fairer Vergleich sollte die Eignung des Arbeitsablaufs, den Integrationsaufwand, die Sicherheit, die Berichtsanforderungen, die Änderungshäufigkeit, die Benutzerakzeptanz und die Frage umfassen, ob der Prozess einen Wettbewerbsvorteil schafft."
  },
  "A machine learning or AI workflow can create value in a notebook and still fail in production. The problem is usually not the model alone. It is the operating process around the model: versioning, deployment, refresh, monitoring, documentation, and ownership.": {
    "el": "Μια ροή μηχανικής μάθησης ή AI μπορεί να αποδίδει σε ένα notebook και παρ’ όλα αυτά να αποτυγχάνει στην παραγωγική λειτουργία. Το πρόβλημα συνήθως δεν περιορίζεται στο μοντέλο. Αφορά και τις διαδικασίες γύρω του: διαχείριση εκδόσεων, εγκατάσταση, ανανέωση, παρακολούθηση, τεκμηρίωση και καθορισμό υπευθύνων.",
    "de": "Ein Machine-Learning- oder KI-Workflow kann in einem Notebook Mehrwert liefern und im produktiven Betrieb dennoch scheitern. Das Problem liegt meist nicht allein am Modell, sondern auch an den Abläufen darum: Versionsverwaltung, Bereitstellung, Aktualisierung, Überwachung, Dokumentation und klare Verantwortlichkeiten."
  },
  "A practical AI literacy program should explain prompting, verification, privacy, hallucination risk, review workflows, and appropriate use cases. It should also connect those lessons to the company's real tasks.": {
    "el": "Ένα πρακτικό πρόγραμμα εκπαίδευσης στην AI πρέπει να καλύπτει τη σύνταξη prompts, την επαλήθευση, το απόρρητο, τον κίνδυνο επινοημένων απαντήσεων, τις διαδικασίες ελέγχου και τις κατάλληλες χρήσεις. Πρέπει επίσης να συνδέει αυτές τις γνώσεις με πραγματικές εργασίες της εταιρείας.",
    "de": "Ein praxisnahes Programm zur KI-Kompetenz sollte Prompting, Verifikation, Datenschutz, das Risiko erfundener Antworten, Prüfabläufe und geeignete Anwendungsfälle vermitteln. Diese Inhalte sollten mit konkreten Aufgaben des Unternehmens verknüpft werden."
  },
  "A practical first version should include the core pages, the conversion route, the trust elements, and the analytics setup. It should also be built in a way that allows future additions without rebuilding everything from scratch.": {
    "el": "Μια πρακτική πρώτη έκδοση χρειάζεται τις βασικές σελίδες, σαφή διαδρομή προς την επικοινωνία ή την αγορά, στοιχεία αξιοπιστίας και ρύθμιση μέτρησης επισκεψιμότητας. Η κατασκευή της πρέπει να επιτρέπει μελλοντικές προσθήκες χωρίς επανασχεδιασμό από την αρχή.",
    "de": "Eine sinnvolle erste Version braucht die wichtigsten Seiten, einen klaren Weg zur Anfrage oder zum Kauf, Vertrauenssignale und eine eingerichtete Webanalyse. Sie sollte spätere Erweiterungen ermöglichen, ohne alles neu aufbauen zu müssen."
  },
  "A practical semantic model review checklist": {
    "el": "Πρακτική λίστα ελέγχου σημασιολογικού μοντέλου",
    "de": "Eine praktische Checkliste für die Überprüfung semantischer Modelle"
  },
  "A practical shortlist for AI consulting in Greece": {
    "el": "Ενδεικτική λίστα πρακτικών εφαρμογών για συμβουλευτική AI στην Ελλάδα",
    "de": "Eine praktische Auswahlliste für KI-Beratung in Griechenland"
  },
  "A simple owner field gives teams a route for questions and changes. That is often enough to prevent recurring reporting arguments.": {
    "el": "Ένα απλό πεδίο με τον υπεύθυνο δείχνει στην ομάδα πού να απευθυνθεί για ερωτήσεις και αλλαγές. Συχνά αυτό αρκεί για να αποφεύγονται επαναλαμβανόμενες διαφωνίες γύρω από τις αναφορές.",
    "de": "Schon ein einfaches Feld mit der verantwortlichen Person zeigt dem Team, an wen es sich mit Fragen und Änderungswünschen wenden kann. Das genügt oft, um wiederkehrende Diskussionen über Berichte zu vermeiden."
  },
  "A small organization does not need the same governance structure as a large enterprise. What it does need is clarity. Even lightweight rules can prevent repeated problems: uncontrolled spreadsheets, unclear ownership, inconsistent KPIs, and sensitive data copied into too many places.": {
    "el": "Ένας μικρός οργανισμός δεν χρειάζεται την ίδια δομή διακυβέρνησης με μια μεγάλη επιχείρηση. Χρειάζεται όμως σαφήνεια. Ακόμη και απλοί κανόνες αποτρέπουν επαναλαμβανόμενα προβλήματα: ανεξέλεγκτα υπολογιστικά φύλλα, ασαφείς αρμοδιότητες, ασυνεπείς KPI και ευαίσθητα δεδομένα αντιγραμμένα σε υπερβολικά πολλά σημεία.",
    "de": "Eine kleine Organisation braucht nicht dieselbe Governance-Struktur wie ein Großunternehmen. Sie braucht aber Klarheit. Bereits einfache Regeln verhindern wiederkehrende Probleme: unkontrollierte Tabellenkalkulationen, unklare Zuständigkeiten, widersprüchliche KPIs und sensible Daten an zu vielen Speicherorten."
  },
  "A static site can look polished and still fail commercially. The important question is what the site helps the visitor do. Can they understand the offer quickly? Can they find proof? Can they contact the business without friction? Can the company measure which pages and actions matter?": {
    "el": "Μια στατική ιστοσελίδα μπορεί να φαίνεται προσεγμένη και να μην αποδίδει εμπορικά. Το ουσιαστικό ερώτημα είναι τι επιτρέπει στον επισκέπτη να κάνει: να κατανοήσει γρήγορα την προσφορά, να βρει τεκμήρια αξιοπιστίας και να επικοινωνήσει εύκολα. Παράλληλα, μπορεί η επιχείρηση να μετρήσει ποιες σελίδες και ενέργειες έχουν σημασία;",
    "de": "Eine statische Website kann hochwertig aussehen und wirtschaftlich trotzdem scheitern. Entscheidend ist, was sie Besuchern ermöglicht: das Angebot schnell zu verstehen, Belege für die Kompetenz zu finden und unkompliziert Kontakt aufzunehmen. Kann das Unternehmen außerdem messen, welche Seiten und Aktionen wichtig sind?"
  },
  "A useful data strategy should not be a long document that no one uses. It should define operating rules: priority datasets, owners, access patterns, quality checks, documentation habits, and delivery sequencing.": {
    "el": "Μια χρήσιμη στρατηγική δεδομένων δεν πρέπει να είναι ένα εκτενές έγγραφο που κανείς δεν χρησιμοποιεί. Πρέπει να ορίζει πρακτικούς κανόνες: ποια σύνολα δεδομένων προέχουν, ποιοι είναι υπεύθυνοι, πώς παρέχεται πρόσβαση, πώς ελέγχεται η ποιότητα, πώς τηρείται τεκμηρίωση και με ποια σειρά προχωρά η υλοποίηση.",
    "de": "Eine nützliche Datenstrategie ist kein langes Dokument, das niemand verwendet. Sie legt praktische Regeln fest: prioritäre Datensätze, Verantwortliche, Zugriffsmuster, Qualitätsprüfungen, Dokumentation und die Reihenfolge der Umsetzung."
  },
  "A useful forecast includes assumptions, confidence, refresh cadence, and review ownership. That makes it easier for teams to act without overtrusting the number.": {
    "el": "Μια χρήσιμη πρόβλεψη περιλαμβάνει τις παραδοχές της, τον βαθμό αβεβαιότητας, τη συχνότητα ανανέωσης και τον υπεύθυνο ελέγχου. Έτσι οι ομάδες μπορούν να ενεργούν χωρίς υπερβολική εμπιστοσύνη σε έναν αριθμό.",
    "de": "Eine nützliche Prognose nennt Annahmen, Unsicherheit, Aktualisierungsrhythmus und die für die Prüfung verantwortliche Person. So können Teams handeln, ohne einer einzelnen Zahl zu stark zu vertrauen."
  },
  "A useful review should inspect table naming, relationship direction, inactive relationships, measure folders, duplicate calculations, date table design, role-playing dimensions, security rules, and performance-sensitive DAX patterns. It should also check whether business users can understand the model without asking the original developer to explain every decision.": {
    "el": "Ο έλεγχος πρέπει να καλύπτει τις ονομασίες πινάκων, την κατεύθυνση και την κατάσταση των σχέσεων, τους φακέλους υπολογιζόμενων μέτρων, τους διπλούς υπολογισμούς, τον πίνακα ημερομηνιών, τις διαστάσεις που εξυπηρετούν πολλαπλούς ρόλους, τους κανόνες ασφάλειας και τα μοτίβα DAX που επηρεάζουν την απόδοση. Πρέπει επίσης να εξετάζει αν οι χρήστες μπορούν να κατανοήσουν το μοντέλο χωρίς εξήγηση κάθε απόφασης από τον αρχικό προγραμματιστή.",
    "de": "Die Prüfung sollte Tabellenbenennung, Beziehungsrichtung, inaktive Beziehungen, Measure-Ordner, doppelte Berechnungen, Datumstabellen, mehrfach verwendete Dimensionen mit unterschiedlichen Rollen, Sicherheitsregeln und leistungsrelevante DAX-Muster abdecken. Ebenso wichtig ist, ob Fachanwender das Modell verstehen, ohne jede Entscheidung vom ursprünglichen Entwickler erklären lassen zu müssen."
  },
  "A workflow prompt should explain the role, context, source material, output format, constraints, and review checklist. It should also state what the AI must not do.": {
    "el": "Ένα prompt για ροή εργασίας πρέπει να εξηγεί τον ρόλο, το πλαίσιο, το υλικό αναφοράς, τη μορφή αποτελέσματος, τους περιορισμούς και τη λίστα ελέγχου ποιότητας. Πρέπει επίσης να δηλώνει τι δεν επιτρέπεται να κάνει η AI.",
    "de": "Ein Workflow-Prompt sollte Rolle, Kontext, Quellmaterial, Ausgabeformat, Einschränkungen und eine Prüfliste erläutern. Er sollte auch festlegen, was die KI nicht tun darf."
  },
  "AI Adoption": {
    "el": "Υιοθέτηση AI",
    "de": "KI-Einführung"
  },
  "AI Productionization": {
    "el": "Θέση της AI σε παραγωγική λειτουργία",
    "de": "Produktiver KI-Betrieb"
  },
  "AI adoption is not only a training issue. It changes how work is reviewed, delegated, documented, and measured. Teams need clarity on which tasks can be AI-assisted and which require stricter control.": {
    "el": "Η υιοθέτηση της AI δεν είναι μόνο θέμα εκπαίδευσης. Αλλάζει τον τρόπο ελέγχου, ανάθεσης, τεκμηρίωσης και μέτρησης της εργασίας. Οι ομάδες πρέπει να γνωρίζουν ποιες εργασίες μπορούν να υποστηρίζονται από AI και ποιες χρειάζονται αυστηρότερο έλεγχο.",
    "de": "Die Einführung von KI ist nicht nur eine Schulungsfrage. Sie verändert, wie Arbeit geprüft, delegiert, dokumentiert und gemessen wird. Teams brauchen Klarheit darüber, welche Aufgaben KI unterstützen kann und welche strengere Kontrollen erfordern."
  },
  "AI is easy to discuss in general terms and much harder to implement usefully. Many businesses know they should explore AI, but they are not sure which use cases are worth the effort, which data is needed, or how to avoid creating operational risk.": {
    "el": "Είναι εύκολο να συζητά κανείς γενικά για την AI, αλλά πολύ δυσκολότερο να την εφαρμόζει με πρακτική αξία. Πολλές επιχειρήσεις θέλουν να τη διερευνήσουν, χωρίς να γνωρίζουν ποιες εφαρμογές αξίζουν την προσπάθεια, ποια δεδομένα απαιτούνται ή πώς να αποφύγουν νέους λειτουργικούς κινδύνους.",
    "de": "KI ist allgemein leicht zu diskutieren und viel schwieriger sinnvoll umzusetzen. Viele Unternehmen wissen, dass sie sich mit KI befassen sollten, sind sich jedoch nicht sicher, welche Anwendungsfälle den Aufwand wert sind, welche Daten benötigt werden oder wie sie die Entstehung betrieblicher Risiken vermeiden können."
  },
  "AI literacy is the bridge between access and responsible adoption. It gives teams a shared understanding of what AI can do, where it fails, and how human review should work.": {
    "el": "Η κατανόηση της AI γεφυρώνει την πρόσβαση στα εργαλεία με την υπεύθυνη χρήση τους. Προσφέρει στις ομάδες κοινή αντίληψη για τις δυνατότητες, τους περιορισμούς και τον απαιτούμενο ανθρώπινο έλεγχο.",
    "de": "KI-Kompetenz verbindet den Zugang zu Werkzeugen mit ihrer verantwortungsvollen Nutzung. Sie schafft ein gemeinsames Verständnis der Möglichkeiten, Grenzen und erforderlichen menschlichen Prüfung."
  },
  "AI literacy turns AI from an informal shortcut into a professional capability. That is what makes adoption more useful and less risky.": {
    "el": "Η εκπαίδευση στην AI τη μετατρέπει από άτυπο βοήθημα σε επαγγελματική δεξιότητα. Έτσι η υιοθέτησή της γίνεται πιο χρήσιμη και λιγότερο επικίνδυνη.",
    "de": "KI-Kenntnisse verwandeln KI von einer informellen Abkürzung in eine professionelle Fähigkeit. Das macht die Einführung nützlicher und weniger riskant."
  },
  "AI output should be checked against criteria that match the business risk. A marketing draft may need brand and accuracy review. A customer support summary may need source validation. A compliance-related workflow may need escalation rules.": {
    "el": "Τα αποτελέσματα της AI πρέπει να ελέγχονται με κριτήρια ανάλογα του επιχειρηματικού κινδύνου. Ένα κείμενο μάρκετινγκ ίσως χρειάζεται έλεγχο ακρίβειας και συνέπειας με την εταιρική ταυτότητα. Μια περίληψη εξυπηρέτησης πελατών μπορεί να απαιτεί επαλήθευση πηγών. Μια ροή συμμόρφωσης ενδέχεται να χρειάζεται κανόνες παραπομπής σε αρμόδιο υπεύθυνο.",
    "de": "Die KI-Ausgabe sollte anhand von Kriterien überprüft werden, die dem Geschäftsrisiko entsprechen. Ein Marketingentwurf muss möglicherweise auf Marke und Genauigkeit überprüft werden. Eine Zusammenfassung des Kundensupports erfordert möglicherweise eine Quellenvalidierung. Für einen Compliance-bezogenen Workflow sind möglicherweise Eskalationsregeln erforderlich."
  },
  "AI systems are sensitive to unclear data. If customer records are duplicated, product categories are inconsistent, financial definitions vary by department, or documents are stored without structure, AI output becomes harder to validate.": {
    "el": "Τα συστήματα AI επηρεάζονται από ασάφειες στα δεδομένα. Διπλές εγγραφές πελατών, ασυνεπείς κατηγορίες προϊόντων, οικονομικοί ορισμοί που αλλάζουν ανά τμήμα και αδόμητη αποθήκευση εγγράφων δυσκολεύουν την επαλήθευση των αποτελεσμάτων της AI.",
    "de": "KI-Systeme reagieren empfindlich auf unklare Daten. Wenn Kundendatensätze dupliziert werden, Produktkategorien inkonsistent sind, Finanzdefinitionen je nach Abteilung variieren oder Dokumente ohne Struktur gespeichert werden, wird die Validierung der KI-Ausgabe schwieriger."
  },
  "Acceptance criteria protect the project from vague feedback. A dashboard is ready when the numbers reconcile to agreed sources, stakeholders approve KPI definitions, refreshes work, permissions are tested, and users can answer the intended business questions without extra explanation.": {
    "el": "Τα κριτήρια αποδοχής προστατεύουν το έργο από ασαφή σχόλια. Ένα dashboard είναι έτοιμο όταν τα στοιχεία συμφωνούν με τις καθορισμένες πηγές, οι υπεύθυνοι έχουν εγκρίνει τους ορισμούς KPI, οι ανανεώσεις λειτουργούν, τα δικαιώματα έχουν ελεγχθεί και οι χρήστες μπορούν να απαντήσουν στα προβλεπόμενα επιχειρηματικά ερωτήματα χωρίς πρόσθετες εξηγήσεις.",
    "de": "Abnahmekriterien schützen das Projekt vor vagen Rückmeldungen. Ein Dashboard ist fertig, wenn die Zahlen mit den vereinbarten Quellen übereinstimmen, die Verantwortlichen die KPI-Definitionen freigegeben haben, Aktualisierungen funktionieren, Berechtigungen geprüft sind und Nutzer die vorgesehenen Geschäftsfragen ohne zusätzliche Erklärung beantworten können."
  },
  "After one workflow is stable, the team has a pattern it can reuse. That is how MLOps becomes a delivery habit rather than an enterprise buzzword.": {
    "el": "Όταν μια ροή εργασίας λειτουργεί σταθερά, η ομάδα αποκτά ένα πρότυπο που μπορεί να επαναχρησιμοποιήσει. Έτσι το MLOps γίνεται μέρος της καθημερινής υλοποίησης και όχι απλώς ένας δημοφιλής εταιρικός όρος.",
    "de": "Sobald ein Workflow stabil läuft, hat das Team ein wiederverwendbares Muster. So wird MLOps zu einer festen Umsetzungspraxis statt zu einem Schlagwort."
  },
  "Analytics": {
    "el": "Ανάλυση δεδομένων",
    "de": "Datenanalyse"
  },
  "Analytics Engineering": {
    "el": "Μηχανική ανάλυσης δεδομένων",
    "de": "Analytics Engineering"
  },
  "Analytics Operations": {
    "el": "Λειτουργία συστημάτων ανάλυσης δεδομένων",
    "de": "Betrieb von Analysesystemen"
  },
  "Analytics Roadmap": {
    "el": "Πλάνο ανάλυσης δεδομένων",
    "de": "Analytics-Roadmap"
  },
  "Analytics projects often fail because the data is almost right. Columns exist, tables load, and dashboards render, but values are duplicated, stale, incomplete, or inconsistently defined.": {
    "el": "Τα έργα ανάλυσης συχνά αποτυγχάνουν επειδή τα δεδομένα είναι σχεδόν σωστά. Οι στήλες υπάρχουν, οι πίνακες φορτώνονται και τα dashboards εμφανίζονται, αλλά οι τιμές είναι διπλές, παρωχημένες, ελλιπείς ή ορίζονται με ασυνεπή τρόπο.",
    "de": "Analytics-Projekte scheitern oft daran, dass die Daten nahezu stimmen. Es sind Spalten vorhanden, Tabellen werden geladen und Dashboards gerendert, aber die Werte sind dupliziert, veraltet, unvollständig oder inkonsistent definiert."
  },
  "Analytics usually starts with access. A team needs data, someone shares it, a report is built, and the business gets value. Over time, that same flexibility can become a risk if ownership, access, quality, and documentation are not clear.": {
    "el": "Η ανάλυση δεδομένων συνήθως ξεκινά με την πρόσβαση. Μια ομάδα χρειάζεται δεδομένα, κάποιος τα διαθέτει, δημιουργείται μια αναφορά και η επιχείρηση ωφελείται. Με τον χρόνο, όμως, η ίδια ευελιξία μπορεί να γίνει κίνδυνος, αν δεν είναι σαφείς οι αρμοδιότητες, οι κανόνες πρόσβασης, η ποιότητα και η τεκμηρίωση.",
    "de": "Datenanalysen beginnen oft mit dem Zugriff: Ein Team braucht Daten, jemand stellt sie bereit, ein Bericht entsteht und das Unternehmen profitiert. Mit der Zeit kann diese Flexibilität jedoch zum Risiko werden, wenn Verantwortlichkeiten, Zugriffsregeln, Qualität und Dokumentation unklar bleiben."
  },
  "At that point, the team needs to know which data was used, which code version produced the output, where the model artifact lives, how failures are detected, and who can update the process.": {
    "el": "Τότε η ομάδα πρέπει να γνωρίζει ποια δεδομένα χρησιμοποιήθηκαν, ποια έκδοση κώδικα παρήγαγε το αποτέλεσμα, πού είναι αποθηκευμένο το αρχείο του μοντέλου, πώς εντοπίζονται τα σφάλματα και ποιος μπορεί να ενημερώνει τη διαδικασία.",
    "de": "An diesem Punkt muss das Team wissen, welche Daten verwendet wurden, welche Codeversion die Ausgabe erzeugt hat, wo sich das Modellartefakt befindet, wie Fehler erkannt werden und wer den Prozess aktualisieren kann."
  },
  "BI Solutions looks at BI through three layers: the data foundation, the semantic model, and the user experience. The data foundation answers where the numbers come from. The semantic model defines the business logic. The user experience decides whether leaders can interpret the output without extra explanation.": {
    "el": "Η BI Solutions εξετάζει το BI σε τρία επίπεδα: υποδομή δεδομένων, σημασιολογικό μοντέλο και εμπειρία χρήστη. Η υποδομή εξηγεί από πού προέρχονται οι αριθμοί. Το σημασιολογικό μοντέλο ορίζει την επιχειρηματική λογική. Η εμπειρία χρήστη καθορίζει αν τα στελέχη μπορούν να ερμηνεύσουν τα αποτελέσματα χωρίς πρόσθετες εξηγήσεις.",
    "de": "BI Solutions betrachtet BI auf drei Ebenen: Datengrundlage, semantisches Modell und Nutzererfahrung. Die Datengrundlage erklärt, woher die Zahlen stammen. Das semantische Modell definiert die Geschäftslogik. Die Nutzererfahrung entscheidet, ob Führungskräfte Ergebnisse ohne zusätzliche Erklärung verstehen."
  },
  "BI consulting should therefore treat semantic modeling as a first-class activity. It is the part of the work that makes dashboards less fragile and more valuable over time.": {
    "el": "Η συμβουλευτική BI πρέπει επομένως να δίνει κεντρική θέση στη σημασιολογική μοντελοποίηση. Αυτή η εργασία κάνει τα dashboards πιο ανθεκτικά και αυξάνει την αξία τους με τον χρόνο.",
    "de": "Die semantische Modellierung sollte daher ein zentraler Bestandteil der BI-Beratung sein. Sie macht Dashboards robuster und langfristig wertvoller."
  },
  "Back to blog": {
    "el": "Επιστροφή στα άρθρα",
    "de": "Zurück zum Blog"
  },
  "Before a dashboard rebuild, the team should audit the business questions, data sources, model relationships, measures, refresh cadence, access rules, and current pain points. The most useful review is not a screenshot review. It is a system review that explains why the current reporting layer is slow, confusing, duplicated, or hard to trust.": {
    "el": "Πριν ανακατασκευάσει ένα dashboard, η ομάδα πρέπει να ελέγξει τα επιχειρηματικά ερωτήματα, τις πηγές δεδομένων, τις σχέσεις του μοντέλου, τα υπολογιζόμενα μέτρα, τη συχνότητα ανανέωσης, τους κανόνες πρόσβασης και τα σημερινά προβλήματα. Ο ουσιαστικός έλεγχος δεν περιορίζεται στην εικόνα της αναφοράς. Εξετάζει το σύστημα και εξηγεί γιατί οι αναφορές είναι αργές, δυσνόητες, επαναλαμβανόμενες ή δύσκολο να θεωρηθούν αξιόπιστες.",
    "de": "Vor dem Neuaufbau eines Dashboards sollte das Team Geschäftsfragen, Datenquellen, Modellbeziehungen, Measures, Aktualisierungsrhythmus, Zugriffsregeln und bestehende Probleme prüfen. Eine hilfreiche Prüfung bewertet nicht nur Screenshots, sondern das gesamte System und erklärt, warum das Reporting langsam, unklar, redundant oder wenig vertrauenswürdig ist."
  },
  "Before implementation, define KPI formulas, data sources, refresh cadence, access rules, and review owners. This makes the first build slower in the right places and much faster later.": {
    "el": "Πριν από την υλοποίηση, ορίστε τους τύπους των KPI, τις πηγές δεδομένων, τη συχνότητα ανανέωσης, τους κανόνες πρόσβασης και τους υπευθύνους ελέγχου. Έτσι αφιερώνεται εξαρχής χρόνος στα σωστά σημεία και οι επόμενες εργασίες γίνονται πολύ ταχύτερα.",
    "de": "Definieren Sie vor der Umsetzung KPI-Formeln, Datenquellen, Aktualisierungsrhythmus, Zugriffsregeln und Prüfverantwortliche. Das kostet zu Beginn an den richtigen Stellen Zeit und beschleunigt die spätere Arbeit deutlich."
  },
  "Build a review trail": {
    "el": "Τηρείτε ιστορικό ελέγχων",
    "de": "Prüfungen nachvollziehbar dokumentieren"
  },
  "Build smaller than the first idea": {
    "el": "Ξεκινήστε με μικρότερη υλοποίηση από την αρχική ιδέα",
    "de": "Mit einem kleineren Umfang als der ersten Idee starten"
  },
  "Build vs Buy": {
    "el": "Ανάπτυξη ή αγορά λύσης",
    "de": "Eigenentwicklung oder Kauf"
  },
  "Change management matters": {
    "el": "Η διαχείριση αλλαγών έχει σημασία",
    "de": "Change Management ist wichtig"
  },
  "Check source ownership, missing values, duplicate records, date consistency, categorical values, refresh timing, and metric definitions. Also confirm whether sensitive fields are being used correctly.": {
    "el": "Ελέγξτε τους υπευθύνους των πηγών, τις ελλείπουσες τιμές, τις διπλές εγγραφές, τη συνέπεια ημερομηνιών, τις κατηγορικές τιμές, τον χρόνο ανανέωσης και τους ορισμούς δεικτών. Επιβεβαιώστε επίσης ότι τα ευαίσθητα πεδία χρησιμοποιούνται σωστά.",
    "de": "Prüfen Sie die Verantwortlichen der Quellen, fehlende Werte, doppelte Datensätze, konsistente Datumsangaben, kategoriale Werte, Aktualisierungszeitpunkte und Kennzahlendefinitionen. Klären Sie außerdem, ob sensible Felder korrekt verwendet werden."
  },
  "Choose narrow document tasks first": {
    "el": "Ξεκινήστε με συγκεκριμένες, περιορισμένες εργασίες εγγράφων",
    "de": "Zunächst klar abgegrenzte Dokumentenaufgaben wählen"
  },
  "Clean semantic modeling reduces that friction. It gives teams a shared language for metrics and creates a more stable foundation for dashboards, automated reporting, and executive review.": {
    "el": "Η σωστή σημασιολογική μοντελοποίηση μειώνει αυτές τις δυσκολίες. Προσφέρει κοινή γλώσσα για τους δείκτες και πιο σταθερή βάση για dashboards, αυτοματοποιημένες αναφορές και αξιολόγηση από τη διοίκηση.",
    "de": "Saubere semantische Modellierung reduziert diese Reibung. Sie schafft eine gemeinsame Sprache für Kennzahlen und eine stabilere Grundlage für Dashboards, automatisiertes Reporting und die Bewertung durch Führungskräfte."
  },
  "Clean semantic models make reports easier to trust. Tables have a clear purpose. Measures are named consistently. Relationships are understandable. Business definitions live in one place instead of being recreated across pages and reports.": {
    "el": "Τα σωστά δομημένα σημασιολογικά μοντέλα ενισχύουν την αξιοπιστία των αναφορών. Οι πίνακες έχουν σαφή σκοπό, τα υπολογιζόμενα μέτρα συνεπείς ονομασίες και οι σχέσεις είναι κατανοητές. Οι επιχειρηματικοί ορισμοί διατηρούνται σε ένα σημείο, αντί να δημιουργούνται ξανά σε διαφορετικές σελίδες και αναφορές.",
    "de": "Sauber aufgebaute semantische Modelle machen Berichte verlässlicher. Tabellen haben einen klaren Zweck, Measures werden einheitlich benannt und Beziehungen sind verständlich. Fachliche Definitionen liegen zentral vor, statt in verschiedenen Seiten und Berichten neu erstellt zu werden."
  },
  "Company Policy": {
    "el": "Εταιρική πολιτική",
    "de": "Unternehmensrichtlinie"
  },
  "Continue with adjacent reads.": {
    "el": "Συνεχίστε με σχετικά άρθρα.",
    "de": "Lesen Sie passende weiterführende Beiträge."
  },
  "Dashboards": {
    "el": "Dashboards",
    "de": "Dashboards"
  },
  "Data governance is the discipline that keeps analytics usable as it grows. It should help teams move faster with more confidence, not slow every request into a committee.": {
    "el": "Η διακυβέρνηση δεδομένων διατηρεί την ανάλυση χρήσιμη καθώς επεκτείνεται. Πρέπει να βοηθά τις ομάδες να κινούνται ταχύτερα και με μεγαλύτερη βεβαιότητα, χωρίς κάθε αίτημα να καταλήγει σε μια χρονοβόρα επιτροπή.",
    "de": "Data Governance hält Analysen auch bei wachsendem Umfang nutzbar. Sie sollte Teams schneller und sicherer voranbringen, statt jede Anfrage durch ein langwieriges Gremium zu schleusen."
  },
  "Data quality is not abstract. A sales dashboard, a finance model, and an AI customer assistant have different risk levels. The checklist should focus first on the fields and rules that affect real decisions.": {
    "el": "Η ποιότητα δεδομένων δεν είναι αφηρημένη έννοια. Ένα dashboard πωλήσεων, ένα χρηματοοικονομικό μοντέλο και ένας βοηθός εξυπηρέτησης πελατών με AI έχουν διαφορετικούς κινδύνους. Η λίστα ελέγχου πρέπει να δίνει προτεραιότητα στα πεδία και στους κανόνες που επηρεάζουν πραγματικές αποφάσεις.",
    "de": "Datenqualität ist nicht abstrakt. Ein Vertriebs-Dashboard, ein Finanzmodell und ein KI-Kundenassistent weisen unterschiedliche Risikostufen auf. Die Checkliste sollte sich zunächst auf die Felder und Regeln konzentrieren, die tatsächliche Entscheidungen beeinflussen."
  },
  "Data strategy is the work that makes analytics and AI easier to trust. It defines what data matters, where it comes from, who owns it, how quality is checked, and how teams should use it.": {
    "el": "Η στρατηγική δεδομένων ενισχύει την αξιοπιστία της ανάλυσης και της AI. Ορίζει ποια δεδομένα έχουν σημασία, από πού προέρχονται, ποιος είναι υπεύθυνος, πώς ελέγχεται η ποιότητά τους και πώς πρέπει να χρησιμοποιούνται.",
    "de": "Eine Datenstrategie stärkt die Verlässlichkeit von Analysen und KI. Sie legt fest, welche Daten wichtig sind, woher sie stammen, wer dafür verantwortlich ist, wie ihre Qualität geprüft wird und wie Teams sie nutzen sollen."
  },
  "Data strategy should create a delivery backlog": {
    "el": "Η στρατηγική δεδομένων πρέπει να καταλήγει σε λίστα εργασιών προς υλοποίηση",
    "de": "Die Datenstrategie sollte zu einem Umsetzungs-Backlog führen"
  },
  "Define the delivery backlog": {
    "el": "Καθορίστε τη λίστα εργασιών προς υλοποίηση",
    "de": "Den Umsetzungs-Backlog festlegen"
  },
  "Define the operating question": {
    "el": "Ορίστε το επιχειρησιακό ερώτημα",
    "de": "Die betriebliche Fragestellung definieren"
  },
  "Document AI should make it clear which source was used, what the AI produced, who reviewed it, and what changed before final use. That review trail protects quality and gives the team material for improving prompts and instructions.": {
    "el": "Η χρήση AI σε έγγραφα πρέπει να δείχνει με σαφήνεια ποια πηγή χρησιμοποιήθηκε, τι παρήγαγε η AI, ποιος το έλεγξε και τι άλλαξε πριν από την τελική χρήση. Αυτό το ιστορικό ελέγχου προστατεύει την ποιότητα και βοηθά την ομάδα να βελτιώνει τα prompts και τις οδηγίες.",
    "de": "Dokumenten-KI sollte deutlich machen, welche Quelle verwendet wurde, was die KI produziert hat, wer sie überprüft hat und was sich vor der endgültigen Verwendung geändert hat. Dieser Überprüfungspfad schützt die Qualität und liefert dem Team Material zur Verbesserung von Eingabeaufforderungen und Anweisungen."
  },
  "Each KPI should have a business definition, formula, source system, refresh rule, owner, related dimensions, and known caveats. If the metric appears in Power BI, Tableau, Looker, or Excel, the dictionary should also point to where the logic is implemented.": {
    "el": "Κάθε KPI χρειάζεται επιχειρηματικό ορισμό, τύπο υπολογισμού, σύστημα προέλευσης, κανόνα ανανέωσης, υπεύθυνο, σχετικές διαστάσεις και γνωστούς περιορισμούς. Αν ο δείκτης εμφανίζεται σε Power BI, Tableau, Looker ή Excel, το λεξικό πρέπει επίσης να παραπέμπει στο σημείο όπου υλοποιείται η λογική του.",
    "de": "Jeder KPI braucht eine fachliche Definition, eine Formel, ein Quellsystem, eine Aktualisierungsregel, eine verantwortliche Person, zugehörige Dimensionen und bekannte Einschränkungen. Bei Kennzahlen in Power BI, Tableau, Looker oder Excel sollte das Verzeichnis auch zeigen, wo die Berechnungslogik umgesetzt ist."
  },
  "Each item should have an owner, business reason, rough effort, dependency, and expected outcome. This helps leadership compare priorities without turning the roadmap into an abstract transformation list.": {
    "el": "Κάθε εργασία πρέπει να έχει υπεύθυνο, επιχειρηματική αιτιολόγηση, ενδεικτική εκτίμηση προσπάθειας, εξαρτήσεις και αναμενόμενο αποτέλεσμα. Έτσι η διοίκηση συγκρίνει τις προτεραιότητες χωρίς το πλάνο να γίνεται μια αφηρημένη λίστα μετασχηματισμού.",
    "de": "Jede Aufgabe braucht eine verantwortliche Person, eine geschäftliche Begründung, eine grobe Aufwandsschätzung, Abhängigkeiten und ein erwartetes Ergebnis. So kann die Führung Prioritäten vergleichen, ohne dass die Roadmap zu einer abstrakten Transformationsliste wird."
  },
  "Even simple checks can prevent expensive confusion: duplicate customer IDs, missing invoice dates, mismatched currencies, broken joins, or stale source extracts. The value is not technical purity. The value is fewer bad decisions.": {
    "el": "Ακόμη και απλοί έλεγχοι αποτρέπουν δαπανηρά λάθη: διπλά αναγνωριστικά πελατών, ελλείπουσες ημερομηνίες τιμολογίων, ασύμβατα νομίσματα, λανθασμένες συνενώσεις πινάκων ή παρωχημένες εξαγωγές δεδομένων. Η πρακτική αξία τους βρίσκεται στις λιγότερες λανθασμένες αποφάσεις.",
    "de": "Selbst einfache Überprüfungen können kostspielige Verwirrung verhindern: doppelte Kunden-IDs, fehlende Rechnungsdaten, nicht übereinstimmende Währungen, fehlerhafte Verknüpfungen oder veraltete Quellextrakte. Der Wert ist nicht die technische Reinheit. Der Wert liegt in weniger Fehlentscheidungen."
  },
  "Every dashboard needs a business question. Is the team monitoring sales pipeline, operational load, finance variance, customer behavior, or delivery risk? Without that question, the report becomes a collection of visuals.": {
    "el": "Κάθε dashboard χρειάζεται ένα επιχειρηματικό ερώτημα. Παρακολουθεί η ομάδα την πορεία ευκαιριών πώλησης, τον φόρτο εργασίας, τις οικονομικές αποκλίσεις, τη συμπεριφορά πελατών ή τους κινδύνους υλοποίησης; Χωρίς αυτό το ερώτημα, η αναφορά καταλήγει απλώς μια συλλογή γραφημάτων.",
    "de": "Jedes Dashboard braucht eine Geschäftsfrage. Geht es um die Vertriebspipeline, operative Auslastung, Finanzabweichungen, Kundenverhalten oder Umsetzungsrisiken? Ohne diese Frage bleibt der Bericht eine Sammlung von Visualisierungen."
  },
  "Explore web development & search visibility": {
    "el": "Δείτε υπηρεσίες ανάπτυξης ιστοσελίδων και προβολής στην αναζήτηση",
    "de": "Entdecken Sie Webentwicklung und Suchsichtbarkeit"
  },
  "For a service business, AI may help with lead qualification, proposal drafting, customer support summaries, appointment preparation, or document review. For an analytics team, AI may help explain report changes, summarize performance drivers, or generate first-pass commentary.": {
    "el": "Σε μια επιχείρηση παροχής υπηρεσιών, η AI μπορεί να υποστηρίξει την αξιολόγηση υποψήφιων πελατών, τη σύνταξη προσφορών, τις περιλήψεις εξυπηρέτησης, την προετοιμασία ραντεβού και τον έλεγχο εγγράφων. Σε μια ομάδα ανάλυσης δεδομένων, μπορεί να εξηγεί αλλαγές στις αναφορές, να συνοψίζει τους παράγοντες απόδοσης και να συντάσσει αρχικά σχόλια.",
    "de": "Für ein Dienstleistungsunternehmen kann KI bei der Lead-Qualifizierung, der Angebotserstellung, Zusammenfassungen des Kundensupports, der Terminvorbereitung oder der Dokumentenprüfung hilfreich sein. Für ein Analyseteam kann KI dabei helfen, Berichtsänderungen zu erklären, Leistungsfaktoren zusammenzufassen oder erste Kommentare zu erstellen."
  },
  "For example, a demand forecast may support staffing, stock planning, or campaign timing. Each use case needs different lead time, error tolerance, and explanation.": {
    "el": "Για παράδειγμα, μια πρόβλεψη ζήτησης μπορεί να υποστηρίζει τη στελέχωση, τον προγραμματισμό αποθεμάτων ή τον χρόνο μιας καμπάνιας. Κάθε χρήση απαιτεί διαφορετικό χρονικό ορίζοντα προετοιμασίας, ανοχή σφάλματος και επεξήγηση.",
    "de": "Beispielsweise kann eine Bedarfsprognose die Personalbesetzung, die Bestandsplanung oder die Zeitplanung von Kampagnen unterstützen. Jeder Anwendungsfall erfordert eine andere Vorlaufzeit, Fehlertoleranz und Erklärung."
  },
  "For many AI workflows, monitoring should include human review samples. That creates feedback for improvement and protects teams from silent quality decay.": {
    "el": "Σε πολλές ροές AI, η παρακολούθηση πρέπει να περιλαμβάνει ανθρώπινο έλεγχο δείγματος αποτελεσμάτων. Έτσι συλλέγεται ανατροφοδότηση για βελτίωση και εντοπίζεται η σταδιακή, μη εμφανής υποβάθμιση της ποιότητας.",
    "de": "Bei vielen KI-Workflows sollten Menschen regelmäßig Stichproben der Ergebnisse prüfen. Das liefert Rückmeldungen zur Verbesserung und schützt vor unbemerktem Qualitätsverlust."
  },
  "For searches like κατασκευή ιστοσελίδων στην Ελλάδα or website development Greece, many buyers are not only comparing design. They are trying to understand whether a provider can connect the website to the way the business wins work. A serious brief should therefore include the audience, the services that matter commercially, the proof points, the contact path, and the analytics questions leadership wants answered.": {
    "el": "Σε αναζητήσεις όπως «κατασκευή ιστοσελίδων στην Ελλάδα» ή «website development Greece», πολλοί υποψήφιοι πελάτες δεν συγκρίνουν μόνο το design. Εξετάζουν αν ο πάροχος μπορεί να συνδέσει την ιστοσελίδα με τον τρόπο που η επιχείρηση προσελκύει έργα. Γι’ αυτό η περιγραφή του έργου πρέπει να καλύπτει το κοινό, τις εμπορικά σημαντικές υπηρεσίες, τα τεκμήρια αξιοπιστίας, τη διαδρομή επικοινωνίας και τα ερωτήματα ανάλυσης που απασχολούν τη διοίκηση.",
    "de": "Bei Suchanfragen wie „κατασκευή ιστοσελίδων στην Ελλάδα“ oder „website development Greece“ vergleichen viele Interessenten mehr als das Design. Sie prüfen, ob ein Anbieter die Website mit der Kundengewinnung des Unternehmens verbinden kann. Ein gutes Briefing nennt daher Zielgruppen, wirtschaftlich wichtige Leistungen, Kompetenznachweise, Kontaktwege und die Analysefragen der Führung."
  },
  "Founder of BI Solutions Group and a data scientist and AI developer with 9+ years of experience across business intelligence, applied AI, data strategy, and analytics engineering.": {
    "el": "Ιδρυτής της BI Solutions Group, επιστήμονας δεδομένων και προγραμματιστής AI, με πάνω από 9 χρόνια εμπειρίας στην επιχειρηματική ευφυΐα, την εφαρμοσμένη AI, τη στρατηγική δεδομένων και τη μηχανική ανάλυσης δεδομένων.",
    "de": "Gründer der BI Solutions Group und Datenwissenschaftler und KI-Entwickler mit mehr als 9 Jahren Erfahrung in den Bereichen Business Intelligence, angewandte KI, Datenstrategie und Analysetechnik."
  },
  "GDPR-aware analytics": {
    "el": "Ανάλυση δεδομένων με συνεκτίμηση του GDPR",
    "de": "DSGVO-orientierte Datenanalysen"
  },
  "Good governance answers practical questions. Who owns this dataset? Who can access it? Which fields are sensitive? How is quality checked? Where is the metric definition documented? What happens when a dashboard changes?": {
    "el": "Η σωστή διακυβέρνηση απαντά σε πρακτικά ερωτήματα: ποιος είναι υπεύθυνος για το σύνολο δεδομένων, ποιος έχει πρόσβαση, ποια πεδία είναι ευαίσθητα, πώς ελέγχεται η ποιότητα, πού τεκμηριώνεται ο ορισμός του δείκτη και τι συμβαίνει όταν αλλάζει ένα dashboard;",
    "de": "Gute Data Governance beantwortet praktische Fragen: Wer ist für den Datensatz verantwortlich? Wer darf darauf zugreifen? Welche Felder sind sensibel? Wie wird die Qualität geprüft? Wo ist die Kennzahl definiert? Was geschieht, wenn sich ein Dashboard ändert?"
  },
  "Governance": {
    "el": "Διακυβέρνηση δεδομένων",
    "de": "Data Governance"
  },
  "Governance should be proportional": {
    "el": "Η διακυβέρνηση πρέπει να είναι ανάλογη των αναγκών",
    "de": "Governance sollte verhältnismäßig sein"
  },
  "Greek Business": {
    "el": "Ελληνικές επιχειρήσεις",
    "de": "Griechische Unternehmen"
  },
  "Greek businesses usually need AI projects that respect language, regulation, team capacity, and existing systems. A practical shortlist might include document summarization for professional services, support-ticket triage, sales-call preparation, proposal drafting, invoice or contract review, dashboard commentary, and internal knowledge assistants.": {
    "el": "Οι ελληνικές επιχειρήσεις συνήθως χρειάζονται έργα AI που λαμβάνουν υπόψη τη γλώσσα, τους κανονισμούς, τη διαθέσιμη δυναμικότητα της ομάδας και τα υπάρχοντα συστήματα. Ενδεικτικές εφαρμογές είναι η σύνοψη εγγράφων επαγγελματικών υπηρεσιών, η ταξινόμηση αιτημάτων υποστήριξης, η προετοιμασία κλήσεων πωλήσεων, η σύνταξη προσφορών, ο έλεγχος τιμολογίων ή συμβάσεων, ο σχολιασμός dashboards και οι εσωτερικοί βοηθοί γνώσης.",
    "de": "Griechische Unternehmen benötigen in der Regel KI-Projekte, die Sprache, Vorschriften, Teamkapazität und bestehende Systeme respektieren. Eine praktische Auswahlliste könnte die Zusammenfassung von Dokumenten für professionelle Dienstleistungen, die Triage von Support-Tickets, die Vorbereitung von Verkaufsgesprächen, die Angebotserstellung, die Überprüfung von Rechnungen oder Verträgen, Dashboard-Kommentare und interne Wissensassistenten umfassen."
  },
  "How web development supports SEO and lead quality": {
    "el": "Πώς η ανάπτυξη ιστοσελίδων στηρίζει το SEO και την προσέλκυση κατάλληλων υποψήφιων πελατών",
    "de": "Wie Webentwicklung SEO und Lead-Qualität unterstützt"
  },
  "Human review remains useful": {
    "el": "Ο ανθρώπινος έλεγχος παραμένει χρήσιμος",
    "de": "Die menschliche Überprüfung bleibt nützlich"
  },
  "KPI Dictionary": {
    "el": "Λεξικό KPI",
    "de": "KPI-Verzeichnis"
  },
  "KPI ownership prevents silent drift": {
    "el": "Ορισμένοι υπεύθυνοι KPI αποτρέπουν τις σταδιακές, μη εμφανείς αποκλίσεις",
    "de": "Klare KPI-Verantwortung verhindert schleichende Abweichungen"
  },
  "Managers also need a practical language for discussing quality. The output may be fast, but is it correct? Does it use sensitive data? Does it need expert approval? Is it consistent with company policy?": {
    "el": "Τα στελέχη χρειάζονται επίσης πρακτικό λεξιλόγιο για την αξιολόγηση της ποιότητας. Το αποτέλεσμα παράγεται γρήγορα, αλλά είναι σωστό; Χρησιμοποιεί ευαίσθητα δεδομένα; Χρειάζεται έγκριση ειδικού; Συμφωνεί με την εταιρική πολιτική;",
    "de": "Führungskräfte brauchen eine verständliche Sprache für Qualität: Das Ergebnis liegt schnell vor, aber ist es richtig? Werden sensible Daten verwendet? Braucht es die Freigabe eines Experten? Entspricht es der Unternehmensrichtlinie?"
  },
  "Many AI failures happen outside the model. Source documents change, users provide weaker inputs, latency increases, costs rise, prompts drift, or downstream teams stop trusting the output.": {
    "el": "Πολλά προβλήματα της AI εμφανίζονται εκτός του μοντέλου. Αλλάζουν τα έγγραφα πηγής, μειώνεται η ποιότητα των δεδομένων εισόδου, αυξάνονται ο χρόνος απόκρισης και το κόστος, αποκλίνουν τα prompts ή οι ομάδες που χρησιμοποιούν τα αποτελέσματα παύουν να τα εμπιστεύονται.",
    "de": "Viele KI-Fehler passieren außerhalb des Modells. Quelldokumente ändern sich, Benutzer liefern schwächere Eingaben, die Latenz steigt, die Kosten steigen, Eingabeaufforderungen weichen ab oder nachgelagerte Teams vertrauen der Ausgabe nicht mehr."
  },
  "Many companies want to move directly into AI. The ambition is reasonable, but the order often creates problems. AI workflows depend on data quality, access, documentation, and ownership. If those foundations are weak, the AI layer inherits the confusion.": {
    "el": "Πολλές εταιρείες θέλουν να περάσουν κατευθείαν στην AI. Η φιλοδοξία είναι εύλογη, αλλά η σειρά των βημάτων συχνά δημιουργεί προβλήματα. Οι ροές AI εξαρτώνται από την ποιότητα δεδομένων, την πρόσβαση, την τεκμηρίωση και τον καθορισμό υπευθύνων. Αν αυτές οι βάσεις είναι αδύναμες, η AI κληρονομεί την ασάφεια.",
    "de": "Viele Unternehmen möchten direkt mit KI beginnen. Das Ziel ist nachvollziehbar, doch die Reihenfolge führt oft zu Problemen. KI-Workflows hängen von Datenqualität, Zugriffsrechten, Dokumentation und Verantwortlichkeiten ab. Sind diese Grundlagen schwach, übernimmt die KI die Unklarheiten."
  },
  "Many teams start with notebooks because they are fast and flexible. That is fine for exploration. The gap appears when the workflow needs to run regularly, serve other users, or support business decisions.": {
    "el": "Πολλές ομάδες ξεκινούν με notebooks, επειδή είναι γρήγορα και ευέλικτα για πειραματισμό. Η δυσκολία εμφανίζεται όταν η ροή εργασίας πρέπει να εκτελείται τακτικά, να εξυπηρετεί άλλους χρήστες ή να υποστηρίζει επιχειρηματικές αποφάσεις.",
    "de": "Viele Teams beginnen mit Notebooks, weil diese schnell und flexibel sind. Das ist gut für die Erkundung. Die Lücke tritt auf, wenn der Workflow regelmäßig ausgeführt werden muss, andere Benutzer bedienen oder Geschäftsentscheidungen unterstützen muss."
  },
  "Map the key business questions, reporting assets, data sources, owners, pain points, and manual processes. Identify where the business loses time or trust.": {
    "el": "Καταγράψτε τα βασικά επιχειρηματικά ερωτήματα, τις υπάρχουσες αναφορές, τις πηγές δεδομένων, τους υπευθύνους, τα προβλήματα και τις χειροκίνητες διαδικασίες. Εντοπίστε πού η επιχείρηση χάνει χρόνο ή εμπιστοσύνη.",
    "de": "Erfassen Sie die wichtigsten Geschäftsfragen, vorhandenen Berichte, Datenquellen, Verantwortlichen, Schwachstellen und manuellen Prozesse. Ermitteln Sie, wo das Unternehmen Zeit oder Vertrauen verliert."
  },
  "Metrics drift when no one owns them. A finance team may change a revenue rule, sales may add a new pipeline stage, or operations may redefine completed work. Without ownership, dashboards keep showing numbers that look official but no longer match the business.": {
    "el": "Οι δείκτες αποκλίνουν σταδιακά όταν δεν υπάρχει υπεύθυνος. Η οικονομική διεύθυνση μπορεί να αλλάξει έναν κανόνα εσόδων, οι πωλήσεις να προσθέσουν στάδιο στην πορεία πωλήσεων ή οι επιχειρησιακές ομάδες να επαναπροσδιορίσουν την ολοκληρωμένη εργασία. Χωρίς σαφείς αρμοδιότητες, τα dashboards συνεχίζουν να εμφανίζουν επίσημους φαινομενικά αριθμούς που δεν ανταποκρίνονται πλέον στην επιχείρηση.",
    "de": "Kennzahlen verändern sich schleichend, wenn niemand dafür verantwortlich ist. Der Finanzbereich ändert eine Umsatzregel, der Vertrieb ergänzt eine Pipeline-Stufe oder operative Teams definieren abgeschlossene Arbeit neu. Ohne klare Zuständigkeiten zeigen Dashboards weiterhin offiziell wirkende Zahlen, die nicht mehr zur Geschäftspraxis passen."
  },
  "Month one: understand the operating surface": {
    "el": "Πρώτος μήνας: κατανοήστε το περιβάλλον λειτουργίας",
    "de": "Erster Monat: Das betriebliche Umfeld verstehen"
  },
  "Month three: ship and set habits": {
    "el": "Τρίτος μήνας: θέστε τη λύση σε λειτουργία και καθιερώστε διαδικασίες",
    "de": "Dritter Monat: Die Lösung einführen und Routinen etablieren"
  },
  "Month two: prioritize useful delivery": {
    "el": "Δεύτερος μήνας: δώστε προτεραιότητα σε υλοποιήσεις με πρακτική αξία",
    "de": "Zweiter Monat: Umsetzungen mit praktischem Nutzen priorisieren"
  },
  "Most reporting arguments are not about the chart. They are about the definition behind the number. Revenue, margin, active customer, pipeline, utilization, and churn can all mean different things across teams.": {
    "el": "Οι περισσότερες διαφωνίες στις αναφορές αφορούν τον ορισμό πίσω από τον αριθμό και όχι το γράφημα. Τα έσοδα, το περιθώριο κέρδους, ο ενεργός πελάτης, η πορεία πωλήσεων, η αξιοποίηση δυναμικότητας και η αποχώρηση πελατών μπορεί να ορίζονται διαφορετικά από κάθε ομάδα.",
    "de": "Bei den meisten Diskussionen über Berichte geht es um die Definition hinter einer Zahl, nicht um das Diagramm. Umsatz, Marge, aktive Kunden, Vertriebspipeline, Auslastung und Kundenabwanderung können in verschiedenen Teams unterschiedlich definiert sein."
  },
  "Move from the article into a scoped analytics or AI engagement.": {
    "el": "Αξιοποιήστε το άρθρο ως αφετηρία για μια συνεργασία ανάλυσης δεδομένων ή AI με καθορισμένο αντικείμενο.",
    "de": "Nutzen Sie den Beitrag als Ausgangspunkt für ein klar abgegrenztes Analyse- oder KI-Projekt."
  },
  "Once the first workflow works, the company can decide whether to connect AI to more data sources, build internal tools, or develop product-facing experiences. That is how AI becomes operational rather than decorative.": {
    "el": "Μόλις λειτουργήσει η πρώτη ροή εργασίας, η εταιρεία μπορεί να εξετάσει τη σύνδεση της AI με περισσότερες πηγές δεδομένων, την ανάπτυξη εσωτερικών εργαλείων ή την ενσωμάτωσή της σε λειτουργίες προϊόντων για χρήστες. Έτσι η AI αποκτά επιχειρησιακή αξία και δεν παραμένει διακοσμητική προσθήκη.",
    "de": "Sobald der erste Workflow funktioniert, kann das Unternehmen weitere Datenquellen anbinden, interne Werkzeuge entwickeln oder KI in nutzerseitige Produktfunktionen integrieren. So wird KI operativ nützlich statt zur bloßen Dekoration."
  },
  "One-time cleanup helps temporarily, but repeatable checks create trust. Teams should document the rule, the owner, the expected threshold, and what happens when the rule fails.": {
    "el": "Ο εφάπαξ καθαρισμός δεδομένων βοηθά προσωρινά, αλλά οι επαναλήψιμοι έλεγχοι δημιουργούν εμπιστοσύνη. Οι ομάδες πρέπει να τεκμηριώνουν κάθε κανόνα, τον υπεύθυνο, το αναμενόμενο όριο και τη διαδικασία που ακολουθείται όταν ο έλεγχος αποτύχει.",
    "de": "Eine einmalige Datenbereinigung hilft vorübergehend, wiederholbare Prüfungen schaffen Vertrauen. Teams sollten jede Regel, die verantwortliche Person, den erwarteten Schwellenwert und das Vorgehen bei einem fehlgeschlagenen Test dokumentieren."
  },
  "Operations": {
    "el": "Επιχειρησιακή λειτουργία",
    "de": "Betrieb"
  },
  "Privacy comes first": {
    "el": "Το απόρρητο έχει προτεραιότητα",
    "de": "Datenschutz hat Vorrang"
  },
  "Productionization": {
    "el": "Θέση σε παραγωγική λειτουργία",
    "de": "Überführung in den produktiven Betrieb"
  },
  "Productionization changes the mindset": {
    "el": "Η παραγωγική λειτουργία αλλάζει τη νοοτροπία",
    "de": "Der produktive Betrieb verändert die Denkweise"
  },
  "Professional-service work often includes document-heavy tasks: reading, summarizing, comparing, extracting, drafting, and reviewing. AI can help, but only if the workflow is designed carefully.": {
    "el": "Οι επαγγελματικές υπηρεσίες συχνά περιλαμβάνουν εκτενή εργασία με έγγραφα: ανάγνωση, σύνοψη, σύγκριση, εξαγωγή στοιχείων, σύνταξη και έλεγχο. Η AI μπορεί να βοηθήσει, αρκεί η ροή εργασίας να έχει σχεδιαστεί προσεκτικά.",
    "de": "Die Arbeit im professionellen Dienstleistungsbereich umfasst häufig dokumentenintensive Aufgaben: Lesen, Zusammenfassen, Vergleichen, Extrahieren, Verfassen und Überprüfen. KI kann helfen, aber nur, wenn der Arbeitsablauf sorgfältig gestaltet ist."
  },
  "Prompt Engineering": {
    "el": "Σχεδιασμός prompts",
    "de": "Prompt Engineering"
  },
  "Prompt quality often fails because teams give inconsistent context. A repeatable workflow should define the required input fields, source documents, audience, output format, tone, constraints, and examples of acceptable output.": {
    "el": "Η ποιότητα των prompts συχνά υποβαθμίζεται επειδή οι ομάδες δίνουν ασυνεπές πλαίσιο. Μια επαναλήψιμη ροή πρέπει να ορίζει τα απαιτούμενα δεδομένα εισόδου, τα έγγραφα πηγής, το κοινό, τη μορφή και το ύφος του αποτελέσματος, τους περιορισμούς και παραδείγματα αποδεκτών απαντήσεων.",
    "de": "Die Qualität von Prompts leidet oft unter uneinheitlichem Kontext. Ein wiederholbarer Workflow sollte erforderliche Eingaben, Quelldokumente, Zielgruppe, Ausgabeformat, Ton, Einschränkungen und Beispiele akzeptabler Ergebnisse festlegen."
  },
  "Protect one visible win": {
    "el": "Εξασφαλίστε ένα ορατό, ουσιαστικό αποτέλεσμα",
    "de": "Ein sichtbares Erfolgsergebnis absichern"
  },
  "Refactoring becomes worth it when new measures take too long to build, report performance is poor, users disagree about definitions, or the same business logic appears in several places. Refactoring should not be cosmetic. It should make the model easier to maintain, easier to explain, and safer to reuse.": {
    "el": "Η αναδόμηση του μοντέλου αξίζει όταν η δημιουργία νέων υπολογιζόμενων μέτρων καθυστερεί, οι αναφορές είναι αργές, οι χρήστες διαφωνούν για τους ορισμούς ή η ίδια επιχειρηματική λογική επαναλαμβάνεται. Η αναδόμηση πρέπει να βελτιώνει τη συντήρηση, την κατανόηση και την ασφαλή επαναχρησιμοποίηση του μοντέλου, πέρα από την εμφάνισή του.",
    "de": "Refactoring lohnt sich, wenn neue Measures zu viel Zeit kosten, Berichte langsam sind, Definitionen umstritten sind oder Geschäftslogik mehrfach vorkommt. Es sollte Wartbarkeit, Verständlichkeit und sichere Wiederverwendung verbessern, nicht nur die Oberfläche."
  },
  "Reporting": {
    "el": "Αναφορές",
    "de": "Berichterstattung"
  },
  "Reporting Governance": {
    "el": "Διακυβέρνηση αναφορών",
    "de": "Reporting-Governance"
  },
  "SEO is not only about publishing articles. The technical surface matters too. Clean routes, fast pages, readable headings, descriptive metadata, internal links, and structured content all help search engines and users understand the site. More importantly, they help visitors move from search intent to action.": {
    "el": "Το SEO δεν περιορίζεται στη δημοσίευση άρθρων. Σημασία έχει και η τεχνική υποδομή: καθαρές διευθύνσεις σελίδων, ταχύτητα, ευανάγνωστες επικεφαλίδες, περιγραφικά μεταδεδομένα, εσωτερικοί σύνδεσμοι και οργανωμένο περιεχόμενο βοηθούν τις μηχανές αναζήτησης και τους χρήστες να κατανοούν τον ιστότοπο και τους επισκέπτες να φτάνουν στην κατάλληλη ενέργεια.",
    "de": "SEO umfasst mehr als die Veröffentlichung von Artikeln. Auch die Technik zählt: klare URLs, schnelle Seiten, lesbare Überschriften, beschreibende Metadaten, interne Links und strukturierte Inhalte helfen Suchmaschinen und Nutzern, die Website zu verstehen und von der Suche zur passenden Handlung zu gelangen."
  },
  "Selected delivery examples and case-study material are the proof layer for this service. Service pages explain the offer, project examples show delivery, and articles answer the questions prospects ask before they are ready to contact. When these pieces connect, the site becomes more than content. It becomes a lead-quality system.": {
    "el": "Τα επιλεγμένα έργα και οι μελέτες περίπτωσης τεκμηριώνουν αυτή την υπηρεσία. Οι σελίδες υπηρεσιών εξηγούν την προσφορά, τα έργα δείχνουν την υλοποίηση και τα άρθρα απαντούν στις ερωτήσεις των υποψήφιων πελατών πριν επικοινωνήσουν. Όταν αυτά συνδέονται, ο ιστότοπος γίνεται ένα σύστημα προσέλκυσης κατάλληλων αιτημάτων συνεργασίας.",
    "de": "Ausgewählte Projekte und Fallstudien belegen diese Leistung. Leistungsseiten erklären das Angebot, Projektbeispiele zeigen die Umsetzung und Artikel beantworten Fragen vor der Kontaktaufnahme. Zusammen unterstützen diese Inhalte die Gewinnung qualifizierter Anfragen."
  },
  "Start narrow, then expand": {
    "el": "Ξεκινήστε με περιορισμένο αντικείμενο και επεκταθείτε σταδιακά",
    "de": "Mit klarem, engem Umfang beginnen und schrittweise erweitern"
  },
  "Start with the top metrics": {
    "el": "Ξεκινήστε με τους σημαντικότερους δείκτες",
    "de": "Beginnen Sie mit den wichtigsten Kennzahlen"
  },
  "Statistics": {
    "el": "Στατιστική",
    "de": "Statistik"
  },
  "Teams often train on weak historical data, ignore structural changes, overfocus on one accuracy metric, or fail to explain uncertainty. Another common mistake is building a forecast without defining who will use it and what action it supports.": {
    "el": "Συχνά τα μοντέλα εκπαιδεύονται με ανεπαρκή ιστορικά δεδομένα, παραβλέπονται δομικές αλλαγές, δίνεται υπερβολική έμφαση σε έναν μόνο δείκτη ακρίβειας ή δεν εξηγείται η αβεβαιότητα. Επίσης, μια πρόβλεψη συχνά δημιουργείται χωρίς να έχει οριστεί ποιος θα τη χρησιμοποιήσει και ποια ενέργεια θα υποστηρίξει.",
    "de": "Häufig werden Modelle mit schwachen historischen Daten trainiert, strukturelle Veränderungen ignoriert, einzelne Genauigkeitsmaße überbewertet oder Unsicherheiten unzureichend erklärt. Ebenso problematisch ist eine Prognose, bei der nicht feststeht, wer sie nutzt und welche Handlung sie unterstützt."
  },
  "That approach keeps delivery realistic and gives the business evidence before investing more.": {
    "el": "Αυτή η προσέγγιση κρατά την υλοποίηση ρεαλιστική και δίνει στην επιχείρηση στοιχεία αξιολόγησης πριν επενδύσει περισσότερο.",
    "de": "Dieser Ansatz hält die Umsetzung realistisch und liefert dem Unternehmen eine Entscheidungsgrundlage, bevor es weiter investiert."
  },
  "That future may be simple: more case studies, new landing pages, or a better contact flow. It may also become more advanced: dashboards, customer portals, AI-assisted workflows, or internal tools. A good web foundation keeps those paths open.": {
    "el": "Οι μελλοντικές προσθήκες μπορεί να είναι απλές: περισσότερες μελέτες περίπτωσης, νέες σελίδες προορισμού ή καλύτερη επικοινωνία. Μπορεί επίσης να περιλαμβάνουν dashboards, πύλες πελατών, ροές AI ή εσωτερικά εργαλεία. Μια σωστή διαδικτυακή υποδομή επιτρέπει αυτές τις επεκτάσεις.",
    "de": "Diese Zukunft könnte einfach sein: mehr Fallstudien, neue Zielseiten oder ein besserer Kontaktfluss. Es kann auch fortschrittlicher werden: Dashboards, Kundenportale, KI-gestützte Arbeitsabläufe oder interne Tools. Ein gutes Webfundament hält diese Wege offen."
  },
  "That is where MLOps matters. For small and mid-sized teams, MLOps should be practical, not heavy. The goal is to make AI and analytics workflows repeatable enough to trust.": {
    "el": "Εδώ αποκτά αξία το MLOps. Για μικρές και μεσαίες ομάδες πρέπει να είναι πρακτικό, χωρίς περιττή πολυπλοκότητα. Στόχος είναι οι ροές AI και ανάλυσης δεδομένων να εκτελούνται επαναλήψιμα και αξιόπιστα.",
    "de": "Hier wird MLOps wichtig. Für kleine und mittlere Teams sollte es praxisnah und schlank bleiben. Ziel sind wiederholbare, verlässliche KI- und Analyse-Workflows."
  },
  "That is why website development should start with the business problem, not the template. A local service provider may need trust, location clarity, booking paths, and fast mobile performance. A B2B company may need stronger positioning, lead capture, case studies, and analytics. A product company may need an app-like surface that explains value and routes users into a workflow.": {
    "el": "Γι’ αυτό η ανάπτυξη μιας ιστοσελίδας πρέπει να ξεκινά από την επιχειρηματική ανάγκη. Μια τοπική υπηρεσία ίσως χρειάζεται αξιοπιστία, σαφή τοποθεσία, εύκολες κρατήσεις και ταχύτητα στο κινητό. Μια εταιρεία B2B μπορεί να χρειάζεται ισχυρότερη τοποθέτηση, προσέλκυση υποψήφιων πελατών, μελέτες περίπτωσης και ανάλυση επισκεψιμότητας. Μια εταιρεία προϊόντος μπορεί να χρειάζεται περιβάλλον παρόμοιο με εφαρμογή, που εξηγεί την αξία και οδηγεί τον χρήστη σε συγκεκριμένη διαδικασία.",
    "de": "Aus diesem Grund sollte die Website-Entwicklung mit dem Geschäftsproblem beginnen, nicht mit der Vorlage. Ein lokaler Dienstanbieter benötigt möglicherweise Vertrauen, Standortklarheit, Buchungspfade und eine schnelle mobile Leistung. Ein B2B-Unternehmen benötigt möglicherweise eine stärkere Positionierung, Lead-Erfassung, Fallstudien und Analysen. Ein Produktunternehmen benötigt möglicherweise eine App-ähnliche Oberfläche, die den Wert erklärt und Benutzer in einen Arbeitsablauf leitet."
  },
  "The best starting point is a workflow that already has value. Productionize that first: version it, schedule it, document it, and make ownership clear.": {
    "el": "Η καλύτερη αφετηρία είναι μια ροή εργασίας που ήδη προσφέρει αξία. Θέστε πρώτα αυτή σε παραγωγική λειτουργία: διαχειριστείτε τις εκδόσεις, προγραμματίστε την εκτέλεση, τεκμηριώστε τη λειτουργία και ορίστε σαφώς τους υπευθύνους.",
    "de": "Der beste Ausgangspunkt ist ein Workflow, der bereits Nutzen liefert. Überführen Sie diesen zuerst in den produktiven Betrieb: Versionen verwalten, Ausführung planen, Abläufe dokumentieren und Verantwortlichkeiten klären."
  },
  "The difference between a site and a working system": {
    "el": "Η διαφορά ανάμεσα σε μια ιστοσελίδα και ένα σύστημα που λειτουργεί στην πράξη",
    "de": "Der Unterschied zwischen einer Site und einem funktionierenden System"
  },
  "The first 90 days should include one visible improvement that proves momentum. It might be a trusted executive dashboard, a cleaned revenue model, an automated refresh, or a pilot AI workflow with human review.": {
    "el": "Οι πρώτες 90 ημέρες πρέπει να περιλαμβάνουν μια ορατή βελτίωση που αποδεικνύει την πρόοδο. Μπορεί να είναι ένα αξιόπιστο dashboard διοίκησης, ένα διορθωμένο μοντέλο εσόδων, αυτόματη ανανέωση δεδομένων ή μια πιλοτική ροή AI με ανθρώπινο έλεγχο.",
    "de": "In den ersten 90 Tagen sollte es eine sichtbare Verbesserung geben, die die Dynamik beweist. Dabei kann es sich um ein vertrauenswürdiges Executive-Dashboard, ein bereinigtes Umsatzmodell, eine automatisierte Aktualisierung oder einen Pilot-KI-Workflow mit menschlicher Überprüfung handeln."
  },
  "The notebook gap": {
    "el": "Το κενό ανάμεσα στο notebook και την παραγωγική λειτουργία",
    "de": "Die Lücke zwischen Notebook und produktivem Betrieb"
  },
  "The output of data strategy should be practical. It should identify the most important business questions, the data sources behind them, the current gaps, and a sequenced backlog. That backlog may include a Power BI semantic model, a data warehouse migration, a KPI dictionary, a data-quality process, or an AI workflow.": {
    "el": "Η στρατηγική δεδομένων πρέπει να δίνει πρακτικά αποτελέσματα: τα σημαντικότερα επιχειρηματικά ερωτήματα, τις πηγές τους, τα σημερινά κενά και μια λίστα εργασιών με σειρά προτεραιότητας. Αυτή μπορεί να περιλαμβάνει σημασιολογικό μοντέλο Power BI, μετάβαση σε αποθήκη δεδομένων, λεξικό KPI, διαδικασία ποιότητας ή ροή AI.",
    "de": "Eine Datenstrategie sollte praktische Ergebnisse liefern: die wichtigsten Geschäftsfragen, zugehörige Datenquellen, bestehende Lücken und einen priorisierten Umsetzungs-Backlog. Dazu können ein semantisches Power-BI-Modell, eine Data-Warehouse-Migration, ein KPI-Verzeichnis, ein Qualitätsprozess oder ein KI-Workflow gehören."
  },
  "The roadmap should produce a backlog, not just a presentation. That backlog may include source-system cleanup, a KPI dictionary, Power BI model work, dashboard consolidation, cloud migration, data-quality checks, or a first AI workflow.": {
    "el": "Το πλάνο πρέπει να καταλήγει σε λίστα εργασιών προς υλοποίηση και όχι μόνο σε παρουσίαση. Η λίστα μπορεί να περιλαμβάνει καθαρισμό δεδομένων στα συστήματα προέλευσης, λεξικό KPI, βελτίωση μοντέλου Power BI, ενοποίηση dashboards, μετάβαση στο cloud, ελέγχους ποιότητας ή μια πρώτη ροή AI.",
    "de": "Die Roadmap sollte einen Umsetzungs-Backlog ergeben, nicht nur eine Präsentation. Mögliche Aufgaben sind die Bereinigung von Quellsystemen, ein KPI-Verzeichnis, Verbesserungen am Power-BI-Modell, die Zusammenführung von Dashboards, Cloud-Migration, Qualitätsprüfungen oder ein erster KI-Workflow."
  },
  "The sticker price is only part of the decision. SaaS tools can require configuration, licensing, workarounds, data exports, and manual reconciliation. Custom tools require design, development, hosting, maintenance, and ownership.": {
    "el": "Η αρχική τιμή είναι μόνο ένα μέρος της απόφασης. Τα εργαλεία SaaS μπορεί να απαιτούν παραμετροποίηση, άδειες χρήσης, παρακάμψεις περιορισμών, εξαγωγές δεδομένων και χειροκίνητη συμφωνία στοιχείων. Τα εξατομικευμένα εργαλεία απαιτούν σχεδιασμό, ανάπτυξη, φιλοξενία, συντήρηση και σαφείς αρμοδιότητες.",
    "de": "Der Anschaffungspreis ist nur ein Teil der Entscheidung. SaaS-Werkzeuge können Konfiguration, Lizenzen, Umgehungslösungen, Datenexporte und manuelle Datenabgleiche erfordern. Individuelle Werkzeuge brauchen Konzeption, Entwicklung, Hosting, Wartung und klar geregelte Zuständigkeiten."
  },
  "The strongest dictionaries are not separate documents that become outdated. They connect to semantic models, report documentation, and review habits so metric changes are visible.": {
    "el": "Τα πιο χρήσιμα λεξικά KPI δεν μένουν απομονωμένα έγγραφα που παλιώνουν. Συνδέονται με τα σημασιολογικά μοντέλα, την τεκμηρίωση αναφορών και τους τακτικούς ελέγχους, ώστε κάθε αλλαγή στους δείκτες να είναι ορατή.",
    "de": "Die stärksten Wörterbücher sind keine separaten Dokumente, die veraltet sind. Sie stellen eine Verbindung zu semantischen Modellen, Berichtsdokumentationen und Überprüfungsgewohnheiten her, sodass metrische Änderungen sichtbar sind."
  },
  "The team should also define non-visual requirements: refresh timing, security roles, export needs, mobile usage, accessibility, ownership, and how changes will be requested. These details shape the model and operating process as much as the visual layout.": {
    "el": "Η ομάδα πρέπει επίσης να καθορίσει απαιτήσεις πέρα από την εμφάνιση: χρόνο ανανέωσης, ρόλους ασφάλειας, ανάγκες εξαγωγής, χρήση σε κινητό, προσβασιμότητα, υπευθύνους και διαδικασία αιτημάτων αλλαγής. Αυτά επηρεάζουν το μοντέλο και τη λειτουργία όσο και η οπτική διάταξη.",
    "de": "Das Team sollte auch Anforderungen jenseits der Darstellung festlegen: Aktualisierungszeitpunkte, Sicherheitsrollen, Exporte, mobile Nutzung, Barrierefreiheit, Verantwortlichkeiten und Änderungsanfragen. Diese Punkte prägen Modell und Betrieb ebenso wie das visuelle Layout."
  },
  "This may mean a narrow internal assistant, a document workflow, a reporting companion, or a customer-facing product. In each case, the implementation should include human review, privacy awareness, and clear limits.": {
    "el": "Αυτό μπορεί να σημαίνει έναν εσωτερικό βοηθό με περιορισμένο αντικείμενο, μια ροή εγγράφων, υποστήριξη αναφορών ή ένα προϊόν για πελάτες. Κάθε υλοποίηση πρέπει να περιλαμβάνει ανθρώπινο έλεγχο, μέριμνα για το απόρρητο και σαφή όρια.",
    "de": "Das kann ein interner Assistent mit engem Aufgabenbereich, ein Dokumentenprozess, eine Reporting-Hilfe oder ein kundenorientiertes Produkt sein. Jede Umsetzung sollte menschliche Prüfung, Datenschutz und klare Grenzen berücksichtigen."
  },
  "This turns a prompt from a personal trick into an operating asset. The team can improve it, document it, and train new users without starting from zero.": {
    "el": "Έτσι το prompt γίνεται επαναχρησιμοποιήσιμο εργαλείο της ομάδας. Η ομάδα μπορεί να το βελτιώνει, να το τεκμηριώνει και να εκπαιδεύει νέους χρήστες χωρίς να ξεκινά από το μηδέν.",
    "de": "So wird ein Prompt vom persönlichen Hilfsmittel zu einem wiederverwendbaren Werkzeug des Teams. Es lässt sich verbessern, dokumentieren und neuen Nutzern vermitteln, ohne jedes Mal bei null anzufangen."
  },
  "Training": {
    "el": "Εκπαίδευση",
    "de": "Schulung"
  },
  "Training makes policy real": {
    "el": "Η εκπαίδευση μετατρέπει την πολιτική σε καθημερινή πρακτική",
    "de": "Schulung verankert Richtlinien im Arbeitsalltag"
  },
  "Transformation": {
    "el": "Μετασχηματισμός",
    "de": "Transformation"
  },
  "Trust comes from constraints. Users need to know what data the assistant can see, what it is allowed to produce, when a human must review the output, and how errors are handled. Without those rules, adoption becomes inconsistent and risk becomes harder to manage.": {
    "el": "Η εμπιστοσύνη χρειάζεται σαφή όρια. Οι χρήστες πρέπει να γνωρίζουν ποια δεδομένα βλέπει ο βοηθός, τι επιτρέπεται να παράγει, πότε απαιτείται ανθρώπινος έλεγχος και πώς αντιμετωπίζονται τα λάθη. Χωρίς αυτούς τους κανόνες, η χρήση γίνεται ασυνεπής και ο κίνδυνος δυσκολότερα διαχειρίσιμος.",
    "de": "Vertrauen braucht klare Grenzen. Nutzer müssen wissen, auf welche Daten ein Assistent zugreifen darf, was er erzeugen darf, wann Menschen prüfen müssen und wie Fehler behandelt werden. Ohne diese Regeln wird die Nutzung uneinheitlich und das Risiko schwerer beherrschbar."
  },
  "We can turn the idea into architecture, a reporting workflow, a product surface, or an implementation plan tailored to your operating environment.": {
    "el": "Μπορούμε να μετατρέψουμε την ιδέα σε αρχιτεκτονική, ροή αναφορών, περιβάλλον προϊόντος ή πλάνο υλοποίησης προσαρμοσμένο στις συνθήκες λειτουργίας σας.",
    "de": "Wir können die Idee in eine Architektur, einen Reporting-Workflow, eine Produktoberfläche oder einen Implementierungsplan umsetzen, der auf Ihre Betriebsumgebung zugeschnitten ist."
  },
  "What AI literacy should cover": {
    "el": "Τι πρέπει να καλύπτει η εκπαίδευση στην AI",
    "de": "Was KI-Kompetenz abdecken sollte"
  },
  "What Greek businesses should define before they build": {
    "el": "Τι πρέπει να ορίσουν οι ελληνικές επιχειρήσεις πριν από την υλοποίηση",
    "de": "Was griechische Unternehmen vor der Umsetzung festlegen sollten"
  },
  "What clean modeling changes": {
    "el": "Τι αλλάζει με τη σωστή μοντελοποίηση",
    "de": "Was saubere Modellierung verbessert"
  },
  "What policy should include": {
    "el": "Τι πρέπει να περιλαμβάνει η πολιτική",
    "de": "Was die Richtlinie enthalten sollte"
  },
  "When building is the right answer, the first version should be focused. Start with the workflow that creates the most friction, connect the data it needs, and avoid turning a practical internal tool into a large platform too early.": {
    "el": "Όταν επιλέγεται η ανάπτυξη εξατομικευμένου εργαλείου, η πρώτη έκδοση πρέπει να έχει περιορισμένο, σαφή στόχο. Ξεκινήστε από τη ροή που προκαλεί τις περισσότερες δυσκολίες, συνδέστε τα απαιτούμενα δεδομένα και αποφύγετε την πρόωρη μετατροπή ενός πρακτικού εργαλείου σε μεγάλη πλατφόρμα.",
    "de": "Wenn eine Eigenentwicklung sinnvoll ist, sollte die erste Version klar begrenzt sein. Beginnen Sie mit dem Workflow, der die meisten Probleme verursacht, binden Sie die benötigten Daten an und machen Sie aus einem praktischen internen Werkzeug nicht zu früh eine große Plattform."
  },
  "When building makes sense": {
    "el": "Πότε έχει νόημα η ανάπτυξη δικής σας λύσης",
    "de": "Wann sich eine Eigenentwicklung lohnt"
  },
  "When buying makes sense": {
    "el": "Πότε έχει νόημα η αγορά έτοιμης λύσης",
    "de": "Wann sich der Kauf einer fertigen Lösung lohnt"
  },
  "When prompts become shared workflows, output quality becomes easier to improve. Teams can version the workflow, compare results, and teach new users faster.": {
    "el": "Όταν τα prompts εντάσσονται σε κοινές ροές εργασίας, η ποιότητα των αποτελεσμάτων βελτιώνεται ευκολότερα. Οι ομάδες μπορούν να διαχειρίζονται εκδόσεις, να συγκρίνουν αποτελέσματα και να εκπαιδεύουν νέους χρήστες γρηγορότερα.",
    "de": "Wenn Eingabeaufforderungen zu gemeinsamen Arbeitsabläufen werden, lässt sich die Ausgabequalität einfacher verbessern. Teams können den Workflow versionieren, Ergebnisse vergleichen und neue Benutzer schneller unterrichten."
  },
  "When the review criteria are explicit, AI use becomes easier to govern. The team knows what the assistant can help with and what still requires human judgment.": {
    "el": "Όταν τα κριτήρια ελέγχου είναι σαφή, η χρήση της AI γίνεται πιο εύκολα διαχειρίσιμη. Η ομάδα γνωρίζει πού βοηθά ο ψηφιακός βοηθός και πού εξακολουθεί να απαιτείται ανθρώπινη κρίση.",
    "de": "Wenn die Überprüfungskriterien explizit sind, lässt sich der KI-Einsatz leichter steuern. Das Team weiß, womit der Assistent helfen kann und was noch menschliches Urteilsvermögen erfordert."
  },
  "When to refactor a Power BI model": {
    "el": "Πότε να αναδομήσετε ένα μοντέλο Power BI",
    "de": "Wann ein Power-BI-Modell überarbeitet werden sollte"
  },
  "Why BI Solutions treats web delivery as part of the wider data stack": {
    "el": "Γιατί η BI Solutions εντάσσει την ανάπτυξη ιστοσελίδων στη συνολική υποδομή δεδομένων",
    "de": "Warum BI Solutions die Webentwicklung als Teil der gesamten Dateninfrastruktur betrachtet"
  },
  "Why foundations matter": {
    "el": "Γιατί οι σωστές υποδομές έχουν σημασία",
    "de": "Warum solide Datengrundlagen wichtig sind"
  },
  "BI Solutions approaches tool choice inside the broader <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">BI service</a>, because the reporting tool is only one part of the system.": {
    "el": "Η BI Solutions εντάσσει την επιλογή εργαλείου στην ευρύτερη <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία BI</a>, επειδή το εργαλείο αναφορών είναι μόνο ένα μέρος του συστήματος.",
    "de": "BI Solutions betrachtet die Werkzeugauswahl im Rahmen der <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">gesamten BI-Leistung</a>, denn das Reporting-Werkzeug ist nur ein Teil des Systems."
  },
  "For BI Solutions, booking UX belongs inside <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">web app development</a> because the form is part of the operating system. It affects sales, administration, and analytics.": {
    "el": "Για την BI Solutions, η εμπειρία κράτησης εντάσσεται στην <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">ανάπτυξη διαδικτυακών εφαρμογών</a>, επειδή η φόρμα αποτελεί μέρος της καθημερινής λειτουργίας. Επηρεάζει τις πωλήσεις, τη διοίκηση και την ανάλυση δεδομένων.",
    "de": "Für BI Solutions gehört die Nutzererfahrung bei Buchungen zur <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Webanwendungsentwicklung</a>, weil das Formular Teil der betrieblichen Abläufe ist. Es beeinflusst Vertrieb, Verwaltung und Datenanalyse."
  },
  "For BI Solutions, web analytics sits between <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">website development</a> and <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">data governance</a>. The site needs measurement, but the measurement should be proportionate, explainable, and useful.": {
    "el": "Στην BI Solutions, η ανάλυση επισκεψιμότητας συνδέει την <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">ανάπτυξη ιστοσελίδων</a> με τη <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">διακυβέρνηση δεδομένων</a>. Ο ιστότοπος χρειάζεται μέτρηση που να είναι αναλογική, κατανοητή και χρήσιμη.",
    "de": "Bei BI Solutions verbindet die Webanalyse <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Website-Entwicklung</a> und <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Data Governance</a>. Die Website braucht eine verhältnismäßige, nachvollziehbare und nützliche Erfolgsmessung."
  },
  "For teams that want a dedicated workflow, <a href=\"/power-bi-solutions/workspace/\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Power BI Solutions</a> is positioned around semantic model analysis, diagnostics, and AI-assisted guidance for model improvement.": {
    "el": "Για ομάδες που χρειάζονται εξειδικευμένη ροή εργασίας, το <a href=\"/power-bi-solutions/workspace/\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Power BI Solutions</a> προσφέρει ανάλυση σημασιολογικών μοντέλων, διαγνωστικούς ελέγχους και καθοδήγηση με AI για τη βελτίωσή τους.",
    "de": "Für Teams mit einem spezialisierten Arbeitsablauf bietet <a href=\"/power-bi-solutions/workspace/\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Power BI Solutions</a> die Analyse semantischer Modelle, Diagnosen und KI-gestützte Hinweise zur Modellverbesserung."
  },
  "If users can take their AI brain with them, the platform with the best integrations wins. Check <a href=\"https://www.linkedin.com/posts/george-soloupis_develop-an-on-device-rag-system-powered-by-activity-7386649277466415104-zyjk?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAABUEkeIBHVtmjVCuKFACyiq532vpscSqTdI\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Georgios Soloupis work in on-device RAG systems here</a>.": {
    "el": "Αν οι χρήστες μπορούν να μεταφέρουν τη γνώση του βοηθού AI μαζί τους, υπερισχύει η πλατφόρμα με τις καλύτερες διασυνδέσεις. Δείτε <a href=\"https://www.linkedin.com/posts/george-soloupis_develop-an-on-device-rag-system-powered-by-activity-7386649277466415104-zyjk?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAABUEkeIBHVtmjVCuKFACyiq532vpscSqTdI\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">εδώ την εργασία του Georgios Soloupis σε συστήματα RAG που λειτουργούν στη συσκευή</a>.",
    "de": "Wenn Nutzer das Wissen ihres KI-Assistenten mitnehmen können, gewinnt die Plattform mit den besten Integrationen. Sehen Sie <a href=\"https://www.linkedin.com/posts/george-soloupis_develop-an-on-device-rag-system-powered-by-activity-7386649277466415104-zyjk?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAABUEkeIBHVtmjVCuKFACyiq532vpscSqTdI\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">hier die Arbeit von Georgios Soloupis zu RAG-Systemen auf dem Endgerät</a>."
  },
  "In practice, it means BI Solutions can present the product through the main site while still routing users into a dedicated workspace at <a href=\"/power-bi-solutions/workspace/\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">/power-bi-solutions/workspace/</a>. Discovery stays unified at the brand level, while sessions, uploads, and analysis workflows remain isolated inside the product experience where they belong.": {
    "el": "Στην πράξη, η BI Solutions μπορεί να παρουσιάζει το προϊόν στον κύριο ιστότοπο και να οδηγεί τους χρήστες σε ξεχωριστό χώρο εργασίας στο <a href=\"/power-bi-solutions/workspace/\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">/power-bi-solutions/workspace/</a>. Η παρουσίαση παραμένει ενιαία σε επίπεδο επωνυμίας, ενώ οι συνεδρίες, οι μεταφορτώσεις και οι ροές ανάλυσης παραμένουν απομονωμένες στο περιβάλλον του προϊόντος.",
    "de": "BI Solutions kann das Produkt auf der Hauptwebsite vorstellen und Nutzer zugleich zum getrennten Arbeitsbereich unter <a href=\"/power-bi-solutions/workspace/\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">/power-bi-solutions/workspace/</a> führen. Der Markenauftritt bleibt einheitlich, während Sitzungen, Uploads und Analyseabläufe im Produktbereich getrennt bleiben."
  },
  "Inside <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">business intelligence and semantic modeling</a>, this dictionary becomes the bridge between business teams and technical reporting logic.": {
    "el": "Στην <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">επιχειρηματική ευφυΐα και τη σημασιολογική μοντελοποίηση</a>, το λεξικό αυτό συνδέει τις επιχειρησιακές ομάδες με την τεχνική λογική των αναφορών.",
    "de": "Im Bereich <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Business Intelligence und semantische Modellierung</a> verbindet dieses Verzeichnis die Fachteams mit der technischen Reporting-Logik."
  },
  "The <a href=\"/services/ai-automation-consulting\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI automation and workflow service</a> helps frame these processes so they are useful without becoming uncontrolled automation.": {
    "el": "Η <a href=\"/services/ai-automation-consulting\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία αυτοματισμών και ροών εργασίας με AI</a> βοηθά να σχεδιαστούν χρήσιμες διαδικασίες με ελεγχόμενη αυτοματοποίηση.",
    "de": "Die <a href=\"/services/ai-automation-consulting\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für KI-Automatisierung und Workflows</a> hilft, diese Prozesse nützlich und kontrollierbar zu gestalten."
  },
  "The <a href=\"/services/ai-consulting-greece\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI consulting service for organizations in Greece</a> is structured around this idea. AI delivery should connect use-case framing, data readiness, workflow design, and adoption.": {
    "el": "Η <a href=\"/services/ai-consulting-greece\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">συμβουλευτική AI για οργανισμούς στην Ελλάδα</a> βασίζεται σε αυτή την αρχή. Η υλοποίηση συνδέει τον προσδιορισμό χρήσεων, την ετοιμότητα δεδομένων, τον σχεδιασμό ροών και την υιοθέτηση.",
    "de": "Die <a href=\"/services/ai-consulting-greece\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">KI-Beratung für Organisationen in Griechenland</a> folgt diesem Ansatz. Die Umsetzung verbindet Anwendungsfälle, Datenbereitschaft, Workflow-Design und Einführung."
  },
  "The <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI governance, literacy, and adoption service</a> includes this kind of support.": {
    "el": "Η <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία διακυβέρνησης, εκπαίδευσης και υιοθέτησης AI</a> περιλαμβάνει αυτή την υποστήριξη.",
    "de": "Die <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für KI-Governance, KI-Kompetenz und Einführung</a> umfasst diese Unterstützung."
  },
  "The <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI literacy and change management service</a> also covers analytics adoption because AI and BI both require better interpretation habits.": {
    "el": "Η <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία εκπαίδευσης στην AI και διαχείρισης αλλαγών</a> καλύπτει και την αξιοποίηση της ανάλυσης δεδομένων, καθώς τόσο η AI όσο και το BI απαιτούν καλύτερες πρακτικές ερμηνείας.",
    "de": "Die <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für KI-Kompetenz und Change Management</a> unterstützt auch die Nutzung von Datenanalysen, da KI und BI bessere Interpretationspraktiken erfordern."
  },
  "The <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI literacy and change management service</a> helps teams translate responsible AI principles into practical workplace habits.": {
    "el": "Η <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία εκπαίδευσης στην AI και διαχείρισης αλλαγών</a> βοηθά τις ομάδες να εφαρμόζουν τις αρχές υπεύθυνης AI στην καθημερινή εργασία.",
    "de": "Die <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für KI-Kompetenz und Change Management</a> hilft Teams, Grundsätze verantwortungsvoller KI im Arbeitsalltag umzusetzen."
  },
  "The <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">BI and semantic modeling service</a> is designed to catch those problems early and make the reporting layer easier to scale.": {
    "el": "Η <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία BI και σημασιολογικής μοντελοποίησης</a> εντοπίζει έγκαιρα αυτά τα προβλήματα και διευκολύνει την επέκταση του συστήματος αναφορών.",
    "de": "Die <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für BI und semantische Modellierung</a> erkennt diese Probleme frühzeitig und erleichtert die Skalierung des Reportings."
  },
  "The <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">BI and semantic modeling service</a> starts with this framing because it drives the model, metrics, and user experience.": {
    "el": "Η <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία BI και σημασιολογικής μοντελοποίησης</a> ξεκινά από αυτές τις ανάγκες, επειδή καθορίζουν το μοντέλο, τους δείκτες και την εμπειρία χρήστη.",
    "de": "Die <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für BI und semantische Modellierung</a> beginnt mit dieser Einordnung, weil sie Modell, Kennzahlen und Nutzererfahrung bestimmt."
  },
  "The <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">data governance service</a> and <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">web development service</a> should work together so measurement is useful and proportionate.": {
    "el": "Η <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">διακυβέρνηση δεδομένων</a> και η <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">ανάπτυξη ιστοσελίδων</a> πρέπει να συνεργάζονται, ώστε η μέτρηση να είναι χρήσιμη και αναλογική.",
    "de": "<a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Data Governance</a> und <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Webentwicklung</a> sollten zusammenwirken, damit die Erfolgsmessung nützlich und verhältnismäßig bleibt."
  },
  "The <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">data strategy and cloud foundations service</a> frames cloud work around these operating questions.": {
    "el": "Η <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία στρατηγικής δεδομένων και υποδομών cloud</a> οργανώνει την εργασία στο cloud γύρω από αυτά τα επιχειρησιακά ερωτήματα.",
    "de": "Die <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für Datenstrategie und Cloud-Infrastruktur</a> richtet die Cloud-Arbeit an diesen betrieblichen Fragen aus."
  },
  "The <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">data strategy and governance service</a> focuses on those practical operating rules. The goal is to make data usable for reporting, analytics, and AI without losing control.": {
    "el": "Η <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία στρατηγικής και διακυβέρνησης δεδομένων</a> εστιάζει σε αυτούς τους πρακτικούς κανόνες. Στόχος είναι η αξιοποίηση δεδομένων για αναφορές, ανάλυση και AI με διατήρηση του ελέγχου.",
    "de": "Die <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für Datenstrategie und Governance</a> konzentriert sich auf diese praktischen Regeln. Daten sollen für Reporting, Analysen und KI nutzbar werden, ohne die Kontrolle zu verlieren."
  },
  "The <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">data strategy and governance service</a> helps define those operating rules in a way that supports analytics, BI, and AI delivery.": {
    "el": "Η <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία στρατηγικής και διακυβέρνησης δεδομένων</a> ορίζει κανόνες λειτουργίας που υποστηρίζουν την υλοποίηση λύσεων ανάλυσης, BI και AI.",
    "de": "Die <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für Datenstrategie und Governance</a> definiert betriebliche Regeln, die die Umsetzung von Analysen, BI und KI unterstützen."
  },
  "The <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">data strategy and governance service</a> helps teams make these checks part of the operating process rather than a one-time cleanup.": {
    "el": "Η <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία στρατηγικής και διακυβέρνησης δεδομένων</a> εντάσσει αυτούς τους ελέγχους στην καθημερινή λειτουργία, πέρα από έναν εφάπαξ καθαρισμό δεδομένων.",
    "de": "Die <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für Datenstrategie und Governance</a> verankert diese Prüfungen im laufenden Betrieb statt in einer einmaligen Datenbereinigung."
  },
  "The <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">cloud migration service</a> helps teams move critical reporting workflows into a more reliable foundation without losing the practical flexibility people like about spreadsheets.": {
    "el": "Η <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία μετάβασης στο cloud</a> μεταφέρει κρίσιμες ροές αναφορών σε πιο αξιόπιστες υποδομές, διατηρώντας την πρακτική ευελιξία που εκτιμούν οι χρήστες στα υπολογιστικά φύλλα.",
    "de": "Die <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für Cloud-Migration</a> überführt wichtige Reporting-Prozesse auf eine verlässlichere Grundlage und bewahrt dabei die praktische Flexibilität von Tabellenkalkulationen."
  },
  "The <a href=\"/services/mlops-model-monitoring\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">MLOps and model monitoring service</a> focuses on that practical transition from experiment to maintained system.": {
    "el": "Η <a href=\"/services/mlops-model-monitoring\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία MLOps και παρακολούθησης μοντέλων</a> εστιάζει στην πρακτική μετάβαση από το πείραμα σε ένα συντηρήσιμο σύστημα.",
    "de": "Die <a href=\"/services/mlops-model-monitoring\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für MLOps und Modellüberwachung</a> begleitet den praktischen Übergang vom Experiment zu einem wartbaren System."
  },
  "The <a href=\"/services/mlops-model-monitoring\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">MLOps and productionization service</a> helps define these controls without making the first version too heavy.": {
    "el": "Η <a href=\"/services/mlops-model-monitoring\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία MLOps και θέσης σε παραγωγική λειτουργία</a> ορίζει αυτούς τους ελέγχους χωρίς περιττή πολυπλοκότητα στην πρώτη έκδοση.",
    "de": "Die <a href=\"/services/mlops-model-monitoring\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für MLOps und produktiven Betrieb</a> definiert diese Kontrollen, ohne die erste Version unnötig komplex zu machen."
  },
  "The <a href=\"/services/predictive-analytics-machine-learning\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">predictive analytics and machine learning service</a> frames predictive work around decision support, not model output alone.": {
    "el": "Η <a href=\"/services/predictive-analytics-machine-learning\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία προγνωστικής ανάλυσης και μηχανικής μάθησης</a> σχεδιάζει τις προβλέψεις με στόχο την υποστήριξη αποφάσεων, πέρα από την απλή παραγωγή αποτελεσμάτων μοντέλων.",
    "de": "Die <a href=\"/services/predictive-analytics-machine-learning\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für prädiktive Analysen und maschinelles Lernen</a> richtet Prognosen an der Entscheidungsunterstützung aus, nicht allein an der Modellausgabe."
  },
  "The <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">web app development service</a> helps scope these internal tools without turning every operational need into a large software project.": {
    "el": "Η <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία ανάπτυξης διαδικτυακών εφαρμογών</a> καθορίζει το κατάλληλο αντικείμενο αυτών των εργαλείων, χωρίς κάθε επιχειρησιακή ανάγκη να γίνεται μεγάλο έργο λογισμικού.",
    "de": "Die <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für Webanwendungsentwicklung</a> grenzt diese Werkzeuge sinnvoll ein, ohne aus jeder betrieblichen Anforderung ein großes Softwareprojekt zu machen."
  },
  "The <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">website and app development service</a> connects web delivery with analytics because the two are now part of the same business system.": {
    "el": "Η <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία ανάπτυξης ιστοσελίδων και εφαρμογών</a> συνδέει την ανάπτυξη με την ανάλυση δεδομένων, καθώς αποτελούν πλέον μέρη του ίδιου επιχειρηματικού συστήματος.",
    "de": "Die <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für Website- und Anwendungsentwicklung</a> verbindet Webentwicklung und Datenanalyse als Teile desselben betrieblichen Systems."
  },
  "The <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">website and app development service</a> pairs well with <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">advanced analytics and AI</a> for this reason. The interface and the AI workflow need to be designed together.": {
    "el": "Η <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">ανάπτυξη ιστοσελίδων και εφαρμογών</a> συνδυάζεται με την <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">προηγμένη ανάλυση δεδομένων και AI</a>, καθώς η διεπαφή και η ροή AI πρέπει να σχεδιάζονται μαζί.",
    "de": "<a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Website- und Anwendungsentwicklung</a> ergänzt sich mit <a href=\"/services/advanced-analytics-ai\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">fortgeschrittener Datenanalyse und KI</a>, weil Oberfläche und KI-Workflow gemeinsam gestaltet werden müssen."
  },
  "The <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">website and app development service</a> treats redesign as a business workflow: clarify positioning, remove friction, improve measurement, and then update the interface.": {
    "el": "Η <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία ανάπτυξης ιστοσελίδων και εφαρμογών</a> αντιμετωπίζει τον επανασχεδιασμό ως επιχειρηματική διαδικασία: ξεκαθαρίζει την τοποθέτηση, αφαιρεί εμπόδια, βελτιώνει τη μέτρηση και κατόπιν ανανεώνει τη διεπαφή.",
    "de": "Die <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für Website- und Anwendungsentwicklung</a> behandelt einen Relaunch als Geschäftsprozess: Positionierung klären, Hürden abbauen, Erfolgsmessung verbessern und anschließend die Oberfläche erneuern."
  },
  "The dedicated <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">business intelligence and semantic modeling service</a> covers this scope directly. The focus is on dashboards and semantic models that teams can trust, reuse, and maintain.": {
    "el": "Η <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία επιχειρηματικής ευφυΐας και σημασιολογικής μοντελοποίησης</a> καλύπτει άμεσα αυτές τις ανάγκες, με έμφαση σε dashboards και μοντέλα που οι ομάδες μπορούν να εμπιστευθούν, να επαναχρησιμοποιήσουν και να συντηρήσουν.",
    "de": "Die <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für Business Intelligence und semantische Modellierung</a> deckt diesen Umfang ab. Im Mittelpunkt stehen verlässliche, wiederverwendbare und wartbare Dashboards und Modelle."
  },
  "The dedicated <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">website and app development service</a> explains this delivery approach in more detail. The goal is not just to launch pages. The goal is to ship a digital surface that can support positioning, workflow, and measurable business outcomes.": {
    "el": "Η <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">υπηρεσία ανάπτυξης ιστοσελίδων και εφαρμογών</a> εξηγεί αναλυτικά αυτή την προσέγγιση. Στόχος είναι η υλοποίηση ενός ψηφιακού περιβάλλοντος που στηρίζει την τοποθέτηση, τις ροές εργασίας και τα μετρήσιμα επιχειρηματικά αποτελέσματα.",
    "de": "Die <a href=\"/services/website-app-development\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Leistung für Website- und Anwendungsentwicklung</a> erläutert diesen Ansatz. Ziel ist eine digitale Lösung, die Positionierung, Arbeitsabläufe und messbare Geschäftsergebnisse unterstützt."
  },
  "This belongs in the practical overlap between <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">cloud migration</a> and <a href=\"/services/mlops-model-monitoring\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">productionization</a>.": {
    "el": "Αυτό συνδέει πρακτικά τη <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">μετάβαση στο cloud</a> με τη <a href=\"/services/mlops-model-monitoring\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">θέση σε παραγωγική λειτουργία</a>.",
    "de": "Hier treffen <a href=\"/services/digital-transformation-cloud-migration\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Cloud-Migration</a> und <a href=\"/services/mlops-model-monitoring\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Überführung in den produktiven Betrieb</a> praktisch zusammen."
  },
  "This is where <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">AI literacy and change management</a> becomes part of delivery. Teams do not only need a working AI tool. They need the judgment to use it well, reject weak outputs, and improve the workflow over time.": {
    "el": "Εδώ η <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">εκπαίδευση στην AI και η διαχείριση αλλαγών</a> γίνεται μέρος της υλοποίησης. Οι ομάδες χρειάζονται και την κριτική ικανότητα να χρησιμοποιούν σωστά το εργαλείο, να απορρίπτουν ανεπαρκείς απαντήσεις και να βελτιώνουν τη ροή με τον χρόνο.",
    "de": "Hier werden <a href=\"/services/ai-governance-literacy-adoption\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">KI-Kompetenz und Change Management</a> Teil der Umsetzung. Teams brauchen auch das Urteilsvermögen, das Werkzeug sinnvoll zu nutzen, schwache Ergebnisse abzulehnen und den Workflow fortlaufend zu verbessern."
  },
  "This is why <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">BI and semantic modeling</a> should be treated together. If the model is weak, better visuals only hide the problem. If the model is strong, each new report becomes easier to build, explain, and govern.": {
    "el": "Γι’ αυτό το <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">BI και η σημασιολογική μοντελοποίηση</a> πρέπει να εξετάζονται μαζί. Ένα αδύναμο μοντέλο απλώς κρύβεται πίσω από καλύτερα γραφικά. Ένα ισχυρό μοντέλο κάνει κάθε νέα αναφορά ευκολότερη στην κατασκευή, την εξήγηση και τη διαχείριση.",
    "de": "Deshalb sollten <a href=\"/services/business-intelligence-semantic-modeling\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">BI und semantische Modellierung</a> gemeinsam betrachtet werden. Bessere Visualisierungen verdecken ein schwaches Modell nur. Ein starkes Modell macht neue Berichte leichter umsetzbar, erklärbar und steuerbar."
  },
  "This sits naturally inside <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">data strategy and governance</a> because customer data requires quality, privacy, and ownership.": {
    "el": "Αυτό εντάσσεται στη <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">στρατηγική και διακυβέρνηση δεδομένων</a>, καθώς τα δεδομένα πελατών απαιτούν ποιότητα, απόρρητο και σαφείς αρμοδιότητες.",
    "de": "Dies gehört zur <a href=\"/services/data-strategy-governance\" class=\"text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-gray-600\">Datenstrategie und Governance</a>, denn Kundendaten brauchen Qualität, Datenschutz und klare Verantwortlichkeiten."
  },
  "By": {
    "el": "Συντάκτης:",
    "de": "Von"
  },
  "Bonusaki public preview and pilot routes may show the customer, merchant, and cashier experience. Real customer entitlements are created only when a live merchant pilot is enabled, a valid server-issued reward code exists, and the reward is accepted under the merchant's approved campaign rules. A live Bonusaki merchant pilot requires a separate written agreement covering campaign rules, prize inventory, cashier validation, fraud controls, privacy responsibilities, support expectations, and any commercial terms.": {
    "el": "Η δημόσια προεπισκόπηση και οι πιλοτικές σελίδες του Bonusaki μπορεί να παρουσιάζουν την εμπειρία πελάτη, επιχείρησης και ταμία. Πραγματικά δικαιώματα ανταμοιβής για πελάτες δημιουργούνται μόνο όταν έχει ενεργοποιηθεί πιλοτική λειτουργία με επιχείρηση, υπάρχει έγκυρος κωδικός ανταμοιβής που έχει εκδοθεί από τον διακομιστή και η ανταμοιβή γίνεται αποδεκτή σύμφωνα με τους εγκεκριμένους κανόνες της καμπάνιας της επιχείρησης. Η πιλοτική λειτουργία Bonusaki με επιχείρηση απαιτεί χωριστή γραπτή συμφωνία για τους κανόνες της καμπάνιας, τα διαθέσιμα έπαθλα, την επιβεβαίωση από τον ταμία, τους ελέγχους απάτης, τις αρμοδιότητες προστασίας δεδομένων, τις απαιτήσεις υποστήριξης και τους εμπορικούς όρους.",
    "de": "Die öffentliche Vorschau und die Pilotseiten von Bonusaki können die Abläufe für Kunden, Händler und Kassenpersonal zeigen. Tatsächliche Kundenansprüche entstehen nur, wenn ein Pilotbetrieb mit einem Händler aktiviert ist, ein gültiger serverseitig ausgegebener Prämiencode vorliegt und die Prämie nach den freigegebenen Kampagnenregeln angenommen wird. Ein aktiver Bonusaki-Pilotbetrieb erfordert eine gesonderte schriftliche Vereinbarung über Kampagnenregeln, verfügbare Preise, Bestätigung durch Kassenpersonal, Betrugskontrollen, Datenschutzverantwortlichkeiten, Supportanforderungen und geschäftliche Bedingungen."
  },
  "Copy, resell, or redistribute our services without written permission.": {
    "el": "Αντιγραφή, μεταπώληση ή αναδιανομή των υπηρεσιών μας χωρίς γραπτή άδεια.",
    "de": "Unsere Dienste ohne schriftliche Genehmigung kopieren, weiterverkaufen oder weiterverbreiten."
  },
  "Interfere with platform operation, security, or availability.": {
    "el": "Παρεμβολή στη λειτουργία, την ασφάλεια ή τη διαθεσιμότητα της πλατφόρμας.",
    "de": "Den Betrieb, die Sicherheit oder die Verfügbarkeit der Plattform beeinträchtigen."
  },
  "To the maximum extent permitted by law, BI Solutions Group is not liable for indirect, incidental, special, consequential, or punitive damages arising from use of, or inability to use, our services. Services are provided \"as is\" without warranties of any kind, whether express or implied.": {
    "el": "Στον μέγιστο βαθμό που επιτρέπει ο νόμος, η BI Solutions Group δεν ευθύνεται για έμμεσες, παρεμπίπτουσες, ειδικές ή επακόλουθες ζημίες ούτε για αποζημιώσεις τιμωρητικού χαρακτήρα που προκύπτουν από τη χρήση ή την αδυναμία χρήσης των υπηρεσιών μας. Οι υπηρεσίες παρέχονται «ως έχουν», χωρίς εγγυήσεις οποιουδήποτε είδους, ρητές ή σιωπηρές.",
    "de": "Soweit gesetzlich zulässig, haftet BI Solutions Group nicht für indirekte Schäden, Nebenschäden, besondere Schäden, Folgeschäden oder Schadensersatz mit Strafcharakter, die aus der Nutzung oder der Unmöglichkeit der Nutzung unserer Dienste entstehen. Die Dienste werden im vorliegenden Zustand ohne ausdrückliche oder stillschweigende Gewährleistungen bereitgestellt."
  },
  "When using our services, you agree not to:": {
    "el": "Χρησιμοποιώντας τις υπηρεσίες μας, συμφωνείτε ότι δεν επιτρέπονται:",
    "de": "Bei der Nutzung unserer Dienste verpflichten Sie sich, Folgendes zu unterlassen:"
  },
};
