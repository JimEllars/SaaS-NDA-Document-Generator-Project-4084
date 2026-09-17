import React from 'react';

const FIELD_BASE_CLASSES =
  "w-full p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-slate-900/80 transition-all duration-300 outline-none text-zinc-100 placeholder-zinc-500 duration-500";
const INPUT_CLASSES = `${FIELD_BASE_CLASSES} transition-all`;

const TextInput = React.memo(({ id, name, value, onChange, placeholder, disabled, type = "text", ariaInvalid }) => {
  return (
    <input
      id={id}
      aria-invalid={ariaInvalid}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className={INPUT_CLASSES}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
});

export default TextInput;
