'use client';
import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  labelRight?: React.ReactNode;
};

export default function Input({
  label,
  hint,
  prefix,
  suffix,
  className,
  labelRight,
  ...rest
}: InputProps) {
  return (
    <label className="block">
      {label && (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {labelRight}
        </div>
      )}
      <div
        className={`flex items-center rounded-md border border-gray-300 bg-white ${className ?? ''}`}
      >
        {prefix && <span className="px-2 text-gray-500">{prefix}</span>}
        <input
          {...rest}
          className="w-full rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {suffix && <span className="px-2 text-gray-500">{suffix}</span>}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </label>
  );
}
