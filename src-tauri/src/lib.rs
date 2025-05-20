mod lcu;
mod window;

use lcu::lockfile::get_lockfile;
use lcu::client::is_lol_running;
use lcu::endpoints::get_summoner_info;
use lcu::endpoints::get_gameflow_phase;
use lcu::endpoints::auto_accept_match;
use lcu::endpoints::session_info;
use window::open::open_popup;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_lockfile, is_lol_running, get_summoner_info, auto_accept_match, get_gameflow_phase, session_info, open_popup])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
