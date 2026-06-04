import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

const CARDS = [
  {
    title: 'Command docs',
    body: 'Reference contracts for purpose, read sets, preconditions, redirects, and completion gates.',
    tone: 'from-slate-500/20 to-slate-900/0',
  },
  {
    title: 'Prompt templates',
    body: 'Execution contracts with role, inputs, gate checks, blocked branch, success branch, and critical rules.',
    tone: 'from-indigo-500/20 to-slate-900/0',
  },
  {
    title: 'Blocked output',
    body: 'A first-class branch. If approval, evidence, or required input is missing, the agent stops instead of guessing.',
    tone: 'from-rose-500/20 to-slate-900/0',
  },
]

export function DispatchTemplatesSection() {
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
        >
          <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Dispatch templates</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Reference docs tell the agent what the workflow means. Dispatch templates tell it how to execute safely.
          </h2>
          <p className="text-slate-500 mb-10 max-w-3xl">
            The harness keeps command docs as policy, then adds execution-facing prompt templates for guarded commands so blocked output becomes a valid result instead of a soft suggestion.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {CARDS.map((card) => (
              <div
                key={card.title}
                className="glass-card p-5 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.tone}`} />
                <div className="relative">
                  <div className="font-semibold text-white mb-2">{card.title}</div>
                  <p className="text-sm text-slate-500">{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
