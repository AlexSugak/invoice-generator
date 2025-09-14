'use client';

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  labelRight?: React.ReactNode;
};

function Input({
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

type SaveDraftModalProps = {
  isOpen: boolean;
  draftName: string;
  onDraftNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
};

export function SaveDraftModal({
  isOpen,
  draftName,
  onDraftNameChange,
  onSave,
  onCancel,
  isSaving,
}: SaveDraftModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Save as draft?</h3>
        <Input
          label="Draft name"
          placeholder="Enter a name for this draft..."
          value={draftName}
          onChange={(e) => onDraftNameChange(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onSave}
            disabled={isSaving || !draftName.trim()}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}