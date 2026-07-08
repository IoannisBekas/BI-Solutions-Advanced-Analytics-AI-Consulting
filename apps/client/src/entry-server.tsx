import { prerenderToNodeStream } from "react-dom/static";
import App from "./App";
import {
  SsrHeadContext,
  type SsrHeadCollector,
  type SsrHeadData,
} from "@/components/seo/ssrHead";

export interface PrerenderedPage {
  appHtml: string;
  head?: SsrHeadData;
}

/**
 * Renders a single route to static HTML at build time.
 *
 * @param ssrPath  Full location including the deploy base path, as the
 *                 browser would report it (e.g. "/services").
 * @param pagePath Route path relative to the site root, used as the
 *                 canonical-URL fallback when a page omits `path` on <Seo>.
 */
export async function renderPage(
  ssrPath: string,
  pagePath: string,
): Promise<PrerenderedPage> {
  const collector: SsrHeadCollector = { pagePath };

  // prerenderToNodeStream waits for Suspense boundaries, so lazy-loaded
  // pages resolve fully before the HTML is emitted.
  const { prelude } = await prerenderToNodeStream(
    <SsrHeadContext.Provider value={collector}>
      <App ssrPath={ssrPath} />
    </SsrHeadContext.Provider>,
  );

  const chunks: Buffer[] = [];
  for await (const chunk of prelude) {
    chunks.push(Buffer.from(chunk));
  }

  return {
    appHtml: Buffer.concat(chunks).toString("utf-8"),
    head: collector.head,
  };
}
