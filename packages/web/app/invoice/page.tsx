'use client';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Invoice } from '@/app/invoice/_lib/types';
import {
  Addresses,
  Extras,
  InvoiceHeader,
  LineItems,
  SubTotal,
} from '@/app/invoice/components';
import { useGenerateInvoicePdf } from '@/app/invoice/_lib/useGeneratePdf';
import { useSaveDraft } from '@/app/invoice/_lib/useSaveDraft';
import {
  DraftDetails,
  getDraftsByUser,
} from '@/app/drafts/_lib/getDraftsByUser';
import { DraftNameInput } from '@/app/drafts/components/DraftNameInput';
import { useDraftDetails } from '@/app/invoice/_lib/useDraftDetails';
import {
  getDraftName,
  getEmptyInvoice,
  normalizeInvoice,
} from '@/app/invoice/utils/invoiceHelper';

export default function InvoicePage() {
  const searchParams = useSearchParams();
  const draftParam = searchParams.get('draft');
  const { data: session } = useSession();
  const userName = session?.user?.email || '';

  const [draftName, setDraftName] = useState('Untitled');
  const [invoice, setInvoice] = useState<Invoice>(getEmptyInvoice());
  const [currentDraftName, setCurrentDraftName] = useState('Untitled');
  const [isDirty, setIsDirty] = useState(false);

  const firstLoadRef = useRef(true);

  const { data: drafts = [], refetch: refetchDrafts } = getDraftsByUser({
    userName,
    enabled: !!userName,
  });
  const { mutate: saveDraft } = useSaveDraft(userName, draftName);
  const { data: draftDetails } = useDraftDetails({
    userName,
    draftName,
    enabled: !!userName && !!draftName,
  });
  const {
    mutate: generatePdf,
    isPending,
    isError,
    error,
  } = useGenerateInvoicePdf();

  useEffect(() => {
    if (!userName) return;
    if (!drafts.length && !draftDetails) return;
    if (!firstLoadRef.current) return;

    let draftToLoad:
      | DraftDetails
      | { draftName: string; params: any }
      | undefined;

    if (draftParam) {
      draftToLoad = drafts.find((d) => getDraftName(d) === draftParam);
      if (
        !draftToLoad &&
        draftDetails &&
        getDraftName(draftDetails) === draftParam
      ) {
        draftToLoad = draftDetails;
      }
    }

    if (!draftToLoad) {
      draftToLoad =
        drafts.find((d) => getDraftName(d) === draftName) ?? draftDetails;
    }

    if (draftToLoad) {
      const name = getDraftName(draftToLoad);
      setDraftName(name);
      setCurrentDraftName(name);
      setInvoice(normalizeInvoice(draftToLoad.params));
    } else {
      setDraftName('Untitled');
      setCurrentDraftName('Untitled');
      setInvoice(getEmptyInvoice());
    }

    firstLoadRef.current = false;
    setIsDirty(false);
  }, [drafts, draftDetails, draftParam, draftName, userName]);

  useEffect(() => {
    if (!draftName || !userName || !isDirty) return;

    const timeout = setTimeout(() => {
      if (draftName === currentDraftName) {
        saveDraft({ draftName, params: invoice });
        refetchDrafts();
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [invoice, draftName, userName, isDirty, currentDraftName, saveDraft]);

  const handleInvoiceChange: React.Dispatch<React.SetStateAction<Invoice>> = (
    value,
  ) => {
    setInvoice((prev) => {
      const next =
        typeof value === 'function'
          ? (value as (prev: Invoice) => Invoice)(prev)
          : value;
      setIsDirty(true);
      return next;
    });
  };

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

  if (isError) {
    console.error('failed to generate PDF', error);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <DraftNameInput draftName={draftName} setDraftName={setDraftName} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <InvoiceHeader invoice={invoice} setInvoice={handleInvoiceChange} />
        <Addresses invoice={invoice} setInvoice={handleInvoiceChange} />
        <LineItems invoice={invoice} setInvoice={handleInvoiceChange} />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Extras invoice={invoice} setInvoice={handleInvoiceChange} />
          <div className="md:col-start-2">
            <SubTotal invoice={invoice} setInvoice={handleInvoiceChange} />
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
