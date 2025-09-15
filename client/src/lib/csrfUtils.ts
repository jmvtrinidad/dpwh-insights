// Centralized CSRF token management
let cachedToken: string | null = null;

export async function getCsrfToken(): Promise<string | null> {
  if (cachedToken) {
    return cachedToken;
  }

  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      cachedToken = data.csrfToken;
      return cachedToken;
    }
  } catch (error) {
    console.warn('Failed to fetch CSRF token:', error);
  }
  
  return null;
}

export function clearCsrfToken() {
  cachedToken = null;
}

export function getCachedCsrfToken() {
  return cachedToken;
}