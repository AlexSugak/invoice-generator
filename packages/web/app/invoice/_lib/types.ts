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
  rate: number;
};

export type Invoice = {
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
  taxPercent: number;
  discount: number;
  shipping: number;
  amountPaid: number;
  currency: string;
};
