import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

const STATES = [
  { label: 'Request', value: 'harness-run', tone: 'text-indigo-300' },
  { label: 'PLAN.md exists?', value: 'yes', tone: 'text-emerald-400' },
  { label: 'Approval status?', value: 'draft', tone: 'text-amber-300' },
  { label: 'Action', value: 'stop and ask', tone: 'text-rose-300' },
  { label: 'Next command', value: 'harness-plan', tone: 'text-cyan-300' },
]

export function WorkflowGuardrails() {
  const reduced = useReducedMotion()
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="glass-card p-6 sm:p-8"
        >
          <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Workflow guardrails</p>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Agents stop when the phase is wrong
              </h2>
              <p className="text-slate-500">
                The harness is not just a command list. It makes approval, evidence, and next-step state visible so the agent can redirect instead of guessing.
              </p>
            </div>

            <div className="min-w-[280px] rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.45)]">
              <div className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
                guardrail snapshot
              </div>
              <div className="space-y-3">
                {STATES.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                    <span className="text-sm text-slate-500">{row.label}</span>
                    <span className={`font-mono text-sm ${row.tone}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
