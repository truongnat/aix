/**
 * Skill System v1 - Skill Planner
 *
 * Rule-based planner for skill selection and execution planning
 */
export class SkillPlanner {
    registry = new Map();
    registerSkill(skill) {
        this.registry.set(skill.contract.metadata.name, skill);
    }
    registerSkills(skills) {
        for (const skill of skills) {
            this.registerSkill(skill);
        }
    }
    getSkill(name) {
        return this.registry.get(name);
    }
    listSkills() {
        return Array.from(this.registry.keys());
    }
    /**
     * Match skills based on trigger keywords and description
     */
    findMatchingSkills(query, context) {
        const queryLower = query.toLowerCase();
        const matches = [];
        for (const [name, skill] of this.registry.entries()) {
            let score = 0;
            const reasons = [];
            // Check trigger keywords
            for (const trigger of skill.contract.metadata.triggers) {
                if (queryLower.includes(trigger.toLowerCase())) {
                    score += 10;
                    reasons.push(`Trigger match: "${trigger}"`);
                }
            }
            // Check description
            const descLower = skill.contract.metadata.description.toLowerCase();
            if (descLower.includes(queryLower)) {
                score += 5;
                reasons.push('Description match');
            }
            // Check domain match if provided in context
            if (context?.metadata?.domain === skill.contract.metadata.domain) {
                score += 3;
                reasons.push('Domain match');
            }
            // Check level compatibility
            if (context?.metadata?.level === skill.contract.metadata.level) {
                score += 2;
                reasons.push('Level match');
            }
            if (score > 0) {
                matches.push({ skillName: name, score, reasons });
            }
        }
        // Sort by score descending
        matches.sort((a, b) => b.score - a.score);
        return matches;
    }
    /**
     * Create an execution plan for a given query
     */
    planExecution(query, context) {
        const matches = this.findMatchingSkills(query, context);
        if (matches.length === 0) {
            return null;
        }
        const bestMatch = matches[0];
        const skill = this.registry.get(bestMatch.skillName);
        if (!skill) {
            return null;
        }
        // For now, create a simple plan
        // In future, this could involve multi-skill chaining
        return {
            skillName: bestMatch.skillName,
            input: { query }, // Will be refined by actual skill
            dependencies: skill.contract.metadata.dependencies,
        };
    }
    /**
     * Check if skill dependencies are satisfied
     */
    checkDependencies(skillName, context) {
        const skill = this.registry.get(skillName);
        if (!skill || !skill.contract.metadata.dependencies) {
            return true;
        }
        for (const dep of skill.contract.metadata.dependencies) {
            // Check if dependency output is available in context
            if (!context.previousOutputs?.has(dep)) {
                return false;
            }
        }
        return true;
    }
}
