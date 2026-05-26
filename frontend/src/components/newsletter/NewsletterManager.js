import React, { useState } from 'react';
import { Mail, Users, Tags } from 'lucide-react';
import IssuesManager from './IssuesManager';
import SubscribersTable from './SubscribersTable';
import SegmentsManager from './SegmentsManager';
import NextLaunchCountdownCard from '../admin/NextLaunchCountdownCard';

const TABS = [
  { id: 'issues', label: 'Issues', icon: Mail },
  { id: 'subscribers', label: 'Subscribers', icon: Users },
  { id: 'segments', label: 'Segments', icon: Tags },
];

const NewsletterManager = () => {
  const [tab, setTab] = useState('issues');

  return (
    <div data-testid="newsletter-manager" className="space-y-6">
      <NextLaunchCountdownCard kind="newsletter" />

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
