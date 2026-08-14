import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';

export const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAssistantPage = location.pathname === '/assistant';

  if (isAssistantPage) {
    return (
      <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
        <Header />
        <main className="flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>Dastaan AI © 2026 - AI-Powered Social Media Content & Publishing Assistant</p>
      </footer>
    </div>
  );
};
