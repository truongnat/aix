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

fn main() -> Result<()> {
    let child = std::thread::Builder::new()
        .stack_size(8 * 1024 * 1024) // 8MB stack
        .spawn(|| {
            let rt = tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .build()
                .unwrap();
            rt.block_on(async {
                cli::run().await
            })
        })?;
    child.join().map_err(|_| anyhow::anyhow!("Main thread panicked"))?
}
