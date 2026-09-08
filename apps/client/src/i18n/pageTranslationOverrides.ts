type PageTranslationOverrides = Record<string, { el: string; de: string }>;

// Curated corrections for phrases where literal machine translation changes the
// business meaning. These are applied after the generated translation catalogue.
export const pageTranslationOverrides: PageTranslationOverrides = {
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
