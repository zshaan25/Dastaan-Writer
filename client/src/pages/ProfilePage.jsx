import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  Clock,
  Lock,
  Camera,
  Bot,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { PersonalInfoSection } from '../components/profile/PersonalInfoSection';
import { AccountSettingsSection } from '../components/profile/AccountSettingsSection';
import { ActivityHistorySection } from '../components/profile/ActivityHistorySection';
import { PrivacyContextSection } from '../components/profile/PrivacyContextSection';
import { AvatarCropperModal } from '../components/profile/AvatarCropperModal';

export function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'security' | 'activity' | 'privacy'
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfileData = async (data) => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      await updateProfile(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvatar = async (avatarDataUrl) => {
    await handleSaveProfileData({ avatar: avatarDataUrl });
  };

  const tabs = [
    { id: 'personal', label: 'Personal & Voice Info', icon: User },
    { id: 'security', label: 'Account & Security', icon: Shield },
    { id: 'activity', label: 'Activity & Content', icon: TrendingUp },
    { id: 'privacy', label: 'Privacy & AI Memory', icon: Lock },
  ];

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-500 font-mono">Loading profile context...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 mx-auto">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Sign in to Access Profile</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create your voice context, upload your profile photo, and personalize your AI storytelling preferences.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link
              to="/login"
              className="flex-1 py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs rounded-xl transition text-center"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium rounded-xl transition text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 px-4">
      {/* 1. HERO USER BANNER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-5">
          {/* Avatar with Click-to-Crop Overlay - Pure Circular Shape */}
          <div className="relative group cursor-pointer shrink-0" onClick={() => setIsCropperOpen(true)}>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || 'User avatar'}
                className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700 shadow-md group-hover:border-emerald-400 transition"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:border-emerald-400 transition font-mono font-bold text-2xl">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-8 h-8 text-zinc-400" />}
              </div>
            )}

            {/* Circular Hover Camera Overlay */}
            <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-mono mt-0.5">Change</span>
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                {user?.name || 'Studio User'}
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Profile Grounded" />
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 font-medium truncate max-w-sm">
              {user?.profession || 'Add your title in Personal Info'}
            </p>
            <p className="text-xs text-zinc-500 font-mono">{user?.email}</p>
          </div>
        </div>

        {/* Quick Launch Studio CTA */}
        <Link
          to="/assistant"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs transition shadow-sm shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI Assistant</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>

      {/* 2. MODULAR TABS & CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Tab Navigation Rail (4 cols) */}
        <nav className="lg:col-span-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition text-left ${
                  isActive
                    ? 'bg-zinc-900 text-emerald-400 border border-zinc-700/80 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Active Section Card (8 cols) */}
        <main className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {activeTab === 'personal' && (
            <PersonalInfoSection
              user={user}
              onSave={handleSaveProfileData}
              saving={saving}
              saveSuccess={saveSuccess}
            />
          )}

          {activeTab === 'security' && <AccountSettingsSection user={user} />}

          {activeTab === 'activity' && <ActivityHistorySection />}

          {activeTab === 'privacy' && <PrivacyContextSection user={user} />}
        </main>
      </div>

      {/* Interactive Avatar Cropper Modal */}
      <AvatarCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        currentAvatar={user?.avatar}
        onSaveAvatar={handleSaveAvatar}
        userName={user?.name}
      />
    </div>
  );
}

export default ProfilePage;
