import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const README = 'https://github.com/truongnat/ai-engineering-harness#readme'
const DEMO = 'https://github.com/truongnat/ai-engineering-harness/tree/main/examples/dogfood-tiny-node-api'

export function CTA() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 section-gap px-6 pb-32">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="flex flex-col items-center">
          <motion.h2
            variants={item}
            className="text-4xl sm:text-5xl font-extrabold mb-10 max-w-2xl"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 60%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Give your AI coding agent an engineering loop
          </motion.h2>

          <motion.div variants={item} className="flex flex-wrap gap-4 justify-center">
            <a href={README} target="_blank" rel="noopener noreferrer" className="btn-primary">Read the README</a>
            <a href="#install" className="btn-secondary">Install with npx</a>
            <a href={DEMO} target="_blank" rel="noopener noreferrer" className="btn-secondary">View dogfood demo</a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
