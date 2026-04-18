import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

restoreGitHubPagesRoute();

function restoreGitHubPagesRoute() {
  const redirectKey = "__bisolutions_redirect__";

  try {
    const pendingRoute = sessionStorage.getItem(redirectKey);
    if (!pendingRoute) {
      return;
    }

    sessionStorage.removeItem(redirectKey);
    const redirectUrl = new URL(pendingRoute, window.location.origin);
    if (redirectUrl.origin !== window.location.origin) {
      return;
    }

    const restoredRoute = `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
    if (restoredRoute !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", restoredRoute);
    }
  } catch (error) {
    console.warn("Unable to restore GitHub Pages route for the BI Solutions site.", error);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
