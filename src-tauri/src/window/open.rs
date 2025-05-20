use tauri::{AppHandle, WebviewWindowBuilder, WebviewUrl};


#[tauri::command]
pub async fn open_popup(app: AppHandle) {
    WebviewWindowBuilder::new(
        &app,
        "popup",                             // unique label
        WebviewUrl::App("/lobby-usernames".into()) // load this HTML
    )
    .title("Lobby Username Tracker")
    .inner_size(500.0, 400.0)
    .resizable(false)
    .decorations(false)
    .build()
    .expect("failed to build popup window");
}
