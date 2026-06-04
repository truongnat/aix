import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

const BLOCKED = `### Blocked

Command: harness-verify
Reason: Required verification command is unknown.
Question: Which command should be required: npm test, npm run build, or another?
Stopped: No verification status was marked as passed.`

export function EvidenceBlockedSection() {
  const reduced = useReducedMotion()
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <p className="text-xs uppercase tracking-widest text-sky-400 mb-3">Evidence gates</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">Stop guessing. Show evidence.</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <p className="text-xs uppercase tracking-widest text-rose-400/80 mb-4">Without harness</p>
              <p className="text-xl text-slate-400 italic">&ldquo;Looks good. Should work.&rdquo;</p>
            </div>
            <div className="terminal">
              <div className="terminal-header">
                <span className="terminal-dot" style={{ background: '#ef4444' }} />
                <span className="terminal-dot" style={{ background: '#f59e0b' }} />
                <span className="terminal-dot" style={{ background: '#22c55e' }} />
                <span className="text-xs text-slate-600 ml-2">Harness behavior</span>
              </div>
              <pre className="p-4 text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{BLOCKED}</pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
