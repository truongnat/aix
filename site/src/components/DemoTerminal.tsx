import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

const LINES = [
  { text: '$ cd examples/dogfood-tiny-node-api', color: '#94a3b8' },
  { text: '$ npm test', color: '#94a3b8' },
  { text: '', color: '' },
  { text: '▶ test/health.test.js', color: '#6366f1' },
  { text: '', color: '' },
  { text: '  ✔ GET /health returns 200', color: '#4ade80' },
  { text: '  ✔ GET /health returns json body', color: '#4ade80' },
  { text: '', color: '' },
  { text: '  tests 2', color: '#94a3b8' },
  { text: '  pass  2', color: '#4ade80' },
  { text: '  fail  0', color: '#94a3b8' },
]

export function DemoTerminal() {
  const reduced = useReducedMotion()
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="demo" className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Dogfood demo</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Real tests, real evidence
          </h2>
          <p className="text-slate-500 mb-10 max-w-xl">
            The dogfood example ships a real <code className="font-mono text-indigo-400">GET /health</code> endpoint with harness artifacts and a passing CI run.
          </p>

          <div className="terminal max-w-2xl">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: '#ef4444' }} />
              <span className="terminal-dot" style={{ background: '#f59e0b' }} />
              <span className="terminal-dot" style={{ background: '#22c55e' }} />
              <span className="ml-3 text-xs text-slate-600 font-mono">dogfood-tiny-node-api</span>
            </div>
            <div className="p-5 space-y-0.5">
              {LINES.map((line, i) => (
                <div key={i} className="font-mono text-sm" style={{ color: line.color || 'transparent', minHeight: '1.5em' }}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-xs text-slate-600 max-w-xl">
            This is workflow-artifact dogfood, not a full provider install demo. The harness artifacts (<code className="font-mono">GOAL.md</code>, <code className="font-mono">PLAN.md</code>, <code className="font-mono">VERIFY.md</code>) live in <code className="font-mono">examples/dogfood-tiny-node-api/.harness/</code>.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
