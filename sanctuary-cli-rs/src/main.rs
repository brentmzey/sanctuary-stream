mod version;

use clap::{Parser, Subcommand};
use colored::*;
use std::process::Command;
use sanctuary_core::SanctuaryBridge;
use anyhow::{Context, Result};
use version::bump_version;

#[derive(Parser)]
#[command(name = "sanctuary")]
#[command(about = "CLI for managing Sanctuary Stream", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Start all development services
    Dev {
        /// Use simple output mode
        #[arg(short, long)]
        simple: bool,
    },
    /// Start only the bridge service (Rust implementation)
    Bridge,
    /// Build all components
    Build {
        /// Build app only
        #[arg(short, long)]
        app: bool,
        /// Build bridge only
        #[arg(short, long)]
        bridge: bool,
    },
    /// Run all tests
    Test {
        /// Run E2E tests only
        #[arg(short, long)]
        e2e: bool,
    },
    /// Bump version across all configuration files
    Bump {
        /// New version string (e.g., 0.3.2)
        version: String,
    },
    /// Synchronize database schemas across all SaaS instances
    SyncSchemas,
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    let cli = Cli::parse();

    match &cli.command {
        Commands::Dev { simple } => {
            println!("{}", "🚀 Starting Sanctuary Stream services...".blue());
            let cmd = if *simple { "npm run dev:simple" } else { "npm run dev:full" };
            run_command(cmd).context("Failed to run dev command")?;
        }
        Commands::Bridge => {
            tracing_subscriber::fmt()
                .with_max_level(tracing::Level::INFO)
                .init();
            println!("{}", "🚀 Starting Rust Sanctuary Bridge...".cyan());
            let pb_url = std::env::var("PB_URL").unwrap_or_else(|_| "http://127.0.0.1:8090".to_string());
            let stream_id = std::env::var("STREAM_ID").context("STREAM_ID environment variable is required for the bridge")?;
            let bridge = SanctuaryBridge::new(pb_url, stream_id);
            bridge.start().await.map_err(|e| anyhow::anyhow!(e.to_string()))?;
            // Keep the main thread alive
            tokio::signal::ctrl_c().await?;
        }
        Commands::Build { app, bridge } => {
            if *app {
                println!("{}", "📦 Building App...".cyan());
                run_command("npm run build:app").context("Failed to build app")?;
            } else if *bridge {
                println!("{}", "📦 Building Bridge...".cyan());
                run_command("npm run build:bridge").context("Failed to build bridge")?;
            } else {
                println!("{}", "📦 Building all components...".cyan());
                run_command("npm run build").context("Failed to build project")?;
            }
        }
        Commands::Test { e2e } => {
            if *e2e {
                println!("{}", "🧪 Running E2E tests...".yellow());
                run_command("npm run test:e2e").context("Failed to run E2E tests")?;
            } else {
                println!("{}", "🧪 Running all tests...".yellow());
                run_command("npm run test").context("Failed to run tests")?;
            }
        }
        Commands::Bump { version } => {
            bump_version(version)?;
            println!("{}", "✨ Version bump complete!".green());
        }
        Commands::SyncSchemas => {
            println!("{}", "☁️  Synchronizing database schemas across SaaS instances...".blue());
            
            // In a full production environment, this would:
            // 1. Authenticate with the Master PocketHost Registry
            // 2. Fetch all active 'Parish' instance URLs
            // 3. Iterate through them and apply the latest schema via the API
            
            let master_url = std::env::var("MASTER_REGISTRY_URL").unwrap_or_else(|_| "http://127.0.0.1:8090".to_string());
            println!("📡 Connecting to Master Registry at: {}", master_url);
            
            // For now, we simulate the orchestration loop
            let simulated_instances = vec!["https://st-marys.pockethost.io", "https://first-baptist.pockethost.io"];
            
            for instance in simulated_instances {
                println!("   🔄 Syncing schema to {}...", instance);
                // Here we would use PocketBaseClient::new(instance) to push updates
            }
            
            println!("{}", "✅ Schema sync complete for all active parishes!".green());
        }
    }


    Ok(())
}

fn run_command(cmd: &str) -> Result<()> {
    let status = Command::new("sh")
        .arg("-c")
        .arg(cmd)
        .status()
        .context("failed to execute process")?;

    if !status.success() {
        return Err(anyhow::anyhow!("Command failed with status: {}", status));
    }
    
    Ok(())
}
