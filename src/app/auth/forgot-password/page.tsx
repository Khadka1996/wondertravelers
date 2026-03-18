'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, Loader, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!email) {
      setFormError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Call password reset API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send reset email');
      }

      setIsSubmitted(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
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
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-slate-300 text-sm">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            {!isSubmitted ? (
              <>
                {/* Error Alert */}
                {formError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-200 text-sm">{formError}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  {/* Back to Login */}
                  <div className="flex items-center justify-center mt-6">
                    <Link
                      href="/auth/login"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 bg-green-500/10 rounded-full">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <h2 className="text-xl font-bold text-white">Check Your Email</h2>
                  <p className="text-slate-300 text-sm">
                    We've sent a password reset link to{' '}
                    <span className="font-semibold text-blue-400">{email}</span>
                  </p>
                  <p className="text-slate-400 text-xs">
                    The link will expire in 1 hour. If you don't see it, check your spam folder.
                  </p>
                </div>

                {/* Back to Login */}
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/login"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center text-sm"
                  >
                    Back to Login
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                      setFormError('');
                    }}
                    className="text-slate-400 hover:text-slate-300 text-sm transition"
                  >
                    Try a different email
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <p className="text-xs text-slate-400">
                🔒 Your account is safe. We'll never share your email with anyone. 
                Learn more in our{' '}
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
