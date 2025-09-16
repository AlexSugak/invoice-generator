import { useGetQuery } from '@/src/lib/useGetQuery';

const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

type DraftDetails = {
  userName: string;
  name: string;
  params: object;
};

export const useDraftsList = (userName: string) => {
  return useGetQuery<DraftDetails[]>({
    endpoint: `/api/users/${userName}/drafts`,
    requestOptions: {
      headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey!,
        },
        fetchInit: {},
    },
    enabled: !!userName,
  })
};
