import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const analyticsSource = readFileSync(new URL("../apps/client/src/lib/analytics.ts", import.meta.url), "utf8");
const quantusHtml = readFileSync(new URL("../apps/quantus/index.html", import.meta.url), "utf8");
const quantusBootstrap = [...quantusHtml.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1]).find((source) => source.includes("G-M1276CBX6M"));
const quantusTrackingSource = readFileSync(new URL("../apps/quantus/src/hooks/useWorkspacePageTracking.ts", import.meta.url), "utf8");
const productionHosts = ["bisolutions.group", "www.bisolutions.group"];
const otherHosts = ["localhost", "127.0.0.1", "[::1]", "preview.up.railway.app", "mathimatikos.xyz", "www.mathimatikos.xyz", "www.bisolutions.group.example.com"];
const normalize = (value) => JSON.parse(JSON.stringify(value));

function environment(hostname, consent = { analytics: true, ads: true }, existingTag = false) {
  const scripts = [];
  const calls = [];
  const stored = new Map(consent ? [["bi-measurement-consent-v2", JSON.stringify({ ...consent, savedAt: Date.now() })]] : []);
  const window = {
    location: { hostname, reload() { calls.push(["reload"]); } },
    localStorage: { getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) },
    ...(existingTag ? { gtag: (...args) => calls.push(args) } : {}),
  };
  const document = { cookie: "", title: "", createElement: () => ({}), head: { appendChild: (script) => scripts.push(script) } };
  return { window, document, scripts, calls };
}

function loadModule(source, env) {
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, window: env.window, document: env.document,
    require: (name) => {
      assert.equal(name, "react");
      return { useEffect: (effect) => effect() };
    },
  });
  return exports;
}

test("main-site measurement cannot send from another website, preview or localhost", () => {
  for (const hostname of otherHosts) {
    for (const existingTag of [false, true]) {
      const env = environment(hostname, undefined, existingTag);
      const analytics = loadModule(analyticsSource, env);
      analytics.initializeMeasurement();
      analytics.applyMeasurementConsent({ analytics: true, ads: true });
      analytics.trackEvent("nav_click", { destination: "/services" });
      analytics.trackLeadConversion("test-inquiry");
      assert.deepEqual(env.scripts, [], hostname);
      assert.deepEqual(env.calls, [], hostname);
      assert.equal(env.window.dataLayer, undefined, hostname);
    }
  }
});

test("both production domains retain independent analytics and advertising consent", () => {
  for (const hostname of productionHosts) {
    for (const consent of [null, { analytics: false, ads: false }, { analytics: true, ads: false }, { analytics: false, ads: true }, { analytics: true, ads: true }]) {
      const env = environment(hostname, consent);
      const analytics = loadModule(analyticsSource, env);
      analytics.initializeMeasurement();
      analytics.trackEvent("nav_click", { destination: "/services" });
      analytics.trackLeadConversion("test-inquiry");
      const queue = normalize((env.window.dataLayer ?? []).map((entry) => Array.from(entry)));
      const configs = queue.filter((entry) => entry[0] === "config").map((entry) => entry[1]);
      assert.equal(configs.includes("G-M1276CBX6M"), consent?.analytics === true);
      assert.equal(configs.includes("AW-18432612818"), consent?.ads === true);
      assert.equal(queue.some((entry) => entry[1] === "nav_click"), consent?.analytics === true);
      const conversions = queue.filter((entry) => entry[1] === "conversion");
      assert.equal(conversions.length, consent?.ads === true ? 1 : 0);
      if (conversions.length) assert.equal(conversions[0][2].send_to, "AW-18432612818/QZdDCIrolO8cENKzrdVE");
      if (consent?.analytics) assert.equal(queue.find((entry) => entry[1] === "nav_click")[2].send_to, "G-M1276CBX6M");
      assert.equal(env.scripts.length, consent && (consent.analytics || consent.ads) ? 1 : 0);
      if (env.scripts.length) assert.deepEqual(queue[0], ["consent", "default", {
        analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
      }]);
    }
  }
});

test("production withdrawal still sends denied consent, removes cookies and reloads", () => {
  const env = environment("www.bisolutions.group", undefined, true);
  env.document.cookie = "_ga=test; _gcl_aw=test";
  loadModule(analyticsSource, env).applyMeasurementConsent({ analytics: false, ads: false });
  assert.deepEqual(normalize(env.calls[0]), ["consent", "update", {
    analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
  }]);
  assert.match(env.document.cookie, /Max-Age=0/);
  assert.deepEqual(env.calls.at(-1), ["reload"]);
});

test("Quantus loads its BI tag only on the production BI domains", () => {
  assert.ok(quantusBootstrap);
  assert.equal(/<script[^>]+src=["']https:\/\/www\.googletagmanager\.com/.test(quantusHtml), false);
  for (const hostname of [...productionHosts, ...otherHosts]) {
    const env = environment(hostname);
    vm.runInNewContext(quantusBootstrap, { window: env.window, document: env.document });
    assert.equal(env.scripts.length, productionHosts.includes(hostname) ? 1 : 0, hostname);
    if (env.scripts.length) {
      assert.equal(env.scripts[0].src, "https://www.googletagmanager.com/gtag/js?id=G-M1276CBX6M");
      assert.equal(env.window.dataLayer[1][1], "G-M1276CBX6M");
    } else assert.equal(env.window.dataLayer, undefined, hostname);
  }
});

test("Quantus preserves local page titles but emits route views only on BI production", () => {
  for (const hostname of [...productionHosts, ...otherHosts]) {
    const env = environment(hostname, undefined, true);
    loadModule(quantusTrackingSource, env).useWorkspacePageTracking({ view: "watchlist", path: "/quantus/workspace/watchlist" });
    assert.equal(env.document.title, "Quantus Watchlist | BI Solutions Group");
    assert.equal(env.calls.length, productionHosts.includes(hostname) ? 1 : 0, hostname);
    if (env.calls.length) assert.deepEqual(normalize(env.calls[0]), ["config", "G-M1276CBX6M", {
      page_path: "/quantus/workspace/watchlist", page_title: "Quantus Watchlist | BI Solutions Group",
    }]);
  }
});
