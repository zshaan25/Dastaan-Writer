import React, { useState } from 'react';
import {
  Key,
  Shield,
  LogOut,
  Check,
  AlertCircle,
  Clock,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AccountSettingsSection({ user }) {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      // Simulate password change API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      setPasswordError('Failed to update password. Please check your credentials.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-zinc-800/80 pb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Account Settings & Security</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Manage your login credentials, active sessions, and authentication security.
        </p>
      </div>

      {/* Account Details Box */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
          Account Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-zinc-500 block">Primary Email</span>
            <span className="text-zinc-200 font-mono font-medium">{user?.email}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">User ID</span>
            <span className="text-zinc-400 font-mono text-[11px] truncate block">{user?.id || user?._id || 'Verified'}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Account Status</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium font-mono mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Active & Grounded</span>
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Joined</span>
            <span className="text-zinc-300 font-mono">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Password Change Form */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono flex items-center gap-2">
          <Key className="w-3.5 h-3.5 text-emerald-400" />
          <span>Change Password</span>
        </h3>

        {passwordSuccess && (
          <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Password updated successfully!</span>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-mono uppercase text-zinc-400">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-zinc-400">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-zinc-400">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword || !newPassword}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-lg text-xs font-medium transition"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Active Session & Logout */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Laptop className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">Current Device Session</h4>
            <p className="text-[11px] text-zinc-500 font-mono">
              Browser session active • JWT authenticated
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out of Dastaan</span>
        </button>
      </div>
    </div>
  );
}

export default AccountSettingsSection;
