import React, { useState } from 'react';

// Logging admin clicks "Approve" or "Deny" to hitl_audit_logs
export const logHitlAction = async (action, toolName, originalAlert, adminId) => {
    // In a real app this would be: await supabase.from('hitl_audit_logs').insert([...])
    console.log('Logged HITL Action:', { action, toolName, originalAlert, adminId, created_at: new Date() });
};

const ChatInterface = () => {
    const [status, setStatus] = useState('Pending Approval');

    const handleAction = (action) => {
        logHitlAction(action, 'purge_cloudflare_cache', 'High latency detected on Edge worker', 'auth-user-current');
        setStatus(action + 'd');
    };

    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
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
        </div>
    );
};

export default ChatInterface;
