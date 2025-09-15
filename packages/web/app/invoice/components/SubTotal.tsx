import React, { useMemo } from "react";
import { currencyFormatter } from "../helpers/currencyFormatter";
import { money } from "../helpers/money";
import { Input } from "./Input";
import { Invoice } from "./InvoiceHeader";

export function SubTotal({
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
        <span className="font-medium">{subtotal}</span>
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