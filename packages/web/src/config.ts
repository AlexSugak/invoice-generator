const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
if (!baseUrl) {
  throw new Error('missing NEXT_PUBLIC_API_HOST');
}

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
if (!apiKey) {
  throw new Error('missing NEXT_PUBLIC_API_KEY');
}

export const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return baseUrl;
  }

  // in dev mode api is proxied throug next dev server
  return `http://localhost:${process.env.WEB_PORT || 3000}`;
};

export const getApiKey = () => {
  return apiKey;
};
