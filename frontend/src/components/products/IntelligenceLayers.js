import { ChevronDown, Sparkles } from "lucide-react";
import { LAYERS, PRODUCT_LABELS } from "../../data/orqyneLayers";

const Pill = ({ children, tone = "slate", testid }) => (
  <span
    data-testid={testid}
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap ${
      tone === "deep" ? "bg-slate-900 text-white" : "border border-slate-200 bg-slate-50 text-slate-500"
    }`}
  >
    {children}
  </span>
);

const LayerCard = ({ layer, index }) => (
  <article data-testid={`layer-card-${layer.id}`} className="org-hover-lift flex h-full flex-col bg-white rounded-2xl border border-slate-200 p-7">
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400">{String(index + 1).padStart(2, "0")}</span>
      {layer.deep && <Pill tone="deep" testid={`layer-deep-tag-${layer.id}`}>Deep Intelligence</Pill>}
    </div>
    <h3 className="mt-4 font-outfit font-bold text-slate-900 text-lg tracking-[-0.02em]">{layer.t}</h3>
    <p className="mt-2 text-sm text-slate-600 leading-relaxed" data-testid={`layer-summary-${layer.id}`}>{layer.d}</p>
    <ul className="mt-5 space-y-4 border-t border-slate-100 pt-5">
      {layer.features.map((f, i) => (
        <li key={`${f.p}-${f.t}`} data-testid={`layer-feature-${layer.id}-${i}`}>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-semibold text-slate-900 mr-1">{f.t}</span>
            <Pill>{PRODUCT_LABELS[f.p]}</Pill>
            {f.deep && <Pill tone="deep">Deep Intelligence</Pill>}
          </div>
          <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">{f.d}</p>
        </li>
      ))}
    </ul>
  </article>
);

const Glossary = () => (
  <details className="group mt-10 rounded-2xl border border-slate-200 bg-white" data-testid="layers-glossary">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 font-outfit font-semibold text-slate-900" data-testid="layers-glossary-toggle">
      Key terms
      <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
    </summary>
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 px-6 pb-6">
      {LAYERS.flatMap((l) => l.terms).map((term) => (
        <div key={term.t} data-testid={`layers-term-${term.t.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
          <dt className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-slate-900">
            {term.t} <Pill>{PRODUCT_LABELS[term.p]}</Pill>
          </dt>
          <dd className="mt-1 text-[13px] text-slate-600 leading-relaxed">{term.d}</dd>
        </div>
      ))}
    </dl>
  </details>
);

export const IntelligenceLayers = ({ onContactSales }) => (
  <section id="intelligence-layers" className="scroll-mt-28 py-24 bg-slate-50 border-y border-slate-200" data-testid="intelligence-layers-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3">Layers of Intelligence</p>
      <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900" data-testid="layers-heading">
        Nine layers of intelligence, built into IT Services and Canvas Business Management.
      </h2>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch" data-testid="layers-grid">
        {LAYERS.map((l, i) => <LayerCard key={l.id} layer={l} index={i} />)}
      </div>
      <div className="mt-10 rounded-2xl bg-slate-900 text-white p-6 lg:p-8 flex flex-wrap items-center justify-between gap-4" data-testid="layers-deep-note">
        <p className="max-w-2xl text-sm text-slate-300 leading-relaxed">
          <span className="mb-1 flex items-center gap-2 font-outfit text-lg font-semibold text-white">
            <Sparkles className="h-4 w-4" /> Deep Intelligence, part of ORQYNE
          </span>
          Features marked Deep Intelligence are part of ORQYNE. Contact Sales for access.
        </p>
        <button
          type="button"
          onClick={onContactSales}
          data-testid="layers-deep-contact-btn"
          className="px-6 py-3 rounded-full bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
        >
          Contact Sales
        </button>
      </div>
      <Glossary />
    </div>
  </section>
);
