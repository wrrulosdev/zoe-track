import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ChampionProvider } from "./contexts/ChampionContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChampionProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChampionProvider>
  </React.StrictMode>
);
