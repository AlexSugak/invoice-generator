'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGenerateInvoicePdf } from './_lib/useGeneratePdf';
import { useDraftDetails } from './_lib/useDraftDetails';
import { useSession } from 'next-auth/react';
import { useSaveDraft } from './_lib/useSaveDraft';
import { getLogger } from '@invoice/common';
import { useAllDrafts } from '@/app/invoice/_lib/useAllDrafts';

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
              value={invoice.invoiceNumber}
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
          value={item.description}
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
export default function InvoicePage() {
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: '1',
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
  });

  // (Optional) expose totals via memo if you want to send elsewhere / save
  const totals = useMemo(() => {
    const subtotal = money(
      invoice.items.reduce((s, i) => s + i.quantity * i.rate, 0),
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
    });
  };

  const { data: session } = useSession();
  const { data: savedDraft } = useDraftDetails({
    userName: session?.user?.email || '',
    enabled: !!session?.user?.email,
  });

  // logger.debug('draft', savedDraft);
  useEffect(() => {
    logger.debug('setInvoice effect', { savedDraft });
    const draft = JSON.parse((savedDraft as any as string) || '{}');
    if (draft.params) {
      logger.debug('setInvoice with ', draft.params);
      setInvoice(draft.params as Invoice);
    }
  }, [savedDraft]);

  const { mutate: saveDraft } = useSaveDraft(session?.user?.email || '', invoice?.billTo?.name);
  const { data: allDrafts } = useAllDrafts({userName: session?.user?.email || '', enabled: !!session?.user?.email});

  const handleSaveDraft = () => {
    saveDraft(invoice);
  };

  if (isError) {
    console.error('failed to generate PDF', error);
  }
  return (

    <main className="flex">
      <div className='mx-auto max-w-6xl px-4 py-8'>
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

        <div className="pt-2 w-full flex justify-end gap-1">
          <button
            className="cursor-pointer inline-flex items-center justify-center rounded-md border border-emerald-600 px-5 py-3 text-base font-semibold hover:border-emerald-700"
            onClick={handleSaveDraft}
            disabled={isPending}
          >
            Save draft
          </button>
          <button
            className="cursor-pointer inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 text-base font-semibold text-white hover:bg-emerald-700"
            onClick={handleGeneratePdf}
            disabled={isPending}
          >
            Create Invoice PDF
          </button>
        </div>
      </div>
      <div className='flex flex-col py-8 '>
        <h2 className="text-4xl font-semibold tracking-wide">Drafts</h2>
        {allDrafts?.map(({ name, params }) => (
          <div key={name} className='flex justify-between border border-gray-300 m-2 rounded-md min-w-[200px] cursor-pointer'>
            <button className='text-left cursor-pointer h-full w-full p-2' onClick={() => setInvoice(params)}>
              <h4>{name}</h4>
            </button>
            <button className='text-red-600 hover:text-red-800 cursor-pointer' title='Delete draft'>
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 100 100">
                <path
                  fill='currentColor'
                  d="M 46 13 C 44.35503 13 43 14.35503 43 16 L 43 18 L 32.265625 18 C 30.510922 18 28.879517 18.922811 27.976562 20.427734 L 26.433594 23 L 23 23 C 20.802666 23 19 24.802666 19 27 C 19 29.197334 20.802666 31 23 31 L 24.074219 31 L 27.648438 77.458984 C 27.88773 80.575775 30.504529 83 33.630859 83 L 66.369141 83 C 69.495471 83 72.11227 80.575775 72.351562 77.458984 L 75.925781 31 L 77 31 C 79.197334 31 81 29.197334 81 27 C 81 24.802666 79.197334 23 77 23 L 73.566406 23 L 72.023438 20.427734 C 71.120481 18.922811 69.489078 18 67.734375 18 L 57 18 L 57 16 C 57 14.35503 55.64497 13 54 13 L 46 13 z M 46 15 L 54 15 C 54.56503 15 55 15.43497 55 16 L 55 18 L 45 18 L 45 16 C 45 15.43497 45.43497 15 46 15 z M 32.265625 20 L 43.832031 20 A 1.0001 1.0001 0 0 0 44.158203 20 L 55.832031 20 A 1.0001 1.0001 0 0 0 56.158203 20 L 67.734375 20 C 68.789672 20 69.763595 20.551955 70.306641 21.457031 L 71.833984 24 L 68.5 24 A 0.50005 0.50005 0 1 0 68.5 25 L 73.5 25 L 77 25 C 78.116666 25 79 25.883334 79 27 C 79 28.116666 78.116666 29 77 29 L 23 29 C 21.883334 29 21 28.116666 21 27 C 21 25.883334 21.883334 25 23 25 L 27 25 L 61.5 25 A 0.50005 0.50005 0 1 0 61.5 24 L 28.166016 24 L 29.693359 21.457031 C 30.236405 20.551955 31.210328 20 32.265625 20 z M 64.5 24 A 0.50005 0.50005 0 1 0 64.5 25 L 66.5 25 A 0.50005 0.50005 0 1 0 66.5 24 L 64.5 24 z M 26.078125 31 L 73.921875 31 L 70.357422 77.306641 C 70.196715 79.39985 68.46881 81 66.369141 81 L 33.630859 81 C 31.53119 81 29.803285 79.39985 29.642578 77.306641 L 26.078125 31 z M 38 35 C 36.348906 35 35 36.348906 35 38 L 35 73 C 35 74.651094 36.348906 76 38 76 C 39.651094 76 41 74.651094 41 73 L 41 38 C 41 36.348906 39.651094 35 38 35 z M 50 35 C 48.348906 35 47 36.348906 47 38 L 47 73 C 47 74.651094 48.348906 76 50 76 C 51.651094 76 53 74.651094 53 73 L 53 69.5 A 0.50005 0.50005 0 1 0 52 69.5 L 52 73 C 52 74.110906 51.110906 75 50 75 C 48.889094 75 48 74.110906 48 73 L 48 38 C 48 36.889094 48.889094 36 50 36 C 51.110906 36 52 36.889094 52 38 L 52 63.5 A 0.50005 0.50005 0 1 0 53 63.5 L 53 38 C 53 36.348906 51.651094 35 50 35 z M 62 35 C 60.348906 35 59 36.348906 59 38 L 59 39.5 A 0.50005 0.50005 0 1 0 60 39.5 L 60 38 C 60 36.889094 60.889094 36 62 36 C 63.110906 36 64 36.889094 64 38 L 64 73 C 64 74.110906 63.110906 75 62 75 C 60.889094 75 60 74.110906 60 73 L 60 47.5 A 0.50005 0.50005 0 1 0 59 47.5 L 59 73 C 59 74.651094 60.348906 76 62 76 C 63.651094 76 65 74.651094 65 73 L 65 38 C 65 36.348906 63.651094 35 62 35 z M 38 36 C 39.110906 36 40 36.889094 40 38 L 40 73 C 40 74.110906 39.110906 75 38 75 C 36.889094 75 36 74.110906 36 73 L 36 38 C 36 36.889094 36.889094 36 38 36 z M 59.492188 41.992188 A 0.50005 0.50005 0 0 0 59 42.5 L 59 44.5 A 0.50005 0.50005 0 1 0 60 44.5 L 60 42.5 A 0.50005 0.50005 0 0 0 59.492188 41.992188 z"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </main>

  )
    ;
}
