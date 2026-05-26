import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, RefreshCw, Save, Trash2, Plus, Link2, Mail, KeyRound } from 'lucide-react';
import { api } from '../../lib/api';

const blankHost = () => ({
  id: '',
  name: '',
  role: '',
  initials: '',
  photo_url: '',
  booking_url: '',
});

const HostCard = ({ host, onChange, onRemove }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3"
    data-testid={`settings-host-${host.id || 'new'}`}>
    <div className="md:col-span-2 flex items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-black text-base overflow-hidden">
        {host.photo_url ? (
          // eslint-disable-next-line jsx-a11y/img-redundant-alt
          <img src={host.photo_url} alt={host.name || 'host photo'} className="w-full h-full object-cover" />
        ) : (
          host.initials || (host.name || '?').slice(0, 2).toUpperCase()
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Host</p>
        <p className="text-sm font-semibold text-slate-900">{host.name || 'Unnamed host'}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-red-600 hover:text-red-800 text-xs font-semibold inline-flex items-center gap-1"
      >
        <Trash2 className="h-3.5 w-3.5" /> Remove
      </button>
    </div>

    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Name</label>
      <input
        type="text"
        value={host.name}
        onChange={(e) => onChange({ ...host, name: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      />
    </div>
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Role / Title</label>
      <input
        type="text"
        value={host.role}
        onChange={(e) => onChange({ ...host, role: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        placeholder="Co-founder"
      />
    </div>
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Initials (fallback avatar)</label>
      <input
        type="text"
        value={host.initials}
        maxLength={4}
        onChange={(e) => onChange({ ...host, initials: e.target.value.toUpperCase() })}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono"
        placeholder="SW"
      />
    </div>
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Photo URL (optional)</label>
      <input
        type="url"
        value={host.photo_url}
        onChange={(e) => onChange({ ...host, photo_url: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        placeholder="https://…"
      />
    </div>
    <div className="md:col-span-2">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
        Google Calendar booking URL
      </label>
      <input
        type="url"
        required
        value={host.booking_url}
        onChange={(e) => onChange({ ...host, booking_url: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        placeholder="https://calendar.app.google/XXXXXXXX"
      />
    </div>
  </div>
);

const AdminSettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [hosts, setHosts] = useState([]);
  const [bookingDefault, setBookingDefault] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');

  // Resend key editing
  const [replacingKey, setReplacingKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.appSettingsGet();
      const s = res.settings || {};
      setSettings(s);
      setHosts(s.hosts || []);
      setBookingDefault(s.booking_url_default || '');
      setSenderEmail(s.sender_email || '');
      setSenderName(s.sender_name || '');
    } catch (err) {
      toast.error(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const addHost = () => setHosts((p) => [...p, blankHost()]);
  const updateHost = (idx, next) => setHosts((p) => p.map((h, i) => i === idx ? next : h));
  const removeHost = (idx) => setHosts((p) => p.filter((_, i) => i !== idx));

  const saveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        hosts: hosts.map((h) => ({
          id: h.id || undefined,
          name: h.name || '',
          role: h.role || '',
          initials: (h.initials || '').toUpperCase(),
          photo_url: h.photo_url || '',
          booking_url: h.booking_url || '',
        })).filter((h) => h.name && h.booking_url),
        booking_url_default: bookingDefault,
        sender_email: senderEmail,
        sender_name: senderName,
      };
      const res = await api.appSettingsUpdate(payload);
      setSettings(res.settings);
      setHosts(res.settings.hosts || []);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  const saveResendKey = async () => {
    if (!newKey || !newKey.startsWith('re_')) {
      toast.error('Resend keys must start with re_');
      return;
    }
    setSaving(true);
    try {
      const res = await api.appSettingsUpdate({ resend_api_key: newKey });
      setSettings(res.settings);
      setReplacingKey(false);
      setNewKey('');
      toast.success('Resend API key updated');
    } catch (err) {
      toast.error(err.message || 'Could not update key');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-10 text-center text-slate-500">Loading settings…</div>;

  return (
    <div className="space-y-8" data-testid="admin-settings-manager">

      {/* Resend API key */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 inline-flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-600" /> Resend API key
            </h3>
            <p className="text-sm text-slate-500">Used to send newsletter campaigns. Stored encrypted at rest.</p>
          </div>
          <button
            onClick={fetchSettings}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {!replacingKey ? (
          <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <code data-testid="settings-resend-key-masked" className="font-mono text-sm text-slate-700">
                {settings?.resend_api_key_set ? (showKey ? '(re-enter to reveal)' : settings?.resend_api_key_masked) : 'No key set'}
              </code>
              <button
                onClick={() => setShowKey((v) => !v)}
                disabled={!settings?.resend_api_key_set}
                className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                aria-label="Toggle visibility"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              onClick={() => setReplacingKey(true)}
              data-testid="settings-resend-replace-btn"
              className="text-sm font-semibold text-orange-600 hover:text-orange-800"
            >
              Replace
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="re_..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
              data-testid="settings-resend-new-key-input"
            />
            <button onClick={saveResendKey} disabled={saving} data-testid="settings-resend-save-btn"
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg">
              Save
            </button>
            <button onClick={() => { setReplacingKey(false); setNewKey(''); }} className="text-sm text-slate-500 hover:text-slate-800">
              Cancel
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              <Mail className="h-3 w-3 inline mr-1" /> Sender email
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              data-testid="settings-sender-email"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Sender name</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              data-testid="settings-sender-name"
            />
          </div>
        </div>
      </section>

      {/* Booking URL + hosts */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 inline-flex items-center gap-2">
            <Link2 className="h-5 w-5 text-orange-600" /> Book-a-Call hosts
          </h3>
          <p className="text-sm text-slate-500">
            These hosts appear in the Book-a-Call modal across the site. Each gets their own Google Calendar URL.
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Fallback booking URL (used when no host picked)
          </label>
          <input
            type="url"
            value={bookingDefault}
            onChange={(e) => setBookingDefault(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            placeholder="https://calendar.app.google/XXXXXXXX"
            data-testid="settings-booking-default"
          />
        </div>

        <div className="space-y-4">
          {hosts.map((h, idx) => (
            <HostCard
              key={h.id || `new-${idx}`}
              host={h}
              onChange={(next) => updateHost(idx, next)}
              onRemove={() => removeHost(idx)}
            />
          ))}
          <button
            type="button"
            onClick={addHost}
            data-testid="settings-host-add"
            className="w-full inline-flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-orange-300 hover:text-orange-600 text-slate-500 rounded-xl py-4 text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" /> Add another host
          </button>
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={saveAll}
          disabled={saving}
          data-testid="settings-save-all"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsManager;
