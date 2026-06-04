export function AnimatedGrid() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="grid-perspective" />
      {/* Fade edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_40%,#070b12_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_100%,#070b12_0%,transparent_60%)]" />
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  )
}
