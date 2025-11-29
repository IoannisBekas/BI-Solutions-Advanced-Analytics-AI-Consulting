import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Linkedin, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import founderPhoto from "@assets/founder-photo.jpg";

interface Section {
  id: string;
  label: string;
}

export default function About() {
  const [activeSection, setActiveSection] = useState("introduction");

  // Map section id -> DOM element
  const sectionRefsMap = useRef<Map<string, HTMLElement>>(new Map());

  const sections: Section[] = [
    { id: "introduction", label: "Introduction" },
    { id: "un", label: "United Nations" },
    { id: "iaea", label: "IAEA Experience" },
    { id: "cultural", label: "Cultural Diplomacy" },
    { id: "contact", label: "Get in Touch" },
  ];

  const navSections = sections;

  // Scrollspy with IntersectionObserver
  useEffect(() => {
    // Delay observer setup to ensure all refs are registered
    const setupTimer = setTimeout(() => {
      const observerOptions: IntersectionObserverInit = {
        root: null,
        rootMargin: "-50% 0px -50% 0px", // Fire when section is in center of viewport
        threshold: 0,
      };

      const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        let activeEntry: IntersectionObserverEntry | null = null;
        let maxRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            activeEntry = entry;
          }
        });

        if (activeEntry && maxRatio > 0) {
          const target = activeEntry.target as HTMLElement;
          setActiveSection(target.id);
        }
      };

      const observer = new IntersectionObserver(
        handleIntersection,
        observerOptions,
      );

      // Observe all registered sections
      sectionRefsMap.current.forEach((el) => {
        observer.observe(el);
      });
    }, 100);

    return () => clearTimeout(setupTimer);
  }, []);

  // Smooth scrolling to section; rely on CSS scroll-margin-top (scroll-mt-24)
  const handleNavClick = (sectionId: string) => {
    const element = sectionRefsMap.current.get(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Helper to register refs in the map
  const registerSectionRef = (id: string) => (el: HTMLElement | null) => {
    if (!el) return;
    sectionRefsMap.current.set(id, el);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <main className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-8 md:gap-16">
            {/* Left Sidebar - Sticky Navigation */}
            <aside className="hidden md:block w-48 flex-shrink-0">
              <div className="sticky top-24">
                <nav className="flex flex-col gap-6">
                  {navSections.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => handleNavClick(section.id)}
                        className={`text-left py-2 px-4 border-l-2 text-sm transition-all duration-300 ${
                          isActive
                            ? "border-black text-black font-bold"
                            : "border-gray-300 text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Right Content Column */}
            <div className="flex-1 min-w-0">
              {/* Introduction Section */}
              <section
                ref={registerSectionRef("introduction")}
                id="introduction"
                className="mb-20 scroll-mt-24"
              >
                <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8">
                  Ioannis Bekas
                </h2>

                {/* Profile & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8">
                  {/* Profile Image */}
                  <div className="w-full">
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                      <img
                        src={founderPhoto}
                        alt="Ioannis Bekas"
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold font-heading mb-6">
                        Education
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-base font-semibold text-black mb-1">
                            M.Sc. in Operational Research, Analytics & Decision
                            Making
                          </h4>
                          <p className="text-sm text-gray-600">
                            Technical University of Crete & Hellenic Army
                            Academy
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            GPA: 9.3/10 · Thesis: "Artificial Intelligence
                            Touchpoints with Multi-Criteria Decision Analysis"
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
                            Exchange – Financial Mathematics, Stockholm
                            University
                          </p>
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-black mb-2">
                            Certifications
                          </h4>
                          <ul className="space-y-1 text-xs text-gray-700">
                            <li className="flex gap-3">
                              <span className="text-black font-bold flex-shrink-0">
                                •
                              </span>
                              <span>
                                Data Science Professional Certificate – HarvardX
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-black font-bold flex-shrink-0">
                                •
                              </span>
                              <span>
                                Google Data Analytics Professional Certificate
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-black font-bold flex-shrink-0">
                                •
                              </span>
                              <span>
                                Financial Engineering and Risk Management –
                                Columbia
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-black font-bold flex-shrink-0">
                                •
                              </span>
                              <span>Financial Markets – Yale</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-black font-bold flex-shrink-0">
                                •
                              </span>
                              <span>
                                Python and Statistics for Financial Analysis –
                                HKUST
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  A data science and analytics specialist with experience across
                  the United Nations, international agencies, and global
                  enterprises. Expertise includes strategic analytics, machine
                  learning, decision intelligence, CRM optimization, and data
                  product development.
                </p>
              </section>

              {/* United Nations Section */}
              <section
                ref={registerSectionRef("un")}
                id="un"
                className="mb-20 scroll-mt-24"
              >
                <h3 className="text-3xl font-bold font-heading mb-6">
                  United Nations
                </h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-semibold text-black mb-2">
                      Data Scientist & Decision Intelligence Specialist
                    </h4>
                    <p className="text-gray-600 mb-1">
                      UNEP - United Nations Environment Programme (DTIE)
                    </p>
                    <p className="text-sm text-gray-400">
                      Jan 2021 – Present | Paris, France
                    </p>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex gap-4">
                      <span className="text-black font-bold flex-shrink-0">
                        •
                      </span>
                      <span>
                        Built and deployed machine learning models for resource
                        allocation and impact forecasting across 40+ countries.
                      </span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-black font-bold flex-shrink-0">
                        •
                      </span>
                      <span>
                        Designed data pipelines and dashboards using Python,
                        SQL, and Power BI for real-time monitoring of
                        environmental programs.
                      </span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-black font-bold flex-shrink-0">
                        •
                      </span>
                      <span>
                        Conducted advanced statistical analysis supporting
                        policy decisions on waste management, circular economy,
                        and sustainability.
                      </span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-black font-bold flex-shrink-0">
                        •
                      </span>
                      <span>
                        Led CRM optimization initiatives improving stakeholder
                        engagement and data-driven decision-making across the
                        organization.
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* IAEA Section */}
              <section
                ref={registerSectionRef("iaea")}
                id="iaea"
                className="mb-20 scroll-mt-24"
              >
                <h3 className="text-3xl font-bold font-heading mb-6">
                  IAEA Experience
                </h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-semibold text-black mb-2">
                      Analyst & Data Specialist
                    </h4>
                    <p className="text-gray-600 mb-1">
                      International Atomic Energy Agency (IAEA) - Office of
                      Internal Oversight Services
                    </p>
                    <p className="text-sm text-gray-400">
                      Feb 2020 – Dec 2020 | Vienna, Austria
                    </p>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex gap-4">
                      <span className="text-black font-bold flex-shrink-0">
                        •
                      </span>
                      <span>
                        Developed analytical frameworks for audit risk
                        assessment and compliance monitoring across global IAEA
                        operations.
                      </span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-black font-bold flex-shrink-0">
                        •
                      </span>
                      <span>
                        Created statistical models and visualizations for
                        organizational performance evaluation and resource
                        optimization.
                      </span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-black font-bold flex-shrink-0">
                        •
                      </span>
                      <span>
                        Automated data extraction and reporting processes,
                        reducing manual work by 70% and improving accuracy.
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Cultural Diplomacy Section */}
              <section
                ref={registerSectionRef("cultural")}
                id="cultural"
                className="mb-20 scroll-mt-24"
              >
                <h3 className="text-3xl font-bold font-heading mb-6">
                  Cultural Diplomacy
                </h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-semibold text-black mb-2">
                      Statistician and Data Analyst
                    </h4>
                    <p className="text-gray-600 mb-1">
                      Hellenic Institute of Cultural Diplomacy
                    </p>
                    <p className="text-sm text-gray-400">
                      Jul 2019 – Jun 2020 | Athens, Greece
                    </p>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex gap-4">
                      <span className="text-black font-bold flex-shrink-0">
                        •
                      </span>
                      <span>
                        Designed data collection systems and applied econometric
                        modeling for financial and survey datasets.
                      </span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-black font-bold flex-shrink-0">
                        •
                      </span>
                      <span>
                        Delivered predictive analysis for business forecasts and
                        international project evaluation.
                      </span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-black font-bold flex-shrink-0">
                        •
                      </span>
                      <span>
                        Created statistical reports and visualizations
                        supporting diplomacy strategy and stakeholder
                        engagement.
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Get in Touch Section */}
              <section
                ref={registerSectionRef("contact")}
                id="contact"
                className="mb-20 scroll-mt-24"
              >
                <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8">
                  Get in Touch
                </h2>

                <div className="space-y-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
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
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
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

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Google Profile</p>
                      <a
                        href="https://maps.app.goo.gl/P9Efh14GKgrXAo5B8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold hover:text-gray-600 transition-colors"
                      >
                        View on Google Maps
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-12 rounded-2xl overflow-hidden shadow-lg h-96 w-full mb-8">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3150.8860798628827!2d23.72693!3d37.97394!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a1999999999999%3A0x1111111111111111!2sAthens!5e0!3m2!1sen!2sgr!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps Profile Location"
                  />
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
