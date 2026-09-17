import React from 'react';

const FIELD_BASE_CLASSES =
  "w-full p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-slate-900/80 transition-all duration-300 outline-none text-zinc-100 placeholder-zinc-500 duration-500";
const SELECT_CLASSES = `${FIELD_BASE_CLASSES} bg-slate-900/50 dark:bg-slate-950 text-slate-100`;

const SelectInput = React.memo(({ id, name, value, onChange, options }) => {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={SELECT_CLASSES}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});

export default SelectInput;
