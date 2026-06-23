import { IHarnessProvider } from "../types";

export const GITHUB_REPO_URL = 'https://github.com/truongnat/ai-engineering-harness';

/**
 * This file manages the harness configuration
 * structure of the config file is as follows:
 * @version string
 * @buildDirs string[]
 * 
 * @link IHarnessConfig
 * 
*/
export const HARNESS_CONFIG_FILE = '.harness.json';

export const HARNESS_PROVIDERS: Record<string, IHarnessProvider> = {
    CLAUDE: {
        value: 'claude',
        label: "Claude AI",
        hint: 'Anthropic AI'
    },
    CODEX: {
        value: 'codex',
        label: 'Codex',
        hint: 'OpenAI AI'
    }
} as const


export const HARNESS_CONTRACT_STRUCTURE = [
    'SKILL.md',         // (main instructions)
    "FORMS.md",         // (form-filling guide)
    "references/",      // (detailed API reference)
    "scripts/",         // (utility script)
    "assets/",          // (templates, resources)
]

export const HARNESS_CONTRACT = {
    LEVEL_1: 'Metadata',
    LEVEL_2: 'Instructions',
    LEVEL_3: 'Resources'
}
export const HARNESS_CONTRACT_LEVEL = {
    [HARNESS_CONTRACT.LEVEL_1]: ['name', 'description', 'metadata'],
    [HARNESS_CONTRACT.LEVEL_2]: [
        "Skill name",
        "Instruction",
        "When to use",
        "When not to use",
        "Inputs",
        "Workflow",
        "Operating Principles",
        "Output Contract",
        "Common Failure Modes",
        "Checklist Before Done",
    ],
    [HARNESS_CONTRACT.LEVEL_3]: ["Example", "Output", "References"],
}