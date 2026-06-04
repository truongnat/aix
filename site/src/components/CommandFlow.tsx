import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const COMMANDS = [
  { id: 'harness-start', label: 'Session Start', desc: 'Restore session, memory, blockers, next command', highlight: true },
  { id: 'harness-map', label: null, desc: 'Map repo scope and routing context', highlight: false },
  { id: 'harness-discuss', label: null, desc: 'Clarify goal, scope, and tradeoffs', highlight: false },
  { id: 'harness-plan', label: null, desc: 'Create an approval-ready plan', highlight: false },
  { id: 'harness-run', label: null, desc: 'Implement only after plan approval', highlight: false },
  { id: 'harness-verify', label: null, desc: 'Collect real command evidence', highlight: false },
  { id: 'harness-ship', label: null, desc: 'Produce PR-ready REPORT.md and PR_MESSAGE.md', highlight: true },
  { id: 'harness-remember', label: null, desc: 'Save durable lessons safely', highlight: false },
]

export function CommandFlow() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="workflow" className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-sky-400 mb-3">Core workflow</motion.p>
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Canonical command loop
          </motion.h2>
          <motion.p variants={item} className="text-slate-500 mb-10 max-w-2xl">
            Eight hyphen-form commands. Claude may expose <span className="font-mono text-sky-300/80">/harness-plan</span> as project commands — not every provider does.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMMANDS.map((cmd) => (
              <motion.div
                key={cmd.id}
                variants={item}
                className={`glass-card p-4 ${cmd.highlight ? 'ring-1 ring-sky-500/30' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="font-mono text-sm text-sky-300 shrink-0">{cmd.id}</div>
                  <div>
                    {cmd.label && (
                      <span className="text-xs font-semibold text-emerald-400/90 uppercase tracking-wide">{cmd.label}</span>
                    )}
                    <p className="text-sm text-slate-500 mt-0.5">{cmd.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
