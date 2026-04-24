/**
 * Skill System v1 - Schema Validation
 *
 * Validates input/output against JSON Schema
 */
export class ValidationError extends Error {
    errors;
    constructor(errors, message = 'Validation failed') {
        super(message);
        this.errors = errors;
        this.name = 'ValidationError';
    }
}
export class SchemaValidator {
    /**
     * Simple JSON Schema validator
     * For production, consider using ajv or similar library
     */
    static validate(data, schema) {
        const errors = [];
        if (schema.type === 'object') {
            if (typeof data !== 'object' || data === null || Array.isArray(data)) {
                errors.push(`Expected object, got ${typeof data}`);
                return { valid: false, errors };
            }
            const obj = data;
            // Check required properties
            if (schema.required) {
                for (const prop of schema.required) {
                    if (!(prop in obj)) {
                        errors.push(`Missing required property: ${prop}`);
                    }
                }
            }
            // Validate properties
            if (schema.properties) {
                for (const [key, propSchema] of Object.entries(schema.properties)) {
                    if (key in obj) {
                        const result = this.validate(obj[key], propSchema);
                        if (!result.valid) {
                            errors.push(...(result.errors || []).map(e => `${key}: ${e}`));
                        }
                    }
                }
            }
        }
        else if (schema.type === 'string') {
            if (typeof data !== 'string') {
                errors.push(`Expected string, got ${typeof data}`);
            }
            if (schema.enum && typeof data === 'string' && !schema.enum.includes(data)) {
                errors.push(`Value must be one of: ${schema.enum.join(', ')}`);
            }
        }
        else if (schema.type === 'number') {
            if (typeof data !== 'number') {
                errors.push(`Expected number, got ${typeof data}`);
            }
        }
        else if (schema.type === 'boolean') {
            if (typeof data !== 'boolean') {
                errors.push(`Expected boolean, got ${typeof data}`);
            }
        }
        else if (schema.type === 'array') {
            if (!Array.isArray(data)) {
                errors.push(`Expected array, got ${typeof data}`);
            }
            else if (schema.items) {
                data.forEach((item, index) => {
                    const result = this.validate(item, schema.items);
                    if (!result.valid) {
                        errors.push(...(result.errors || []).map(e => `[${index}]: ${e}`));
                    }
                });
            }
        }
        return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
    }
    static validateOrThrow(data, schema) {
        const result = this.validate(data, schema);
        if (!result.valid) {
            throw new ValidationError(result.errors || []);
        }
    }
}
