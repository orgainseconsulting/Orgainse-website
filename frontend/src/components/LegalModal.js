import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { LEGAL_UPDATED } from "../content/legal";

export const LegalBody = ({ doc, testIdPrefix = "legal" }) => (
  <div data-testid={`${testIdPrefix}-body`}>
    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold">Last updated · {LEGAL_UPDATED}</p>
    <p className="mt-5 text-sm text-slate-600 leading-relaxed">{doc.intro}</p>
    <div className="mt-10 space-y-9">
      {doc.sections.map((s) => (
        <section key={s.heading}>
          <h3 className="font-outfit text-lg font-bold text-slate-900 tracking-[-0.02em]">{s.heading}</h3>
          {(s.paragraphs || []).map((p, i) => (
            <p key={i} className="mt-3 text-sm text-slate-600 leading-relaxed">
              {p}
            </p>
          ))}
          {s.bullets && (
            <ul className="mt-4 space-y-2.5">
              {s.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          )}
          {s.note && (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[13px] text-slate-700 leading-relaxed">{s.note}</p>
          )}
        </section>
      ))}
    </div>
  </div>
);

/**
 * Footer legal popup. Renders in a portal, closes on Escape / backdrop click,
 * and locks background scroll while open.
 */
const LegalModal = ({ doc, onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!doc) return null;

  return createPortal(
    <div
      data-testid={`legal-modal-${doc.id}`}
      role="dialog"
      aria-modal="true"
      aria-label={doc.title}
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        data-testid="legal-modal-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[86vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.6)] org-fade-up">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 sm:px-9 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-blue-600 font-bold">Orgainse Consulting</p>
            <h2 className="mt-1 font-outfit text-xl sm:text-2xl font-bold tracking-[-0.03em] text-slate-900">{doc.title}</h2>
          </div>
          <button
            data-testid="legal-modal-close"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 grid place-items-center h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 sm:px-9 py-7" style={{ maxHeight: "calc(86vh - 96px)" }}>
          <LegalBody doc={doc} testIdPrefix={`legal-modal-${doc.id}`} />
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
            <a
              href={`/${doc.id}`}
              data-testid={`legal-modal-openpage-${doc.id}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
            >
              Open as a full page
            </a>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LegalModal;
