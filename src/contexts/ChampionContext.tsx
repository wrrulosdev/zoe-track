import { createContext, useEffect, useState, ReactNode } from "react";

interface ChampionContextType {
  champions: string[];
}

export const ChampionContext = createContext<ChampionContextType>({
  champions: [],
});

export const ChampionProvider = ({ children }: { children: ReactNode }) => {
  const [champions, setChampions] = useState<string[]>([]);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const response = await fetch(
          "https://ddragon.leagueoflegends.com/cdn/14.10.1/data/en_US/champion.json"
        );
        const data = await response.json();
        const championNames = Object.keys(data.data);
        setChampions(championNames);
      } catch (error) {
        console.error("Failed to fetch champions:", error);
      }
    };

    fetchChampions();
  }, []);

  return (
    <ChampionContext.Provider value={{ champions }}>
      {children}
    </ChampionContext.Provider>
  );
};
