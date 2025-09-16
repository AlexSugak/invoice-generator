import { Invoice } from '@/app/invoice/_lib/types';

import { DraftDetails } from '@/app/drafts/_lib/getDraftsByUser';

export function getDraftName(
  draft: DraftDetails | { draftName: string; params: any },
) {
  return 'name' in draft ? draft.name : draft.draftName;
}

export function getEmptyInvoice(): Invoice {
  return {
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
  };
}

export function normalizeInvoice(raw: any): Invoice {
  const data = raw?.params ?? raw;
  return {
    invoiceNumber: data.invoiceNumber || '1',
    date: data.date || '',
    paymentTerms: data.paymentTerms || '',
    dueDate: data.dueDate || '',
    poNumber: data.poNumber || '',
    from: data.from || { name: '' },
    billTo: data.billTo ?? { name: '' },
    shipTo: data.shipTo ?? { name: '' },
    items: data.items ?? [
      { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 },
    ],
    notes: data.notes || '',
    terms: data.terms || '',
    taxPercent: data.taxPercent ?? 0,
    discount: data.discount ?? 0,
    shipping: data.shipping ?? 0,
    amountPaid: data.amountPaid ?? 0,
    currency: data.currency || 'USD',
  };
}
