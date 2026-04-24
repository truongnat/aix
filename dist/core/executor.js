/**
 * Skill System v1 - Skill Executor
 *
 * Executes individual skills with validation, error handling, and telemetry
 */
import { SchemaValidator } from './validator.js';
export class SkillExecutor {
    async execute(skill, input, context) {
        const startTime = Date.now();
        try {
            // Validate input against schema
            SchemaValidator.validateOrThrow(input, skill.contract.inputSchema);
            // Check custom validator if provided
            if (skill.validate) {
                const customValidation = skill.validate(input);
                if (!customValidation.valid) {
                    return {
                        success: false,
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'Custom validation failed',
                            details: customValidation.errors,
                        },
                        metadata: { executionTime: Date.now() - startTime },
                    };
                }
            }
            // Check constraints
            if (skill.contract.constraints) {
                const { maxExecutionTime, requiresContext, allowedEnvironments } = skill.contract.constraints;
                if (requiresContext && !context.sessionId) {
                    return {
                        success: false,
                        error: {
                            code: 'CONTEXT_REQUIRED',
                            message: 'This skill requires a session context',
                        },
                        metadata: { executionTime: Date.now() - startTime },
                    };
                }
                if (allowedEnvironments && context.environment && !allowedEnvironments.includes(context.environment)) {
                    return {
                        success: false,
                        error: {
                            code: 'ENVIRONMENT_NOT_ALLOWED',
                            message: `Skill not allowed in ${context.environment} environment`,
                        },
                        metadata: { executionTime: Date.now() - startTime },
                    };
                }
            }
            // Execute the skill handler
            const result = await skill.handler(input, context);
            // Validate output if successful
            if (result.success && result.output !== undefined) {
                try {
                    SchemaValidator.validateOrThrow(result.output, skill.contract.outputSchema);
                }
                catch (error) {
                    return {
                        success: false,
                        error: {
                            code: 'OUTPUT_VALIDATION_ERROR',
                            message: 'Skill produced invalid output',
                            details: error,
                        },
                        metadata: { executionTime: Date.now() - startTime },
                    };
                }
            }
            return {
                ...result,
                metadata: {
                    ...result.metadata,
                    executionTime: Date.now() - startTime,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'EXECUTION_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: error,
                },
                metadata: { executionTime: Date.now() - startTime },
            };
        }
    }
    async executeWithTimeout(skill, input, context, timeoutMs) {
        const maxTime = skill.contract.constraints?.maxExecutionTime || timeoutMs;
        return Promise.race([
            this.execute(skill, input, context),
            new Promise((resolve) => setTimeout(() => resolve({
                success: false,
                error: {
                    code: 'TIMEOUT',
                    message: `Skill execution exceeded ${maxTime}ms`,
                },
                metadata: { executionTime: maxTime },
            }), maxTime)),
        ]);
    }
}
