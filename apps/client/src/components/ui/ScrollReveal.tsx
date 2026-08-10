import { motion, useInView, useReducedMotion, Variant } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  duration?: number;
}

export const ScrollReveal = ({
  children,
  width = "fit-content",
  delay = 0,
  direction = "up",
  className = "",
  duration = 0.5
}: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();

  // Animating starts only after hydration. Rendering the hidden state during
  // prerendering would bake opacity:0 into the static HTML that search and AI
  // crawlers read, hiding the very content the prerender exists to expose.
  const [canAnimate, setCanAnimate] = useState(false);
  useEffect(() => {
    setCanAnimate(true);
  }, []);

  const animateState =
    canAnimate && !shouldReduceMotion && !isInView ? "hidden" : "visible";

  const getVariants = (): { hidden: Variant; visible: Variant } => {
    const distance = 50;
    let initial = {};

    switch (direction) {
      case "up": initial = { y: distance, opacity: 0 }; break;
      case "down": initial = { y: -distance, opacity: 0 }; break;
      case "left": initial = { x: distance, opacity: 0 }; break;
      case "right": initial = { x: -distance, opacity: 0 }; break;
      case "none": initial = { opacity: 0, scale: 0.95 }; break;
    }

    return {
      hidden: initial,
      visible: {
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { duration, delay, ease: "easeOut" }
      },
    };
  };

  const rootClassName = className ? `h-full ${className}` : "h-full";

  return (
    <div ref={ref} style={{ width, position: "relative" }} className={rootClassName}>
      <motion.div
        className="h-full"
        variants={getVariants()}
        // `initial={false}` starts from the animate state, so the first client
        // render matches the server markup exactly and hydration stays clean.
        initial={false}
        animate={animateState}
      >
        {children}
      </motion.div>
    </div>
  );
};
