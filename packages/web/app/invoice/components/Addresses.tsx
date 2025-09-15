import { AddressFields } from "./AddressFields";
import { Invoice } from "./InvoiceHeader";

export type Address = {
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

export function Addresses({
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