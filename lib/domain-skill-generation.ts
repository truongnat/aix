// Purpose: Backward-compat shim — implementation in src/.
// Layer: presentation (shim)
// Depends on: dist (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../features/domains/index.js") as any;

export const DOMAIN_DEFINITIONS = api.DOMAIN_DEFINITIONS;
export const getDomainDefinition = api.getDomainDefinition;
export const listDomainDefinitions = api.listDomainDefinitions;
export const renderDomainPromptMarkdown = api.renderDomainPromptMarkdown;
export const renderDomainSkillMarkdown = api.renderDomainSkillMarkdown;
export const renderSkillsProfileMarkdown = api.renderSkillsProfileMarkdown;
export const renderWorkflowProfileMarkdown = api.renderWorkflowProfileMarkdown;
export const validateDomainIds = api.validateDomainIds;
export const writeDomainSkillSurface = api.writeDomainSkillSurface;

export type DomainDefinition = any;
export type WriteOptions = any;
export type WriteResult = any;
