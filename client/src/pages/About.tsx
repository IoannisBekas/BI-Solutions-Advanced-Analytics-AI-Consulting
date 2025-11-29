import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Mail, Linkedin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import founderPhoto from "@assets/founder-photo.jpg";

interface SectionRef {
  id: string;
  ref: React.RefObject<HTMLDivElement | null>;
  label: string;
}

export default function About() {
  const [activeSection, setActiveSection] = useState("introduction");
  const sections: SectionRef[] = [
    { id: "introduction", ref: useRef<HTMLDivElement>(null), label: "Introduction" },
    { id: "un", ref: useRef<HTMLDivElement>(null), label: "United Nations" },
    { id: "iaea", ref: useRef<HTMLDivElement>(null), label: "IAEA Experience" },
    { id: "cultural", ref: useRef<HTMLDivElement>(null), label: "Cultural Diplomacy" },
    { id: "contact", ref: useRef<HTMLDivElement>(null), label: "Photo & Contact" },
  ];

  const sectionOrder = ["introduction", "un", "iaea", "cultural", "contact"];
  const currentSectionIndex = sectionOrder.indexOf(activeSection);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
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
  }, []);

  const scrollToSection = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (section?.ref.current) {
      section.ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <main className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sticky Sidebar with Progress */}
            <aside className="lg:col-span-1">
              <div className="sticky top-32 space-y-8">
                {/* Progress Circles */}
                <div className="flex flex-col items-center gap-2 mb-8">
                  {sections.map((section, idx) => {
                    const isCompleted = idx <= currentSectionIndex;
                    const isActive = activeSection === section.id;
                    return (
                      <motion.div
                        key={section.id}
                        className="flex items-center gap-3 w-full"
                      >
                        <div className="flex flex-col items-center">
                          <motion.div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              isCompleted
                                ? "border-black bg-black"
                                : "border-gray-300 bg-white"
                            } ${isActive ? "scale-125 ring-2 ring-black ring-offset-2" : ""}`}
                            animate={{
                              scale: isActive ? 1.25 : 1,
                            }}
                          >
                            {isCompleted && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-1.5 h-1.5 bg-white rounded-full"
                              />
                            )}
                          </motion.div>
                          {idx < sections.length - 1 && (
                            <motion.div
                              className={`w-0.5 h-6 transition-colors duration-300 ${
                                isCompleted ? "bg-black" : "bg-gray-300"
                              }`}
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: isCompleted ? 1 : 0 }}
                              style={{ originY: 0 }}
                            />
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium transition-colors duration-300 ${
                            isActive ? "text-black font-bold" : isCompleted ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {section.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="space-y-2 border-t pt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
                    Navigate
                  </h3>
                  {sections.map((section) => (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                        activeSection === section.id
                          ? "bg-black text-white font-semibold"
                          : "text-gray-600 hover:text-black hover:bg-gray-50"
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      {section.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-20">
              {/* Introduction */}
              <motion.section
                ref={sections[0].ref}
                id="introduction"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false }}
                className="space-y-8"
              >
                <h2 className="text-4xl md:text-5xl font-bold font-heading">
                  Ioannis Bekas
                </h2>
                <div className="aspect-square md:aspect-auto md:h-96 rounded-2xl overflow-hidden bg-gray-100 mb-8 shadow-lg">
                  <img
                    src={founderPhoto}
                    alt="Ioannis Bekas"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  A data science and analytics specialist with experience across the United Nations, international agencies, and global enterprises. Expertise includes strategic analytics, machine learning, decision intelligence, CRM optimization, and data product development.
                </p>
              </motion.section>

              {/* United Nations Experience */}
              <motion.section
                ref={sections[1].ref}
                id="un"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false }}
                className="space-y-6"
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
              </motion.section>

              {/* IAEA Experience */}
              <motion.section
                ref={sections[2].ref}
                id="iaea"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false }}
                className="space-y-6"
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
              </motion.section>

              {/* Cultural Diplomacy */}
              <motion.section
                ref={sections[3].ref}
                id="cultural"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false }}
                className="space-y-6"
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
              </motion.section>

              {/* Photo & Contact */}
              <motion.section
                ref={sections[4].ref}
                id="contact"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8">
                    Get in Touch
                  </h2>
                  <div className="aspect-square md:aspect-auto md:h-96 rounded-2xl overflow-hidden bg-gray-100 mb-12 shadow-lg">
                    <img
                      src={founderPhoto}
                      alt="Ioannis Bekas"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

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
              </motion.section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
