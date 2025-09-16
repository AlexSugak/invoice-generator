'use client';
import React from 'react';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export default function TextArea({ label, rows = 3, ...rest }: Props) {
  return (
    <label className="block">
      {label && (
        <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      )}
      <textarea
        rows={rows}
        {...rest}
        className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}
