import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Hud } from "@/components/hud/Hud";
import { Stage } from "@/components/stage/Stage";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(true), []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink text-fg">
      {on ? <Stage /> : <div className="absolute inset-0 bg-ink" aria-hidden="true" />}
      <Hud />
    </main>
  );
}
