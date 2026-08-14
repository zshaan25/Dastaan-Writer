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
} from 'lucide-react';
import { FormattedText } from '../utils/textFormatter';
import { sendPostEmail } from '../services/api';

export function PostEditor({
  post,
  onRefine,
  onSave,
  onApprove,
  onGenerateAlternatives,
  loading,
}) {
  if (!post) return null;

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

  // Synchronize state when post prop updates from server
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

  const handleSaveManualEdits = async () => {
    if (!onSave) return;
    await onSave({
      hook,
      body,
      cta,
      hashtags,
      mentions,
      postType,
      tone,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleApprove = async () => {
    if (onApprove) {
      await onApprove(post._id);
    } else if (onSave) {
      await onSave({
        hook,
        body,
        cta,
        hashtags,
        mentions,
        postType,
        tone,
        status: 'APPROVED',
      });
    }
    setApproveSuccess(true);
  };

  const handleAction = async (action, newTone) => {
    if (!onRefine) return;
    await onRefine({
      refinementAction: action,
      newTone: newTone || tone,
      workingVersion: {
        hook,
        body,
        cta,
        hashtags,
        mentions,
      },
    });
    setActiveVersionId('working');
  };

  const handleSelectVersion = (version) => {
    if (version === 'working') {
      setActiveVersionId('working');
      setHook(post.hook || '');
      setBody(post.body || '');
      setCta(post.cta || '');
      setHashtags(post.hashtags || []);
      setMentions(post.mentions || []);
      setTone(post.tone || 'PROFESSIONAL');
      return;
    }

    setActiveVersionId(version.id);
    setHook(version.hook || '');
    setBody(version.body || '');
    setCta(version.cta || '');
    setHashtags(version.hashtags || []);
    setMentions(version.mentions || []);
    if (version.tone) setTone(version.tone);
  };

  const fullPostText = `${hook}\n\n${body}${cta ? `\n\n${cta}` : ''}\n\n${hashtags.join(' ')}${
    mentions.length > 0 ? `\n${mentions.join(' ')}` : ''
  }`.trim();

  const copyFullPost = () => {
    navigator.clipboard.writeText(fullPostText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailPost = async () => {
    if (!post?._id || emailing) return;
    try {
      setEmailing(true);
      setEmailError(null);
      setEmailSuccess(false);
      await sendPostEmail(post._id);
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send email';
      setEmailError(errorMsg);
      setTimeout(() => setEmailError(null), 4000);
    } finally {
      setEmailing(false);
    }
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = fullPostText.length;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col shadow-2xl backdrop-blur-md overflow-hidden">
      {/* 1. TOP HEADER & METADATA BAR */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">Canonical Post Workspace</h3>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                  post.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : post.status === 'EDITED'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : post.status === 'READY_FOR_REVIEW'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {post.status || 'DRAFT'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Single source of truth. Edit fields, apply AI refinements, or review live preview.
            </p>
          </div>
        </div>

        {/* Type & Tone Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Type:</span>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ACHIEVEMENT" className="bg-slate-900">Achievement</option>
              <option value="PROJECT" className="bg-slate-900">Project</option>
              <option value="LEARNING" className="bg-slate-900">Learning</option>
              <option value="CAREER_UPDATE" className="bg-slate-900">Career Update</option>
              <option value="ANNOUNCEMENT" className="bg-slate-900">Announcement</option>
              <option value="THOUGHT_LEADERSHIP" className="bg-slate-900">Thought Leadership</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Tone:</span>
            <select
              value={tone}
              onChange={(e) => {
                const newT = e.target.value;
                setTone(newT);
                handleAction('CHANGE_TONE', newT);
              }}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="PROFESSIONAL" className="bg-slate-900">Professional</option>
              <option value="PERSONAL" className="bg-slate-900">Personal</option>
              <option value="TECHNICAL" className="bg-slate-900">Technical</option>
              <option value="STORYTELLING" className="bg-slate-900">Storytelling</option>
              <option value="CONFIDENT" className="bg-slate-900">Confident</option>
              <option value="MINIMAL" className="bg-slate-900">Minimal</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. ALTERNATIVE VERSIONS SWITCHER BAR (if 3 versions exist) */}
      {Array.isArray(post.versions) && post.versions.length > 0 && (
        <div className="px-4 sm:px-6 py-2.5 bg-indigo-950/30 border-b border-indigo-900/40 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Variations:
          </span>
          <button
            onClick={() => handleSelectVersion('working')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              activeVersionId === 'working'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Working Draft
          </button>
          {post.versions.map((ver, idx) => (
            <button
              key={ver.id || idx}
              onClick={() => handleSelectVersion(ver)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeVersionId === ver.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {ver.label || `Version ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* 3. MAIN WORKSPACE: 2-COLUMN SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 items-start">
        {/* LEFT COLUMN: STRUCTURED FIELD EDITOR & REFINEMENTS (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          {/* HOOK FIELD */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Hook (Opening Line)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">{hook.length} chars</span>
            </div>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="e.g. Completing my AI automation internship taught me one critical lesson about scalable workflows."
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* BODY FIELD */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> Post Body
              </label>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{body.length} chars</span>
              </div>
            </div>
            <textarea
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Detail the experience, what tools you used, technical challenges overcome, and concrete insights..."
              className="w-full px-3.5 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y font-sans"
            />
          </div>

          {/* CALL TO ACTION FIELD */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-indigo-400" /> Call to Action (CTA)
              </label>
              <span className="text-[10px] text-slate-500">Optional closing prompt</span>
            </div>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="e.g. What automation patterns have made the biggest difference in your team's workflow?"
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* HASHTAGS & MENTIONS CHIP EDITORS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hashtags Chip Editor */}
            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Hashtags ({hashtags.length})
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-mono text-[11px] font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400 transition"
                      title="Remove tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add #tag..."
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={!newTag.trim()}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Mentions Chip Editor */}
            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                <AtSign className="w-3.5 h-3.5 text-indigo-400" /> Mentions ({mentions.length})
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {mentions.length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">No mentions tagged</span>
                ) : (
                  mentions.map((mention) => (
                    <span
                      key={mention}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-medium"
                    >
                      {mention}
                      <button
                        type="button"
                        onClick={() => handleRemoveMention(mention)}
                        className="hover:text-rose-400 transition"
                        title="Remove mention"
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
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newMention.trim()}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* 4. AI REFINEMENT CONTROLS GROUP */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" /> AI Refinements & Transformations
              </span>
              <span className="text-[10px] text-slate-500">Operates on current working draft</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAction('REGENERATE')}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-50 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-700"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />}
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('IMPROVE_HOOK')}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-50 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Improve Hook</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('MAKE_SHORTER')}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-50 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-700"
              >
                <Scissors className="w-3.5 h-3.5 text-blue-400" />
                <span>Make Shorter</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('MAKE_MORE_PERSONAL')}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-50 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-700"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Make Personal</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('MAKE_MORE_TECHNICAL')}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-50 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-700"
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Make Technical</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('MAKE_MORE_PROFESSIONAL')}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-50 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-700"
              >
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Make Professional</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('IMPROVE_FLOW')}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-50 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-700"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Improve Flow</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('SIMPLIFY')}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-50 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Simplify</span>
              </button>

              {cta ? (
                <button
                  type="button"
                  onClick={() => handleAction('REMOVE_CTA')}
                  disabled={loading}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-50 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-700"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  <span>Remove CTA</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAction('ADD_CTA')}
                  disabled={loading}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 disabled:opacity-50 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-slate-700"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add CTA</span>
                </button>
              )}

              {onGenerateAlternatives && (
                <button
                  type="button"
                  onClick={onGenerateAlternatives}
                  disabled={loading}
                  className="px-3 py-1.5 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-200 disabled:opacity-50 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border border-indigo-500/40"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>3 Versions</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE LINKEDIN PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col space-y-3 sticky top-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Live LinkedIn Preview
            </span>
            <span className="text-[11px] text-slate-500">Real-time formatting</span>
          </div>

          {/* LinkedIn Simulated Post Card */}
          <div className="p-4 sm:p-5 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl space-y-3 font-sans">
            {/* Header Mock */}
            <div className="flex items-center gap-3 pb-2 border-b border-slate-800/80">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                D
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Dastaan Member</div>
                <div className="text-[10px] text-slate-400">Content Creator & Engineer • Just now</div>
              </div>
            </div>

            {/* Hook */}
            {hook ? (
              <div className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                <FormattedText text={hook} />
              </div>
            ) : (
              <div className="text-xs text-slate-600 italic">No hook written yet...</div>
            )}

            {/* Body */}
            {body ? (
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                <FormattedText text={body} />
              </div>
            ) : (
              <div className="text-xs text-slate-600 italic">No body content yet...</div>
            )}

            {/* CTA */}
            {cta && (
              <div className="text-xs sm:text-sm font-semibold text-indigo-300 pt-1">
                <FormattedText text={cta} />
              </div>
            )}

            {/* Hashtags */}
            {hashtags.length > 0 && (
              <div className="text-xs text-indigo-400 font-mono font-medium pt-1 leading-relaxed">
                {hashtags.join(' ')}
              </div>
            )}

            {/* Mentions */}
            {mentions.length > 0 && (
              <div className="text-xs text-slate-400 font-medium">
                {mentions.join(' ')}
              </div>
            )}
          </div>

          {emailError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center justify-between">
              <span>{emailError}</span>
              <button onClick={() => setEmailError(null)} className="text-rose-400 hover:text-white">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* 5. BOTTOM OUTPUT ACTIONS BAR (SEPARATED FROM REFINEMENTS) */}
      <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          {saveSuccess ? (
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <Check className="w-4 h-4" /> Draft saved to MongoDB!
            </span>
          ) : approveSuccess ? (
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Post approved and ready!
            </span>
          ) : (
            <span>Changes in working draft can be saved, copied, or emailed.</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. SAVE DRAFT */}
          <button
            type="button"
            onClick={handleSaveManualEdits}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700 shadow-md"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-slate-300" />}
            <span>{saveSuccess ? 'Saved' : 'Save Draft'}</span>
          </button>

          {/* 2. COPY POST */}
          <button
            type="button"
            onClick={copyFullPost}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700 shadow-md"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copy Post</span>
              </>
            )}
          </button>

          {/* 3. EMAIL ME THIS POST */}
          <button
            type="button"
            onClick={handleEmailPost}
            disabled={emailing || !post?._id}
            title="Email this post directly to your registered email address"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border shadow-md ${
              emailSuccess
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 disabled:opacity-50'
            }`}
          >
            {emailing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Sending...</span>
              </>
            ) : emailSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Emailed!</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Email Me</span>
              </>
            )}
          </button>

          {/* 4. APPROVE */}
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading || post.status === 'APPROVED'}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{post.status === 'APPROVED' ? 'Approved' : 'Approve Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostEditor;
