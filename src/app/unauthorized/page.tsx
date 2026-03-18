'use client';

import Link from 'next/link';
import { Shield, ChevronRight } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative text-center">
        <Shield className="w-20 h-20 text-red-500 mx-auto mb-6 opacity-80" />
        
        <h1 className="text-4xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 text-lg mb-8">
          You don't have permission to access this page.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Go to Home
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Sign In
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-slate-500 text-sm mt-12">
          If you believe this is an error, please{' '}
          <Link href="/contact" className="text-blue-400 hover:underline">
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
