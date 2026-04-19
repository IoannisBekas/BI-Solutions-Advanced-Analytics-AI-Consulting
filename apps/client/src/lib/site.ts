const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:)?\/\//i;
const LOCALHOST_PATTERN = /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)$/i;
const DEFAULT_CANONICAL_SITE_ORIGIN = "https://www.bisolutions.group";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const SITE_BASE_PATH = (() => {
  const trimmedBase = trimTrailingSlash(import.meta.env.BASE_URL || "/");
  return trimmedBase === "/" ? "" : trimmedBase;
})();

export const CANONICAL_SITE_ORIGIN = trimTrailingSlash(
  import.meta.env.VITE_CANONICAL_SITE_ORIGIN || DEFAULT_CANONICAL_SITE_ORIGIN,
);

function getPublicSiteOrigin() {
  if (typeof window === "undefined") {
    return CANONICAL_SITE_ORIGIN;
  }

  return LOCALHOST_PATTERN.test(window.location.hostname)
    ? window.location.origin
    : CANONICAL_SITE_ORIGIN;
}

export function withSiteBase(path: string) {
  if (
    ABSOLUTE_URL_PATTERN.test(path) ||
    path.startsWith("#") ||
    path.startsWith("mailto:")
  ) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_BASE_PATH}${normalizedPath}`;
}

export function withPublicSiteOrigin(path: string) {
  if (
    ABSOLUTE_URL_PATTERN.test(path) ||
    path.startsWith("#") ||
    path.startsWith("mailto:")
  ) {
    return path;
  }

  return new URL(withSiteBase(path), `${getPublicSiteOrigin()}/`).toString();
}

export function withAssetBase(path: string) {
  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
}
