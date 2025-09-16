import React from 'react';
import Input from './Input';
import { Address } from '@/app/invoice/_lib/types';

export default function AddressFields({
  title,
  value,
  onChange,
  optionalNote,
  placeholderName,
}: {
  title: string;
  value: Address;
  onChange: (a: Address) => void;
  optionalNote?: string;
  placeholderName?: string;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-gray-700">{title}</div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          placeholder={placeholderName ?? 'Name / Company'}
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          hint={optionalNote}
        />
        <Input
          placeholder="Address line 1"
          value={value.line1 ?? ''}
          onChange={(e) => onChange({ ...value, line1: e.target.value })}
        />
        <Input
          placeholder="Address line 2"
          value={value.line2 ?? ''}
          onChange={(e) => onChange({ ...value, line2: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="City"
            value={value.city ?? ''}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
          />
          <Input
            placeholder="State"
            value={value.state ?? ''}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
          />
          <Input
            placeholder="ZIP"
            value={value.zip ?? ''}
            onChange={(e) => onChange({ ...value, zip: e.target.value })}
          />
        </div>
        <Input
          placeholder="Country"
          value={value.country ?? ''}
          onChange={(e) => onChange({ ...value, country: e.target.value })}
        />
        <Input
          placeholder="Email"
          type="email"
          value={value.email ?? ''}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
        />
        <Input
          placeholder="Phone"
          value={value.phone ?? ''}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
      </div>
    </div>
  );
}
