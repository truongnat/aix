import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

const BLOCKED_PREVIEW = `### Blocked

**Reason:** PLAN-001.md is not approved.

**Question:** Do you approve the current plan for implementation?

**Stopped:** No implementation was performed.`

const SENIOR_CARD = `You are a Senior AI Engineering Agent.

You MUST establish Session Start before project work.
You MUST verify with evidence.
You MUST stop when blocked.
You MUST NOT claim success without proof.`

export function AgentSystemSection() {
  const reduced = useReducedMotion()
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="agent-system" className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col lg:flex-row gap-10 items-start"
        >
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-sky-400 mb-3">Agent System Prompt</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              A stronger operating prompt for coding agents
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Commands define the workflow. The system prompt defines the agent behavior: senior, evidence-first,
              phase-aware, and willing to stop when blocked.
            </p>
            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                {SENIOR_CARD}
              </pre>
            </div>
          </div>
          <div className="w-full lg:w-[340px] shrink-0 terminal">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: '#ef4444' }} />
              <span className="terminal-dot" style={{ background: '#f59e0b' }} />
              <span className="terminal-dot" style={{ background: '#22c55e' }} />
              <span className="text-xs text-slate-600 ml-2 font-mono">RESPONSE_CONTRACT.md</span>
            </div>
            <pre className="p-4 text-xs text-slate-400 leading-relaxed overflow-x-auto">{BLOCKED_PREVIEW}</pre>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
