import {invoke} from "@tauri-apps/api/core";
import {changeStatus, togglePorofessorButton} from "../ui/updateStatusUI.ts";
import {STATES} from "../constants/states.ts";

export interface LockFileData {
  port: number;
  token: string;
}

/**
 * Checks if League of Legends is currently running.
 * @returns {Promise<boolean>} Whether the game is running.
 */
export async function isLolRunning(): Promise<boolean> {
  return await invoke<boolean>("is_lol_running");
}

/**
 * Gets the current gameflow phase from the League client.
 * @param lockFileData Object containing port and token.
 * @returns {Promise<string | null>} The gameflow phase or null on error.
 */
export async function getGameflowPhase(
  lockFileData: LockFileData
): Promise<string | null> {
  try {
    const gameFlowPhase = await invoke<string>("get_gameflow_phase", {
      port: lockFileData.port,
      token: lockFileData.token,
    });

    return gameFlowPhase.replace(/"/g, "");
  } catch (e) {
    console.error("[!] Error fetching gameflow phase:", e);
    return null;
  }
}

/**
 * Reads the League of Legends lockfile.
 * @param lolPath League of legends folder
 * @returns {Promise<LockFileData | undefined>} Lock file data
 */
export async function readLockFile(
    lolPath: string
): Promise<LockFileData | undefined> {
  try {
    const lockfilePath = `${lolPath.replace(/\\+$/, "")}\\lockfile`;
    return await invoke<LockFileData>("get_lockfile", {
      path: lockfilePath,
    });
  } catch (error) {
    console.error("Error reading lockfile:", error);
    return undefined;
  }
}


/**
 * Sends a request to accept a match automatically.
 * @param lockFileData Object containing port and token.
 */
export async function acceptGame(lockFileData: LockFileData): Promise<void> {
  await invoke("auto_accept_match", {
    port: lockFileData.port,
    token: lockFileData.token,
  });
}

/**
 *
 */
export async function getUsernamesInLobby(lockFileData: LockFileData) {
  try {
    const sessionInfo = await invoke("session_info", {
      port: lockFileData.port,
      token: lockFileData.token,
    });
    // @ts-ignore
    const users = sessionInfo.myTeam.map((player: { gameName: any; tagLine: any; }) => ({
      name: player.gameName,
      tag: player.tagLine ?? "UNKNOWN",
    }));
    return users;
  } catch (error) {
    console.warn("Failed to fetch session info:", error);
  }
}

/**
 * Continuously monitors the League client state and updates UI accordingly.
 * @param lockFileData Object containing port and token.
 */
export async function monitorGame(lockFileData: LockFileData): Promise<void> {
  const autoAcceptSwitch = document.getElementById(
    "autoAcceptSwitch"
  ) as HTMLInputElement | null;
  const autoBanPickSwitch = document.getElementById(
    "autoBanPickSwitch"
  ) as HTMLInputElement | null;

  const phase = await getGameflowPhase(lockFileData);
  if (!phase) return;

  switch (phase) {
    case "Lobby":
      console.log("In lobby");
      changeStatus(STATES.LOBBY);
      togglePorofessorButton(false);
      break;

    case "Matchmaking":
      console.log("In queue...");
      changeStatus(STATES.QUEUE);
      togglePorofessorButton(false);
      break;

    case "ReadyCheck":
      if (!autoAcceptSwitch?.checked) return;
      changeStatus(STATES.GAME_FOUND);
      togglePorofessorButton(false);
      console.log("Match found, accepting...");
      await acceptGame(lockFileData);
      break;

    case "ChampSelect":
      changeStatus(STATES.CHAMP_SELECT);
      togglePorofessorButton(true);
      if (!autoBanPickSwitch?.checked) return;
      console.log("In champion select");
      break;

    case "InProgress":
      changeStatus(STATES.IN_GAME);
      togglePorofessorButton(false);
      console.log("Game in progress");
      break;

    // changeStatus(STATES.ENDING);

    default:
      console.log("Unknown state:", phase);
      changeStatus(STATES.LOBBY_WAITING);
      togglePorofessorButton(false);
      break;
  }
}
