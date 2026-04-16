function normalizeBasePath(value: string) {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "/") {
    return "/";
  }

  const withoutSlashes = trimmed.replace(/^\/+|\/+$/g, "");
  return withoutSlashes ? `/${withoutSlashes}/` : "/";
}

export function getDeployBasePath() {
  const explicitBase =
    process.env.GITHUB_PAGES_REPO_BASE ||
    process.env.PUBLIC_BASE ||
    process.env.VITE_PUBLIC_BASE;

  if (explicitBase) {
    return normalizeBasePath(explicitBase);
  }

  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];

  if (process.env.GITHUB_ACTIONS === "true" && repoName) {
    return normalizeBasePath(repoName);
  }

  return "/";
}

export function joinBasePath(rootBase: string, childPath: string) {
  const normalizedRoot = normalizeBasePath(rootBase);
  const normalizedChild = childPath.replace(/^\/+|\/+$/g, "");

  if (!normalizedChild) {
    return normalizedRoot;
  }

  if (normalizedRoot === "/") {
    return `/${normalizedChild}/`;
  }

  return `${normalizedRoot}${normalizedChild}/`;
}
