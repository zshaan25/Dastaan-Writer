import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation,
  updateConversation,
  sendConversationMessage,
  generatePost,
  getPostById,
  getPostByConversation,
  refinePost,
  generatePostAlternatives,
  updatePost,
  approvePost,
} from '../services/api';
import { useSidebarState } from '../hooks/useSidebarState';
import { AssistantSidebar } from '../components/assistant/AssistantSidebar';
import { AssistantHeader } from '../components/assistant/AssistantHeader';
import { ChatMessage } from '../components/assistant/ChatMessage';
import { ChatComposer } from '../components/assistant/ChatComposer';
import { PostStudioDrawer } from '../components/assistant/PostStudioDrawer';
import { ArrowDown, AlertCircle, Loader2 } from 'lucide-react';

export default function AssistantPage() {
  const {
    state: sidebarState,
    toggleSidebar,
    cycleState,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
  } = useSidebarState();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [activePost, setActivePost] = useState(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-scroll to bottom on message updates or sending
  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom();
    }
  }, [activeConv?.messages, sending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll listener to show "Scroll to bottom" button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 150);
  };

  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      setError(null);
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConv) {
        loadConversationDetails(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversation history');
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadConversationDetails = async (id) => {
    try {
      setLoadingMessages(true);
      setError(null);
      setIsMobileDrawerOpen(false);
      setActivePost(null);

      const convData = await getConversationById(id);
      setActiveConv(convData);

      // Load post if available
      try {
        let postDoc = null;
        if (convData.postId) {
          postDoc = await getPostById(convData.postId);
        } else {
          postDoc = await getPostByConversation(convData._id);
        }

        if (postDoc) {
          setActivePost(postDoc);
        }
      } catch (postErr) {
        // No post generated yet
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Failed to load selected conversation');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      setSending(true);
      setError(null);
      setIsMobileDrawerOpen(false);
      setActivePost(null);
      setIsStudioOpen(false);
      const res = await createConversation({ title: 'New Post Thread' });
      await fetchConversations();
      await loadConversationDetails(res.conversationId);
    } catch (err) {
      console.error('Failed to create conversation:', err);
      setError('Failed to start new conversation');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (e, id) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this thread?')) return;
    try {
      await deleteConversation(id);
      if (activeConv?._id === id) {
        setActiveConv(null);
        setActivePost(null);
        setIsStudioOpen(false);
      }
      fetchConversations();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setError('Failed to delete conversation');
    }
  };

  const handleRenameConversation = async (id, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      // Optimistic update
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, title: newTitle.trim() } : c))
      );
      if (activeConv?._id === id) {
        setActiveConv((prev) => ({ ...prev, title: newTitle.trim() }));
      }

      await updateConversation(id, { title: newTitle.trim() });
    } catch (err) {
      console.error('Failed to rename conversation:', err);
      setError('Failed to update conversation title');
      fetchConversations();
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || sending) return;

    let targetId = activeConv?._id;
    const userText = inputMessage.trim();
    setInputMessage('');

    try {
      setSending(true);
      setError(null);

      // Auto-create conversation if none is active
      if (!targetId) {
        const newRes = await createConversation({ title: userText.slice(0, 40) });
        targetId = newRes.conversationId;
      }

      // Optimistic user message
      const optimisticMsg = {
        role: 'user',
        content: userText,
        timestamp: new Date().toISOString(),
      };

      setActiveConv((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), optimisticMsg],
      }));

      const updatedConv = await sendConversationMessage(targetId, userText);
      setActiveConv(updatedConv);
      fetchConversations();

      // If draft was generated, load post and alert user
      if (updatedConv.postId) {
        try {
          const postDoc = await getPostById(updatedConv.postId);
          setActivePost(postDoc);
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'Failed to send message to assistant');
    } finally {
      setSending(false);
    }
  };

  const handleOpenStudio = async () => {
    if (!activeConv?._id) return;

    if (activePost) {
      setIsStudioOpen(true);
      return;
    }

    try {
      setPostLoading(true);
      setError(null);

      let postDoc = null;
      try {
        if (activeConv.postId) {
          postDoc = await getPostById(activeConv.postId);
        } else {
          postDoc = await getPostByConversation(activeConv._id);
        }
      } catch (e) {
        // Not found yet
      }

      if (!postDoc) {
        postDoc = await generatePost({
          conversationId: activeConv._id,
          postType: 'ACHIEVEMENT',
          tone: 'PROFESSIONAL',
        });
      }

      setActivePost(postDoc);
      setIsStudioOpen(true);
    } catch (err) {
      console.error('Failed to load or generate post:', err);
      setError(err.response?.data?.message || 'Failed to open post editor');
    } finally {
      setPostLoading(false);
    }
  };

  const handleRefinePost = async (refinementPayload) => {
    if (!activePost?._id) return;
    try {
      setPostLoading(true);
      setError(null);
      const updated = await refinePost({
        postId: activePost._id,
        ...refinementPayload,
      });
      setActivePost(updated);
    } catch (err) {
      console.error('Failed to refine post:', err);
      setError(err.response?.data?.message || 'Failed to refine post');
    } finally {
      setPostLoading(false);
    }
  };

  const handleSavePostEdits = async (manualEdits) => {
    if (!activePost?._id) return;
    try {
      setPostLoading(true);
      setError(null);
      const updated = await updatePost(activePost._id, manualEdits);
      setActivePost(updated);
    } catch (err) {
      console.error('Failed to save post edits:', err);
      setError(err.response?.data?.message || 'Failed to save post edits');
    } finally {
      setPostLoading(false);
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      setPostLoading(true);
      setError(null);
      const updated = await approvePost(postId);
      setActivePost(updated);
    } catch (err) {
      console.error('Failed to approve post:', err);
      setError(err.response?.data?.message || 'Failed to approve post');
    } finally {
      setPostLoading(false);
    }
  };

  const handleGenerateAlternatives = async () => {
    if (!activePost?._id) return;
    try {
      setPostLoading(true);
      setError(null);
      const updated = await generatePostAlternatives(activePost._id);
      setActivePost(updated);
    } catch (err) {
      console.error('Failed to generate alternatives:', err);
      setError(err.response?.data?.message || 'Failed to generate alternative versions');
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex bg-black text-zinc-100 overflow-hidden font-sans antialiased relative">
      {/* 1. COLLAPSIBLE MULTI-STATE SIDEBAR */}
      <AssistantSidebar
        sidebarState={sidebarState}
        onToggle={toggleSidebar}
        onCycle={cycleState}
        conversations={conversations}
        activeConvId={activeConv?._id}
        onSelectConv={loadConversationDetails}
        onCreateNew={handleCreateNew}
        onDeleteConv={handleDeleteConversation}
        onRenameConv={handleRenameConversation}
        loading={loadingConvs}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* 2. MAIN FULL-SCREEN ASSISTANT CANVAS */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-black relative">
        {/* Adaptive Header */}
        <AssistantHeader
          sidebarState={sidebarState}
          onToggleSidebar={toggleSidebar}
          onOpenMobileSidebar={() => setIsMobileDrawerOpen(true)}
          activeConv={activeConv}
          hasDraft={Boolean(activePost || activeConv?.postId)}
          onToggleStudio={() => {
            if (isStudioOpen) {
              setIsStudioOpen(false);
            } else {
              handleOpenStudio();
            }
          }}
          isStudioOpen={isStudioOpen}
          onRenameThread={handleRenameConversation}
          onDeleteCurrentThread={
            activeConv ? (e) => handleDeleteConversation(e, activeConv._id) : null
          }
        />

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-zinc-900 border-b border-rose-500/30 text-rose-300 text-xs flex items-center justify-between font-mono shrink-0 z-10">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Expansive Chat Messages Scroller */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-between relative"
        >
          <div className="flex-1 py-4 sm:py-6">
            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <p className="text-xs font-mono">Loading conversation context...</p>
              </div>
            ) : !activeConv || !activeConv.messages || activeConv.messages.length === 0 ? (
              <div className="h-full flex items-center justify-center p-4">
                {/* Empty state handled inside ChatComposer suggestions */}
              </div>
            ) : (
              <div className="space-y-1">
                {activeConv.messages.map((msg, idx) => (
                  <ChatMessage
                    key={idx}
                    message={msg}
                    onOpenStudio={handleOpenStudio}
                  />
                ))}

                {/* Assistant Generating Indicator */}
                {sending && (
                  <div className="max-w-3xl mx-auto py-5 px-4 sm:px-6 flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      <span>Reasoning & structuring LinkedIn post...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Bottom Composer */}
          <ChatComposer
            value={inputMessage}
            onChange={setInputMessage}
            onSend={handleSend}
            loading={sending}
            isConversationEmpty={!activeConv || !activeConv.messages || activeConv.messages.length === 0}
            onSelectSuggestion={(prompt) => {
              setInputMessage(prompt);
            }}
          />

          {/* Floating "Scroll to Bottom" Button */}
          {showScrollBottom && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-24 right-8 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 shadow-xl transition-all hover:scale-105 z-30"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>

      {/* 3. POST STUDIO SLIDE-OVER DRAWER */}
      <PostStudioDrawer
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        post={activePost}
        onRefine={handleRefinePost}
        onSave={handleSavePostEdits}
        onApprove={handleApprovePost}
        onGenerateAlternatives={handleGenerateAlternatives}
        loading={postLoading}
      />
    </div>
  );
}
