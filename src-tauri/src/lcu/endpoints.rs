use serde::Serialize;
use super::request::LcuRequestClient;
use serde_json::Value;

#[derive(Serialize)]
struct ChampSelectAction {
    actorCellId: u32,
    championId: u32,
    #[serde(rename = "type")]
    action_type: String,
    isInProgress: bool,
    completed: bool,
}

/// Helper function to create a new `LcuRequestClient` instance with the given port and token.
///
/// # Arguments
///
/// * `port` - Port used by the local League of Legends client.
/// * `token` - Authentication token for the LCU API.
///
/// # Returns
///
/// * `Ok(LcuRequestClient)` if client creation was successful.
/// * `Err(String)` if initialization fails.
fn client(port: u16, token: &str) -> Result<LcuRequestClient, String> {
    LcuRequestClient::new(port, token)
}

/// Retrieves basic information about the current logged-in summoner.
///
/// This includes name, summoner ID, availability, etc., from the chat subsystem.
///
/// # Arguments
///
/// * `port` - Port of the local client.
/// * `token` - Authentication token.
///
/// # Returns
///
/// * `Ok(String)` containing the summoner info in JSON format.
/// * `Err(String)` if the request fails.
#[tauri::command]
pub async fn get_summoner_info(port: u16, token: &str) -> Result<String, String> {
    client(port, token)?.get("/lol-chat/v1/me").await
}

/// Gets the current gameflow phase (e.g., Lobby, ChampSelect, InProgress).
///
/// Useful to know what state the client is currently in.
///
/// # Returns
///
/// * `Ok(String)` with the current phase.
/// * `Err(String)` if the request fails.
#[tauri::command]
pub async fn get_gameflow_phase(port: u16, token: &str) -> Result<String, String> {
    let client = client(port, token)?;
    client.get("/lol-gameflow/v1/gameflow-phase").await
}

/// Automatically accepts the match popup when it's ready.
///
/// This sends a POST request to accept the matchmaking ready check.
///
/// # Returns
///
/// * `Ok(())` if the match was accepted successfully.
/// * `Err(String)` if the request fails.
#[tauri::command]
pub async fn auto_accept_match(port: u16, token: &str) -> Result<(), String> {
    let client = client(port, token)?;
    client
        .post_empty("/lol-matchmaking/v1/ready-check/accept")
        .await?;
    Ok(())
}

/// Retrieves the current champion select session information.
///
/// Returns the full session data, including team members, picks, bans, etc.
///
/// # Returns
///
/// * `Ok(Value)` containing the JSON structure of the session.
/// * `Err(String)` if the request fails.
#[tauri::command]
pub async fn session_info(port: u16, token: &str) -> Result<Value, String> {
    let client = client(port, token)?;
    let session_json = client.get_json("/lol-champ-select/v1/session").await?;
    Ok(session_json)
}

/// Performs a champion select action (pick or ban) during the champion select phase.
///
/// # Arguments
///
/// * `port` - Port of the local client.
/// * `token` - Authentication token.
/// * `action_id` - ID of the action to perform.
/// * `champion_id` - ID of the champion to select or ban.
///
/// # Returns
///
/// * `Ok(())` if the action was successful.
/// * `Err(String)` if the request fails.
#[tauri::command]
pub async fn perform_champ_select_action(
    port: u16,
    token: &str,
    action_id: u32,
    champion_id: u32,
    action_type: String,
) -> Result<(), String> {
    let client = client(port, token)?;
    let endpoint = format!("/lol-champ-select/v1/session/actions/{}", action_id);
    let action = ChampSelectAction {
        actorCellId: action_id,
        championId: champion_id,
        action_type: action_type.into(),
        isInProgress: false,
        completed: true,
    };
    client.patch_json(&endpoint, &action).await
}
