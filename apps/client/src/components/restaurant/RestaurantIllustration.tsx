export type RestaurantIllustrationKind =
  | "menu"
  | "order"
  | "receive"
  | "fulfil"
  | "cost"
  | "customers"
  | "delivery"
  | "plan";

const ink = "#172033";
const paper = "#fff";
const olive = "#e5e7eb";
const citrus = "#dce6f3";

const illustrations = {
  menu: (
    <>
      <rect x="24" y="38" width="50" height="34" rx="4" fill={paper} />
      <path d="M21 29h56v10c-4 5-10 5-14 0-4 5-10 5-14 0-4 5-10 5-14 0-4 5-10 5-14 0Z" fill={citrus} />
      <path d="m21 29 7-10h42l7 10M36 20l-2 9m15-9v9m13-9 2 9" />
      <rect x="53" y="49" width="13" height="23" rx="2" fill={olive} />
      <path d="M61 60h1M34 50h10m-10 7h10" />
      <path d="M14 53h23v29l-4-3-4 3-4-3-5 3-6-3Z" fill={paper} />
      <path d="M20 61h11m-11 6h8m-8 6h5" />
    </>
  ),
  order: (
    <>
      <path d="M27 34h42l5 44H22Z" fill={olive} />
      <path d="M36 37V27a12 12 0 0 1 24 0v10" />
      <path d="M29 34v44m38-44v44" stroke="#bcc7ad" />
      <rect x="34" y="48" width="28" height="19" rx="5" fill={paper} />
      <path d="M42 57h12m-9 5h6" />
      <circle cx="72" cy="26" r="12" fill={citrus} />
      <path d="m67 26 3 3 6-7" />
    </>
  ),
  receive: (
    <>
      <rect x="19" y="15" width="50" height="67" rx="9" fill={paper} />
      <rect x="25" y="24" width="38" height="39" rx="3" fill={olive} />
      <path d="M38 19h12M31 33h19m-19 7h12" />
      <circle cx="44" cy="73" r="3" fill={olive} />
      <path d="M48 43h28v36l-5-3-5 3-4-3-5 3-4-3-5 3Z" fill={paper} />
      <path d="M55 52h14m-14 7h10m-10 7h14" />
      <circle cx="71" cy="23" r="11" fill={citrus} />
      <path d="m66 23 3 3 6-7" />
    </>
  ),
  fulfil: (
    <>
      <path d="m18 34 30-15 30 15-30 16Z" fill={citrus} />
      <path d="M18 34v32l30 16V50Z" fill={paper} />
      <path d="M48 50v32l30-16V34Z" fill={olive} />
      <path d="m34 26 30 16v13M28 55l10 5m-10 2 6 3" />
      <circle cx="73" cy="72" r="14" fill={paper} />
      <path d="m66 72 5 5 9-11" stroke="#5b713e" strokeWidth="3" />
    </>
  ),
  cost: (
    <>
      <path d="M25 15h40v66l-6-4-5 4-5-4-5 4-5-4-5 4-4-4-5 4Z" fill={paper} />
      <path d="M34 27h22m-22 8h13m-13 9h19m-19 8h11" />
      <path d="M33 62h11" stroke="#9caa88" strokeDasharray="3 4" />
      <circle cx="69" cy="65" r="17" fill={citrus} />
      <path d="M75 57c-8-5-16 0-16 8s8 13 16 8M55 62h15m-15 6h13" />
    </>
  ),
  customers: (
    <>
      <circle cx="26" cy="38" r="8" fill={paper} />
      <circle cx="70" cy="38" r="8" fill={paper} />
      <path d="M13 70v-8a13 13 0 0 1 26 0v8Zm44 0v-8a13 13 0 0 1 26 0v8Z" fill={olive} />
      <circle cx="48" cy="30" r="11" fill={citrus} />
      <path d="M29 76V62a19 19 0 0 1 38 0v14Z" fill={paper} />
      <path d="M38 64v12m20-12v12M41 14l-2-4m16 4 2-4" />
      <path d="M41 53h14" stroke="#9caa88" />
    </>
  ),
  delivery: (
    <>
      <circle cx="29" cy="74" r="10" fill={paper} />
      <circle cx="75" cy="74" r="10" fill={paper} />
      <path d="M19 57h24v10h10c8 0 11-11 11-22v-6h8l6 25H57l-6 10H29L19 63Z" fill={olive} />
      <path d="M65 39V26h11m-50 24h18m30 15 1 9" />
      <rect x="16" y="27" width="26" height="23" rx="4" fill={citrus} />
      <path d="M23 27v-5h12v5m-6 7v8m-4-4h8M6 59h7m-9 7h8" />
      <circle cx="29" cy="74" r="2" fill={ink} stroke="none" />
      <circle cx="75" cy="74" r="2" fill={ink} stroke="none" />
    </>
  ),
  plan: (
    <>
      <rect x="18" y="16" width="60" height="65" rx="8" fill={paper} />
      <path d="M29 27h17m-17 7h9" />
      <path d="M34 48v8a11 11 0 0 0 11 11h13" stroke="#72865b" strokeDasharray="3 5" />
      <circle cx="34" cy="45" r="7" fill={olive} />
      <circle cx="64" cy="67" r="10" fill={citrus} />
      <path d="m59 67 3 3 6-7" />
      <circle cx="71" cy="24" r="12" fill={olive} />
      <path d="m66 24 3 3 6-7" />
    </>
  ),
};

/** Decorative illustrations share one palette, stroke and visual footprint. */
export function RestaurantIllustration({ kind, className }: {
  kind: RestaurantIllustrationKind;
  className?: string;
}) {
  return (
    <svg className={className} width="80" height="80" viewBox="0 0 96 96" fill="none" aria-hidden="true" focusable="false">
      <circle cx="48" cy="48" r="44" fill="#f1f5f9" />
      <g stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {illustrations[kind]}
      </g>
    </svg>
  );
}
