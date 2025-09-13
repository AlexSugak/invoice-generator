import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { ApiError } from './usePostMutation';

export type GetJsonOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
  fetchInit?: Omit<RequestInit, 'method' | 'headers' | 'signal'> & {
    signal?: AbortSignal;
  };
  noJson?: boolean;
};

export async function getJson<TResponse, TErr = unknown>(
  endpoint: string,
  options: GetJsonOptions = {},
  signal?: AbortSignal,
): Promise<TResponse> {
  const fullUrl = options.baseUrl
    ? `${options.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`
    : endpoint;

  const res = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...(options.fetchInit ?? {}),
    signal: signal ?? options.fetchInit?.signal,
  });

  if (res.ok) {
    if (options.noJson || res.status === 204) {
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

export type UseGetQueryArgs<TResponse, TErr> = {
  endpoint: string;
  requestOptions?: GetJsonOptions;
  queryKey?: readonly unknown[];
  mapResponse?: (data: TResponse) => any;
  enabled?: boolean;
};

/**
 * Generic hook for GET queries with typed response.
 * Integrates React Query's abort signal automatically.
 */
export function useGetQuery<TResponse, TErr = unknown>(
  args: UseGetQueryArgs<TResponse, TErr>,
  options?: Omit<
    UseQueryOptions<TResponse, ApiError<TErr>>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<TResponse, ApiError<TErr>> {
  const {
    endpoint,
    requestOptions,
    queryKey,
    mapResponse,
    enabled = true,
  } = args;

  return useQuery<TResponse, ApiError<TErr>>({
    queryKey: queryKey ?? ['get', endpoint],
    queryFn: async ({ signal }) => {
      const data = await getJson<TResponse, TErr>(endpoint, {
        ...requestOptions,
        fetchInit: {
          ...requestOptions?.fetchInit,
          signal,
        },
      });
      return mapResponse ? mapResponse(data) : data;
    },
    enabled,
    ...options,
  });
}
