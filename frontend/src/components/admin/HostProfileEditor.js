import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Calendar, Eye, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';

/**
 * Per-user host profile editor used inside the Users tab.
 *
 * Lets the super-admin set what appears on the public Book-a-Call cards:
 *  - name (inherited from the user record but editable here for the card title)
 *  - designation
 *  - initials / photo URL (fallback avatar)
 *  - personal Google Calendar booking URL
 *  - show_as_host toggle (whether to publish this user as a host)
 *  - custom fields (label / value pairs — "Best for", "Languages", etc.)
 */
const HostProfileEditor = ({ user, onSaved }) => {
  const [form, setForm] = useState({
    designation: user.designation || '',
    photo_url: user.photo_url || '',
    initials: user.initials || '',
    booking_url: user.booking_url || '',
    show_as_host: !!user.show_as_host,
    custom_fields: user.custom_fields && user.custom_fields.length
      ? user.custom_fields
      : [{ label: '', value: '' }],
  });
  const [saving, setSaving] = useState(false);

  // Re-seed when switching between users
  useEffect(() => {
    setForm({
      designation: user.designation || '',
      photo_url: user.photo_url || '',
      initials: user.initials || '',
      booking_url: user.booking_url || '',
      show_as_host: !!user.show_as_host,
      custom_fields: user.custom_fields && user.custom_fields.length
        ? user.custom_fields
        : [{ label: '', value: '' }],
    });
  }, [user.id, user.designation, user.photo_url, user.initials, user.booking_url, user.show_as_host, user.custom_fields]);

  const updateField = (cb) => setForm((p) => {
    const next = { ...p, ...cb(p) };
    // Auto-publish to Book-a-Call the moment a booking URL is entered.
    // Admin can still explicitly uncheck if they want hidden-but-saved state.
    if (next.booking_url && !p.booking_url) next.show_as_host = true;
    if (!next.booking_url) next.show_as_host = false;
    return next;
  });

  const updateCustom = (idx, key, value) => {
    setForm((p) => ({
      ...p,
      custom_fields: p.custom_fields.map((cf, i) => i === idx ? { ...cf, [key]: value } : cf),
    }));
  };

  const addCustom = () => setForm((p) => ({ ...p, custom_fields: [...p.custom_fields, { label: '', value: '' }] }));
  const removeCustom = (idx) => setForm((p) => ({
    ...p,
    custom_fields: p.custom_fields.filter((_, i) => i !== idx),
  }));

  const initialsPreview = useMemo(() => {
    const i = (form.initials || '').trim();
    if (i) return i.toUpperCase().slice(0, 4);
    const name = (user.name || user.email || '?').trim();
    return name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }, [form.initials, user.name, user.email]);

  const cantHost = !form.booking_url;

  const submit = async () => {
    setSaving(true);
    try {
      const cleanedFields = form.custom_fields
        .map((cf) => ({ label: (cf.label || '').trim(), value: (cf.value || '').trim() }))
        .filter((cf) => cf.label.length > 0);

      if (form.show_as_host && !form.booking_url) {
        toast.error('Set a booking URL before marking this user as a host.');
        setSaving(false);
        return;
      }

      const res = await api.adminUsersUpdate(user.id, {
        designation: form.designation,
        photo_url: form.photo_url,
        initials: form.initials.toUpperCase(),
        booking_url: form.booking_url,
        show_as_host: form.show_as_host,
        custom_fields: cleanedFields,
      });
      toast.success('Host profile saved');
      onSaved && onSaved(res.user);
    } catch (err) {
      toast.error(err.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-5" data-testid={`host-profile-${user.email}`}>
      {/* Live preview card */}
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-80 shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Live preview</p>
          <div className="bg-white border-2 border-slate-200 rounded-xl p-4 flex items-center gap-3">
            {form.photo_url ? (
              // eslint-disable-next-line jsx-a11y/img-redundant-alt
              <img src={form.photo_url} alt="host" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white font-black">
                {initialsPreview}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">{user.name || user.email}</p>
              <p className="text-xs text-slate-500 truncate">{form.designation || '— set a designation —'}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-600 mt-1 inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {cantHost ? 'No booking URL' : 'Book a call'}
              </p>
            </div>
          </div>
          {form.custom_fields.filter((cf) => cf.label.trim()).length > 0 && (
            <div className="mt-3 bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 text-xs">
              {form.custom_fields.filter((cf) => cf.label.trim()).map((cf, i) => (
                <div key={i} className="flex gap-2">
                  <span className="font-bold text-slate-600 shrink-0">{cf.label}:</span>
                  <span className="text-slate-700">{cf.value || '—'}</span>
                </div>
              ))}
            </div>
          )}
          {form.booking_url && (
            <a
              href={form.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-900"
            >
              <ExternalLink className="h-3 w-3" /> Open this calendar
            </a>
          )}
        </div>

        {/* Form */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Designation / Title</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => updateField(() => ({ designation: e.target.value }))}
                placeholder="Co-founder · Engineering"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                data-testid={`host-profile-${user.email}-designation`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Initials (fallback avatar)</label>
              <input
                type="text"
                value={form.initials}
                maxLength={4}
                onChange={(e) => updateField(() => ({ initials: e.target.value.toUpperCase() }))}
                placeholder="SW"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500"
                data-testid={`host-profile-${user.email}-initials`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Profile photo URL (optional)</label>
              <input
                type="url"
                value={form.photo_url}
                onChange={(e) => updateField(() => ({ photo_url: e.target.value }))}
                placeholder="https://…"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                data-testid={`host-profile-${user.email}-photo`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Google Calendar booking URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={form.booking_url}
                onChange={(e) => updateField(() => ({ booking_url: e.target.value }))}
                placeholder="https://calendar.app.google/XXXXXX"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                data-testid={`host-profile-${user.email}-booking`}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Visitors who pick this host land on <strong>this</strong> calendar. Required to be visible as a host.
              </p>
            </div>
          </div>

          {/* Custom fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Custom fields (shown on the card)
              </label>
              <button
                type="button"
                onClick={addCustom}
                data-testid={`host-profile-${user.email}-add-custom`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-800"
              >
                <Plus className="h-3 w-3" /> Add field
              </button>
            </div>
            <div className="space-y-2">
              {form.custom_fields.map((cf, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center" data-testid={`host-profile-${user.email}-custom-${i}`}>
                  <input
                    type="text"
                    value={cf.label}
                    onChange={(e) => updateCustom(i, 'label', e.target.value)}
                    placeholder="Label (e.g. Languages)"
                    className="col-span-4 px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    value={cf.value}
                    onChange={(e) => updateCustom(i, 'value', e.target.value)}
                    placeholder="Value (e.g. English, Hindi)"
                    className="col-span-7 px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeCustom(i)}
                    aria-label="Remove field"
                    className="col-span-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility toggle + save */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.show_as_host}
                onChange={(e) => updateField(() => ({ show_as_host: e.target.checked }))}
                disabled={cantHost}
                data-testid={`host-profile-${user.email}-show-toggle`}
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
              />
              <span className="text-sm font-semibold text-slate-700 inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> Show on the public Book-a-Call modal
                {cantHost && <span className="text-xs text-slate-400 italic">(needs booking URL)</span>}
              </span>
            </label>
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              data-testid={`host-profile-${user.email}-save`}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2 rounded-lg disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save host profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostProfileEditor;
