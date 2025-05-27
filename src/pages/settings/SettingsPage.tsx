import { useEffect, useContext } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { ChampionContext } from "../../contexts/ChampionContext";
import { useSettings } from "../../hooks/useSettings";
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

  const updateSettings = (newValues: Partial<typeof settings>) => {
    setSettings({ ...settings, ...newValues });
  };

  const handleAddChampion = (
    champion: string,
    list: string[],
    key: "banChampions" | "pickChampions"
  ) => {
    if (!list.includes(champion) && list.length < 3) {
      updateSettings({ [key]: [...list, champion] });
    }
  };

  const handleRemoveChampion = (
    champion: string,
    key: "banChampions" | "pickChampions"
  ) => {
    updateSettings({
      [key]: settings[key].filter((c) => c !== champion),
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
              <span key={champion} className="champion-badge">
                {champion}
                <button
                  onClick={() => handleRemoveChampion(champion, "banChampions")}
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
                .filter((c) => !settings.banChampions.includes(c))
                .map((champion) => (
                  <option key={champion} value={champion}>
                    {champion}
                  </option>
                ))}
            </select>
          )}
        </div>

        <div className="setting">
          <label>Pick Champions (max 3)</label>
          <div className="champion-list">
            {settings.pickChampions.map((champion) => (
              <span key={champion} className="champion-badge">
                {champion}
                <button
                  onClick={() =>
                    handleRemoveChampion(champion, "pickChampions")
                  }
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
                .filter((c) => !settings.pickChampions.includes(c))
                .map((champion) => (
                  <option key={champion} value={champion}>
                    {champion}
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
