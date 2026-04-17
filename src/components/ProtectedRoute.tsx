'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'moderator' | 'admin' | null;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole = null,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, hasValidToken } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // STEP 1: WAIT FOR LOADING TO COMPLETE ✅
    if (isLoading) return;

    // STEP 2: TOKEN VALIDATION (MANDATORY FIRST CHECK) ✅
    // If token is missing or invalid → IMMEDIATELY redirect to login
    if (!isAuthenticated || !hasValidToken) {
      const loginUrl = new URL(redirectTo, typeof window !== 'undefined' ? window.location.origin : '');
      loginUrl.searchParams.set('redirect', pathname);
      router.push(loginUrl.toString());
      return;
    }

    // STEP 3: ROLE VERIFICATION (MUST HAPPEN AFTER TOKEN VALIDATION) ✅
    // If role is required, verify it matches
    if (requiredRole) {
      // Role must not be undefined or null
      if (!user?.role) {
        // No role found → redirect to login for re-verification
        router.push(redirectTo);
        return;
      }

      // Role must exactly match required role
      if (user.role !== requiredRole) {
        // Role mismatch → Strict policy: redirect to login (not unauthorized)
        setAccessDenied(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push(redirectTo);
        }, 2000);
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router, redirectTo, requiredRole, hasValidToken]);

  // STEP 1: LOADING STATE
  // Show loading only while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // STEP 2: TOKEN VALIDATION CHECK
  // If no valid token → do NOT render children
  if (!isAuthenticated || !hasValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-slate-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // STEP 3: ROLE VERIFICATION CHECK
  // If role mismatch → do NOT render children
  if (accessDenied || (requiredRole && user?.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-red-400 font-semibold">Access Denied</p>
          <p className="text-slate-400 text-sm">Your role does not have permission to access this page.</p>
          <p className="text-slate-500 text-xs">Redirecting...</p>
        </div>
      </div>
    );
  }

  // FINAL STEP: ALL CHECKS PASSED ✅
  // Token is valid AND role is verified → render children
  return <>{children}</>;
};

// Hook to get redirect path based on user role and previous location
export const useRedirectAfterLogin = () => {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const getRedirectPath = () => {
    // If there's a redirect param, use it
    const redirect = searchParams.get('redirect');
    if (redirect && redirect !== '/auth/login' && redirect !== '/auth/register') {
      return redirect;
    }

    // Otherwise, redirect based on role
    if (user?.role === 'admin') {
      return '/admin/dashboard';
    } else if (user?.role === 'moderator') {
      return '/moderator/dashboard';
    }

    return '/';
  };

  return getRedirectPath();
};

// Hook to remember page location before login
export const useRememberLocation = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Store current location (except auth pages) in sessionStorage
    if (pathname && !pathname.startsWith('/auth')) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('previousLocation', pathname);
      }
    }
  }, [pathname]);

  const getPreviousLocation = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('previousLocation') || '/';
    }
    return '/';
  };

  return getPreviousLocation();
};
