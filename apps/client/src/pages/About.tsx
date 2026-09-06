import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import founderPhoto from "@/assets/founder-photo-2.jpg";
import { Button } from "@/components/ui/button";
import { Linkedin, MapPin, Download, Github } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";

interface Section {
  id: string;
  label: string;
  ref: React.RefObject<HTMLElement | null>;
}

const aboutCopy: Record<Locale, {
  seoTitle: string;
  seoDescription: string;
  schemaJobTitle: string;
  schemaDescription: string;
  schemaTopics: string[];
  sectionLabels: string[];
  connect: string;
  founderProfile: string;
  role: string;
  introduction: string;
  contactButton: string;
  experienceTitle: string;
  experience: string[];
  educationTitle: string;
  mastersTitle: string;
  mastersInstitution: string;
  gpa: string;
  thesis: string;
  bachelorsTitle: string;
  bachelorsInstitution: string;
  exchange: string;
  certificationsTitle: string;
  certifications: string[];
  connectTitle: string;
  connectDescription: string;
  companyLinkedIn: string;
}> = {
  en: {
    seoTitle: "About Ioannis Bekas and BI Solutions",
    seoDescription: "Learn about Ioannis Bekas, BI Solutions Group, and the background behind the company’s analytics, AI, and data strategy practice.",
    schemaJobTitle: "Data Scientist & AI Developer",
    schemaDescription: "Founder of BI Solutions Group, working across business intelligence, applied AI, data strategy, and analytics engineering.",
    schemaTopics: ["Business intelligence", "Power BI", "Semantic modeling", "Applied AI", "Data strategy", "Analytics engineering"],
    sectionLabels: ["Introduction", "Experience", "Education", "Certifications", "Get in Touch"],
    connect: "Connect",
    founderProfile: "Founder profile",
    role: "Data Scientist & AI Developer",
    introduction: "Data Scientist & AI Developer with 9+ years of experience delivering high-impact analytical, customer-insight, and product-innovation work. Responsible for managing projects and implementing solutions.",
    contactButton: "Get in Touch",
    experienceTitle: "Experience",
    experience: [
      "My expertise spans data engineering, statistical analysis, artificial intelligence, and interactive data visualization, with a focus on building advanced analytical tools and scalable data models for predictive analytics and automation.",
      "My background bridges major international organizations—including the International Atomic Energy Agency (IAEA), the International Organization for Migration (IOM), the United Nations Office for Disaster Risk Reduction (UNDRR), and the United Nations Women organization—with private-sector enterprises. Across these environments, I have structured large-scale datasets, established robust data governance frameworks, and deployed end-to-end business intelligence architectures.",
      "In parallel, I advise cross-functional teams and leadership across North America and Europe on high-impact data initiatives—helping organizations leverage state-of-the-art tooling, modern data stacks, and emerging AI frameworks—supporting global brands including Fujitsu, LG, Nespresso, Collins Aerospace, Coca-Cola, and PepsiCo, as well as high-growth SMEs.",
    ],
    educationTitle: "Education",
    mastersTitle: "M.Sc. in Operational Research, Analytics & Decision Making",
    mastersInstitution: "Technical University of Crete & Hellenic Army Academy",
    gpa: "GPA: 9.3/10",
    thesis: "Thesis: “Artificial Intelligence Touchpoints with Multi-Criteria Decision Analysis”",
    bachelorsTitle: "B.Sc. in Mathematics & Minor in Economics",
    bachelorsInstitution: "University of Athens",
    exchange: "Exchange – Financial Mathematics, Stockholm University",
    certificationsTitle: "Certifications",
    certifications: [
      "Data Science Professional Certificate – HarvardX",
      "Google Data Analytics Professional Certificate",
      "Financial Engineering and Risk Management – Columbia",
      "Financial Markets – Yale",
      "Python and Statistics for Financial Analysis – HKUST",
    ],
    connectTitle: "Let's Connect",
    connectDescription: "I'm always open to discussing data strategy, AI implementation, or potential collaborations.",
    companyLinkedIn: "Company LinkedIn",
  },
  el: {
    seoTitle: "Σχετικά με τον Ιωάννη Μπέκα και τη BI Solutions",
    seoDescription: "Γνωρίστε τον Ιωάννη Μπέκα, τη BI Solutions Group και την εμπειρία πίσω από τις υπηρεσίες analytics, AI και στρατηγικής δεδομένων.",
    schemaJobTitle: "Data Scientist & Προγραμματιστής AI",
    schemaDescription: "Ιδρυτής της BI Solutions Group με αντικείμενο το business intelligence, την εφαρμοσμένη AI, τη στρατηγική δεδομένων και το analytics engineering.",
    schemaTopics: ["Business intelligence", "Power BI", "Σημασιολογική μοντελοποίηση", "Εφαρμοσμένη AI", "Στρατηγική δεδομένων", "Analytics engineering"],
    sectionLabels: ["Εισαγωγή", "Εμπειρία", "Εκπαίδευση", "Πιστοποιήσεις", "Επικοινωνία"],
    connect: "Σύνδεση",
    founderProfile: "Προφίλ ιδρυτή",
    role: "Data Scientist & Προγραμματιστής AI",
    introduction: "Data Scientist και προγραμματιστής AI με περισσότερα από 9 χρόνια εμπειρίας σε έργα ανάλυσης, κατανόησης πελατών και καινοτομίας προϊόντων, με ευθύνη διαχείρισης έργων και υλοποίησης λύσεων.",
    contactButton: "Επικοινωνήστε",
    experienceTitle: "Εμπειρία",
    experience: [
      "Η εξειδίκευσή μου καλύπτει το data engineering, τη στατιστική ανάλυση, την τεχνητή νοημοσύνη και τη διαδραστική οπτικοποίηση δεδομένων, με έμφαση στη δημιουργία προηγμένων αναλυτικών εργαλείων και κλιμακούμενων μοντέλων για προβλέψεις και αυτοματοποίηση.",
      "Η επαγγελματική μου εμπειρία συνδέει μεγάλους διεθνείς οργανισμούς—όπως ο Διεθνής Οργανισμός Ατομικής Ενέργειας (IAEA), ο Διεθνής Οργανισμός Μετανάστευσης (IOM), το Γραφείο των Ηνωμένων Εθνών για τη Μείωση του Κινδύνου Καταστροφών (UNDRR) και ο οργανισμός UN Women—με επιχειρήσεις του ιδιωτικού τομέα. Σε αυτά τα περιβάλλοντα έχω οργανώσει δεδομένα μεγάλης κλίμακας, διαμορφώσει πλαίσια διακυβέρνησης δεδομένων και υλοποιήσει ολοκληρωμένες αρχιτεκτονικές business intelligence.",
      "Παράλληλα, συμβουλεύω διεπιστημονικές ομάδες και στελέχη στη Βόρεια Αμερική και την Ευρώπη σε πρωτοβουλίες δεδομένων υψηλού αντίκτυπου—αξιοποιώντας σύγχρονα εργαλεία, μοντέρνα data stacks και νέα πλαίσια AI—για διεθνή brands όπως Fujitsu, LG, Nespresso, Collins Aerospace, Coca-Cola και PepsiCo, καθώς και αναπτυσσόμενες μικρομεσαίες επιχειρήσεις.",
    ],
    educationTitle: "Εκπαίδευση",
    mastersTitle: "M.Sc. στην Επιχειρησιακή Έρευνα, Analytics & Λήψη Αποφάσεων",
    mastersInstitution: "Πολυτεχνείο Κρήτης & Στρατιωτική Σχολή Ευελπίδων",
    gpa: "Βαθμός: 9,3/10",
    thesis: "Διπλωματική: «Σημεία επαφής της Τεχνητής Νοημοσύνης με την Πολυκριτήρια Ανάλυση Αποφάσεων»",
    bachelorsTitle: "Πτυχίο Μαθηματικών με δευτερεύουσα κατεύθυνση στα Οικονομικά",
    bachelorsInstitution: "Εθνικό και Καποδιστριακό Πανεπιστήμιο Αθηνών",
    exchange: "Ανταλλαγή – Χρηματοοικονομικά Μαθηματικά, Πανεπιστήμιο Στοκχόλμης",
    certificationsTitle: "Πιστοποιήσεις",
    certifications: [
      "Επαγγελματικό Πιστοποιητικό Data Science – HarvardX",
      "Επαγγελματικό Πιστοποιητικό Google Data Analytics",
      "Financial Engineering and Risk Management – Columbia",
      "Financial Markets – Yale",
      "Python and Statistics for Financial Analysis – HKUST",
    ],
    connectTitle: "Ας επικοινωνήσουμε",
    connectDescription: "Είμαι διαθέσιμος για συζητήσεις σχετικά με στρατηγική δεδομένων, υλοποίηση AI και πιθανές συνεργασίες.",
    companyLinkedIn: "LinkedIn εταιρείας",
  },
  de: {
    seoTitle: "Über Ioannis Bekas und BI Solutions",
    seoDescription: "Erfahren Sie mehr über Ioannis Bekas, BI Solutions Group und die Erfahrung hinter der Analytics-, KI- und Datenstrategie-Beratung.",
    schemaJobTitle: "Data Scientist & KI-Entwickler",
    schemaDescription: "Gründer der BI Solutions Group mit Schwerpunkt auf Business Intelligence, angewandter KI, Datenstrategie und Analytics Engineering.",
    schemaTopics: ["Business Intelligence", "Power BI", "Semantische Modellierung", "Angewandte KI", "Datenstrategie", "Analytics Engineering"],
    sectionLabels: ["Einführung", "Erfahrung", "Ausbildung", "Zertifizierungen", "Kontakt"],
    connect: "Vernetzen",
    founderProfile: "Gründerprofil",
    role: "Data Scientist & KI-Entwickler",
    introduction: "Data Scientist und KI-Entwickler mit mehr als 9 Jahren Erfahrung in wirkungsvollen Analytics-, Customer-Insight- und Produktinnovationsprojekten sowie in Projektleitung und Lösungsumsetzung.",
    contactButton: "Kontakt aufnehmen",
    experienceTitle: "Erfahrung",
    experience: [
      "Meine Expertise umfasst Data Engineering, statistische Analyse, künstliche Intelligenz und interaktive Datenvisualisierung. Der Schwerpunkt liegt auf fortschrittlichen Analysewerkzeugen und skalierbaren Datenmodellen für Predictive Analytics und Automatisierung.",
      "Mein Hintergrund verbindet große internationale Organisationen—darunter die Internationale Atomenergie-Organisation (IAEA), die Internationale Organisation für Migration (IOM), das Büro der Vereinten Nationen für Katastrophenvorsorge (UNDRR) und UN Women—mit Unternehmen der Privatwirtschaft. In diesen Umfeldern habe ich umfangreiche Datensätze strukturiert, belastbare Data-Governance-Rahmen aufgebaut und durchgängige Business-Intelligence-Architekturen umgesetzt.",
      "Parallel berate ich funktionsübergreifende Teams und Führungskräfte in Nordamerika und Europa bei wirkungsstarken Dateninitiativen—mit modernen Werkzeugen, zeitgemäßen Data Stacks und neuen KI-Frameworks—für globale Marken wie Fujitsu, LG, Nespresso, Collins Aerospace, Coca-Cola und PepsiCo sowie wachstumsstarke KMU.",
    ],
    educationTitle: "Ausbildung",
    mastersTitle: "M.Sc. in Operations Research, Analytics & Entscheidungsfindung",
    mastersInstitution: "Technische Universität Kreta & Griechische Militärakademie",
    gpa: "Abschlussnote: 9,3/10",
    thesis: "Masterarbeit: „Berührungspunkte künstlicher Intelligenz mit multikriterieller Entscheidungsanalyse“",
    bachelorsTitle: "B.Sc. in Mathematik mit Nebenfach Volkswirtschaftslehre",
    bachelorsInstitution: "Universität Athen",
    exchange: "Austausch – Finanzmathematik, Universität Stockholm",
    certificationsTitle: "Zertifizierungen",
    certifications: [
      "Data Science Professional Certificate – HarvardX",
      "Google Data Analytics Professional Certificate",
      "Financial Engineering and Risk Management – Columbia",
      "Financial Markets – Yale",
      "Python and Statistics for Financial Analysis – HKUST",
    ],
    connectTitle: "Lassen Sie uns sprechen",
    connectDescription: "Ich freue mich auf Gespräche über Datenstrategie, KI-Implementierung und mögliche Kooperationen.",
    companyLinkedIn: "LinkedIn-Unternehmensseite",
  },
};

export default function About() {
  const canAnimate = useHydrated();
  const { locale } = useLocale();
  const copy = aboutCopy[locale];
  const [activeSection, setActiveSection] = useState("introduction");

  const sections: Section[] = [
    { id: "introduction", label: copy.sectionLabels[0], ref: useRef<HTMLElement>(null) },
    { id: "experience", label: copy.sectionLabels[1], ref: useRef<HTMLElement>(null) },
    { id: "education", label: copy.sectionLabels[2], ref: useRef<HTMLElement>(null) },
    { id: "certifications", label: copy.sectionLabels[3], ref: useRef<HTMLElement>(null) },
    { id: "contact", label: copy.sectionLabels[4], ref: useRef<HTMLElement>(null) },
  ];

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observerOptions: IntersectionObserverInit = {
        root: null,
        rootMargin: "-20% 0px -40% 0px",
        threshold: 0,
      };

      const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      };

      const observer = new IntersectionObserver(handleIntersection, observerOptions);

      sections.forEach((section) => {
        if (section.ref.current) {
          observer.observe(section.ref.current);
        }
      });

      return () => observer.disconnect();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section?.ref.current) {
      section.ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const staggerItem: any = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-black/10">
      <Seo
        title={copy.seoTitle}
        description={copy.seoDescription}
        path="/about"
        image={founderPhoto}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": "https://www.bisolutions.group/about#ioannis-bekas",
          name: "Ioannis Bekas",
          jobTitle: copy.schemaJobTitle,
          url: `https://www.bisolutions.group${locale === "en" ? "" : `/${locale}`}/about`,
          description: copy.schemaDescription,
          worksFor: {
            "@id": "https://www.bisolutions.group/#organization",
          },
          sameAs: [
            "https://www.linkedin.com/in/ioannisbekas/",
            "https://github.com/IoannisBekas",
          ],
          knowsAbout: copy.schemaTopics,
        }}
      />
      <Navbar />

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-black origin-left z-50"
        style={{ scaleX }}
      />

      <main className="flex justify-center pt-32 px-6 md:px-12 pb-20">
        <div className="site-container relative flex gap-16">

          {/* Left Sidebar - Sticky Navigation */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <nav className="flex flex-col space-y-4">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "group flex items-center justify-between text-left text-sm font-medium transition-all duration-300",
                      activeSection === section.id
                        ? "text-black translate-x-1"
                        : "text-gray-400 hover:text-gray-900"
                    )}
                  >
                    <span>{section.label}</span>
                    {activeSection === section.id && (
                      <motion.div
                        layoutId="active-indicator"
                        className="w-1.5 h-1.5 rounded-full bg-black"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-12 pt-12 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 block">{copy.connect}</span>
                <div className="flex gap-4">
                  <a href="https://linkedin.com/in/ioannisbekas" target="_blank" rel="noreferrer" aria-label="Ioannis Bekas on LinkedIn" className="text-gray-400 hover:text-black transition-colors">
                    <Linkedin aria-hidden="true" className="w-5 h-5" />
                  </a>
                  <a href="https://github.com/IoannisBekas" target="_blank" rel="noreferrer" aria-label="Ioannis Bekas on GitHub" className="text-gray-400 hover:text-black transition-colors">
                    <Github aria-hidden="true" className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">

            {/* Introduction Section */}
            <section ref={sections[0].ref} id="introduction" className="mb-32 scroll-mt-32">
              <motion.div
                initial={canAnimate ? "hidden" : false}
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="rounded-[2rem] border border-gray-200 bg-white/90 px-6 py-10 shadow-xl shadow-black/[0.05] sm:px-8 md:px-12 md:py-12"
              >
                <div className="grid md:grid-cols-[1fr_350px] gap-12 items-start">
                  <div>
                    <div className="inline-flex items-center rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-gray-600">
                      {copy.founderProfile}
                    </div>
                    <h1 className="mt-6 text-[2.75rem] sm:text-5xl md:text-6xl font-bold font-heading mb-8 tracking-tight leading-[1.05]">
                      Ioannis Bekas
                    </h1>
                    <h2 className="text-2xl font-medium text-gray-800 mb-6">{copy.role}</h2>
                    <p className="text-xl text-gray-600 leading-relaxed mb-8">
                      {copy.introduction}
                    </p>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => scrollToSection('contact')}
                        className="rounded-full px-8 h-12 bg-black hover:bg-gray-800 text-white"
                      >
                        {copy.contactButton}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full px-8 h-12 border-gray-200 hover:bg-gray-50"
                        onClick={() => window.open('https://linkedin.com/in/ioannisbekas', '_blank', 'noopener,noreferrer')}
                      >
                        LinkedIn
                      </Button>
                    </div>
                  </div>
                  <motion.div
                    initial={canAnimate ? { opacity: 0, scale: 0.95 } : false}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-gray-100 shadow-xl shadow-black/[0.08]"
                  >
                    <img
                      src={founderPhoto}
                      alt="Ioannis Bekas"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </section>

            {/* Experience Section */}
            <section ref={sections[1].ref} id="experience" className="mb-32 scroll-mt-32">
              <motion.h2
                initial={canAnimate ? { opacity: 0, x: -20 } : false}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold font-heading mb-12"
              >
                {copy.experienceTitle}
              </motion.h2>

              <motion.div
                initial={canAnimate ? "hidden" : false}
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="space-y-8"
              >
                {copy.experience.map((paragraph) => (
                  <p key={paragraph} className="text-lg text-gray-600 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </motion.div>
            </section>

            {/* Education Section */}
            <section ref={sections[2].ref} id="education" className="mb-32 scroll-mt-32">
              <motion.h2
                initial={canAnimate ? { opacity: 0, x: -20 } : false}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold font-heading mb-16"
              >
                {copy.educationTitle}
              </motion.h2>

              <div className="grid md:grid-cols-1 gap-12">
                <motion.div
                  initial={canAnimate ? "hidden" : false}
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="p-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-2xl font-bold mb-2">{copy.mastersTitle}</h3>
                  <p className="text-gray-600 mb-4 text-lg">{copy.mastersInstitution}</p>
                  <div className="text-base text-gray-500 space-y-2">
                    <p>• {copy.gpa}</p>
                    <p>• {copy.thesis}</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={canAnimate ? "hidden" : false}
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="p-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-2xl font-bold mb-2">{copy.bachelorsTitle}</h3>
                  <p className="text-gray-600 mb-4 text-lg">{copy.bachelorsInstitution}</p>
                  <div className="text-base text-gray-500 space-y-2">
                    <p>• {copy.exchange}</p>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Certifications Section */}
            <section ref={sections[3].ref} id="certifications" className="mb-32 scroll-mt-32">
              <motion.h2
                initial={canAnimate ? { opacity: 0, x: -20 } : false}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold font-heading mb-16"
              >
                {copy.certificationsTitle}
              </motion.h2>

              <div className="grid md:grid-cols-1 gap-8">
                <motion.div
                  initial={canAnimate ? "hidden" : false}
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="p-8 border border-gray-100 rounded-2xl"
                >
                  <ul className="space-y-4">
                    {copy.certifications.map((cert, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                        <span className="text-lg text-gray-700">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </section>



            {/* Contact Section */}
            <section ref={sections[4].ref} id="contact" className="mb-12 scroll-mt-32">
              <motion.div
                initial={canAnimate ? "hidden" : false}
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="border-t border-gray-200 pt-24"
              >
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8">{copy.connectTitle}</h2>
                    <p className="text-xl text-gray-600 mb-12">
                      {copy.connectDescription}
                    </p>
                    <div className="space-y-6">

                      <a href="https://linkedin.com/in/ioannisbekas" target="_blank" rel="noreferrer" className="group flex items-center gap-4 text-xl font-medium hover:text-gray-600 transition-colors p-2 rounded-lg">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-110">
                          <Linkedin aria-hidden="true" className="w-5 h-5" />
                        </span>
                        linkedin.com/in/ioannisbekas
                      </a>
                      <a href="https://github.com/IoannisBekas" target="_blank" rel="noreferrer" className="group flex items-center gap-4 text-xl font-medium hover:text-gray-600 transition-colors p-2 rounded-lg">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-110">
                          <Github aria-hidden="true" className="w-5 h-5" />
                        </span>
                        github.com/IoannisBekas
                      </a>
                      <a href="https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/" target="_blank" rel="noreferrer" className="group flex items-center gap-4 text-xl font-medium hover:text-gray-600 transition-colors p-2 rounded-lg">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-110">
                          <Linkedin aria-hidden="true" className="w-5 h-5" />
                        </span>
                        {copy.companyLinkedIn}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
