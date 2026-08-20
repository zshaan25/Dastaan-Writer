import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dastaan_sidebar_state';

/**
 * Custom hook for managing multi-state sidebar:
 * - 'expanded': full 280px sidebar with title, dates, actions
 * - 'compact': 60px icon-only rail for fast switching
 * - 'hidden': 0px completely tucked away for maximum canvas
 */
export function useSidebarState() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'expanded' || saved === 'compact' || saved === 'hidden') {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    // Default to expanded on desktop, hidden on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return 'hidden';
    }
    return 'expanded';
  });

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, state);
    } catch (e) {
      // ignore
    }
  }, [state]);

  // Handle keyboard shortcut '[' or 'Ctrl+B' to cycle/toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not trigger when user is typing in an input, textarea, or contentEditable
      const target = e.target;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput) return;

      // '[' key or Ctrl+B / Cmd+B
      if (e.key === '[' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        setState((prev) => {
          if (prev === 'expanded') return 'hidden';
          if (prev === 'hidden') return 'expanded';
          return 'expanded';
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = useCallback(() => {
    setState((prev) => (prev === 'hidden' ? 'expanded' : 'hidden'));
  }, []);

  const cycleState = useCallback(() => {
    setState((prev) => {
      if (prev === 'expanded') return 'compact';
      if (prev === 'compact') return 'hidden';
      return 'expanded';
    });
  }, []);

  const setExpanded = useCallback(() => setState('expanded'), []);
  const setCompact = useCallback(() => setState('compact'), []);
  const setHidden = useCallback(() => setState('hidden'), []);

  return {
    state,
    setState,
    isExpanded: state === 'expanded',
    isCompact: state === 'compact',
    isHidden: state === 'hidden',
    toggleSidebar,
    cycleState,
    setExpanded,
    setCompact,
    setHidden,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
  };
}

export default useSidebarState;
