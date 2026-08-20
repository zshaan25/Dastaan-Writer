import React from 'react';

/**
 * Safely parses inline markdown (bold **text**, italic *text*, code `text`)
 * into React nodes WITHOUT using dangerouslySetInnerHTML.
 */
function parseInlineMarkdown(text) {
  if (!text) return '';

  // Regex to match **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-zinc-100">
          {inner}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**')) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic text-zinc-300">
          {inner}
        </em>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const inner = part.slice(1, -1);
      return (
        <code key={index} className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-emerald-300 font-mono text-[11px] rounded">
          {inner}
        </code>
      );
    }

    return part;
  });
}

/**
 * FormattedText component that takes raw AI text, normalizes Markdown markers,
 * handles bullet lines, line breaks, and paragraph spacing safely.
 */
export function FormattedText({ text, className = '' }) {
  if (!text) return null;

  // Split by line breaks to handle paragraphs and bullet lists
  const lines = text.split('\n');

  return (
    <div className={`space-y-1.5 leading-relaxed ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Empty lines create small paragraph spacing
        if (!trimmed) {
          return <div key={lineIdx} className="h-2" />;
        }

        // Bullet point lines starting with * , - , or •
        if (/^[\*\-•]\s+/.test(trimmed)) {
          const bulletContent = trimmed.replace(/^[\*\-•]\s+/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2 my-1">
              <span className="text-emerald-400 font-bold text-xs select-none mt-0.5">•</span>
              <span className="flex-1">{parseInlineMarkdown(bulletContent)}</span>
            </div>
          );
        }

        // Numbered list lines (e.g. 1. , 2. )
        if (/^\d+\.\s+/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s+(.+)$/);
          if (match) {
            return (
              <div key={lineIdx} className="flex items-start gap-2 pl-2 my-1">
                <span className="text-emerald-400 font-mono font-medium text-xs select-none mt-0.5">{match[1]}</span>
                <span className="flex-1">{parseInlineMarkdown(match[2])}</span>
              </div>
            );
          }
        }

        // Standard text line
        return (
          <p key={lineIdx} className="m-0">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

export default FormattedText;
