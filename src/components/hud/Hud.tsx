import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { SOLIDS, type Part } from "@/lib/catalog";
import { useStore, view } from "@/lib/store";

function Formula({ parts }: { parts: Part[] }) {
  return (
    <p className="font-display text-2xl leading-none text-gold">
      {parts.map((part, i) => {
        if (part.k === "sub") return <sub key={i}>{part.t}</sub>;
        if (part.k === "sup") return <sup key={i}>{part.t}</sup>;
        return <span key={i}>{part.t}</span>;
      })}
    </p>
  );
}

function Toggle({ pressed, label, onClick }: { pressed: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={
        pressed
          ? "h-11 rounded-full border border-gold px-3 text-sm text-gold"
          : "h-11 rounded-full border border-line px-3 text-sm text-muted"
      }
    >
      {label}
    </button>
  );
}

export function Hud() {
  const mode = useStore((s) => s.mode);
  const shape = useStore((s) => s.shape);
  const mol = useStore((s) => s.mol);
  const field = useStore((s) => s.field);
  const shell = useStore((s) => s.shell);
  const cage = useStore((s) => s.cage);
  const spin = useStore((s) => s.spin);
  const hover = useStore((s) => s.hover);
  const about = useStore((s) => s.about);
  const notes = useStore((s) => s.notes);
  const step = useStore((s) => s.step);
  const go = useStore((s) => s.go);
  const toggle = useStore((s) => s.toggle);
  const openMolecules = useStore((s) => s.openMolecules);
  const closeMolecules = useStore((s) => s.closeMolecules);
  const resetView = useStore((s) => s.resetView);
  const stripRef = useRef<HTMLDivElement>(null);

  const solid = SOLIDS[shape] ?? SOLIDS[0]!;
  const molecule = solid.molecules[mol] ?? solid.molecules[0]!;
  const index = mode === "shapes" ? shape : mol;
  const total = mode === "shapes" ? SOLIDS.length : solid.molecules.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (useStore.getState().about) useStore.getState().toggle("about");
        else if (useStore.getState().mode === "molecules") useStore.getState().closeMolecules();
        return;
      }
      if (useStore.getState().about) return;
      if (e.key === "ArrowRight") useStore.getState().step(1);
      if (e.key === "ArrowLeft") useStore.getState().step(-1);
      if (e.key === "Enter" && useStore.getState().mode === "shapes") useStore.getState().openMolecules();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const root = stripRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>("[data-active='true']");
    el?.scrollIntoView({
      behavior: view.reduce ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [mode, shape, mol]);

  return (
    <>
      <div className="scrim-top pointer-events-none absolute inset-x-0 top-0 z-10" />
      <div className="scrim-bottom pointer-events-none absolute inset-x-0 bottom-0 z-10" />

      <header className="safe-top safe-x pointer-events-none absolute inset-x-0 top-0 z-20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-2xl leading-none text-fg">Valence</p>
            <p className="mt-1 text-xs text-muted">Shells, orbitals, and Platonic solids</p>
          </div>
          <button
            type="button"
            className="pointer-events-auto h-11 rounded-full border border-line bg-surface/80 px-4 text-sm text-gold"
            onClick={() => toggle("about")}
          >
            About
          </button>
        </div>
      </header>

      <button
        type="button"
        aria-label={mode === "shapes" ? "Previous shape" : "Previous molecule"}
        className="absolute top-24 left-3 z-20 grid size-11 place-items-center rounded-full border border-line bg-surface/80 text-fg"
        onClick={() => step(-1)}
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={mode === "shapes" ? "Next shape" : "Next molecule"}
        className="absolute top-24 right-3 z-20 grid size-11 place-items-center rounded-full border border-line bg-surface/80 text-fg"
        onClick={() => step(1)}
      >
        <ChevronRight aria-hidden="true" />
      </button>

      <footer className="safe-bot safe-x pointer-events-none absolute inset-x-0 bottom-0 z-20">
        <div ref={stripRef} className="filmstrip pointer-events-auto mb-3 flex items-center gap-2" aria-label={mode === "shapes" ? "Shapes" : "Molecules"}>
          {mode === "molecules" && (
            <button
              type="button"
              className="h-11 shrink-0 rounded-full border border-line px-3 text-sm text-gold"
              onClick={closeMolecules}
            >
              All shapes
            </button>
          )}
          {mode === "shapes"
            ? SOLIDS.map((item, i) => {
                const prev = SOLIDS[i - 1];
                const showFamily = !prev || prev.family !== item.family;
                return (
                  <span key={item.id} className="flex shrink-0 items-center gap-2">
                    {showFamily && (
                      <span className="px-1 text-xs tracking-widest text-gold uppercase">
                        {item.family === "Platonic solid"
                          ? "Platonic"
                          : item.family === "Domain geometry"
                            ? "Domains"
                            : "Polyhedra"}
                      </span>
                    )}
                    <button
                      type="button"
                      data-active={i === shape}
                      className={
                        i === shape
                          ? "h-11 rounded-full border border-gold px-3 text-sm whitespace-nowrap text-fg"
                          : "h-11 rounded-full border border-line px-3 text-sm whitespace-nowrap text-muted"
                      }
                      onClick={() => go(i)}
                    >
                      {item.name}
                    </button>
                  </span>
                );
              })
            : solid.molecules.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  data-active={i === mol}
                  className={
                    i === mol
                      ? "h-11 shrink-0 rounded-full border border-gold px-3 text-sm whitespace-nowrap text-fg"
                      : "h-11 shrink-0 rounded-full border border-line px-3 text-sm whitespace-nowrap text-muted"
                  }
                  onClick={() => go(i)}
                >
                  {item.name}
                </button>
              ))}
        </div>

        <div className="pointer-events-auto rounded-2xl border border-line bg-surface/90 p-4 backdrop-blur-md">
          <p className="text-xs tracking-widest text-gold uppercase">
            {mode === "shapes" ? solid.family : solid.name}
            <span className="text-muted">
              {" "}
              · {index + 1} / {total}
            </span>
          </p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <h1 className="font-display text-2xl leading-none text-fg md:text-3xl">
              {mode === "shapes" ? solid.name : molecule.name}
            </h1>
            {mode === "molecules" && <Formula parts={molecule.parts} />}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-fg">
            {mode === "shapes" ? solid.summary : molecule.blurb}
          </p>
          {hover && <p className="mt-1 text-sm text-tide">{hover}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
              {mode === "shapes" ? solid.symmetry : molecule.symmetry}
            </span>
            <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
              {mode === "shapes" ? solid.hybrid : molecule.detail}
            </span>
            <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
              {mode === "shapes" ? solid.angle : `${solid.v} vertices`}
            </span>
          </div>

          {notes && (
            <div className="sheet-scroll mt-3 space-y-3">
              <p className="text-sm leading-relaxed text-muted">
                {mode === "shapes" ? solid.quantum : molecule.note}
              </p>
              {mode === "shapes" && solid.grid && (
                <p className="text-sm leading-relaxed text-tide">{solid.grid}</p>
              )}
              {mode === "shapes" && solid.f != null && (
                <p className="text-xs text-muted">
                  {solid.v} vertices · {solid.e} edges · {solid.f} faces
                </p>
              )}
            </div>
          )}

          <div className="filmstrip mt-3 flex gap-2">
            <Toggle pressed={field} label="Field" onClick={() => toggle("field")} />
            <Toggle pressed={shell} label="Shell" onClick={() => toggle("shell")} />
            {mode === "molecules" && <Toggle pressed={cage} label="Cage" onClick={() => toggle("cage")} />}
            <Toggle pressed={spin} label="Spin" onClick={() => toggle("spin")} />
            <Toggle pressed={notes} label="Notes" onClick={() => toggle("notes")} />
            <button
              type="button"
              aria-label="Reset view"
              className="grid size-11 place-items-center rounded-full border border-line text-muted"
              onClick={resetView}
            >
              <RotateCcw aria-hidden="true" className="size-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {mode === "shapes" ? (
              <button
                type="button"
                className="h-11 rounded-full bg-gold px-4 text-sm text-ink"
                onClick={openMolecules}
              >
                Show molecules
              </button>
            ) : (
              <button
                type="button"
                className="h-11 rounded-full bg-gold px-4 text-sm text-ink"
                onClick={closeMolecules}
              >
                Back to shapes
              </button>
            )}
            <p className="text-xs text-muted">Drag turns · pinch or scroll zooms · swipe or arrows move</p>
          </div>
          {field && (mode === "shapes" ? solid.nodal : molecule.lobes.some((l) => l.phase < 0)) && (
            <p className="mt-2 text-xs text-muted">
              <span className="text-gold">Gold</span> and <span className="text-tide">tide</span> are opposite
              phases of one orbital. The dim discs are nodes, where probability is zero.
            </p>
          )}
        </div>
      </footer>

      {about && (
        <div className="safe-top safe-bot safe-x absolute inset-0 z-30 overflow-auto bg-ink/95">
          <div className="mx-auto max-w-xl py-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-4xl leading-none text-fg">Why these solids</h2>
              <button
                type="button"
                className="h-11 rounded-full border border-line px-4 text-sm text-gold"
                onClick={() => toggle("about")}
              >
                Close
              </button>
            </div>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-fg">
              <p>
                A valence shell is not a track an electron runs on. In the quantum picture the electron is a
                standing wave. The principal number n sets how far out the radial probability peaks. The angles
                come from how those waves interfere. Draw the surface where the probability is constant and you
                get the orbital pictures from a textbook. That surface is an isosurface of |ψ|².
              </p>
              <p>
                Put several valence domains on one atom and they settle as far apart as they can. Two domains
                make a line. Three, a triangle. Four, a tetrahedron. Five cannot make a Platonic solid, so they
                compromise on a trigonal bipyramid. Six prefer an octahedron. The five Platonic solids are the
                only convex regular polyhedra, and three of them — tetrahedron, octahedron, cube — are ordinary
                coordination shapes. The icosahedron and dodecahedron show up as cages.
              </p>
              <p>
                The sequence here starts with those five, then the other polyhedra atoms actually use: the
                bipyramids, the prism tungsten hexamethyl prefers over an octahedron, the square antiprism of
                eight-coordinate fluorides, the cuboctahedron of a copper atom’s twelve neighbors, and the
                truncated icosahedron of C₆₀.
              </p>
              <p className="text-tide">
                The 7-11-12 grids lesson treats the same solids as a geometric language. It pictures the human
                collective as a tetrahedron, the Earth grid as a cube that contains the merkaba, and the Sun as
                an octahedron. Turn on Field while the cube is in front: the gold and tide tetrahedra are that
                merkaba, and their eight corners are the cube’s eight corners. Metatron’s cube is named in that
                lesson as the figure that contains all five Platonic solids. This instrument does not try to
                prove that teaching. It sets the same shapes next to the probability fields and the molecules
                where the geometry is measured.
              </p>
              <p>
                Field draws the lobes. On the octahedron they are the three p orbitals — opposite phases, and a
                node through the nucleus. On methane they are the four sp³ hybrids pointing at the hydrogens.
                Shell draws the radial ridge those lobes sit on, not a hard surface. Cage, on a molecule, draws
                the polyhedron the nuclei are tracing.
              </p>
              <p className="text-muted">
                Idealized geometries. Gas-phase PCl₅ is the bipyramid; the solid salt is not. IF₇ puckers a
                little. W(CH₃)₆ is slightly distorted and still not an octahedron. The Sun, Earth, and human
                assignments are from the grids lesson of Universal Consciousness by Douglas Butner, not from the
                Schrödinger equation.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
