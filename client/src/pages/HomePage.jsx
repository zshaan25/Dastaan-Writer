import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, RefreshCw, Server, Sparkles, User, Briefcase, Award, Edit3, Save, ShieldCheck, KeyRound } from 'lucide-react';

export const HomePage = () => {
  const { user, isAuthenticated, token, updateProfile } = useAuth();
  const { health, loading: healthLoading, error: healthError, refetch } = useHealthCheck();

  // Profile Editor state
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [profession, setProfession] = useState('');
  const [skills, setSkills] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const [preferredTone, setPreferredTone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setProfession(user.profession || '');
      setSkills(Array.isArray(user.skills) ? user.skills.join(', ') : '');
      setWritingStyle(user.writingStyle || '');
      setPreferredTone(user.preferredTone || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      await updateProfile({
        bio,
        profession,
        skills: skillsArray,
        writingStyle,
        preferredTone,
      });
      setSaveSuccess(true);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" /> Dastaan Phase 2 - Database & Authentication
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          AI Professional Context <span className="gradient-text">& Authenticated Profiles</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Secure MongoDB persistence, bcrypt password hashing, and JWT authorization protecting user contexts.
        </p>
      </div>

      {/* Authenticated User Profile View & Editor */}
      {isAuthenticated ? (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-indigo-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-600/20 rounded-xl text-indigo-400 border border-indigo-500/30">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3.5 py-2 rounded-xl transition font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" /> {editing ? 'Cancel Edit' : 'Edit Context Profile'}
            </button>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Profile context updated via PUT /api/users/me!</span>
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Profession / Role</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Senior Full Stack Engineer"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, NestJS, TypeScript, MongoDB"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professional Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Building high impact AI tools and scalable full stack web applications..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Writing Style</label>
                  <input
                    type="text"
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    placeholder="Concise, Story-driven, Analytical"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Tone</label>
                  <input
                    type="text"
                    value={preferredTone}
                    onChange={(e) => setPreferredTone(e.target.value)}
                    placeholder="Professional yet approachable"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-medium transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Profile Context'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Profession</div>
                <div className="text-slate-200 font-semibold">{user?.profession || 'Not set yet'}</div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-purple-400" /> Skills</div>
                <div className="text-slate-200 font-semibold">
                  {user?.skills?.length ? user.skills.join(', ') : 'Not set yet'}
                </div>
              </div>

              <div className="sm:col-span-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Professional Context Bio</div>
                <p className="text-slate-300 leading-relaxed">{user?.bio || 'No bio specified yet. Click "Edit Context Profile" above.'}</p>
              </div>
            </div>
          )}

          {/* Active JWT Debug Badge */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">JWT Bearer: {token?.substring(0, 30)}...</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">Authenticated</span>
          </div>
        </div>
      ) : (
        /* Guest Callout */
        <div className="glass-card rounded-2xl p-8 text-center space-y-4 border border-slate-800 shadow-xl">
          <div className="p-3 bg-purple-600/10 text-purple-400 rounded-2xl w-fit mx-auto border border-purple-500/20">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Register a new account or sign in to test MongoDB persistence, bcrypt password hashing, and protected profile API endpoints.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl font-medium text-xs border border-slate-700 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium text-xs transition shadow-lg shadow-indigo-600/20"
            >
              Register New Account
            </Link>
          </div>
        </div>
      )}

      {/* Backend API Health Status */}
      <div className="glass-card rounded-2xl p-6 space-y-4 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-xl text-slate-300 border border-slate-700">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">System API & Database Health</h3>
              <p className="text-xs text-slate-400">GET /api/health</p>
            </div>
          </div>
          <button
            onClick={refetch}
            disabled={healthLoading}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
            Check API
          </button>
        </div>

        <div>
          {healthLoading ? (
            <div className="flex items-center space-x-2 text-slate-400 text-xs py-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Verifying backend connectivity...</span>
            </div>
          ) : healthError ? (
            <div className="flex items-center space-x-2 text-red-400 text-xs py-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>API Offline ({healthError})</span>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-slate-900/90 px-4 py-2.5 rounded-xl border border-emerald-500/30 text-xs">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-emerald-300">API Status: OK</span>
              </div>
              <span className="text-slate-400 font-mono">Service: {health?.service}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
