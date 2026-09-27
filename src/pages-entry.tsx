import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Hud } from "@/components/hud/Hud";
import { Stage } from "@/components/stage/Stage";
import "./styles.css";

function App() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink text-fg">
      <Stage />
      <Hud />
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
