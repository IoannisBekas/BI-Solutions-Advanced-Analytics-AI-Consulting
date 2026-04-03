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

function rewriteQuantusPage() {
  const content = `import {
  ArrowRight,
  BarChart3,
  Brain,
  ExternalLink,
  LineChart,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const QUANTUS_APP_URL = import.meta.env.VITE_QUANTUS_URL || "/quantus/";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Multi-model ensemble combining LSTM, Prophet, and ARIMA with Gemini AI for institutional-grade research narratives.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Signals",
    description:
      "Momentum, sentiment, and regime detection signals synthesized across alternative data sources.",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description:
      "VaR, stress tests, macro context analysis, and portfolio-level risk management frameworks.",
  },
  {
    icon: BarChart3,
    title: "Deep Dive Modules",
    description:
      "On-demand AI-generated deep dives into technical analysis, options flow, sector dynamics, and more.",
  },
  {
    icon: Zap,
    title: "Multi-Asset Coverage",
    description:
      "Equities, crypto, commodities, and ETFs all analyzed through the same institutional framework.",
  },
  {
    icon: LineChart,
    title: "Strategy Recommendations",
    description:
      "Actionable trade setups with entry zones, targets, stop losses, and Kelly-derived position sizing.",
  },
];

const assetClasses = [
  { label: "Equities", count: "5,000+", color: "bg-blue-100 text-blue-700" },
  { label: "Crypto", count: "200+", color: "bg-purple-100 text-purple-700" },
  { label: "Commodities", count: "50+", color: "bg-amber-100 text-amber-700" },
  { label: "ETFs", count: "500+", color: "bg-emerald-100 text-emerald-700" },
];

const launchSteps = [
  "Open the full Quantus workspace on the BI Solutions domain.",
  "Authenticate, search, and generate reports inside the native product experience.",
  "Use deep dives, sector packs, and future premium workflows without iframe limitations.",
];

export default function QuantusPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />

      <main className="pt-32 pb-20">
        <section className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <ScrollReveal className="text-center mb-16" width="100%">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-sm font-medium text-gray-600 mb-6">
                <Zap className="w-4 h-4" />
                Powered by Meridian v2.4 Engine
              </div>
              <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight">
                Quantus
                <span className="block text-gray-400 text-3xl md:text-4xl mt-2 font-normal">
                  AI Quantitative Research Platform
                </span>
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                Institutional-grade quantitative analysis for every asset class,
                now positioned as a native BI Solutions product experience on
                the same domain.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                {assetClasses.map((asset) => (
                  <span
                    key={asset.label}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                      asset.color
                    )}
                  >
                    {asset.label}
                    <span className="text-xs opacity-70">{asset.count}</span>
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                <a href={QUANTUS_APP_URL}>
                  <Button className="rounded-full px-8 py-6 text-lg bg-black text-white hover:bg-gray-800 transition-all hover:scale-105">
                    Open Quantus
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
                <a href="#/contact">
                  <Button
                    variant="outline"
                    className="rounded-full px-8 py-6 text-lg border-gray-300 hover:border-black transition-all"
                  >
                    Talk to BI Solutions
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={i * 0.1} width="100%">
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 rounded-2xl h-full">
                    <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold font-heading mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mb-20">
          <ScrollReveal width="100%">
            <Card className="p-8 md:p-10 rounded-3xl border-gray-200 bg-white shadow-2xl">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium mb-5">
                    <Zap className="w-4 h-4" />
                    Native on bisolutions.group
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 tracking-tight">
                    Launch the full Quantus workspace from BI Solutions
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                    Instead of embedding Quantus inside a marketing page, route
                    users into the dedicated application for search, report
                    generation, deep dives, authentication, sector packs, and
                    future premium workflows.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Recommended product URL
                    </p>
                    <p className="text-sm text-gray-500 font-mono break-all">
                      https://bisolutions.group/quantus/
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Suggested launch flow
                    </p>
                    <ul className="space-y-3 text-sm text-gray-600">
                      {launchSteps.map((step) => (
                        <li key={step} className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black text-white text-[11px] font-semibold">
                            ✓
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a href={QUANTUS_APP_URL} className="block">
                    <Button className="w-full rounded-full py-6 text-lg bg-black text-white hover:bg-gray-800">
                      Enter Quantus
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </section>

        <section className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal width="100%">
            <Card className="p-12 bg-black text-white rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                  Ready for Institutional-Grade Research?
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto mb-8 text-lg">
                  Pair BI Solutions advisory work with the native Quantus
                  product experience on the same brand domain.
                </p>
                <a href="#/contact">
                  <Button className="rounded-full px-10 py-6 text-lg bg-white text-black hover:bg-gray-100 transition-all hover:scale-105">
                    Contact Us
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              </div>
            </Card>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
`;
  write(path.join('client', 'src', 'pages', 'QuantusPage.tsx'), content);
}

function rewriteQuantusViteConfig() {
  const content = `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const quantusBase = '/quantus/';
  const quantusApiTarget = env.VITE_QUANTUS_API_TARGET || 'http://localhost:3001';

  return {
    base: quantusBase,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: 'auto',
        srcDir: 'src',
        filename: 'service-worker.ts',
        strategies: 'injectManifest',
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
        manifest: {
          name: 'Quantus Research Solutions',
          short_name: 'Quantus',
          description: 'Institutional-grade quantitative research — AI-powered signals.',
          theme_color: '#0A0D14',
          background_color: '#0A0D14',
          display: 'standalone',
          start_url: quantusBase,
          scope: quantusBase,
          icons: [
            { src: \`\${quantusBase}icons/icon-192x192.png\`, sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
            { src: \`\${quantusBase}icons/icon-512x512.png\`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/quantus/api': {
          target: quantusApiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
`;
  write(path.join('Quantus', 'vite.config.ts'), content);
}

function updateServerRoutes() {
  const file = path.join('Quantus', 'server', 'index.ts');
  let content = read(file);

  content = replaceOrThrow(content, "const app = express();\n", "const app = express();\nconst API_PREFIX = '/quantus/api';\n", file);

  const replacements = [
    ["app.use('/api/', generalLimiter);", "app.use(`${API_PREFIX}/`, generalLimiter);"],
    ["app.use('/api/generate', generateLimiter);", "app.use(`${API_PREFIX}/generate`, generateLimiter);"],
    ["app.use('/api/deepdive', generateLimiter);", "app.use(`${API_PREFIX}/deepdive`, generateLimiter);"],
    ["app.post('/api/auth/login', async (req, res) => {", "app.post(`${API_PREFIX}/auth/login`, async (req, res) => {"],
    ["app.post('/api/auth/register', async (req, res) => {", "app.post(`${API_PREFIX}/auth/register`, async (req, res) => {"],
    ["app.get('/api/auth/me', (req, res) => {", "app.get(`${API_PREFIX}/auth/me`, (req, res) => {"],
    ["app.get('/api/report/:ticker', (req, res) => {", "app.get(`${API_PREFIX}/report/:ticker`, (req, res) => {"],
    ["app.post('/api/generate', async (req, res) => {", "app.post(`${API_PREFIX}/generate`, async (req, res) => {"],
    ["app.post('/api/insights', async (req, res) => {", "app.post(`${API_PREFIX}/insights`, async (req, res) => {"],
    ["app.post('/api/deepdive', async (req, res) => {", "app.post(`${API_PREFIX}/deepdive`, async (req, res) => {"],
    ["app.post('/api/screener', (req, res) => {", "app.post(`${API_PREFIX}/screener`, (req, res) => {"],
    ["app.post('/api/portfolio', (req, res) => {", "app.post(`${API_PREFIX}/portfolio`, (req, res) => {"],
    ["app.post('/api/identify', async (req, res) => {", "app.post(`${API_PREFIX}/identify`, async (req, res) => {"],
    ["app.get('/api/v1/knowledge-graph/:ticker', async (req, res) => {", "app.get(`${API_PREFIX}/v1/knowledge-graph/:ticker`, async (req, res) => {"],
    ["app.get('/api/v1/sec-edgar/:ticker', async (req, res) => {", "app.get(`${API_PREFIX}/v1/sec-edgar/:ticker`, async (req, res) => {"],
    ["app.get('/api/v1/engine/status', (req, res) => {", "app.get(`${API_PREFIX}/v1/engine/status`, (req, res) => {"],
    ["app.post('/api/v1/engine/dismiss-banner', (req, res) => {", "app.post(`${API_PREFIX}/v1/engine/dismiss-banner`, (req, res) => {"],
    ["app.get('/api/v1/app-status', (req, res) => {", "app.get(`${API_PREFIX}/v1/app-status`, (req, res) => {"],
    ["app.get('/api/v1/sectors/:sector/reports', (req, res) => {", "app.get(`${API_PREFIX}/v1/sectors/:sector/reports`, (req, res) => {"],
    ["app.get('/api/v1/blog', (req, res) => {", "app.get(`${API_PREFIX}/v1/blog`, (req, res) => {"],
    ["app.get('/api/v1/blog/:slug', (req, res) => {", "app.get(`${API_PREFIX}/v1/blog/:slug`, (req, res) => {"],
    ["app.post('/api/v1/explain', async (req, res) => {", "app.post(`${API_PREFIX}/v1/explain`, async (req, res) => {"],
    ["app.post('/api/v1/track', async (req, res) => {", "app.post(`${API_PREFIX}/v1/track`, async (req, res) => {"],
  ];

  for (const [from, to] of replacements) {
    content = replaceOrThrow(content, from, to, file);
  }

  const pushStub = `
app.post(\`\${API_PREFIX}/v1/push/subscribe\`, (_req, res) => {
    res.json({ ok: true });
});

app.post(\`\${API_PREFIX}/v1/push/unsubscribe\`, (_req, res) => {
    res.json({ ok: true });
});

`;

  content = replaceOrThrow(
    content,
    "// ─── HELPERS ──────────────────────────────────────────────────────────────────\n",
    `${pushStub}// ─── HELPERS ──────────────────────────────────────────────────────────────────\n`,
    file,
  );

  write(file, content);
}

function updateQuantusFrontendFetches() {
  const replacements = [
    [path.join('Quantus', 'src', 'App.tsx'), [
      ["fetch('/api/v1/track', {", "fetch('/quantus/api/v1/track', {"],
      ["const resp = await fetch(`/api/v1/report/${encodeURIComponent(ticker)}?user_tier=UNLOCKED`);", "const resp = await fetch(`/quantus/api/report/${encodeURIComponent(ticker)}?user_tier=UNLOCKED`);"],
      ["const resp = await fetch('/api/insights', {", "const resp = await fetch('/quantus/api/insights', {"],
      ["narrative_plain: `${asset.name} doesn't yet have pre-computed signals. The AI-powered deep dives below are live — click any module to generate expert analysis.',`,", "narrative_plain: `${asset.name} doesn't yet have pre-computed signals. The AI-powered deep dives below are live — click any module to generate expert analysis.`,"],
    ]],
    [path.join('Quantus', 'src', 'auth', 'AuthContext.tsx'), [
      ["fetch('/api/auth/login', {", "fetch('/quantus/api/auth/login', {"],
      ["fetch('/api/auth/register', {", "fetch('/quantus/api/auth/register', {"],
      ["fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });", "fetch('/quantus/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });"],
    ]],
    [path.join('Quantus', 'src', 'components', 'ReportViewer.tsx'), [
      ["fetch('/api/v1/explain', {", "fetch('/quantus/api/v1/explain', {"],
      ["fetch('/api/v1/track', {", "fetch('/quantus/api/v1/track', {"],
      ["fetch('/api/deepdive', {", "fetch('/quantus/api/deepdive', {"],
    ]],
    [path.join('Quantus', 'src', 'components', 'Report', 'SectionDeepDives.tsx'), [
      ["fetch('/api/deepdive', {", "fetch('/quantus/api/deepdive', {"],
    ]],
    [path.join('Quantus', 'src', 'components', 'Report', 'SharedWidgets.tsx'), [
      ["fetch('/api/v1/explain', {", "fetch('/quantus/api/v1/explain', {"],
    ]],
    [path.join('Quantus', 'src', 'hooks', 'usePushNotifications.ts'), [
      ["fetch('/api/v1/push/subscribe', {", "fetch('/quantus/api/v1/push/subscribe', {"],
      ["fetch('/api/v1/push/unsubscribe', {", "fetch('/quantus/api/v1/push/unsubscribe', {"],
    ]],
    [path.join('Quantus', 'src', 'pages', 'SectorPacks', 'index.tsx'), [
      ["fetch(`http://localhost:3001/api/v1/sectors/${selectedSector}/reports`);", "fetch(`/quantus/api/v1/sectors/${selectedSector}/reports`);"],
    ]],
    [path.join('Quantus', 'src', 'services', 'gemini.ts'), [
      ["fetch('/api/identify', {", "fetch('/quantus/api/identify', {"],
      ["fetch('/api/report', {", "fetch('/quantus/api/generate', {"],
    ]],
    [path.join('Quantus', 'src', 'service-worker.ts'), [
      ["url.pathname.startsWith('/api/')", "url.pathname.startsWith('/quantus/api/')"],
      ["url.pathname.startsWith('/api/v1/report/status')", "url.pathname.startsWith('/quantus/api/v1/report/status')"],
    ]],
  ];

  for (const [file, fileReplacements] of replacements) {
    let content = read(file);
    for (const [from, to] of fileReplacements) {
      content = replaceOrThrow(content, from, to, file);
    }
    write(file, content);
  }
}

function fixMethodologyParseError() {
  const file = path.join('Quantus', 'src', 'pages', 'Methodology.tsx');
  let content = read(file);
  content = replaceOrThrow(
    content,
    "<p><strong>Cache invalidation triggers:</strong> Equity price move >5%, crypto price move >8%, FRED macro data update, FMP earnings release, or Polygon options flow spike. Manual invalidation available to Institutional clients.</p>",
    "<p><strong>Cache invalidation triggers:</strong> Equity price move {'>'}5%, crypto price move {'>'}8%, FRED macro data update, FMP earnings release, or Polygon options flow spike. Manual invalidation available to Institutional clients.</p>",
    file,
  );
  write(file, content);
}

function fixPackageScripts() {
  const file = path.join('Quantus', 'package.json');
  const pkg = JSON.parse(read(file));
  pkg.scripts.clean = "node -e \"require('fs').rmSync('dist', { recursive: true, force: true })\"";
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
}

function updateGitignore() {
  const file = '.gitignore';
  let content = read(file);
  const additions = [
    'Quantus/**/__pycache__/',
    'Quantus/**/*.pyc',
    'Quantus/models/saved/',
  ];
  for (const entry of additions) {
    if (!content.includes(entry)) {
      if (!content.endsWith('\n')) content += '\n';
      content += `${entry}\n`;
    }
  }
  write(file, content);
}

function main() {
  rewriteQuantusPage();
  rewriteQuantusViteConfig();
  updateServerRoutes();
  updateQuantusFrontendFetches();
  fixMethodologyParseError();
  fixPackageScripts();
  updateGitignore();
  console.log('Applied BI Solutions + Quantus integration fixes.');
}

main();
