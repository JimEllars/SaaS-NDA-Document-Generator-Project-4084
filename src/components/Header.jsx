import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiShield, FiTrash2 } = FiIcons;

const Header = ({ isPaid, onClear, onStartOver }) => {
  return (
    <div className="max-w-3xl w-full flex justify-between items-center mb-8 no-print">
      <div>
        <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
          <SafeIcon icon={FiShield} className="text-blue-600" size={32} />
          AXiM NDA Generator
        </h1>
        <p className="text-slate-600 font-medium mt-1">Professional Legal Document Builder</p>
      </div>
      {!isPaid && (
        <button
          onClick={onClear}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-red-500 transition px-3 py-2 rounded-lg hover:bg-red-50"
        >
          <SafeIcon icon={FiTrash2} size={16} /> Reset
        </button>
      )}
      {isPaid && (
        <button
          onClick={onStartOver}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition px-3 py-2 rounded-lg hover:bg-blue-50"
        >
           Start Over
        </button>
      )}
    </div>
  );
};

export default Header;
