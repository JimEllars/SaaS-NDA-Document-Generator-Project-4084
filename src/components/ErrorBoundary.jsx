import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiAlertTriangle} className="text-red-500" size={32} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-6">
              We encountered an unexpected error. Please refresh the page and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
                <pre className="mt-4 p-4 bg-slate-100 rounded text-xs text-left overflow-auto max-h-40">
                    {this.state.error && this.state.error.toString()}
                </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
