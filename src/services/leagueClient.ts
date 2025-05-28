import {invoke} from "@tauri-apps/api/core";
import {changeStatus, togglePorofessorButton} from "../ui/updateStatusUI.ts";
import {STATES} from "../constants/states.ts";
import {randomDelay} from "../utilities/delay.ts";
import {Champion} from "../contexts/ChampionContext.tsx";

export interface LockFileData {
  port: number;
  token: string;
}

interface IsTimeResponse {
  status: boolean;
  id: number;
}

let previousPhase: string | null = null;
let banDone = false;
let pickDone = false;

/**
 * Checks if League of Legends client is currently running.
 * @returns {Promise<boolean>} True if running, else false.
 */
export async function isLolRunning(): Promise<boolean> {
  return await invoke<boolean>("is_lol_running");
}

/**
 * Fetches the current gameflow phase from the League client.
 * @param lockFileData Object with port and token from lockfile.
 * @returns {Promise<string | null>} Current phase or null if error.
 */
async function getGameflowPhase(lockFileData: LockFileData): Promise<string | null> {
  try {
    const phase = await invoke<string>("get_gameflow_phase", {
      port: lockFileData.port,
      token: lockFileData.token,
    });
    return phase.replace(/"/g, "");
  } catch (e) {
    console.error("[!] Error fetching gameflow phase:", e);
    return null;
  }
}

/**
 * Reads the League of Legends lockfile to get connection info.
 * @param lolPath Path to the League of Legends installation folder.
 * @returns {Promise<LockFileData | undefined>} Lockfile data or undefined on failure.
 */
export async function readLockFile(lolPath: string): Promise<LockFileData | undefined> {
  try {
    const lockfilePath = `${lolPath.replace(/\\+$/, "")}\\lockfile`;
    return await invoke<LockFileData>("get_lockfile", {
      path: lockfilePath,
    });
  } catch (error) {
    console.error("Error reading lockfile:", error);
    changeStatus(STATES.LOCKFILE_NOT_FOUND);
    return undefined;
  }
}

/**
 * Automatically accepts a found match.
 * @param lockFileData Object with port and token.
 */
async function acceptGame(lockFileData: LockFileData): Promise<void> {
  await invoke("auto_accept_match", {
    port: lockFileData.port,
    token: lockFileData.token,
  });
}

/**
 * Retrieves the usernames of players currently in the lobby.
 * @param lockFileData Object with port and token.
 * @returns {Promise<{name: string, tag: string}[] | undefined>} Array of user info or undefined on failure.
 */
export async function getUsernamesInLobby(lockFileData: LockFileData): Promise<{ name: string; tag: string; }[] | undefined> {
  try {
    const sessionInfo: any = await invoke("session_info", {
      port: lockFileData.port,
      token: lockFileData.token,
    });
    return sessionInfo.myTeam.map((player: { gameName: string; tagLine?: string }) => ({
      name: player.gameName,
      tag: player.tagLine ?? "UNKNOWN",
    }));

  } catch (error) {
    console.warn("Failed to fetch session info:", error);
  }
}

/**
 * Checks if it's the correct time to perform an action (ban or pick).
 * @param lockFileData Object with port and token.
 * @param type The type of action to check for ("ban" or "pick").
 * @returns {Promise<IsTimeResponse>} Object indicating if it's time and the action ID.
 */
async function isTime(lockFileData: LockFileData, type: string): Promise<IsTimeResponse> {
  const sessionInfo: any = await invoke("session_info", {
    port: lockFileData.port,
    token: lockFileData.token,
  });

  const cellId = sessionInfo.localPlayerCellId;

  for (const group of sessionInfo.actions) {
    for (const action of group) {
      if (action.actorCellId === cellId && action.type === type && !action.completed) {
        console.log(`[#] It's time to ${type} a champion`);
        return {
          status: true,
          id: action.id,
        };
      }
    }
  }

  return {
    status: false,
    id: 0,
  };
}

/**
 * Attempts to perform a champion select action.
 * Retries with the next champions in the list if the first one is already banned.
 *
 * @param lockFileData Lockfile data containing port and token.
 * @param settings User settings including pick/ban champion lists.
 * @param action_id ID of the action to perform.
 * @param action_type Action type: "ban" or "pick".
 * @param champions Array of the current champions.
 */
async function sendChampion(
  lockFileData: LockFileData,
  settings: Record<string, any>,
  action_id: number,
  action_type: string,
  champions: Champion[],
) {
  const preferredChampions = action_type === "ban" ? settings.banChampions : settings.pickChampions;
  const tried = new Set<number>();

  for (let i = 0; i < preferredChampions.length; i++) {
    const championId = parseInt(preferredChampions[i].id);
    tried.add(championId);
    await randomDelay(1000, 2000);

    try {
      await invoke("perform_champ_select_action", {
        port: lockFileData.port,
        token: lockFileData.token,
        actionId: action_id,
        championId: championId,
        actionType: action_type,
      });

      console.log(`[+] Successfully performed ${action_type} with ${preferredChampions[i].name}`);
      return;
    } catch (error: any) {
      const message = String(error);
      console.warn(`[-] Failed to ${action_type} with ${preferredChampions[i].name}:`, message);

      if (!message.toLowerCase().includes("is not free to play, is not owned by account")) {
        return;
      }
    }
  }

  console.log(`[#] Trying random champions for ${action_type}...`);
  const shuffled = champions.sort(() => Math.random() - 0.5);

  for (const champion of shuffled) {
    const championId = parseInt(champion.id);
    if (tried.has(championId)) continue;
    tried.add(championId);
    await randomDelay(500, 1000);

    try {
      await invoke("perform_champ_select_action", {
        port: lockFileData.port,
        token: lockFileData.token,
        actionId: action_id,
        championId: championId,
        actionType: action_type,
      });

      console.log(`[+] Successfully performed ${action_type} with random champion ${champion.name}`);
      return;
    } catch (error: any) {
      const message = String(error);
      console.warn(`[-] Failed to ${action_type} with random champion ${champion.name}:`, message);

      if (!message.toLowerCase().includes("is not free to play, is not owned by account")) {
        return;
      }
    }
  }

  console.error(`[-] Could not ${action_type} with any champion, even random ones.`);
}

/**
 * Continuously monitors the League client state and updates UI / performs actions accordingly.
 * Prevents repeated ban/pick in the same ChampSelect session.
 * @param lockFileData Object with port and token.
 * @param settings JSON object with the current app settings.
 * @param champions Array of the current champions.
 */
export async function monitorGame(lockFileData: LockFileData, settings: Record<string, any>, champions: Champion[]): Promise<void> {
  const autoAcceptSwitch = document.getElementById("autoAcceptSwitch") as HTMLInputElement;
  const autoBanPickSwitch = document.getElementById("autoBanPickSwitch") as HTMLInputElement;
  const phase = await getGameflowPhase(lockFileData);
  if (!phase) return;

  // Reset flags when entering a new phase
  if (phase !== previousPhase) {
    if (phase === "ChampSelect") {
      banDone = false;
      pickDone = false;
    }
    previousPhase = phase;
  }

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
      if (!autoAcceptSwitch.checked) return;
      changeStatus(STATES.GAME_FOUND);
      togglePorofessorButton(false);
      console.log("Match found, accepting...");
      await acceptGame(lockFileData);
      break;

    case "ChampSelect":
      changeStatus(STATES.CHAMP_SELECT);
      togglePorofessorButton(true);

      if (autoBanPickSwitch.checked) {
        if (!banDone) {
          const isTimeToBanResponse = await isTime(lockFileData, "ban");

          if (isTimeToBanResponse.status) {
            banDone = true;
            await sendChampion(lockFileData, settings, isTimeToBanResponse.id, "ban", champions);
          }
        }

        if (!pickDone) {
          const isTimeToPickResponse = await isTime(lockFileData, "pick");

          if (isTimeToPickResponse.status) {
            pickDone = true;
            await sendChampion(lockFileData, settings, isTimeToPickResponse.id, "pick", champions);
          }
        }
      }

      console.log("In champion select");
      break;

    case "InProgress":
      changeStatus(STATES.IN_GAME);
      togglePorofessorButton(false);
      console.log("Game in progress");
      break;

    default:
      console.log("Unknown state:", phase);
      changeStatus(STATES.LOBBY_WAITING);
      togglePorofessorButton(false);
      break;
  }
}
