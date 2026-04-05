'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';


// Types
interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  phoneNumber?: string;
  address?: string;
  role: 'user' | 'moderator' | 'admin';
  active: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasValidToken: boolean; // ✅ NEW: Explicit token validation flag
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasValidToken, setHasValidToken] = useState(false); // ✅ NEW: Token validation flag

  const AUTH_API_BASE = '/api/auth';

  // ✅ STRICT AUTHENTICATION CHECK
  // Validates token existence and validity before any access
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasValidToken(false); // ✅ Default to no valid token
      
      console.log('AUTH: Checking authentication...');
      console.log('AUTH: API base:', AUTH_API_BASE);
      
      // STEP 1: Try to get user from /api/auth/me endpoint
      // This endpoint MUST validate the token on the backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${AUTH_API_BASE}/me`, {
        method: 'GET',
        credentials: 'include', // Send HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('AUTH: checkAuth response status:', response.status);

      if (response.ok) {
        // ✅ Token is valid and user is authenticated
        const data = await response.json();
        
        // ✅ ROLE VERIFICATION: Ensure role is valid
        if (!data.user?.role || !['user', 'moderator', 'admin'].includes(data.user.role)) {
          // Invalid role → clear authentication
          setUser(null);
          setHasValidToken(false);
          setError('Invalid user role');
          return;
        }
        
        setUser(data.user);
        setHasValidToken(true); // ✅ Token is valid
        setError(null);
      } else {
        // STEP 2: Token might be expired, attempt refresh
        console.log('AUTH: First check failed, attempting refresh...');
        const refreshResponse = await fetch(`${AUTH_API_BASE}/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (refreshResponse.ok) {
          // ✅ Refresh successful, retry get user
          console.log('AUTH: Refresh successful, retrying auth...');
          const retryResponse = await fetch(`${AUTH_API_BASE}/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            
            // ✅ ROLE VERIFICATION: Ensure role is valid after refresh
            if (!data.user?.role || !['user', 'moderator', 'admin'].includes(data.user.role)) {
              setUser(null);
              setHasValidToken(false);
              setError('Invalid user role');
              return;
            }
            
            setUser(data.user);
            setHasValidToken(true); // ✅ Token is valid after refresh
            setError(null);
            console.log('AUTH: User authenticated after refresh');
          } else {
            // ✅ Refresh successful but user fetch failed
            console.warn('AUTH: Refresh succeeded but user fetch failed');
            setUser(null);
            setHasValidToken(false);
          }
        } else {
          // ✅ Refresh failed → token is invalid
          console.log('AUTH: Refresh failed, no valid token');
          setUser(null);
          setHasValidToken(false); // ❌ No valid token
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('AUTH: Auth check failed:', err instanceof TypeError ? `Network error: ${errorMessage}` : errorMessage);
      if (err instanceof TypeError) {
        console.error('AUTH: Network connectivity issue detected');
      } else if (err instanceof Error && err.name === 'AbortError') {
        console.error('AUTH: Request timeout');
      }
      setUser(null);
      setHasValidToken(false); // ❌ No valid token on error
    } finally {
      setIsLoading(false);
    }
  }, [AUTH_API_BASE]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ✅ STRICT LOGIN FUNCTION
  // Validates credentials and ensures role is set correctly
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setError(null);
        setHasValidToken(false); // ✅ Reset token validity on login attempt

        const response = await fetch(`${AUTH_API_BASE}/login`, {
          method: 'POST',
          credentials: 'include', // ✅ Send HTTP-only cookies
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        // ✅ ROLE VERIFICATION: Validate user role on login
        if (!data.user?.role || !['user', 'moderator', 'admin'].includes(data.user.role)) {
          throw new Error('Invalid user role returned from server');
        }

        setUser(data.user);
        setHasValidToken(true); // ✅ Token is now valid after successful login
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setError(errorMessage);
        setUser(null);
        setHasValidToken(false); // ❌ No valid token on error
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [AUTH_API_BASE]
  );

  // Register
  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${AUTH_API_BASE}/register`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: data.username,
            email: data.email,
            password: data.password,
            fullName: data.fullName || `${data.username}`,
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || 'Registration failed');
        }

        setUser(responseData.user);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        setError(errorMessage);
        setUser(null);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [AUTH_API_BASE]
  );

  // ✅ STRICT LOGOUT FUNCTION
  // Clears all authentication data including token flag
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // ✅ Call backend logout to clear server-side session
      await fetch(`${AUTH_API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Even if logout fails, clear local state
      });

      // ✅ Clear ALL authentication data
      setUser(null);
      setHasValidToken(false); // ✅ Clear token validity flag
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [AUTH_API_BASE]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasValidToken, // ✅ Export token validation flag
    login,
    register,
    logout,
    checkAuth,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
