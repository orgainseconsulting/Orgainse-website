import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { newsletterApi } from '../../lib/newsletterApi';

const SegmentsManager = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newSeg, setNewSeg] = useState({ name: '', slug: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await newsletterApi.adminSegmentsList();
      setSegments(d.segments || []);
    } catch (e) { toast.error(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!newSeg.name.trim()) return toast.error('Name required');
    try {
      await newsletterApi.adminSegmentCreate(newSeg);
      toast.success('Segment created');
      setShowAdd(false);
      setNewSeg({ name: '', slug: '', description: '' });
      load();
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete segment "${name}"? Subscribers tagged with it will keep their other tags.`)) return;
    try {
      await newsletterApi.adminSegmentDelete(id);
      toast.success('Deleted');
      load();
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  return (
    <div className="space-y-5" data-testid="segments-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Segments</h2>
          <p className="text-sm text-slate-500">Group subscribers by audience type to target sends.</p>
        </div>
        <button onClick={() => setShowAdd(true)} data-testid="segments-add"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          <Plus className="h-4 w-4" />New segment
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading…</div>
      ) : segments.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500 mb-4">No segments yet — try "VIP", "Healthcare", "Beta testers", etc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {segments.map((s) => (
            <div key={s.id} className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{s.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{s.slug}</p>
                  {s.description && <p className="text-sm text-slate-600 mt-2">{s.description}</p>}
                </div>
                <button onClick={() => del(s.id, s.name)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()} data-testid="segments-add-modal">
            <h3 className="text-lg font-bold mb-4">New segment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Name *</label>
                <input value={newSeg.name} onChange={(e) => setNewSeg((s) => ({ ...s, name: e.target.value }))}
                  data-testid="segments-name" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Slug</label>
                <input value={newSeg.slug} onChange={(e) => setNewSeg((s) => ({ ...s, slug: e.target.value }))}
                  placeholder="auto from name" className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea rows={2} value={newSeg.description} onChange={(e) => setNewSeg((s) => ({ ...s, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={add} data-testid="segments-confirm" className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentsManager;
