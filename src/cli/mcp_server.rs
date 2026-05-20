use super::*;
use std::io::{self, BufRead};

/// Start the agentic-sdlc as an MCP server.
pub(crate) async fn run_mcp_serve(
    _project_layout: &AgentProjectLayout,
    transport: &str,
    _port: u16,
) -> Result<()> {
    match transport {
        "stdio" => serve_stdio().await,
        "http" => serve_http().await,
        _ => Err(anyhow!("Unsupported transport '{}'", transport)),
    }
}

async fn serve_stdio() -> Result<()> {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        let line = line?;
        if line.trim().is_empty() {
            continue;
        }
        // Simple JSON-RPC mock for now to satisfy basic pings
        if line.contains("initialize") {
            println!(
                r#"{{"jsonrpc":"2.0","id":1,"result":{{"capabilities":{{"tools":{{"listChanged":true}}}}}}}}"#
            );
        } else if line.contains("tools/list") {
            println!(
                r#"{{"jsonrpc":"2.0","id":2,"result":{{"tools":[
                {{"name":"workflow_run","description":"Run a workflow"}},
                {{"name":"skill_execute","description":"Execute a skill"}}
            ]}}}}"#
            );
        }
    }
    Ok(())
}

async fn serve_http() -> Result<()> {
    Err(anyhow!("HTTP transport not yet implemented"))
}
