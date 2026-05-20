#![allow(dead_code)]

mod bmad;
mod bug;
mod cli;
mod engine;
mod harness;
mod office;
mod pinchtab;
mod platform;
mod skill;
mod skills;
mod workflow;

use anyhow::Result;

pub fn main_entry() -> Result<()> {
    migrate_legacy_env_prefixes();

    let child = std::thread::Builder::new()
        .stack_size(8 * 1024 * 1024)
        .spawn(|| {
            let rt = tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .build()
                .unwrap();
            rt.block_on(async { cli::run().await })
        })?;
    child
        .join()
        .map_err(|_| anyhow::anyhow!("Main thread panicked"))?
}

fn migrate_legacy_env_prefixes() {
    let legacy_pairs = std::env::vars_os()
        .filter_map(|(key, value)| {
            let key_string = key.to_string_lossy().to_string();
            if let Some(suffix) = key_string.strip_prefix("ANTIGRAV_") {
                Some((format!("AGENTIC_SDLC_{}", suffix), value))
            } else {
                None
            }
        })
        .collect::<Vec<_>>();

    for (new_key, value) in legacy_pairs {
        if std::env::var_os(&new_key).is_none() {
            unsafe {
                std::env::set_var(new_key, value);
            }
        }
    }
}
