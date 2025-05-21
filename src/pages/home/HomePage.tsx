import "./Home.css";
import AppSection from "../../components/home/AppSection";
import MainHeader from "../../components/header/MainHeader";
import { usePowerButton } from "../../hooks/usePowerButton";
import { getUsernamesInLobby } from "../../hooks/lcu";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { useEffect } from "react";

function Home() {
  const { togglePower, lockFileData } = usePowerButton();

  const handlePorofessorClick = async () => {
    if (!lockFileData) {
      console.warn("Lockfile not loaded!");
      return;
    }

    const users = await getUsernamesInLobby(lockFileData);
    console.log(users);
    const userTags = users
      .map((user) => `${user.name}-${user.tag}`)
      .map((str) => encodeURIComponent(str))
      .join(",");
    console.log(userTags);

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
        />
        <AppSection
          title="Auto-ban & pick"
          description="Automatically pick and ban champions"
          showSwitch={true}
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
