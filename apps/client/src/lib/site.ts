const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:)?\/\//i;

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const SITE_BASE_PATH = (() => {
  const trimmedBase = trimTrailingSlash(import.meta.env.BASE_URL || "/");
  return trimmedBase === "/" ? "" : trimmedBase;
})();

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

export function withAssetBase(path: string) {
  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
}
