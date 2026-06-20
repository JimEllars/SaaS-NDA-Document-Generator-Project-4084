import React, { useState, useEffect } from 'react';
import { FiLock, FiShield, FiCheckCircle } from 'react-icons/fi';

const generateMockSeal = () => {
  const hash = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return {
    id: Math.random().toString(36).substr(2, 9),
    hash,
    timestamp: new Date().toISOString(),
    status: 'Verified'
  };
};

const CryptoSealFeed = () => {
  const [seals, setSeals] = useState([]);

  useEffect(() => {
    const initialSeals = Array.from({ length: 5 }, generateMockSeal);
    setSeals(initialSeals);

    const interval = setInterval(() => {
      setSeals(prev => {
        const newSeals = [generateMockSeal(), ...prev];
        if (newSeals.length > 5) newSeals.pop();
        return newSeals;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-6 overflow-hidden">
      <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mb-4">
        <FiLock className="text-axim-teal" /> Live Crypto-Seals
      </h3>
      <div className="space-y-3">
        {seals.map((seal, index) => (
          <div key={seal.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/30 p-3 rounded-lg border border-white/5 gap-2 animate-in slide-in-from-top-2 fade-in duration-500">
             <div className="flex items-center gap-3">
                <FiShield className="text-axim-teal flex-shrink-0" />
                <div className="flex flex-col overflow-hidden w-full">
                    <span className="text-xs text-zinc-500">Document Hash</span>
                    <span className="font-mono text-xs text-zinc-300 truncate w-full max-w-[200px] sm:max-w-[300px]">
                      {seal.hash}
                    </span>
                </div>
             </div>
             <div className="flex items-center gap-2 flex-shrink-0">
                <FiCheckCircle className="text-green-400" size={14} />
                <span className="text-xs text-green-400 font-medium">{seal.status}</span>
                <span className="text-xs text-zinc-600 ml-2">
                    {new Date(seal.timestamp).toLocaleTimeString()}
                </span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoSealFeed;
