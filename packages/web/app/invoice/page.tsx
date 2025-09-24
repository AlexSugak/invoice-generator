'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGenerateInvoicePdf } from './_lib/useGeneratePdf';
import { useDeleteDraft, useDraftDetails } from './_lib/useDraftDetails';
import { useSession } from 'next-auth/react';
import { useSaveDraft } from './_lib/useSaveDraft';
import { getLogger } from '@invoice/common';
import { toast } from 'react-toastify';
import { useDraftsList } from './_lib/useDraftsList';

const logger = getLogger('invoice editor');

/* =========================
 * Types
 * ========================= */
type Address = {
  name: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  email?: string;
  phone?: string;
};

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number; // price per unit
};

type Invoice = {
  invoiceNumber: string;
  date?: string;
  paymentTerms?: string;
  dueDate?: string;
  poNumber?: string;

  from: Address;
  billTo: Address;
  shipTo: Address;

  items: LineItem[];

  notes?: string;
  terms?: string;

  taxPercent: number; // e.g. 19 for 19%
  discount: number; // flat amount
  shipping: number; // flat amount
  amountPaid: number; // already paid
  currency: string;
};

/* =========================
 * Helpers
 * ========================= */
const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });

function money(n: number) {
  if (!isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

/* =========================
 * Primitives
 * ========================= */
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

function TextArea({
  label,
  rows = 3,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="rounded-t-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
        {title}
      </div>
      <div className="rounded-b-md border border-slate-900/10 p-4">
        {children}
      </div>
    </div>
  );
}

/* =========================
 * Header & meta
 * ========================= */
function InvoiceHeader({
  invoice,
  setInvoice,
}: {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Big 'INVOICE' + number */}
      <div className="col-span-2 md:col-span-2">
        <div className="flex items-start">
          <h1 className="text-4xl font-semibold tracking-wide">INVOICE</h1>
          <div className="flex items-center gap-2 pl-2">
            <Input
              name="invoiceNumber"
              prefix="#"
              value={invoice.invoiceNumber || ''}
              onChange={(e) =>
                setInvoice((v) => ({ ...v, invoiceNumber: e.target.value }))
              }
              className="w-40"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Input
            label="Date"
            type="date"
            value={invoice.date ?? ''}
            onChange={(e) =>
              setInvoice((v) => ({ ...v, date: e.target.value }))
            }
          />
          <Input
            label="Payment Terms"
            placeholder="e.g., Net 30"
            value={invoice.paymentTerms ?? ''}
            onChange={(e) =>
              setInvoice((v) => ({ ...v, paymentTerms: e.target.value }))
            }
          />
          <Input
            label="Due Date"
            type="date"
            value={invoice.dueDate ?? ''}
            onChange={(e) =>
              setInvoice((v) => ({ ...v, dueDate: e.target.value }))
            }
          />
          <Input
            label="PO Number"
            value={invoice.poNumber ?? ''}
            onChange={(e) =>
              setInvoice((v) => ({ ...v, poNumber: e.target.value }))
            }
          />
        </div>
      </div>
    </div>
  );
}

/* =========================
 * Addresses
 * ========================= */
function AddressFields({
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
          value={value.name || ''}
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

function Addresses({
  invoice,
  setInvoice,
}: {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      <AddressFields
        title="Bill To"
        placeholderName="Who is this to?"
        value={invoice.billTo}
        onChange={(billTo) => setInvoice((v) => ({ ...v, billTo }))}
      />
      <AddressFields
        title="Ship To"
        placeholderName="(optional)"
        value={invoice.shipTo}
        onChange={(shipTo) => setInvoice((v) => ({ ...v, shipTo }))}
      />
    </div>
  );
}

/* =========================
 * Line Items
 * ========================= */
function LineItemRow({
  item,
  onChange,
  onRemove,
  currency,
}: {
  item: LineItem;
  onChange: (item: LineItem) => void;
  onRemove: () => void;
  currency: string;
}) {
  const lineTotal = useMemo(
    () => money(item.quantity * item.rate),
    [item.quantity, item.rate],
  );
  const fmt = useMemo(() => currencyFormatter(currency), [currency]);

  return (
    <div className="grid grid-cols-12 items-center gap-2">
      <div className="col-span-12 md:col-span-6">
        <Input
          placeholder="Description of item/service..."
          value={item.description || ''}
          label="Description"
          onChange={(e) => onChange({ ...item, description: e.target.value })}
        />
      </div>
      <div className="col-span-4 md:col-span-2">
        <Input
          type="number"
          step="1"
          min="0"
          label="Quantity"
          value={String(item.quantity)}
          onChange={(e) =>
            onChange({ ...item, quantity: Number(e.target.value || 0) })
          }
        />
      </div>
      <div className="col-span-4 md:col-span-2">
        <Input
          type="number"
          name="rate"
          step="0.01"
          min="0"
          label="Rate"
          prefix="$"
          value={String(item.rate)}
          onChange={(e) =>
            onChange({ ...item, rate: Number(e.target.value || 0) })
          }
        />
      </div>
      <div className="col-span-4 md:col-span-2">
        <div className="text-sm font-medium text-gray-700">Amount</div>
        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          {fmt.format(lineTotal)}
        </div>
      </div>

      <div className="col-span-12 -mt-1 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-600 hover:underline"
          aria-label="Remove line item"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function LineItems({
  invoice,
  setInvoice,
}: {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
}) {
  const addItem = () =>
    setInvoice((v) => ({
      ...v,
      items: [
        ...v.items,
        { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 },
      ],
    }));

  const updateItem = (id: string, next: LineItem) =>
    setInvoice((v) => ({
      ...v,
      items: v.items.map((i) => (i.id === id ? next : i)),
    }));

  const removeItem = (id: string) =>
    setInvoice((v) => ({ ...v, items: v.items.filter((i) => i.id !== id) }));

  return (
    <Section title="Item">
      <div className="space-y-4">
        {invoice.items.map((item) => (
          <LineItemRow
            key={item.id}
            item={item}
            onChange={(next) => updateItem(item.id, next)}
            onRemove={() => removeItem(item.id)}
            currency={invoice.currency}
          />
        ))}

        <button
          type="button"
          onClick={addItem}
          className="rounded-md border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          + Line Item
        </button>
      </div>
    </Section>
  );
}

/* =========================
 * Totals (right column)
 * ========================= */
function SubTotal({
  invoice,
  setInvoice,
}: {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
}) {
  const fmt = useMemo(
    () => currencyFormatter(invoice.currency),
    [invoice.currency],
  );

  const subtotal = useMemo(
    () => money(invoice.items.reduce((sum, i) => sum + i.quantity * i.rate, 0)),
    [invoice.items],
  );

  const tax = useMemo(
    () => money((subtotal * (invoice.taxPercent || 0)) / 100),
    [subtotal, invoice.taxPercent],
  );
  const total = useMemo(
    () =>
      money(subtotal + tax - (invoice.discount || 0) + (invoice.shipping || 0)),
    [subtotal, tax, invoice.discount, invoice.shipping],
  );
  const balanceDue = useMemo(
    () => money(total - (invoice.amountPaid || 0)),
    [total, invoice.amountPaid],
  );

  return (
    <div className="rounded-md border border-gray-200 p-4">
      <div className="flex items-center justify-between py-1 text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium">{fmt.format(subtotal)}</span>
      </div>

      <div className="mt-2 grid grid-cols-3 items-end gap-2">
        <Input
          label="Tax"
          type="number"
          step="0.01"
          min="0"
          value={String(invoice.taxPercent)}
          onChange={(e) =>
            setInvoice((v) => ({
              ...v,
              taxPercent: Number(e.target.value || 0),
            }))
          }
          suffix="%"
        />
        <Input
          label="Discount"
          type="number"
          step="0.01"
          min="0"
          value={String(invoice.discount)}
          onChange={(e) =>
            setInvoice((v) => ({ ...v, discount: Number(e.target.value || 0) }))
          }
          prefix="$"
        />
        <Input
          label="Shipping"
          type="number"
          step="0.01"
          min="0"
          value={String(invoice.shipping)}
          onChange={(e) =>
            setInvoice((v) => ({ ...v, shipping: Number(e.target.value || 0) }))
          }
          prefix="$"
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
        <span className="text-base font-semibold">Total</span>
        <span className="text-base font-semibold">{fmt.format(total)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 items-end gap-2">
        <Input
          label="Amount Paid"
          type="number"
          step="0.01"
          min="0"
          value={String(invoice.amountPaid)}
          onChange={(e) =>
            setInvoice((v) => ({
              ...v,
              amountPaid: Number(e.target.value || 0),
            }))
          }
          prefix="$"
        />
        <div>
          <div className="text-sm font-medium text-gray-700">Balance Due</div>
          <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-right text-lg font-semibold">
            {fmt.format(balanceDue)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
 * Notes & Terms
 * ========================= */
function Extras({
  invoice,
  setInvoice,
}: {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <TextArea
        label="Notes"
        name='notes'
        placeholder="Notes - any relevant information not already covered"
        value={invoice.notes ?? ''}
        onChange={(e) => setInvoice((v) => ({ ...v, notes: e.target.value }))}
        rows={5}
      />
      <TextArea
        label="Terms"
        placeholder="Terms and conditions - late fees, payment methods, delivery schedule"
        value={invoice.terms ?? ''}
        onChange={(e) => setInvoice((v) => ({ ...v, terms: e.target.value }))}
        rows={5}
      />
    </div>
  );
}

/* =========================
 * Root Page
 * ========================= */
const initialInvoice: Invoice = {
  invoiceNumber: '123',
  date: '',
  paymentTerms: '',
  dueDate: '',
  poNumber: '',
  from: { name: '' },
  billTo: { name: '' },
  shipTo: { name: '' },
  items: [{ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }],
  notes: '',
  terms: '',
  taxPercent: 0,
  discount: 0,
  shipping: 0,
  amountPaid: 0,
  currency: 'USD',
};

export default function InvoicePage() {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);

  const totals = useMemo(() => {
    const subtotal = money(
      invoice.items?.reduce((s, i) => s + i.quantity * i.rate, 0),
    );
    const tax = money((subtotal * (invoice.taxPercent || 0)) / 100);
    const total = money(
      subtotal + tax - (invoice.discount || 0) + (invoice.shipping || 0),
    );
    const balance = money(total - (invoice.amountPaid || 0));
    return { subtotal, tax, total, balance };
  }, [invoice]);

  const fmt = currencyFormatter(invoice.currency);

  const {
    mutate: generatePdf,
    isPending,
    isError,
    error,
  } = useGenerateInvoicePdf();
  const handleGeneratePdf = async () => {
    await generatePdf(invoice, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      onError: (e) => {
        toast('Failed to generate PDF!', { type: 'error' });
      },
    });
  };
  
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userName = session?.user?.email || '';
  
  const [draftName, setDraftName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState('');
  const { data: draftsList } = useDraftsList(userName);
  const { mutate: saveDraft } = useSaveDraft(userName, draftName);
  const { mutate: deleteDraft, isPending: isDeleting } = useDeleteDraft(userName, selectedDraft);
  
  const handleSelectDraft = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === 'new') {
      setInvoice(initialInvoice);
      setSelectedDraft('');
    } else {
      setSelectedDraft(event.target.value);
    }
  };
  
  const handleDeleteDraft = () => {
    logger.info(`Delete draft: ${selectedDraft}`);
    if (selectedDraft) {
      deleteDraft(undefined, {
        onSuccess: () => {
          // Invalidate the drafts list query to refetch after deletion
          queryClient.invalidateQueries({ queryKey: ['get', `/api/users/${userName}/drafts`] });
          setSelectedDraft('');
        }
      });
    }
    setShowModal(false);
    setInvoice(initialInvoice);
  };



  const handleSaveDraft = () => {
    setShowModal(false);
    if (draftName) {
      saveDraft(invoice, {
        onSuccess: () => {
          // Invalidate the drafts list query to refetch after saving
          queryClient.invalidateQueries({ queryKey: ['get', `/api/users/${userName}/drafts`] });
          setSelectedDraft(draftName);
        },
      });
    }
  };


  useEffect(() => {
    if (selectedDraft) {
      const selectedInvoice = draftsList?.find((item) => item.name === selectedDraft);
      if (selectedInvoice?.params) {
        setInvoice(selectedInvoice.params as Invoice);
      } else {
         setInvoice(invoice);
      }
    }
  }, [selectedDraft]);

  if (isError) {
    console.error('failed to generate PDF', error);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="max-w-sm mb-3">
        <label htmlFor="options" className="block mb-2 text-sm font-medium text-gray-700">
          Choose draft:
        </label>
        <select
          id="options"
          name='drafts'
          value={selectedDraft}
          onChange={handleSelectDraft}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">--Choose --</option>
          <option value="new">--New draft--</option>
          {draftsList?.map((item: { name: string }) => (
            <option value={item.name} key={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <InvoiceHeader invoice={invoice} setInvoice={setInvoice} />
        <Addresses invoice={invoice} setInvoice={setInvoice} />
        <LineItems invoice={invoice} setInvoice={setInvoice} />

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Extras invoice={invoice} setInvoice={setInvoice} />
          <div className="md:col-start-2">
            <SubTotal invoice={invoice} setInvoice={setInvoice} />
            <div className="mt-3 text-right text-xs text-gray-500">
              Subtotal: {fmt.format(totals.subtotal)} · Tax:{' '}
              {fmt.format(totals.tax)} · Total: {fmt.format(totals.total)} ·
              Balance Due: {fmt.format(totals.balance)}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 w-full flex justify-end">
        <button
          className="cursor-pointer inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 text-base font-semibold text-white hover:bg-emerald-700 mr-3"
          onClick={() => {
            setShowModal(true);
            setDraftName(selectedDraft || '');
          }}
        >
          Save/Edit current draft
        </button>
        
        <button
          className="cursor-pointer inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 text-base font-semibold text-white hover:bg-emerald-700"
          onClick={handleGeneratePdf}
          disabled={isPending}
        >
          Create Invoice PDF
        </button>
      </div>

      {showModal && (
        <div className="update-modal fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-gray-800/60">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Input
              name="draftName"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="w-full "
              placeholder='Type draft name here...'
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 disabled:opacity-50"
                onClick={handleDeleteDraft}
                disabled={!selectedDraft || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete draft'}
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 "
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded hover:bg-emerald-600"
                onClick={handleSaveDraft}
                disabled={!draftName && !selectedDraft}
              >
                Save draft
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
