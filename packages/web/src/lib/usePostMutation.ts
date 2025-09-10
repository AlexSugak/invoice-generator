import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

export type ApiError<T = unknown> = {
  status: number;
  statusText: string;
  data?: T;
  response: Response;
  rawText?: string;
};

export type PostJsonOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
  /** Pass through fetch options, e.g., credentials, mode, cache, etc. */
  fetchInit?: Omit<RequestInit, 'method' | 'body' | 'headers' | 'signal'> & {
    signal?: AbortSignal;
  };
  /** When true, we will NOT attempt to parse JSON on success (useful for 204/empty body). Default: false */
  noJson?: boolean;
  /** When true, will return result as blob. Default: false */
  blob?: boolean;
};

export type Endpoint = string | ((args: { body: unknown }) => string);

export async function postJson<TBody, TResponse, TErr = unknown>(
  endpoint: Endpoint,
  body: TBody,
  options: PostJsonOptions = {},
  signal?: AbortSignal,
): Promise<TResponse> {
  const url = typeof endpoint === 'function' ? endpoint({ body }) : endpoint;
  const fullUrl = options.baseUrl
    ? `${options.baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
    : url;

  const res = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(options.fetchInit ?? {}),
    signal: signal ?? options.fetchInit?.signal,
  });

  if (res.ok) {
    if (options.noJson || res.status === 204) {
      if (options.blob) {
        // @ts-expect-error
        return await res.blob();
      }

      // @ts-expect-error
      return await res.text();
    }
    const text = await res.text();
    if (!text) {
      // @ts-expect-error - allow empty
      return undefined;
    }
    try {
      return JSON.parse(text) as TResponse;
    } catch {
      // If response isn't JSON, cast text
      // @ts-expect-error - allow text as TResponse if desired
      return text;
    }
  }

  let errData: TErr | undefined;
  let rawText: string | undefined;
  try {
    const t = await res.text();
    rawText = t || undefined;
    errData = t ? (JSON.parse(t) as TErr) : undefined;
  } catch {
    /* ignore parse errors */
  }

  const apiError: ApiError<TErr> = {
    status: res.status,
    statusText: res.statusText,
    data: errData,
    response: res,
    rawText,
  };
  throw apiError;
}

export type UsePostMutationArgs<TBody, TResponse, TErr> = {
  endpoint: Endpoint;
  requestOptions?: PostJsonOptions;
  mutationKey?: readonly unknown[];
  mapResponse?: (data: TResponse) => any;
};

/**
 * Generic hook for POST mutations with typed body/response.
 * Integrates React Query's abort signal automatically.
 */
export function usePostMutation<TBody, TResponse, TErr = unknown>(
  args: UsePostMutationArgs<TBody, TResponse, TErr>,
  options?: UseMutationOptions<TResponse, ApiError<TErr>, TBody>,
): UseMutationResult<TResponse, ApiError<TErr>, TBody> {
  const { endpoint, requestOptions, mutationKey, mapResponse } = args;

  return useMutation<TResponse, ApiError<TErr>, TBody>({
    mutationKey: mutationKey ?? [
      'post',
      typeof endpoint === 'string' ? endpoint : 'fn-endpoint',
    ],
    mutationFn: async (body: TBody) => {
      // React Query v5 passes an AbortSignal via context if you need it:
      // useMutation({ mutationFn: (vars) => postJson(..., ctx.signal) })
      // But since v5 requires mutationFn signature (variables) only, we use the fetchInit.signal
      // pattern (React Query injects it under the hood). Many apps won't need manual signal here.
      const data = await postJson<TBody, TResponse, TErr>(
        endpoint,
        body,
        requestOptions,
      );
      return mapResponse ? mapResponse(data) : data;
    },
    ...options,
  });
}
