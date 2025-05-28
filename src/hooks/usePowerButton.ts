import {useContext, useEffect, useRef, useState} from "react";
import { STATES } from "../constants/states";
import {
  changeStatus,
  changePowerButtonColor,
  togglePorofessorButton,
} from "../ui/updateStatusUI.ts";
import { isLolRunning, monitorGame, readLockFile } from "../services/leagueClient.ts";
import {useSettings} from "./useSettings.ts";
import {ChampionContext} from "../contexts/ChampionContext.tsx";

/**
 * Represents the parsed contents of League of Legends' `lockfile`,
 * which is required to authenticate and communicate with the local client API.
 */
export interface LockFileData {
  port: number;
  token: string;
}

/**
 * Custom React hook for handling the behavior of the application's power button.
 *
 * This hook manages the state for activating/deactivating the tool, sets up monitoring
 * of the League of Legends client when active, and ensures UI elements update accordingly.
 *
 * @returns An object containing:
 * - `togglePower`: Function to activate or deactivate the tool.
 * - `lockFileData`: The current lockfile data used to connect with the LoL client API, if available.
 */
export function usePowerButton() {
  const { settings } = useSettings();
  const { champions } = useContext(ChampionContext);
  const [isActive, setIsActive] = useState(false);
  const [lockFileData, setLockFileData] = useState<LockFileData | null>(null);
  const monitorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  /**
   * Toggles the power state of the tool. When activated, it attempts to detect
   * the running game client, reads the lockfile, and begins monitoring the game.
   * When deactivated, it stops monitoring and resets UI state.
   */
  const togglePower = async () => {
    const nextState = !isActive;
    setIsActive(nextState);

    if (!nextState) {
      changePowerButtonColor(false);
      changeStatus(STATES.INACTIVE);
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = null;
      }
      return;
    }

    changePowerButtonColor(true);
    changeStatus(STATES.CLIENT_WAITING);

    monitorIntervalRef.current = setInterval(async () => {
      const gameRunning = await isLolRunning();
      if (!gameRunning) return;

      const data = await readLockFile(settings.lolPath);
      if (!data) return;

      setLockFileData(data);

      if (data) {
        await monitorGame(data, settings, champions);
      }
    }, 1000);
  };

  useEffect(() => {
    setIsActive(false);
    setLockFileData(null);
    changePowerButtonColor(false);
    changeStatus(STATES.INACTIVE);
    togglePorofessorButton(false);

    const blockReload = (e: KeyboardEvent) => {
      if (
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", blockReload);

    return () => {
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
      }
      window.removeEventListener("keydown", blockReload);
    };
  }, []);

  return {
    togglePower,
    lockFileData,
  };
}
