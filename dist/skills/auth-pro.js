/**
 * Skill System v1 - Auth Pro Skill (Reference Implementation)
 *
 * This is the reference implementation showing how to migrate a markdown-based skill
 * to the new contract-based skill system format.
 *
 * Original: skills/auth-pro/SKILL.md
 */
// Input schema for auth-pro skill
const authInputSchema = {
    type: 'object',
    properties: {
        query: {
            type: 'string',
            description: 'The user query about authentication/authorization',
        },
        actors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Actors involved (end users, admins, services, partners)',
        },
        trustBoundaries: {
            type: 'array',
            items: { type: 'string' },
            description: 'Trust boundaries (browser, API, BFF, IdP, data store)',
        },
        clientType: {
            type: 'string',
            enum: ['server-rendered-web', 'spa', 'mobile-native', 'machine'],
            description: 'Client type',
        },
        sensitivity: {
            type: 'string',
            enum: ['public', 'pii', 'financial'],
            description: 'Data sensitivity level',
        },
        existingIdp: {
            type: 'string',
            description: 'Existing identity provider if any',
        },
        constraints: {
            type: 'array',
            items: { type: 'string' },
            description: 'Constraints (multi-tenant, latency, on-prem, cloud)',
        },
    },
    required: ['query'],
};
// Output schema for auth-pro skill
const authOutputSchema = {
    type: 'object',
    properties: {
        context: {
            type: 'string',
            description: 'Context about the auth scenario',
        },
        authenticationRecommendation: {
            type: 'string',
            description: 'Recommended authentication method',
        },
        authorizationRecommendation: {
            type: 'string',
            description: 'Recommended authorization model',
        },
        tokenSessionLifecycle: {
            type: 'string',
            description: 'Token and session lifecycle guidance',
        },
        implementationNotes: {
            type: 'string',
            description: 'Implementation and infrastructure notes',
        },
        residualRisks: {
            type: 'string',
            description: 'Residual risks and verification steps',
        },
    },
    required: ['authenticationRecommendation', 'authorizationRecommendation', 'residualRisks'],
};
// Custom validator for auth-pro
function validateAuthInput(input) {
    const errors = [];
    const data = input;
    // Ensure query is meaningful
    if (!data.query || typeof data.query !== 'string' || data.query.trim().length < 10) {
        errors.push('Query must be at least 10 characters long');
    }
    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}
// Auth-pro skill handler
async function authProHandler(input, context) {
    const data = input;
    try {
        // Simulate skill logic - in production, this would:
        // 1. Read from knowledge base (references/)
        // 2. Apply operating principles
        // 3. Generate structured response
        const response = {
            context: `Actors: ${data.actors?.join(', ') || 'not specified'}. Trust boundaries: ${data.trustBoundaries?.join(', ') || 'not specified'}. Client type: ${data.clientType || 'not specified'}. Sensitivity: ${data.sensitivity || 'not specified'}.`,
            authenticationRecommendation: recommendAuthMethod(data),
            authorizationRecommendation: recommendAuthzModel(data),
            tokenSessionLifecycle: generateTokenLifecycleGuidance(data),
            implementationNotes: generateImplementationNotes(data),
            residualRisks: generateResidualRisks(data),
        };
        return {
            success: true,
            output: response,
            metadata: {
                executionTime: 0,
                confidence: 0.85,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            error: {
                code: 'AUTH_PRO_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error in auth-pro skill',
                details: error,
            },
        };
    }
}
// Helper functions (would normally read from references/)
function recommendAuthMethod(data) {
    const clientType = data.clientType;
    const sensitivity = data.sensitivity;
    const existingIdp = data.existingIdp;
    if (existingIdp) {
        return `Use existing IdP (${existingIdp}) with OAuth/OIDC. Configure appropriate client type and flows.`;
    }
    if (clientType === 'spa') {
        return 'OAuth 2.0 Authorization Code Flow with PKCE is recommended for SPAs.';
    }
    if (clientType === 'mobile-native') {
        return 'OAuth 2.0 Authorization Code Flow with PKCE or device flow for mobile apps.';
    }
    if (clientType === 'machine') {
        return 'Use mTLS or API keys for machine-to-machine authentication.';
    }
    if (sensitivity === 'financial') {
        return 'For financial data, implement MFA/WebAuthn with OAuth/OIDC and short-lived sessions.';
    }
    return 'Session-based auth with secure cookies for server-rendered web; OAuth/OIDC for delegated access.';
}
function recommendAuthzModel(data) {
    const sensitivity = data.sensitivity;
    const actors = data.actors;
    if (sensitivity === 'financial' || sensitivity === 'pii') {
        return 'Implement RBAC with attribute-based policies (ABAC) for fine-grained access control.';
    }
    if (actors?.includes('partners')) {
        return 'Consider ABAC or ReBAC for partner access with explicit relationship-based policies.';
    }
    return 'RBAC is sufficient for most scenarios. Define clear roles and permissions with least-privilege default.';
}
function generateTokenLifecycleGuidance(data) {
    const sensitivity = data.sensitivity;
    if (sensitivity === 'financial') {
        return 'Use short-lived access tokens (5-15 minutes) with refresh tokens. Implement token rotation and immediate revocation on logout/security events.';
    }
    return 'Access tokens should have reasonable lifetime (1 hour default). Refresh tokens must be securely stored, rotated, and revocable. Sessions should timeout with clear logout semantics.';
}
function generateImplementationNotes(data) {
    const clientType = data.clientType;
    const existingIdp = data.existingIdp;
    let notes = 'Implement auth on the backend (BFF pattern) to avoid exposing secrets to clients. ';
    if (existingIdp) {
        notes += `Configure ${existingIdp} with appropriate scopes and claims. `;
    }
    if (clientType === 'spa') {
        notes += 'Store tokens in memory or httpOnly cookies; never in localStorage. ';
    }
    notes += 'Log auth events for audit and monitoring. Implement rate limiting on auth endpoints.';
    return notes;
}
function generateResidualRisks(data) {
    const sensitivity = data.sensitivity;
    let risks = 'Token leakage via XSS, CSRF on state-changing operations, weak password policies. ';
    if (sensitivity === 'financial') {
        risks += 'Elevated risk of account takeover; implement MFA, device fingerprinting, and anomaly detection. ';
    }
    risks += 'Verify: token rotation works, revocation is effective, sessions expire correctly, and audit logs capture auth events.';
    return risks;
}
// Export the skill
export const authProSkill = {
    contract: {
        metadata: {
            name: 'auth-pro',
            version: { major: 1, minor: 0, patch: 0 },
            description: 'Professional authentication and authorization guidance across web/mobile/API systems',
            shortDescription: 'Auth — identity lifecycle, sessions, OAuth, authz, federation, observability',
            domain: 'identity-access',
            level: 'professional',
            triggers: [
                'authentication',
                'authorization',
                'auth',
                'login',
                'session',
                'session management',
                'JWT',
                'OAuth',
                'OIDC',
                'SAML',
                'API key',
                'mTLS',
                'RBAC',
                'ABAC',
                'ReBAC',
                'MFA',
                'WebAuthn',
                'passkeys',
                'PKCE',
                'refresh token',
                'SSO',
                'access control',
                'BFF',
                'OAuth scopes',
                'device flow',
                'magic link',
                'account lifecycle',
                'SCIM',
                'JIT provisioning',
                'password reset',
                'credential stuffing',
                'break-glass',
                'impersonation',
            ],
            dependencies: ['security-pro'],
        },
        inputSchema: authInputSchema,
        outputSchema: authOutputSchema,
        requiredInputs: ['query'],
        constraints: {
            maxExecutionTime: 30000,
            requiresContext: false,
            allowedEnvironments: ['development', 'staging', 'production'],
        },
    },
    handler: authProHandler,
    validate: validateAuthInput,
};
