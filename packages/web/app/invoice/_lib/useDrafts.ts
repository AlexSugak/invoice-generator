import { useGetQuery } from "@/src/lib/useGetQuery";

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
    const query = useGetQuery<string[]>(
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
          staleTime: Infinity,
        },
      );
    
      return { ...query };
}
