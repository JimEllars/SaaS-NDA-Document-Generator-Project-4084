import React from 'react';

const TOGGLE_BUTTON_BASE_CLASSES = "flex-1 py-3 text-sm font-bold rounded-lg transition";

const ButtonGroup = React.memo(({ name, value, options, onChange, disabled }) => {
  return (
    <div className="flex gap-2 p-1 bg-black/50 border border-white/10 rounded-xl relative">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`${TOGGLE_BUTTON_BASE_CLASSES} relative z-10 ${
              isSelected ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-200"
            }`}
            onClick={() => onChange({ target: { name, value: opt.value } })}
            disabled={disabled}
          >
            {isSelected && (
              <div className="absolute inset-0 bg-axim-teal rounded-lg shadow-lg -z-10 transition-all duration-300"></div>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
});

export default ButtonGroup;
