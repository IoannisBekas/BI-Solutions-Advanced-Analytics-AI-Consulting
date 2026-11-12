import assert from "node:assert/strict";
import { test } from "node:test";
import { renderFallbackHtml } from "./static";

const shell = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Home</title>
  <meta name="description" content="Home description" />
  <meta property="og:title" content="Home" />
  <meta property="og:description" content="Home description" />
  <meta property="og:image" content="https://www.bisolutions.group/card.png" />
  <meta name="twitter:title" content="Home" />
  <meta name="twitter:description" content="Home description" />
  <meta name="twitter:image" content="https://www.bisolutions.group/card.png" />
  <script>document.documentElement.setAttribute("data-js", "");</script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`;
const nonce = "dGVzdC1ub25jZQ==";

function notFound(path: string) {
  return renderFallbackHtml(shell, {
    title: "Page Not Found - BI Solutions Group",
    description: "The requested BI Solutions Group page could not be found.",
    path,
    robots: "noindex,follow",
  }, nonce);
}

test("HTML metacharacters in a fallback URL are escaped", () => {
  const html = notFound('/guides/"Sales & Ops" <2026>');

  assert.ok(html.includes(
    '<link rel="canonical" href="https://www.bisolutions.group/guides/&quot;Sales &amp; Ops&quot; &lt;2026&gt;" />',
  ));
  // Only the two scripts that belong to the shell carry the nonce.
  assert.equal(html.match(/nonce="/g)?.length, 2);
});

test("replacement patterns in the request path stay literal", () => {
  const cases: Array<[string, string]> = [
    ["$'", "$&#39;"],
    ["$&", "$&amp;"],
    ["$`", "$`"],
    ["$1", "$1"],
  ];

  for (const [pattern, escaped] of cases) {
    const html = notFound(`/nope${pattern}`);
    assert.ok(
      html.includes(`<link rel="canonical" href="https://www.bisolutions.group/nope${escaped}" />`),
      pattern,
    );
    assert.equal(html.match(/<\/head>/g)?.length, 1, pattern);
    assert.equal(html.match(/<div id="root"><\/div>/g)?.length, 1, pattern);
  }
});

test("the shell's own scripts receive the nonce and route metadata is escaped", () => {
  const html = renderFallbackHtml(shell, {
    title: 'Guides & "Notes" <b>',
    description: "Dashboards & models",
    path: "/blog/example-post",
  }, nonce);

  assert.ok(html.includes(`<script nonce="${nonce}">document.documentElement`));
  assert.ok(html.includes(`<script nonce="${nonce}" type="module" src="/assets/index.js">`));
  assert.ok(html.includes("<title>Guides &amp; &quot;Notes&quot; &lt;b&gt;</title>"));
  assert.ok(html.includes('<meta name="description" content="Dashboards &amp; models" />'));
  assert.ok(html.includes('<meta name="robots" content="index,follow" />'));
  // Structured data is a data block added after stamping, so it has no nonce.
  assert.ok(html.includes('<script id="seo-structured-data" type="application/ld+json">'));
});

test("a shell rendered without a nonce is left unstamped", () => {
  assert.ok(!renderFallbackHtml(shell, { title: "T", description: "D", path: "/x", robots: "noindex,follow" }, "").includes("nonce="));
});
