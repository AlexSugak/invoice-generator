import { useGetQuery } from '@/src/lib/useGetQuery';

const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export function useDraftDetails({
  userName,
  draftId,
  enabled,
}: {
  userName: string;
  draftId?: number;
  enabled: boolean;
}) {
  const query = useGetQuery<
    { userName: string; name: string; params: Record<string, any> },
    Blob
  >(
    {
      endpoint: `/api/users/${userName}/drafts/${draftId}`,
      requestOptions: {
        noJson: true,
        headers: {
          'X-API-Key': apiKey!,
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
