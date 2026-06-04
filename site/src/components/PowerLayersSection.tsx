import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const LAYERS = [
  { title: 'Session Memory', body: 'Working artifacts per session; durable memory at the project root.' },
  { title: 'Tool Discovery', body: 'Route to git, rg, worktree, markitdown, and code-graph fallbacks.' },
  { title: 'Hooks', body: 'Guard phase transitions and record tool or subagent evidence.' },
  { title: 'Dynamic Skills', body: 'Package reusable capability; archive session skills when done.' },
  { title: 'Delegated Workers', body: 'Read-only reviewer, verifier, gatekeeper; bounded fixer on Claude.' },
  { title: 'Daily Reports', body: 'REPORT.md and PR_MESSAGE.md from real git diff and VERIFY evidence.' },
]

export function PowerLayersSection() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-sky-400 mb-3">Power layers</motion.p>
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-white mb-10">
            Guardrails, not a heavy runtime
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LAYERS.map((layer) => (
              <motion.div key={layer.title} variants={item} className="glass-card p-5">
                <h3 className="font-semibold text-slate-200 mb-2 text-sm">{layer.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{layer.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
