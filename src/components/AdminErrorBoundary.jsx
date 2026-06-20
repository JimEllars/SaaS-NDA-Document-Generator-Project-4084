import React from 'react';
import { FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

class AdminErrorBoundary extends React.Component {


  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin Dashboard Layout Exception:", error, errorInfo);
  }

  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleResync = this.handleResync.bind(this);
  }

  handleResync() {
    // Programmatically clear old UI state references and re-probe endpoint quietly
    this.setState({ hasError: false });
    // Mock the silent re-probe of telemetry summary endpoint
    fetch('/api/v1/telemetry/summary')
      .then(() => console.log('Silently re-probed telemetry summary endpoint.'))
      .catch(e => console.error('Silent probe failed', e));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
           <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <FiAlertTriangle className="text-red-500" size={32} />
           </div>
           <h2 className="text-xl font-bold text-zinc-100 mb-2">Interface Integrity Warning</h2>
           <p className="text-zinc-400 mb-6 max-w-md">
             The structural continuity of the dashboard proxy was interrupted. Click below to quietly re-sync system data without a hard refresh.
           </p>
           <button
              onClick={this.handleResync}
              className="flex items-center gap-2 bg-black border border-white/10 text-zinc-200 font-bold py-3 px-6 rounded-xl hover:bg-white/5 transition"
           >
              <FiRefreshCw />
              Re-Sync System Data
           </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
