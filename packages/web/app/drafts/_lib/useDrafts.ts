import { useGetQuery } from '@/src/lib/useGetQuery';

export function useDrafts({
  userName,
  enabled,
}: {
  userName: string;
  enabled: boolean;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    if (!apiKey || !baseUrl) {
        throw new Error('Miss the API key or API host');
    }

  const query = useGetQuery<
    Array<{ userName: string; name: string; params: Record<string, any> }>
  >(
    {
      endpoint: `/api/users/${userName}/drafts`,
      requestOptions: {
        headers: {
          'X-API-Key': apiKey,
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