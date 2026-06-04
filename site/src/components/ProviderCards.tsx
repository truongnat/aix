import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const PROVIDERS = [
  { name: 'Claude Code', support: 'Native project commands, agents, hook examples', tag: 'Recommended', primary: true },
  { name: 'Cursor', support: 'Rules-based fallback via .cursor/rules/', tag: 'Adapter', primary: false },
  { name: 'Codex', support: 'AGENTS.md fallback', tag: 'Adapter', primary: false },
  { name: 'Gemini', support: 'Extension / context fallback', tag: 'Adapter', primary: false },
]

export function ProviderCards() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="providers" className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Providers</motion.p>
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-white mb-4">Honest provider adapters</motion.h2>
          <motion.p variants={item} className="text-slate-500 mb-8 max-w-2xl">
            Only Claude gets project-native <span className="font-mono text-indigo-300/80">/harness-*</span> command files.
            Other providers use rule and context fallback — we do not pretend universal slash support.
          </motion.p>

          <motion.div variants={item} className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm text-left min-w-[480px]">
              <thead>
                <tr className="text-slate-500 border-b border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th className="px-5 py-3 font-medium">Provider</th>
                  <th className="px-5 py-3 font-medium">1.0.0 support</th>
                </tr>
              </thead>
              <tbody>
                {PROVIDERS.map((p) => (
                  <tr key={p.name} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-4 font-medium text-slate-200 whitespace-nowrap">
                      {p.name}
                      {p.primary && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-indigo-300" style={{ background: 'rgba(99,102,241,0.15)' }}>
                          {p.tag}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{p.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
