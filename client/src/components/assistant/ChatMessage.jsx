import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  FileEdit,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { FormattedText } from '../../utils/textFormatter';

export function ChatMessage({ message, onOpenStudio }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null

  const isUser = message.role === 'user';
  const isDraftAction = message.action === 'GENERATE_DRAFT';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group w-full py-5 px-4 sm:px-6 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-zinc-950/40 hover:bg-zinc-950/70'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4 sm:gap-5 items-start">
        {/* AVATAR */}
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5 shadow-sm">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-sm shadow-emerald-500/5">
            <Sparkles className="w-4 h-4" />
          </div>
        )}

        {/* MESSAGE BODY */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header Row: Role Name & Timestamp */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-200">
                {isUser ? 'You' : 'Dastaan Assistant'}
              </span>
              <span className="text-[10px] text-zinc-600 font-mono">
                {message.timestamp
                  ? new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}
              </span>
            </div>

            {/* Hover Actions (Copy / Feedback) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                onClick={handleCopy}
                title="Copy message"
                className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded transition"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {!isUser && (
                <>
                  <button
                    onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                    title="Good response"
                    className={`p-1 rounded transition ${
                      feedback === 'up'
                        ? 'text-emerald-400 bg-zinc-900'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                    title="Bad response"
                    className={`p-1 rounded transition ${
                      feedback === 'down'
                        ? 'text-rose-400 bg-zinc-900'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Formatted Content */}
          <div className="text-sm text-zinc-200 leading-relaxed font-sans">
            <FormattedText text={message.content} />
          </div>

          {/* Draft Notification Card */}
          {isDraftAction && (
            <div className="mt-4 p-4 rounded-xl bg-zinc-900/90 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">LinkedIn Post Draft Ready</h4>
                  <p className="text-[11px] text-zinc-400">
                    Hook, multi-paragraph body, and CTA formatted for maximum reach.
                  </p>
                </div>
              </div>

              {onOpenStudio && (
                <button
                  onClick={onOpenStudio}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-black rounded-lg text-xs font-semibold transition shrink-0 shadow-sm"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Open Post Studio</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
