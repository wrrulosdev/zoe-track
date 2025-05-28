import "./Home.css";
import AppSection from "../../components/home/AppSection";
import MainHeader from "../../components/header/MainHeader";
import { usePowerButton } from "../../hooks/usePowerButton";
import { getUsernamesInLobby } from "../../services/leagueClient.ts";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { useEffect } from "react";

function Home() {
  // Custom hook to manage the power button state and lockfile data
  const { togglePower, lockFileData } = usePowerButton();

  /**
   * Handler for the Porofessor button click.
   * Retrieves usernames in lobby and opens Porofessor overlay with them.
   */
  const handlePorofessorClick = async () => {
    if (!lockFileData) {
      console.warn("Lockfile not loaded!");
      return;
    }

    const users: { name: string; tag: string }[] | undefined = await getUsernamesInLobby(lockFileData);
    if (!users) return;

    const userTags = users
        .map((user: { name: string; tag: string }) => `${user.name}-${user.tag}`)
        .map((str: string) => encodeURIComponent(str))
        .join(",");
    await invoke("open_porofessor", { region: "las", players: userTags });
  };

  useEffect(() => {
    const resizeWindow = async () => {
      await getCurrentWindow().setSize(new LogicalSize(400, 400));
    };
    resizeWindow();
  }, []);

  return (
      <main className="container">
        <MainHeader togglePower={togglePower} />

        <section className="app-content">
          <AppSection
              title="State"
              description="Status text"
              showSwitch={false}
              enabled={false}
          />
          <AppSection
              title="Auto-accept"
              description="Automatically accept games"
              showSwitch={true}
              idSwitch="autoAcceptSwitch"
          />
          <AppSection
              title="Auto-ban & pick"
              description="Automatically pick and ban champions"
              showSwitch={true}
              idSwitch="autoBanPickSwitch"
          />
          <AppSection
              title="Lobby Usernames"
              description="Show the usernames of your team"
              showPorofessorButton={true}
              onPorofessorClick={handlePorofessorClick}
          />
        </section>

        <footer>
          <span>Zoe v1.0.0</span>
        </footer>
      </main>
  );
}

export default Home;
