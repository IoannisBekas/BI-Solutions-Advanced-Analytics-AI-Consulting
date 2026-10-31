import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { assertTranslationMarkup, protectTranslationTokens, protectUntranslatedHtml, buildPreHydrationScript } from "./translation-protection.mjs";

test("protects link destinations and classes while translating link text", () => {
  const source = 'See <a href="/services/data-strategy-governance" class="underline">data strategy</a>.';
  const protectedCopy = protectTranslationTokens(source);
  const translated = protectedCopy.text.replace("See", "Δείτε").replace("data strategy", "στρατηγική δεδομένων");
  assert.equal(protectedCopy.restore(translated), 'Δείτε <a href="/services/data-strategy-governance" class="underline">στρατηγική δεδομένων</a>.');
});

test("preserves full product names and repeated brands within sentences", () => {
  const source = "BI Solutions Group uses Power BI Solutions and Power BI. Power BI connects to Snowflake.";
  const protectedCopy = protectTranslationTokens(source);
  assert.ok(!protectedCopy.text.includes("Power BI"));
  assert.equal(protectedCopy.restore(protectedCopy.text), source);
});

test("leaves ordinary prose available for translation", () => {
  const protectedCopy = protectTranslationTokens("A clearer next step.");
  assert.equal(protectedCopy.restore("Ein klarer nächster Schritt."), "Ein klarer nächster Schritt.");
});

test("rejects missing, duplicated and invented placeholders", () => {
  const protectedCopy = protectTranslationTokens("Use Power BI.");
  assert.throws(() => protectedCopy.restore("Power BI verwenden."), /lost or duplicated/);
  assert.throws(() => protectedCopy.restore("__XLT_0__ __XLT_0__"), /lost or duplicated/);
  assert.throws(() => protectedCopy.restore("__XLT_0__ __XLT_99__"), /Unknown/);
});

test("rejects damaged link markup and newly inserted tags", () => {
  const source = '<a href="/services">Services</a>';
  assert.throws(() => assertTranslationMarkup(source, '<a href="/service">Leistungen</a>'), /protected HTML/);
  const protectedCopy = protectTranslationTokens(source);
  assert.throws(() => protectedCopy.restore(`${protectedCopy.text}<script>bad</script>`), /protected HTML/);
});

test("rejects placeholder collisions in the English source", () => {
  assert.throws(() => protectTranslationTokens("__XLT_0__"), /reserved/);
});

test("preserves nested native copy, attributes and void elements during prerender localization", () => {
  const source = '<p>Review</p><div translate="no"><div><img alt="Review" src="/cover.png"/><svg><text>Review</text></svg></div><br/>Review</div><p title="Review">Review</p>';
  const protectedCopy = protectUntranslatedHtml(source);
  const translated = protectedCopy.text.replaceAll("Review", "Bewertung");
  assert.equal(protectedCopy.restore(translated), '<p>Bewertung</p><div translate="no"><div><img alt="Review" src="/cover.png"/><svg><text>Review</text></svg></div><br/>Review</div><p title="Bewertung">Bewertung</p>');
});

test("preserves separate review quotations and standalone native images", () => {
  const source = '<p translate="no">Original review</p><time translate="no">Jun 2026</time><img translate="no" alt="Original review"/><p>Original review</p>';
  const protectedCopy = protectUntranslatedHtml(source);
  assert.equal(protectedCopy.restore(protectedCopy.text.replaceAll("Original review", "Αξιολόγηση")), source.replace('<p>Original review</p>', '<p>Αξιολόγηση</p>'));
});

test("ignores markup inside scripts and comments when finding native blocks", () => {
  const source = '<script>const s = "<div translate=\'no\'>";</script><!-- <p translate="no"> --><p>Copy</p>';
  assert.equal(protectUntranslatedHtml(source).text, source);
});

test("the hydration bridge skips native copy without consuming another node's reversion", () => {
  const native = { data: "Daten", parentElement: { closest: () => ({}) } };
  const translated = { data: "Daten", parentElement: { closest: () => null } };
  const attributes = (protectedCopy) => ({
    value: "KI", closest: () => protectedCopy ? {} : null,
    getAttribute(name) { return name === "aria-label" ? this.value : null; },
    setAttribute(name, value) { this.value = value; },
  });
  const nativeAttribute = attributes(true);
  const translatedAttribute = attributes(false);
  let index = -1;
  let removed = false;
  const walker = { nextNode: () => ++index < 2, get currentNode() { return [native, translated][index]; } };
  const script = buildPreHydrationScript({ Daten: ["Data"] }, { KI: ["AI"] });
  vm.runInNewContext(script.slice(script.indexOf(">") + 1, script.lastIndexOf("</script>")), {
    NodeFilter: { SHOW_TEXT: 4 },
    document: {
      getElementById: () => ({ querySelectorAll: () => [nativeAttribute, translatedAttribute] }),
      createTreeWalker: () => walker,
      currentScript: { remove: () => { removed = true; } },
    },
  });
  assert.equal(native.data, "Daten");
  assert.equal(translated.data, "Data");
  assert.equal(nativeAttribute.value, "KI");
  assert.equal(translatedAttribute.value, "AI");
  assert.equal(removed, true);
});

test("the hydration bridge preserves native strings that equal a later automatic translation", () => {
  const nodes = ["Ξεκινήστε ένα έργο", "Ξεκινήστε ένα έργο"].map(data => ({
    data, parentElement: { closest: () => null },
  }));
  let index = -1;
  const walker = { nextNode: () => ++index < nodes.length, get currentNode() { return nodes[index]; } };
  const script = buildPreHydrationScript({ "Ξεκινήστε ένα έργο": ["Ξεκινήστε ένα έργο", "Start a project"] }, {});
  vm.runInNewContext(script.slice(script.indexOf(">") + 1, script.lastIndexOf("</script>")), {
    NodeFilter: { SHOW_TEXT: 4 },
    document: {
      getElementById: () => ({ querySelectorAll: () => [] }),
      createTreeWalker: () => walker,
      currentScript: { remove() {} },
    },
  });
  assert.deepEqual(nodes.map(node => node.data), ["Ξεκινήστε ένα έργο", "Start a project"]);
});
