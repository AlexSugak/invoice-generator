import { getApiBaseUrl, getApiKey } from '@/src/config';
import { usePostMutation } from '@/src/lib/usePostMutation';

export function useGeneratePdfMutation(templateName: string) {
  return usePostMutation<Record<string, any>, Blob>({
    endpoint: `/api/pdf/generate/${templateName}`,
    requestOptions: {
      baseUrl: getApiBaseUrl(),
      noJson: true,
      blob: true,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getApiKey(),
      },
      fetchInit: {},
    },
    mapResponse: async (res: any) => {
      return res as Blob;
    },
  });
}

export function useGenerateInvoicePdf() {
  const pdfMutation = useGeneratePdfMutation('invoice');

  return {
    ...pdfMutation,
  };
}
