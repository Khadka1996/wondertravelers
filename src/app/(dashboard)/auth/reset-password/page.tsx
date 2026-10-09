'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, AlertCircle, Loader, CheckCircle } from 'lucide-react';

interface ApiError {
  message?: string;
  errors?: { message: string }[];
}

function ResetPasswordForm() {
  const token = useSearchParams().get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (newPassword !== confirmNewPassword) {
      setFormError("Passwords don't match");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmNewPassword }),
      });

      if (!response.ok) {
        const data: ApiError = await response.json().catch(() => ({}));
        throw new Error(data.errors?.[0]?.message || data.message || 'Could not reset password');
      }

      setIsDone(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-slate-300 text-sm">This reset link is missing its token.</p>
        <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">
          Request a new link
        </Link>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-green-500/10 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white">Password changed</h2>
        <p className="text-slate-300 text-sm">You can now sign in with your new password.</p>
        <Link
          href="/auth/login"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center text-sm"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

  return (
    <>
      {formError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-200 mb-2">
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              disabled={isSubmitting}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            At least 8 characters, with upper and lower case letters, a number and one of @$!%*?&amp;
          </p>
        </div>

        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-200 mb-2">
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              id="confirmNewPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={inputClass}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Set new password'
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Choose a new password</h1>
            </div>
            <Suspense fallback={null}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-slate-400 hover:text-slate-300 text-sm transition">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
