'use client';

import {
  DraftDetails,
  getDraftsByUser,
} from '@/app/drafts/_lib/getDraftsByUser';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DraftListPage() {
  const { data: session } = useSession();
  const userName = session?.user?.email || '';

  const {
    data: drafts = [],
    isLoading,
    error,
  } = getDraftsByUser({ userName: userName, enabled: !!userName });

  if (isLoading) return <div className="p-6">Loading drafts...</div>;
  if (error)
    return <div className="p-6 text-red-500">Failed to load drafts</div>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Your Drafts</h1>

      {drafts.length === 0 ? (
        <p className="text-gray-500">
          No drafts yet. Start by creating an invoice.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 border rounded-md">
          {drafts?.map((draft: DraftDetails) => (
            <li
              key={draft.name}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <div className="font-medium">{draft.name}</div>
                {draft.updatedAt && (
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(draft.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
              <Link
                href={`/invoice?draft=${encodeURIComponent(draft.name)}`}
                className="text-emerald-600 hover:underline text-sm"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
