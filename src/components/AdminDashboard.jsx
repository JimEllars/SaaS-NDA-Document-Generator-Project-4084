import React, { useState } from 'react';
import { FiShield, FiCpu, FiActivity } from 'react-icons/fi';
import IntelligenceHub from './IntelligenceHub';
import FleetHeatmap from './FleetHeatmap';
import ChatInterface from './ChatInterface';

// Placeholder mock data for the hitl_audit_logs table logic
// In a real application, this would fetch from Supabase:
// supabase.from('hitl_audit_logs').select('*').order('created_at', { ascending: false })


export const SecurityAudit = () => {
  const [auditLogs, setAuditLogs] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/v1/telemetry/audit-logs')
      .then(res => res.json())
      .then(data => setAuditLogs(data.logs || []))
      .catch(err => console.error('Failed to fetch audit logs', err));
  }, []);

  return (
    <div className="space-y-4">
      <div className="mb-6">
         <h4 className="text-lg font-bold mb-2">Active Approvals</h4>
         <ChatInterface />
      </div>

      <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
        <FiShield className="text-axim-teal" /> Security Audit Logs
      </h3>
      <p className="text-sm text-zinc-400 mb-6">
        A cryptographically verifiable ledger of all Human-in-the-Loop (HITL) interventions.
      </p>

      <div className="bg-black/50 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-zinc-300 font-semibold">Timestamp</th>
              <th className="px-4 py-3 text-zinc-300 font-semibold">Admin Auth ID</th>
              <th className="px-4 py-3 text-zinc-300 font-semibold">Action</th>
              <th className="px-4 py-3 text-zinc-300 font-semibold">Tool Target</th>
              <th className="px-4 py-3 text-zinc-300 font-semibold">Original Alert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                  {log.admin_id}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                    log.action === 'Approve'
                      ? 'bg-axim-teal/10 text-axim-teal border-axim-teal/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  <code className="bg-black px-1.5 py-0.5 rounded border border-white/10 text-xs">
                    {log.tool_name}
                  </code>
                </td>
                <td className="px-4 py-3 text-zinc-400 truncate max-w-xs" title={log.original_alert}>
                  {log.original_alert}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('audit');

  return (
    <div className="w-full max-w-6xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Command Center</h1>
          <p className="text-zinc-400 mt-1">AXiM Core Intelligence & Fleet Control</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'audit'
                  ? 'bg-axim-teal/10 text-axim-teal border border-axim-teal/20'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <FiShield size={18} />
              <span className="font-medium">Security Audit</span>
            </button>
            <button
              onClick={() => setActiveTab('intelligence')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'intelligence'
                  ? 'bg-axim-teal/10 text-axim-teal border border-axim-teal/20'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <FiCpu size={18} />
              <span className="font-medium">Intelligence Hub</span>
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'fleet'
                  ? 'bg-axim-teal/10 text-axim-teal border border-axim-teal/20'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <FiActivity size={18} />
              <span className="font-medium">Fleet Heatmap</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 min-h-[500px]">
          {activeTab === 'audit' && <SecurityAudit />}
          {activeTab === 'intelligence' && <IntelligenceHub />}
          {activeTab === 'fleet' && <FleetHeatmap />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
