import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Edit3, ExternalLink, Eye, Trash2 } from 'lucide-react';
import { careersApi } from '../../lib/careersApi';
import { stageStyle } from '../../lib/careersTaxonomy';
import JobEditor from './JobEditor';
import AnalyticsPanel, { ANALYTICS_ICONS } from '../admin/AnalyticsPanel';

const StatusBadge = ({ status }) => (
  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${
    status === 'published'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-slate-100 text-slate-600 border-slate-200'
  }`}>
    {status === 'published' ? 'Published' : 'Draft'}
  </span>
);

const formatDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso; }
};

const CareersManager = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorJobId, setEditorJobId] = useState(undefined); // undefined=list, null=new, string=edit
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await careersApi.adminList();
      setJobs(res.jobs || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load job postings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await careersApi.adminAnalytics();
      setAnalytics(res.analytics || null);
    } catch (err) {
      setAnalyticsError(err.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (editorJobId === undefined) {
      fetchJobs();
      fetchAnalytics();
    }
  }, [editorJobId, fetchJobs, fetchAnalytics]);

  const remove = async (job) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    try {
      await careersApi.adminDelete(job.id);
      toast.success('Job posting deleted');
      fetchJobs();
      fetchAnalytics();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  if (editorJobId !== undefined) {
    return (
      <JobEditor
        jobId={editorJobId}
        onBack={() => setEditorJobId(undefined)}
        onSaved={(job) => setEditorJobId(job.id)}
        onDeleted={() => setEditorJobId(undefined)}
      />
    );
  }

  return (
    <div className="space-y-5" data-testid="careers-manager">
      <AnalyticsPanel
        title="Careers Analytics"
        loading={analyticsLoading}
        error={analyticsError}
        stats={analytics ? [
          {
            testid: 'analytics-careers-views',
            label: 'Total Views',
            value: (analytics.total_views || 0).toLocaleString(),
            hint: `${analytics.avg_views_per_published || 0} avg/published`,
            icon: ANALYTICS_ICONS.Eye,
            gradient: 'from-blue-500 to-blue-500',
          },
          {
            testid: 'analytics-careers-published',
            label: 'Published Roles',
            value: analytics.published_jobs || 0,
            hint: `${analytics.draft_jobs || 0} draft${analytics.draft_jobs === 1 ? '' : 's'}`,
            icon: ANALYTICS_ICONS.FileText,
            gradient: 'from-blue-500 to-blue-500',
          },
          {
            testid: 'analytics-careers-last-30d',
            label: 'New in 30 days',
            value: analytics.published_last_30d || 0,
            hint: 'Newly published roles',
            icon: ANALYTICS_ICONS.TrendingUp,
            gradient: 'from-blue-500 to-blue-500',
          },
          {
            testid: 'analytics-careers-top',
            label: 'Top role views',
            value: (analytics.top_jobs?.[0]?.view_count || 0).toLocaleString(),
            hint: analytics.top_jobs?.[0]?.title?.slice(0, 32) || '—',
            icon: ANALYTICS_ICONS.TrendingUp,
            gradient: 'from-violet-500 to-violet-500',
          },
        ] : []}
        topTitle="Top 5 roles by views"
        topRows={(analytics?.top_jobs || []).map((j) => ({
          slug: j.slug,
          title: j.title,
          view_count: j.view_count,
          meta: [j.department, j.published_at ? new Date(j.published_at).toLocaleDateString() : null].filter(Boolean).join(' · '),
        }))}
        rowLinkBase="/careers"
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Job postings</h2>
          <p className="text-sm text-slate-500">
            {jobs.length} total · {jobs.filter((j) => j.status === 'published').length} published
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditorJobId(null)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          data-testid="careers-manager-new"
        >
          <Plus className="h-4 w-4" /> New role
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full mx-auto mb-3" />
          Loading roles…
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500 mb-4">No job postings yet.</p>
          <button
            type="button"
            onClick={() => setEditorJobId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            data-testid="careers-manager-empty-new"
          >
            <Plus className="h-4 w-4" /> Post your first role
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200" data-testid="careers-manager-table">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Stage</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Layer</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50" data-testid={`careers-row-${j.slug}`}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{j.title || '(untitled)'}</div>
                    <div className="text-xs text-slate-400 font-mono">/careers/{j.slug}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                  <td className="px-4 py-3">
                    <span
                      data-testid={`careers-row-${j.slug}-stage`}
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${stageStyle(j.hiring_stage || 'Open Role')}`}
                    >
                      {j.hiring_stage || 'Open Role'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{j.department || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{j.layer || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{j.location || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 tabular-nums">
                      <Eye className="h-3 w-3 text-slate-400" />
                      {(j.view_count || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(j.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {j.status === 'published' && (
                        <a
                          href={`/careers/${j.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                          data-testid={`careers-row-${j.slug}-view`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditorJobId(j.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md"
                        data-testid={`careers-row-${j.slug}-edit`}
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(j)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md"
                        data-testid={`careers-row-${j.slug}-delete`}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
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

export default CareersManager;
