import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ChampionProvider } from "./contexts/ChampionContext";
//import {updaterManager} from "./services/updater.ts";

document.addEventListener('contextmenu', event => {
    event.preventDefault();
});

document.addEventListener('DOMContentLoaded', async _ => {
    //await updaterManager()
})

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChampionProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChampionProvider>
  </React.StrictMode>
);
