import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import {
  Eye,
  LayoutGrid,
  Palette,
  Type,
  BarChart3,
  Accessibility,
  Paintbrush,
  Smartphone,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardReviewResult, VisualRecommendation, VisualRecommendationType } from '@/types';

interface VisualRecommendationsSectionProps {
  review: DashboardReviewResult;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}

const severityConfig = {
  critical: { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: AlertCircle },
  high: { color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', icon: AlertTriangle },
  medium: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', icon: Info },
  low: { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: CheckCircle2 },
};

const visualTypeConfig: Record<VisualRecommendationType, { icon: typeof LayoutGrid; label: string; color: string }> = {
  'layout': { icon: LayoutGrid, label: 'Layout', color: 'text-purple-600' },
  'color-contrast': { icon: Palette, label: 'Color & Contrast', color: 'text-pink-600' },
  'readability': { icon: Type, label: 'Readability', color: 'text-blue-600' },
  'chart-choice': { icon: BarChart3, label: 'Chart Choice', color: 'text-cyan-600' },
  'accessibility': { icon: Accessibility, label: 'Accessibility', color: 'text-green-600' },
  'branding': { icon: Paintbrush, label: 'Branding', color: 'text-orange-600' },
  'mobile': { icon: Smartphone, label: 'Mobile', color: 'text-indigo-600' },
};

function VisualRecommendationCard({ recommendation }: { recommendation: VisualRecommendation }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const severity = severityConfig[recommendation.severity];
  const type = visualTypeConfig[recommendation.type] || visualTypeConfig.layout;

  return (
    <div className={`rounded-xl border ${severity.borderColor} overflow-hidden bg-white transition-all duration-300 hover:shadow-md`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center gap-4 ${severity.bgColor} hover:bg-opacity-70 transition-colors text-left`}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white">
          <severity.icon className={`w-5 h-5 ${severity.color}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white ${severity.color}`}>
              {recommendation.severity.toUpperCase()}
            </span>
            <span className={`text-xs flex items-center gap-1 ${type.color}`}>
              <type.icon className="w-3 h-3" />
              {type.label}
            </span>
            {recommendation.screenshotIndex != null && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white text-muted-foreground border border-border">
                Screenshot {recommendation.screenshotIndex + 1}
              </span>
            )}
          </div>
          <h4 className="text-black font-medium">{recommendation.title}</h4>
        </div>

        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 bg-white">
          <p className="text-muted-foreground mb-4 leading-relaxed">{recommendation.description}</p>
          {recommendation.suggestion && (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-sm text-black font-medium mb-1">Suggestion:</p>
              <p className="text-sm text-muted-foreground">{recommendation.suggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type FilterType = 'all' | VisualRecommendationType;

export function VisualRecommendationsSection({ review, sectionRef }: VisualRecommendationsSectionProps) {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: listRef, isVisible: listVisible } = useScrollAnimation<HTMLDivElement>();
  const [filter, setFilter] = useState<FilterType>('all');

  if (review.recommendations.length === 0) return null;

  const filteredRecs = filter === 'all'
    ? review.recommendations
    : review.recommendations.filter(r => r.type === filter);

  // Build counts for filter tabs — only show categories that have recommendations
  const typeCounts = new Map<FilterType, number>();
  typeCounts.set('all', review.recommendations.length);
  for (const rec of review.recommendations) {
    typeCounts.set(rec.type, (typeCounts.get(rec.type) || 0) + 1);
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-12 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="abstract-bg">
        <div className="abstract-shape shape-1" style={{ opacity: 0.2 }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`scroll-hidden ${headerVisible ? 'scroll-visible' : ''} text-center mb-12`}
        >
          <div className="badge mb-4">
            <Eye className="w-4 h-4" />
            <span>Visual Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-black mb-4">
            Dashboard Review Results
          </h2>

          {/* Summary + Score */}
          <div className="max-w-2xl mx-auto">
            {review.overallScore != null && (
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-border mb-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                  ${review.overallScore >= 7 ? 'bg-green-50 text-green-700 border border-green-200' :
                    review.overallScore >= 4 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                    'bg-red-50 text-red-700 border border-red-200'}
                `}>
                  {review.overallScore}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-black">Overall Score</p>
                  <p className="text-xs text-muted-foreground">out of 10</p>
                </div>
              </div>
            )}
            <p className="text-muted-foreground leading-relaxed">
              {review.summary}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        {typeCounts.size > 2 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Array.from(typeCounts.entries()).map(([type, count]) => (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(type)}
                className={`rounded-full ${
                  filter === type
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                {type === 'all' ? 'All' : visualTypeConfig[type]?.label || type}
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${filter === type ? 'bg-white/20' : 'bg-secondary'}`}>
                  {count}
                </span>
              </Button>
            ))}
          </div>
        )}

        {/* Recommendations List */}
        <div ref={listRef} className="space-y-4">
          {filteredRecs.map((rec, index) => (
            <div
              key={rec.id}
              className={`scroll-hidden stagger-${Math.min(index, 4) + 1} ${listVisible ? 'scroll-visible' : ''}`}
            >
              <VisualRecommendationCard recommendation={rec} />
            </div>
          ))}
        </div>

        {filteredRecs.length === 0 && (
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
