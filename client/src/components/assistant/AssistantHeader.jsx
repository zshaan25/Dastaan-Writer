import React, { useState, useRef, useEffect } from 'react';
import {
  PanelLeft,
  PanelLeftClose,
  Menu,
  FileEdit,
  Sparkles,
  Share2,
  Trash2,
  Check,
  ChevronDown,
  Edit2,
  X,
} from 'lucide-react';

export function AssistantHeader({
  sidebarState,
  onToggleSidebar,
  onOpenMobileSidebar,
  activeConv,
  hasDraft,
  onToggleStudio,
  isStudioOpen,
  onDeleteCurrentThread,
  onRenameThread,
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [modelDropdown, setModelDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Gemini 2.0 Flash');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const titleInputRef = useRef(null);

  const isSidebarHidden = sidebarState === 'hidden';

  useEffect(() => {
    if (activeConv?.title) {
      setTitleValue(activeConv.title);
    }
  }, [activeConv?.title]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveTitle = () => {
    const trimmed = titleValue.trim();
    if (!trimmed) {
      setTitleValue(activeConv?.title || 'New Story Thread');
      setIsEditingTitle(false);
      return;
    }
    if (trimmed !== activeConv?.title && onRenameThread && activeConv?._id) {
      onRenameThread(activeConv._id, trimmed);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTitleValue(activeConv?.title || 'New Story Thread');
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20 select-none">
      {/* LEFT: SIDEBAR TOGGLE & THREAD TITLE */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Desktop Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition"
          title="Toggle sidebar ([)"
          aria-label="Toggle sidebar"
        >
          {isSidebarHidden ? (
            <PanelLeft className="w-4 h-4 text-zinc-300" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-zinc-300" />
          )}
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-4 h-4 text-zinc-300" />
        </button>

        {/* Thread Title with Inline Rename */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                maxLength={80}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleSaveTitle}
                className="px-2 py-0.5 bg-zinc-900 border border-emerald-400 rounded-md text-xs sm:text-sm font-semibold text-white focus:outline-none w-[180px] sm:w-[260px]"
                placeholder="Thread title..."
              />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSaveTitle();
                }}
                className="p-1 text-emerald-400 hover:bg-zinc-900 rounded"
                title="Save title"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setTitleValue(activeConv?.title || 'New Story Thread');
                  setIsEditingTitle(false);
                }}
                className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-lg hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800 transition text-left"
              title="Click to rename thread"
              aria-label={`Thread title: ${activeConv?.title || 'New Story Thread'}. Click to rename`}
            >
              <h1 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate max-w-[140px] sm:max-w-[260px]">
                {activeConv?.title || 'New Story Thread'}
              </h1>
              <Edit2 className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}

          {/* Model Selector Dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setModelDropdown(!modelDropdown)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[11px] font-mono text-zinc-300 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{selectedModel}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {modelDropdown && (
              <>
                <div
                  onClick={() => setModelDropdown(false)}
                  className="fixed inset-0 z-30"
                />
                <div className="absolute left-0 mt-1.5 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1 z-40 text-xs font-sans">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-zinc-500 border-b border-zinc-800">
                    Active Reasoning Engine
                  </div>
                  {[
                    { id: 'Gemini 2.0 Flash', desc: 'Fast, high-fidelity LinkedIn storytelling' },
                    { id: 'Gemini 2.0 Pro', desc: 'Deep technical analysis & multi-step drafts' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setModelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-zinc-800 transition flex flex-col ${
                        selectedModel === m.id ? 'text-emerald-400 bg-zinc-800/50 font-medium' : 'text-zinc-300'
                      }`}
                    >
                      <span>{m.id}</span>
                      <span className="text-[10px] text-zinc-500">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: ACTIONS & POST STUDIO TRIGGER */}
      <div className="flex items-center gap-2">
        {/* Share Button */}
        <button
          onClick={handleShare}
          title="Copy thread URL"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg transition"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Share</span>
            </>
          )}
        </button>

        {/* Delete Thread */}
        {activeConv && onDeleteCurrentThread && (
          <button
            onClick={onDeleteCurrentThread}
            title="Delete this conversation"
            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Post Studio Toggle Button */}
        <button
          onClick={onToggleStudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isStudioOpen
              ? 'bg-emerald-400 text-black font-semibold shadow-sm'
              : hasDraft
              ? 'bg-zinc-900 text-emerald-300 border border-emerald-500/40 hover:bg-zinc-850 shadow-sm'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800'
          }`}
        >
          <FileEdit className={`w-3.5 h-3.5 ${isStudioOpen ? 'text-black' : 'text-emerald-400'}`} />
          <span className="hidden sm:inline">
            {isStudioOpen ? 'Close Studio' : hasDraft ? 'Studio Draft Ready' : 'Open Post Studio'}
          </span>
          <span className="sm:hidden">{isStudioOpen ? 'Close' : 'Studio'}</span>
          {hasDraft && !isStudioOpen && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>
      </div>
    </header>
  );
}

export default AssistantHeader;
