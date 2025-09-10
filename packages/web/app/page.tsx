import { getLogger } from '@invoice/common';
import Link from 'next/link';

const logger = getLogger('home');

export default function Home() {
  logger.debug('rendering home');

  return (
    <div className="flex flex-col flex-1 mx-auto max-w-7xl px-4">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Simple. Fast. Free.
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Create professional invoices in seconds
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Fill in your details, add line items, and download a polished PDF.
              No sign-up required. Tailored for freelancers, makers, and small
              teams.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/invoice"
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 text-base font-semibold text-white hover:bg-emerald-700"
              >
                Create Invoice PDF
              </Link>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Works right in your browser • Exports to print-ready PDF
            </p>
          </div>

          {/* Illustration placeholder */}
          {/* <div className="hidden md:block">
            <div className="h-64 w-full rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
              <div className="h-full w-full rounded-lg border-2 border-dashed border-gray-300" />
            </div>
            <p className="mt-3 text-center text-xs text-gray-400">
              invoice editor
            </p>
          </div> */}
        </div>
      </section>

      {/* Tiny features row */}
      <section className="grid gap-6 border-t border-gray-200 py-10 sm:grid-cols-3">
        <Feature
          title="Fast Editor"
          desc="Inline editing with totals auto-calculated."
        />
        <Feature title="PDF Export" desc="Print-ready PDFs with one click." />
        <Feature
          title="No Sign-Up"
          desc="Use it immediately—no account needed."
        />
      </section>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-gray-600">{desc}</div>
    </div>
  );
}
