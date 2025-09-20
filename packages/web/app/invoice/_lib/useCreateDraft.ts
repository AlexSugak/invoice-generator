import { usePostMutation } from '@/src/lib/usePostMutation';

const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export function useCreateDraft(userName: string, draftName: string) {
  return usePostMutation<Record<string, any>, Blob>({
    endpoint: `/api/users/${userName}/drafts/${draftName}`,
    requestOptions: {
      // baseUrl,
      noJson: true,
      blob: true,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey!,
      },
      fetchInit: {},
    },
  });
}
