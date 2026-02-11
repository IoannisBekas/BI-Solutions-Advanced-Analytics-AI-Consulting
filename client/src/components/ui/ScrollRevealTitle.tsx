import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealTitleProps {
    text: string;
    className?: string;
}

export function ScrollRevealTitle({ text, className }: ScrollRevealTitleProps) {
    return (
        <div className={cn("overflow-hidden", className)}>
            <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="flex flex-wrap gap-x-[0.25em]"
            >
                {text.split(" ").map((word, i) => (
                    <motion.span
                        key={i}
                        variants={{
                            hidden: { y: "100%" },
                            visible: { y: 0 },
                        }}
                        transition={{
                            duration: 0.5,
                            ease: [0.33, 1, 0.68, 1],
                            delay: i * 0.1,
                        }}
                        className="inline-block"
                    >
                        {word}
                    </motion.span>
                ))}
            </motion.h2>
        </div>
    );
}
