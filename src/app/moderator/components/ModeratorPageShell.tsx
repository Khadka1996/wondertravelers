'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ModeratorPageShellProps {
  title: string;
  description: string;
  backHref?: string;
  children?: React.ReactNode;
}

export default function ModeratorPageShell({
  title,
  description,
  backHref = '/moderator',
  children,
}: ModeratorPageShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-slate-700/60 backdrop-blur-xl bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <Link
            href={backHref}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-slate-400 mt-1">{description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </div>
    </div>
  );
}
