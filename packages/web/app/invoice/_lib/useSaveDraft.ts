import { getApiBaseUrl, getApiKey } from '@/src/config';
import { usePostMutation } from '@/src/lib/usePostMutation';

export function useSaveDraft(userName: string) {
  return usePostMutation<Record<string, any>, Blob>({
    endpoint: `/api/users/${userName}/drafts/invoice-draft`,
    requestOptions: {
      baseUrl: getApiBaseUrl(),
      noJson: true,
      blob: true,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getApiKey(),
      },
      fetchInit: {},
    },
  });
}
