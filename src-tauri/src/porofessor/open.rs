#[tauri::command]
pub async fn open_porofessor(region: &str, players: &str) -> Result<(), ()> {
    let url: String = format!("https://porofessor.gg/pregame/{}/{}", region, players);
    println!("{} - {} - {}", url, region, players);
    let _ = open::that(url);
    Ok(())
}
