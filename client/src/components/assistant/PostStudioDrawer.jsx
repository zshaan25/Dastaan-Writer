import React, { useEffect } from 'react';
import { X, FileEdit, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-4xl h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="h-14 px-4 sm:px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>LinkedIn Post Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {post.status || 'DRAFT'}
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Studio"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body (Embedded PostEditor) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-black">
          <PostEditor
            post={post}
            onRefine={onRefine}
            onSave={onSave}
            onApprove={onApprove}
            onGenerateAlternatives={onGenerateAlternatives}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default PostStudioDrawer;
