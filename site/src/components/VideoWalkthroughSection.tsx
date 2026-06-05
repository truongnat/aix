import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants, stagger } from '../lib/animations'

const GITHUB = 'https://github.com/truongnat/ai-engineering-harness'
const README = 'https://github.com/truongnat/ai-engineering-harness#readme'

const HIGHLIGHTS = [
  'What the command loop looks like in practice',
  'How artifacts guide planning, verification, and shipping',
  'Why the harness stays lightweight and repo-native',
]

export function VideoWalkthroughSection() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="walkthrough" className="relative z-10 section-gap px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-sky-400 mb-3">
            Walkthrough
          </motion.p>
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Product walkthrough
          </motion.h2>
          <motion.p variants={item} className="text-slate-400 mb-10 max-w-2xl leading-relaxed">
            A quick mid-page demo for open-source visitors who want to see the workflow before reading every document.
            The same video is linked from the README and embedded here where playback is reliable.
          </motion.p>

          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.85fr] gap-6 items-start">
            <motion.div variants={item} className="walkthrough-panel p-4 sm:p-5">
              <video
                className="walkthrough-video"
                controls
                preload="metadata"
                playsInline
                aria-label="AI Engineering Harness product walkthrough video"
              >
                <source src="/AI_Engineering_Harness.mp4" type="video/mp4" />
              </video>
            </motion.div>

            <motion.div variants={item} className="glass-card p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-4">In this video</p>
              <div className="space-y-3 mb-8">
                {HIGHLIGHTS.map((highlight) => (
                  <div key={highlight} className="flex gap-3 items-start">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                    <p className="text-sm text-slate-300 leading-relaxed">{highlight}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="#install" className="btn-primary justify-center">Install it</a>
                <a href={README} target="_blank" rel="noopener noreferrer" className="btn-secondary justify-center">
                  Read the README
                </a>
                <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn-secondary justify-center sm:col-span-2">
                  View source on GitHub
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
