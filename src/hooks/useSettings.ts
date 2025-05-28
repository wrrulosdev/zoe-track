import { useEffect, useState } from "react";
import {
  readTextFile,
  writeTextFile,
  exists,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";

interface Champion {
  id: string;
  name: string;
}

export interface Settings {
  region: string;
  lolPath: string;
  banChampions: Champion[];
  pickChampions: Champion[];
}

const DEFAULT_SETTINGS: Settings = {
  region: "NA",
  lolPath: "C:\\Riot Games\\League of Legends",
  banChampions: [],
  pickChampions: [],
};

/**
 * Custom React hook to manage the user settings,
 * including loading from and saving to local filesystem.
 *
 * @returns An object containing settings state, setter, and loading status.
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const SETTINGS_FILE = "settings.json";

  // Load settings from file system when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const fileExists = await exists(SETTINGS_FILE, {
          baseDir: BaseDirectory.AppLocalData,
        });

        if (fileExists) {
          const content = await readTextFile(SETTINGS_FILE, {
            baseDir: BaseDirectory.AppLocalData,
          });
          const parsed = JSON.parse(content);
          const migratedSettings = migrateOldSettings(parsed);
          setSettings({ ...DEFAULT_SETTINGS, ...migratedSettings });
        } else {
          await writeTextFile(
              SETTINGS_FILE,
              JSON.stringify(DEFAULT_SETTINGS, null, 2),
              { baseDir: BaseDirectory.AppLocalData }
          );
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  /**
   * Converts old settings format where champions were saved as strings
   * into the new format where champions are objects with id and name.
   *
   * @param oldSettings The previously saved settings object (possibly outdated format)
   * @returns Settings object with champions arrays properly formatted as objects
   */
  const migrateOldSettings = (oldSettings: any): Settings => {
    const migrated = { ...oldSettings };

    if (
        Array.isArray(oldSettings.banChampions) &&
        oldSettings.banChampions.length > 0 &&
        typeof oldSettings.banChampions[0] === "string"
    ) {
      migrated.banChampions = oldSettings.banChampions.map((name: string) => ({
        id: name.toLowerCase().replace(/\s+/g, ""), // generate ID from name
        name,
      }));
    }

    if (
        Array.isArray(oldSettings.pickChampions) &&
        oldSettings.pickChampions.length > 0 &&
        typeof oldSettings.pickChampions[0] === "string"
    ) {
      migrated.pickChampions = oldSettings.pickChampions.map((name: string) => ({
        id: name.toLowerCase().replace(/\s+/g, ""),
        name,
      }));
    }

    return migrated;
  };

  useEffect(() => {
    if (!loading) {
      const saveSettings = async () => {
        try {
          await writeTextFile(
              SETTINGS_FILE,
              JSON.stringify(settings, null, 2),
              { baseDir: BaseDirectory.AppLocalData }
          );
        } catch (error) {
          console.error("Error saving settings:", error);
        }
      };

      saveSettings();
    }
  }, [settings, loading]);

  return { settings, setSettings, loading };
}
