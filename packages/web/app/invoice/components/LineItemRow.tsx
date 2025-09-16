import { useMemo } from "react";
import { money } from "../helpers/money";
import { LineItem } from "./LineItems";
import { currencyFormatter } from "../helpers/currencyFormatter";
import { Input } from "./Input";

export function LineItemRow({
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
          {lineTotal}
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