import { AnimatedGrid } from './components/AnimatedGrid'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { ProblemSection } from './components/ProblemSection'
import { CommandFlow } from './components/CommandFlow'
import { ArtifactShowcase } from './components/ArtifactShowcase'
import { DemoTerminal } from './components/DemoTerminal'
import { ProviderCards } from './components/ProviderCards'
import { FeatureGrid } from './components/FeatureGrid'
import { InstallSection } from './components/InstallSection'
import { CTA } from './components/CTA'
import { WorkflowGuardrails } from './components/WorkflowGuardrails'
import { DispatchTemplatesSection } from './components/DispatchTemplatesSection'

export default function App() {
  return (
    <>
      <AnimatedGrid />
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <CommandFlow />
        <ArtifactShowcase />
        <DemoTerminal />
        <WorkflowGuardrails />
        <DispatchTemplatesSection />
        <ProviderCards />
        <FeatureGrid />
        <InstallSection />
        <CTA />
      </main>
    </>
  )
}
