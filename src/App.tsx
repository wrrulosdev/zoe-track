import "./App.css";
import AppSection from "./components/AppSection";
import MainHeader from "./components/header/MainHeader";

function App() {
  return (
    <main className="container">
      <MainHeader />

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
          title="SoloQ Lobby Usernames"
          description="Show the hidden usernames of your team"
          showSwitch={true}
        />
      </section>

      <footer>
        <span>ZoeTrack v1.0.0</span>
      </footer>
    </main>
  );
}

export default App;
