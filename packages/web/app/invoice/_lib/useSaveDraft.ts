import { usePostMutation } from '@/src/lib/usePostMutation';

const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export function useSaveDraft(userName: string, draftName: string) {
  const encodedUser = encodeURIComponent(userName);

  return usePostMutation<{ draftName: string; params: any }, void>({
    endpoint: `/api/users/${encodedUser}/drafts/${draftName}`,
    requestOptions: {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey!,
        Accept: 'application/json',
      },
      fetchInit: {},
    },
  });
}
