import React, { useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  Sparkles,
  Zap,
  Briefcase,
  Target,
  ArrowUp,
} from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Target,
    title: 'Project Milestone',
    prompt: 'I launched our new high-scale AI system and improved latency by 40%. Help me craft a story.',
  },
  {
    icon: Zap,
    title: 'Technical Learning',
    prompt: 'I solved a complex state management challenge in React. Summarize the key architectural lessons.',
  },
  {
    icon: Briefcase,
    title: 'Career Update',
    prompt: 'I was recently promoted to Senior Engineer and want to share an authentic note of gratitude.',
  },
  {
    icon: Sparkles,
    title: 'Industry Insight',
    prompt: 'What are the top 3 mistakes teams make when integrating LLMs into web applications?',
  },
];

export function ChatComposer({
  value,
  onChange,
  onSend,
  loading,
  isConversationEmpty,
  onSelectSuggestion,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 sm:pb-6 pt-2 shrink-0">
      {/* 1. EMPTY STATE PROMPT SUGGESTIONS */}
      {isConversationEmpty && (
        <div className="mb-6 space-y-3">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              What story do you want to tell today?
            </h2>
            <p className="text-xs text-zinc-400">
              Select an idea or start typing to transform your accomplishments into engaging LinkedIn content.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {SUGGESTIONS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestion(item.prompt)}
                  className="p-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-xl text-left transition group space-y-1 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 group-hover:text-emerald-400">
                    <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                    {item.prompt}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. FLOATING CAPSULE COMPOSER */}
      <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-emerald-400/30 transition-all shadow-xl backdrop-blur-md p-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Dastaan... (e.g. 'I led our cloud migration, write a post with 3 lessons')"
          rows={1}
          disabled={loading}
          className="w-full pl-3 pr-12 py-2 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed max-h-[200px]"
        />

        {/* Send Button */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center">
          <button
            onClick={onSend}
            disabled={!value.trim() || loading}
            aria-label="Send message"
            className="w-8 h-8 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-20 disabled:hover:bg-emerald-400 text-black flex items-center justify-center transition shadow-sm font-semibold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <ArrowUp className="w-4 h-4 text-black stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Helper Footer Subtext */}
      <div className="flex items-center justify-between mt-2 px-2 text-[10px] text-zinc-500 font-mono">
        <span className="hidden sm:inline">Shift + Enter for new line • Enter to send</span>
        <span className="flex items-center gap-1 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Profile context grounded</span>
        </span>
      </div>
    </div>
  );
}

export default ChatComposer;
