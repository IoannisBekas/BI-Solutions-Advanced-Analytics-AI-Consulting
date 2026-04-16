import { useCallback, useEffect, useMemo, useState } from "react";
import {
  QUANTUS_WORKSPACE_ROUTE,
  normalizeQuantusPath,
  resolveWorkspaceRoute,
} from "../lib/workspaceRoutes";

function readBrowserLocation() {
  if (typeof window === "undefined") {
    return {
      path: QUANTUS_WORKSPACE_ROUTE,
      search: "",
    };
  }

  return {
    path: normalizeQuantusPath(window.location.pathname),
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
      const targetLocation = `${normalizedPath}${normalizedSearch}`;

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

    const normalizedPath = normalizeQuantusPath(window.location.pathname);

    if (normalizedPath !== window.location.pathname) {
      window.history.replaceState(
        window.history.state,
        "",
        `${normalizedPath}${window.location.search}`,
      );
    }

    setCurrentPath(normalizedPath);
    setCurrentSearch(window.location.search);

    const handlePopState = () => {
      setCurrentPath(normalizeQuantusPath(window.location.pathname));
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
