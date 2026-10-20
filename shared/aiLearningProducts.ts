export const learningRoles = [
  "marketing",
  "b2b-sales-revops",
  "customer-success",
  "ecommerce-cro",
  "corporate-finance-fpa",
  "management-consulting",
  "legal-ops-compliance",
  "data-analytics-bi",
  "analytics-data-engineering",
  "product-management",
  "qa-software-testing",
  "business-operations",
  "supply-chain-logistics",
  "project-management-pmo",
  "hr-people-recruiting",
  "academic-rd-grant-writing",
] as const;

export const learningExperiences = ["novice", "tried-ai", "regular"] as const;
export const learningLanguages = ["en", "el"] as const;

export type LearningRole = (typeof learningRoles)[number];
export type LearningExperience = (typeof learningExperiences)[number];
export type LearningLanguage = (typeof learningLanguages)[number];

type ThreeLearningSteps = readonly [string, string, string];

export interface AiLearningProduct {
  id: string;
  role: LearningRole;
  name: string;
  nameEl: string;
  description: string;
  descriptionEl: string;
  outcomes: ThreeLearningSteps;
  outcomesEl: ThreeLearningSteps;
  promptCount: 100;
  filenames: Record<LearningLanguage, string>;
  sample: {
    title: string;
    outcome: string;
    titleEl: string;
    outcomeEl: string;
  };
}

const productDefinitions: readonly Omit<AiLearningProduct, "filenames" | "promptCount">[] = [
  {
    id: "01_marketing",
    role: "marketing",
    name: "Marketing",
    nameEl: "Μάρκετινγκ",
    description: "Learn to use AI for customer research, content planning and marketing decisions through practical prompts.",
    descriptionEl: "Μάθε να χρησιμοποιείς την AI για έρευνα πελατών, σχεδιασμό περιεχομένου και αποφάσεις μάρκετινγκ με πρακτικά prompts.",
    outcomes: ["Turn customer notes into a focused audience choice.", "Build content plans from buyer questions.", "Review channel results and choose useful marketing tests."],
    outcomesEl: ["Μετέτρεψε σημειώσεις πελατών σε στοχευμένη επιλογή κοινού.", "Σχεδίασε περιεχόμενο με βάση ερωτήσεις αγοραστών.", "Αξιολόγησε κανάλια και διάλεξε χρήσιμες δοκιμές μάρκετινγκ."],
    sample: {
      title: "Choose your best customer group",
      outcome: "One customer group to prioritize, plus a practical way to test the choice.",
      titleEl: "Διάλεξε σε ποιους πελάτες θα εστιάσεις",
      outcomeEl: "Μία ομάδα πελατών για να βάλεις πρώτη και έναν πρακτικό τρόπο να δοκιμάσεις την επιλογή σου.",
    },
  },
  {
    id: "02_b2b_sales_revops",
    role: "b2b-sales-revops",
    name: "Sales & Revenue Operations",
    nameEl: "Πωλήσεις και λειτουργίες εσόδων",
    description: "Practice AI with sales qualification, discovery questions and pipeline planning tasks.",
    descriptionEl: "Εξασκήσου στην AI με αξιολόγηση ευκαιριών πώλησης, ερωτήσεις διερεύνησης και σχεδιασμό πωλήσεων.",
    outcomes: ["Prioritize sales opportunities using the evidence you provide.", "Prepare questions that uncover customer needs.", "Plan a repeatable forecasting and deal review routine."],
    outcomesEl: ["Ιεράρχησε ευκαιρίες πώλησης με βάση τα στοιχεία σου.", "Προετοίμασε ερωτήσεις που αναδεικνύουν ανάγκες πελατών.", "Σχεδίασε επαναλήψιμη διαδικασία πρόβλεψης και ελέγχου συμφωνιών."],
    sample: {
      title: "Decide which deals deserve more sales effort",
      outcome: "A qualification map with clear priorities, resource limits and the next decision.",
      titleEl: "Διάλεξε ποιες συμφωνίες αξίζουν περισσότερη προσπάθεια πώλησης",
      outcomeEl: "Χάρτη καταλληλότητας με σαφείς προτεραιότητες, όρια πόρων και την επόμενη απόφαση.",
    },
  },
  {
    id: "03_customer_success",
    role: "customer-success",
    name: "Customer Success",
    nameEl: "Επιτυχία πελατών",
    description: "Learn AI prompting through customer onboarding, adoption, feedback and account planning exercises.",
    descriptionEl: "Μάθε να διατυπώνεις prompts μέσα από ασκήσεις ένταξης πελατών, υιοθέτησης, ανατροφοδότησης και διαχείρισης λογαριασμών.",
    outcomes: ["Plan a customer's first useful result.", "Organize feedback and identify adoption gaps.", "Prepare renewal and executive review plans around customer outcomes."],
    outcomesEl: ["Σχεδίασε το πρώτο χρήσιμο αποτέλεσμα ενός πελάτη.", "Οργάνωσε την ανατροφοδότηση και εντόπισε κενά υιοθέτησης.", "Προετοίμασε ανανεώσεις και συναντήσεις με βάση τα αποτελέσματα του πελάτη."],
    sample: {
      title: "Plan the customer’s first useful result",
      outcome: "An onboarding architecture with clear priorities, resource limits and the next decision.",
      titleEl: "Σχεδίασε το πρώτο χρήσιμο αποτέλεσμα του πελάτη",
      outcomeEl: "Αρχιτεκτονική ένταξης με σαφείς προτεραιότητες, όρια πόρων και την επόμενη απόφαση.",
    },
  },
  {
    id: "04_ecommerce_cro",
    role: "ecommerce-cro",
    name: "Ecommerce & Conversion",
    nameEl: "Ηλεκτρονικό εμπόριο και μετατροπές",
    description: "Practice using AI to understand buyer objections and plan improvements to an online shop.",
    descriptionEl: "Εξασκήσου στην AI για να κατανοείς ενστάσεις αγοραστών και να σχεδιάζεις βελτιώσεις σε ηλεκτρονικό κατάστημα.",
    outcomes: ["Turn reviews into questions your product pages should answer.", "Prioritize checkout and product-page improvements.", "Plan conversion tests and promotions with clear limits."],
    outcomesEl: ["Μετέτρεψε κριτικές σε ερωτήσεις για τις σελίδες προϊόντων.", "Ιεράρχησε βελτιώσεις στην ολοκλήρωση αγοράς και στις σελίδες προϊόντων.", "Σχεδίασε δοκιμές μετατροπών και προσφορές με σαφή όρια."],
    sample: {
      title: "Choose which buyer objections to fix first",
      outcome: "An objection matrix with clear priorities, resource limits and the next decision.",
      titleEl: "Διάλεξε ποιες ενστάσεις αγοραστών θα λύσεις πρώτα",
      outcomeEl: "Πίνακα ενστάσεων με σαφείς προτεραιότητες, όρια πόρων και την επόμενη απόφαση.",
    },
  },
  {
    id: "05_corporate_finance_fpa",
    role: "corporate-finance-fpa",
    name: "Finance & Planning",
    nameEl: "Οικονομικά και σχεδιασμός",
    description: "Learn to structure AI prompts for financial planning, variance reviews and decision-focused reporting.",
    descriptionEl: "Μάθε να οργανώνεις prompts για οικονομικό σχεδιασμό, έλεγχο αποκλίσεων και αναφορές που υποστηρίζουν αποφάσεις.",
    outcomes: ["Outline linked profit, balance-sheet and cash schedules.", "Investigate variance and business-driver assumptions.", "Prepare planning-model checks and decision-focused board packs."],
    outcomesEl: ["Σχεδίασε συνδεδεμένους πίνακες κερδών, ισολογισμού και μετρητών.", "Διερεύνησε αποκλίσεις και παραδοχές επιχειρησιακών παραγόντων.", "Προετοίμασε ελέγχους μοντέλων και αναφορές διοίκησης με επίκεντρο τις αποφάσεις."],
    sample: {
      title: "Plan a model linking profit, balance sheet and cash",
      outcome: "Linked schedules with clear priorities, resource limits and the next decision.",
      titleEl: "Σχεδίασε μοντέλο που συνδέει κέρδη, ισολογισμό και μετρητά",
      outcomeEl: "Συνδεδεμένους πίνακες με σαφείς προτεραιότητες, όρια πόρων και την επόμενη απόφαση.",
    },
  },
  {
    id: "06_management_consulting",
    role: "management-consulting",
    name: "Consulting & Strategy",
    nameEl: "Συμβουλευτική και στρατηγική",
    description: "Build AI prompting habits through strategy, market sizing and business diagnosis exercises.",
    descriptionEl: "Ανάπτυξε δεξιότητες διατύπωσης prompts με ασκήσεις στρατηγικής, εκτίμησης αγοράς και επιχειρηματικής διάγνωσης.",
    outcomes: ["Break a business question into a practical analysis plan.", "Challenge market-size estimates and strategic assumptions.", "Explore operating-model and change-adoption choices."],
    outcomesEl: ["Μετέτρεψε ένα επιχειρηματικό ερώτημα σε πρακτικό σχέδιο ανάλυσης.", "Έλεγξε εκτιμήσεις αγοράς και στρατηγικές παραδοχές.", "Διερεύνησε επιλογές λειτουργικού μοντέλου και υιοθέτησης αλλαγών."],
    sample: {
      title: "Plan your profit diagnosis",
      outcome: "A practical plan for your profit diagnosis.",
      titleEl: "Σχεδίασε τη διάγνωση κερδοφορίας",
      outcomeEl: "Πρακτικό σχέδιο για τη διάγνωση κερδοφορίας.",
    },
  },
  {
    id: "07_legal_ops_compliance",
    role: "legal-ops-compliance",
    name: "Legal & Compliance",
    nameEl: "Νομικές εργασίες και συμμόρφωση",
    description: "Practice structured AI prompts for contract reviews, supplier assessments and compliance planning.",
    descriptionEl: "Εξασκήσου σε δομημένα prompts για έλεγχο συμβάσεων, αξιολόγηση προμηθευτών και σχεδιασμό συμμόρφωσης.",
    outcomes: ["Organize a services or confidentiality agreement review.", "Identify gaps in supplier and compliance assessments.", "Prepare contract-obligation and incident-response plans."],
    outcomesEl: ["Οργάνωσε έλεγχο σύμβασης υπηρεσιών ή εμπιστευτικότητας.", "Εντόπισε κενά σε αξιολογήσεις προμηθευτών και συμμόρφωσης.", "Προετοίμασε σχέδια συμβατικών υποχρεώσεων και απόκρισης σε περιστατικά."],
    sample: {
      title: "Plan your services agreement review",
      outcome: "A practical plan for your services agreement review.",
      titleEl: "Σχεδίασε τον έλεγχο σύμβασης υπηρεσιών",
      outcomeEl: "Πρακτικό σχέδιο για τον έλεγχο σύμβασης υπηρεσιών.",
    },
  },
  {
    id: "08_data_analytics_bi",
    role: "data-analytics-bi",
    name: "Data Analytics & BI",
    nameEl: "Ανάλυση δεδομένων και BI",
    description: "Learn to guide AI through KPI definitions, SQL analysis, Power BI measures and dashboard planning.",
    descriptionEl: "Μάθε να καθοδηγείς την AI σε ορισμούς δεικτών, ανάλυση SQL, μέτρα Power BI και σχεδιασμό πινάκων ελέγχου.",
    outcomes: ["Define KPIs and the questions a dashboard should answer.", "Plan and check SQL analyses and Power BI measures.", "Structure funnel, cohort and anomaly investigations."],
    outcomesEl: ["Όρισε δείκτες και ερωτήματα που πρέπει να απαντά ένας πίνακας ελέγχου.", "Σχεδίασε και έλεγξε αναλύσεις SQL και μέτρα Power BI.", "Οργάνωσε αναλύσεις διοχέτευσης, ομάδων πελατών και ανωμαλιών."],
    sample: {
      title: "Plan your KPI definitions",
      outcome: "A practical plan for your KPI definitions.",
      titleEl: "Σχεδίασε τους ορισμούς δεικτών απόδοσης",
      outcomeEl: "Πρακτικό σχέδιο για τους ορισμούς δεικτών απόδοσης.",
    },
  },
  {
    id: "09_analytics_data_engineering",
    role: "analytics-data-engineering",
    name: "Data Engineering",
    nameEl: "Μηχανική δεδομένων",
    description: "Practice AI prompting on data-model planning, pipeline reliability and data-quality checks.",
    descriptionEl: "Εξασκήσου σε prompts για σχεδιασμό μοντέλων δεδομένων, αξιοπιστία αγωγών και ελέγχους ποιότητας δεδομένων.",
    outcomes: ["Plan dbt models and incremental data loads.", "Design data-quality checks and data contracts.", "Explore pipeline scheduling, incidents and freshness tradeoffs."],
    outcomesEl: ["Σχεδίασε μοντέλα dbt και σταδιακές φορτώσεις δεδομένων.", "Οργάνωσε ελέγχους ποιότητας και συμβόλαια δεδομένων.", "Διερεύνησε προγραμματισμό αγωγών, περιστατικά και συμβιβασμούς ενημέρωσης δεδομένων."],
    sample: {
      title: "Plan your dbt models",
      outcome: "A practical plan for your dbt models.",
      titleEl: "Σχεδίασε τα μοντέλα dbt",
      outcomeEl: "Πρακτικό σχέδιο για τα μοντέλα dbt.",
    },
  },
  {
    id: "10_product_management",
    role: "product-management",
    name: "Product Management",
    nameEl: "Διοίκηση προϊόντος",
    description: "Learn to work with AI on product opportunities, customer discovery and clear requirements.",
    descriptionEl: "Μάθε να συνεργάζεσαι με την AI για ευκαιρίες προϊόντος, διερεύνηση πελατών και σαφείς απαιτήσεις.",
    outcomes: ["Frame a product opportunity worth testing.", "Turn customer needs into requirements and acceptance criteria.", "Plan discovery experiments, roadmaps and launches."],
    outcomesEl: ["Όρισε μια ευκαιρία προϊόντος που αξίζει να δοκιμαστεί.", "Μετέτρεψε ανάγκες πελατών σε απαιτήσεις και κριτήρια αποδοχής.", "Σχεδίασε πειράματα διερεύνησης, οδικούς χάρτες και κυκλοφορίες προϊόντων."],
    sample: {
      title: "Define the product opportunity worth testing",
      outcome: "A practical plan for your product opportunity.",
      titleEl: "Όρισε την προϊοντική ευκαιρία που αξίζει να δοκιμάσεις",
      outcomeEl: "Πρακτικό σχέδιο για την προϊοντική ευκαιρία.",
    },
  },
  {
    id: "11_qa_software_testing",
    role: "qa-software-testing",
    name: "Software Testing",
    nameEl: "Έλεγχοι Λογισμικού",
    description: "Practice AI with risk-based test planning, coverage decisions and unreliable-test investigations.",
    descriptionEl: "Εξασκήσου στην AI με σχεδιασμό ελέγχων βάσει κινδύνου, αποφάσεις κάλυψης και διερεύνηση αναξιόπιστων δοκιμών.",
    outcomes: ["Prioritize boundary, browser and API contract tests.", "Allocate regression effort around changed risks.", "Plan accessibility, load and migration verification."],
    outcomesEl: ["Ιεράρχησε οριακούς ελέγχους, ελέγχους φυλλομετρητών και συμβολαίων API.", "Κατάνειμε τον έλεγχο παλινδρόμησης βάσει αλλαγών κινδύνου.", "Σχεδίασε επαλήθευση προσβασιμότητας, φορτίου και μεταφοράς δεδομένων."],
    sample: {
      title: "Choose the highest-risk boundary tests",
      outcome: "A practical recommendation for boundary tests, with priorities and a first action.",
      titleEl: "Διάλεξε ποια όρια θα ελέγξεις πρώτα",
      outcomeEl: "Εφαρμόσιμη πρόταση για τους οριακούς ελέγχους, με προτεραιότητες και πρώτη ενέργεια.",
    },
  },
  {
    id: "12_business_operations",
    role: "business-operations",
    name: "Business Operations",
    nameEl: "Λειτουργία Επιχείρησης",
    description: "Learn AI by working through business goals, capacity decisions and process-improvement prompts.",
    descriptionEl: "Μάθε AI μέσα από prompts για επιχειρηματικούς στόχους, αποφάσεις δυναμικότητας και βελτίωση διαδικασιών.",
    outcomes: ["Connect team goals to business outcomes.", "Compare process improvements against capacity and costs.", "Design clearer decision rights and operating routines."],
    outcomesEl: ["Σύνδεσε ομαδικούς στόχους με επιχειρηματικά αποτελέσματα.", "Σύγκρινε βελτιώσεις διαδικασιών με βάση δυναμικότητα και κόστος.", "Σχεδίασε σαφέστερες αρμοδιότητες αποφάσεων και λειτουργικές διαδικασίες."],
    sample: {
      title: "Design an outcome-linked OKR cascade",
      outcome: "A practical recommendation for outcome-based goals, with priorities and a first action.",
      titleEl: "Σύνδεσε τους ομαδικούς στόχους με εταιρικά αποτελέσματα",
      outcomeEl: "Εφαρμόσιμη πρόταση για τους στόχους αποτελέσματος, με προτεραιότητες και πρώτη ενέργεια.",
    },
  },
  {
    id: "13_supply_chain_logistics",
    role: "supply-chain-logistics",
    name: "Supply Chain & Logistics",
    nameEl: "Εφοδιαστική Αλυσίδα",
    description: "Practice AI on demand planning, inventory policies, supplier choices and logistics decisions.",
    descriptionEl: "Εξασκήσου στην AI για σχεδιασμό ζήτησης, πολιτικές αποθεμάτων, επιλογές προμηθευτών και αποφάσεις μεταφορών.",
    outcomes: ["Structure demand and inventory planning by product group.", "Compare suppliers and resilience options.", "Plan warehouse, freight and traceability priorities."],
    outcomesEl: ["Οργάνωσε σχεδιασμό ζήτησης και αποθεμάτων ανά ομάδα προϊόντων.", "Σύγκρινε προμηθευτές και επιλογές ανθεκτικότητας.", "Σχεδίασε προτεραιότητες αποθήκης, μεταφορών και ιχνηλασιμότητας."],
    sample: {
      title: "Design a segmented demand-planning policy",
      outcome: "A practical recommendation for demand planning, with priorities and a first action.",
      titleEl: "Σχεδίασε πρόβλεψη ζήτησης ανά ομάδα προϊόντων",
      outcomeEl: "Εφαρμόσιμη πρόταση για τον σχεδιασμό ζήτησης, με προτεραιότητες και πρώτη ενέργεια.",
    },
  },
  {
    id: "14_project_management_pmo",
    role: "project-management-pmo",
    name: "Project Management",
    nameEl: "Διαχείριση Έργων",
    description: "Learn to guide AI through project scoping, delivery planning and stakeholder decisions.",
    descriptionEl: "Μάθε να καθοδηγείς την AI στον καθορισμό έργων, στον σχεδιασμό παράδοσης και σε αποφάσεις ενδιαφερομένων.",
    outcomes: ["Define measurable project outcomes and deliverables.", "Identify dependencies, risks and scope changes.", "Plan resource allocation and operational readiness checks."],
    outcomesEl: ["Όρισε μετρήσιμα αποτελέσματα έργων και παραδοτέα.", "Εντόπισε εξαρτήσεις, κινδύνους και αλλαγές εύρους.", "Σχεδίασε κατανομή πόρων και ελέγχους λειτουργικής ετοιμότητας."],
    sample: {
      title: "Design an outcome-led program charter",
      outcome: "A practical recommendation for project success and scope, with priorities and a first action.",
      titleEl: "Σχεδίασε έργο γύρω από μετρήσιμο αποτέλεσμα",
      outcomeEl: "Εφαρμόσιμη πρόταση για την επιτυχία και το εύρος έργου, με προτεραιότητες και πρώτη ενέργεια.",
    },
  },
  {
    id: "15_hr_people_recruiting",
    role: "hr-people-recruiting",
    name: "HR & Recruiting",
    nameEl: "Ανθρώπινο Δυναμικό",
    description: "Practice AI prompting for workforce planning, structured interviews and employee development.",
    descriptionEl: "Εξασκήσου σε prompts για σχεδιασμό στελέχωσης, δομημένες συνεντεύξεις και ανάπτυξη εργαζομένων.",
    outcomes: ["Translate capability gaps into workforce and learning priorities.", "Plan structured interviews and role-specific onboarding.", "Define evidence-based expectations and employee feedback plans."],
    outcomesEl: ["Μετέτρεψε κενά δεξιοτήτων σε προτεραιότητες στελέχωσης και μάθησης.", "Σχεδίασε δομημένες συνεντεύξεις και ένταξη ανά ρόλο.", "Όρισε προσδοκίες βάσει στοιχείων και σχέδια ανατροφοδότησης εργαζομένων."],
    sample: {
      title: "Design a skill-led workforce strategy",
      outcome: "A practical recommendation for workforce capacity, with priorities and a first action.",
      titleEl: "Σχεδίασε στελέχωση βάσει δεξιοτήτων",
      outcomeEl: "Εφαρμόσιμη πρόταση για τη δυναμικότητα προσωπικού, με προτεραιότητες και πρώτη ενέργεια.",
    },
  },
  {
    id: "16_academic_rd_grant_writing",
    role: "academic-rd-grant-writing",
    name: "Research & Grants",
    nameEl: "Έρευνα και Χρηματοδότηση",
    description: "Learn AI prompting through research questions, study planning and funding-proposal exercises.",
    descriptionEl: "Μάθε να διατυπώνεις prompts μέσα από ερευνητικά ερωτήματα, σχεδιασμό μελετών και προτάσεις χρηματοδότησης.",
    outcomes: ["Assess funding-call fit and extract submission requirements.", "Structure research aims, review questions and study plans.", "Challenge novelty claims and prepare for reviewer concerns."],
    outcomesEl: ["Αξιολόγησε την καταλληλότητα προσκλήσεων και εξήγαγε απαιτήσεις υποβολής.", "Οργάνωσε ερευνητικούς στόχους, ερωτήματα ανασκόπησης και σχέδια μελετών.", "Έλεγξε ισχυρισμούς πρωτοτυπίας και προετοίμασε απαντήσεις σε κριτές."],
    sample: {
      title: "Decide which funding calls to pursue",
      outcome: "A practical recommendation for funding-call fit, with priorities and a first action.",
      titleEl: "Διάλεξε σε ποιες προσκλήσεις αξίζει να υποβάλεις",
      outcomeEl: "Εφαρμόσιμη πρόταση για την καταλληλότητα πρόσκλησης χρηματοδότησης, με προτεραιότητες και πρώτη ενέργεια.",
    },
  },
];

export const aiLearningProducts: readonly AiLearningProduct[] = productDefinitions.map((product) => ({
  ...product,
  promptCount: 100,
  filenames: {
    en: `${product.id}_EN.pdf`,
    el: `${product.id}_EL.pdf`,
  },
}));

export const learningRoleOptions = aiLearningProducts.map((product) => ({
  value: product.role,
  label: product.name,
  labelEl: product.nameEl,
}));

export const learningExperienceOptions: readonly {
  value: LearningExperience;
  label: string;
  labelEl: string;
  description: string;
  descriptionEl: string;
}[] = [
  {
    value: "novice",
    label: "I'm new to AI",
    labelEl: "Ξεκινώ τώρα με την AI",
    description: "Start with one guided prompt and learn to check the answer.",
    descriptionEl: "Ξεκίνα με ένα καθοδηγούμενο prompt και μάθε να ελέγχεις την απάντηση.",
  },
  {
    value: "tried-ai",
    label: "I've tried a few prompts",
    labelEl: "Έχω δοκιμάσει μερικά prompts",
    description: "Practice adding context and improving an initial answer.",
    descriptionEl: "Εξασκήσου στην προσθήκη πλαισίου και στη βελτίωση μιας πρώτης απάντησης.",
  },
  {
    value: "regular",
    label: "I use AI regularly",
    labelEl: "Χρησιμοποιώ AI τακτικά",
    description: "Combine prompts into a workflow you can review and repeat.",
    descriptionEl: "Σύνδεσε prompts σε μια διαδικασία που μπορείς να ελέγχεις και να επαναλαμβάνεις.",
  },
];

export const learningLanguageOptions: readonly {
  value: LearningLanguage;
  label: string;
  labelEl: string;
}[] = [
  { value: "en", label: "English PDF", labelEl: "PDF στα αγγλικά" },
  { value: "el", label: "Greek PDF", labelEl: "PDF στα ελληνικά" },
];

const startingSteps: Record<LearningExperience, Record<LearningLanguage, ThreeLearningSteps>> = {
  novice: {
    en: [
      "Choose one familiar task and read its required inputs before opening your AI tool.",
      "Replace the placeholders with a small example, then run the prompt.",
      "Use the prompt's check and follow-up to review the answer before applying it.",
    ],
    el: [
      "Διάλεξε μία γνώριμη εργασία και διάβασε τα απαιτούμενα στοιχεία πριν ανοίξεις το εργαλείο AI.",
      "Αντικατάστησε τα πεδία με ένα μικρό παράδειγμα και εκτέλεσε το prompt.",
      "Χρησιμοποίησε τον έλεγχο και τη συνέχεια του prompt για να αξιολογήσεις την απάντηση πριν την εφαρμόσεις.",
    ],
  },
  "tried-ai": {
    en: [
      "Choose a task you already do and supply its goal, context and constraints.",
      "Run the prompt, review its check and use the follow-up to challenge the result.",
      "Refine one input and compare the two answers to see what improved.",
    ],
    el: [
      "Διάλεξε μία εργασία που ήδη κάνεις και δώσε στόχο, πλαίσιο και περιορισμούς.",
      "Εκτέλεσε το prompt, διάβασε τον έλεγχο και χρησιμοποίησε τη συνέχεια για να αμφισβητήσεις το αποτέλεσμα.",
      "Βελτίωσε ένα στοιχείο εισόδου και σύγκρινε τις δύο απαντήσεις για να δεις τι άλλαξε.",
    ],
  },
  regular: {
    en: [
      "Choose related prompts for a recurring workflow and define what a useful result should contain.",
      "Run them with consistent inputs, checking each output before passing it to the next step.",
      "Save the inputs, checks and useful follow-ups as a repeatable practice routine.",
    ],
    el: [
      "Διάλεξε σχετικά prompts για μια επαναλαμβανόμενη διαδικασία και όρισε τι πρέπει να περιλαμβάνει ένα χρήσιμο αποτέλεσμα.",
      "Εκτέλεσέ τα με συνεπή δεδομένα και έλεγξε κάθε απάντηση πριν τη μεταφέρεις στο επόμενο βήμα.",
      "Κράτησε τα στοιχεία εισόδου, τους ελέγχους και τις χρήσιμες συνέχειες ως επαναλήψιμη πρακτική.",
    ],
  },
};

export interface LearningRecommendation {
  product: AiLearningProduct;
  experience: LearningExperience;
  language: LearningLanguage;
  filename: string;
  startingSteps: ThreeLearningSteps;
}

export function recommendLearningProduct(
  role: LearningRole,
  experience: LearningExperience,
  language: LearningLanguage,
): LearningRecommendation {
  const product = aiLearningProducts.find((candidate) => candidate.role === role)!;

  return {
    product,
    experience,
    language,
    filename: product.filenames[language],
    startingSteps: startingSteps[experience][language],
  };
}
