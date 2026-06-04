import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

export function InstallSection() {
  const reduced = useReducedMotion()
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="install" className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Install</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Get started in seconds</h2>
          <p className="text-slate-500 mb-8 max-w-xl">
            Claude Code is the recommended 1.0.0 path. Cursor, Codex, and Gemini install through provider adapters and fallbacks.
          </p>

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
        </motion.div>
      </div>
    </section>
  )
}
