import React, { useState, useEffect } from 'react';
import { FiActivity, FiServer, FiGlobe, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false
});

const generateRecentEvents = (() => {
  let lastTick = 0;

  let t10000, t60000, t120000, t5000, t15000, t45000, t2000, t8000;

  let op1, op2, deg1, deg2;

  let cachedEvents = {
    critical: null
  };

  return (status, latency) => {
    const now = Date.now();
    // Only update cache if more than 1 second has passed
    if (now - lastTick > 1000) {
      lastTick = now;
      t10000 = TIME_FORMATTER.format(now - 10000);
      t60000 = TIME_FORMATTER.format(now - 60000);
      t120000 = TIME_FORMATTER.format(now - 120000);
      t5000 = TIME_FORMATTER.format(now - 5000);
      t15000 = TIME_FORMATTER.format(now - 15000);
      t45000 = TIME_FORMATTER.format(now - 45000);
      t2000 = TIME_FORMATTER.format(now - 2000);
      t8000 = TIME_FORMATTER.format(now - 8000);

      op1 = `[${t60000}] Traffic steady at 45 req/s`;
      op2 = `[${t120000}] Edge cache hit ratio: 94%`;

      deg1 = `[${t15000}] Connection pool utilization > 80%`;
      deg2 = `[${t45000}] Health check marginal`;

      const crit0 = `[${t2000}] CRITICAL: Endpoint returning 500 Error`;
      const crit1 = `[${t8000}] Connection timeout after 5000ms`;
      const crit2 = `[${t15000}] Health check failed`;

      cachedEvents.critical = [crit0, crit1, crit2];
    }

    if (status === 'operational') {
      return [
        `[${t10000}] Health check passed (${latency}ms)`,
        op1,
        op2
      ];
    } else if (status === 'degraded') {
      return [
        `[${t5000}] Warning: Elevated latency (${latency}ms)`,
        deg1,
        deg2
      ];
    } else {
      return cachedEvents.critical;
    }
  };
})();

const generateMockFleetData = () => {
  return [
    { id: 'app-1', name: 'axim.us.com', status: 'operational', type: 'marketing', latency: 45 },
    { id: 'app-2', name: 'quickdemandletter.com', status: 'degraded', type: 'micro-app', latency: 850 },
    { id: 'app-3', name: 'nda-generator.axim', status: 'operational', type: 'micro-app', latency: 120 },
    { id: 'app-4', name: 'api.axim.us.com', status: 'critical', type: 'orchestrator', latency: 5000 },
    { id: 'app-5', name: 'cdn-edge-us-east', status: 'operational', type: 'edge', latency: 12 },
    { id: 'app-6', name: 'cdn-edge-eu-west', status: 'operational', type: 'edge', latency: 24 },
    { id: 'app-7', name: 'db-primary-main', status: 'degraded', type: 'database', latency: 450 },
    { id: 'app-8', name: 'worker-ai-nlp', status: 'operational', type: 'worker', latency: 89 },
    { id: 'app-9', name: 'auth.axim.us.com', status: 'operational', type: 'auth', latency: 65 },
    { id: 'app-10', name: 'payments-stripe-proxy', status: 'operational', type: 'worker', latency: 110 },
  ].map(app => ({ ...app, events: generateRecentEvents(app.status, app.latency) }));
};

const getStatusColor = (status) => {
  switch (status) {
    case 'operational': return 'bg-green-500 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]';
    case 'degraded': return 'bg-yellow-500 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]';
    case 'critical': return 'bg-red-500 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse';
    default: return 'bg-zinc-700 border-zinc-600';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'operational': return 'text-green-400';
    case 'degraded': return 'text-yellow-400';
    case 'critical': return 'text-red-400';
    default: return 'text-zinc-400';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'operational': return <FiCheckCircle className="text-green-400" size={14} />;
    case 'degraded': return <FiAlertCircle className="text-yellow-400" size={14} />;
    case 'critical': return <FiAlertCircle className="text-red-400" size={14} />;
    default: return <FiServer className="text-zinc-400" size={14} />;
  }
};

const FleetHeatmap = () => {
  const [fleetData, setFleetData] = useState([]);
  const [hoveredApp, setHoveredApp] = useState(null);

  useEffect(() => {
    // Initial data load
    setFleetData(generateMockFleetData());

    // Simulate real-time telemetry updates
    const interval = setInterval(() => {
      setFleetData(prev => prev.map(app => {
        // Randomly fluctuate latency slightly
        const latChange = Math.floor(Math.random() * 20) - 10;
        let newLat = Math.max(5, app.latency + latChange);

        // Very rarely change status for demo effect
        let newStatus = app.status;
        if (Math.random() > 0.95) {
          if (app.status === 'critical') newStatus = 'degraded';
          else if (app.status === 'degraded' && Math.random() > 0.5) newStatus = 'operational';
        }

        // Only regenerate events if status or latency changed significantly
        // or just regenerate every 3s since it's cheap now
        return {
          ...app,
          latency: newLat,
          status: newStatus,
          events: generateRecentEvents(newStatus, newLat)
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FiActivity className="text-axim-teal" /> Fleet Status Heatmap
          </h3>
          <p className="text-sm text-zinc-400 mt-2">
            Real-time observability across the AXiM edge network and micro-app architecture.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div> Operational</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Degraded</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div> Critical</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {fleetData.map((app) => (
          <div
            key={app.id}
            onMouseEnter={() => setHoveredApp(app)}
            onMouseLeave={() => setHoveredApp(null)}
            className="relative group bg-black/40 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`w-3 h-3 rounded-full border ${getStatusColor(app.status)}`}></div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold bg-white/5 px-1.5 py-0.5 rounded">{app.type}</span>
            </div>

            <div className="font-mono text-sm font-semibold text-zinc-200 truncate" title={app.name}>
              {app.name}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={getStatusText(app.status)}>{app.status}</span>
              <span className="text-zinc-500 font-mono">{app.latency}ms</span>
            </div>

            {/* Hover Tooltip - Recent Telemetry */}
            {hoveredApp?.id === app.id && (
              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 border border-white/20 rounded-xl p-3 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
                    {getStatusIcon(app.status)}
                    <span className="font-bold text-sm text-zinc-100 truncate">{app.name}</span>
                </div>
                <div className="space-y-1.5">
                    {app.events.map((event, idx) => (
                        <div key={idx} className="text-[10px] font-mono text-zinc-400 leading-tight">
                            {event}
                        </div>
                    ))}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-b border-r border-white/20 transform rotate-45"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FleetHeatmap;
