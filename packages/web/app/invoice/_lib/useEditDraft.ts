import { usePostMutation } from '@/src/lib/usePostMutation';
import { InvalidateQueryFilters, useQueryClient } from '@tanstack/react-query';

const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export function useEditDraft({
  userName,
  draftId,
}: {
  userName: string;
  draftId: number;
}) {
  const queryClient = useQueryClient();
  return usePostMutation<Record<string, any>, Blob>({
    endpoint: `/api/users/${userName}/drafts/${draftId}`,
    requestOptions: {
      // baseUrl,
      noJson: true,
      blob: true,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey!,
      },
      fetchInit: {},
    },
  },
  {
    onSuccess: () => {
      queryClient.invalidateQueries(
        ['get', `/api/users/${userName}/drafts`] as InvalidateQueryFilters
      );
      queryClient.invalidateQueries(
        ['get', `/api/users/${userName}/drafts/${draftId}`] as InvalidateQueryFilters
      );
    }
  });
}
