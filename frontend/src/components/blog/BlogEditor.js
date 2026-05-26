import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Save, Send, Trash2, Image as ImageIcon, X } from 'lucide-react';
import TipTapEditor from './TipTapEditor';
import { blogApi } from '../../lib/blogApi';

const MAX_COVER_BYTES = 1.4 * 1024 * 1024; // ~1.4 MB raw
const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

const emptyPost = {
  id: null,
  slug: '',
  title: '',
  excerpt: '',
  content_html: '',
  cover_image_url: '',
  og_image_url: '',
  author: 'Orgainse Consulting',
  category: '',
  tags: '',
  status: 'draft',
  seo_title: '',
  seo_description: '',
};

const ImageUpload = ({ label, value, onChange, testId }) => {
  const fileRef = useRef(null);
  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED_MIMES.includes(file.type)) {
      toast.error(`Unsupported image type (${file.type})`);
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      toast.error(`Image too large (${(file.size / 1024).toFixed(0)} KB). Max ${(MAX_COVER_BYTES / 1024).toFixed(0)} KB.`);
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    onChange(dataUrl);
  };
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt={label} className="h-32 w-auto rounded-lg border border-slate-200 object-cover" data-testid={`${testId}-preview`} />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 h-6 w-6 inline-flex items-center justify-center rounded-full bg-white border border-slate-300 shadow text-slate-600 hover:text-red-600"
            data-testid={`${testId}-clear`}
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          data-testid={`${testId}-pick`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-dashed border-slate-300 text-slate-600 hover:border-orange-300 hover:text-orange-600 transition"
        >
          <ImageIcon className="h-4 w-4" />
          <span className="text-sm">Choose image</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept={ALLOWED_MIMES.join(',')} onChange={onPick} className="hidden" data-testid={`${testId}-input`} />
      <p className="text-xs text-slate-500 mt-1">PNG / JPEG / WebP / GIF · max ~1.4 MB</p>
    </div>
  );
};

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
  </div>
);

/**
 * BlogEditor — full form for creating/editing a single post.
 *
 * Props:
 *   postId      — string | null (null = create new)
 *   onBack      — () => void
 *   onSaved     — (post) => void
 *   onDeleted   — (id) => void
 */
const BlogEditor = ({ postId, onBack, onSaved, onDeleted }) => {
  const [form, setForm] = useState(emptyPost);
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  // Load existing post
  useEffect(() => {
    if (!postId) {
      setForm(emptyPost);
      return;
    }
    let alive = true;
    setLoading(true);
    blogApi.adminGet(postId)
      .then((data) => {
        if (!alive) return;
        const p = data.post || {};
        setForm({
          id: p.id || null,
          slug: p.slug || '',
          title: p.title || '',
          excerpt: p.excerpt || '',
          content_html: p.content_html || '',
          cover_image_url: p.cover_image_url || '',
          og_image_url: p.og_image_url || '',
          author: p.author || 'Orgainse Consulting',
          category: p.category || '',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
          status: p.status || 'draft',
          seo_title: p.seo_title || '',
          seo_description: p.seo_description || '',
        });
        setSlugTouched(true);
      })
      .catch((err) => toast.error(err.message || 'Failed to load post'))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [postId]);

  // Derive slug from title when not manually touched
  useEffect(() => {
    if (slugTouched) return;
    setForm((f) => ({ ...f, slug: slugify(f.title) }));
  }, [form.title, slugTouched]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const buildPayload = (overrideStatus) => ({
    title: form.title.trim(),
    slug: form.slug.trim(),
    excerpt: form.excerpt.trim(),
    content_html: form.content_html,
    cover_image_url: form.cover_image_url,
    og_image_url: form.og_image_url,
    author: form.author.trim() || 'Orgainse Consulting',
    category: form.category.trim(),
    tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    status: overrideStatus || form.status || 'draft',
    seo_title: form.seo_title.trim(),
    seo_description: form.seo_description.trim(),
  });

  const validate = () => {
    if (!form.title.trim()) { toast.error('Title is required'); return false; }
    if (!form.content_html || form.content_html.replace(/<[^>]*>/g, '').trim().length === 0) {
      toast.error('Body content is required');
      return false;
    }
    if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      toast.error('Slug must contain only lowercase letters, digits and hyphens');
      return false;
    }
    return true;
  };

  const handleSave = async (publish = false) => {
    if (!validate()) return;
    const payload = buildPayload(publish ? 'published' : form.status);
    setSaving(true);
    try {
      const res = form.id
        ? await blogApi.adminUpdate(form.id, payload)
        : await blogApi.adminCreate(payload);
      toast.success(publish ? 'Published' : (form.id ? 'Saved' : 'Created'));
      onSaved?.(res.post);
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    if (!window.confirm(`Delete "${form.title || 'this post'}" permanently?`)) return;
    try {
      await blogApi.adminDelete(form.id);
      toast.success('Deleted');
      onDeleted?.(form.id);
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const publicUrl = useMemo(() => {
    if (!form.slug) return '';
    return `/blog/${form.slug}`;
  }, [form.slug]);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full mx-auto mb-3"></div>
        Loading post…
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="blog-editor">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 sticky top-0 bg-white py-3 -mx-6 px-6 border-b border-slate-200 z-10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
          data-testid="blog-editor-back"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to posts</span>
        </button>
        <div className="flex items-center gap-2">
          {form.id && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
              data-testid="blog-editor-delete"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            data-testid="blog-editor-save-draft"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            data-testid="blog-editor-publish"
          >
            <Send className="h-4 w-4" />
            {form.status === 'published' ? 'Update post' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Field label="Title">
            <input
              type="text"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="A great title catches readers in 6–8 words"
              className="w-full px-4 py-3 text-2xl font-bold border border-slate-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-300 focus:outline-none"
              data-testid="blog-editor-title"
            />
          </Field>

          <Field label="Slug" hint={publicUrl ? `Public URL: ${publicUrl}` : 'Auto-generated from title; click to edit'}>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => { setSlugTouched(true); update({ slug: e.target.value.toLowerCase() }); }}
              placeholder="my-post-slug"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-300 focus:outline-none font-mono"
              data-testid="blog-editor-slug"
            />
          </Field>

          <Field label="Excerpt" hint="Short summary shown on the /blog grid. Auto-derived from body if left blank.">
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(e) => update({ excerpt: e.target.value })}
              placeholder="1–2 sentence summary…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-300 focus:outline-none"
              data-testid="blog-editor-excerpt"
            />
          </Field>

          <Field label="Body">
            <TipTapEditor
              value={form.content_html}
              onChange={(html) => update({ content_html: html })}
              placeholder="Start writing your post…"
              onImageError={(msg) => toast.error(msg)}
            />
          </Field>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Publishing</h3>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => update({ status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-orange-400 focus:outline-none"
                data-testid="blog-editor-status"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field label="Author">
              <input
                type="text"
                value={form.author}
                onChange={(e) => update({ author: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none"
                data-testid="blog-editor-author"
              />
            </Field>
            <Field label="Category">
              <input
                type="text"
                value={form.category}
                onChange={(e) => update({ category: e.target.value })}
                placeholder="e.g. AI Strategy"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none"
                data-testid="blog-editor-category"
              />
            </Field>
            <Field label="Tags" hint="Comma-separated">
              <input
                type="text"
                value={form.tags}
                onChange={(e) => update({ tags: e.target.value })}
                placeholder="ai, project management, roi"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none"
                data-testid="blog-editor-tags"
              />
            </Field>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Cover image</h3>
            <ImageUpload
              label="Cover image"
              value={form.cover_image_url}
              onChange={(v) => update({ cover_image_url: v })}
              testId="blog-editor-cover"
            />
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">SEO</h3>
            <Field label="SEO title" hint="Defaults to post title if blank. ~60 chars ideal.">
              <input
                type="text"
                value={form.seo_title}
                onChange={(e) => update({ seo_title: e.target.value })}
                maxLength={250}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none"
                data-testid="blog-editor-seo-title"
              />
            </Field>
            <Field label="Meta description" hint="~155 chars ideal.">
              <textarea
                rows={3}
                value={form.seo_description}
                onChange={(e) => update({ seo_description: e.target.value })}
                maxLength={320}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none"
                data-testid="blog-editor-seo-description"
              />
            </Field>
            <ImageUpload
              label="OG / social share image"
              value={form.og_image_url}
              onChange={(v) => update({ og_image_url: v })}
              testId="blog-editor-og"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
