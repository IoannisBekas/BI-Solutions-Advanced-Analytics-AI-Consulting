import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import founderPhoto from "@/assets/founder-photo-2.jpg";
import { Button } from "@/components/ui/button";
import { Mail, Linkedin, MapPin, Download, Phone, Github } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
  ref: React.RefObject<HTMLElement | null>;
}

export default function About() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections: Section[] = [
    { id: "introduction", label: "Introduction", ref: useRef<HTMLElement>(null) },
    { id: "experience", label: "Experience", ref: useRef<HTMLElement>(null) },
    { id: "education", label: "Education", ref: useRef<HTMLElement>(null) },
    { id: "certifications", label: "Certifications", ref: useRef<HTMLElement>(null) },
    { id: "contact", label: "Get in Touch", ref: useRef<HTMLElement>(null) },
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
      <Navbar />

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-black origin-left z-50"
        style={{ scaleX }}
      />

      <main className="flex justify-center pt-32 px-6 md:px-12 pb-20">
        <div className="flex gap-16 w-full max-w-7xl relative">

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
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 block">Connect</span>
                <div className="flex gap-4">
                  <a href="https://linkedin.com/in/ioannisbekas" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="https://github.com/IoannisBekas" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="mailto:Bekas.Ioannis.1996@gmail.com" className="text-gray-400 hover:text-black transition-colors">
                    <Mail className="w-5 h-5" />
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
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="grid md:grid-cols-[1fr_350px] gap-12 items-start"
              >
                <div>
                  <h1 className="text-5xl md:text-7xl font-bold font-heading mb-8 tracking-tight">
                    Ioannis Bekas
                  </h1>
                  <h2 className="text-2xl font-medium text-gray-800 mb-6">Strategic Business & Data Analyst</h2>
                  <p className="text-xl text-gray-600 leading-relaxed mb-8">
                    Strategic Business & Data Analyst with 9+ years of experience delivering high-impact analytical, customer-insight, and product-innovation work across international organizations and complex operational environments. Responsible for managing projects and implementing solutions.
                  </p>
                  <p className="text-lg text-gray-600 mb-8">
                    Advanced proficiency with Power BI, Tableau, Excel, SQL, AI-powered research tools, and customer behavior analytics.
                  </p>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => scrollToSection('contact')}
                      className="rounded-full px-8 h-12 bg-black hover:bg-gray-800 text-white"
                    >
                      Get in Touch
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full px-8 h-12 border-gray-200 hover:bg-gray-50"
                      onClick={() => window.open('https://linkedin.com/in/ioannisbekas', '_blank')}
                    >
                      LinkedIn
                    </Button>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-xl"
                >
                  <img
                    src={founderPhoto}
                    alt="Ioannis Bekas"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </motion.div>
              </motion.div>
            </section>

            {/* Experience Section */}
            <section ref={sections[1].ref} id="experience" className="mb-32 scroll-mt-32">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold font-heading mb-12"
              >
                Experience
              </motion.h2>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="space-y-8"
              >
                <p className="text-lg text-gray-600 leading-relaxed">
                  I am a Mathematician, Investor, Data Scientist, Analytics Engineer, and Business Intelligence Developer with experience across both international organizations and the private sector. My expertise includes data management, statistical analysis, artificial intelligence, and information visualization, with a focus on building advanced analytical tools that support data-driven decision-making and training data models for predictive analytics and automation.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  My professional background spans international organizations such as the International Atomic Energy Agency (IAEA), the International Organization for Migration (IOM), and the United Nations Office for Disaster Risk Reduction (UNDRR), as well as private-sector environments. Across these settings, I have contributed to structuring and analyzing large-scale datasets, developing data governance frameworks, and designing scalable business intelligence and analytics solutions.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  In parallel, I have consulted professionals and teams across Canada, the United States, and Europe, supporting data, analytics, and decision-making initiatives for organizations including Fujitsu, LG, Nespresso, Collins Aerospace, Coca-Cola, PepsiCo, and multiple SMEs.
                </p>
              </motion.div>
            </section>

            {/* Education Section */}
            <section ref={sections[2].ref} id="education" className="mb-32 scroll-mt-32">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold font-heading mb-16"
              >
                Education
              </motion.h2>

              <div className="grid md:grid-cols-1 gap-12">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="p-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-2xl font-bold mb-2">M.Sc. in Operational Research, Analytics & Decision Making</h3>
                  <p className="text-gray-600 mb-4 text-lg">Technical University of Crete & Hellenic Army Academy</p>
                  <div className="text-base text-gray-500 space-y-2">
                    <p>• GPA: 9.3/10</p>
                    <p>• Thesis: "Artificial Intelligence Touchpoints with Multi-Criteria Decision Analysis"</p>
                  </div>
                </motion.div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="p-8 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-2xl font-bold mb-2">B.Sc. in Mathematics & Minor in Economics</h3>
                  <p className="text-gray-600 mb-4 text-lg">University of Athens</p>
                  <div className="text-base text-gray-500 space-y-2">
                    <p>• Exchange – Financial Mathematics, Stockholm University</p>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Certifications Section */}
            <section ref={sections[3].ref} id="certifications" className="mb-32 scroll-mt-32">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold font-heading mb-16"
              >
                Certifications
              </motion.h2>

              <div className="grid md:grid-cols-1 gap-8">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="p-8 border border-gray-100 rounded-2xl"
                >
                  <ul className="space-y-4">
                    {[
                      "Data Science Professional Certificate – HarvardX",
                      "Google Data Analytics Professional Certificate",
                      "Financial Engineering and Risk Management – Columbia",
                      "Financial Markets – Yale",
                      "Python and Statistics for Financial Analysis – HKUST"
                    ].map((cert, index) => (
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
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="border-t border-gray-200 pt-24"
              >
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8">Let's Connect</h2>
                    <p className="text-xl text-gray-600 mb-12">
                      I'm always open to discussing data strategy, AI implementation, or potential collaborations.
                    </p>
                    <div className="space-y-6">

                      <a href="https://linkedin.com/in/ioannisbekas" target="_blank" rel="noreferrer" className="group flex items-center gap-4 text-xl font-medium hover:text-gray-600 transition-colors p-2 rounded-lg">
                        <span className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Linkedin className="w-5 h-5" />
                        </span>
                        linkedin.com/in/ioannisbekas
                      </a>
                      <a href="https://github.com/IoannisBekas" target="_blank" rel="noreferrer" className="group flex items-center gap-4 text-xl font-medium hover:text-gray-600 transition-colors p-2 rounded-lg">
                        <span className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Github className="w-5 h-5" />
                        </span>
                        github.com/IoannisBekas
                      </a>
                      <a href="https://www.linkedin.com/company/bi-solutions-by-bekas-ioannis/" target="_blank" rel="noreferrer" className="group flex items-center gap-4 text-xl font-medium hover:text-gray-600 transition-colors p-2 rounded-lg">
                        <span className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Linkedin className="w-5 h-5" />
                        </span>
                        Company LinkedIn
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
