import { useEffect, useState } from "react";
import {
  readTextFile,
  writeTextFile,
  exists,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";

// Defines the structure of the settings object
interface Settings {
  region: string;
  lolPath: string;
  banChampions: string[];
  pickChampions: string[];
}

// Default settings used when no configuration file is found
const DEFAULT_SETTINGS: Settings = {
  region: "NA",
  lolPath: "C:\\Riot Games\\League of Legends",
  banChampions: [],
  pickChampions: [],
};

// Custom Hook to manage settings persistence
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const SETTINGS_FILE = "settings.json";

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      const contents = JSON.stringify({ notifications: true });
      console.log(44)
      await writeTextFile('config.json', contents, {
        baseDir: BaseDirectory.AppData,
        append: true
      });

      try {
        const fileExists = await exists(SETTINGS_FILE, {
          baseDir: BaseDirectory.AppLocalData,
        });

        if (fileExists) {
          const content = await readTextFile(SETTINGS_FILE, {
            baseDir: BaseDirectory.AppLocalData,
          });
          const parsed = JSON.parse(content);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
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

  // Automatically save settings whenever they change and loading is complete
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
