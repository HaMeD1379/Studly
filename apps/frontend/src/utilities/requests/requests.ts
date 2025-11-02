// Usages of the fetch API were used here to create our utility: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
import { API_KEY_HEADER, API_VERSION, CONTENT_TYPE } from '~/config/api';
import type { RequestMethods, RequestResolve } from '~/types';

export const request = async (
  method: RequestMethods,
  path: string,
  headers?: Record<string, string>,
  body?: string,
): Promise<RequestResolve> => {
  const requestHeaders = new Headers();

  for (const [key, value] of Object.entries(headers ?? {})) {
    requestHeaders.append(key, value);
  }

  requestHeaders.append(API_KEY_HEADER, import.meta.env.VITE_RAILWAY_API_TOKEN);
  requestHeaders.append('Content-Type', CONTENT_TYPE);

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${API_VERSION}/${path}`, {
    method,
    headers: requestHeaders,
    body
  });
 
  if (response.ok) {
    /*return {
      data: response.json()
    }*/
   const data = await response.json();  // ✅ this is now the parsed JSON object
    return { data };    
  }

  return {
    error: {
      message: `The HTTP request ${method} ${path} failed with status ${response.status}`,
      status: response.status,
    },
  };
};
