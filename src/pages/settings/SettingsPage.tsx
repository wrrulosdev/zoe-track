import { useEffect, useContext } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { ChampionContext, type Champion } from "../../contexts/ChampionContext";
import { useSettings, type Settings } from "../../hooks/useSettings";
import "./SettingsPage.css";

const regions = [
  "NA",
  "EUW",
  "EUNE",
  "LAN",
  "LAS",
  "BR",
  "OCE",
  "KR",
  "JP",
  "RU",
  "TR",
];

function SettingsPage() {
  const { champions } = useContext(ChampionContext);
  const { settings, setSettings } = useSettings();

  useEffect(() => {
    getCurrentWindow().setSize(new LogicalSize(500, 500));
  }, []);

  const updateSettings = (newValues: Partial<Settings>) => {
    setSettings({ ...settings, ...newValues } as Settings);
  };

  /**
   * Add a champion to either ban or pick list, max 3 allowed.
   * Does nothing if the list is already full or champion doesn't exist.
   */
  const handleAddChampion = (
      championName: string,
      list: Champion[],
      key: "banChampions" | "pickChampions"
  ) => {
    if (list.length >= 3) return;
    const champion = champions.find((c) => c.name === championName);
    if (!champion) return;

    if (!list.some((c) => c.id === champion.id)) {
      updateSettings({ [key]: [...list, champion] });
    }
  };

  /**
   * Remove a champion from either ban or pick list by its ID
   */
  const handleRemoveChampion = (
      championId: string,
      key: "banChampions" | "pickChampions"
  ) => {
    updateSettings({
      [key]: settings[key].filter((c) => c.id !== championId),
    });
  };

  return (
      <main className="settings-container">
        <h1>Configuration</h1>
        <hr />

        <section className="config">
          <div className="setting">
            <label>Region</label>
            <select
                value={settings.region}
                onChange={(e) => updateSettings({ region: e.target.value })}
            >
              {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
              ))}
            </select>
          </div>

          <div className="setting">
            <label>LoL Installation Path</label>
            <input
                type="text"
                value={settings.lolPath}
                onChange={(e) => updateSettings({ lolPath: e.target.value })}
            />
          </div>

          <div className="setting">
            <label>Ban Champions (max 3)</label>
            <div className="champion-list">
              {settings.banChampions.map((champion) => (
                  <span key={champion.id} className="champion-badge">
                {champion.name}
                    <button
                        onClick={() =>
                            handleRemoveChampion(champion.id, "banChampions")
                        }
                    >
                  ✕
                </button>
              </span>
              ))}
            </div>
            {settings.banChampions.length < 3 && (
                <select
                    onChange={(e) =>
                        handleAddChampion(
                            e.target.value,
                            settings.banChampions,
                            "banChampions"
                        )
                    }
                    value=""
                >
                  <option value="">Select Champion</option>
                  {champions
                      .filter(
                          (c) => !settings.banChampions.some((bc) => bc.id === c.id)
                      )
                      .map((champion) => (
                          <option key={champion.id} value={champion.name}>
                            {champion.name}
                          </option>
                      ))}
                </select>
            )}
          </div>

          <div className="setting">
            <label>Pick Champions (max 3)</label>
            <div className="champion-list">
              {settings.pickChampions.map((champion) => (
                  <span key={champion.id} className="champion-badge">
                {champion.name}
                    <button
                        onClick={() => handleRemoveChampion(champion.id, "pickChampions")}
                    >
                  ✕
                </button>
              </span>
              ))}
            </div>
            {settings.pickChampions.length < 3 && (
                <select
                    onChange={(e) =>
                        handleAddChampion(
                            e.target.value,
                            settings.pickChampions,
                            "pickChampions"
                        )
                    }
                    value=""
                >
                  <option value="">Select Champion</option>
                  {champions
                      .filter(
                          (c) => !settings.pickChampions.some((pc) => pc.id === c.id)
                      )
                      .map((champion) => (
                          <option key={champion.id} value={champion.name}>
                            {champion.name}
                          </option>
                      ))}
                </select>
            )}
          </div>
        </section>
      </main>
  );
}

export default SettingsPage;
