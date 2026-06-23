// Purpose: Public exports for domains feature.
// Layer: presentation
// Depends on: application, presentation

export {
  DOMAIN_DEFINITIONS,
  getDomainDefinition,
  listDomainDefinitions,
  renderDomainPromptMarkdown,
  renderDomainSkillMarkdown,
  renderSkillsProfileMarkdown,
  renderWorkflowProfileMarkdown,
  validateDomainIds,
  writeDomainSkillSurface,
} from "./application/domain-skill-generation";
export type { DomainDefinition, WriteOptions, WriteResult } from "./application/domain-skill-generation";

export { runDomainsCommand } from "./presentation/domains-command";
