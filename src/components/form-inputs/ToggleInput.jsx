import React from 'react';

const ToggleInput = React.memo(({ id, name, checked, onChange, label, disabled }) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-black/50 border border-white/10 rounded-xl mt-3">
      <input
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-axim-teal focus:ring-axim-teal focus:ring-offset-zinc-900 transition-colors"
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className="text-sm font-bold text-zinc-300 select-none cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
});

export default ToggleInput;
