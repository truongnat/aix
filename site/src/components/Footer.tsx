import { SiteBrand } from './SiteBrand'

const GITHUB = 'https://github.com/truongnat/ai-engineering-harness'
const README = `${GITHUB}#readme`

const LINKS = [
  { href: '#agent-system', label: 'Agent prompt' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#session-start', label: 'Session Start' },
  { href: '#install', label: 'Install' },
] as const

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[rgba(6,10,18,0.85)] backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col sm:flex-row gap-10 sm:items-start sm:justify-between">
        <div>
          <SiteBrand variant="footer" />
          <p className="mt-3 text-sm text-slate-500 max-w-xs leading-relaxed">
            Markdown-first workflow guardrails for AI coding agents — plan, verify, ship, remember.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm" aria-label="Footer">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-slate-400 hover:text-sky-300 transition-colors">
              {link.label}
            </a>
          ))}
          <a href={README} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-300 transition-colors">
            README
          </a>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-300 transition-colors">
            GitHub
          </a>
        </nav>
      </div>
      <div className="max-w-5xl mx-auto px-6 pb-8 text-xs text-slate-600">
        MIT · v1.0.0 · Install with{' '}
        <code className="text-slate-500 font-mono">npx ai-engineering-harness</code>
      </div>
    </footer>
  )
}
