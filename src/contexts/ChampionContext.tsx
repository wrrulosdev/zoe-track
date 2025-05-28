import { createContext, useEffect, useState, ReactNode } from "react";

export interface Champion {
  id: string;
  name: string;
}

interface ChampionContextType {
  champions: Champion[];
  version: string;
}

export const ChampionContext = createContext<ChampionContextType>({
  champions: [],
  version: "",
});

/**
 * ChampionProvider component that fetches and provides
 * the list of champions and the current patch version.
 *
 * @param {ReactNode} children - React children components consuming this context
 */
export const ChampionProvider = ({ children }: { children: ReactNode }) => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [version, setVersion] = useState("");

  useEffect(() => {
    const fetchLatestVersion = async () => {
      try {
        const response = await fetch(
            "https://ddragon.leagueoflegends.com/api/versions.json"
        );
        const versions = await response.json();
        console.log(versions[0]);
        return versions[0];
      } catch (error) {
        console.error("Failed to fetch latest version:", error);
        return "15.10.1";
      }
    };

    const fetchChampions = async () => {
      try {
        const latestVersion = await fetchLatestVersion();
        setVersion(latestVersion);

        const response = await fetch(
            `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
        );
        const data = await response.json();
        const championData = Object.values(data.data) as any[];
        const formattedChampions = championData.map((champ) => ({
          id: champ.key,
          name: champ.name,
        }));

        setChampions(formattedChampions);
      } catch (error) {
        console.error("Failed to fetch champions:", error);
      }
    };

    fetchChampions();
  }, []);

  return (
      <ChampionContext.Provider value={{ champions, version }}>
        {children}
      </ChampionContext.Provider>
  );
};
