import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Clock, Save, X } from 'lucide-react';
import { api } from '../../lib/api';

/**
 * Admin control: set / clear the "Stay Tuned" countdown target for the Blog or
 * Newsletter empty-state banner.
 *
 * Props:
 *  - kind: 'blog' | 'newsletter'  (which app-settings key to read/write)
 *
 * Behaviour:
 *  - Reads /api/app-settings to seed the picker with current value.
 *  - Saves via PUT /api/app-settings with the corresponding field.
 *  - Stored as ISO datetime string. Empty string = no countdown (default rolling).
 *
 * Allowed for any admin token (super-admin not required) — visible inside
 * BlogManager / NewsletterManager which are open to all admins.
 *
 * Note: app-settings GET is super-admin only; for regular admins we fall back
 * to /api/app-settings/public to read the current value.
 */
const SETTING_FIELD = {
  blog: 'next_blog_launch_at',
  newsletter: 'next_newsletter_launch_at',
};

const LABELS = {
  blog: 'Next blog post launch',
  newsletter: 'Next newsletter issue launch',
};

const toLocalInput = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    // datetime-local needs YYYY-MM-DDTHH:mm in local time
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

const fromLocalInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
};

const fmtUTC = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium', timeStyle: 'short',
    });
  } catch { return iso; }
};

const NextLaunchCountdownCard = ({ kind }) => {
  const field = SETTING_FIELD[kind];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentIso, setCurrentIso] = useState('');
  const [draft, setDraft] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Try super-admin endpoint first; fall back to public if 403.
      let value = '';
      try {
        const res = await api.appSettingsGet();
        value = res.settings?.[field] || '';
      } catch (err) {
        if (err.status === 403) {
          const pub = await api.appSettingsPublic();
          value = pub.settings?.[field] || '';
        } else {
          throw err;
        }
      }
      setCurrentIso(value);
      setDraft(toLocalInput(value));
    } catch (err) {
      toast.error(err.message || 'Failed to load countdown');
    } finally {
      setLoading(false);
    }
  }, [field]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const iso = fromLocalInput(draft);
      const res = await api.appSettingsUpdate({ [field]: iso });
      setCurrentIso(res.settings?.[field] || '');
      toast.success(iso ? 'Countdown saved' : 'Countdown cleared');
    } catch (err) {
      if (err.status === 403) {
        toast.error('Only super-admin can change the countdown. Ask Swarag.');
      } else {
        toast.error(err.message || 'Could not save countdown');
      }
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    setDraft('');
    setSaving(true);
    try {
      const res = await api.appSettingsUpdate({ [field]: '' });
      setCurrentIso(res.settings?.[field] || '');
      toast.success('Countdown cleared');
    } catch (err) {
      toast.error(err.message || 'Could not clear');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-6" data-testid={`next-launch-card-${kind}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-amber-300 mb-1">
            <Clock className="h-3.5 w-3.5" /> Stay-tuned countdown
          </div>
          <h3 className="text-lg sm:text-xl font-bold leading-tight">{LABELS[kind]}</h3>
          <p className="text-xs text-slate-300 mt-1">
            Visitors see this countdown on the public {kind} page when no posts are published yet.
            Leave empty to use the default rolling 30-day window.
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Current target</p>
          <p className="text-sm font-mono font-bold text-amber-200" data-testid={`next-launch-current-${kind}`}>
            {loading ? '…' : (currentIso ? fmtUTC(currentIso) : 'none')}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          type="datetime-local"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={loading || saving}
          data-testid={`next-launch-input-${kind}`}
          className="flex-1 bg-slate-950/40 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={save}
          disabled={loading || saving}
          data-testid={`next-launch-save-${kind}`}
          className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save target'}
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={loading || saving || !currentIso}
          data-testid={`next-launch-clear-${kind}`}
          className="inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded-lg border border-white/10 hover:border-white/30 disabled:opacity-30"
        >
          <X className="h-4 w-4" /> Clear
        </button>
      </div>
    </div>
  );
};

export default NextLaunchCountdownCard;
