import { motion, useScroll, useTransform } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { trackEvent } from "@/lib/analytics";
import heroBg from "@/assets/generated_images/hero_bg_3d.png";

export function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative flex min-h-[100svh] w-full items-start justify-center overflow-hidden px-0 pb-20 pt-32 sm:pt-36 md:h-screen md:min-h-[760px] md:items-center md:pb-20 md:pt-36">
      <motion.div style={{ y: y1, opacity }} className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-white/30" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-black/5 text-sm font-semibold tracking-wide mb-6">
              AI, BI & Web App Development
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight leading-[1.08] mb-7 md:mb-8 text-balance"
          >
            AI, analytics, and web apps for <br />
            <span className="text-gray-400">data-driven businesses.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mb-8 md:mb-10 leading-relaxed"
          >
            BI Solutions helps companies in Greece and Europe build dashboards,
            analytics systems, AI workflows, and modern web applications that
            turn data into measurable business outcomes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-3 sm:gap-4"
          >
            <Link href="/services/business-intelligence-semantic-modeling">
              <Button
                onClick={() =>
                  trackEvent("hero_cta_click", {
                    cta: "BI Consulting",
                    target: "/services/business-intelligence-semantic-modeling",
                  })
                }
                className="rounded-full h-12 px-5 text-base sm:h-14 sm:px-8 sm:text-lg bg-black hover:bg-gray-800 hover:scale-105 transition-all duration-300 group"
              >
                BI Consulting
              </Button>
            </Link>
            <Link href="/services/advanced-analytics-ai">
              <Button
                onClick={() =>
                  trackEvent("hero_cta_click", {
                    cta: "AI Consulting",
                    target: "/services/advanced-analytics-ai",
                  })
                }
                variant="outline"
                className="rounded-full h-12 px-5 text-base sm:h-14 sm:px-8 sm:text-lg border-gray-300 hover:bg-gray-50 transition-all"
              >
                AI Consulting
              </Button>
            </Link>
            <Link href="/services/website-app-development">
              <Button
                onClick={() =>
                  trackEvent("hero_cta_click", {
                    cta: "Web Development",
                    target: "/services/website-app-development",
                  })
                }
                variant="outline"
                className="rounded-full h-12 px-5 text-base sm:h-14 sm:px-8 sm:text-lg border-gray-300 hover:bg-gray-50 transition-all"
              >
                Web Development
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap gap-2 text-sm font-medium text-gray-600"
          >
            {[
              "BI dashboards",
              "Web apps",
              "5-star reviews",
              "Data strategy",
              "AI workflows",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-gray-200 bg-white/70 px-2.5 py-1 text-xs shadow-sm shadow-black/[0.03] sm:px-3 sm:py-1.5 sm:text-sm"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Scroll
        </span>
        <div className="w-[1px] h-12 bg-gray-300 overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-1/2 bg-black"
          />
        </div>
      </motion.div>
    </section>
  );
}
