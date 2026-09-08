import { useEffect, useRef, useState, type CSSProperties } from "react";

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
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        } else {
          setIsVisible(false);
        }
      },
      { rootMargin: "-50px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform = {
    up: "translateY(50px)",
    down: "translateY(-50px)",
    left: "translateX(50px)",
    right: "translateX(-50px)",
    none: "scale(0.95)",
  }[direction];
  const style = {
    width,
    position: "relative",
    "--reveal-delay": `${delay}s`,
    "--reveal-duration": `${duration}s`,
    "--reveal-transform": hiddenTransform,
  } as CSSProperties;

  const rootClassName = className ? `h-full ${className}` : "h-full";

  return (
    <div ref={ref} style={style} className={rootClassName}>
      <div className="scroll-reveal__content h-full" data-visible={isVisible}>
        {children}
      </div>
    </div>
  );
};
