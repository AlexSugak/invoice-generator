import { usePostMutation } from '@/src/lib/usePostMutation';

const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export function useSaveDraft(userName: string) {
  return usePostMutation<{ draftName: string; params: Record<string, any> }, Blob>({
    endpoint: ({ body }) => `/api/users/${userName}/drafts/${(body as { draftName: string }).draftName}`,
    requestOptions: {
      baseUrl,
      noJson: true,
      blob: true,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey!,
      },
      fetchInit: {},
    },
  });
}
