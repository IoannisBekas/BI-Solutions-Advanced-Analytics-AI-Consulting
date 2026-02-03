import { motion, useInView, useAnimation, Variant } from "framer-motion";
import { useRef, useEffect } from "react";

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
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

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

  return (
    <div ref={ref} style={{ width, position: "relative" }} className={className}>
      <motion.div
        variants={getVariants()}
        initial="hidden"
        animate={mainControls}
      >
        {children}
      </motion.div>
    </div>
  );
};
