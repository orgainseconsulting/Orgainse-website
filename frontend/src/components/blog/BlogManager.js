import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Edit3, ExternalLink } from 'lucide-react';
import { blogApi } from '../../lib/blogApi';
import BlogEditor from './BlogEditor';
import NextLaunchCountdownCard from '../admin/NextLaunchCountdownCard';

const StatusBadge = ({ status }) => {
  const styles =
    status === 'published'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-amber-100 text-amber-700 border-amber-200';
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${styles}`}>
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
};

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

/**
 * BlogManager — list + editor combined. Lives inside AdminDashboard's "Blog" tab.
 */
const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorPostId, setEditorPostId] = useState(undefined); // undefined = list view, null = new, string = edit
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogApi.adminList(page, 50);
      setPosts(res.posts || []);
      setTotal(res.pagination?.total ?? (res.posts || []).length);
    } catch (err) {
      toast.error(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (editorPostId === undefined) {
      fetchPosts();
    }
  }, [editorPostId, fetchPosts]);

  if (editorPostId !== undefined) {
    return (
      <BlogEditor
        postId={editorPostId}
        onBack={() => setEditorPostId(undefined)}
        onSaved={(post) => {
          // Once saved, stay on the editor (so user can keep editing) but refresh local state.
          setEditorPostId(post.id);
        }}
        onDeleted={() => setEditorPostId(undefined)}
      />
    );
  }

  return (
    <div className="space-y-5" data-testid="blog-manager">
      <NextLaunchCountdownCard kind="blog" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Blog posts</h2>
          <p className="text-sm text-slate-500">{total} total · {posts.filter((p) => p.status === 'published').length} published</p>
        </div>
        <button
          type="button"
          onClick={() => setEditorPostId(null)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          data-testid="blog-manager-new"
        >
          <Plus className="h-4 w-4" />
          New post
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full mx-auto mb-3"></div>
          Loading posts…
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500 mb-4">No blog posts yet.</p>
          <button
            type="button"
            onClick={() => setEditorPostId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            data-testid="blog-manager-empty-new"
          >
            <Plus className="h-4 w-4" />
            Write your first post
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200" data-testid="blog-manager-table">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-left">Author</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50" data-testid={`blog-row-${p.slug || p.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{p.title || '(untitled)'}</div>
                    <div className="text-xs text-slate-400 font-mono">/blog/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.category || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(p.updated_at)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.author || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {p.status === 'published' && (
                        <a
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                          data-testid={`blog-row-${p.slug}-view`}
                          title="Open public page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditorPostId(p.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md"
                        data-testid={`blog-row-${p.slug}-edit`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 50 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">Page {page}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 50 >= total}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogManager;
