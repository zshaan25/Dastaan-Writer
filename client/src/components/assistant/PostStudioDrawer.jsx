import React, { useState, useEffect } from 'react';
import {
  X,
  FileEdit,
  Sparkles,
  Maximize2,
  Minimize2,
  Columns,
  Layers,
} from 'lucide-react';
import { PostEditor } from '../PostEditor';

export function PostStudioDrawer({
  isOpen,
  onClose,
  post,
  onRefine,
  onSave,
  onApprove,
  onGenerateAlternatives,
  loading,
}) {
  const [isFullscreen, setIsFullscreen] = useState(true);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Full-Row / Full-Screen Studio Workspace Container */}
      <div
        className={`relative h-full bg-zinc-950 border-zinc-800 shadow-2xl flex flex-col z-10 transition-all duration-300 ${
          isFullscreen
            ? 'w-full max-w-none inset-0 border-0'
            : 'w-full max-w-7xl max-h-[92vh] my-auto rounded-2xl border'
        }`}
      >
        {/* Studio Top Navigation Bar */}
        <div className="h-14 px-4 sm:px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2.5">
                <span>LinkedIn Post Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {post.status || 'DRAFT'}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Fullscreen / Modal Width */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition text-xs flex items-center gap-1 font-mono"
              title={isFullscreen ? 'Switch to Windowed View' : 'Switch to Full Screen'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-zinc-400" />
                  <span className="hidden sm:inline text-[11px]">Windowed</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline text-[11px]">Full Screen</span>
                </>
              )}
            </button>

            {/* Close Studio */}
            <button
              onClick={onClose}
              aria-label="Close Studio"
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Canvas Area (Embedded Full-Height PostEditor) */}
        <div className="flex-1 overflow-hidden bg-black flex flex-col">
          <PostEditor
            post={post}
            onRefine={onRefine}
            onSave={onSave}
            onApprove={onApprove}
            onGenerateAlternatives={onGenerateAlternatives}
            loading={loading}
            isFullRowMode={true}
          />
        </div>
      </div>
    </div>
  );
}

export default PostStudioDrawer;
