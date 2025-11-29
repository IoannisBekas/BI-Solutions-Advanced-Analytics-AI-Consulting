import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Mail, Linkedin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import founderPhoto from "@assets/founder-photo.jpg";

const focusStyles = `
  .focused-section {
    opacity: 1;
    transition: opacity 300ms ease-in-out;
  }
  .faded-section {
    opacity: 0.3;
    transition: opacity 300ms ease-in-out;
  }
`;

interface SectionRef {
  id: string;
  ref: React.RefObject<HTMLDivElement | null>;
  label: string;
}

export default function About() {
  const [activeSection, setActiveSection] = useState("introduction");
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const sections: SectionRef[] = [
    { id: "introduction", ref: useRef<HTMLDivElement>(null), label: "Introduction" },
    { id: "un", ref: useRef<HTMLDivElement>(null), label: "United Nations" },
    { id: "iaea", ref: useRef<HTMLDivElement>(null), label: "IAEA Experience" },
    { id: "cultural", ref: useRef<HTMLDivElement>(null), label: "Cultural Diplomacy" },
    { id: "education", ref: useRef<HTMLDivElement>(null), label: "Education" },
    { id: "contact", ref: useRef<HTMLDivElement>(null), label: "Get in Touch" },
  ];

  const sectionOrder = ["introduction", "un", "iaea", "cultural", "education", "contact"];
  const currentSectionIndex = sectionOrder.indexOf(activeSection);
  
  // Filter out education from navigation display
  const navSections = sections.filter(section => section.id !== "education");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-100px 0px -50% 0px",
      threshold: [0],
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      // Only update if not manually scrolling
      if (!isScrollingRef.current) {
        const intersectingEntry = entries.find((entry) => entry.isIntersecting);
        if (intersectingEntry) {
          setActiveSection(intersectingEntry.target.id);
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    sections.forEach((section) => {
      if (section.ref.current) {
        observer.observe(section.ref.current);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (section?.ref.current) {
      // Immediately mark as scrolling with ref (no state delay)
      isScrollingRef.current = true;
      setActiveSection(id);
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      const element = section.ref.current;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const navbarHeight = 80; // navbar is pt-20 (80px)
      const offsetPosition = elementPosition - navbarHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      // Re-enable observer detection after scroll completes
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <style>{focusStyles}</style>
      <Navbar />
      <main className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sticky Sidebar with Progress */}
            <aside className="lg:col-span-1">
              <div className="sticky top-1/2 transform -translate-y-1/2 pt-0">
                {/* Progress Circles */}
                <div className="flex flex-col items-center gap-12">
                  {navSections.map((section, idx) => {
                    const isActive = activeSection === section.id;
                    const isLast = idx === navSections.length - 1;
                    return (
                      <div key={section.id} className="flex flex-col items-center w-full">
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className="flex items-center gap-3 w-full cursor-pointer hover:opacity-70 transition-opacity"
                          type="button"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                isActive
                                  ? "border-black bg-black ring-2 ring-black ring-offset-2"
                                  : "border-gray-300 bg-white"
                              }`}
                            />
                            {!isLast && (
                              <div className="w-0.5 h-12 bg-gray-300" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium transition-colors duration-300 ${
                              isActive ? "text-black font-bold" : "text-gray-400"
                            }`}
                          >
                            {section.label}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-20">
              {/* Introduction */}
              <section
                ref={sections[0].ref}
                id="introduction"
                className={`space-y-8 ${activeSection === "introduction" ? "focused-section" : "faded-section"}`}
              >
                <h2 className="text-4xl md:text-5xl font-bold font-heading">
                  Ioannis Bekas
                </h2>

                {/* Profile & Education Header Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                  {/* Left: Profile Image */}
                  <div className="flex flex-col">
                    <div className="w-full max-w-sm h-96 md:h-full md:min-h-96 rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                      <img
                        src={founderPhoto}
                        alt="Ioannis Bekas"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Right: Education Section */}
                  <div
                    ref={sections[4].ref}
                    id="education"
                    className="space-y-6 pt-0"
                  >
                    <div>
                      <h3 className="text-2xl font-bold font-heading mb-2">
                        Education
                      </h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-base font-semibold text-black mb-1">
                          M.Sc. in Operational Research, Analytics & Decision Making
                        </h4>
                        <p className="text-sm text-gray-600">
                          Technical University of Crete & Hellenic Army Academy
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          GPA: 9.3/10 · Thesis: "Artificial Intelligence Touchpoints with Multi-Criteria Decision Analysis"
                        </p>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-black mb-1">
                          B.Sc. in Mathematics & Minor in Economics
                        </h4>
                        <p className="text-sm text-gray-600">
                          University of Athens
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Exchange – Financial Mathematics, Stockholm University
                        </p>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-black mb-2">
                          Certifications
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">Full list on LinkedIn</p>
                        <ul className="space-y-1 text-xs text-gray-700">
                          <li className="flex gap-3">
                            <span className="text-black font-bold flex-shrink-0">•</span>
                            <span>Data Science Professional Certificate – HarvardX</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="text-black font-bold flex-shrink-0">•</span>
                            <span>Google Data Analytics Professional Certificate</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="text-black font-bold flex-shrink-0">•</span>
                            <span>Financial Engineering and Risk Management – Columbia</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="text-black font-bold flex-shrink-0">•</span>
                            <span>Financial Markets – Yale</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="text-black font-bold flex-shrink-0">•</span>
                            <span>Python and Statistics for Financial Analysis – HKUST</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  A data science and analytics specialist with experience across the United Nations, international agencies, and global enterprises. Expertise includes strategic analytics, machine learning, decision intelligence, CRM optimization, and data product development.
                </p>
              </section>

              {/* United Nations Experience */}
              <section
                ref={sections[1].ref}
                id="un"
                className={`space-y-6 ${activeSection === "un" ? "focused-section" : "faded-section"}`}
              >
                <div>
                  <h3 className="text-2xl font-bold font-heading mb-2">
                    United Nations
                  </h3>
                  <p className="text-gray-600">
                    Senior Data Scientist – Data Management & Visualization
                  </p>
                  <p className="text-sm text-gray-400">
                    Nov 2023 – July 2025 | Geneva, Switzerland
                  </p>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Performed deep qualitative and quantitative assessments on global investment and service-capability ecosystems, identifying unmet needs, high-value opportunities, and improvement pathways used in strategic program design.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Consolidated insights from over 12 global data and research sources to build executive dashboards that shaped product and service-experience planning across regions.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Developed an investment-optimization and prioritization framework—structured like a financial ROI model—to support leadership in selecting high-impact service and product initiatives.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Crafted narrative-driven presentations distilling complex technical findings into clear business implications, influencing senior stakeholders during budget allocation and long-term planning cycles.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Designed KPI frameworks and refined SOPs that strengthened operational consistency, data quality, and analytical reliability across departments.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Executed full-cycle research programs, including sentiment analysis, survey analytics, and behavioral segmentation, translating customer expectations into actionable service enhancements.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Built real-time customer-experience monitoring dashboards in Power BI to track satisfaction, identify friction points, and support continuous product and service improvement.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Produced executive-level reports synthesizing customer insights, competitive intelligence, and market trends into strategic recommendations aligned with long-term product roadmaps.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Streamlined cross-functional processes by redesigning SOPs and introducing continuous-improvement practices, reducing operational complexity and improving service delivery.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Led cross-department collaboration to align insight-driven recommendations with organizational goals, ensuring unified decision-making across stakeholders.
                    </span>
                  </li>
                </ul>
              </section>

              {/* IAEA Experience */}
              <section
                ref={sections[2].ref}
                id="iaea"
                className={`space-y-6 ${activeSection === "iaea" ? "focused-section" : "faded-section"}`}
              >
                <div>
                  <h3 className="text-2xl font-bold font-heading mb-2">
                    IAEA (International Atomic Energy Agency)
                  </h3>
                  <p className="text-gray-600">
                    Information Systems Analyst (Internship)
                  </p>
                  <p className="text-sm text-gray-400">
                    Jul 2020 – Jun 2021 | Vienna, Austria
                  </p>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Created predictive HR dashboards in Power BI/SAP BO, modeling workforce trends from HRIS and ERP data.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Conducted statistical modeling and anomaly detection for HR policy evaluation, including impact analysis of interventions.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Built microservices pipelines for MTHR analytics with automated experiment tracking.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Trained IAEA staff on applied statistics and data visualization best practices.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Contributed to data governance frameworks, ensuring robust and reproducible data transformations.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Cultural Diplomacy */}
              <section
                ref={sections[3].ref}
                id="cultural"
                className={`space-y-6 ${activeSection === "cultural" ? "focused-section" : "faded-section"}`}
              >
                <div>
                  <h3 className="text-2xl font-bold font-heading mb-2">
                    Hellenic Institute of Cultural Diplomacy
                  </h3>
                  <p className="text-gray-600">
                    Statistician and Data Analyst
                  </p>
                  <p className="text-sm text-gray-400">
                    Jul 2019 – Jun 2020 | Athens, Greece
                  </p>
                </div>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Designed data collection systems and applied econometric modeling for financial and survey datasets.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Delivered predictive analysis for business forecasts and international project evaluation.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-black font-bold flex-shrink-0">•</span>
                    <span>
                      Created statistical reports and visualizations supporting diplomacy strategy and stakeholder engagement.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Get in Touch */}
              <section
                ref={sections[5].ref}
                id="contact"
                className={`space-y-8 ${activeSection === "contact" ? "focused-section" : "faded-section"}`}
              >
                <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8">
                  Get in Touch
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a
                        href="mailto:ioannis@bisolutions.io"
                        className="text-lg font-semibold hover:text-gray-600 transition-colors"
                      >
                        ioannis@bisolutions.io
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                      <Linkedin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">LinkedIn</p>
                      <a
                        href="https://linkedin.com/in/ioannis-bekas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold hover:text-gray-600 transition-colors"
                      >
                        linkedin.com/in/ioannis-bekas
                      </a>
                    </div>
                  </div>
                </div>

                <Button className="rounded-full h-12 px-8 bg-black hover:bg-gray-800 transition-all">
                  Book a Consultation
                </Button>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
