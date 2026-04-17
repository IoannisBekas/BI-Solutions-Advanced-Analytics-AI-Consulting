import React, { Component, ErrorInfo, PropsWithChildren } from 'react';

type Props = PropsWithChildren;

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4 font-sans">
                    <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl text-center">
                        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-500/10 text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <path d="M12 9v4" />
                                <path d="M12 17h.01" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold mb-3 text-white">Something went wrong</h1>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            We encountered an unexpected error while rendering this page. Refresh the app to retry the Quantus workspace.
                        </p>
                        <div className="bg-gray-900 rounded-lg p-3 text-left overflow-x-auto mb-6">
                            <code className="text-xs text-red-300 font-mono whitespace-pre">
                                {this.state.error?.message || 'Unknown react rendering error'}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors cursor-pointer"
                        >
                            Reload application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
