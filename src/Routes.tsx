import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/HomePage";
import TestPopup from "./test";

export default function RoutesConfig() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lobby-usernames" element={<TestPopup />} />
    </Routes>
  );
}
