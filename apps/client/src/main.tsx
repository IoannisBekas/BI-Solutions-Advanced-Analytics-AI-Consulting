import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { DEFAULT_LOCALE, splitLocaleFromPath } from "./i18n/config";
import { setPageTranslations } from "./i18n/localizeDocument";

activateAsyncFonts();
const routeWasRestored = restoreGitHubPagesRoute();

function activateAsyncFonts() {
  const stylesheet = document.getElementById("site-fonts");
  if (!(stylesheet instanceof HTMLLinkElement)) return;

  const activate = () => {
    stylesheet.media = "all";
  };

  stylesheet.addEventListener("load", activate, { once: true });
  if (stylesheet.sheet) activate();
}

function restoreGitHubPagesRoute() {
  const redirectKey = "__bisolutions_redirect__";

  try {
    const pendingRoute = sessionStorage.getItem(redirectKey);
    if (!pendingRoute) {
      return false;
    }

    sessionStorage.removeItem(redirectKey);
    const redirectUrl = new URL(pendingRoute, window.location.origin);
    if (redirectUrl.origin !== window.location.origin) {
      return false;
    }

    const restoredRoute = `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
    if (restoredRoute !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", restoredRoute);
      return true;
    }
  } catch (error) {
    console.warn("Unable to restore GitHub Pages route for the BI Solutions site.", error);
  }
  return false;
}

const container = document.getElementById("root")!;

async function renderApp() {
  const { locale } = splitLocaleFromPath(window.location.pathname);
  if (locale !== DEFAULT_LOCALE) {
    const { pageTranslations } = await import(
      "./i18n/pageTranslations.generated"
    );
    setPageTranslations(pageTranslations);
  }

  // Hydrate prerendered HTML only when it belongs to the requested route.
  // A Pages 404 redirect loads homepage HTML before restoring a different URL,
  // so that route needs a fresh render rather than homepage hydration.
  if (container.hasChildNodes() && !routeWasRestored) {
    hydrateRoot(container, <App />);
  } else {
    createRoot(container).render(<App />);
  }
}

void renderApp();
