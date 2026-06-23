import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const CAPABILITIES = [
  {
    title: 'Agent-driven domain skill generation',
    body: 'At init, an agent analyzes the project and the harness generates domain skills, path-scoped rules, and a domain workflow into .harness/. Detection is agent-driven, generation is deterministic, and all four provider surfaces are covered.',
  },
  {
    title: 'Spec-driven layer',
    body: 'Delta specs use ADDED / MODIFIED / REMOVED requirements, with an optional durable .harness/specs/ behavior spec. Off by default.',
    optIn: true,
  },
  {
    title: 'Delegated-worker memory',
    body: 'Workers can accumulate bounded notes across runs in .harness/memory/workers/<agent>.md. Off by default.',
    optIn: true,
  },
  {
    title: 'Prompt-quality standard',
    body: 'Every skill and dispatch prompt follows a modular format with reasoning, action loops, examples, and output contracts. The validator and conformance eval enforce it.',
  },
  {
    title: 'Explorer worker + context engineering',
    body: 'A dedicated Explore-phase worker returns a condensed map instead of raw dumps, backed by the documented five-practice context-engineering doctrine.',
  },
] as const

export function CapabilitiesSection() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="capabilities" className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-sky-400 mb-3">
            Capabilities
          </motion.p>
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-white mb-10">
            From guardrails to generated domain expertise
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPABILITIES.map((capability) => (
              <motion.div key={capability.title} variants={item} className="glass-card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-slate-200 text-sm leading-snug">{capability.title}</h3>
                  {'optIn' in capability && capability.optIn ? (
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                      Opt-in
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{capability.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
