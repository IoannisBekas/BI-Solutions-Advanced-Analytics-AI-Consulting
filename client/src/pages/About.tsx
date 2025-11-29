import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Linkedin, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import founderPhoto from "@assets/founder-photo.jpg";

interface Section {
  id: string;
  label: string;
  ref: React.RefObject<HTMLElement>;
}

export default function About() {
  const [activeSection, setActiveSection] = useState("introduction");
  
  const sections: Section[] = [
    { id: "introduction", label: "Introduction", ref: useRef<HTMLElement>(null) },
    { id: "un", label: "United Nations", ref: useRef<HTMLElement>(null) },
    { id: "iaea", label: "IAEA Experience", ref: useRef<HTMLElement>(null) },
    { id: "cultural", label: "Cultural Diplomacy", ref: useRef<HTMLElement>(null) },
    { id: "contact", label: "Get in Touch", ref: useRef<HTMLElement>(null) },
  ];

  useEffect(() => {
    // Wait for DOM to settle before setting up observer
    const timer = setTimeout(() => {
      const observerOptions: IntersectionObserverInit = {
        root: null,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      };

      const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      };

      const observer = new IntersectionObserver(
        handleIntersection,
        observerOptions
      );

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

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex pt-20">
        {/* Left Sidebar - Sticky Navigation */}
        <aside className="hidden lg:block w-56 flex-shrink-0 px-8">
          <div className="sticky top-32">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium border-l-2 transition-all duration-300 ${
                    activeSection === section.id
                      ? "border-black text-black font-bold bg-gray-50"
                      : "border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 px-4 md:px-8 pb-20 max-w-4xl">
          {/* Introduction Section */}
          <section
            ref={sections[0].ref}
            id="introduction"
            className="mb-24 scroll-mt-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold font-heading mb-12">
              Ioannis Bekas
            </h2>

            {/* Profile & Education Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Profile Image */}
              <div className="w-full">
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
                  <img
                    src={founderPhoto}
                    alt="Ioannis Bekas"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Education */}
              <div className="space-y-8">
                <h3 className="text-3xl font-bold font-heading">Education</h3>
                
                <div>
                  <h4 className="text-lg font-semibold text-black mb-2">
                    M.Sc. in Operational Research, Analytics & Decision Making
                  </h4>
                  <p className="text-gray-600 mb-1">
                    Technical University of Crete & Hellenic Army Academy
                  </p>
                  <p className="text-sm text-gray-500">
                    GPA: 9.3/10 · Thesis: "Artificial Intelligence Touchpoints with Multi-Criteria Decision Analysis"
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-black mb-2">
                    B.Sc. in Mathematics & Minor in Economics
                  </h4>
                  <p className="text-gray-600 mb-1">University of Athens</p>
                  <p className="text-sm text-gray-500">
                    Exchange – Financial Mathematics, Stockholm University
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-black mb-3">
                    Certifications
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Data Science Professional Certificate – HarvardX</li>
                    <li>• Google Data Analytics Professional Certificate</li>
                    <li>• Financial Engineering and Risk Management – Columbia</li>
                    <li>• Financial Markets – Yale</li>
                    <li>• Python and Statistics for Financial Analysis – HKUST</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
              A data science and analytics specialist with experience across the United Nations, international agencies, and global enterprises. Expertise includes strategic analytics, machine learning, decision intelligence, CRM optimization, and data product development.
            </p>
          </section>

          {/* United Nations Section */}
          <section
            ref={sections[1].ref}
            id="un"
            className="mb-24 scroll-mt-20"
          >
            <h3 className="text-4xl font-bold font-heading mb-8">
              United Nations
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-2xl font-semibold text-black mb-2">
                  Data Scientist & Decision Intelligence Specialist
                </h4>
                <p className="text-gray-600 mb-1">
                  UNEP - United Nations Environment Programme (DTIE)
                </p>
                <p className="text-sm text-gray-500">
                  Jan 2021 – Present | Paris, France
                </p>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex gap-4">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>
                    Built and deployed machine learning models for resource allocation and impact forecasting across 40+ countries.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>
                    Designed data pipelines and dashboards using Python, SQL, and Power BI for real-time monitoring of environmental programs.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>
                    Conducted advanced statistical analysis supporting policy decisions on waste management, circular economy, and sustainability.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>
                    Led CRM optimization initiatives improving stakeholder engagement and data-driven decision-making.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* IAEA Section */}
          <section
            ref={sections[2].ref}
            id="iaea"
            className="mb-24 scroll-mt-20"
          >
            <h3 className="text-4xl font-bold font-heading mb-8">
              IAEA Experience
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-2xl font-semibold text-black mb-2">
                  Analyst & Data Specialist
                </h4>
                <p className="text-gray-600 mb-1">
                  International Atomic Energy Agency (IAEA) - Office of Internal Oversight Services
                </p>
                <p className="text-sm text-gray-500">
                  Feb 2020 – Dec 2020 | Vienna, Austria
                </p>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex gap-4">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>
                    Developed analytical frameworks for audit risk assessment and compliance monitoring across global IAEA operations.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>
                    Created statistical models and visualizations for organizational performance evaluation and resource optimization.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>
                    Automated data extraction and reporting processes, reducing manual work by 70% and improving accuracy.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Cultural Diplomacy Section */}
          <section
            ref={sections[3].ref}
            id="cultural"
            className="mb-24 scroll-mt-20"
          >
            <h3 className="text-4xl font-bold font-heading mb-8">
              Cultural Diplomacy
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-2xl font-semibold text-black mb-2">
                  Statistician and Data Analyst
                </h4>
                <p className="text-gray-600 mb-1">
                  Hellenic Institute of Cultural Diplomacy
                </p>
                <p className="text-sm text-gray-500">
                  Jul 2019 – Jun 2020 | Athens, Greece
                </p>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex gap-4">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>
                    Designed data collection systems and applied econometric modeling for financial and survey datasets.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>
                    Delivered predictive analysis for business forecasts and international project evaluation.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>
                    Created statistical reports and visualizations supporting diplomacy strategy and stakeholder engagement.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Get in Touch Section */}
          <section
            ref={sections[4].ref}
            id="contact"
            className="mb-12 scroll-mt-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold font-heading mb-12">
              Get in Touch
            </h2>

            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Email</p>
                  <a
                    href="mailto:ioannis@bisolutions.io"
                    className="text-lg font-semibold hover:text-gray-600 transition-colors"
                  >
                    ioannis@bisolutions.io
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <Linkedin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">LinkedIn</p>
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
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Google Profile</p>
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

            <div className="rounded-2xl overflow-hidden shadow-lg h-96 w-full mb-8">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3150.8860798628827!2d23.72693!3d37.97394!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a1999999999999%3A0x1111111111111111!2sAthens!5e0!3m2!1sen!2sgr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
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
      </main>
      <Footer />
    </div>
  );
}
