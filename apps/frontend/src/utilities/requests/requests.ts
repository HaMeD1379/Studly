// Usages of the fetch API were used here to create our utility: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
import { API_KEY_HEADER, API_VERSION, CONTENT_TYPE } from "~/config/api";
import type { RequestResolve, RequestMethods } from '~/types';

export const request = async (method: RequestMethods, path: string, headers?: Record<string, string>, body?: string): Promise<RequestResolve> => {
  const requestHeaders = new Headers();

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => requestHeaders.append(key, value));
  }

  requestHeaders.append(API_KEY_HEADER, import.meta.env.VITE_RAILWAY_API_TOKEN);
  requestHeaders.append('Content-Type', CONTENT_TYPE);

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${API_VERSION}/${path}`, {
    method,
    headers: requestHeaders,
    body
  });

  if (response.ok) {
    return {
      data: response.json()
    }
  }

  return {
    error: {
      status: response.status,
      message: `The HTTP request ${method} ${path} failed with status ${response.status}`
    }
  }
}