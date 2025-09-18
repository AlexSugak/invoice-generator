import { getApiBaseUrl, getApiKey } from '@/src/config';
import { useGetQuery } from '@/src/lib/useGetQuery';

export function useDraftDetails({
  userName,
  enabled,
}: {
  userName: string;
  enabled: boolean;
}) {
  const query = useGetQuery<
    { userName: string; name: string; params: Record<string, any> },
    Blob
  >(
    {
      endpoint: `/api/users/${userName}/drafts/invoice-draft`,
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
