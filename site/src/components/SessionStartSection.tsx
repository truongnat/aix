import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

const MOCK = `# Session Start

status: ready
session: sessions/2026-06-04-command-guardrails
phase: verify
blocked: false
next_command: harness-verify`

export function SessionStartSection() {
  const reduced = useReducedMotion()
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="session-start" className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col lg:flex-row gap-10 items-start"
        >
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Session Start</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Every workflow starts with Session Start
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Session Start is the boot sequence that restores active session, memory, blocked state, hazards,
              tool context, and next allowed command — before any implementation begins.
            </p>
            <p className="text-sm text-slate-600 mt-4 font-mono">harness-start runs the protocol</p>
          </div>
          <div className="w-full lg:w-[340px] shrink-0 terminal">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: '#ef4444' }} />
              <span className="terminal-dot" style={{ background: '#f59e0b' }} />
              <span className="terminal-dot" style={{ background: '#22c55e' }} />
              <span className="text-xs text-slate-600 ml-2 font-mono">SESSION_START.md</span>
            </div>
            <pre className="p-4 text-xs text-slate-400 leading-relaxed overflow-x-auto">{MOCK}</pre>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
