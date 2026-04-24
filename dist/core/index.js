/**
 * Skill System v1 - Core Module Export
 *
 * Main entry point for the skill system core
 */
export * from './types.js';
export * from './context.js';
export * from './validator.js';
export * from './executor.js';
export * from './planner.js';
import { SkillPlanner } from './planner.js';
import { SkillExecutor } from './executor.js';
import { contextManager } from './context.js';
export class SkillSystem {
    planner = new SkillPlanner();
    executor = new SkillExecutor();
    context = contextManager;
    constructor() {
        // Initialize with default context
        this.context.setGlobalContext({
            environment: 'development',
        });
    }
}
export const skillSystem = new SkillSystem();
