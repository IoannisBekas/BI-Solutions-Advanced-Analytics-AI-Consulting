import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { 
  Lightbulb, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnalysisResult, Recommendation } from '@/types';

interface RecommendationsSectionProps {
  result: AnalysisResult | null;
  recommendationsRef: React.RefObject<HTMLDivElement | null>;
}

const severityConfig = {
  critical: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle
  },
  high: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: AlertTriangle
  },
  medium: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Info
  },
  low: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: CheckCircle2
  }
};

const typeConfig = {
  performance: {
    icon: Zap,
    label: 'Performance',
    color: 'text-purple-600'
  },
  'best-practice': {
    icon: TrendingUp,
    label: 'Best Practice',
    color: 'text-green-600'
  },
  optimization: {
    icon: Lightbulb,
    label: 'Optimization',
    color: 'text-cyan-600'
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    color: 'text-orange-600'
  }
};

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const severity = severityConfig[recommendation.severity];
  const type = typeConfig[recommendation.type];

  return (
    <div 
      className={`
        rounded-xl border ${severity.borderColor} overflow-hidden bg-white
        transition-all duration-300 hover:shadow-md
      `}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center gap-4 ${severity.bgColor} hover:bg-opacity-70 transition-colors text-left`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white`}>
          <severity.icon className={`w-5 h-5 ${severity.color}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white ${severity.color}`}>
              {recommendation.severity.toUpperCase()}
            </span>
            <span className={`text-xs flex items-center gap-1 ${type.color}`}>
              <type.icon className="w-3 h-3" />
              {type.label}
            </span>
          </div>
          <h4 className="text-black font-medium">{recommendation.title}</h4>
        </div>

        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 bg-white">
          <p className="text-muted-foreground mb-4 leading-relaxed">{recommendation.description}</p>
          
          {recommendation.suggestion && (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-sm text-black font-medium mb-1">Suggestion:</p>
              <p className="text-sm text-muted-foreground">{recommendation.suggestion}</p>
            </div>
          )}

          {recommendation.affectedItems && recommendation.affectedItems.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Affected Items:</p>
              <div className="flex flex-wrap gap-2">
                {recommendation.affectedItems.map((item) => (
                  <span 
                    key={item}
                    className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RecommendationsSection({ result, recommendationsRef }: RecommendationsSectionProps) {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: listRef, isVisible: listVisible } = useScrollAnimation<HTMLDivElement>();
  const [filter, setFilter] = useState<'all' | Recommendation['type']>('all');

  if (!result || result.recommendations.length === 0) return null;

  const filteredRecommendations = filter === 'all' 
    ? result.recommendations 
    : result.recommendations.filter(r => r.type === filter);

  const typeCounts = {
    all: result.recommendations.length,
    performance: result.recommendations.filter(r => r.type === 'performance').length,
    'best-practice': result.recommendations.filter(r => r.type === 'best-practice').length,
    optimization: result.recommendations.filter(r => r.type === 'optimization').length,
    warning: result.recommendations.filter(r => r.type === 'warning').length
  };

  return (
    <section 
      ref={recommendationsRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Shape */}
      <div className="abstract-bg">
        <div className="abstract-shape shape-3" style={{ opacity: 0.25 }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <div 
          ref={headerRef}
          className={`scroll-hidden ${headerVisible ? 'scroll-visible' : ''} text-center mb-12`}
        >
          <div className="badge mb-4">
            <Lightbulb className="w-4 h-4" />
            <span>Recommendations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-black mb-4">
            Optimization Suggestions
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Based on our analysis, here are {result.recommendations.length} recommendations to improve your model.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="scroll-hidden-left stagger-1 scroll-visible-left flex flex-wrap justify-center gap-2 mb-8">
          {(Object.keys(typeCounts) as Array<keyof typeof typeCounts>).map((type) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type as typeof filter)}
              className={`
                rounded-full
                ${filter === type 
                  ? 'bg-black text-white hover:bg-gray-800' 
                  : 'border-border hover:bg-secondary'
                }
              `}
            >
              {type === 'all' ? 'All' : typeConfig[type as Recommendation['type']].label}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${filter === type ? 'bg-white/20' : 'bg-secondary'}`}>
                {typeCounts[type]}
              </span>
            </Button>
          ))}
        </div>

        {/* Recommendations List */}
        <div ref={listRef} className="space-y-4">
          {filteredRecommendations.map((recommendation, index) => (
            <div
              key={recommendation.id}
              className={`
                scroll-hidden stagger-${Math.min(index, 4) + 1}
                ${listVisible ? 'scroll-visible' : ''}
              `}
            >
              <RecommendationCard recommendation={recommendation} />
            </div>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-black font-medium">No recommendations of this type</p>
            <p className="text-muted-foreground text-sm">Try selecting a different filter</p>
          </div>
        )}
      </div>
    </section>
  );
}
