import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  PenTool,
  CheckCircle2,
  Layers,
  ShieldCheck,
  User,
  FileText,
  TrendingUp,
} from 'lucide-react';

export function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 max-w-5xl mx-auto py-8 px-4">
      {/* 1. HERO SECTION */}
      <div className="text-center space-y-5 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Dastaan — Storytelling Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          Turn your experience into <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            compelling stories.
          </span>
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Dastaan learns your verified background, achievements, and unique voice to craft high-impact LinkedIn content with zero generic fluff.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/assistant"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs sm:text-sm transition shadow-lg shadow-emerald-500/10"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Assistant Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs sm:text-sm font-medium transition"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Manage Profile & Voice Context</span>
            </Link>
          ) : (
            <Link
              to="/register"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs sm:text-sm font-medium transition"
            >
              <span>Create Free Account</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. AUTHENTICATED QUICK LAUNCH BANNER */}
      {isAuthenticated && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0 font-mono font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
              </div>
            )}
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Welcome back, {user?.name || 'Storyteller'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </h3>
              <p className="text-xs text-zinc-400">
                {user?.profession ? `Grounded in: ${user.profession}` : 'Personalize your AI voice in your profile'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              to="/profile"
              className="flex-1 sm:flex-none text-center px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition"
            >
              Edit Profile
            </Link>
            <Link
              to="/assistant"
              className="flex-1 sm:flex-none text-center px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <span>New Post</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE PRODUCT SHOWCASE MOCKUP */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">How Dastaan Works</h3>
              <p className="text-[11px] text-zinc-500 font-mono">From conversation to viral LinkedIn post</p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
            3-Step Workflow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
              1
            </div>
            <h4 className="text-xs font-semibold text-white">Chat Naturally</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tell the assistant what you shipped, learned, or solved. It extracts key metrics and narrative hooks.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
              2
            </div>
            <h4 className="text-xs font-semibold text-white">Grounded Post Draft</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              AI automatically structures a compelling hook, multi-paragraph body, and closing question in your tone.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
              3
            </div>
            <h4 className="text-xs font-semibold text-white">Post Studio & Polish</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Refine with 1-click AI transformations, preview live LinkedIn formatting, and approve or email directly.
            </p>
          </div>
        </div>
      </div>

      {/* 4. KEY CAPABILITIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Zero Hallucination</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Posts are strictly generated from your actual projects, skills, and background context.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
            <PenTool className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Adaptive Tone Tuning</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Switch between technical deep dives, story-driven lessons, and concise executive announcements.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Studio Workspace</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Generates 3 variations, custom hashtags, and email drafts via Resend integration.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
