import { usePostMutation } from '@/src/lib/usePostMutation';

const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export function useGeneratePdfMutation(templateName: string) {
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
