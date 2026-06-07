import { useState, useRef, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

type Tab = 'verify' | 'plan' | 'ship' | 'remember'

const TABS: { id: Tab; label: string }[] = [
  { id: 'verify',   label: 'VERIFY.md' },
  { id: 'plan',     label: 'PLAN.md' },
  { id: 'ship',     label: 'SHIP.md' },
  { id: 'remember', label: 'REMEMBER.md' },
]

const CONTENT: Record<Tab, React.ReactNode> = {
  verify: (
    <div className="font-mono text-xs leading-relaxed space-y-1">
      <div><span className="text-slate-500">status:</span> <span className="text-emerald-400 font-semibold">passed</span></div>
      <div className="text-slate-700">---</div>
      <div className="text-indigo-400 font-semibold mt-2">| Command          | Exit | Result  |</div>
      <div className="text-slate-700">|------------------|-----:|---------|</div>
      <div><span className="text-slate-400">| npm test         |</span> <span className="text-emerald-400">0    | passed  |</span></div>
      <div><span className="text-slate-400">| node bin/validate.js |</span> <span className="text-emerald-400">0    | passed  |</span></div>
      <div className="text-slate-400">| cd dogfood &amp;&amp; npm test |</div>
      <div className="text-emerald-400">  0    | passed  |</div>
      <div className="text-slate-600 mt-3 pt-3 border-t border-white/5">tests: 2 · pass: 2 · fail: 0</div>
    </div>
  ),
  plan: (
    <div className="font-mono text-xs leading-relaxed space-y-1">
      <div><span className="text-slate-500">goal:</span> <span className="text-blue-300">Add GET /health endpoint</span></div>
      <div><span className="text-slate-500">phase:</span> <span className="text-slate-400">build</span></div>
      <div className="text-slate-700">---</div>
      <div className="text-indigo-400 font-semibold mt-2">## Tasks</div>
      <div className="text-slate-400">- [x] Create src/server.js</div>
      <div className="text-slate-400">- [x] Add GET /health route</div>
      <div className="text-slate-400">- [x] Write test/health.test.js</div>
      <div className="text-slate-400">- [x] npm test passes</div>
      <div className="text-slate-700">---</div>
      <div><span className="text-slate-500">gate:</span> <span className="text-yellow-400">approval required</span></div>
    </div>
  ),
  ship: (
    <div className="font-mono text-xs leading-relaxed space-y-1">
      <div><span className="text-slate-500">status:</span> <span className="text-emerald-400">shipped</span></div>
      <div><span className="text-slate-500">commit:</span> <span className="text-blue-300">feat: add /health endpoint</span></div>
      <div className="text-slate-700">---</div>
      <div className="text-indigo-400 font-semibold mt-2">## Checklist</div>
      <div className="text-slate-400">- [x] VERIFY.md status: passed</div>
      <div className="text-slate-400">- [x] All tests green</div>
      <div className="text-slate-400">- [x] No regressions</div>
      <div className="text-slate-400">- [x] Committed and pushed</div>
    </div>
  ),
  remember: (
    <div className="font-mono text-xs leading-relaxed space-y-1">
      <div className="text-indigo-400 font-semibold">## Key decisions</div>
      <div className="text-slate-400 mt-1">- Used Node built-in test runner (no Jest dep)</div>
      <div className="text-slate-400">- /health returns 200 + JSON, not plain text</div>
      <div className="text-slate-400">- Port from env var, defaults 3000</div>
      <div className="text-slate-700">---</div>
      <div className="text-indigo-400 font-semibold mt-2">## Next</div>
      <div className="text-slate-400">- Add /ready endpoint</div>
      <div className="text-slate-400">- Add request logging</div>
    </div>
  ),
}

export function ArtifactShowcase() {
  const [active, setActive] = useState<Tab>('verify')
  const cardRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const item = motionVariants(reduced, fadeUp)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (reduced || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.transform =
      `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`
    cardRef.current.style.animation = 'none'
  }, [reduced])

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(800px) rotateX(6deg) rotateY(-4deg)'
    cardRef.current.style.animation = ''
  }, [])

  return (
    <section className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Artifacts</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Agents show their work
          </h2>
          <p className="text-slate-500 mb-12 max-w-xl">
            Every phase produces a markdown artifact. <code className="font-mono text-indigo-400">VERIFY.md</code> requires exit codes and test counts — not prose.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className="px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all"
                style={
                  active === tab.id
                    ? {
                        background: 'rgba(99,102,241,0.15)',
                        border: '1px solid rgba(99,102,241,0.4)',
                        color: '#a5b4fc',
                      }
                    : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#475569',
                      }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 3D card */}
          <div
            ref={cardRef}
            className="artifact-3d glass-card p-8 max-w-xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-2 mb-5">
              <span
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ boxShadow: '0 0 8px #4ade80' }}
              />
              <span className="font-mono text-xs text-emerald-400">
                .harness/{TABS.find(t => t.id === active)?.label}
              </span>
            </div>
            <motion.div
              key={active}
              initial={reduced ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {CONTENT[active]}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
