import React from 'react';
import Input from './Input';
import { Invoice } from '@/app/invoice/_lib/types';

export default function InvoiceHeader({
  invoice,
  setInvoice,
}: {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
