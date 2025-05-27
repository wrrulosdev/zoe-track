use serde::Serialize;
use std::fs;
use std::path::Path;

/// Represents the parsed data from a League of Legends lockfile.
///
/// This structure contains the process ID, port, authentication token,
/// and protocol used by the local League client API.
#[derive(Debug, Serialize)]
pub struct LockFileData {
    pid: u64,
    port: u64,
    token: String,
    protocol: String,
}

impl LockFileData {
    /// Parses the raw content of a League lockfile and returns a `LockFileData` instance.
    ///
    /// # Arguments
    ///
    /// * `content` - The raw text content of the lockfile.
    ///
    /// # Returns
    ///
    /// * `Ok(LockFileData)` if parsing was successful.
    /// * `Err(String)` if the content is malformed or missing fields.
    fn parse_lockfile(content: &str) -> Result<Self, String> {
        if !(content.contains(":")) {
            return Err(String::from("Invalid lockfile!"));
        }

        let parts: Vec<&str> = content.trim().split(':').collect();

        // Expect at least 5 parts: name, pid, port, token, protocol
        if parts.len() < 5 {
            return Err(String::from("Lockfile format is invalid!"));
        }

        // Attempt to parse the pid and port from string to u64
        let pid: u64 = parts[1]
            .parse()
            .map_err(|_| String::from("Failed to parse pid as u64"))?;
        let port: u64 = parts[2]
            .parse()
            .map_err(|_| String::from("Failed to parse port as u64"))?;

        let token: String = parts[3].to_string();
        let protocol: String = parts[4].to_string();

        Ok(LockFileData {
            pid,
            port,
            token,
            protocol,
        })
    }
}

/// Reads and parses a League of Legends lockfile from the given path.
///
/// This function is exposed as a Tauri command so it can be called from the frontend.
///
/// # Arguments
///
/// * `path` - A string slice representing the full path to the lockfile.
///
/// # Returns
///
/// * `Ok(LockFileData)` if the file was read and parsed successfully.
/// * `Err(String)` if reading or parsing fails.
#[tauri::command]
pub fn get_lockfile(path: &str) -> Result<LockFileData, String> {
    let path_ref = Path::new(path);
    let content = fs::read_to_string(path_ref).map_err(|e| e.to_string())?;
    LockFileData::parse_lockfile(&content)
}
