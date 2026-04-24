/**
 * Skill System v1 - CLI Interface
 *
 * Command-line interface for interacting with the skill system
 */
import { skillSystem } from './index.js';
import { getAllSkills } from '../skills/index.js';
import minimist from 'minimist';
export async function runSkillCLI(args) {
    const argv = minimist(args, {
        string: ['query', 'session'],
        boolean: ['list', 'help'],
        alias: { h: 'help', l: 'list', q: 'query', s: 'session' },
    });
    if (argv.help) {
        printHelp();
        return;
    }
    if (argv.list) {
        listSkills();
        return;
    }
    if (argv.query) {
        await executeQuery(argv.query, argv.session);
        return;
    }
    printHelp();
}
function printHelp() {
    console.log(`
Skill System v1 CLI

Usage:
  node dist/core/cli.js [options]

Options:
  -h, --help              Show this help message
  -l, --list              List all available skills
  -q, --query <string>    Execute a query against the skill system
  -s, --session <id>      Session ID for context persistence

Examples:
  node dist/core/cli.js --list
  node dist/core/cli.js --query "How should I implement OAuth for my SPA?"
  node dist/core/cli.js --query "JWT vs session" --session my-session-123
  `);
}
function listSkills() {
    const skills = getAllSkills();
    console.log('\nAvailable Skills:');
    console.log('==================\n');
    for (const skill of skills) {
        const meta = skill.contract.metadata;
        console.log(`Name: ${meta.name}`);
        console.log(`Version: ${meta.version.major}.${meta.version.minor}.${meta.version.patch}`);
        console.log(`Description: ${meta.description}`);
        console.log(`Domain: ${meta.domain || 'N/A'}`);
        console.log(`Level: ${meta.level || 'N/A'}`);
        console.log(`Triggers: ${meta.triggers.slice(0, 5).join(', ')}${meta.triggers.length > 5 ? '...' : ''}`);
        console.log('---\n');
    }
}
async function executeQuery(query, sessionId) {
    console.log(`\nQuery: ${query}\n`);
    console.log('Finding matching skills...\n');
    // Create or get session
    let context;
    if (sessionId) {
        context = skillSystem.context.getSession(sessionId) ||
            skillSystem.context.createSession(sessionId);
    }
    else {
        sessionId = `session-${Date.now()}`;
        context = skillSystem.context.createSession(sessionId);
    }
    // Register skills
    const skills = getAllSkills();
    skillSystem.planner.registerSkills(skills);
    // Find matching skills
    const matches = skillSystem.planner.findMatchingSkills(query, context);
    if (matches.length === 0) {
        console.log('No matching skills found for this query.');
        return;
    }
    console.log(`Found ${matches.length} matching skill(s):\n`);
    for (let i = 0; i < Math.min(3, matches.length); i++) {
        const match = matches[i];
        const skill = skillSystem.planner.getSkill(match.skillName);
        console.log(`${i + 1}. ${match.skillName} (score: ${match.score})`);
        console.log(`   Reasons: ${match.reasons.join(', ')}`);
        if (skill) {
            console.log(`   Description: ${skill.contract.metadata.shortDescription}`);
        }
        console.log('');
    }
    // Execute the best match
    const bestMatch = matches[0];
    const skill = skillSystem.planner.getSkill(bestMatch.skillName);
    if (skill) {
        console.log(`Executing skill: ${bestMatch.skillName}...\n`);
        const result = await skillSystem.executor.execute(skill, { query }, context);
        if (result.success && result.output) {
            console.log('Result:');
            console.log('=======\n');
            console.log(JSON.stringify(result.output, null, 2));
            console.log('\n');
            if (result.metadata) {
                console.log(`Execution time: ${result.metadata.executionTime}ms`);
                if (result.metadata.confidence) {
                    console.log(`Confidence: ${result.metadata.confidence}`);
                }
            }
            // Store output in context
            skillSystem.context.storeOutput(sessionId, bestMatch.skillName, result.output);
            console.log(`Session ID: ${sessionId}`);
        }
        else {
            console.log('Execution failed:');
            console.log(`Error: ${result.error?.code}`);
            console.log(`Message: ${result.error?.message}`);
        }
    }
}
// CLI entry point - always run when this file is executed
runSkillCLI(process.argv.slice(2)).catch((error) => {
    console.error('CLI Error:', error);
    process.exit(1);
});
