import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, RefreshCw, Save, Link2, Mail, KeyRound } from 'lucide-react';
import { api } from '../../lib/api';

const AdminSettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
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

  const saveAll = async () => {
    setSaving(true);
    try {
      const res = await api.appSettingsUpdate({
        booking_url_default: bookingDefault,
        sender_email: senderEmail,
        sender_name: senderName,
      });
      setSettings(res.settings);
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

      {/* Booking URL fallback */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 inline-flex items-center gap-2">
            <Link2 className="h-5 w-5 text-orange-600" /> Book-a-Call fallback URL
          </h3>
          <p className="text-sm text-slate-500">
            <strong>Hosts</strong> are now configured per-admin under <em>Users</em>: open a row and set their designation, photo, booking URL, and custom fields.
            This fallback URL is used only when no admin has been published as a host yet.
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Fallback Google Calendar URL
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
