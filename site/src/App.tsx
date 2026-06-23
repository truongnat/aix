import { AnimatedGrid } from './components/AnimatedGrid'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { ProblemSection } from './components/ProblemSection'
import { CommandFlow } from './components/CommandFlow'
import { AgentSystemSection } from './components/AgentSystemSection'
import { SessionStartSection } from './components/SessionStartSection'
import { EvidenceBlockedSection } from './components/EvidenceBlockedSection'
import { DailyReportSection } from './components/DailyReportSection'
import { ProviderCards } from './components/ProviderCards'
import { CapabilitiesSection } from './components/CapabilitiesSection'
import { PowerLayersSection } from './components/PowerLayersSection'
import { InstallSection } from './components/InstallSection'
import { CTA } from './components/CTA'
import { Footer } from './components/Footer'
import { ScrollToTop } from './components/ScrollToTop'
import { DemoTerminal } from './components/DemoTerminal'

export default function App() {
  return (
    <>
      <AnimatedGrid />
      <Navbar />
      <ScrollToTop />
      <main>
        <Hero />
        <ProblemSection />
        <InstallSection />
        <CommandFlow />
        <SessionStartSection />
        <EvidenceBlockedSection />
        <DemoTerminal />
        <ProviderCards />
        <CapabilitiesSection />
        <PowerLayersSection />
        <AgentSystemSection />
        <DailyReportSection />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
