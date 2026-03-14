import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Database, Columns, Calculator, GitBranch, CheckCircle } from 'lucide-react';
import type { AnalysisResult } from '@/types';

interface AnalysisResultsSectionProps {
  result: AnalysisResult | null;
  resultsRef: React.RefObject<HTMLDivElement | null>;
}

export function AnalysisResultsSection({ result, resultsRef }: AnalysisResultsSectionProps) {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation<HTMLDivElement>();

  if (!result) return null;

  const stats = [
    {
      icon: Database,
      label: 'Tables',
      value: result.summary.tableCount,
    },
    {
      icon: Columns,
      label: 'Columns',
      value: result.summary.columnCount,
    },
    {
      icon: Calculator,
      label: 'Measures',
      value: result.summary.measureCount,
    },
    {
      icon: GitBranch,
      label: 'Relationships',
      value: result.summary.relationshipCount,
    }
  ];

  return (
    <section
      ref={resultsRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Shape */}
      <div className="abstract-bg">
        <div className="abstract-shape shape-1" style={{ opacity: 0.25 }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`scroll-hidden ${headerVisible ? 'scroll-visible' : ''} text-center mb-12`}
        >
          <div className="badge mb-4">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Analysis Complete</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-black mb-4">
            Model Analysis Results
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Here's a summary of your Power BI model structure and components.
          </p>
        </div>

        {/* Stats Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              data-scroll-item
              data-scroll-index={index}
              className={`
                scroll-hidden-scale stagger-${index + 1} 
                ${cardsVisible ? 'scroll-visible-scale' : ''}
                card-light p-6 text-center group
              `}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-6 h-6 text-black" />
              </div>
              <p className="text-3xl sm:text-4xl font-semibold text-black mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Model Details */}
        {result.model && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tables List */}
            <div className="scroll-hidden-left stagger-3 scroll-visible-left card-light p-6">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-black" />
                Tables ({result.model.tables.length})
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {result.model.tables.map((table) => (
                  <div
                    key={table.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <span className="text-black font-medium">{table.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {table.columns.length} columns
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Measures List */}
            <div className="scroll-hidden-right stagger-4 scroll-visible-right card-light p-6">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-black" />
                Measures ({result.model.measures.length})
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {result.model.measures.length > 0 ? (
                  result.model.measures.map((measure) => (
                    <div
                      key={measure.name}
                      className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-transparent hover:border-black/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-black font-medium">{measure.name}</span>
                        <div className="flex items-center gap-2">
                          {measure.formatString && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 text-muted-foreground font-mono">{measure.formatString}</span>
                          )}
                          <span className="text-xs text-muted-foreground bg-white px-2 py-0.5 rounded-md border border-black/5">{measure.table}</span>
                        </div>
                      </div>

                      {measure.expression && (
                        <div className="mt-2 bg-white rounded-md p-2 border border-black/5 overflow-x-auto">
                          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap font-medium">
                            {measure.expression}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No measures found in the model.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
