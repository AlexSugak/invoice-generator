import { usePostMutation } from '@/src/lib/usePostMutation';

export function useSaveDraft({ userName, draftName }: { userName: string; draftName: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey || !baseUrl) {
      throw new Error('Miss the API key or API host');
  }

  return usePostMutation<Record<string, any>, Blob>({
    endpoint: `/api/users/${userName}/drafts/${draftName}`,
    requestOptions: {
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
