import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
import Puppeteer from 'puppeteer';
import { DatabaseService } from '../db.service';

Handlebars.registerHelper('times', (a: any, b: any) => {
  const x = Number(a) || 0,
    y = Number(b) || 0;
  return x * y;
});

Handlebars.registerHelper(
  'subtotal',
  (items: Array<{ quantity: number; rate: number }>) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce(
      (s, it) => s + (Number(it.quantity) || 0) * (Number(it.rate) || 0),
      0,
    );
  },
);

Handlebars.registerHelper('tax', (subtotal: any, percent: any) => {
  const s = Number(subtotal) || 0,
    p = Number(percent) || 0;
  return (s * p) / 100;
});

Handlebars.registerHelper(
  'total',
  (subtotal: any, taxPercent: any, discount: any, shipping: any) => {
    const s = Number(subtotal) || 0;
    const t = (s * (Number(taxPercent) || 0)) / 100;
    const d = Number(discount) || 0;
    const sh = Number(shipping) || 0;
    return s + t - d + sh;
  },
);

Handlebars.registerHelper('balance', (total: any, paid: any) => {
  const t = Number(total) || 0,
    p = Number(paid) || 0;
  return t - p;
});

Handlebars.registerHelper('currency', (currencyCode: string, amount: any) => {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode || 'USD',
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currencyCode || 'USD'} ${n.toFixed(2)}`;
  }
});

Handlebars.registerHelper('formatDate', (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d);
});

@Injectable()
export class PdfService {
  constructor(private readonly db: DatabaseService) {}

  async generatePdf(
    templateName: string,
    params: object,
  ): Promise<Uint8Array<ArrayBufferLike>> {
    const template = await this.readTemplate(templateName);

    const compile = Handlebars.compile(template, { noEscape: true });
    const html = compile(params);
    const pdf = await generatePDFfromHTML(html);
    return pdf;
  }

  async readTemplate(templateName: string): Promise<string> {
    const [{ body }] = await this.db.Sql()<Array<{ body: string }>>`
      SELECT body 
      FROM templates 
      WHERE name = ${templateName} 
    `;

    if (!body) {
      throw new Error('Template not found: ' + templateName);
    }

    return body;
  }
}

async function generatePDFfromHTML(
  htmlContent: string,
): Promise<Uint8Array<ArrayBufferLike>> {
  const browser = await Puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  // Return the PDF as a Buffer
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  return pdfBuffer;
}
