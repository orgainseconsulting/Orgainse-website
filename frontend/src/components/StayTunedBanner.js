import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, Clock } from 'lucide-react';

/**
 * Creative animated "Stay tuned" empty-state banner for Blog & Newsletter.
 *
 * Props:
 *  - kind: 'blog' | 'newsletter'
 *  - title (optional override)
 *  - subtitle (optional override)
 *  - ctaTo (default /contact)
 *  - ctaLabel
 */
const COPY = {
  blog: {
    kicker: 'Fresh ink',
    title: 'Stay tuned — the first post is brewing.',
    subtitle:
      'Our editors are stress-testing the takes so the words land cleaner than the slides. Drop your email and we\'ll ping you the moment the cursor stops blinking.',
    cta: 'Talk to us instead',
  },
  newsletter: {
    kicker: 'Issue zero',
    title: 'The Pulse goes live soon.',
    subtitle:
      'Fortnightly briefings from the AI-native desk — short, sharp, vendor-neutral. The printing press is warming up; be the first to read Issue #01.',
    cta: 'Or talk to us directly',
  },
};

const useCountdownTo = (targetDate) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, targetDate.getTime() - now);
  const d = Math.floor(ms / (24 * 3600 * 1000));
  const h = Math.floor((ms / (3600 * 1000)) % 24);
  const m = Math.floor((ms / (60 * 1000)) % 60);
  const s = Math.floor((ms / 1000) % 60);
  return { d, h, m, s, finished: ms === 0 };
};

// Default soft target: 30 days from first render (rolling). Looks "alive" without
// implying a hard launch promise. Used only when the admin hasn't set one.
const buildTarget = () => {
  const t = new Date();
  t.setDate(t.getDate() + 30);
  t.setHours(9, 0, 0, 0);
  return t;
};

const Pip = ({ value, label, testid }) => (
  <div
    data-testid={testid}
    className="flex flex-col items-center justify-center rounded-xl bg-slate-900/80 backdrop-blur-sm border border-white/10 px-3 sm:px-5 py-3 sm:py-4 min-w-[64px] sm:min-w-[84px] shadow-inner"
  >
    <span className="text-2xl sm:text-4xl font-black text-white tabular-nums leading-none">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-[9px] sm:text-[10px] mt-1 font-bold uppercase tracking-[0.2em] text-slate-400">
      {label}
    </span>
  </div>
);

const AnimatedDots = () => (
  <span className="inline-flex items-center gap-1.5" aria-hidden>
    <span className="h-2 w-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
    <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '120ms' }} />
    <span className="h-2 w-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '240ms' }} />
  </span>
);

const StayTunedBanner = ({
  kind = 'blog',
  title,
  subtitle,
  ctaTo = '/contact',
  ctaLabel,
  targetIso = '',
}) => {
  const copy = COPY[kind] || COPY.blog;
  // Memoise the target so the countdown doesn't reset on every render. If an
  // admin-configured ISO is passed, use it; otherwise fall back to the rolling
  // soft target.
  const [target] = useState(() => {
    if (targetIso) {
      const d = new Date(targetIso);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return buildTarget();
  });
  // If the prop changes while mounted (admin updates the date), re-anchor.
  const [activeTarget, setActiveTarget] = useState(target);
  useEffect(() => {
    if (targetIso) {
      const d = new Date(targetIso);
      if (!Number.isNaN(d.getTime())) setActiveTarget(d);
    } else {
      setActiveTarget(buildTarget());
    }
  }, [targetIso]);
  const { d, h, m, s } = useCountdownTo(activeTarget);

  return (
    <section
      data-testid={`stay-tuned-${kind}`}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white px-6 sm:px-12 py-14 sm:py-20"
    >
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl animate-pulse" style={{ animationDelay: '2.4s' }} />
      </div>

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.45) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm mb-6">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-200">
            {copy.kicker}
          </span>
          <AnimatedDots />
        </div>

        <h2 className="text-3xl sm:text-5xl font-black leading-tight mb-5">
          {title || copy.title.split('—')[0].trim()}{' '}
          {(title || copy.title).includes('—') && (
            <span className="text-orange-400">— {(title || copy.title).split('—').slice(1).join('—').trim()}</span>
          )}
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed">
          {subtitle || copy.subtitle}
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3" role="timer" aria-label="Until next launch window">
          <Pip value={d} label="days"  testid={`stay-tuned-${kind}-days`} />
          <span className="text-2xl text-slate-500 font-light pb-2">:</span>
          <Pip value={h} label="hours" testid={`stay-tuned-${kind}-hours`} />
          <span className="text-2xl text-slate-500 font-light pb-2">:</span>
          <Pip value={m} label="mins"  testid={`stay-tuned-${kind}-mins`} />
          <span className="text-2xl text-slate-500 font-light pb-2">:</span>
          <Pip value={s} label="secs"  testid={`stay-tuned-${kind}-secs`} />
        </div>
        <p className="text-xs text-slate-500 mb-10 inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          Soft launch window. We may surprise you sooner.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {kind === 'blog' ? (
            <Link
              to="/newsletter"
              data-testid={`stay-tuned-${kind}-newsletter-link`}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <Mail className="h-4 w-4" /> Subscribe to The Pulse instead
            </Link>
          ) : (
            <a
              href="#newsletter-hero-subscribe"
              data-testid={`stay-tuned-${kind}-subscribe-link`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector('[data-testid="newsletter-hero-email"]');
                if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); }
              }}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <Mail className="h-4 w-4" /> Reserve your seat — subscribe
            </a>
          )}

          <Link
            to={ctaTo}
            data-testid={`stay-tuned-${kind}-contact-link`}
            className="inline-flex items-center gap-2 text-slate-200 hover:text-white font-medium px-5 py-3 rounded-lg border border-white/20 hover:border-white/40 transition-colors"
          >
            {ctaLabel || copy.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StayTunedBanner;
