import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const PIPELINE = [
  { id: 'harness-plan',     artifact: '→ PLAN.md',     active: true },
  { id: 'harness-run',      artifact: '→ impl',         active: false },
  { id: 'harness-verify',   artifact: '→ VERIFY.md',   active: false },
  { id: 'harness-ship',     artifact: '→ SHIP.md',     active: false },
  { id: 'harness-remember', artifact: '→ REMEMBER.md', active: false },
]

export function Hero() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 min-h-screen flex flex-col justify-center pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-0"
        >
          {/* Badge */}
          <motion.div variants={item} className="mb-7">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-indigo-300"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot"
                style={{ boxShadow: '0 0 6px #818cf8' }}
              />
              v0.11.0 experimental
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Engineering discipline<br />
            for AI coding agents
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={item} className="text-lg text-slate-400 max-w-xl leading-relaxed mb-10">
            A lightweight, markdown-first workflow kit. Agents plan, build,
            verify, ship, and remember — without a heavy runtime.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex gap-4 flex-wrap mb-16">
            <a
              href="#install"
              className="px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 0 24px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.boxShadow = '0 0 40px rgba(99,102,241,0.55), 0 8px 24px rgba(0,0,0,0.3)'
                el.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.boxShadow = '0 0 24px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.3)'
                el.style.transform = ''
              }}
            >
              Get started
            </a>
            <a
              href="#demo"
              className="px-7 py-3.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
              }}
            >
              View dogfood demo →
            </a>
          </motion.div>

          {/* Command pipeline */}
          <motion.div variants={item}>
            <p className="text-xs uppercase tracking-widest text-slate-600 mb-4">Workflow commands</p>
            <div className="flex flex-wrap items-center gap-2">
              {PIPELINE.map((cmd, i) => (
                <div key={cmd.id} className="flex items-center gap-2">
                  <div
                    className={`cmd-card px-4 py-3 relative cursor-default ${cmd.active ? 'active' : ''}`}
                    style={{ minWidth: '128px', textAlign: 'center' }}
                  >
                    {cmd.active && (
                      <span
                        className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot"
                        style={{ boxShadow: '0 0 6px #4ade80' }}
                      />
                    )}
                    <div className="font-mono text-xs text-indigo-300 mb-1">{cmd.id}</div>
                    <div className="text-xs text-slate-600">{cmd.artifact}</div>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <span className="text-lg arrow-pulse select-none">›</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
