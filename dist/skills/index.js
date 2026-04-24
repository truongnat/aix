/**
 * Skill System v1 - Skills Registry
 *
 * Central registry for all skills in the system
 */
import { authProSkill } from './auth-pro.js';
// Registry of all available skills
const skillRegistry = new Map();
// Register skills
export function registerSkill(skill) {
    skillRegistry.set(skill.contract.metadata.name, skill);
}
export function getSkill(name) {
    return skillRegistry.get(name);
}
export function getAllSkills() {
    return Array.from(skillRegistry.values());
}
// Initialize with bundled skills
export function initializeSkills() {
    registerSkill(authProSkill);
    // Add more skills here as they are migrated
    // registerSkill(securityProSkill);
    // registerSkill(nextjsProSkill);
    // etc.
}
// Auto-initialize
initializeSkills();
export { authProSkill };
