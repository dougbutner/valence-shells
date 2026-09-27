import { create } from "zustand";
import { SOLIDS } from "@/lib/catalog";
import { modulo } from "@/lib/geom";

export const view = {
  yaw: 0.64,
  pitch: 0.26,
  zoom: 1,
  shown: 0,
  target: 0,
  dragging: false,
  moved: false,
  reduce: false,
};

export type Mode = "shapes" | "molecules";
type ToggleKey = "field" | "shell" | "cage" | "spin" | "notes" | "about";

type Store = {
  mode: Mode;
  shape: number;
  mol: number;
  field: boolean;
  shell: boolean;
  cage: boolean;
  spin: boolean;
  hover: string | null;
  about: boolean;
  notes: boolean;
  step: (dir: number) => void;
  go: (index: number) => void;
  openMolecules: () => void;
  closeMolecules: () => void;
  toggle: (key: ToggleKey) => void;
  setHover: (el: string | null) => void;
  resetView: () => void;
};

function countOf(mode: Mode, shape: number): number {
  return mode === "shapes" ? SOLIDS.length : SOLIDS[shape]!.molecules.length;
}

function jumpTo(index: number, n: number) {
  let k = modulo(index, n);
  const cur = view.target;
  while (k < cur - n / 2) k += n;
  while (k > cur + n / 2) k -= n;
  view.target = k;
}

export const useStore = create<Store>((set, get) => ({
  mode: "shapes",
  shape: 0,
  mol: 0,
  field: true,
  shell: true,
  cage: true,
  spin: true,
  hover: null,
  about: false,
  notes: false,
  step: (dir) => {
    view.target += dir;
  },
  go: (index) => {
    const { mode, shape } = get();
    jumpTo(index, countOf(mode, shape));
  },
  openMolecules: () => {
    view.shown = 0;
    view.target = 0;
    view.zoom = 1;
    view.yaw = 0.64;
    view.pitch = 0.26;
    set({ mode: "molecules", mol: 0, hover: null, notes: false });
  },
  closeMolecules: () => {
    const shape = get().shape;
    view.shown = shape;
    view.target = shape;
    view.zoom = 1;
    set({ mode: "shapes", hover: null, notes: false });
  },
  toggle: (key) => {
    const current = get()[key];
    set({ [key]: !current });
  },
  setHover: (hover) => set({ hover }),
  resetView: () => {
    view.yaw = 0.64;
    view.pitch = 0.26;
    view.zoom = 1;
  },
}));
