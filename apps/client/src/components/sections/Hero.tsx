import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { withSiteBase } from "@/lib/site";
import heroBg from "@/assets/generated_images/hero_bg_3d.png";

export function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative flex w-full items-start justify-center overflow-hidden px-0 pb-20 pt-32 sm:pt-36 md:min-h-[760px] md:items-center md:pb-20 md:pt-36">
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
              Business intelligence, AI & web application delivery
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight leading-[1.08] mb-7 md:mb-8 text-balance"
          >
            Turn complex data into <br />
            <span className="text-gray-400">decisions, automation, and products people use.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mb-8 md:mb-10 leading-relaxed"
          >
            BI Solutions Group helps teams across Greece and Europe design trusted
            Power BI systems, practical AI workflows, reliable data foundations,
            and focused web applications—from strategy through implementation and
            handoff.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-3 sm:gap-4"
          >
            <Button
              asChild
              className="rounded-full h-12 px-5 text-base sm:h-14 sm:px-8 sm:text-lg bg-black hover:bg-gray-800 hover:scale-105 transition-all duration-300 group"
            >
              <Link
                href="/start-a-project"
                onClick={() =>
                  trackEvent("hero_cta_click", {
                    cta: "Start a project",
                    target: "/start-a-project",
                  })
                }
              >
                Start a project
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full h-12 px-5 text-base sm:h-14 sm:px-8 sm:text-lg border-gray-300 bg-white/40 hover:bg-white/80 transition-all"
            >
              <a
                href={withSiteBase("/#case-studies")}
                onClick={() =>
                  trackEvent("hero_cta_click", {
                    cta: "See case studies",
                    target: "/#case-studies",
                  })
                }
              >
                See case studies
              </a>
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
