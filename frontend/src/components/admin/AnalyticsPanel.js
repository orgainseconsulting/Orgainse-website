import React from 'react';
import { Eye, FileText, TrendingUp, Users, Send, AlertCircle, Mail, ArrowUpRight, Loader2 } from 'lucide-react';

/**
 * AnalyticsPanel — shared layout for Blog + Newsletter analytics cards.
 *
 * Props:
 *   - title                : header label (e.g. "Blog Analytics")
 *   - loading, error       : async state from parent
 *   - stats: [{ label, value, hint?, icon, gradient, testid }]
 *   - topTitle, topRows    : "Top performers" table — rows: { title, slug, view_count, meta? }
 *   - rowLinkBase          : if set, slug links to `${rowLinkBase}/{slug}` (public preview)
 */
const StatCard = ({ stat }) => {
  const Icon = stat.icon || Eye;
  return (
    <div
      data-testid={stat.testid}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all`}
    >
      <div className={`absolute -right-4 -bottom-4 h-20 w-20 rounded-full opacity-10 bg-gradient-to-br ${stat.gradient || 'from-slate-400 to-slate-600'}`}></div>
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {stat.label}
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums leading-tight">
            {stat.value ?? '—'}
          </div>
          {stat.hint && (
            <div className="mt-1 text-[11px] text-slate-500">{stat.hint}</div>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient || 'from-slate-400 to-slate-600'} text-white shadow-sm`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

const AnalyticsPanel = ({
  title,
  loading,
  error,
  stats = [],
  topTitle,
  topRows = [],
  rowLinkBase,
}) => {
  return (
    <section className="mb-6" data-testid="admin-analytics-panel">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-700 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-orange-500" /> {title}
        </h3>
        {loading && <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />}
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => <StatCard key={s.testid || i} stat={s} />)}
      </div>

      {topRows.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            {topTitle || 'Top performers'}
          </div>
          <ul className="divide-y divide-slate-100" data-testid="admin-analytics-top-list">
            {topRows.map((r, i) => (
              <li key={r.slug || i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="flex-shrink-0 w-6 text-[11px] font-bold text-slate-400 tabular-nums">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{r.title || r.slug}</div>
                  {r.meta && <div className="text-[11px] text-slate-500 truncate">{r.meta}</div>}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600 font-bold tabular-nums">
                  <Eye className="h-3 w-3 text-slate-400" /> {r.view_count?.toLocaleString?.() ?? 0}
                </div>
                {rowLinkBase && r.slug && (
                  <a
                    href={`${rowLinkBase}/${r.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                    data-testid={`admin-analytics-top-link-${i}`}
                    aria-label="Open in new tab"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

// Pre-built icon presets for parent components to reuse
export const ANALYTICS_ICONS = { Eye, FileText, TrendingUp, Users, Send, Mail };

export default AnalyticsPanel;
