import { StrictMode } from "react";
import TopBar from "./components/TopBar";
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <StrictMode>
      <div className="min-h-screen bg-white text-gray-800 font-sans">
        <TopBar />
        <main className="max-w-6xl mx-auto px-4 py-4">
          <Outlet />
        </main>
      </div>
    </StrictMode>
  );
}
