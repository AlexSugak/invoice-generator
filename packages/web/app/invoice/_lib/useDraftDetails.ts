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
        noJson: true,
        headers: {
          'X-API-Key': apiKey!,
        },
        fetchInit: {},
      },
    },
    {
      enabled,
    },
  );

  return { ...query };
}
