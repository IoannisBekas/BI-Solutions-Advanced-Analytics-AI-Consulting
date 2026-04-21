import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  ArrowRight,
  ChevronDown,
  Database,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface HeroSectionProps {
  onScrollToInput: () => void;
}

const launchStats = [
  {
    label: 'Delivery format',
    value: 'TMDL review + guided AI follow-up',
  },
  {
    label: 'Best for',
    value: 'BI engineers, semantic model owners, analytics teams',
  },
  {
    label: 'Output modes',
    value: 'Diagnostics, recommendations, dashboard review, and chat',
  },
];

const features = [
  {
    icon: Database,
    title: 'Parse TMDL cleanly',
    description:
      'Upload model definitions and inspect tables, measures, relationships, and metadata in one structured workflow.',
  },
  {
    icon: Sparkles,
    title: 'Get first-pass recommendations',
    description:
      'Surface naming issues, structural gaps, and optimization opportunities before opening a larger review cycle.',
  },
  {
    icon: MessageSquare,
    title: 'Stay inside the model context',
    description:
      'Ask follow-up questions without re-explaining the semantic model every time you want another recommendation.',
  },
];

const workflowSteps = [
  'Bring exported TMDL into one intake surface.',
  'Run parsing, diagnostics, and recommendation layers in sequence.',
  'Move into targeted chat and dashboard review once the structure is clear.',
];

export function HeroSection({ onScrollToInput }: HeroSectionProps) {
  const { ref: badgeRef, isVisible: badgeVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section id="overview" className="relative px-4 pb-10 pt-3 sm:px-6 sm:pt-6 lg:px-8 lg:pb-14">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="powerbi-ambient-orb powerbi-ambient-orb-one" />
        <div className="powerbi-ambient-orb powerbi-ambient-orb-two" />
        <div className="powerbi-ambient-orb powerbi-ambient-orb-three" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="powerbi-shell powerbi-hero-shell px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)] xl:items-end">
            <div>
              <div
                ref={badgeRef}
                className={`scroll-hidden ${badgeVisible ? 'scroll-visible' : ''}`}
              >
                <div className="powerbi-eyebrow mb-6">
                  <Sparkles className="h-4 w-4" />
                  Semantic model workspace
                </div>
              </div>

              <div
                ref={titleRef}
                className={`scroll-hidden stagger-1 ${titleVisible ? 'scroll-visible' : ''}`}
              >
                <h1 className="max-w-4xl font-heading text-[2.65rem] font-bold leading-[1.02] tracking-tight text-black sm:text-5xl sm:leading-[0.98] md:text-6xl lg:text-7xl">
                  Audit Power BI models
                  <span className="mt-2 block text-gray-400">
                    with a cleaner first-pass workflow.
                  </span>
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-600 md:text-xl">
                  Power BI Solutions brings TMDL intake, semantic model diagnostics,
                  recommendation layers, and follow-up chat into one BI Solutions
                  product shell instead of scattering them across separate tools.
                </p>
              </div>

              <div
                ref={ctaRef}
                className={`scroll-hidden stagger-2 ${ctaVisible ? 'scroll-visible' : ''} mt-8 flex flex-wrap items-center gap-4`}
              >
                <button onClick={onScrollToInput} className="btn-primary inline-flex items-center gap-2">
                  Start analyzing
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a href="#workspace" className="btn-secondary inline-flex items-center gap-2">
                  See the workspace
                </a>
              </div>
            </div>

            <div className="powerbi-panel p-6 md:p-7">
              <div className="inline-flex rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Workflow handoff
              </div>
              <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-black">
                From exported TMDL to targeted optimization advice.
              </h2>
              <div className="mt-6 space-y-3">
                {workflowSteps.map((step, index) => (
                  <div key={step} className="powerbi-step-card flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {launchStats.map((item) => (
              <div key={item.label} className="powerbi-stat-card">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                  {item.label}
                </p>
                <p className="mt-3 text-lg font-semibold leading-snug text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div
            ref={gridRef}
            className="mt-6 grid gap-4 md:grid-cols-3"
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`scroll-hidden-scale stagger-${index + 1} ${gridVisible ? 'scroll-visible-scale' : ''} powerbi-feature-card`}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-xl font-bold tracking-tight text-black">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="powerbi-scroll-cue absolute bottom-0 left-1/2 hidden -translate-x-1/2 md:block">
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </section>
  );
}
