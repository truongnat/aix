import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const PAINS = [
  {
    title: 'Stale context',
    body: 'Agents start without restoring session, memory, or blocked state from prior work.',
  },
  {
    title: 'Plans drift into code',
    body: 'Implementation begins before approval, scope, or verification strategy is explicit.',
  },
  {
    title: 'Optimistic verification',
    body: '"Looks good" replaces command output, exit codes, and evidence in VERIFY.md.',
  },
  {
    title: 'Incomplete PR handoff',
    body: 'Ship means "done" — not what changed, why, how it was verified, or reviewer notes.',
  },
]

export function ProblemSection() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-indigo-400 mb-3">The problem</motion.p>
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-white mb-10">
            AI agents edit code well — but often skip engineering discipline
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {PAINS.map((pain) => (
              <motion.div key={pain.title} variants={item} className="glass-card p-5">
                <h3 className="font-semibold text-slate-200 mb-2 text-sm">{pain.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{pain.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.p variants={item} className="text-lg text-slate-400 leading-relaxed max-w-3xl">
            <span className="text-indigo-300 font-medium">ai-engineering-harness</span> turns agent work into a
            session-based engineering loop with artifacts, gates, and evidence.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
