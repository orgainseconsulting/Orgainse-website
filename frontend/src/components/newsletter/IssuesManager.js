import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Edit3, ExternalLink, Eye } from 'lucide-react';
import { newsletterApi } from '../../lib/newsletterApi';
import IssueEditor from './IssueEditor';

const StatusBadge = ({ status }) => {
  const map = {
    published: 'bg-sky-100 text-sky-700 border-sky-200',
    sent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    draft: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${map[status] || map.draft}`}>
      {status}
    </span>
  );
};

const fmt = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso; }
};

const IssuesManager = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(undefined); // undefined=list, null=new, string=edit

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const d = await newsletterApi.adminIssuesList();
      setIssues(d.issues || []);
    } catch (e) { toast.error(e.message || 'Failed to load issues'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (editing === undefined) fetchIssues(); }, [editing, fetchIssues]);

  if (editing !== undefined) {
    return (
      <IssueEditor
        issueId={editing}
        onBack={() => setEditing(undefined)}
        onSaved={(i) => setEditing(i.id)}
        onDeleted={() => setEditing(undefined)}
      />
    );
  }

  return (
    <div className="space-y-5" data-testid="newsletter-issues-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Newsletter Issues</h2>
          <p className="text-sm text-slate-500">
            {issues.length} total ·
            {' '}{issues.filter((i) => i.status === 'sent').length} sent ·
            {' '}{issues.filter((i) => i.status === 'published').length} published
          </p>
        </div>
        <button type="button" onClick={() => setEditing(null)} data-testid="issues-manager-new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          <Plus className="h-4 w-4" />New issue
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full mx-auto mb-3" />Loading…
        </div>
      ) : issues.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500 mb-4">No newsletter issues yet.</p>
          <button onClick={() => setEditing(null)} data-testid="issues-manager-empty-new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            <Plus className="h-4 w-4" />Compose your first issue
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200" data-testid="issues-manager-table">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-left">Issue</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Edition</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3 text-left">Send stats</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issues.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50" data-testid={`issue-row-${i.slug || i.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">
                      {i.issue_number ? <span className="text-orange-600 font-bold mr-2">#{i.issue_number}</span> : null}
                      {i.title || '(untitled)'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">/newsletter/{i.slug}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{i.edition_date ? fmt(i.edition_date) : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 tabular-nums"
                      data-testid={`issue-row-${i.slug}-views`}
                    >
                      <Eye className="h-3 w-3 text-slate-400" />
                      {(i.view_count || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {i.status === 'sent' && i.send_stats ? (
                      <>
                        <div><strong>{i.send_stats.sent}</strong> / {i.send_stats.total_recipients} delivered</div>
                        {i.send_stats.failed > 0 && <div className="text-red-600">{i.send_stats.failed} failed</div>}
                      </>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{fmt(i.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {['published', 'sent'].includes(i.status) && (
                        <a href={`/newsletter/${i.slug}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
                          <ExternalLink className="h-3.5 w-3.5" />View
                        </a>
                      )}
                      <button onClick={() => setEditing(i.id)} data-testid={`issue-row-${i.slug}-edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md">
                        <Edit3 className="h-3.5 w-3.5" />Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IssuesManager;
