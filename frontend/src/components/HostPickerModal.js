import React, { useEffect, useState } from 'react';
import { X, ArrowRight, Calendar } from 'lucide-react';

/**
 * Modal that lists configured hosts (from /api/app-settings/public) as
 * avatar cards. Clicking a card opens that host's calendar in a new tab.
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   hosts: [{ id, name, role, initials, photo_url, booking_url }]
 *   fallbackUrl: string  (used when no hosts configured)
 */
const HOST_GRADIENTS = [
  'from-orange-500 to-rose-500',
  'from-sky-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-fuchsia-500',
];

const HostAvatar = ({ host, idx }) => {
  const grad = HOST_GRADIENTS[idx % HOST_GRADIENTS.length];
  if (host.photo_url) {
    return (
      <img
        src={host.photo_url}
        alt={host.name}
        className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-md"
        loading="lazy"
      />
    );
  }
  const initials = host.initials || (host.name || '?').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-black text-lg shadow-md ring-2 ring-white`}>
      {initials}
    </div>
  );
};

const HostPickerModal = ({ open, onClose, hosts = [], fallbackUrl = '' }) => {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const pick = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const list = hosts.length ? hosts : (fallbackUrl ? [{
    id: 'default',
    name: 'Orgainse Team',
    role: 'Discovery call',
    initials: 'OC',
    booking_url: fallbackUrl,
  }] : []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      data-testid="host-picker-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Pick a host for your call"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 sm:px-8 py-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
          <button
            onClick={onClose}
            data-testid="host-picker-close"
            className="absolute top-4 right-4 text-slate-300 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-amber-300 mb-2">
            <Calendar className="h-3.5 w-3.5" /> Book a call
          </div>
          <h2 className="text-2xl sm:text-3xl font-black leading-tight">
            Pick the person you'd like to meet.
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md">
            Each host has their own calendar — pick whoever fits your topic best. We'll open their booking page in a new tab.
          </p>
        </div>

        {/* Hosts */}
        <div className="p-6 sm:p-8">
          {list.length === 0 ? (
            <div className="text-center py-12 text-slate-500" data-testid="host-picker-empty">
              No hosts configured yet. Please set them in Admin → Settings.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {list.map((h, idx) => (
                <button
                  type="button"
                  key={h.id || idx}
                  onClick={() => pick(h.booking_url)}
                  data-testid={`host-picker-card-${(h.name || 'host').toLowerCase().replace(/\s+/g, '-')}`}
                  className="group text-left flex flex-col gap-3 p-4 border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <HostAvatar host={h} idx={idx} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{h.name}</p>
                      {h.role && <p className="text-xs text-slate-500 truncate">{h.role}</p>}
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-600 mt-1 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Open calendar <ArrowRight className="h-3 w-3" />
                      </p>
                    </div>
                  </div>
                  {Array.isArray(h.custom_fields) && h.custom_fields.filter((cf) => cf.label && cf.label.trim()).length > 0 && (
                    <div className="border-t border-slate-100 pt-3 space-y-1">
                      {h.custom_fields.filter((cf) => cf.label && cf.label.trim()).slice(0, 3).map((cf, i) => (
                        <div key={i} className="flex gap-2 text-[11px] leading-tight">
                          <span className="font-bold text-slate-600 shrink-0">{cf.label}:</span>
                          <span className="text-slate-700 truncate">{cf.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostPickerModal;
