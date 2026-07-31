import React from 'react';
import { FiShield, FiCheck } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const UpsellCard = () => {
  return (
    <div className="bg-emerald-900/10 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-5 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden group">
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 text-left w-full md:w-auto">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-zinc-100 drop-shadow-sm">
              Generate Professional PDF
            </h3>
          </div>

          <p className="text-zinc-300 text-sm mb-4 leading-relaxed">
            Get a watermark-free, legally formatted document ready for digital signatures and immediate use.
          </p>

          <ul className="text-zinc-300 text-sm space-y-2 mb-4 md:mb-0">
            <li className="flex items-center gap-2 text-emerald-400">
              <SafeIcon icon={FiCheck} size={16} />
              <span className="text-zinc-300">Professional formatting</span>
            </li>
            <li className="flex items-center gap-2 text-emerald-400">
              <SafeIcon icon={FiCheck} size={16} />
              <span className="text-zinc-300">Industry-specific clauses</span>
            </li>
            <li className="flex items-center gap-2 text-emerald-400">
              <SafeIcon icon={FiCheck} size={16} />
              <span className="text-zinc-300">Instant download</span>
            </li>
          </ul>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl p-5 w-full md:w-auto flex flex-col items-center justify-center min-w-[200px] shadow-inner relative group-hover:border-emerald-500/20 transition-colors duration-500">
            <div className="absolute -top-3 -right-3">
              <span className="bg-emerald-500 text-black border border-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                75% Off Promo
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="line-through text-zinc-400/70 text-sm font-medium mb-1">
                $8.00
              </span>
              <span className="text-emerald-500 font-extrabold text-4xl drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]">
                $2.00
              </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UpsellCard;
