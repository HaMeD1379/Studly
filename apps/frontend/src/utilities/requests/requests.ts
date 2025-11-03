// Usages of the fetch API were used here to create our utility: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
import {
  API_KEY_HEADER,
  API_TOKEN,
  API_VERSION,
  BASE_URL,
  CONTENT_TYPE,
} from '~/constants/api';
import type { RequestMethods, RequestResolve } from '~/types';

export const request = async <Type>(
  method: RequestMethods,
  path: string,
  headers?: Record<string, string>,
  body?: string,
): Promise<RequestResolve<Type>> => {
  const requestHeaders = new Headers();

  for (const [key, value] of Object.entries(headers ?? {})) {
    requestHeaders.append(key, value);
  }

  requestHeaders.append(API_KEY_HEADER, API_TOKEN);
  requestHeaders.append('Content-Type', CONTENT_TYPE);

  const response = await fetch(`${BASE_URL}/${API_VERSION}/${path}`, {
    body,
    headers: requestHeaders,
    method,
  });

  if (response.ok) {
    return {
      data: await response.json(),
    };
  }

  return {
    error: {
      message: `The HTTP request ${method} ${path} failed with status ${response.status}`,
      status: response.status,
    },
  };
};
