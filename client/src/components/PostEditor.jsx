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
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
      {/* 1. TOP HEADER & METADATA BAR */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Post Studio</h3>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border ${
                  post.status === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                {post.status || 'DRAFT'}
              </span>
            </div>
          </div>
        </div>

        {/* Type & Tone Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg px-2 py-1">
            <span className="text-[10px] uppercase font-mono text-zinc-500">Type</span>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="ACHIEVEMENT" className="bg-zinc-900">Achievement</option>
              <option value="PROJECT" className="bg-zinc-900">Project</option>
              <option value="LEARNING" className="bg-zinc-900">Learning</option>
              <option value="CAREER_UPDATE" className="bg-zinc-900">Career Update</option>
              <option value="ANNOUNCEMENT" className="bg-zinc-900">Announcement</option>
              <option value="THOUGHT_LEADERSHIP" className="bg-zinc-900">Thought Leadership</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg px-2 py-1">
            <span className="text-[10px] uppercase font-mono text-zinc-500">Tone</span>
            <select
              value={tone}
              onChange={(e) => {
                const newT = e.target.value;
                setTone(newT);
                handleAction('CHANGE_TONE', newT);
              }}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="PROFESSIONAL" className="bg-zinc-900">Professional</option>
              <option value="PERSONAL" className="bg-zinc-900">Personal</option>
              <option value="TECHNICAL" className="bg-zinc-900">Technical</option>
              <option value="STORYTELLING" className="bg-zinc-900">Storytelling</option>
              <option value="CONFIDENT" className="bg-zinc-900">Confident</option>
              <option value="MINIMAL" className="bg-zinc-900">Minimal</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. ALTERNATIVE VERSIONS SWITCHER BAR */}
      {Array.isArray(post.versions) && post.versions.length > 0 && (
        <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-zinc-400" /> Variations:
          </span>
          <button
            onClick={() => handleSelectVersion('working')}
            className={`px-2.5 py-1 text-xs rounded transition whitespace-nowrap ${
              activeVersionId === 'working'
                ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Working Draft
          </button>
          {post.versions.map((ver, idx) => (
            <button
              key={ver.id || idx}
              onClick={() => handleSelectVersion(ver)}
              className={`px-2.5 py-1 text-xs rounded transition whitespace-nowrap ${
                activeVersionId === ver.id
                  ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {ver.label || `Version ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* 3. MAIN WORKSPACE: 2-COLUMN SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 items-start">
        {/* LEFT COLUMN: STRUCTURED SEAMLESS FORM CONTROLS (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* HOOK FIELD (SEAMLESS WITH GLOWING BOTTOM BORDER) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <span>Hook (Opening Line)</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">{hook.length} chars</span>
            </div>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Write a clear, compelling opening statement..."
              className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-800 text-sm font-medium text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* BODY FIELD (SEAMLESS WITH GLOWING LEFT ACCENT BORDER) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <span>Post Body</span>
              </label>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{body.length} chars</span>
              </div>
            </div>
            <textarea
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Detail your insight, workflow, technical takeaways, or project milestones..."
              className="w-full pl-3.5 py-1.5 bg-transparent border-l-2 border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 leading-relaxed resize-y transition-colors font-sans"
            />
          </div>

          {/* CALL TO ACTION FIELD (SEAMLESS WITH GLOWING BOTTOM BORDER) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                <span>Call to Action</span>
              </label>
              <span className="text-[10px] text-zinc-600 font-mono">Optional closing prompt</span>
            </div>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="e.g. What approach has worked best for your team?"
              className="w-full pb-2 pt-1 bg-transparent border-b border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* HASHTAGS & MENTIONS EDITORS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Hashtags */}
            <div className="p-3 bg-zinc-900/30 border border-zinc-800/80 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-zinc-500" /> Hashtags ({hashtags.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1 min-h-[28px]">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-500 hover:text-zinc-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex gap-1 pt-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add #tag..."
                  className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={!newTag.trim()}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition disabled:opacity-40"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </form>
            </div>

            {/* Mentions */}
            <div className="p-3 bg-zinc-900/30 border border-zinc-800/80 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <AtSign className="w-3 h-3 text-zinc-500" /> Mentions ({mentions.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1 min-h-[28px]">
                {mentions.length === 0 ? (
                  <span className="text-[11px] text-zinc-600 italic">No mentions</span>
                ) : (
                  mentions.map((mention) => (
                    <span
                      key={mention}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]"
                    >
                      {mention}
                      <button
                        type="button"
                        onClick={() => handleRemoveMention(mention)}
                        className="text-zinc-500 hover:text-zinc-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <form onSubmit={handleAddMention} className="flex gap-1 pt-1">
                <input
                  type="text"
                  value={newMention}
                  onChange={(e) => setNewMention(e.target.value)}
                  placeholder="Add @mention..."
                  className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!newMention.trim()}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition disabled:opacity-40"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>

          {/* 4. MINIMAL REFINEMENT ACTION BAR (LOW-OPACITY TEXT LINKS) */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-zinc-500">
                AI Transformations
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              {[
                { label: 'Regenerate', action: 'REGENERATE', icon: RefreshCw },
                { label: 'Improve Hook', action: 'IMPROVE_HOOK', icon: Sparkles },
                { label: 'Make Shorter', action: 'MAKE_SHORTER', icon: Scissors },
                { label: 'Personal', action: 'MAKE_MORE_PERSONAL', icon: UserCheck },
                { label: 'Technical', action: 'MAKE_MORE_TECHNICAL', icon: Code },
                { label: 'Professional', action: 'MAKE_MORE_PROFESSIONAL', icon: Zap },
                { label: 'Flow', action: 'IMPROVE_FLOW', icon: Layers },
                { label: 'Simplify', action: 'SIMPLIFY', icon: RotateCcw },
              ].map(({ label, action, icon: Icon }) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleAction(action)}
                  disabled={loading}
                  className="text-xs text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 px-2.5 py-1 rounded transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </button>
              ))}

              {cta ? (
                <button
                  type="button"
                  onClick={() => handleAction('REMOVE_CTA')}
                  disabled={loading}
                  className="text-xs text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 px-2.5 py-1 rounded transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Remove CTA</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAction('ADD_CTA')}
                  disabled={loading}
                  className="text-xs text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 px-2.5 py-1 rounded transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Add CTA</span>
                </button>
              )}

              {onGenerateAlternatives && (
                <button
                  type="button"
                  onClick={onGenerateAlternatives}
                  disabled={loading}
                  className="text-xs text-emerald-400/90 hover:text-emerald-300 hover:bg-zinc-900 px-2.5 py-1 rounded border border-emerald-500/20 transition-colors disabled:opacity-40 flex items-center gap-1 ml-auto font-medium"
                >
                  <Layers className="w-3 h-3 text-emerald-400" />
                  <span>3 Versions</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CRISP LIVE PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col space-y-3 sticky top-4">
          <div className="flex items-center justify-between pb-0.5">
            <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
              <span>Preview</span>
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">Live Formatting</span>
          </div>

          {/* LinkedIn Simulated Post Card */}
          <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3 font-sans">
            {/* Header Mock */}
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/80">
              <div className="w-9 h-9 rounded-full bg-black border border-zinc-800 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                D
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-100">Member</div>
                <div className="text-[10px] text-zinc-500 font-mono">Just now</div>
              </div>
            </div>

            {/* Hook */}
            {hook ? (
              <div className="text-xs sm:text-sm font-semibold text-zinc-100 leading-snug">
                <FormattedText text={hook} />
              </div>
            ) : (
              <div className="text-xs text-zinc-600 italic">No hook entered...</div>
            )}

            {/* Body */}
            {body ? (
              <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                <FormattedText text={body} />
              </div>
            ) : (
              <div className="text-xs text-zinc-600 italic">No body text...</div>
            )}

            {/* CTA */}
            {cta && (
              <div className="text-xs sm:text-sm font-medium text-emerald-400/90 pt-1">
                <FormattedText text={cta} />
              </div>
            )}

            {/* Hashtags */}
            {hashtags.length > 0 && (
              <div className="text-xs text-zinc-400 font-mono pt-1 leading-relaxed">
                {hashtags.join(' ')}
              </div>
            )}

            {/* Mentions */}
            {mentions.length > 0 && (
              <div className="text-xs text-zinc-500 font-medium">
                {mentions.join(' ')}
              </div>
            )}
          </div>

          {emailError && (
            <div className="p-3 bg-zinc-900 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center justify-between">
              <span>{emailError}</span>
              <button onClick={() => setEmailError(null)} className="text-rose-400 hover:text-white">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* 5. BOTTOM OUTPUT ACTIONS BAR */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-zinc-400">
          {saveSuccess ? (
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <Check className="w-3.5 h-3.5" /> Saved to workspace.
            </span>
          ) : approveSuccess ? (
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> Post approved.
            </span>
          ) : (
            <span className="text-zinc-500 text-[11px] font-mono">Working draft ready for review.</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* SAVE DRAFT */}
          <button
            type="button"
            onClick={handleSaveManualEdits}
            disabled={loading}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition border border-zinc-800 flex items-center gap-1.5"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{saveSuccess ? 'Saved' : 'Save'}</span>
          </button>

          {/* COPY POST */}
          <button
            type="button"
            onClick={copyFullPost}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition border border-zinc-800 flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* EMAIL */}
          <button
            type="button"
            onClick={handleEmailPost}
            disabled={emailing || !post?._id}
            title="Email draft"
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition border border-zinc-800 flex items-center gap-1.5 disabled:opacity-40"
          >
            {emailing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Sending...</span>
              </>
            ) : emailSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Sent</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Email</span>
              </>
            )}
          </button>

          {/* APPROVE (PRIMARY NEON EMERALD ACTION) */}
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading || post.status === 'APPROVED'}
            className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-black rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{post.status === 'APPROVED' ? 'Approved' : 'Approve Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostEditor;
