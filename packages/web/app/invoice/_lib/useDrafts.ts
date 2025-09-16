import { useGetQuery } from '@/src/lib/useGetQuery';

const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export function useDrafts({
  userName,
  enabled,
}: {
  userName: string;
  enabled: boolean;
}) {
  const query = useGetQuery<
    Array<{ userName: string; name: string; params: Record<string, any> }>
  >(
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
    },
  );

  return { ...query };
}
