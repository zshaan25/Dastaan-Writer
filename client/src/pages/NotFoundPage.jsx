import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="text-center py-16 space-y-4">
      <h1 className="text-6xl font-bold text-indigo-400 font-mono">404</h1>
      <p className="text-xl text-slate-300">Page Not Found</p>
      <Link to="/" className="inline-block text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium">
        Back to Home
      </Link>
    </div>
  );
};
