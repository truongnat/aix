#![allow(dead_code)]

mod bmad;
mod cli;
mod engine;
mod office;
mod pinchtab;
mod platform;
mod skill;
mod skills;
mod workflow;

use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    cli::run().await
}
