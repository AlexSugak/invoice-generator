import { Dispatch } from "react";
import { Invoice } from "./InvoiceHeader";
import { Section } from "./Section";
import { LineItemRow } from "./LineItemRow";

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number; // price per unit
};

export function LineItems({
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