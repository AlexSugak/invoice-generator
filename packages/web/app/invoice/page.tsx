'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGenerateInvoicePdf } from './_lib/useGeneratePdf';
import { useDraftDetails } from './_lib/useDraftDetails';
import { useSession } from 'next-auth/react';
import { useSaveDraft } from './_lib/useSaveDraft';
import { getLogger } from '@invoice/common';
import { Invoice, InvoiceHeader } from './components/InvoiceHeader';
import { money } from './helpers/money';
import { currencyFormatter } from './helpers/currencyFormatter';
import { Addresses } from './components/Addresses';
import { LineItems } from './components/LineItems';
import { Extras } from './components/Extras';
import { SubTotal } from './components/SubTotal';
import { Input } from './components/Input';
import { useSearchParams } from 'next/navigation';

const logger = getLogger('invoice editor');

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

  const searchParams = useSearchParams();
  const draftParam = searchParams.get('draft');

  const [draftName, setDraftName] = useState<string>(draftParam ?? '');

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
    generatePdf(invoice, {
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
    enabled: !!session?.user?.email && !!draftName,
    draftName,
  });

  // logger.debug('draft', savedDraft);
  useEffect(() => {
    logger.debug('setInvoice effect', { savedDraft });
    if (savedDraft && typeof savedDraft === 'object') {
      if ('params' in savedDraft) {
        logger.debug('setInvoice with ', savedDraft.params);
        setInvoice(savedDraft.params as Invoice);
      }
    } else {
      try {
        const draft = JSON.parse((savedDraft as any as string) || '{}');
        if (draft.params) {
          logger.debug('setInvoice with ', draft.params);
          setInvoice(draft.params as Invoice);
        }
      } catch (error) {
        logger.debug('Failed to parse draft data', error);
      }
    }
  }, [savedDraft]);

  useEffect(() => {
    if (draftParam && draftParam !== draftName) {
      setDraftName(draftParam);
    }
  }, [draftParam, draftName]);

  const { mutate: saveDraft } = useSaveDraft({
    userName: session?.user?.email || '',
    draftName,
  });

  const saveDraftAndReplaceUrl = (invoice: Invoice) => {
    if (!session?.user?.email) {
      logger.error('Cannot save draft, user email is not available');
      return;
    }
    saveDraft(invoice);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('draft', draftName);
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }

  useEffect(() => {
    return () =>  saveDraft(invoice);;
  }, [invoice]);

  if (isError) {
    console.error('failed to generate PDF', error);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="pt-2 w-full flex justify-start my-4">
        <div className="flex items-center gap-2 me-2">
          <Input
            label="Draft Name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
        </div>

        <button
          className="cursor-pointer inline-flex items-center justify-center rounded-md bg-emerald-600 px-2 py-1 text-base font-semibold text-white hover:bg-emerald-700"
          onClick={() => saveDraftAndReplaceUrl(invoice)}
          disabled={isPending}
        >
          Save Invoice Draft as: {draftName}
        </button>
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
          className="cursor-pointer inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 text-base font-semibold text-white hover:bg-emerald-700"
          onClick={handleGeneratePdf}
          disabled={isPending}
        >
          Create Invoice PDF
        </button>
      </div>
    </main>
  );
}
