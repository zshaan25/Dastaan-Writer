import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  MessageSquare,
  Search,
  PanelLeftClose,
  PanelLeft,
  Minimize2,
  Maximize2,
  Sparkles,
  User,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DastaanLogo } from '../DastaanLogo';

/**
 * Group conversations chronologically: Today, Yesterday, Previous 7 Days, Older
 */
function groupConversationsByDate(conversations) {
  const groups = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const lastWeekStart = todayStart - 7 * 86400000;

  conversations.forEach((conv) => {
    const time = new Date(conv.updatedAt || conv.createdAt).getTime();
    if (time >= todayStart) {
      groups.today.push(conv);
    } else if (time >= yesterdayStart) {
      groups.yesterday.push(conv);
    } else if (time >= lastWeekStart) {
      groups.lastWeek.push(conv);
    } else {
      groups.older.push(conv);
    }
  });

  return groups;
}

export function AssistantSidebar({
  sidebarState,
  onToggle,
  onCycle,
  conversations,
  activeConvId,
  onSelectConv,
  onCreateNew,
  onDeleteConv,
  onRenameConv,
  loading,
  isMobileOpen,
  onCloseMobile,
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.messages?.some((m) => m.content?.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  const grouped = useMemo(
    () => groupConversationsByDate(filteredConversations),
    [filteredConversations]
  );

  const isCompact = sidebarState === 'compact';
  const isExpanded = sidebarState === 'expanded';
  const isHidden = sidebarState === 'hidden';

  const handleStartRename = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv._id);
    setEditValue(conv.title || 'Untitled Thread');
  };

  const handleSaveRename = (convId) => {
    const trimmed = editValue.trim();
    if (trimmed && onRenameConv) {
      onRenameConv(convId, trimmed);
    }
    setEditingId(null);
  };

  const handleRenameKeyDown = (e, convId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename(convId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingId(null);
    }
  };

  // Render a thread item
  const renderThreadItem = (conv) => {
    const isActive = activeConvId === conv._id;
    const isEditingThis = editingId === conv._id;
    const hasPost = Boolean(conv.postId || conv.status === 'DRAFT_GENERATED' || conv.status === 'COMPLETED');

    if (isCompact) {
      return (
        <div key={conv._id} className="relative group/compact">
          <button
            onClick={() => onSelectConv(conv._id)}
            title={`${conv.title || 'Untitled Thread'}${hasPost ? ' (Draft Ready)' : ''}`}
            className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-all ${
              isActive
                ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            {hasPost ? (
              <FileText className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-300'}`} />
            ) : (
              <MessageSquare className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
            )}
          </button>
          {hasPost && (
            <span
              className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950"
              title="Draft Ready"
            />
          )}
        </div>
      );
    }

    if (isEditingThis) {
      return (
        <div
          key={conv._id}
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg bg-zinc-900 border border-emerald-400/80 flex items-center gap-1.5 text-xs shadow-sm"
        >
          <input
            type="text"
            autoFocus
            value={editValue}
            maxLength={80}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => handleRenameKeyDown(e, conv._id)}
            onBlur={() => handleSaveRename(conv._id)}
            className="flex-1 bg-transparent px-1.5 py-0.5 text-xs text-white focus:outline-none"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSaveRename(conv._id);
            }}
            className="p-0.5 text-emerald-400 hover:bg-zinc-800 rounded"
          >
            ✓
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setEditingId(null);
            }}
            className="p-0.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded"
          >
            ✕
          </button>
        </div>
      );
    }

    return (
      <div
        key={conv._id}
        onClick={() => onSelectConv(conv._id)}
        className={`group relative px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs border ${
          isActive
            ? 'bg-zinc-900 border-zinc-700/80 text-zinc-100 font-medium shadow-sm'
            : 'bg-transparent border-transparent hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
          {hasPost ? (
            <FileText
              className={`w-3.5 h-3.5 shrink-0 ${
                isActive ? 'text-emerald-400' : 'text-emerald-500/80 group-hover:text-emerald-400'
              }`}
            />
          ) : (
            <MessageSquare
              className={`w-3.5 h-3.5 shrink-0 ${
                isActive ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-500'
              }`}
            />
          )}
          <span className="truncate">{conv.title || 'Untitled Post'}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {hasPost ? (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-zinc-900 text-emerald-400/90 border-emerald-500/20 group-hover:border-emerald-500/40'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Draft</span>
            </span>
          ) : conv.messages?.length > 0 ? (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900/70 text-zinc-500 border border-zinc-800/80">
              Context
            </span>
          ) : null}

          <button
            onClick={(e) => handleStartRename(e, conv)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:text-zinc-200 text-zinc-500 rounded transition-opacity"
            title="Rename thread"
            aria-label="Rename thread"
          >
            <span className="text-[11px] font-mono">✎</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteConv(e, conv._id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-zinc-500 rounded transition-opacity"
            title="Delete thread"
            aria-label="Delete thread"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  const renderGroup = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div key={title} className="space-y-1">
        {!isCompact && (
          <div className="px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            {title}
          </div>
        )}
        <div className="space-y-0.5">{items.map(renderThreadItem)}</div>
      </div>
    );
  };

  // Content shared between Desktop sidebar and Mobile Drawer
  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-zinc-950 text-zinc-100 select-none">
      {/* 1. TOP HEADER & NEW CHAT ACTION */}
      <div className="p-3 border-b border-zinc-800/80 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          {!isCompact ? (
            <Link to="/" className="flex items-center gap-2 group">
              <DastaanLogo size={24} className="rounded-md shadow-sm" />
              <span className="text-xs font-bold tracking-tight text-white">
                Dastaan
              </span>
            </Link>
          ) : (
            <Link to="/" className="mx-auto block" title="Dastaan Home">
              <DastaanLogo size={28} className="rounded-md shadow-sm" />
            </Link>
          )}

          <div className="flex items-center gap-1">
            {!isCompact && (
              <button
                onClick={onCycle}
                className="hidden lg:flex p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition"
                title="Compact view"
                aria-label="Compact sidebar"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            )}

            {isCompact && (
              <button
                onClick={onCycle}
                className="hidden lg:flex p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition mx-auto mt-1"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onToggle}
              className="hidden lg:flex p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition"
              title="Toggle sidebar ([)"
              aria-label="Toggle sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg transition"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Thread CTA */}
        {!isCompact ? (
          <button
            onClick={onCreateNew}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 hover:text-white rounded-lg text-xs font-medium border border-zinc-800 hover:border-zinc-700 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New post thread</span>
          </button>
        ) : (
          <button
            onClick={onCreateNew}
            title="New post thread"
            aria-label="New post thread"
            className="w-10 h-10 mx-auto bg-zinc-900 hover:bg-zinc-800 text-emerald-400 rounded-lg flex items-center justify-center border border-zinc-800 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {/* Search Bar in Expanded Mode */}
        {!isCompact && (
          <div className="relative pt-0.5">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. CHAT THREADS LIST (VIRTUALIZED-READY CHRONOLOGICAL SCROLLER) */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 space-y-2">
            <div className="w-4 h-4 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin mx-auto" />
            {!isCompact && <p className="text-[11px] font-mono">Loading history...</p>}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 text-xs">
            {!isCompact ? 'No threads found' : '—'}
          </div>
        ) : (
          <>
            {renderGroup('Today', grouped.today)}
            {renderGroup('Yesterday', grouped.yesterday)}
            {renderGroup('Previous 7 Days', grouped.lastWeek)}
            {renderGroup('Older', grouped.older)}
          </>
        )}
      </div>

      {/* 3. BOTTOM USER / CONTEXT FOOTER */}
      <div className="p-3 border-t border-zinc-800/80 shrink-0 bg-zinc-950">
        {!isCompact ? (
          <div className="space-y-2">
            <Link
              to="/profile"
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition text-xs group"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-zinc-700 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-mono text-[10px] shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                )}
                <div className="truncate">
                  <div className="font-medium text-zinc-200 truncate">{user?.name || 'Studio User'}</div>
                  <div className="text-[10px] text-zinc-500 truncate flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Profile & Settings</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <Link
            to="/profile"
            title={`${user?.name || 'User'} (Profile & Settings)`}
            className="w-10 h-10 mx-auto rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 transition overflow-hidden"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-emerald-400" />
            )}
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE OVERLAY DRAWER */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10 border-r border-zinc-800 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* DESKTOP RESPONSIVE SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col border-r border-zinc-800/80 h-full transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isHidden
            ? 'w-0 border-none'
            : isCompact
            ? 'w-[60px]'
            : 'w-[280px]'
        }`}
      >
        <div className={isCompact ? 'w-[60px] h-full' : 'w-[280px] h-full'}>
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}

export default AssistantSidebar;
