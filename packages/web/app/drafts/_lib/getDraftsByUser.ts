import { useGetQuery } from '@/src/lib/useGetQuery';
import { useMemo } from 'react';

export interface DraftDetails {
  id: string;
  userName: string;
  name: string;
  updatedAt: string;
  params: Record<string, any>;
}

const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export function getDraftsByUser({
  userName,
  enabled,
}: {
  userName: string;
  enabled: boolean;
}) {
  const encoded = encodeURIComponent(userName);

  const query = useGetQuery<DraftDetails[], Blob>(
    {
      endpoint: `/api/users/${encoded}/drafts`,
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

  const data = useMemo(() => query.data ?? [], [query.data]);

  return { ...query, data };
}
