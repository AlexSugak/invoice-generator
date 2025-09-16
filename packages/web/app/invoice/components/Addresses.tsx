import { Invoice } from '@/app/invoice/_lib/types';
import { AddressFields } from '@/app/invoice/components/index';

export default function Addresses({ invoice, setInvoice }: { invoice: Invoice; setInvoice: React.Dispatch<React.SetStateAction<Invoice>> }) {
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
