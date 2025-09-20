import { useGetQuery } from '@/src/lib/useGetQuery';

const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export function useGetDrafts({
  userName,
  enabled,
}: {
  userName: string;
  enabled: boolean;
}) {
  const query = useGetQuery<{ name: string; params: Record<string, any> }[]>(
    {
      endpoint: `/api/users/${userName}/drafts`,
      requestOptions: {
        // baseUrl,
        noJson: true,
        headers: {
          'X-API-Key': apiKey!,
        },
        fetchInit: {},
      },
      mapResponse: (data: { name: string; params: Record<string, any> }[]) => {
        try {
          return data;
        } catch (error) {
          console.error('Failed to parse drafts response:', error);
          return [];
        }
      },
    },
    {
      enabled: true,
      staleTime: Infinity
    },
  );

  return { ...query };
}
