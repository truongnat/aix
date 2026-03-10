//! BMAD Party Mode Module
//!
//! Enables multiple agents to collaborate in a single session.

use super::BmadAgent;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Party mode session - multiple agents collaborating
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartySession {
    pub id: String,
    pub name: String,
    pub agents: Vec<PartyAgent>,
    pub messages: Vec<PartyMessage>,
    pub context: String,
}

impl PartySession {
    pub fn new(name: String) -> Self {
        Self {
            id: uuid_simple(),
            name,
            agents: Vec::new(),
            messages: Vec::new(),
            context: String::new(),
        }
    }

    pub fn add_agent(&mut self, agent: BmadAgent, role: &str) {
        self.agents.push(PartyAgent {
            agent,
            role: role.to_string(),
            active: true,
        });
    }

    pub fn add_message(&mut self, from: &str, content: &str) {
        self.messages.push(PartyMessage {
            from: from.to_string(),
            content: content.to_string(),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
        });
    }
}

/// An agent in a party session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartyAgent {
    pub agent: BmadAgent,
    pub role: String,
    pub active: bool,
}

/// A message in party chat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartyMessage {
    pub from: String,
    pub content: String,
    pub timestamp: u64,
}

/// Party mode manager
#[derive(Debug, Default)]
pub struct PartyManager {
    sessions: HashMap<String, PartySession>,
}

impl PartyManager {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
        }
    }

    pub fn create_session(&mut self, name: String) -> String {
        let session = PartySession::new(name);
        let id = session.id.clone();
        self.sessions.insert(id.clone(), session);
        id
    }

    pub fn get_session(&self, id: &str) -> Option<&PartySession> {
        self.sessions.get(id)
    }

    pub fn get_session_mut(&mut self, id: &str) -> Option<&mut PartySession> {
        self.sessions.get_mut(id)
    }

    pub fn list_sessions(&self) -> Vec<&PartySession> {
        self.sessions.values().collect()
    }

    /// Create a standard team party
    pub fn create_team_session(&mut self, name: String, team_type: &str) -> String {
        let session_id = self.create_session(name);

        let agents = match team_type {
            "feature" => vec![
                (BmadAgent::ProductManager, "Product Owner"),
                (BmadAgent::Architect, "Technical Lead"),
                (BmadAgent::Developer, "Developer"),
                (BmadAgent::QaEngineer, "QA"),
            ],
            "fullstack" => vec![
                (BmadAgent::ProductManager, "Product Owner"),
                (BmadAgent::Architect, "Technical Lead"),
                (BmadAgent::Developer, "Developer"),
                (BmadAgent::UxDesigner, "Designer"),
                (BmadAgent::QaEngineer, "QA"),
                (BmadAgent::TechWriter, "Tech Writer"),
            ],
            "platform" => vec![
                (BmadAgent::Architect, "Architect"),
                (BmadAgent::DevOps, "DevOps"),
                (BmadAgent::SecurityExpert, "Security"),
                (BmadAgent::DataEngineer, "Data"),
            ],
            "ml" => vec![
                (BmadAgent::ProductManager, "Product"),
                (BmadAgent::AiEngineer, "ML Engineer"),
                (BmadAgent::DataEngineer, "Data Engineer"),
                (BmadAgent::QaEngineer, "QA"),
            ],
            _ => vec![
                (BmadAgent::Developer, "Developer"),
                (BmadAgent::QaEngineer, "QA"),
            ],
        };

        if let Some(session) = self.sessions.get_mut(&session_id) {
            for (agent, role) in agents {
                session.add_agent(agent, role);
            }
        }

        session_id
    }
}

/// Simple UUID generation
fn uuid_simple() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap();
    format!("{:x}-{:x}", duration.as_secs(), duration.subsec_nanos())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_party_manager() {
        let mut manager = PartyManager::new();
        let id = manager.create_session("Test Session".to_string());
        assert!(manager.get_session(&id).is_some());
    }

    #[test]
    fn test_team_session() {
        let mut manager = PartyManager::new();
        let id = manager.create_team_session("Feature Team".to_string(), "feature");
        let session = manager.get_session(&id).unwrap();
        assert!(session.agents.len() >= 4);
    }
}
