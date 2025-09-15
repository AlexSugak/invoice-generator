export type DraftsListItem = {
  id: number;
  name: string;
};

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

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number; // price per unit
};

export type BasicInvoiceInfo = {
  invoiceName: string;
  [key: string]: unknown;
};

export type Invoice = BasicInvoiceInfo & {
  invoiceNumber: string;
  date?: string;
  paymentTerms?: string;
  dueDate?: string;
  poNumber?: string;

  from: Address;
  billTo: Address;
  shipTo: Address;

  items: LineItem[];

  notes?: string;
  terms?: string;

  taxPercent: number; // e.g. 19 for 19%
  discount: number; // flat amount
  shipping: number; // flat amount
  amountPaid: number; // already paid
  currency: string;
};
