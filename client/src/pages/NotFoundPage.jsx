import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="text-6xl font-bold text-zinc-100 font-mono tracking-tight">404</h1>
      <p className="text-sm text-zinc-400 font-mono">Page not found in studio workspace</p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white px-4 py-2 rounded-lg font-medium border border-zinc-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

