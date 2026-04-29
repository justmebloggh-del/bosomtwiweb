import { ReactNode } from 'react';
import { motion } from 'motion/react';

// Authentic kente color sequences — gold, black, forest green, crimson
const KENTE_STRIPS = [
  ['#C9A227','#0A0600','#C9A227','#145214','#C9A227','#6B0000','#C9A227','#0A0600','#145214','#C9A227','#6B0000','#0A0600'],
  ['#0A0600','#C9A227','#6B0000','#C9A227','#145214','#0A0600','#C9A227','#6B0000','#C9A227','#145214','#C9A227','#6B0000'],
  ['#145214','#0A0600','#C9A227','#6B0000','#C9A227','#0A0600','#145214','#C9A227','#6B0000','#0A0600','#C9A227','#145214'],
  ['#6B0000','#C9A227','#0A0600','#C9A227','#145214','#C9A227','#6B0000','#0A0600','#C9A227','#6B0000','#145214','#C9A227'],
  ['#C9A227','#145214','#6B0000','#0A0600','#C9A227','#6B0000','#0A0600','#C9A227','#145214','#6B0000','#C9A227','#0A0600'],
  ['#0A0600','#6B0000','#C9A227','#145214','#0A0600','#C9A227','#6B0000','#145214','#C9A227','#0A0600','#6B0000','#C9A227'],
];
const SEG = 34; // px per colour block

interface KenteBannerProps {
  title: string;
  badge?: string;
  description?: string;
  count?: string;
  above?: ReactNode;
  actions?: ReactNode;
}

export default function KenteBanner({ title, badge, description, count, above, actions }: KenteBannerProps) {
  return (
    <header
      className="relative overflow-hidden py-16 md:py-24 border-b border-black/40"
      style={{ background: 'linear-gradient(135deg, #08040A 0%, #100800 45%, #050302 100%)' }}
    >
      {/* ── Kente animated strips ───────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {KENTE_STRIPS.map((colors, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          const segTotal = colors.length * SEG;
          const pct = (i / KENTE_STRIPS.length) * 100;
          return (
            <motion.div
              key={i}
              className="absolute left-0 flex"
              style={{ top: `${pct}%`, height: `${100 / KENTE_STRIPS.length}%`, opacity: 0.18 }}
              animate={{ x: [0, dir * segTotal, 0] }}
              transition={{ duration: 22 + i * 4, repeat: Infinity, ease: 'linear' }}
            >
              {/* Repeat to fill viewport width + overflow */}
              {Array.from({ length: 8 }).map((_, r) => (
                <div key={r} className="flex shrink-0">
                  {colors.map((c, k) => (
                    <div
                      key={k}
                      style={{ width: SEG, background: c, height: '100%' }}
                    />
                  ))}
                </div>
              ))}
            </motion.div>
          );
        })}

        {/* Diagonal crosshatch overlay — simulates woven weft */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #C9A227 0px, #C9A227 1px,
              transparent 1px, transparent 14px
            )`,
          }}
        />
      </div>

      {/* ── Gold atmospheric glows ──────────────────────── */}
      <motion.div
        animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.45) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute -bottom-24 right-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.35) 0%, transparent 70%)' }}
      />

      {/* ── Content row ────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6 md:gap-12">

        {/* Left: text */}
        <div className="flex-1 min-w-0">
          {badge && (
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-ashanti-gold text-[11px] uppercase font-black tracking-[0.45em] mb-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ashanti-gold animate-pulse" />
              {badge}
            </motion.span>
          )}

          {above && (
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="mb-3">
              {above}
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="font-heading font-black text-white uppercase leading-none tracking-tighter"
            style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}
          >
            {title}
          </motion.h1>

          {/* Gold underline accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.18, duration: 0.6, ease: 'easeOut' }}
            className="origin-left mt-3 h-[3px] w-24 rounded-full"
            style={{ background: 'linear-gradient(90deg, #C9A227, #FFD700, #C9A227)' }}
          />

          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.14 }}
              className="mt-4 text-white/45 text-sm max-w-lg leading-relaxed"
            >
              {description}
            </motion.p>
          )}

          {count && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="mt-2 text-white/20 text-[10px] uppercase tracking-widest font-black"
            >
              {count}
            </motion.p>
          )}

          {actions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mt-6"
            >
              {actions}
            </motion.div>
          )}
        </div>

        {/* Right: floating artifact */}
        <motion.div
          initial={{ opacity: 0, x: 48, scale: 0.82 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.16, type: 'spring', damping: 16, stiffness: 90 }}
          className="hidden md:flex shrink-0 items-center justify-center relative w-52 h-52 lg:w-64 lg:h-64"
        >
          {/* Pulsing halo rings */}
          {[1, 0.6, 0.3].map((opacity, ri) => (
            <motion.div
              key={ri}
              animate={{ scale: [1, 1.2 + ri * 0.15, 1], opacity: [opacity, opacity * 0.4, opacity] }}
              transition={{ duration: 2.5 + ri, repeat: Infinity, ease: 'easeInOut', delay: ri * 0.6 }}
              className="absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle, rgba(201,162,39,${opacity * 0.5}) 0%, transparent 65%)` }}
            />
          ))}

          {/* Floating image */}
          <motion.img
            src="/kente-artifact.png"
            alt="Ashanti Royal Regalia"
            animate={{ y: [0, -14, 0], rotate: [-1, 1, -1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 0 28px rgba(201,162,39,0.65)) drop-shadow(0 24px 48px rgba(0,0,0,0.85))',
            }}
          />
        </motion.div>
      </div>

      {/* ── Bottom shimmer line ─────────────────────────── */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #C9A227 25%, #FFD700 50%, #C9A227 75%, transparent 100%)' }}
      />
    </header>
  );
}
