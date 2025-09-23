import { getApiBaseUrl, getApiKey } from '@/src/config';
import { useGetQuery } from '@/src/lib/useGetQuery';
import { usePostMutation } from '@/src/lib/usePostMutation';

export function useDraftDetails({
  userName,
  draftName,
  enabled,
}: {
  userName: string;
  draftName: string;
  enabled: boolean;
}) {
  const query = useGetQuery<
    { userName: string; name: string; params: Record<string, any> },
    Blob
  >(
    {
      endpoint: `/api/users/${userName}/drafts/${draftName}`,
      requestOptions: {
        baseUrl: getApiBaseUrl(),
        noJson: true,
        headers: {
          'X-API-Key': getApiKey(),
        },
        fetchInit: {},
      },
    },
    {
      enabled,
      staleTime: Infinity,
    },
  );

  return { ...query };
}

export function useDeleteDraft(userName: string, draftName: string) {
  return usePostMutation<void, void>({
    endpoint: `/api/users/${userName}/drafts/${draftName}`,
    requestOptions: {
      method: 'DELETE',
      headers: {
        'X-API-Key': getApiKey(),
      },
      fetchInit: {},
    },
  });
}
