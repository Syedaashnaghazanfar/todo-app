export function makeChatKitFetch(accessToken: string, extras?: Record<string,string>) {
  return async (url: string, options: RequestInit) => {
    const headers: HeadersInit = {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      ...(extras || {}),
    };

    return fetch(url, { ...options, headers });
  };
}
