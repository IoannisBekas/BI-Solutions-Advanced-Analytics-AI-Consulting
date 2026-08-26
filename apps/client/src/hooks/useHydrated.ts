import { useEffect, useState } from "react";

/**
 * False during prerendering and on the first client render, true afterwards.
 *
 * Scroll animations that declare an `initial` state serialize it into the
 * prerendered HTML — usually `opacity: 0` — so a crawler that renders CSS but
 * never scrolls sees blank sections. Gating `initial` on this hook renders the
 * visible state on the server, matches it on hydration, and only then lets the
 * animation take over.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
