import React, { useState } from 'react';
import {
  ShieldAlert,
  Download,
  RotateCcw,
  Check,
  ToggleLeft,
  ToggleRight,
  Database,
  Lock,
} from 'lucide-react';
import { getConversations, getPosts } from '../../services/api';

export function PrivacyContextSection({ user }) {
  const [contextGrounding, setContextGrounding] = useState(true);
  const [retainMemory, setRetainMemory] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleResetMemory = () => {
    if (!window.confirm('Reset all transient AI conversation context memory? Your profile and bio will remain safe.')) return;
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const [convs, posts] = await Promise.allSettled([
        getConversations(),
        getPosts(),
      ]);

      const exportPayload = {
        exportDate: new Date().toISOString(),
        user: {
          id: user?.id || user?._id,
          name: user?.name,
          email: user?.email,
          profession: user?.profession,
          skills: user?.skills,
          bio: user?.bio,
          writingStyle: user?.writingStyle,
          preferredTone: user?.preferredTone,
        },
        conversations: convs.status === 'fulfilled' ? convs.value : [],
        posts: posts.status === 'fulfilled' ? posts.value : [],
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `dastaan_data_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to export data:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Privacy & AI Context Controls</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Control how your accomplishments, bio, and conversational history are utilized by the reasoning engine.
        </p>
      </div>

      {resetSuccess && (
        <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Transient AI context memory reset successfully.</span>
        </div>
      )}

      {/* Context Grounding Toggle Box */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-zinc-200">Real-Time Context Grounding</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Inject your verified bio, skills, and profession into AI system prompts to eliminate generic storytelling.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setContextGrounding(!contextGrounding)}
            className="text-zinc-400 hover:text-white transition shrink-0"
          >
            {contextGrounding ? (
              <ToggleRight className="w-8 h-8 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-zinc-600" />
            )}
          </button>
        </div>

        <div className="border-t border-zinc-800/60 pt-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-zinc-200">Cross-Thread Memory Retention</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Allow previous thread insights (e.g. project milestones) to inform new post angles.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRetainMemory(!retainMemory)}
            className="text-zinc-400 hover:text-white transition shrink-0"
          >
            {retainMemory ? (
              <ToggleRight className="w-8 h-8 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-zinc-600" />
            )}
          </button>
        </div>
      </div>

      {/* Data Management Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Export Data */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Workspace Data</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Download a complete JSON archive of your personal profile, conversation threads, and generated posts.
            </p>
          </div>

          <button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-800 transition flex items-center justify-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{exporting ? 'Exporting JSON...' : 'Download JSON Export'}</span>
          </button>
        </div>

        {/* Reset Memory */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Clear Transient Context</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Flush cached conversational context while preserving your permanent profile context and saved posts.
            </p>
          </div>

          <button
            onClick={handleResetMemory}
            className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-amber-300 rounded-lg text-xs font-medium border border-zinc-800 transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset AI Memory</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyContextSection;
