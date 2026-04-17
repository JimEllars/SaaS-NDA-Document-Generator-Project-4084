import React from 'react';
import { FiShield, FiTrash2 } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Header = React.memo(({ isPaid, onClear, onStartOver }) => {
  return (
    <div className="max-w-3xl w-full flex justify-between items-center mb-8 no-print">
      <div>
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
  );
}, (prevProps, nextProps) => {
  return prevProps.isPaid === nextProps.isPaid;
});

export default Header;
