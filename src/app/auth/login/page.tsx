'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader } from 'lucide-react';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExplicitRedirect, setHasExplicitRedirect] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Redirect param from previous location
  const redirectTo = searchParams.get('redirect') || '/';
  
  // Check if there was an explicit redirect URL (not just default '/')
  useEffect(() => {
    setHasExplicitRedirect(!!searchParams.get('redirect'));
  }, [searchParams]);

  // ✅ REDIRECT 2: Role-based redirect ONLY after user role is confirmed
  useEffect(() => {
    // ⏳ Wait for loading to finish
    if (isLoading || isVerifying) {
      return; // Still loading or verifying
    }

    // ✅ Check if authenticated
    if (!isAuthenticated || !user) {
      return; // Not authenticated
    }

    // 🔐 CRITICAL: Ensure user role is available
    if (!user.role) {
      console.error('❌ User role not available after login');
      setFormError('User role verification failed. Please try again.');
      return;
    }

    // ✅ User is authenticated with valid role - NOW redirect
    if (hasExplicitRedirect) {
      // User was trying to access a specific page
      setIsVerifying(true);
      router.push(redirectTo);
    } else {
      // No explicit redirect - use role-based redirect
      setIsVerifying(true);
      
      if (user.role === 'admin') {
        console.log('✅ Admin user detected - redirecting to /admin/dashboard');
        router.push('/admin/dashboard');
      } else if (user.role === 'moderator') {
        console.log('✅ Moderator user detected - redirecting to /moderator/dashboard');
        router.push('/moderator/dashboard');
      } else {
        console.log('✅ Regular user detected - redirecting to /');
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, user?.role, router, redirectTo, hasExplicitRedirect, isVerifying]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    // Validation
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Please enter a valid email');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Login and get user data
      await login(email, password);
      
      // ✅ REDIRECT HANDLED BY useEffect ABOVE
      // The useEffect hook will detect isAuthenticated change and redirect based on role
      // No need to manually push here
    } catch {
      setFormError(error || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-slate-300 text-sm">Sign in to your Wondertravelers account</p>
            </div>

            {/* Error Alert */}
            {(formError || error) && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{formError || error}</p>
              </div>
            )}

            {/* Verification Loading State */}
            {isVerifying && !formError && !error && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 items-center">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <p className="text-blue-200 text-sm">
                  {user?.role === 'admin' && 'Verifying admin access...'}
                  {user?.role === 'moderator' && 'Verifying moderator access...'}
                  {!user?.role || (user?.role === 'user') && 'Verifying identity...'}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className={`space-y-4 ${isVerifying ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading || isVerifying}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : isSubmitting || isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-slate-800 text-slate-400">or</span>
                </div>
              </div>

              {/* Register Link */}
              <p className="text-center text-sm text-slate-300">
                Don't have an account?{' '}
                <Link
                  href="/auth/register"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition"
                >
                  Sign up here
                </Link>
              </p>
            </form>

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-400">
                🔒 Your login is encrypted and secure. We never store passwords in plain text.
                By logging in, you agree to our{' '}
                <Link href="/privacy" className="text-blue-400 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-slate-400 hover:text-slate-300 text-sm transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
