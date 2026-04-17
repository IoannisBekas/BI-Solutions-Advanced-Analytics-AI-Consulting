import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  variant?: 'page' | 'section';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.variant === 'section') {
        return (
          <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-black mb-2">Section failed to load</h2>
                  <p className="text-muted-foreground mb-4">
                    This part of the app could not be loaded. Please try again.
                  </p>
                  {this.state.error && (
                    <pre className="text-xs text-left bg-white rounded-lg p-3 mb-4 overflow-auto max-h-28 text-muted-foreground">
                      {this.state.error.message}
                    </pre>
                  )}
                  <button
                    onClick={this.handleReset}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Section
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-black mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-secondary rounded-lg p-4 mb-6 overflow-auto max-h-32 text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="btn-primary inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
