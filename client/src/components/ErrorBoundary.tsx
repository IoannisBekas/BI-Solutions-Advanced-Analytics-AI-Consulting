import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Κάτι πήγε στραβά
            </h1>
            <p className="text-gray-600">
              Παρουσιάστηκε ένα απροσδόκητο σφάλμα. Δοκιμάστε να ανανεώσετε τη
              σελίδα.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Ανανέωση σελίδας
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
