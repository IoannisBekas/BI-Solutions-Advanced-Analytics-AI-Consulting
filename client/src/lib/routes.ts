export const PRODUCT_ROUTES = {
  quantus: "/Quantus-Investing",
  powerBiSolutions: "/Power%20BI%20Solutions",
  aiAdvisor: "/Greek%20AI%20Professional%20Advisor",
  websiteAppPortfolio: "/Website%20%26%20App%20Portfolio",
} as const;

export const PRODUCT_ROUTE_ALIASES = {
  quantus: "/quantus",
  powerBiSolutions: "/power-bi-solutions",
  aiAdvisor: "/ai-advisor",
  websiteAppPortfolio: "/website-app-portfolio",
} as const;

export const PRODUCT_ROUTE_LEGACY_DISPLAY_PATHS = {
  quantus: "/Quantus",
} as const;

export const PRODUCT_ROUTE_DISPLAY_PATHS = {
  quantus: decodeRoutePath(PRODUCT_ROUTES.quantus),
  powerBiSolutions: decodeRoutePath(PRODUCT_ROUTES.powerBiSolutions),
  aiAdvisor: decodeRoutePath(PRODUCT_ROUTES.aiAdvisor),
  websiteAppPortfolio: decodeRoutePath(PRODUCT_ROUTES.websiteAppPortfolio),
} as const;

export function decodeRoutePath(path: string) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

export function pathMatches(currentPath: string, candidatePaths: string[]) {
  const normalizedCurrent = decodeRoutePath(currentPath);

  return candidatePaths.some(
    (candidate) =>
      currentPath === candidate ||
      normalizedCurrent === decodeRoutePath(candidate),
  );
}
