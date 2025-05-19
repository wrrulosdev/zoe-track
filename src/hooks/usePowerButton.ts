import { useEffect, useRef, useState } from "react";
import { STATES } from "../constants/states";
import { changeStatus, changePowerButtonColor } from "./ui";
import { isLolRunning, monitorGame, readLockFile } from "./lcu";

/**
 * Lockfile data used for authenticated requests to the League client.
 */
interface LockFileData {
  port: number;
  token: string;
}

/**
 * Custom hook to handle power button logic.
 *
 * @returns An object containing the activation state and a toggle function.
 */
export function usePowerButton() {
  const [isActive, setIsActive] = useState(false);
  const monitorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const lockFileRef = useRef<LockFileData | null>(null);

  /**
   * Toggles the power state and handles related logic.
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
    changeStatus(STATES.WAITING);

    const gameRunning = await isLolRunning();

    if (!gameRunning) {
      return;
    }

    const lockFileData = await readLockFile();

    if (!lockFileData) {
      return;
    }

    lockFileRef.current = lockFileData;

    monitorIntervalRef.current = setInterval(() => {
      if (lockFileRef.current) {
        monitorGame(lockFileRef.current);
      }
    }, 1000);
  };

  useEffect(() => {
    setIsActive(false);
    changePowerButtonColor(false);
    changeStatus(STATES.INACTIVE);

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
        monitorIntervalRef.current = null;
      }

      window.removeEventListener("keydown", blockReload);
    };
  }, []);

  return { isActive, togglePower };
}
