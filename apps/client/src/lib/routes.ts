export const PRODUCT_ROUTES = {
  quantus: "/Quantus-Investing",
  powerBiSolutions: "/Power%20BI%20Solutions",
  bonusaki: "/bonusaki",
  aiAdvisor: "/Greek%20AI%20Professional%20Advisor",
} as const;

export const PRODUCT_ROUTE_ALIASES = {
  quantus: "/quantus",
  powerBiSolutions: "/power-bi-solutions",
  bonusaki: "/bonusaki",
  aiAdvisor: "/ai-advisor",
} as const;

export const PRODUCT_ROUTE_LEGACY_DISPLAY_PATHS = {
  quantus: "/Quantus",
} as const;

export const PRODUCT_ROUTE_DISPLAY_PATHS = {
  quantus: decodeRoutePath(PRODUCT_ROUTES.quantus),
  powerBiSolutions: decodeRoutePath(PRODUCT_ROUTES.powerBiSolutions),
  bonusaki: decodeRoutePath(PRODUCT_ROUTES.bonusaki),
  aiAdvisor: decodeRoutePath(PRODUCT_ROUTES.aiAdvisor),
} as const;

export function decodeRoutePath(path: string) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}
