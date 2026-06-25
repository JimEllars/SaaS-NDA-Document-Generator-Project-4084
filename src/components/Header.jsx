import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiActivity } from 'react-icons/fi';
import { FiShield, FiTrash2 } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Header = React.memo(({ isPaid, onClear, onStartOver }) => {
  const [isEcosystemSync, setIsEcosystemSync] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('axim_sync') || urlParams.has('partner_id') || urlParams.has('trace_id')) {
        setIsEcosystemSync(true);
      }
    }
  }, []);

  return (
    <>
      {!import.meta.env.PROD && (
        <div className="w-full max-w-3xl mb-4 bg-axim-teal/10 border border-axim-teal/30 text-axim-teal text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-2 backdrop-blur-md">
          <FiAlertTriangle size={14} />
          <span>Staging Environment - Do not enter real PII. Activity is strictly monitored.</span>
        </div>
      )}
      <div className="max-w-3xl w-full flex justify-between items-center mb-8 no-print relative">
        {isEcosystemSync && (
          <div className="absolute -top-6 right-0 bg-axim-teal/10 border border-axim-teal/30 text-axim-teal text-xs py-1 px-3 rounded-full flex items-center gap-2 backdrop-blur-md animate-pulse shadow-[0_0_10px_rgba(0,229,255,0.2)]">
            <FiActivity size={12} />
            <span>Ecosystem Sync Active</span>
          </div>
        )}

      <div>
        <a href="https://axim.us.com" className="text-sm text-axim-teal hover:underline mb-2 inline-block font-semibold flex items-center gap-1 opacity-80 hover:opacity-100 transition">
          &larr; Back to AXiM Ecosystem
        </a>
        <h1 className="text-3xl font-extrabold text-zinc-100 flex items-center gap-3">
          <SafeIcon icon={FiShield} className="text-axim-teal" size={32} />
          AXiM NDA Generator
        </h1>
        <p className="text-zinc-400 font-medium mt-1">Professional Legal Document Builder</p>
      </div>
      {!isPaid && (
        <button
          onClick={onClear}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-red-400 transition px-3 py-2 rounded-lg hover:bg-red-500/10"
        >
          <SafeIcon icon={FiTrash2} size={16} /> Reset
        </button>
      )}
      {isPaid && (
        <button
          onClick={onStartOver}
          className="flex items-center gap-2 text-sm font-semibold text-axim-teal hover:text-axim-teal/80 transition px-3 py-2 rounded-lg hover:bg-axim-teal/10"
        >
           Start Over
        </button>
      )}
    </div>
    </>
  );
}, (prevProps, nextProps) => {
  return prevProps.isPaid === nextProps.isPaid;
});

export default Header;
