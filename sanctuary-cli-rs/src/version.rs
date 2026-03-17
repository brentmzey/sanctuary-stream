use anyhow::Result;
use regex::Regex;
use serde_json::Value;
use std::fs;
use std::path::Path;

pub fn bump_version(new_version: &str) -> Result<()> {
    println!("🔄 Bumping all versions to {}...", new_version);

    // 1. Update package.json files
    let package_jsons = vec![
        "package.json",
        "sanctuary-app/package.json",
        "sanctuary-bridge/package.json",
        "sanctuary-cli/package.json",
    ];

    for path in package_jsons {
        update_json_version(path, new_version)?;
    }

    // 2. Update tauri.conf.json
    update_tauri_version("sanctuary-app/src-tauri/tauri.conf.json", new_version)?;

    // 3. Update Cargo.toml files
    let cargo_tomls = vec![
        "sanctuary-core/Cargo.toml",
        "sanctuary-cli-rs/Cargo.toml",
        "sanctuary-app/src-tauri/Cargo.toml",
    ];

    for path in cargo_tomls {
        update_cargo_version(path, new_version)?;
    }

    Ok(())
}

fn update_json_version(path: &str, version: &str) -> Result<()> {
    if !Path::new(path).exists() {
        return Ok(());
    }
    let content = fs::read_to_string(path)?;
    let mut json: Value = serde_json::from_str(&content)?;

    if let Some(obj) = json.as_object_mut() {
        obj.insert("version".to_string(), Value::String(version.to_string()));
    }

    let updated = serde_json::to_string_pretty(&json)?;
    fs::write(path, updated + "\n")?;
    println!("  ✅ Updated {}", path);
    Ok(())
}

fn update_tauri_version(path: &str, version: &str) -> Result<()> {
    if !Path::new(path).exists() {
        return Ok(());
    }
    let content = fs::read_to_string(path)?;
    let mut json: Value = serde_json::from_str(&content)?;

    if let Some(package) = json.get_mut("package") {
        if let Some(obj) = package.as_object_mut() {
            obj.insert("version".to_string(), Value::String(version.to_string()));
        }
    }

    let updated = serde_json::to_string_pretty(&json)?;
    fs::write(path, updated + "\n")?;
    println!("  ✅ Updated {}", path);
    Ok(())
}

fn update_cargo_version(path: &str, version: &str) -> Result<()> {
    if !Path::new(path).exists() {
        return Ok(());
    }
    let content = fs::read_to_string(path)?;
    let re = Regex::new(r#"(?m)^version\s*=\s*"[^"]*""#)?;
    let updated = re.replace(&content, format!(r#"version = "{}""#, version));

    fs::write(path, updated.to_string())?;
    println!("  ✅ Updated {}", path);
    Ok(())
}
