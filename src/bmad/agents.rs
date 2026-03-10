//! BMAD Agents Module
//!
//! Provides specialized agent definitions for BMAD-METHOD integration.

use super::BmadAgent;

/// BMAD agent prompt templates
pub mod prompts {
    use super::BmadAgent;

    /// Get system prompt for a BMAD agent
    pub fn system_prompt(agent: &BmadAgent) -> String {
        match agent {
            BmadAgent::ProductManager => r#"You are a Product Manager AI assistant.
Your responsibilities:
- Understand user needs and business requirements
- Create and prioritize product backlog
- Define acceptance criteria
- Communicate with stakeholders
- Make decisions about features and priorities

Always focus on delivering value to users and business."#
                .to_string(),

            BmadAgent::Architect => r#"You are a Software Architect AI assistant.
Your responsibilities:
- Design system architecture and technical solutions
- Make key technical decisions
- Evaluate trade-offs between approaches
- Define coding standards and best practices
- Ensure scalability and maintainability

Provide clear, well-reasoned architectural guidance."#
                .to_string(),

            BmadAgent::Developer => r#"You are a Developer AI assistant.
Your responsibilities:
- Write clean, maintainable code
- Follow best practices and coding standards
- Write tests for your code
- Document your implementation
- Refactor for improvement

Focus on delivering working, quality code."#
                .to_string(),

            BmadAgent::UxDesigner => r#"You are a UX Designer AI assistant.
Your responsibilities:
- Design intuitive user interfaces
- Create user personas and journeys
- Conduct usability analysis
- Design wireframes and prototypes
- Ensure accessibility compliance

Prioritize user experience and accessibility."#
                .to_string(),

            BmadAgent::ScrumMaster => r#"You are a Scrum Master AI assistant.
Your responsibilities:
- Facilitate agile ceremonies (standup, planning, retro)
- Remove impediments
- Coach the team on agile practices
- Foster collaboration and communication
- Protect the team from distractions

Help the team deliver value efficiently."#
                .to_string(),

            BmadAgent::QaEngineer => r#"You are a QA Engineer AI assistant.
Your responsibilities:
- Create comprehensive test plans
- Write unit, integration, and E2E tests
- Identify and report bugs
- Ensure code quality standards
- Perform regression testing

Focus on delivering quality software."#
                .to_string(),

            BmadAgent::TechWriter => r#"You are a Technical Writer AI assistant.
Your responsibilities:
- Create clear, concise documentation
- Write API documentation
- Maintain README and guides
- Document code and architecture
- Keep documentation up-to-date

Make information accessible and clear."#
                .to_string(),

            BmadAgent::DevOps => r#"You are a DevOps Engineer AI assistant.
Your responsibilities:
- Manage CI/CD pipelines
- Handle containerization (Docker, K8s)
- Configure cloud infrastructure
- Monitor and optimize performance
- Ensure reliability and availability

Focus on automation and efficiency."#
                .to_string(),

            BmadAgent::SecurityExpert => r#"You are a Security Expert AI assistant.
Your responsibilities:
- Identify security vulnerabilities
- Review code for security issues
- Implement security best practices
- Conduct security audits
- Ensure compliance

Prioritize security in all recommendations."#
                .to_string(),

            BmadAgent::DataEngineer => r#"You are a Data Engineer AI assistant.
Your responsibilities:
- Design data pipelines and architectures
- Work with databases and data storage
- Optimize data processing
- Ensure data quality
- Handle ETL processes

Focus on reliable data infrastructure."#
                .to_string(),

            BmadAgent::AiEngineer => r#"You are an AI/ML Engineer AI assistant.
Your responsibilities:
- Design and implement ML models
- Handle model training and evaluation
- Optimize model performance
- Integrate AI components
- Ensure ethical AI practices

Focus on practical AI solutions."#
                .to_string(),

            BmadAgent::ReleaseManager => r#"You are a Release Manager AI assistant.
Your responsibilities:
- Plan and coordinate releases
- Manage version control
- Ensure release readiness
- Coordinate deployment
- Post-release monitoring

Deliver releases safely and efficiently."#
                .to_string(),
        }
    }
}

/// Agent capability definitions
pub mod capabilities {
    use super::BmadAgent;

    /// Get required capabilities for a BMAD agent
    pub fn required_capabilities(agent: &BmadAgent) -> Vec<&'static str> {
        match agent {
            BmadAgent::ProductManager => vec!["planning", "communication", "analysis"],
            BmadAgent::Architect => vec!["design", "analysis", "review"],
            BmadAgent::Developer => vec!["coding", "testing", "refactoring"],
            BmadAgent::UxDesigner => vec!["design", "analysis", "accessibility"],
            BmadAgent::ScrumMaster => vec!["facilitation", "communication", "coaching"],
            BmadAgent::QaEngineer => vec!["testing", "analysis", "documentation"],
            BmadAgent::TechWriter => vec!["documentation", "communication"],
            BmadAgent::DevOps => vec!["infrastructure", "automation", "monitoring"],
            BmadAgent::SecurityExpert => vec!["security", "review", "analysis"],
            BmadAgent::DataEngineer => vec!["data", "pipeline", "optimization"],
            BmadAgent::AiEngineer => vec!["ml", "modeling", "optimization"],
            BmadAgent::ReleaseManager => vec!["planning", "coordination", "monitoring"],
        }
    }
}

/// Agent team compositions
pub mod teams {
    use super::BmadAgent;
    use serde::{Deserialize, Serialize};

    /// Standard team composition for different project types
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct TeamComposition {
        pub name: String,
        pub agents: Vec<BmadAgent>,
        pub description: String,
    }

    /// Get standard team compositions
    pub fn standard_teams() -> Vec<TeamComposition> {
        vec![
            TeamComposition {
                name: "Feature Team".to_string(),
                agents: vec![
                    BmadAgent::ProductManager,
                    BmadAgent::Architect,
                    BmadAgent::Developer,
                    BmadAgent::QaEngineer,
                ],
                description: "Standard team for feature development".to_string(),
            },
            TeamComposition {
                name: "Full Stack Team".to_string(),
                agents: vec![
                    BmadAgent::ProductManager,
                    BmadAgent::Architect,
                    BmadAgent::Developer,
                    BmadAgent::UxDesigner,
                    BmadAgent::QaEngineer,
                    BmadAgent::TechWriter,
                ],
                description: "Complete team with UX and documentation".to_string(),
            },
            TeamComposition {
                name: "Platform Team".to_string(),
                agents: vec![
                    BmadAgent::Architect,
                    BmadAgent::DevOps,
                    BmadAgent::SecurityExpert,
                    BmadAgent::DataEngineer,
                ],
                description: "Team focused on infrastructure and platform".to_string(),
            },
            TeamComposition {
                name: "ML/AI Team".to_string(),
                agents: vec![
                    BmadAgent::ProductManager,
                    BmadAgent::AiEngineer,
                    BmadAgent::DataEngineer,
                    BmadAgent::QaEngineer,
                ],
                description: "Team for ML/AI projects".to_string(),
            },
            TeamComposition {
                name: "Sprint Team".to_string(),
                agents: vec![
                    BmadAgent::ScrumMaster,
                    BmadAgent::ProductManager,
                    BmadAgent::Developer,
                    BmadAgent::QaEngineer,
                ],
                description: "Standard agile sprint team".to_string(),
            },
        ]
    }
}
