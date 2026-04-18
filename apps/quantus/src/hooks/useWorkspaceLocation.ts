import { useCallback, useEffect, useMemo, useState } from "react";
import {
  QUANTUS_WORKSPACE_ROUTE,
  normalizeQuantusPath,
  resolveWorkspaceRoute,
} from "../lib/workspaceRoutes";

const BUILD_BASE_PREFIX = (() => {
  const baseUrl = import.meta.env.BASE_URL || QUANTUS_WORKSPACE_ROUTE;
  const workspaceIndex = baseUrl.lastIndexOf(QUANTUS_WORKSPACE_ROUTE);

  if (workspaceIndex <= 0) {
    return "";
  }

  return baseUrl.slice(0, workspaceIndex).replace(/\/+$/, "");
})();

function getBrowserBasePrefix(pathname?: string) {
  const runtimePath =
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const workspaceIndex = runtimePath.lastIndexOf(QUANTUS_WORKSPACE_ROUTE);

  if (workspaceIndex > 0) {
    return runtimePath.slice(0, workspaceIndex).replace(/\/+$/, "");
  }

  return BUILD_BASE_PREFIX;
}

function toAppPath(pathname: string) {
  const browserBasePrefix = getBrowserBasePrefix(pathname);

  if (!browserBasePrefix || !pathname.startsWith(browserBasePrefix)) {
    return pathname;
  }

  const strippedPath = pathname.slice(browserBasePrefix.length);
  return strippedPath.startsWith("/") ? strippedPath : `/${strippedPath}`;
}

function toBrowserPath(pathname: string) {
  const normalizedPath = normalizeQuantusPath(pathname);
  const browserBasePrefix = getBrowserBasePrefix();
  return browserBasePrefix
    ? `${browserBasePrefix}${normalizedPath}`
    : normalizedPath;
}

function readBrowserLocation() {
  if (typeof window === "undefined") {
    return {
      path: QUANTUS_WORKSPACE_ROUTE,
      search: "",
    };
  }

  return {
    path: normalizeQuantusPath(toAppPath(window.location.pathname)),
    search: window.location.search,
  };
}

function normalizeSearch(search: string) {
  if (!search) {
    return "";
  }

  return search.startsWith("?") ? search : `?${search}`;
}

export function useWorkspaceLocation() {
  const initialLocation = readBrowserLocation();
  const [currentPath, setCurrentPath] = useState(initialLocation.path);
  const [currentSearch, setCurrentSearch] = useState(initialLocation.search);

  const route = useMemo(
    () => resolveWorkspaceRoute(currentPath),
    [currentPath],
  );

  const syncBrowserRoute = useCallback(
    (nextPath: string, replace = false, search = "") => {
      if (typeof window === "undefined") {
        setCurrentPath(normalizeQuantusPath(nextPath));
        setCurrentSearch(normalizeSearch(search));
        return;
      }

      const normalizedPath = normalizeQuantusPath(nextPath);
      const normalizedSearch = normalizeSearch(search);
      const targetLocation = `${toBrowserPath(normalizedPath)}${normalizedSearch}`;

      if (
        `${window.location.pathname}${window.location.search}` !==
        targetLocation
      ) {
        window.history[replace ? "replaceState" : "pushState"](
          window.history.state,
          "",
          targetLocation,
        );
      }

      setCurrentPath(normalizedPath);
      setCurrentSearch(normalizedSearch);
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const normalizedPath = normalizeQuantusPath(toAppPath(window.location.pathname));
    const browserPath = toBrowserPath(normalizedPath);

    if (browserPath !== window.location.pathname) {
      window.history.replaceState(
        window.history.state,
        "",
        `${browserPath}${window.location.search}`,
      );
    }

    setCurrentPath(normalizedPath);
    setCurrentSearch(window.location.search);

    const handlePopState = () => {
      setCurrentPath(normalizeQuantusPath(toAppPath(window.location.pathname)));
      setCurrentSearch(window.location.search);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return {
    currentPath,
    currentSearch,
    route,
    syncBrowserRoute,
  };
}
