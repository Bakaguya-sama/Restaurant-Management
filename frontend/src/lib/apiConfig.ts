/**
 * API Configuration Utility
 * Provides dynamic server URL detection and API configuration
 */

/**
 * Get the API base URL from environment or dynamically detect it
 * Priority:
 * 1. VITE_API_BASE_URL environment variable
 * 2. Dynamic detection from current window location
 * 
 * @returns {string} API base URL (e.g., http://localhost:5000/api/v1)
 */
export function getApiBaseUrl(): string {
  // Check environment variable first
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }

  // Dynamic detection from current server
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    // Default to port 5000 if running on development port
    const apiPort = window.location.port === '5173' || window.location.port === '3000' 
      ? ':5000' 
      : port;
    
    return `${protocol}//${hostname}${apiPort}/api/v1`;
  }

  // Server-side fallback (should not happen in normal usage)
  return 'http://localhost:5000/api/v1';
}

/**
 * Get the base server URL for image serving
 * Priority:
 * 1. VITE_BASE_URL environment variable
 * 2. Dynamic detection from current window location
 * 
 * @returns {string} Base server URL (e.g., http://localhost:5000)
 */
export function getBaseUrl(): string {
  // Check environment variable first
  const envUrl = (import.meta as any).env?.VITE_BASE_URL;
  if (envUrl) {
    return envUrl;
  }

  // Dynamic detection from current server
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    // Default to port 5000 if running on development port
    const apiPort = window.location.port === '5173' || window.location.port === '3000' 
      ? ':5000' 
      : port;
    
    return `${protocol}//${hostname}${apiPort}`;
  }

  // Server-side fallback
  return 'http://localhost:5000';
}

/**
 * Get the full API endpoint URL
 * 
 * @param {string} path - API path (e.g., '/uploads/dishes' or 'uploads/avatars')
 * @returns {string} Full API URL
 */
export function getApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export default {
  getApiBaseUrl,
  getBaseUrl,
  getApiUrl
};
