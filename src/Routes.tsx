import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/HomePage";
import SettingsPage from "./pages/settings/SettingsPage";

export default function RoutesConfig() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
