const fs = require('fs');
const path = require('path');

const repoRoot = String.raw`C:\Users\bekas\Downloads\BI Solutions`;

function read(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), 'utf8').replace(/\r\n/g, '\n');
}

function write(relPath, content) {
  fs.writeFileSync(path.join(repoRoot, relPath), content, 'utf8');
}

function replaceOrThrow(source, searchValue, replaceValue, file) {
  if (!source.includes(searchValue)) {
    throw new Error(`Could not find expected text in ${file}: ${searchValue.slice(0, 80)}`);
  }
  return source.replace(searchValue, replaceValue);
}

function fixCreditBadge() {
  const file = path.join('Quantus', 'src', 'auth', 'CreditBadge.tsx');
  let content = read(file);
  content = replaceOrThrow(
    content,
    "    const BUNDLES: CreditBundle[] = [\n        { name: 'Starter', credits: 10, price_usd_cents: 999, stripe_price_id: 'placeholder' },\n        { name: 'Standard', credits: 25, price_usd_cents: 1999, stripe_price_id: 'placeholder' },\n        { name: 'Pro', credits: 60, price_usd_cents: 3999, stripe_price_id: 'placeholder' },\n        { name: 'Institutional', credits: 200, price_usd_cents: 9999, stripe_price_id: 'placeholder' },\n    ];",
    "    const BUNDLES: CreditBundle[] = CREDIT_BUNDLES;",
    file,
  );
  content = content.replaceAll('price_usd_cents', 'priceUsd');
  content = content.replaceAll('stripe_price_id', 'stripePriceId');
  write(file, content);
}

function fixWelcomeCard() {
  const file = path.join('Quantus', 'src', 'components', 'WelcomeCard.tsx');
  let content = read(file);
  content = replaceOrThrow(
    content,
    "    const glassBorder = lightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';\n",
    "    const glassBorder = lightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';\n    const metrics = (report as ReportData & { metrics?: { risk?: { volatility_30d?: number; beta?: number } } }).metrics;\n",
    file,
  );
  content = content.replaceAll('report.metrics?.risk?.volatility_30d', 'metrics?.risk?.volatility_30d');
  content = content.replaceAll('report.metrics.risk.volatility_30d', 'metrics.risk.volatility_30d');
  content = content.replaceAll('report.metrics?.risk?.beta', 'metrics?.risk?.beta');
  content = content.replaceAll('report.metrics.risk.beta', 'metrics.risk.beta');
  content = content.replaceAll('<MetricRow', '<MetricCard');
  write(file, content);
}

function fixArchivePage() {
  const file = path.join('Quantus', 'src', 'pages', 'Archive.tsx');
  let content = read(file);
  content = replaceOrThrow(
    content,
    "                    {compare && <ComparePanel old={compare} cur={current} onClose={() => setCompare(null)} lightMode={lightMode} />}",
    "                    {compare && <ComparePanel old={compare} cur={current} onClose={() => setCompare(null)} />}",
    file,
  );
  write(file, content);
}

function fixServiceWorker() {
  const file = path.join('Quantus', 'src', 'service-worker.ts');
  let content = read(file);
  content = replaceOrThrow(content, "        renotify: true,\n", '', file);
  content = content.replaceAll("'/icons/icon-192x192.png'", "'/quantus/icons/icon-192x192.png'");
  content = content.replaceAll("badge: '/icons/icon-72x72.png'", "badge: '/quantus/icons/icon-72x72.png'");
  content = replaceOrThrow(
    content,
    "            url: payload.url ?? (payload.ticker ? `/report/${payload.reportId ?? payload.ticker}` : '/'),",
    "            url: payload.url ?? '/quantus/',",
    file,
  );
  content = replaceOrThrow(
    content,
    "    const targetUrl: string = event.notification.data?.url ?? '/';",
    "    const targetUrl: string = event.notification.data?.url ?? '/quantus/';",
    file,
  );
  content = replaceOrThrow(
    content,
    "        const url = `/api/v1/report/status/${event.data.ticker}`;",
    "        const url = `/quantus/api/v1/report/status/${event.data.ticker}`;",
    file,
  );
  content = replaceOrThrow(
    content,
    "        actions: [\n            { action: 'view', title: 'View Report' },\n            { action: 'dismiss', title: 'Dismiss' },\n        ],\n",
    '',
    file,
  );
  write(file, content);
}

function addAmbientTypes() {
  const file = path.join('Quantus', 'src', 'vite-env.d.ts');
  const content = `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly VITE_QUANTUS_API_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:pwa-register/react' {
  export function useRegisterSW(options?: {
    onRegisteredSW?: (swUrl: string, registration?: ServiceWorkerRegistration) => void;
  }): {
    needRefresh: [boolean];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

declare module 'i18next' {
  const i18n: {
    use(plugin: unknown): typeof i18n;
    init(options: unknown): typeof i18n;
    on(event: string, handler: (...args: unknown[]) => void): void;
  };
  export default i18n;
}

declare module 'react-i18next' {
  export const initReactI18next: unknown;
}
`;
  write(file, content);
}

function main() {
  fixCreditBadge();
  fixWelcomeCard();
  fixArchivePage();
  fixServiceWorker();
  addAmbientTypes();
  console.log('Applied Quantus TypeScript cleanup.');
}

main();
