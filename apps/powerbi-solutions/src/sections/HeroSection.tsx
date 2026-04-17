import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Database, Sparkles, MessageSquare, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  onScrollToInput: () => void;
}

export function HeroSection({ onScrollToInput }: HeroSectionProps) {
  const { ref: badgeRef, isVisible: badgeVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: subtitleRef, isVisible: subtitleVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollAnimation<HTMLDivElement>();

  const features = [
    {
      icon: Database,
      title: 'Parse TMDL',
      description: 'Upload or paste your Power BI TMDL code for instant analysis'
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'Get AI-powered suggestions to optimize your data model'
    },
    {
      icon: MessageSquare,
      title: 'Ask Questions',
      description: 'Chat with your model and get answers about tables, measures & more'
    }
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="abstract-bg">
        <div className="abstract-shape shape-1" />
        <div className="abstract-shape shape-2" />
        <div className="abstract-shape shape-3" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div
          ref={badgeRef}
          className={`scroll-hidden ${badgeVisible ? 'scroll-visible' : ''}`}
        >
          <div className="badge mb-8">
            <span className="w-2 h-2 rounded-full bg-black" />
            <span>PowerBI Solutions</span>
          </div>
        </div>

        {/* Main Title */}
        <h1
          ref={titleRef}
          className={`scroll-hidden stagger-1 ${titleVisible ? 'scroll-visible' : ''} text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-black`}
        >
          Analyze Your
          <br />
          <span className="gradient-text">Power BI Models</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className={`scroll-hidden stagger-2 ${subtitleVisible ? 'scroll-visible' : ''} text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed`}
        >
          Upload your TMDL code and get instant recommendations, performance insights,
          and answers to all your model questions through intelligent chat.
        </p>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className={`scroll-hidden stagger-3 ${ctaVisible ? 'scroll-visible' : ''} flex flex-wrap items-center justify-center gap-4 mb-20`}
        >
          <button
            onClick={onScrollToInput}
            className="btn-primary"
          >
            Start Analyzing
          </button>
          <button
            onClick={onScrollToInput}
            className="btn-secondary"
          >
            Learn More
          </button>
        </div>

        {/* Features Grid */}
        <div
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              data-scroll-item
              data-scroll-index={index}
              className={`scroll-hidden-scale stagger-${index + 1} ${featuresVisible ? 'scroll-visible-scale' : ''} card-light p-6 group cursor-default`}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator">
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      </div>
    </section>
  );
}
