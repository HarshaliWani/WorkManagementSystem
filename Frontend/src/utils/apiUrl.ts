/**
 * Utility functions for API and media URLs
 */

/**
 * Get the base API URL from environment
 * In production, VITE_API_URL must be set - no localhost fallback
 */
export const getApiBaseUrl = (): string => {
  // In production, environment variable must be set
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 
                   import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      throw new Error('VITE_API_URL or VITE_API_BASE_URL must be set in production');
    }
    return apiUrl;
  }
  
  // Development fallback (only in dev mode)
  return import.meta.env.VITE_API_URL?.replace('/api', '') || 
         import.meta.env.VITE_API_BASE_URL || 
         'http://localhost:8000';
};

/**
 * Get the full media URL for a media path
 * Handles both relative paths (/media/...) and full URLs
 */
export const getMediaUrl = (mediaPath: string | null | undefined): string | null => {
  if (!mediaPath) return null;
  
  // If already a full URL, return as is
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath;
  }
  
  // If relative path starting with /media, prepend base URL
  if (mediaPath.startsWith('/media')) {
    return `${getApiBaseUrl()}${mediaPath}`;
  }
  
  // Otherwise, prepend base URL with /
  if (!mediaPath.startsWith('/')) {
    return `${getApiBaseUrl()}/${mediaPath}`;
  }
  
  return `${getApiBaseUrl()}${mediaPath}`;
};

