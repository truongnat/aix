mod cli;
mod engine;
mod skill;
mod skills;
mod workflow;

use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    cli::run().await
}
