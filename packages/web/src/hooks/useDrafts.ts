import { useGetQuery } from '@/src/lib/useGetQuery';
import { useMutation } from '@tanstack/react-query';

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export type DraftDetails = {
  userName: string;
  name: string;
  params: Record<string, any>;
};

export function useDraftDetails({
  userName,
  draftName = 'invoice-draft',
  enabled,
}: {
  userName: string;
  draftName?: string;
  enabled: boolean;
}) {
  const query = useGetQuery<DraftDetails, DraftDetails>(
    {
      endpoint: `/api/users/${userName}/drafts/${draftName}`,
      requestOptions: {
        headers: {
          'X-API-Key': apiKey!,
        },
        fetchInit: {},
      },
    },
    {
      enabled,
      staleTime: 0,
    },
  );

  return { ...query };
}

export function useDraftList({
  userName,
  enabled,
}: {
  userName: string;
  enabled: boolean;
}) {
  const query = useGetQuery<DraftDetails[], DraftDetails[]>(
    {
      endpoint: `/api/users/${userName}/drafts`,
      requestOptions: {
        headers: {
          'X-API-Key': apiKey!,
        },
        fetchInit: {},
      },
    },
    {
      enabled,
      staleTime: 0,
    },
  );

  return { ...query };
}

export function useSaveDraft(userName: string) {
  return useMutation({
    mutationKey: ['saveDraft', userName],
    mutationFn: async (data: { draftName: string; params: Record<string, any> }) => {
      const endpoint = `/api/users/${userName}/drafts/${data.draftName}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey!,
        },
        body: JSON.stringify({ params: data.params }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save draft: ${response.statusText}`);
      }
    }
  });
}

export function useDeleteDraft(userName: string) {
  return useMutation({
    mutationKey: ['deleteDraft', userName],
    mutationFn: async (data: { draftName: string }) => {
      const endpoint = `/api/users/${userName}/drafts/${data.draftName}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'X-API-Key': apiKey!,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete draft: ${response.statusText}`);
      }
    }
  });
}

export function useRenameDraft(userName: string) {
  return useMutation({
    mutationKey: ['renameDraft', userName],
    mutationFn: async (data: { oldName: string; newName: string }) => {
      const endpoint = `/api/users/${userName}/drafts/${data.oldName}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey!,
        },
        body: JSON.stringify({ newName: data.newName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to rename draft: ${response.statusText}`);
      }
    }
  });
}
