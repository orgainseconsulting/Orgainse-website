import React, { useCallback, useEffect, useState } from 'react';
import { Mail, Users, Tags } from 'lucide-react';
import IssuesManager from './IssuesManager';
import SubscribersTable from './SubscribersTable';
import SegmentsManager from './SegmentsManager';
import NextLaunchCountdownCard from '../admin/NextLaunchCountdownCard';
import AnalyticsPanel, { ANALYTICS_ICONS } from '../admin/AnalyticsPanel';
import { newsletterApi } from '../../lib/newsletterApi';

const TABS = [
  { id: 'issues', label: 'Issues', icon: Mail },
  { id: 'subscribers', label: 'Subscribers', icon: Users },
  { id: 'segments', label: 'Segments', icon: Tags },
];

const NewsletterManager = () => {
  const [tab, setTab] = useState('issues');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await newsletterApi.adminAnalytics();
      setAnalytics(res.analytics || null);
    } catch (err) {
      setAnalyticsError(err.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return (
    <div data-testid="newsletter-manager" className="space-y-6">
      <NextLaunchCountdownCard kind="newsletter" />

      <AnalyticsPanel
        title="Newsletter Analytics"
        loading={analyticsLoading}
        error={analyticsError}
        stats={analytics ? [
          {
            testid: 'analytics-news-active-subs',
            label: 'Active subscribers',
            value: (analytics.active_subscribers || 0).toLocaleString(),
            hint: `+${analytics.new_subscribers_7d || 0} in 7d · +${analytics.new_subscribers_30d || 0} in 30d`,
            icon: ANALYTICS_ICONS.Users,
            gradient: 'from-emerald-500 to-green-500',
          },
          {
            testid: 'analytics-news-total-views',
            label: 'Total Issue Views',
            value: (analytics.total_views || 0).toLocaleString(),
            hint: `${analytics.avg_views_per_published || 0} avg/published`,
            icon: ANALYTICS_ICONS.Eye,
            gradient: 'from-orange-500 to-amber-500',
          },
          {
            testid: 'analytics-news-sent',
            label: 'Issues sent',
            value: analytics.sent_issues || 0,
            hint: `${analytics.published_issues || 0} published · ${analytics.draft_issues || 0} draft`,
            icon: ANALYTICS_ICONS.Send,
            gradient: 'from-sky-500 to-cyan-500',
          },
          {
            testid: 'analytics-news-top-issue',
            label: 'Top issue views',
            value: (analytics.top_issues?.[0]?.view_count || 0).toLocaleString(),
            hint: analytics.top_issues?.[0]?.title?.slice(0, 32) || '—',
            icon: ANALYTICS_ICONS.TrendingUp,
            gradient: 'from-purple-500 to-fuchsia-500',
          },
        ] : []}
        topTitle="Top 5 issues by views"
        topRows={(analytics?.top_issues || []).map((i) => ({
          slug: i.slug,
          title: i.title,
          view_count: i.view_count,
          meta: [
            i.status,
            i.sent_count ? `sent to ${i.sent_count.toLocaleString()}` : null,
            i.published_at ? new Date(i.published_at).toLocaleDateString() : null,
          ].filter(Boolean).join(' · '),
        }))}
        rowLinkBase="/newsletter"
      />

      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex gap-6" aria-label="Newsletter tabs">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                data-testid={`newsletter-subtab-${t.id}`}
                className={`inline-flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 text-sm font-semibold transition-colors
                  ${active ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}>
                <Icon className="h-4 w-4" />{t.label}
              </button>
            );
          })}
        </nav>
      </div>
      {tab === 'issues' && <IssuesManager />}
      {tab === 'subscribers' && <SubscribersTable />}
      {tab === 'segments' && <SegmentsManager />}
    </div>
  );
};

export default NewsletterManager;
