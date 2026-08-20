import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Scissors,
  UserCheck,
  Code,
  PlusCircle,
  RotateCcw,
  Layers,
  FileText,
  Tag,
  AtSign,
  Loader2,
  Save,
  Mail,
  CheckCircle2,
  X,
  Plus,
  Sliders,
  Send,
  Eye,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { FormattedText } from '../utils/textFormatter';
import { sendPostEmail } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function PostEditor({
  post,
  onRefine,
  onSave,
  onApprove,
  onGenerateAlternatives,
  loading,
  isFullRowMode = true,
}) {
  if (!post) return null;

  const { user } = useAuth();
  const [hook, setHook] = useState(post.hook || '');
  const [body, setBody] = useState(post.body || '');
  const [cta, setCta] = useState(post.cta || '');
  const [hashtags, setHashtags] = useState(post.hashtags || []);
  const [mentions, setMentions] = useState(post.mentions || []);
  const [postType, setPostType] = useState(post.postType || 'ACHIEVEMENT');
  const [tone, setTone] = useState(post.tone || 'PROFESSIONAL');
  const [newTag, setNewTag] = useState('');
  const [newMention, setNewMention] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeVersionId, setActiveVersionId] = useState('working');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState(null);

  useEffect(() => {
    if (post) {
      setHook(post.hook || '');
      setBody(post.body || '');
      setCta(post.cta || '');
      setHashtags(Array.isArray(post.hashtags) ? post.hashtags : []);
      setMentions(Array.isArray(post.mentions) ? post.mentions : []);
      setPostType(post.postType || 'ACHIEVEMENT');
      setTone(post.tone || 'PROFESSIONAL');
      if (post.status === 'APPROVED') {
        setApproveSuccess(true);
      }
    }
  }, [post]);

  const handleAddTag = (e) => {
    e?.preventDefault();
    if (!newTag.trim()) return;
    let tag = newTag.trim().replace(/[^a-zA-Z0-9#_]/g, '');
    if (!tag.startsWith('#')) tag = `#${tag}`;
    if (!hashtags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setHashtags([...hashtags, tag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setHashtags(hashtags.filter((t) => t !== tagToRemove));
  };

  const handleAddMention = (e) => {
    e?.preventDefault();
    if (!newMention.trim()) return;
    let mention = newMention.trim().replace(/[^a-zA-Z0-9@_]/g, '');
    if (!mention.startsWith('@')) mention = `@${mention}`;
    if (!mentions.some((m) => m.toLowerCase() === mention.toLowerCase())) {
      setMentions([...mentions, mention]);
    }
    setNewMention('');
  };

  const handleRemoveMention = (mentionToRemove) => {
    setMentions(mentions.filter((m) => m !== mentionToRemove));
  };

  const handleAction = (action, value = null) => {
    if (onRefine) {
      onRefine(action, value);
    }
  };

  const handleSaveManualEdits = () => {
    if (onSave) {
      onSave({
        hook,
        body,
        cta,
        hashtags,
        mentions,
        postType,
        tone,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove();
      setApproveSuccess(true);
    }
  };

  const handleSelectVersion = (version) => {
    if (version === 'working') {
      setActiveVersionId('working');
      setHook(post.hook || '');
      setBody(post.body || '');
      setCta(post.cta || '');
      setHashtags(post.hashtags || []);
      setMentions(post.mentions || []);
      return;
    }

    setActiveVersionId(version.id);
    setHook(version.hook || '');
    setBody(version.body || '');
    setCta(version.cta || '');
    if (version.hashtags) setHashtags(version.hashtags);
    if (version.mentions) setMentions(version.mentions);
  };

  const copyFullPost = () => {
    const parts = [];
    if (hook.trim()) parts.push(hook.trim());
    if (body.trim()) parts.push(body.trim());
    if (cta.trim()) parts.push(cta.trim());
    if (hashtags.length > 0) parts.push(hashtags.join(' '));
    if (mentions.length > 0) parts.push(mentions.join(' '));

    const fullText = parts.join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailPost = async () => {
    if (!post?._id) return;
    try {
      setEmailing(true);
      setEmailError(null);
      await sendPostEmail(post._id);
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to email post:', err);
      setEmailError(err.response?.data?.message || err.message || 'Failed to send email');
    } finally {
      setEmailing(false);
    }
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const totalWords = (hook + ' ' + body + ' ' + cta).trim().split(/\s+/).filter(Boolean).length;
  const readTimeSeconds = Math.max(1, Math.round((totalWords / 200) * 60));

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-text overflow-hidden">
      {/* 1. TOP TOOLBAR: REFINEMENT PILLS & TONE SWITCHER */}
      <div className="px-4 sm:px-6 py-2.5 bg-zinc-950 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Quick AI Actions Toolbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
          <span className="text-[11px] font-mono uppercase text-zinc-500 flex items-center gap-1 shrink-0 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Transform:
          </span>

          {[
            { label: 'Improve Hook', action: 'IMPROVE_HOOK', icon: Sparkles },
            { label: 'Shorter', action: 'MAKE_SHORTER', icon: Scissors },
            { label: 'Personal', action: 'MAKE_MORE_PERSONAL', icon: UserCheck },
            { label: 'Technical', action: 'MAKE_MORE_TECHNICAL', icon: Code },
            { label: 'Professional', action: 'MAKE_MORE_PROFESSIONAL', icon: Zap },
            { label: 'Improve Flow', action: 'IMPROVE_FLOW', icon: Layers },
            { label: 'Simplify', action: 'SIMPLIFY', icon: RotateCcw },
          ].map(({ label, action, icon: Icon }) => (
            <button
              key={action}
              type="button"
              onClick={() => handleAction(action)}
              disabled={loading}
              className="text-xs text-zinc-300 hover:text-emerald-400 hover:bg-zinc-900 bg-zinc-900/60 border border-zinc-800 px-2.5 py-1 rounded-lg transition disabled:opacity-40 flex items-center gap-1 shrink-0 font-medium"
            >
              <Icon className="w-3 h-3 text-zinc-400" />
              <span>{label}</span>
            </button>
          ))}

          {cta ? (
            <button
              type="button"
              onClick={() => handleAction('REMOVE_CTA')}
              disabled={loading}
              className="text-xs text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 bg-zinc-900/60 border border-zinc-800 px-2.5 py-1 rounded-lg transition disabled:opacity-40 flex items-center gap-1 shrink-0"
            >
              <X className="w-3 h-3 text-zinc-500" />
              <span>Remove CTA</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleAction('ADD_CTA')}
              disabled={loading}
              className="text-xs text-zinc-300 hover:text-emerald-400 hover:bg-zinc-900 bg-zinc-900/60 border border-zinc-800 px-2.5 py-1 rounded-lg transition disabled:opacity-40 flex items-center gap-1 shrink-0"
            >
              <PlusCircle className="w-3 h-3 text-emerald-400" />
              <span>Add CTA</span>
            </button>
          )}

          {onGenerateAlternatives && (
            <button
              type="button"
              onClick={onGenerateAlternatives}
              disabled={loading}
              className="text-xs text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30 transition disabled:opacity-40 flex items-center gap-1 shrink-0 font-semibold"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>3 Versions</span>
            </button>
          )}
        </div>

        {/* Right: Target Tone Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-zinc-400 font-mono">Tone:</label>
          <select
            value={tone}
            onChange={(e) => {
              const newT = e.target.value;
              setTone(newT);
              handleAction('CHANGE_TONE', newT);
            }}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="PROFESSIONAL">Professional</option>
            <option value="STORYTELLING">Storytelling</option>
            <option value="TECHNICAL">Technical</option>
            <option value="PERSONAL">Personal</option>
            <option value="CONFIDENT">Confident</option>
            <option value="MINIMAL">Minimal</option>
          </select>
        </div>
      </div>

      {/* 2. ALTERNATIVE VERSIONS TABS (IF MULTIPLE VERSIONS EXIST) */}
      {Array.isArray(post.versions) && post.versions.length > 0 && (
        <div className="px-6 py-2 bg-zinc-900/40 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-zinc-400" /> Variations:
          </span>
          <button
            onClick={() => handleSelectVersion('working')}
            className={`px-3 py-1 text-xs rounded-lg transition whitespace-nowrap font-medium ${
              activeVersionId === 'working'
                ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Working Draft
          </button>
          {post.versions.map((ver, idx) => (
            <button
              key={ver.id || idx}
              onClick={() => handleSelectVersion(ver)}
              className={`px-3 py-1 text-xs rounded-lg transition whitespace-nowrap font-medium ${
                activeVersionId === ver.id
                  ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {ver.label || `Variation ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* 3. FULL-ROW SIDE-BY-SIDE WORKSPACE (50% EDITOR / 50% LIVE PREVIEW) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: STRUCTURED POST EDITOR (INDEPENDENT SCROLL) */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto p-5 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-zinc-800/80 bg-zinc-950">
          {/* HOOK INPUT */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Hook (Opening Line)</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">{hook.length} characters</span>
            </div>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Write a clear, high-impact opening line..."
              className="w-full p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition"
            />
          </div>

          {/* MULTI-PARAGRAPH BODY TEXTAREA (EXPANSIVE FULL HEIGHT) */}
          <div className="space-y-1.5 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span>Post Body & Narrative</span>
              </label>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                <span className="text-emerald-400 font-semibold">{wordCount} words</span>
                <span>•</span>
                <span>{body.length} characters</span>
              </div>
            </div>
            <textarea
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Detail your insight, workflow, technical takeaways, or project milestones..."
              className="w-full p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 leading-relaxed min-h-[280px] transition font-sans resize-y"
            />
          </div>

          {/* CALL TO ACTION (CTA) INPUT */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span>Call to Action (CTA)</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Optional closing question</span>
            </div>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="e.g. What strategy has delivered the highest ROI for your engineering team?"
              className="w-full p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition"
            />
          </div>

          {/* HASHTAGS & MENTIONS MANAGERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Hashtags Tag Manager */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" /> Hashtags ({hashtags.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {hashtags.length === 0 ? (
                  <span className="text-xs text-zinc-600 italic">No hashtags added</span>
                ) : (
                  hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-zinc-500 hover:text-rose-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <form onSubmit={handleAddTag} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add #tag..."
                  className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={!newTag.trim()}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Mentions Manager */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5 font-semibold">
                  <AtSign className="w-3.5 h-3.5 text-emerald-400" /> Mentions ({mentions.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {mentions.length === 0 ? (
                  <span className="text-xs text-zinc-600 italic">No mentions added</span>
                ) : (
                  mentions.map((mention) => (
                    <span
                      key={mention}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs"
                    >
                      {mention}
                      <button
                        type="button"
                        onClick={() => handleRemoveMention(mention)}
                        className="text-zinc-500 hover:text-rose-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <form onSubmit={handleAddMention} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={newMention}
                  onChange={(e) => setNewMention(e.target.value)}
                  placeholder="Add @mention..."
                  className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!newMention.trim()}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FULL-HEIGHT LIVE LINKEDIN FEED SIMULATION (INDEPENDENT SCROLL) */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto p-5 sm:p-8 bg-zinc-900/30 space-y-4 flex flex-col">
          {/* Live Preview Header & Stats */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Live LinkedIn Feed Simulation
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" /> {readTimeSeconds}s read
              </span>
              <span>•</span>
              <span>{totalWords} total words</span>
            </div>
          </div>

          {/* LinkedIn Simulated Post Card */}
          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 shadow-xl font-sans">
            {/* LinkedIn Author Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/80">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-11 h-11 rounded-full object-cover border border-zinc-700 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-zinc-100 truncate">
                  {user?.name || 'Your Name'}
                </div>
                <div className="text-xs text-zinc-400 truncate">
                  {user?.profession || 'Full Stack & AI Engineer'}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                  <span>Just now</span>
                  <span>•</span>
                  <span>🌐 Public</span>
                </div>
              </div>
            </div>

            {/* Post Content Body */}
            <div className="space-y-3 text-sm leading-relaxed text-zinc-200">
              {/* Hook */}
              {hook ? (
                <div className="font-bold text-zinc-100 text-base leading-snug">
                  <FormattedText text={hook} />
                </div>
              ) : (
                <div className="text-xs text-zinc-600 italic">No opening hook entered...</div>
              )}

              {/* Body */}
              {body ? (
                <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  <FormattedText text={body} />
                </div>
              ) : (
                <div className="text-xs text-zinc-600 italic">No body text entered...</div>
              )}

              {/* CTA */}
              {cta && (
                <div className="font-semibold text-emerald-400 pt-1">
                  <FormattedText text={cta} />
                </div>
              )}

              {/* Hashtags */}
              {hashtags.length > 0 && (
                <div className="text-xs text-emerald-400/90 font-mono pt-1 leading-relaxed">
                  {hashtags.join(' ')}
                </div>
              )}

              {/* Mentions */}
              {mentions.length > 0 && (
                <div className="text-xs text-zinc-400 font-medium">
                  {mentions.join(' ')}
                </div>
              )}
            </div>

            {/* LinkedIn Simulated Social Engagement Bar */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">👍</span>
                <span>Ready to publish</span>
              </span>
              <span className="text-[11px] font-mono">LinkedIn Format Verified ✓</span>
            </div>
          </div>

          {emailError && (
            <div className="p-3 bg-zinc-900 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center justify-between">
              <span>{emailError}</span>
              <button onClick={() => setEmailError(null)} className="text-rose-400 hover:text-white">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* 4. BOTTOM OUTPUT ACTION BAR */}
      <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="text-xs text-zinc-400 flex items-center gap-2">
          {saveSuccess ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-mono font-medium">
              <Check className="w-4 h-4" /> Changes saved to workspace.
            </span>
          ) : approveSuccess ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-mono font-medium">
              <CheckCircle2 className="w-4 h-4" /> Post approved for LinkedIn.
            </span>
          ) : (
            <span className="text-zinc-500 text-xs font-mono">Working draft ready for editing and approval.</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* SAVE DRAFT */}
          <button
            type="button"
            onClick={handleSaveManualEdits}
            disabled={loading}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-medium transition border border-zinc-800 flex items-center gap-1.5"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{saveSuccess ? 'Saved' : 'Save Draft'}</span>
          </button>

          {/* COPY POST */}
          <button
            type="button"
            onClick={copyFullPost}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-medium transition border border-zinc-800 flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Post</span>
              </>
            )}
          </button>

          {/* EMAIL ME */}
          <button
            type="button"
            onClick={handleEmailPost}
            disabled={emailing || !post?._id}
            title="Email draft to your address"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-medium transition border border-zinc-800 flex items-center gap-1.5 disabled:opacity-40"
          >
            {emailing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Sending...</span>
              </>
            ) : emailSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Sent to Email</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Email Me</span>
              </>
            )}
          </button>

          {/* APPROVE POST (PRIMARY EMERALD CTA) */}
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading || post.status === 'APPROVED'}
            className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-black rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{post.status === 'APPROVED' ? 'Approved ✓' : 'Approve Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostEditor;
