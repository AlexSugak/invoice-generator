'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useDrafts } from './_lib/useDrafts';

// Local types to make the component self-descriptive
interface Party {
  name?: string;
}

interface DraftParams {
  invoiceNumber?: string;
  date?: string;
  from?: Party;
  billTo?: Party;
  [key: string]: unknown;
}

interface DraftSummary {
  name: string;
  params?: DraftParams | null;
}

function SignedOutState() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="text-center py-14">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Saved Drafts</h1>
        <p className="text-gray-600">Sign in to access your invoice drafts.</p>
      </section>
    </main>
  );
}

function LoadingList() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="text-center py-14">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Saved Drafts</h1>
        <div className="animate-pulse space-y-4 text-left">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-gray-200/70 h-24 rounded-lg" />
          ))}
        </div>
      </section>
    </main>
  );
}

function ErrorState() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="text-center py-14">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Saved Drafts</h1>
        <p className="text-red-600">We couldn’t load your drafts. Please retry in a moment.</p>
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4" aria-hidden>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">No drafts on file</h3>
      <p className="text-gray-600 mb-6">Create an invoice draft to get started.</p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        New Draft
      </button>
    </div>
  );
}

function DraftCard({ draft }: { draft: DraftSummary }) {
  const p = draft.params ?? {};
  const fromName = (p as DraftParams).from?.name;
  const toName = (p as DraftParams).billTo?.name;

  return (
    <Link
      href={`/invoice?draft=${draft.name}`}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer block"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{draft.name}</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {(p as DraftParams).invoiceNumber && (
              <li>Invoice #: {(p as DraftParams).invoiceNumber}</li>
            )}
            {(p as DraftParams).date && <li>Date: {(p as DraftParams).date}</li>}
            {fromName && <li>From: {fromName}</li>}
            {toName && <li>To: {toName}</li>}
          </ul>
        </div>
        <div className="flex flex-shrink-0 space-x-2 ml-4">
          <button className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm font-medium">Edit</button>
          <button className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm font-medium">Duplicate</button>
          <button className="text-red-600 hover:text-red-800 px-3 py-1 text-sm font-medium">Delete</button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded text-xs">Draft</span>
        </div>
      </div>
    </Link>
  );
}

export default function DraftsPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? '';

  const { data: drafts, isLoading, error } = useDrafts({
    userName: userEmail,
    enabled: Boolean(userEmail),
  });

  console.log('DRAFTS', {drafts, userEmail})

  

  if (!userEmail) return <SignedOutState />;
  if (isLoading) return <LoadingList />;
  if (error) return <ErrorState />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Saved Drafts</h1>
        <p className="text-gray-600 mt-2">Review and manage your invoice drafts.</p>
      </header>

      {!drafts || drafts.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="grid gap-4">
          {(drafts as DraftSummary[]).map((d) => (
            <DraftCard key={d.name} draft={d} />
          ))}
        </section>
      )}
    </main>
  );
}