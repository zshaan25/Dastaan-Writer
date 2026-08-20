import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';

export const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAssistantPage = location.pathname === '/assistant';

  if (isAssistantPage) {
    return (
      <div className="h-screen w-screen flex flex-col bg-black text-zinc-100 overflow-hidden font-sans antialiased">
        <Header />
        <main className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col bg-black">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-100 font-sans antialiased">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
      <footer className="border-t border-zinc-800/60 py-6 text-center text-xs text-zinc-500 font-mono tracking-tight">
        <p>Dastaan Studio © 2026 • AI Social Media Content & Publishing Engine</p>
      </footer>
    </div>
  );
};
