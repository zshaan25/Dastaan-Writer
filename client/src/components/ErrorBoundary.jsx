import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    try {
      Sentry.withScope((scope) => {
        scope.setTag('error.origin', 'react_error_boundary');
        scope.setContext('react_component_stack', {
          componentStack: errorInfo?.componentStack?.slice(0, 1000),
        });
        Sentry.captureException(error);
      });
    } catch (e) {
      // Ignore Sentry reporting errors to preserve failure isolation
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-xl p-6 sm:p-8 text-center space-y-5">
            <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-zinc-100">Something went wrong</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                An unexpected studio error occurred. Our system has logged this incident.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 border border-zinc-800"
              >
                <Home className="w-3.5 h-3.5 text-zinc-400" />
                <span>Studio Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
