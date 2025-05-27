/// Checks if the League of Legends client process is currently running on the system.
///
/// This function uses the `sysinfo` crate to refresh all system processes and
/// searches for any process whose name contains "LeagueClient".
///
/// # Returns
///
/// * `true` if a process with "LeagueClient" in its name is found.
/// * `false` otherwise.
#[tauri::command]
pub fn is_lol_running() -> bool {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();

    sys.processes().values().any(|process| {
        let name = process.name();
        name.to_string_lossy().contains("LeagueClient")
    })
}
