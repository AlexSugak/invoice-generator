'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useDrafts } from './_lib/useDrafts';
import Link from 'next/link';

export default function DraftsPage() {
  const { data: session } = useSession();
  const {
    data: drafts,
    isLoading,
    error,
  } = useDrafts({
    userName: session?.user?.email || '',
    enabled: !!session?.user?.email,
  });

  if (!session?.user?.email) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Drafts</h1>
          <p className="text-gray-600">Please sign in to view your drafts.</p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Drafts</h1>
          <div className="animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Drafts</h1>
          <p className="text-red-600">
            Error loading drafts. Please try again.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Drafts</h1>
        <p className="text-gray-600 mt-2">Manage your saved invoice drafts</p>
      </div>

      {!drafts || drafts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No drafts yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start creating your first invoice draft to see it here.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create New Draft
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <Link
              href={`/invoice?draft=${draft.name}`}
              key={draft.name}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {draft.name}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {draft.params && typeof draft.params === 'object' && (
                      <>
                        {(draft.params as any).invoiceNumber && (
                          <p>
                            Invoice #: {(draft.params as any).invoiceNumber}
                          </p>
                        )}
                        {(draft.params as any).date && (
                          <p>Date: {(draft.params as any).date}</p>
                        )}
                        {(draft.params as any).from?.name && (
                          <p>From: {(draft.params as any).from.name}</p>
                        )}
                        {(draft.params as any).billTo?.name && (
                          <p>To: {(draft.params as any).billTo.name}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm font-medium">
                    Edit
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm font-medium">
                    Duplicate
                  </button>
                  <button className="text-red-600 hover:text-red-800 px-3 py-1 text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    Draft
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
