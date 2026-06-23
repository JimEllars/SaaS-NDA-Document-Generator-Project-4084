import React, { useState } from 'react';

// Logging admin clicks "Approve" or "Deny" to hitl_audit_logs
export const logHitlAction = async (action, toolName, originalAlert, adminId) => {
    // In a real app this would be: await supabase.from('hitl_audit_logs').insert([{ action, toolName, originalAlert, adminId, created_at: new Date() }])
    // This is currently a stub since the Admin Dashboard uses mock data for the audit logs.
};

const ChatInterface = () => {
    const [status, setStatus] = useState('Pending Approval');

    const handleAction = (action) => {
        logHitlAction(action, 'purge_cloudflare_cache', 'High latency detected on Edge worker', 'auth-user-current');
        setStatus(action + 'd');
    };

    return (
        <div className="p-4 bg-zinc-950/75 backdrop-blur-md border border-zinc-800/50 rounded-xl">
            <h4 className="text-zinc-100 font-bold mb-2">System Alert: High latency detected</h4>
            <p className="text-zinc-400 text-sm mb-4">AI recommends running: purge_cloudflare_cache</p>
            <div className="flex gap-2">
                <button
                    onClick={() => handleAction('Approve')}
                    className="bg-axim-teal text-black px-4 py-2 rounded-lg text-sm font-bold"
                >
                    Approve
                </button>
                <button
                    onClick={() => handleAction('Deny')}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-bold"
                >
                    Deny
                </button>
            </div>

            <div className="mt-2 text-xs text-zinc-500">Status: {status}</div>
            <div className="mt-4 flex items-center justify-end">
                <span
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-axim-teal/10 text-axim-teal text-[10px] font-bold tracking-wider uppercase border border-axim-teal/20 shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                    aria-label="Edge Protection Active"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    Edge Protection Active
                </span>
            </div>
        </div>
    );
};


export default ChatInterface;
