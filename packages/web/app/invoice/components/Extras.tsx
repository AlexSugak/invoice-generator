import { Invoice } from "./InvoiceHeader";
import { TextArea } from "./TextArea";

export function Extras({
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