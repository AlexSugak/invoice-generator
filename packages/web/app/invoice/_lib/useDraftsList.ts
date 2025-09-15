import { useGetQuery } from '@/src/lib/useGetQuery';
import { usePostMutation } from '@/src/lib/usePostMutation';

const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export function useDraftsList({
  userName,
  enabled,
}: {
  userName: string;
  enabled: boolean;
}) {
  const query = useGetQuery<Array<{ name: string }>, Blob>(
    {
      endpoint: `/api/users/${userName}/drafts`,
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
