import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Feather, Sparkles, LogOut, User as UserIcon, LogIn, UserPlus, Bot } from 'lucide-react';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-indigo-600/20 p-2 rounded-xl border border-indigo-500/30 text-indigo-400 group-hover:border-indigo-400/50 transition">
            <Feather className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Dastaan <Sparkles className="w-4 h-4 text-pink-400" />
            </span>
            <span className="text-xs text-slate-400 block -mt-1 font-mono">LinkedIn Content Assistant</span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/assistant"
                className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl border transition font-medium ${
                  location.pathname === '/assistant'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-indigo-400" /> AI Assistant
              </Link>
              <Link
                to="/"
                className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl border transition font-medium ${
                  location.pathname === '/'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" /> Profile Context
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-1.5 text-xs bg-red-950/40 hover:bg-red-900/40 text-red-300 px-3 py-1.5 rounded-xl border border-red-800/50 transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700 transition font-medium"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition font-medium shadow-md shadow-indigo-600/20"
              >
                <UserPlus className="w-3.5 h-3.5" /> Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
