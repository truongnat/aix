import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

export function InstallSection() {
  const reduced = useReducedMotion()
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="install" className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <p className="text-xs uppercase tracking-widest text-sky-400 mb-3">Install</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Start fast, keep the workflow serious</h2>
          <p className="text-slate-500 mb-8 max-w-2xl">
            Install the harness into an existing repo, restore session state, and run the engineering loop without adopting a heavyweight platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2">Step 1</p>
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Install into a repo</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Add provider adapters, docs, commands, and the project operating contract.</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2">Step 2</p>
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Restore session context</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Use `harness-start` so the agent knows the active goal, phase, blockers, and memory.</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2">Step 3</p>
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Work with evidence</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Plan, verify, ship, and remember through markdown artifacts that stay in the repo.</p>
            </div>
          </div>

          <div className="terminal max-w-xl mb-5">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: '#ef4444' }} />
              <span className="terminal-dot" style={{ background: '#f59e0b' }} />
              <span className="terminal-dot" style={{ background: '#22c55e' }} />
            </div>
            <div className="p-5 space-y-1 font-mono text-sm text-slate-400">
              <div>npx ai-engineering-harness install</div>
              <div>npx ai-engineering-harness status</div>
              <div>npx ai-engineering-harness doctor</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-2">Non-interactive:</p>
          <div className="terminal max-w-xl">
            <div className="p-5 font-mono text-sm text-slate-400">
              npx ai-engineering-harness install --provider claude --yes
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-5">
            Claude is the strongest path. Cursor, Codex, and Gemini work through provider adapters and fallbacks.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
