import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { getPosts, getConversations } from '../../services/api';

export function ActivityHistorySection() {
  const [posts, setPosts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [postsData, convsData] = await Promise.allSettled([
          getPosts(),
          getConversations(),
        ]);
        if (postsData.status === 'fulfilled') setPosts(postsData.value || []);
        if (convsData.status === 'fulfilled') setConversations(convsData.value || []);
      } catch (err) {
        console.error('Failed to load activity history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPosts = posts.length;
  const approvedPosts = posts.filter((p) => p.status === 'APPROVED').length;
  const totalWords = posts.reduce((acc, p) => {
    const text = `${p.hook || ''} ${p.body || ''} ${p.cta || ''}`;
    return acc + (text.trim() ? text.trim().split(/\s+/).length : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Activity & Content Metrics</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Track your LinkedIn publishing pipeline, approved posts, and storytelling stats.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 uppercase">Total Stories Created</span>
          <div className="text-2xl font-bold text-white font-mono">{totalPosts}</div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 uppercase">Approved Posts</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{approvedPosts}</div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 uppercase">Words Generated</span>
          <div className="text-2xl font-bold text-zinc-200 font-mono">{totalWords}</div>
        </div>
      </div>

      {/* Recent Posts List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
          Recent Post Drafts & Stories
        </h3>

        {loading ? (
          <div className="p-8 text-center text-zinc-500 flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span className="text-xs font-mono">Loading activity history...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 rounded-xl bg-zinc-900/30 border border-zinc-800/80 text-center space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-200">No posts generated yet</p>
              <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                Launch the assistant studio to share your accomplishments and create your first LinkedIn post.
              </p>
            </div>
            <Link
              to="/assistant"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-semibold transition"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.slice(0, 10).map((post) => (
              <div
                key={post._id}
                className="p-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        post.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {post.status || 'DRAFT'}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {post.postType || 'POST'} • {post.tone || 'PROFESSIONAL'}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono">
                    {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 font-medium line-clamp-2 leading-relaxed">
                  {post.hook || post.body || 'Untitled draft'}
                </p>

                {post.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {post.hashtags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] text-zinc-500 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityHistorySection;
