import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ScrollToTop() {
    const [location] = useLocation();

    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const targetId = decodeURIComponent(hash);
            let attempts = 0;
            let timeoutId: number | undefined;

            const scrollToTarget = () => {
                const target = document.getElementById(targetId);
                if (target) {
                    const header = document.querySelector<HTMLElement>(
                        "[data-site-header]",
                    );
                    const top =
                        target.getBoundingClientRect().top +
                        window.scrollY -
                        (header?.offsetHeight ?? 0) -
                        24;
                    window.scrollTo({ top });
                    return;
                }

                attempts += 1;
                if (attempts < 20) {
                    timeoutId = window.setTimeout(scrollToTarget, 50);
                }
            };

            scrollToTarget();
            return () => window.clearTimeout(timeoutId);
        }

        window.scrollTo(0, 0);
    }, [location]);

    return null;
}
