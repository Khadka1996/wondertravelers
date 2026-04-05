// src/utils/auth.util.ts

/**
 * Get authentication token from cookie or localStorage
 */
export const getToken = (): string | null => {
  try {
    // Try to get from cookie first (most secure)
    if (typeof document !== 'undefined') {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; access_token=`);
      if (parts.length === 2) {
        const token = parts.pop()?.split(';').shift();
        if (token && token.trim()) {
          console.log('✅ Token found in cookie');
          return token.trim();
        }
      }
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && token.trim()) {
        console.log('✅ Token found in localStorage');
        return token.trim();
      }
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
  }

  console.warn('❌ No token found in cookie or localStorage');
  return null;
};

/**
 * Logout utility - clears session and redirects to login
 */
export const logout = async () => {
  try {
    // Call logout endpoint to clear server-side session
    const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com';
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => {
      // Network error - still proceed with logout
      console.warn('Logout API call failed:', err);
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear any local storage tokens (if any)
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }

    // Redirect to login
    window.location.href = '/auth/login';
  }
};

/**
 * Check if user is authenticated by testing a simple API call
 */
export const checkAuth = async (): Promise<boolean> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com';
    const response = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    return response.status === 200;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};

/**
 * Get current user info if authenticated
 */
export const getCurrentUser = async () => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com';
    const response = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Auth check failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
};
