import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User as UserIcon, LogIn } from 'lucide-react';

import { DastaanLogo } from './DastaanLogo';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="border-b border-zinc-800/80 bg-black/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <DastaanLogo size={30} className="rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Dastaan
            </span>
            <span className="text-[11px] text-zinc-500 hidden sm:inline-block font-mono tracking-tighter">
              Storytelling Platform
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/assistant"
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                  location.pathname === '/assistant'
                    ? 'bg-zinc-900 border-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:border-zinc-800 hover:bg-zinc-900/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Assistant</span>
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                  location.pathname === '/profile'
                    ? 'bg-zinc-900 border-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:border-zinc-800 hover:bg-zinc-900/50'
                }`}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                )}
                <span>Profile</span>
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 px-2.5 py-1.5 rounded-lg transition border border-transparent hover:border-zinc-800"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950 transition font-medium"
              >
                <LogIn className="w-3.5 h-3.5 text-zinc-400" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 text-xs bg-emerald-400 hover:bg-emerald-300 text-black px-3.5 py-1.5 rounded-lg transition font-semibold"
              >
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
