import {
  perpendicular,
  polyAntiprism,
  polyBucky,
  polyCube,
  polyCubocta,
  polyDodeca,
  polyIcosa,
  polyLinear,
  polyOcta,
  polyPbp,
  polyPrism,
  polySquarePyramid,
  polyTbp,
  polyTetra,
  polyTrigonal,
  polyTricapped,
  scaleVerts,
  vadd,
  vcross,
  vnorm,
  vscale,
  type Edge,
  type Poly,
  type Vec3,
} from "@/lib/geom";

export type Part = { t: string; k?: "sub" | "sup" };
export type Atom = { el: string; at: Vec3 };
export type Lobe = { dir: Vec3; phase: 1 | -1; reach: number };

export type Molecule = {
  id: string;
  name: string;
  parts: Part[];
  blurb: string;
  note: string;
  symmetry: string;
  detail: string;
  atoms: Atom[];
  bonds: Edge[];
  atomScale: number;
  bondRadius: number;
  guide: Vec3[];
  guideEdges: Edge[];
  lobes: Lobe[];
  shellRadius: number;
};

export type Solid = {
  id: string;
  name: string;
  family: "Platonic solid" | "Domain geometry" | "Atomic polyhedron";
  v: number;
  e: number;
  f: number | null;
  symmetry: string;
  hybrid: string;
  angle: string;
  summary: string;
  quantum: string;
  grid?: string;
  poly: Poly;
  /** Draw the two dual tetrahedra inside the cube when Field is on. */
  merkaba: boolean;
  /** p-orbital pair coloring and nodal discs (octahedron). */
  nodal: boolean;
  nucleus: boolean;
  lobes: Lobe[];
  shellRadius: number;
  molecules: Molecule[];
};

const tx = (t: string): Part => ({ t });
const sub = (t: string): Part => ({ t, k: "sub" });
const sup = (t: string): Part => ({ t, k: "sup" });

function lobesFrom(verts: Vec3[], reach: number, phase: "hybrid" | "p"): Lobe[] {
  return verts.map((dir) => {
    const s = dir[0] + dir[1] + dir[2];
    return {
      dir,
      phase: phase === "p" ? (s >= 0 ? 1 : -1) : 1,
      reach,
    };
  });
}

function inherited(solidLobes: Lobe[], reach: number): Lobe[] {
  if (solidLobes.length === 0 || solidLobes.length > 8) return [];
  return solidLobes.map((l) => ({ ...l, reach }));
}

function central(opts: {
  id: string;
  name: string;
  parts: Part[];
  blurb: string;
  note: string;
  symmetry: string;
  detail: string;
  center: string;
  poly: Poly;
  dist: number;
  ligand: string;
  atomScale?: number;
  bondRadius?: number;
  caps?: { el: string; dist: number; count: number };
  /** Per-vertex multiplier. Use it when axial bonds should differ from equatorial. */
  stretch?: number[];
  lobes: Lobe[];
}): Molecule {
  const placed = opts.poly.verts.map((v, i) =>
    vscale(vnorm(v), opts.dist * (opts.stretch?.[i] ?? 1)),
  );
  const atoms: Atom[] = [{ el: opts.center, at: [0, 0, 0] }];
  const bonds: Edge[] = [];
  placed.forEach((at, i) => {
    bonds.push([0, atoms.length]);
    atoms.push({ el: opts.ligand, at });
    if (opts.caps) {
      const host = atoms.length - 1;
      addCaps(atoms, bonds, host, opts.caps.el, opts.caps.dist, opts.caps.count);
    }
    void i;
  });
  return {
    id: opts.id,
    name: opts.name,
    parts: opts.parts,
    blurb: opts.blurb,
    note: opts.note,
    symmetry: opts.symmetry,
    detail: opts.detail,
    atoms,
    bonds,
    atomScale: opts.atomScale ?? 1,
    bondRadius: opts.bondRadius ?? 0.055,
    guide: placed,
    guideEdges: opts.poly.edges,
    lobes: opts.lobes,
    shellRadius: opts.dist * 1.22,
  };
}

function addCaps(
  atoms: Atom[],
  bonds: Edge[],
  hostIndex: number,
  el: string,
  dist: number,
  count: number,
) {
  const host = atoms[hostIndex]!.at;
  if (count === 1) {
    bonds.push([hostIndex, atoms.length]);
    atoms.push({ el, at: vadd(host, vscale(vnorm(host), dist)) });
    return;
  }
  const out = vnorm(host);
  const p = perpendicular(out);
  const q = vnorm(vcross(out, p));
  for (let k = 0; k < count; k++) {
    const ang = (k / count) * Math.PI * 2 + 0.4;
    const lateral = vadd(vscale(p, Math.cos(ang)), vscale(q, Math.sin(ang)));
    const dir = vnorm(vadd(lateral, vscale(out, -0.32)));
    bonds.push([hostIndex, atoms.length]);
    atoms.push({ el, at: vadd(host, vscale(dir, dist)) });
  }
}

function cage(opts: {
  id: string;
  name: string;
  parts: Part[];
  blurb: string;
  note: string;
  symmetry: string;
  detail: string;
  poly: Poly;
  dist: number;
  el: string;
  cap?: { el: string; dist: number };
  atomScale?: number;
  bondRadius?: number;
  lobes?: Lobe[];
}): Molecule {
  const placed = scaleVerts(opts.poly.verts, opts.dist);
  const atoms: Atom[] = placed.map((at) => ({ el: opts.el, at }));
  const bonds: Edge[] = opts.poly.edges.map((e) => [e[0], e[1]]);
  if (opts.cap) {
    const n = placed.length;
    for (let i = 0; i < n; i++) {
      addCaps(atoms, bonds, i, opts.cap.el, opts.cap.dist, 1);
    }
  }
  return {
    id: opts.id,
    name: opts.name,
    parts: opts.parts,
    blurb: opts.blurb,
    note: opts.note,
    symmetry: opts.symmetry,
    detail: opts.detail,
    atoms,
    bonds,
    atomScale: opts.atomScale ?? 1,
    bondRadius: opts.bondRadius ?? 0.05,
    guide: placed,
    guideEdges: opts.poly.edges,
    lobes: opts.lobes ?? [],
    shellRadius: opts.dist * 1.28,
  };
}

function carbonyls(opts: {
  id: string;
  name: string;
  parts: Part[];
  blurb: string;
  note: string;
  symmetry: string;
  detail: string;
  metal: string;
  poly: Poly;
  lobes: Lobe[];
}): Molecule {
  const atoms: Atom[] = [{ el: opts.metal, at: [0, 0, 0] }];
  const bonds: Edge[] = [];
  const guide = scaleVerts(opts.poly.verts, 1.2);
  opts.poly.verts.forEach((dir) => {
    const n = vnorm(dir);
    const ci = atoms.length;
    atoms.push({ el: "C", at: vscale(n, 1.2) });
    atoms.push({ el: "O", at: vscale(n, 1.78) });
    bonds.push([0, ci], [ci, ci + 1]);
  });
  return {
    id: opts.id,
    name: opts.name,
    parts: opts.parts,
    blurb: opts.blurb,
    note: opts.note,
    symmetry: opts.symmetry,
    detail: opts.detail,
    atoms,
    bonds,
    atomScale: 0.92,
    bondRadius: 0.05,
    guide,
    guideEdges: opts.poly.edges,
    lobes: opts.lobes,
    shellRadius: 2.05,
  };
}

const tetra = polyTetra();
const cube = polyCube();
const octa = polyOcta();
const dodeca = polyDodeca();
const icosa = polyIcosa();
const linear = polyLinear();
const trigonal = polyTrigonal();
const tbp = polyTbp();
const sqpy = polySquarePyramid();
const pbp = polyPbp();
const prism = polyPrism();
const tricapped = polyTricapped();
const antiprism = polyAntiprism();
const cubocta = polyCubocta();
const bucky = polyBucky();

function solid(
  partial: Omit<Solid, "merkaba" | "nodal" | "shellRadius"> & {
    shellRadius?: number;
    merkaba?: boolean;
    nodal?: boolean;
  },
): Solid {
  return {
    merkaba: false,
    nodal: false,
    shellRadius: 1.28,
    ...partial,
  };
}

export const SOLIDS: Solid[] = [
  solid({
    id: "tetrahedron",
    name: "Tetrahedron",
    family: "Platonic solid",
    v: 4,
    e: 6,
    f: 4,
    symmetry: "Td",
    hybrid: "sp³",
    angle: "109.5°",
    summary:
      "Four electron domains on a sphere land on a tetrahedron. Methane’s hydrogens sit in those four probability peaks.",
    quantum:
      "A shell is a radial ridge of probability, fixed mainly by n, not a hard ball. The angular part of carbon’s four sp³ hybrids peaks toward the tetrahedron’s vertices. The textbook orbital is an isosurface of |ψ|² — a probability field, not a track.",
    grid:
      "In the 7-11-12 grids lesson the tetrahedron is the picture offered for the human collective: the simplest Platonic solid, four points, one center. Same shape a carbon atom uses when it holds four bonds.",
    poly: tetra,
    nucleus: true,
    lobes: lobesFrom(tetra.verts, 0.78, "hybrid"),
    molecules: [
      central({
        id: "ch4",
        name: "Methane",
        parts: [tx("CH"), sub("4")],
        blurb: "The textbook tetrahedron. Carbon at the center, four hydrogens at the vertices, one domain each.",
        note: "Bond angle 109.5°. The four sp³ lobes point straight at the hydrogens — the probability of finding the bonding electrons is highest along those lines, not on a planetary orbit.",
        symmetry: "Td",
        detail: "109.5°",
        center: "C",
        poly: tetra,
        dist: 1.15,
        ligand: "H",
        lobes: lobesFrom(tetra.verts, 0.82, "hybrid"),
      }),
      cage({
        id: "p4",
        name: "White phosphorus",
        parts: [tx("P"), sub("4")],
        blurb: "No central atom. Four phosphorus nuclei themselves are the tetrahedron, bonded along every edge.",
        note: "Each P–P–P angle is 60°, far tighter than the 109.5° of methane. The strain is why white phosphorus is reactive. The shape is still the tetrahedron — here as a cage, not a coordination shell.",
        symmetry: "Td",
        detail: "60° cage",
        poly: tetra,
        dist: 1.25,
        el: "P",
        lobes: lobesFrom(tetra.verts, 0.7, "hybrid"),
      }),
      central({
        id: "ccl4",
        name: "Carbon tetrachloride",
        parts: [tx("CCl"), sub("4")],
        blurb: "Same skeleton as methane, with chlorine filling the four vertices. A heavier tetrahedron.",
        note: "The angle stays tetrahedral. What changes is the radial extent: larger atoms, same angular math. Probability ridges still point at the ligands.",
        symmetry: "Td",
        detail: "109.5°",
        center: "C",
        poly: tetra,
        dist: 1.4,
        ligand: "Cl",
        lobes: lobesFrom(tetra.verts, 0.95, "hybrid"),
      }),
      central({
        id: "nh4",
        name: "Ammonium",
        parts: [tx("NH"), sub("4"), sup("+")],
        blurb: "Nitrogen’s four sp³ domains, all bonded. The lone pair of ammonia has been protonated away.",
        note: "NH₃ is a pyramid because one tetrahedral corner is a lone pair. Add a proton and that corner becomes a bond — the ion is a completed tetrahedron.",
        symmetry: "Td",
        detail: "109.5°",
        center: "N",
        poly: tetra,
        dist: 1.12,
        ligand: "H",
        lobes: lobesFrom(tetra.verts, 0.8, "hybrid"),
      }),
    ],
  }),
  solid({
    id: "cube",
    name: "Cube",
    family: "Platonic solid",
    v: 8,
    e: 12,
    f: 6,
    symmetry: "Oh",
    hybrid: "8-coordinate",
    angle: "70.5° / 109.5°",
    summary:
      "Eight vertices, and they are exactly two interlocking tetrahedra. Cubane’s carbons sit on those corners; so do the neighbors of a cesium ion in CsCl.",
    quantum:
      "The cube and the octahedron are duals: vertices of one are faces of the other, and they share the octahedral group Oh. Eight-coordinate atoms are rarer than six. When they do sit on a cube, the electron domains are the corners, not the face centers.",
    grid:
      "The grids lesson says Earth prefers a cube, and that the cube contains the merkaba. Turn on Field: the gold and tide tetrahedra are that merkaba. Their eight corners are the cube’s eight corners — a geometric identity, not an extra shape hiding inside.",
    poly: cube,
    merkaba: true,
    nucleus: false,
    lobes: [],
    molecules: [
      cage({
        id: "cubane",
        name: "Cubane",
        parts: [tx("C"), sub("8"), tx("H"), sub("8")],
        blurb: "Eight carbons, one at each corner, hydrogens pointing outward. A molecule that is a cube.",
        note: "Bond angles are about 90°, not 109.5°. The strain is real and the molecule is still stable enough to isolate. Symmetry Oh — the full symmetry of the cube.",
        symmetry: "Oh",
        detail: "~90°",
        poly: cube,
        dist: 1.2,
        el: "C",
        cap: { el: "H", dist: 0.62 },
        atomScale: 0.92,
      }),
      central({
        id: "cscl",
        name: "Cesium chloride",
        parts: [tx("CsCl")],
        blurb: "Not a molecule — a crystal site. Each cesium is touched by eight chlorides at the corners of a cube.",
        note: "Body-centered cubic packing put in one cell. The cube here is the coordination polyhedron. Sodium chloride, by contrast, is octahedral: six neighbors, not eight.",
        symmetry: "Oh",
        detail: "crystal",
        center: "Cs",
        poly: cube,
        dist: 1.45,
        ligand: "Cl",
        atomScale: 0.92,
        lobes: [],
      }),
      (() => {
        const placed = scaleVerts(cube.verts, 1.25);
        const atoms: Atom[] = placed.map((at) => ({ el: "Si", at }));
        const bonds: Edge[] = [];
        for (const [i, j] of cube.edges) {
          const mid = vscale(vadd(placed[i]!, placed[j]!), 0.5);
          const oi = atoms.length;
          atoms.push({ el: "O", at: mid });
          bonds.push([i, oi], [j, oi]);
        }
        const nSi = placed.length;
        for (let i = 0; i < nSi; i++) addCaps(atoms, bonds, i, "H", 0.58, 1);
        return {
          id: "t8",
          name: "Silsesquioxane cube",
          parts: [tx("H"), sub("8"), tx("Si"), sub("8"), tx("O"), sub("12")],
          blurb: "Silicons on the cube’s corners, oxygens on the edges. A cage chemists actually build.",
          note: "The T8 core is a molecular cube used as a building block. Carbons in cubane bond to each other; here the edges are Si–O–Si bridges, so the cube is the silicon skeleton.",
          symmetry: "Oh",
          detail: "T8 cage",
          atoms,
          bonds,
          atomScale: 0.86,
          bondRadius: 0.045,
          guide: placed,
          guideEdges: cube.edges,
          lobes: [],
          shellRadius: 1.7,
        } satisfies Molecule;
      })(),
    ],
  }),
  solid({
    id: "octahedron",
    name: "Octahedron",
    family: "Platonic solid",
    v: 6,
    e: 12,
    f: 8,
    symmetry: "Oh",
    hybrid: "p set · d²sp³",
    angle: "90°",
    summary:
      "Six lobes, three axes. The p orbitals of a free atom already point at the octahedron’s vertices — gold one way, tide the other, zero on the discs between.",
    quantum:
      "Each p orbital has one nodal plane through the nucleus, drawn here as a dim disc. Probability on one side is the opposite phase of the other; |ψ|² itself has no sign, but the phase is why the two lobes belong to one orbital. In an octahedral ligand field the d set splits as well: eg lobes point at ligands, t₂g lobes point between them.",
    grid:
      "The grids lesson says the Sun prefers an eight-sided solid, an octahedron. Six vertices, eight faces. It is also the dual of the cube assigned there to Earth — vertices and faces swapped, one symmetry group.",
    poly: octa,
    nodal: true,
    nucleus: true,
    lobes: lobesFrom(octa.verts, 0.92, "p"),
    molecules: [
      central({
        id: "sf6",
        name: "Sulfur hexafluoride",
        parts: [tx("SF"), sub("6")],
        blurb: "Six fluorines, all equivalent, every angle 90°. The coordination octahedron in one molecule.",
        note: "Sulfur’s valence shell here holds six bonding domains. The picture students memorize — a blob on each axis — is this solid with the probability pulled out along the bonds.",
        symmetry: "Oh",
        detail: "90°",
        center: "S",
        poly: octa,
        dist: 1.35,
        ligand: "F",
        lobes: lobesFrom(octa.verts, 0.95, "hybrid"),
      }),
      carbonyls({
        id: "moco6",
        name: "Molybdenum hexacarbonyl",
        parts: [tx("Mo(CO)"), sub("6")],
        blurb: "A metal at the center, six carbonyls on the axes. The octahedron, built from linear ligands.",
        note: "Each CO is a triple-bond rod on the outside and a donor bond into the metal. The carbons, not the oxygens, are the vertices of the coordination octahedron.",
        symmetry: "Oh",
        detail: "90°",
        metal: "Mo",
        poly: octa,
        lobes: lobesFrom(octa.verts, 0.85, "hybrid"),
      }),
      central({
        id: "co6",
        name: "Hexaamminecobalt(III)",
        parts: [tx("Co(NH"), sub("3"), tx(")"), sub("6"), sup("3+")],
        blurb: "Six ammonias around cobalt. The nitrogens trace the octahedron; the hydrogens are the caps.",
        note: "A classic Werner complex. The lone pair on each nitrogen points inward, at the metal, which is why the three hydrogens tilt outward. Charge 3+.",
        symmetry: "Oh",
        detail: "90°",
        center: "Co",
        poly: octa,
        dist: 1.28,
        ligand: "N",
        caps: { el: "H", dist: 0.58, count: 3 },
        atomScale: 0.9,
        lobes: lobesFrom(octa.verts, 0.88, "hybrid"),
      }),
    ],
  }),
  solid({
    id: "dodecahedron",
    name: "Dodecahedron",
    family: "Platonic solid",
    v: 20,
    e: 30,
    f: 12,
    symmetry: "Ih",
    hybrid: "cage",
    angle: "108° faces",
    summary:
      "Twelve pentagons, twenty vertices. Dodecahedrane puts a CH on each vertex. Water, in gas hydrates, builds the same cage out of hydrogen bonds.",
    quantum:
      "No s–p–d hybrid set on one atom points at twenty vertices. The dodecahedron shows up as a cage: many atoms, each with ordinary local bonding, the global symmetry Ih. That group is the same one the icosahedron uses — they are duals.",
    grid:
      "Plato kept the dodecahedron for the cosmos, the fifth solid. The grids lesson doesn’t assign it to a planet; it does say Metatron’s cube contains every Platonic solid, this one included. The rotation group has 60 elements, the largest of the five.",
    poly: dodeca,
    nucleus: false,
    lobes: [],
    molecules: [
      cage({
        id: "c20h20",
        name: "Dodecahedrane",
        parts: [tx("C"), sub("20"), tx("H"), sub("20")],
        blurb: "Twenty carbons, each bonded to three neighbors, a hydrogen pointing out. A synthesized Platonic molecule.",
        note: "Paquette’s dodecahedrane. Every face is a pentagon, every angle close to the tetrahedral ideal, which is why this cage is far less strained than cubane.",
        symmetry: "Ih",
        detail: "pentagons",
        poly: dodeca,
        dist: 1.45,
        el: "C",
        cap: { el: "H", dist: 0.5 },
        atomScale: 0.62,
        bondRadius: 0.035,
      }),
      cage({
        id: "h2o20",
        name: "Dodecahedral water",
        parts: [tx("(H"), sub("2"), tx("O)"), sub("20")],
        blurb: "The 5¹² cage of clathrate ice. Twenty oxygens; the hydrogens sit, disordered, along the edges.",
        note: "Methane hydrate and many gas hydrates are built from this cage plus larger ones. Only oxygens are drawn. The edges are hydrogen bonds, not the covalent O–H sticks inside a single water.",
        symmetry: "Ih",
        detail: "H-bond cage",
        poly: dodeca,
        dist: 1.5,
        el: "O",
        atomScale: 0.7,
        bondRadius: 0.03,
      }),
    ],
  }),
  solid({
    id: "icosahedron",
    name: "Icosahedron",
    family: "Platonic solid",
    v: 12,
    e: 30,
    f: 20,
    symmetry: "Ih",
    hybrid: "cage",
    angle: "5-fold",
    summary:
      "Twelve vertices, twenty triangles. closo-borane and carborane are icosahedra you can put in a flask. C₆₀ is the same symmetry with the corners cut off.",
    quantum:
      "Icosahedral symmetry is forbidden in a periodic crystal — you cannot tile space with 5-fold axes — but a single molecule can have it. Twelve boron atoms, each bonded to five neighbors, is the closo deltahedron. The radial probability is ordinary; the angular skeleton is the icosahedron.",
    grid:
      "Order-60 rotational symmetry, the alternating group A₅. In the grids lesson, more complex solids are treated as denser encodings. The icosahedron is as complex as a Platonic solid gets.",
    poly: icosa,
    nucleus: false,
    lobes: [],
    molecules: [
      cage({
        id: "b12",
        name: "closo-Dodecaborate",
        parts: [tx("[B"), sub("12"), tx("H"), sub("12"), tx("]"), sup("2−")],
        blurb: "Twelve borons at the icosahedron’s vertices, a hydrogen on each, the whole ion a closed cage.",
        note: "The closo rule: n vertices, n+1 skeletal electron pairs. For B₁₂H₁₂²⁻ that count closes the cage. Elemental boron uses related B₁₂ icosahedra as building blocks.",
        symmetry: "Ih",
        detail: "closo",
        poly: icosa,
        dist: 1.35,
        el: "B",
        cap: { el: "H", dist: 0.55 },
        atomScale: 0.78,
        bondRadius: 0.04,
      }),
      (() => {
        const placed = scaleVerts(icosa.verts, 1.35);
        const edge = icosa.edges[0]!;
        const carbons = new Set([edge[0], edge[1]]);
        const atoms: Atom[] = placed.map((at, i) => ({ el: carbons.has(i) ? "C" : "B", at }));
        const bonds: Edge[] = icosa.edges.map((e) => [e[0], e[1]]);
        for (let i = 0; i < placed.length; i++) addCaps(atoms, bonds, i, "H", 0.55, 1);
        return {
          id: "carborane",
          name: "ortho-Carborane",
          parts: [tx("C"), sub("2"), tx("B"), sub("10"), tx("H"), sub("12")],
          blurb: "The same icosahedron with two neighboring borons swapped for carbon. A workhorse cage in chemistry.",
          note: "Ortho means the two carbons share an edge. The symmetry drops from Ih to C₂v, but the skeleton you see is still the icosahedron. Hydrogens cap every vertex.",
          symmetry: "C₂v",
          detail: "ortho",
          atoms,
          bonds,
          atomScale: 0.78,
          bondRadius: 0.04,
          guide: placed,
          guideEdges: icosa.edges,
          lobes: [],
          shellRadius: 1.75,
        } satisfies Molecule;
      })(),
    ],
  }),
  solid({
    id: "linear",
    name: "Linear axis",
    family: "Domain geometry",
    v: 2,
    e: 1,
    f: null,
    symmetry: "D∞h",
    hybrid: "sp",
    angle: "180°",
    summary:
      "Two domains. They stand opposite each other because that is as far apart as a sphere allows. Carbon dioxide, acetylene, beryllium hydride.",
    quantum:
      "sp hybrids point 180° apart. The leftover p orbitals sit perpendicular to the axis and make the π bonds of a triple bond — probability above and below the line, not more vertices on it.",
    poly: linear,
    nucleus: true,
    lobes: lobesFrom(linear.verts, 0.85, "hybrid"),
    molecules: [
      {
        id: "co2",
        name: "Carbon dioxide",
        parts: [tx("CO"), sub("2")],
        blurb: "Two oxygens, one carbon, a straight line. The double bonds don’t bend the axis.",
        note: "D∞h. The π clouds are rings of probability around the axis; the σ framework is the line you see. No lone pair on carbon to fold it.",
        symmetry: "D∞h",
        detail: "180°",
        atoms: [
          { el: "O", at: [-1.25, 0, 0] },
          { el: "C", at: [0, 0, 0] },
          { el: "O", at: [1.25, 0, 0] },
        ],
        bonds: [
          [0, 1],
          [1, 2],
        ],
        atomScale: 1,
        bondRadius: 0.06,
        guide: linear.verts.map((v) => vscale(v, 1.25)) as Vec3[],
        guideEdges: linear.edges,
        lobes: lobesFrom(linear.verts, 0.9, "hybrid"),
        shellRadius: 1.55,
      },
      {
        id: "c2h2",
        name: "Acetylene",
        parts: [tx("C"), sub("2"), tx("H"), sub("2")],
        blurb: "H–C≡C–H, still a single straight axis. A triple bond is not a triangle.",
        note: "Each carbon is sp. Two π bonds wrap the C≡C shaft. The hydrogens continue the same line because each carbon has only two domains.",
        symmetry: "D∞h",
        detail: "180°",
        atoms: [
          { el: "H", at: [-1.7, 0, 0] },
          { el: "C", at: [-0.7, 0, 0] },
          { el: "C", at: [0.7, 0, 0] },
          { el: "H", at: [1.7, 0, 0] },
        ],
        bonds: [
          [0, 1],
          [1, 2],
          [2, 3],
        ],
        atomScale: 1,
        bondRadius: 0.055,
        guide: [
          [-0.7, 0, 0],
          [0.7, 0, 0],
        ],
        guideEdges: [[0, 1]],
        lobes: [
          { dir: [-1, 0, 0], phase: 1, reach: 1.15 },
          { dir: [1, 0, 0], phase: 1, reach: 1.15 },
        ],
        shellRadius: 1.9,
      },
      {
        id: "hcn",
        name: "Hydrogen cyanide",
        parts: [tx("HCN")],
        blurb: "Three atoms, one axis, a dipole. The symmetry drops from D∞h to C∞v because the ends differ.",
        note: "Still sp carbon. The shape category doesn’t change when you swap one end for nitrogen — two domains remain two domains.",
        symmetry: "C∞v",
        detail: "180°",
        atoms: [
          { el: "H", at: [-1.55, 0, 0] },
          { el: "C", at: [-0.55, 0, 0] },
          { el: "N", at: [0.7, 0, 0] },
        ],
        bonds: [
          [0, 1],
          [1, 2],
        ],
        atomScale: 1,
        bondRadius: 0.055,
        guide: [
          [-0.55, 0, 0],
          [0.7, 0, 0],
        ],
        guideEdges: [[0, 1]],
        lobes: lobesFrom(linear.verts, 0.95, "hybrid"),
        shellRadius: 1.75,
      },
      central({
        id: "beh2",
        name: "Beryllium hydride",
        parts: [tx("BeH"), sub("2")],
        blurb: "The smallest linear hydride. Beryllium has two valence electrons and uses both.",
        note: "Gas-phase BeH₂ is linear and electron-deficient relative to an octet. The geometry is still the two-domain answer: opposite ends of a diameter.",
        symmetry: "D∞h",
        detail: "180°",
        center: "Be",
        poly: linear,
        dist: 1.2,
        ligand: "H",
        lobes: lobesFrom(linear.verts, 0.85, "hybrid"),
      }),
    ],
  }),
  solid({
    id: "trigonal",
    name: "Trigonal plane",
    family: "Domain geometry",
    v: 3,
    e: 3,
    f: 1,
    symmetry: "D₃h",
    hybrid: "sp²",
    angle: "120°",
    summary:
      "Three domains fill a plane at 120°. Boron trifluoride, nitrate, sulfur trioxide. The leftover p orbital stands perpendicular to the page.",
    quantum:
      "sp² hybrids lie in the plane and make the σ bonds. The unhybridized p orbital is the π system — in nitrate and SO₃ it is delocalized, which is why all three bonds match. A triangle is not a Platonic solid; it is the regular polygon those three peaks draw.",
    poly: trigonal,
    nucleus: true,
    lobes: lobesFrom(trigonal.verts, 0.8, "hybrid"),
    molecules: [
      central({
        id: "bf3",
        name: "Boron trifluoride",
        parts: [tx("BF"), sub("3")],
        blurb: "Boron, three fluorines, a flat equilateral triangle. The classic electron-deficient Lewis acid.",
        note: "No lone pair on boron, so nothing folds the plane into a pyramid. The empty p orbital is why BF₃ binds donors along the axis you don’t see as a vertex.",
        symmetry: "D₃h",
        detail: "120°",
        center: "B",
        poly: trigonal,
        dist: 1.25,
        ligand: "F",
        lobes: lobesFrom(trigonal.verts, 0.88, "hybrid"),
      }),
      central({
        id: "no3",
        name: "Nitrate",
        parts: [tx("NO"), sub("3"), sup("−")],
        blurb: "Three oxygens, equal bonds, a resonance average of the π cloud rather than one double bond.",
        note: "D₃h. Drawing one N=O and two N–O would be a lie about the probability: the extra pair is spread over all three oxygens.",
        symmetry: "D₃h",
        detail: "120°",
        center: "N",
        poly: trigonal,
        dist: 1.22,
        ligand: "O",
        lobes: lobesFrom(trigonal.verts, 0.86, "hybrid"),
      }),
      central({
        id: "so3",
        name: "Sulfur trioxide",
        parts: [tx("SO"), sub("3")],
        blurb: "Gas-phase SO₃ is trigonal planar. Three double-bond resonances, one plane.",
        note: "Don’t confuse it with sulfite, SO₃²⁻, which is a pyramid — the lone pair occupies the fourth tetrahedral corner. Charge and domain count change the solid.",
        symmetry: "D₃h",
        detail: "120°",
        center: "S",
        poly: trigonal,
        dist: 1.28,
        ligand: "O",
        lobes: lobesFrom(trigonal.verts, 0.9, "hybrid"),
      }),
    ],
  }),
  solid({
    id: "tbp",
    name: "Trigonal bipyramid",
    family: "Atomic polyhedron",
    v: 5,
    e: 9,
    f: 6,
    symmetry: "D₃h",
    hybrid: "5 domains",
    angle: "90° · 120°",
    summary:
      "Five domains cannot make a Platonic solid. The compromise is a triangle in the equator and two atoms on the axis. The two kinds of site are not equivalent.",
    quantum:
      "Equatorial domains sit at 120° to each other and 90° to the axis. Axial bonds are often longer. Lone pairs, when present (as in SF₄ or ClF₃), prefer the equatorial plane because that gives them more room. There is no regular polyhedron with five vertices.",
    poly: tbp,
    nucleus: true,
    lobes: lobesFrom(tbp.verts, 0.78, "hybrid"),
    molecules: [
      central({
        id: "pcl5",
        name: "Phosphorus pentachloride",
        parts: [tx("PCl"), sub("5")],
        blurb: "Gas-phase PCl₅. Three equatorial chlorines, two axial, one phosphorus.",
        note: "In the solid the molecule doesn’t keep this shape — it splits into PCl₄⁺ (tetrahedron) and PCl₆⁻ (octahedron). The bipyramid is the gas-phase answer to five domains.",
        symmetry: "D₃h",
        detail: "gas phase",
        center: "P",
        poly: tbp,
        dist: 1.22,
        ligand: "Cl",
        stretch: [1.14, 1.14, 1, 1, 1],
        atomScale: 0.9,
        lobes: tbp.verts.map((dir, i) => ({
          dir,
          phase: 1 as const,
          reach: i < 2 ? 0.95 : 0.82,
        })),
      }),
      carbonyls({
        id: "feco5",
        name: "Iron pentacarbonyl",
        parts: [tx("Fe(CO)"), sub("5")],
        blurb: "The same bipyramid on a metal. Fe(CO)₅ is fluxional: axial and equatorial carbonyls swap.",
        note: "Berry pseudorotation scrambles the sites without breaking bonds. The static picture is D₃h; the NMR picture, at room temperature, is one averaged carbon.",
        symmetry: "D₃h",
        detail: "fluxional",
        metal: "Fe",
        poly: tbp,
        lobes: lobesFrom(tbp.verts, 0.85, "hybrid"),
      }),
    ],
  }),
  solid({
    id: "sqpy",
    name: "Square pyramid",
    family: "Atomic polyhedron",
    v: 5,
    e: 8,
    f: 5,
    symmetry: "C₄v",
    hybrid: "AX₅E",
    angle: "~85°",
    summary:
      "Five atoms in a pyramid. In BrF₅ the missing sixth corner of an octahedron is a lone pair — the tide lobe under the base.",
    quantum:
      "Start from an octahedron, replace one ligand with a lone pair, and the remaining five atoms are a square pyramid. The lone pair takes more angular room, so the pyramid is slightly squashed and the central atom sits just below the square. Some metals are square pyramidal with no lone pair; the shape is then just five ligands.",
    poly: sqpy,
    nucleus: true,
    lobes: [
      ...sqpy.verts.map((dir) => ({ dir, phase: 1 as const, reach: 0.78 })),
      { dir: [0, -1, 0] as Vec3, phase: -1 as const, reach: 0.62 },
    ],
    molecules: [
      central({
        id: "brf5",
        name: "Bromine pentafluoride",
        parts: [tx("BrF"), sub("5")],
        blurb: "Four fluorines in a square, one on the axis, and a lone pair completing the octahedron underneath.",
        note: "C₄v. Turn on Field to see the tide lobe — that is the lone pair, not a sixth fluorine. The bonded angles sit near 85°, pushed by that pair.",
        symmetry: "C₄v",
        detail: "lone pair",
        center: "Br",
        poly: sqpy,
        dist: 1.0,
        ligand: "F",
        lobes: [
          ...scaleVerts(sqpy.verts, 1).map((dir) => ({ dir, phase: 1 as const, reach: 0.85 })),
          { dir: [0, -1, 0] as Vec3, phase: -1 as const, reach: 0.7 },
        ],
      }),
    ],
  }),
  solid({
    id: "pbp",
    name: "Pentagonal bipyramid",
    family: "Atomic polyhedron",
    v: 7,
    e: 15,
    f: 10,
    symmetry: "D₅h",
    hybrid: "7 domains",
    angle: "72° · 90°",
    summary:
      "Seven domains. A regular pentagon around the middle, two atoms on the axis. Iodine heptafluoride is the molecule people remember.",
    quantum:
      "Seven is the first coordination number with several competing polyhedra. The pentagonal bipyramid is the VSEPR ideal for seven bonded domains and no lone pair. Real IF₇ is slightly puckered; the model is the ideal D₅h solid the electron count is aiming at.",
    poly: pbp,
    nucleus: true,
    lobes: lobesFrom(pbp.verts, 0.72, "hybrid"),
    molecules: [
      central({
        id: "if7",
        name: "Iodine heptafluoride",
        parts: [tx("IF"), sub("7")],
        blurb: "Iodine and seven fluorines. Five in a belt, two on the axis — an idealized pentagonal bipyramid.",
        note: "Real IF₇ puckers a little; the D₅h drawing is the reference shape. Iodine is large enough to hold seven fluorines. The equatorial angles are 72°.",
        symmetry: "D₅h",
        detail: "idealized",
        center: "I",
        poly: pbp,
        dist: 1.28,
        ligand: "F",
        atomScale: 0.72,
        lobes: lobesFrom(pbp.verts, 0.8, "hybrid"),
      }),
      (() => {
        const dirs = pbp.verts;
        const atoms: Atom[] = [{ el: "V", at: [0, 0, 0] }];
        const bonds: Edge[] = [];
        const guide = scaleVerts(dirs, 1.22);
        dirs.forEach((dir) => {
          const n = vnorm(dir);
          const ci = atoms.length;
          atoms.push({ el: "C", at: vscale(n, 1.22) });
          atoms.push({ el: "N", at: vscale(n, 1.78) });
          bonds.push([0, ci], [ci, ci + 1]);
        });
        return {
          id: "vcn7",
          name: "Heptacyanovanadate(III)",
          parts: [tx("[V(CN)"), sub("7"), tx("]"), sup("4−")],
          blurb: "A metal that genuinely prefers this solid. Seven cyanides, pentagonal bipyramid, vanadium(III).",
          note: "Unlike IF₇, this is a complex ion. The carbons are the vertices of the polyhedron; the nitrogens continue outward. Charge 4−.",
          symmetry: "D₅h",
          detail: "idealized",
          atoms,
          bonds,
          atomScale: 0.88,
          bondRadius: 0.045,
          guide,
          guideEdges: pbp.edges,
          lobes: lobesFrom(pbp.verts, 0.85, "hybrid"),
          shellRadius: 2.05,
        } satisfies Molecule;
      })(),
    ],
  }),
  solid({
    id: "prism",
    name: "Trigonal prism",
    family: "Atomic polyhedron",
    v: 6,
    e: 9,
    f: 5,
    symmetry: "D₃h",
    hybrid: "exception",
    angle: "prism",
    summary:
      "Six ligands usually make an octahedron. W(CH₃)₆ refuses, and sits in a trigonal prism — two triangles, no twist.",
    quantum:
      "An octahedron is a trigonal antiprism: the two triangles are rotated 60°. A prism has them eclipsed. For most metals the antiprism wins because ligands stay farther apart. Tungsten hexamethyl is the famous exception, helped by the way its d orbitals interact with the methyls.",
    poly: prism,
    nucleus: true,
    lobes: lobesFrom(prism.verts, 0.75, "hybrid"),
    molecules: [
      central({
        id: "wme6",
        name: "Tungsten hexamethyl",
        parts: [tx("W(CH"), sub("3"), tx(")"), sub("6")],
        blurb: "Six methyls, eclipsed in two triangles. Not an octahedron, on purpose.",
        note: "Idealized D₃h. The real molecule distorts slightly, but it does not twist into an octahedron. Each carbon carries three hydrogens, tilted outward.",
        symmetry: "D₃h",
        detail: "eclipsed",
        center: "W",
        poly: prism,
        dist: 1.3,
        ligand: "C",
        caps: { el: "H", dist: 0.52, count: 3 },
        atomScale: 0.82,
        lobes: lobesFrom(prism.verts, 0.9, "hybrid"),
      }),
    ],
  }),
  solid({
    id: "tricap",
    name: "Tricapped prism",
    family: "Atomic polyhedron",
    v: 9,
    e: tricapped.edges.length,
    f: 14,
    symmetry: "D₃h",
    hybrid: "9 domains",
    angle: "capped",
    summary:
      "Nine hydrides around rhenium. A trigonal prism, plus one hydrogen capping each of the three square faces.",
    quantum:
      "Nine is past what a simple hybrid picture is for. [ReH₉]²⁻ is the textbook tricapped trigonal prism: six hydrides on the prism, three in the belt. The cage toggle shows that skeleton around the atoms.",
    poly: tricapped,
    nucleus: true,
    lobes: [],
    molecules: [
      central({
        id: "reh9",
        name: "Enneahydridorhenate",
        parts: [tx("[ReH"), sub("9"), tx("]"), sup("2−")],
        blurb: "Rhenium and nine hydrogens. The record hydride, and a clean tricapped trigonal prism.",
        note: "D₃h. The three belt hydrogens (the caps) are not the same site as the six prism hydrogens, even though the formula writes them alike. Charge 2−.",
        symmetry: "D₃h",
        detail: "two sites",
        center: "Re",
        poly: tricapped,
        dist: 1.2,
        ligand: "H",
        atomScale: 1,
        lobes: [],
      }),
    ],
  }),
  solid({
    id: "antiprism",
    name: "Square antiprism",
    family: "Atomic polyhedron",
    v: 8,
    e: 16,
    f: 10,
    symmetry: "D₄d",
    hybrid: "8 domains",
    angle: "staggered",
    summary:
      "Eight ligands more often stagger than sit on a cube. Two squares, rotated 45°, is the square antiprism.",
    quantum:
      "Twisting a cube’s top face by 45° turns square faces into triangles and pushes neighbors apart. That is why [TaF₈]³⁻ and [ZrF₈]⁴⁻ prefer this solid to the cube cubane made famous. Both are legitimate 8-vertex answers; atoms pick by ligand size and electronics.",
    poly: antiprism,
    nucleus: true,
    lobes: lobesFrom(antiprism.verts, 0.7, "hybrid"),
    molecules: [
      central({
        id: "taf8",
        name: "Octafluorotantalate",
        parts: [tx("[TaF"), sub("8"), tx("]"), sup("3−")],
        blurb: "Tantalum(V) inside eight fluorines, staggered into a square antiprism.",
        note: "D₄d idealized. Compare with the cube of CsCl: same number of neighbors, different twist. No lone pair on the metal — Ta(V) is d⁰.",
        symmetry: "D₄d",
        detail: "staggered",
        center: "Ta",
        poly: antiprism,
        dist: 1.25,
        ligand: "F",
        atomScale: 0.8,
        lobes: lobesFrom(antiprism.verts, 0.88, "hybrid"),
      }),
      central({
        id: "zrf8",
        name: "Octafluorozirconate",
        parts: [tx("[ZrF"), sub("8"), tx("]"), sup("4−")],
        blurb: "The same antiprism on zirconium(IV). Eight fluorines, two squares offset by half a turn.",
        note: "Another d⁰ eight-coordinate ion. Cube versus antiprism is the eight-domain version of the question the prism asked at six: eclipsed or staggered?",
        symmetry: "D₄d",
        detail: "staggered",
        center: "Zr",
        poly: antiprism,
        dist: 1.28,
        ligand: "F",
        atomScale: 0.8,
        lobes: lobesFrom(antiprism.verts, 0.9, "hybrid"),
      }),
    ],
  }),
  solid({
    id: "cubocta",
    name: "Cuboctahedron",
    family: "Atomic polyhedron",
    v: 12,
    e: 24,
    f: 14,
    symmetry: "Oh",
    hybrid: "12 neighbors",
    angle: "fcc",
    summary:
      "Twelve neighbors, triangles alternating with squares. This is the coordination shell of copper, silver, gold, aluminum — any face-centered cubic metal.",
    quantum:
      "In a close-packed metal each atom touches twelve others. If the layers stack ABCABC, those twelve trace a cuboctahedron. HCP stacking (ABAB) traces a different 12-vertex solid, the triangular orthobicupola. The count is the same; the twist differs. No localized two-electron bond is pretending to be an orbital lobe here — the vertices are nuclei.",
    poly: cubocta,
    nucleus: true,
    lobes: [],
    molecules: [
      central({
        id: "cu13",
        name: "Copper coordination",
        parts: [tx("Cu"), sub("13")],
        blurb: "One copper and its twelve nearest neighbors in the fcc crystal. A fragment, not a molecule.",
        note: "Cut out of the metal lattice. Each neighbor also touches four others in this shell; the cage toggle draws those contacts. Silver and gold use the same solid.",
        symmetry: "Oh",
        detail: "fcc shell",
        center: "Cu",
        poly: cubocta,
        dist: 1.35,
        ligand: "Cu",
        atomScale: 0.72,
        bondRadius: 0.04,
        lobes: [],
      }),
    ],
  }),
  solid({
    id: "bucky",
    name: "Truncated icosahedron",
    family: "Atomic polyhedron",
    v: 60,
    e: 90,
    f: 32,
    symmetry: "Ih",
    hybrid: "cage",
    angle: "soccer ball",
    summary:
      "Cut the icosahedron’s twelve vertices off and you get twelve pentagons and twenty hexagons. Buckminsterfullerene puts a carbon on every new vertex.",
    quantum:
      "C₆₀ is an Archimedean solid, not a Platonic one: two kinds of face, one kind of vertex. Every carbon is sp², bonded to three neighbors, with a delocalized π cloud over the cage. The pentagons are required — Euler’s formula won’t close a sphere of only hexagons. Sixty atoms, ninety bonds, symmetry Ih, the same group as the icosahedron and the dodecahedron.",
    grid:
      "The grids lesson asks whether information could be encoded with more than the Platonic solids. A fullerene is one earthly answer: a truncated icosahedron, still Ih, no longer regular, and stable enough to dissolve in toluene.",
    poly: bucky,
    nucleus: false,
    lobes: [],
    shellRadius: 1.35,
    molecules: [
      cage({
        id: "c60",
        name: "Buckminsterfullerene",
        parts: [tx("C"), sub("60")],
        blurb: "Sixty carbons, twelve pentagons, twenty hexagons. The molecule that wears this solid.",
        note: "Each carbon bonds to three others. Bonds shared by two hexagons are slightly shorter than pentagon–hexagon edges; the model draws them equal. No hydrogens — the fourth valence is the π system.",
        symmetry: "Ih",
        detail: "90 bonds",
        poly: bucky,
        dist: 1.55,
        el: "C",
        atomScale: 0.42,
        bondRadius: 0.028,
      }),
    ],
  }),
];

export const SHAPE_COUNT = SOLIDS.length;

export function moleculesOf(shape: number): Molecule[] {
  return SOLIDS[moduloIndex(shape)]!.molecules;
}

function moduloIndex(i: number): number {
  const n = SOLIDS.length;
  return ((i % n) + n) % n;
}

export function elementName(el: string): string {
  return ELEMENTS[el]?.name ?? el;
}

export const ELEMENTS: Record<string, { color: string; radius: number; name: string; metal?: boolean }> = {
  H: { color: "#f3efe6", radius: 0.26, name: "Hydrogen" },
  C: { color: "#9aa1ab", radius: 0.38, name: "Carbon" },
  N: { color: "#6f9e96", radius: 0.38, name: "Nitrogen" },
  O: { color: "#d06a58", radius: 0.36, name: "Oxygen" },
  F: { color: "#8fbf9a", radius: 0.34, name: "Fluorine" },
  Cl: { color: "#9aaa72", radius: 0.46, name: "Chlorine" },
  Br: { color: "#c4784e", radius: 0.5, name: "Bromine" },
  I: { color: "#9a78b0", radius: 0.54, name: "Iodine" },
  S: { color: "#e0b15a", radius: 0.46, name: "Sulfur" },
  P: { color: "#d4894a", radius: 0.46, name: "Phosphorus" },
  B: { color: "#e0b7c4", radius: 0.36, name: "Boron" },
  Be: { color: "#c5d4a8", radius: 0.34, name: "Beryllium" },
  Si: { color: "#d8c6a2", radius: 0.44, name: "Silicon" },
  Fe: { color: "#d2b49a", radius: 0.48, name: "Iron", metal: true },
  Mo: { color: "#b7c4d6", radius: 0.5, name: "Molybdenum", metal: true },
  W: { color: "#9aa8c2", radius: 0.5, name: "Tungsten", metal: true },
  Ta: { color: "#b9b4c9", radius: 0.5, name: "Tantalum", metal: true },
  Re: { color: "#c2b7a4", radius: 0.5, name: "Rhenium", metal: true },
  Cs: { color: "#e0c98a", radius: 0.62, name: "Cesium", metal: true },
  Cu: { color: "#d08a62", radius: 0.44, name: "Copper", metal: true },
  Zr: { color: "#aeb8c4", radius: 0.5, name: "Zirconium", metal: true },
  Co: { color: "#c49a9a", radius: 0.46, name: "Cobalt", metal: true },
  V: { color: "#8f9aa8", radius: 0.46, name: "Vanadium", metal: true },
};
