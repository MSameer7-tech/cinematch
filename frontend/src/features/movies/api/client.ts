import { env } from '../../../config/env';

/**
 * Raw TMDB API Client Wrapper
 * Handles base URL construction, JSON parsing, and Bearer token injection.
 * Does NOT contain business logic.
 */

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export const tmdbClient = async <T>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<T> => {
  const { params, ...fetchOptions } = options;
  
  // Construct URL with query parameters
  const url = new URL(`${env.TMDB_BASE_URL}${endpoint}`);
  
  // Append standard params (like language) and user params
  url.searchParams.append('language', 'en-US');
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.TMDB_TOKEN}`,
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.status_message || 
      `TMDB API Error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};
