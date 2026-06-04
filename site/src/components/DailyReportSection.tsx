import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const ARTIFACTS = ['REPORT.md', 'PR_MESSAGE.md', 'CHANGE_SUMMARY.md']

const MOCK_PR = `## Summary
- Added Session Start protocol
- Added report artifacts for ship handoff

## Verification
- [x] node validate.js
- [x] npm test

## Risks / Rollback
- Provider adapters remain documented fallback where native support is not verified.`

export function DailyReportSection() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Daily dev report</motion.p>
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-white mb-4">
            From code changes to PR-ready notes
          </motion.h2>
          <motion.p variants={item} className="text-slate-500 mb-8 max-w-2xl">
            harness-ship does not just say done. It produces a report that explains what changed, why it changed,
            how it was verified, and what reviewers should know.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-2 mb-6">
            {ARTIFACTS.map((file) => (
              <span
                key={file}
                className="font-mono text-xs px-3 py-1.5 rounded-lg text-violet-300"
                style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)' }}
              >
                {file}
              </span>
            ))}
          </motion.div>

          <motion.div variants={item} className="terminal max-w-2xl">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: '#ef4444' }} />
              <span className="terminal-dot" style={{ background: '#f59e0b' }} />
              <span className="terminal-dot" style={{ background: '#22c55e' }} />
              <span className="text-xs text-slate-600 ml-2 font-mono">PR_MESSAGE.md</span>
            </div>
            <pre className="p-4 text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{MOCK_PR}</pre>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
