'use client';

import React, { useState } from 'react';
import { getLogger } from '@invoice/common';
import { useSession } from 'next-auth/react';
import { useDraftList, useDeleteDraft, useRenameDraft, type DraftDetails } from '@/src/hooks/useDrafts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

const logger = getLogger('drafts page');

/* =========================
 * Types
 * ========================= */
type DraftItemProps = {
  draft: DraftDetails;
  onSelect: (draft: DraftDetails) => void;
  onDelete: (draftName: string) => void;
  onRename: (oldName: string, newName: string) => void;
  isSelected: boolean;
};

/* =========================
 * Components
 * ========================= */
function DraftItem({ draft, onSelect, onDelete, onRename, isSelected }: DraftItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(draft.name);

  const handleRename = () => {
    if (newName.trim() && newName !== draft.name) {
      onRename(draft.name, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameBlur = (e: React.FocusEvent) => {
    e.stopPropagation();
    handleRename();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (newName.trim() && newName !== draft.name) {
        onRename(draft.name, newName.trim());
      }
      setIsRenaming(false);
    } else if (e.key === 'Escape') {
      setNewName(draft.name);
      setIsRenaming(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(draft.name);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
  };

  return (
    <div
      className={`rounded-lg border p-4 transition-colors cursor-pointer ${
        isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
      onClick={() => onSelect(draft)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRenameBlur}
              onKeyDown={handleKeyPress}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm font-medium focus:border-emerald-500 focus:outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="text-sm font-medium text-gray-900">
              {draft.name}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRenameClick}
            className="text-xs text-gray-500 hover:text-gray-700 px-1"
            title="Rename"
          >
            Rename
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-red-500 hover:text-red-700 px-1"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {draft.params?.invoiceNumber ? `Invoice #${draft.params.invoiceNumber}` : 'No invoice number'}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-gray-200"></div>
            <div className="flex gap-2">
              <div className="h-3 w-12 rounded bg-gray-200"></div>
              <div className="h-3 w-12 rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="mt-2 h-3 w-24 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <span className="text-gray-400 text-2xl">📄</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts yet</h3>
      <p className="text-gray-500 mb-6">Save your invoice as a draft to see it here.</p>
      <Link
        href="/invoice"
        className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Create Invoice
      </Link>
    </div>
  );
}

/* =========================
 * Root Page
 * ========================= */
export default function DraftsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedDraft, setSelectedDraft] = useState<DraftDetails | null>(null);

  const {
    data: drafts,
    isLoading,
    isError,
    error,
  } = useDraftList({
    userName: session?.user?.email || '',
    enabled: !!session?.user?.email,
  });

  const { mutate: deleteDraft, isPending: isDeleting } = useDeleteDraft(session?.user?.email || '');
  const { mutate: renameDraft, isPending: isRenaming } = useRenameDraft(session?.user?.email || '');

  const handleSelect = (draft: DraftDetails) => {
    setSelectedDraft(draft);
  };

  const handleDelete = (draftName: string) => {
    if (window.confirm(`Are you sure you want to delete "${draftName}"?`)) {
      deleteDraft({ draftName }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['draftList', session?.user?.email] });
          if (selectedDraft?.name === draftName) {
            setSelectedDraft(null);
          }
        },
        onError: (error) => {
          console.error('Failed to delete draft:', error);
          alert('Failed to delete draft. Please try again.');
        }
      });
    }
  };

  const handleRename = (oldName: string, newName: string) => {
    renameDraft({ oldName, newName }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['draftList', session?.user?.email] });
        queryClient.invalidateQueries({ queryKey: ['draftDetails', session?.user?.email, oldName] });
        queryClient.invalidateQueries({ queryKey: ['draftDetails', session?.user?.email, newName] });
        if (selectedDraft?.name === oldName) {
          setSelectedDraft({ ...selectedDraft, name: newName });
        }
      },
      onError: (error) => {
        console.error('Failed to rename draft:', error);
        alert('Failed to rename draft. Please try again.');
      }
    });
  };

  const handleLoadDraft = () => {
    if (selectedDraft) {
      router.push(`/invoice?draft=${encodeURIComponent(selectedDraft.name)}`);
    }
  };

  if (!session?.user?.email) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Please sign in to view your drafts.</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load drafts: {error?.rawText || error?.statusText || 'Unknown error'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Invoice Drafts</h1>
        <p className="text-gray-500">Manage your saved invoice drafts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-h-0">
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {isLoading ? (
              <LoadingState />
            ) : !drafts || drafts.length === 0 ? (
              <EmptyState />
            ) : (
              drafts.map((draft) => (
                <DraftItem
                  key={draft.name}
                  draft={draft}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  onRename={handleRename}
                  isSelected={selectedDraft?.name === draft.name}
                />
              ))
            )}
          </div>
        </div>

        <div className="min-h-0">
          <div className="sticky top-8">
            <div className="rounded-lg border border-gray-200 bg-white min-h-[400px] w-full">
              {selectedDraft ? (
                <div className="p-6 h-full">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 mr-4">{selectedDraft.name}</h3>
                    <button
                      onClick={handleLoadDraft}
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Edit Invoice
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Invoice Number:</span>{' '}
                      <span className="text-gray-600">
                        {selectedDraft.params?.invoiceNumber || 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>{' '}
                      <span className="text-gray-600">
                        {selectedDraft.params?.date || 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Bill To:</span>{' '}
                      <span className="text-gray-600">
                        {selectedDraft.params?.billTo?.name || 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Items:</span>{' '}
                      <span className="text-gray-600">
                        {selectedDraft.params?.items?.length || 0} item(s)
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Currency:</span>{' '}
                      <span className="text-gray-600">
                        {selectedDraft.params?.currency || 'USD'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 h-full flex items-center justify-center">
                  <p className="text-gray-500">Select a draft to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(isDeleting || isRenaming) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
            <span className="text-gray-700">
              {isDeleting ? 'Deleting draft...' : 'Renaming draft...'}
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
