import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ChampionProvider } from "./contexts/ChampionContext";

import { check } from '@tauri-apps/plugin-updater';

async function verificarActualizaciones() {
    // @ts-ignore
    const { shouldUpdate, manifest } = await check();
    if (shouldUpdate) {
        console.log(`Nueva versión disponible: ${manifest?.version}`);
        //await install();
    } else {
        console.log("La aplicación está actualizada.");
    }
}

document.addEventListener('contextmenu', _ => {
    verificarActualizaciones()
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChampionProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChampionProvider>
  </React.StrictMode>
);
