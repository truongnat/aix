import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'
import { SiteBrand } from './SiteBrand'

const GITHUB = 'https://github.com/truongnat/ai-engineering-harness'

const PIPELINE = [
  { id: 'Session Start', cmd: 'harness-start', status: 'ready', artifact: 'SESSION_START.md' },
  { id: 'Plan', cmd: 'harness-plan', status: 'ready', artifact: 'PLAN.md' },
  { id: 'Run', cmd: 'harness-run', status: 'blocked', artifact: 'impl' },
  { id: 'Verify', cmd: 'harness-verify', status: 'verified', artifact: 'VERIFY.md' },
  { id: 'Ship', cmd: 'harness-ship', status: 'report', artifact: 'PR_MESSAGE.md' },
  { id: 'Remember', cmd: 'harness-remember', status: 'ready', artifact: 'MEMORY' },
] as const

const STATUS_STYLES: Record<string, { dot: string; label: string }> = {
  ready: { dot: '#4ade80', label: 'ready' },
  blocked: { dot: '#f87171', label: 'blocked' },
  verified: { dot: '#38bdf8', label: 'verified' },
  report: { dot: '#a78bfa', label: 'report ready' },
}

export function Hero() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 min-h-screen flex flex-col justify-center pt-24 pb-16 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col lg:flex-row gap-12 lg:items-center">
          <div className="flex-1 min-w-0">
            <motion.div variants={item}>
              <SiteBrand variant="hero" showPackageId />
            </motion.div>

            <motion.div variants={item} className="mb-6 mt-5 flex flex-wrap gap-2">
              <span className="badge-release">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 pulse-dot" />
                v1.0.0
              </span>
              <span className="badge-muted">
                Markdown-first · Provider adapters · Evidence-based shipping
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="hero-headline text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.1] mb-5"
            >
              Engineering discipline for AI coding agents
            </motion.h1>

            <motion.p variants={item} className="text-lg text-slate-400 max-w-xl leading-relaxed mb-8">
              A markdown-first workflow guardrail kit that helps AI agents restore context, plan changes,
              verify with evidence, ship honest reports, and remember what matters.
            </motion.p>

            <motion.div variants={item} className="flex gap-3 flex-wrap">
              <a href="#install" className="btn-primary">Get started</a>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn-secondary">View on GitHub</a>
              <a href="#workflow" className="btn-secondary">See workflow</a>
            </motion.div>
          </div>

          <motion.div variants={item} className="flex-1 min-w-0 w-full max-w-lg lg:max-w-none">
            <p className="text-xs uppercase tracking-widest text-slate-600 mb-3">Operating loop</p>
            <div className="rounded-2xl p-5 sm:p-6 hero-panel">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-5">
                {PIPELINE.map((step, i) => (
                  <div key={step.cmd} className="flex items-center gap-1.5">
                    <div className="cmd-card px-3 py-2.5 sm:px-4 sm:py-3 text-center min-w-[88px] sm:min-w-[100px]">
                      <div className="text-[10px] sm:text-xs font-semibold text-slate-300 mb-0.5">{step.id}</div>
                      <div className="font-mono text-[10px] sm:text-xs text-sky-300/90">{step.cmd}</div>
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ background: STATUS_STYLES[step.status].dot, boxShadow: `0 0 6px ${STATUS_STYLES[step.status].dot}` }}
                        />
                        <span className="text-[9px] uppercase tracking-wide text-slate-600">{STATUS_STYLES[step.status].label}</span>
                      </div>
                    </div>
                    {i < PIPELINE.length - 1 && <span className="text-slate-600 text-sm arrow-pulse hidden sm:inline">›</span>}
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl p-4 font-mono text-xs"
                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}
              >
                <div className="text-rose-300/90 mb-2 font-semibold">Blocked example</div>
                <div className="text-slate-500 space-y-1">
                  <div><span className="text-slate-600">Request:</span> harness-run</div>
                  <div><span className="text-slate-600">Plan approved?</span> <span className="text-rose-400">No</span></div>
                  <div><span className="text-slate-600">Action:</span> <span className="text-amber-300">Stop and ask</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
