import { usePostMutation } from '@/src/lib/usePostMutation';

export function useGeneratePdfMutation(templateName: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  if (!apiKey || !baseUrl) {
      throw new Error('Miss the API key or API host');
  }

  return usePostMutation<Record<string, any>, Blob>({
    endpoint: `/api/pdf/generate/${templateName}`,
    requestOptions: {
      // baseUrl,
      noJson: true,
      blob: true,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey!,
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
