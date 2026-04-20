import React from 'react';
import { FiShield } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const UpsellCard = () => {
  return (
    <div className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-5 mb-6 flex flex-col md:flex-row items-center gap-4 shadow-[0_0_15px_rgba(147,51,234,0.2)]">
      <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
        <SafeIcon icon={FiShield} size={24} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-zinc-200 leading-relaxed font-medium">
          <strong className="text-purple-300">High-Stakes Agreement Detected:</strong> Because you selected enhanced penalties, we highly recommend a legal review.
        </p>
      </div>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="whitespace-nowrap bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition shadow-lg"
      >
        Book a Consultation via AXiM Hub
      </a>
    </div>
  );
};

export default UpsellCard;
