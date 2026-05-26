import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Search, Download, Edit3, X, Check } from 'lucide-react';
import { newsletterApi } from '../../lib/newsletterApi';

const StatusBadge = ({ s }) => {
  const map = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    unsubscribed: 'bg-slate-200 text-slate-600 border-slate-300',
    bounced: 'bg-red-100 text-red-700 border-red-200',
  };
  return <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${map[s] || map.active}`}>{s}</span>;
};

const fmt = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso; }
};

const SubscribersTable = () => {
  const [subs, setSubs] = useState([]);
  const [counts, setCounts] = useState({ active: 0, unsubscribed: 0, bounced: 0 });
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState([]);
  const [filters, setFilters] = useState({ q: '', state: '', segment: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [editingRow, setEditingRow] = useState(null); // sub id being edited
  const [newSub, setNewSub] = useState({ email: '', name: '', tags: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await newsletterApi.adminSubsList({ ...filters, page_size: 100 });
      setSubs(d.subscribers || []);
      setCounts(d.counts || { active: 0, unsubscribed: 0, bounced: 0 });
    } catch (e) { toast.error(e.message || 'Failed to load subscribers'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { newsletterApi.adminSegmentsList().then((d) => setSegments(d.segments || [])).catch(() => {}); }, []);

  const addSub = async () => {
    if (!newSub.email.trim()) return toast.error('Email required');
    try {
      await newsletterApi.adminSubCreate({
        email: newSub.email.trim().toLowerCase(),
        name: newSub.name.trim(),
        tags: newSub.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      toast.success('Subscriber added');
      setShowAdd(false);
      setNewSub({ email: '', name: '', tags: '' });
      load();
    } catch (e) { toast.error(e.message || 'Failed to add'); }
  };

  const updateRow = async (id, patch) => {
    try {
      await newsletterApi.adminSubUpdate(id, patch);
      toast.success('Updated');
      setEditingRow(null);
      load();
    } catch (e) { toast.error(e.message || 'Update failed'); }
  };

  const removeSub = async (id, email) => {
    if (!window.confirm(`Permanently delete ${email}?`)) return;
    try {
      await newsletterApi.adminSubDelete(id);
      toast.success('Deleted');
      load();
    } catch (e) { toast.error(e.message || 'Delete failed'); }
  };

  const downloadCSV = async () => {
    const url = newsletterApi.adminSubsExportUrl({ segment: filters.segment, state: filters.state });
    // Inject auth header by fetching as blob
    try {
      const raw = sessionStorage.getItem('orgainse_admin_auth');
      const token = raw ? JSON.parse(raw).token : null;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `orgainse-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) { toast.error(e.message || 'CSV download failed'); }
  };

  return (
    <div className="space-y-5" data-testid="subscribers-table">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Subscribers</h2>
          <p className="text-sm text-slate-500">
            <span className="text-emerald-600 font-semibold">{counts.active}</span> active ·
            <span className="text-slate-500"> {counts.unsubscribed}</span> unsubscribed ·
            <span className="text-red-600"> {counts.bounced}</span> bounced
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={downloadCSV} data-testid="subs-export-csv"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">
            <Download className="h-4 w-4" />Export CSV
          </button>
          <button type="button" onClick={() => setShowAdd(true)} data-testid="subs-add-btn"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            <Plus className="h-4 w-4" />Add subscriber
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Search email or name…" data-testid="subs-filter-search"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none" />
        </div>
        <select value={filters.state} onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))} data-testid="subs-filter-state"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-orange-400 focus:outline-none">
          <option value="">All states</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="bounced">Bounced</option>
        </select>
        <select value={filters.segment} onChange={(e) => setFilters((f) => ({ ...f, segment: e.target.value }))} data-testid="subs-filter-segment"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-orange-400 focus:outline-none">
          <option value="">All segments</option>
          {segments.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full mx-auto mb-3" />Loading…
        </div>
      ) : subs.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500">No subscribers match.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200" data-testid="subs-table">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Tags</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subs.map((s) => (
                <RowEditable key={s.id} sub={s} segments={segments}
                  editing={editingRow === s.id}
                  onStartEdit={() => setEditingRow(s.id)}
                  onCancel={() => setEditingRow(null)}
                  onSave={(patch) => updateRow(s.id, patch)}
                  onDelete={() => removeSub(s.id, s.email)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()} data-testid="subs-add-modal">
            <h3 className="text-lg font-bold mb-4">Add subscriber</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Email *</label>
                <input type="email" value={newSub.email} onChange={(e) => setNewSub((s) => ({ ...s, email: e.target.value }))}
                  data-testid="subs-add-email" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Name</label>
                <input type="text" value={newSub.name} onChange={(e) => setNewSub((s) => ({ ...s, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Tags (comma-separated)</label>
                <input type="text" value={newSub.tags} onChange={(e) => setNewSub((s) => ({ ...s, tags: e.target.value }))}
                  placeholder="vip, beta-tester" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={addSub} data-testid="subs-add-confirm" className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RowEditable = ({ sub, segments, editing, onStartEdit, onCancel, onSave, onDelete }) => {
  const [name, setName] = useState(sub.name || '');
  const [tags, setTags] = useState((sub.tags || []).join(', '));
  const [unsubscribed, setUnsubscribed] = useState(!!sub.unsubscribed);

  useEffect(() => {
    if (editing) {
      setName(sub.name || '');
      setTags((sub.tags || []).join(', '));
      setUnsubscribed(!!sub.unsubscribed);
    }
  }, [editing, sub]);

  if (!editing) {
    return (
      <tr className="hover:bg-slate-50">
        <td className="px-4 py-3 text-sm font-mono text-slate-900">{sub.email}</td>
        <td className="px-4 py-3 text-sm text-slate-700">{sub.name || '—'}</td>
        <td className="px-4 py-3 text-xs">
          {(sub.tags || []).length === 0 ? '—' : sub.tags.map((t) => (
            <span key={t} className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded mr-1 mb-1">{t}</span>
          ))}
        </td>
        <td className="px-4 py-3"><StatusBadge s={sub.status} /></td>
        <td className="px-4 py-3 text-xs text-slate-500">{sub.source || '—'}</td>
        <td className="px-4 py-3 text-xs text-slate-500">{fmt(sub.subscribed_at)}</td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-2">
            <button onClick={onStartEdit} className="p-1 text-slate-500 hover:text-orange-600" title="Edit"><Edit3 className="h-4 w-4" /></button>
            <button onClick={onDelete} className="p-1 text-slate-500 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-orange-50/50">
      <td className="px-4 py-3 text-sm font-mono text-slate-900">{sub.email}</td>
      <td className="px-4 py-3">
        <input value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-slate-200 rounded" />
      </td>
      <td className="px-4 py-3">
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={segments.map((s) => s.slug).join(', ')}
          className="w-full px-2 py-1 text-sm border border-slate-200 rounded" />
      </td>
      <td className="px-4 py-3">
        <label className="inline-flex items-center gap-1 text-xs">
          <input type="checkbox" checked={unsubscribed} onChange={(e) => setUnsubscribed(e.target.checked)} />
          Unsubscribed
        </label>
      </td>
      <td colSpan={2} className="px-4 py-3 text-xs text-slate-400">editing…</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="p-1 text-slate-500 hover:text-red-600"><X className="h-4 w-4" /></button>
          <button onClick={() => onSave({
            name,
            tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
            unsubscribed,
          })} className="p-1 text-emerald-600 hover:text-emerald-700"><Check className="h-4 w-4" /></button>
        </div>
      </td>
    </tr>
  );
};

export default SubscribersTable;
