type SiteBrandProps = {
  variant?: 'navbar' | 'hero' | 'footer'
  showPackageId?: boolean
}

export function SiteBrand({ variant = 'navbar', showPackageId = false }: SiteBrandProps) {
  const isHero = variant === 'hero'
  const isFooter = variant === 'footer'

  return (
    <div className={`flex items-center gap-3 ${isHero ? 'mb-2' : ''}`}>
      <div
        className={`brand-mark shrink-0 ${isHero ? 'w-11 h-11' : 'w-8 h-8'}`}
        aria-hidden
      />
      <div className="min-w-0">
        <div
          className={
            isHero
              ? 'text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight'
              : isFooter
                ? 'text-sm font-semibold text-slate-200'
                : 'text-base font-semibold tracking-tight text-white leading-tight'
          }
        >
          <span className="brand-gradient-text">AI Engineering</span>
          <span className="text-slate-100"> Harness</span>
        </div>
        {showPackageId && (
          <p
            className={
              isHero
                ? 'mt-1 font-mono text-xs text-slate-500'
                : 'font-mono text-[10px] sm:text-[11px] text-slate-500 truncate'
            }
            title="npm package name"
          >
            {isHero ? 'Package: ai-engineering-harness' : 'ai-engineering-harness'}
          </p>
        )}
      </div>
    </div>
  )
}
