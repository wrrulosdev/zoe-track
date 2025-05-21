import { useEffect, useState, useContext } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { ChampionContext } from "../../contexts/ChampionContext";
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
  const [region, setRegion] = useState("NA");
  const [lolPath, setLolPath] = useState("C:\\Riot Games\\League of Legends");
  const [banChampions, setBanChampions] = useState<string[]>([]);
  const [pickChampions, setPickChampions] = useState<string[]>([]);
  const { champions } = useContext(ChampionContext);

  useEffect(() => {
    const resizeWindow = async () => {
      await getCurrentWindow().setSize(new LogicalSize(500, 500));
    };
    resizeWindow();
  }, []);

  const handleAddChampion = (
    champion: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!list.includes(champion) && list.length < 3) {
      setList([...list, champion]);
    }
  };

  const handleRemoveChampion = (
    champion: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList((prev) => prev.filter((c) => c !== champion));
  };

  return (
    <main className="settings-container">
      <h1>Configuration</h1>
      <hr />

      <section className="config">
        <div className="setting">
          <label>Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
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
            value={lolPath}
            onChange={(e) => setLolPath(e.target.value)}
            placeholder="C:\\Riot Games\\League of Legends"
          />
        </div>

        <div className="setting">
          <label>Ban Champions (max 3)</label>
          <div className="champion-list">
            {banChampions.map((champion) => (
              <span key={champion} className="champion-badge">
                {champion}
                <button
                  onClick={() =>
                    handleRemoveChampion(champion, setBanChampions)
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>{" "}
                </button>
              </span>
            ))}
          </div>
          {banChampions.length < 3 && (
            <select
              onChange={(e) =>
                handleAddChampion(e.target.value, banChampions, setBanChampions)
              }
              value=""
            >
              <option value="">Select Champion</option>
              {champions
                .filter((c) => !banChampions.includes(c))
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
            {pickChampions.map((champion) => (
              <span key={champion} className="champion-badge">
                {champion}
                <button
                  onClick={() =>
                    handleRemoveChampion(champion, setPickChampions)
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>{" "}
                </button>
              </span>
            ))}
          </div>
          {pickChampions.length < 3 && (
            <select
              onChange={(e) =>
                handleAddChampion(
                  e.target.value,
                  pickChampions,
                  setPickChampions
                )
              }
              value=""
            >
              <option value="">Select Champion</option>
              {champions
                .filter((c) => !pickChampions.includes(c))
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
