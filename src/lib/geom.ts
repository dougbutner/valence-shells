export type Vec3 = [number, number, number];
export type Edge = [number, number];
export type Poly = { verts: Vec3[]; edges: Edge[] };

export function vadd(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
export function vsub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
export function vscale(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}
export function vdot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
export function vlen(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}
export function vnorm(a: Vec3): Vec3 {
  const l = vlen(a) || 1;
  return vscale(a, 1 / l);
}
export function vcross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
export function perpendicular(n: Vec3): Vec3 {
  const a: Vec3 = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  return vnorm(vcross(n, a));
}

/** Scale a centered cloud so its farthest point sits at `radius`. */
export function frame(points: Vec3[], radius = 1): Vec3[] {
  if (points.length === 0) return [];
  const c: Vec3 = [0, 0, 0];
  for (const p of points) {
    c[0] += p[0];
    c[1] += p[1];
    c[2] += p[2];
  }
  const n = points.length;
  c[0] /= n;
  c[1] /= n;
  c[2] /= n;
  const shifted = points.map((p) => vsub(p, c));
  let m = 0;
  for (const p of shifted) m = Math.max(m, vlen(p));
  const s = radius / (m || 1);
  return shifted.map((p) => vscale(p, s));
}

export function scaleVerts(verts: Vec3[], radius: number): Vec3[] {
  return verts.map((v) => vscale(v, radius));
}

/** Connect pairs at the shortest distance, within `slack` of that minimum. */
export function edgesByDistance(points: Vec3[], slack = 1.08): Edge[] {
  let min = Infinity;
  const pairs: { i: number; j: number; d: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = vlen(vsub(points[i], points[j]));
      if (d < min) min = d;
      pairs.push({ i, j, d });
    }
  }
  return pairs.filter((p) => p.d <= min * slack).map((p) => [p.i, p.j]);
}

function poly(verts: Vec3[], edges?: Edge[], slack = 1.08): Poly {
  const framed = frame(verts, 1);
  return { verts: framed, edges: edges ?? edgesByDistance(framed, slack) };
}

export function polyTetra(): Poly {
  return poly([
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ]);
}

export function polyOcta(): Poly {
  return poly([
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ]);
}

export function polyCube(): Poly {
  const raw: Vec3[] = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) raw.push([x, y, z]);
  return poly(raw);
}

/** Split cube corners into the two dual tetrahedra (a merkaba / stella octangula). */
export function merkabaEdges(verts: Vec3[]): { a: Edge[]; b: Edge[] } {
  const A: number[] = [];
  const B: number[] = [];
  verts.forEach((v, i) => {
    const s = Math.sign(v[0]) * Math.sign(v[1]) * Math.sign(v[2]);
    (s >= 0 ? A : B).push(i);
  });
  const link = (ids: number[]): Edge[] => {
    const e: Edge[] = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) e.push([ids[i]!, ids[j]!]);
    }
    return e;
  };
  return { a: link(A), b: link(B) };
}

export function polyIcosa(): Poly {
  const φ = (1 + Math.sqrt(5)) / 2;
  return poly([
    [0, 1, φ],
    [0, 1, -φ],
    [0, -1, φ],
    [0, -1, -φ],
    [1, φ, 0],
    [1, -φ, 0],
    [-1, φ, 0],
    [-1, -φ, 0],
    [φ, 0, 1],
    [φ, 0, -1],
    [-φ, 0, 1],
    [-φ, 0, -1],
  ]);
}

export function polyDodeca(): Poly {
  const φ = (1 + Math.sqrt(5)) / 2;
  const inv = 1 / φ;
  const raw: Vec3[] = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) raw.push([x, y, z]);
  const belt = (a: number, b: number, c: number) => {
    const signs = [-1, 1];
    if (a === 0) {
      for (const sb of signs) for (const sc of signs) raw.push([0, b * sb, c * sc]);
    } else if (b === 0) {
      for (const sa of signs) for (const sc of signs) raw.push([a * sa, 0, c * sc]);
    } else {
      for (const sa of signs) for (const sb of signs) raw.push([a * sa, b * sb, 0]);
    }
  };
  belt(0, inv, φ);
  belt(inv, φ, 0);
  belt(φ, 0, inv);
  return poly(raw);
}

/** Truncated icosahedron — the carbon cage of C60. Even permutations of the three families. */
export function polyBucky(): Poly {
  const φ = (1 + Math.sqrt(5)) / 2;
  const families: Vec3[] = [
    [0, 1, 3 * φ],
    [1, 2 + φ, 2 * φ],
    [2, 1 + 2 * φ, φ],
  ];
  const raw: Vec3[] = [];
  for (const [a, b, c] of families) {
    const cycles: Vec3[] = [
      [a!, b!, c!],
      [b!, c!, a!],
      [c!, a!, b!],
    ];
    for (const xyz of cycles) {
      const ranges = xyz.map((v) => (v === 0 ? [1] : [-1, 1]));
      for (const sx of ranges[0]!) {
        for (const sy of ranges[1]!) {
          for (const sz of ranges[2]!) raw.push([xyz[0] * sx, xyz[1] * sy, xyz[2] * sz]);
        }
      }
    }
  }
  return poly(raw, undefined, 1.05);
}

export function polyCubocta(): Poly {
  const raw: Vec3[] = [];
  for (const s1 of [-1, 1]) {
    for (const s2 of [-1, 1]) {
      raw.push([s1, s2, 0]);
      raw.push([s1, 0, s2]);
      raw.push([0, s1, s2]);
    }
  }
  return poly(raw);
}

export function polyLinear(): Poly {
  return {
    verts: [
      [-1, 0, 0],
      [1, 0, 0],
    ],
    edges: [[0, 1]],
  };
}

export function polyTrigonal(): Poly {
  const verts: Vec3[] = [];
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 - Math.PI / 2;
    verts.push([Math.cos(a), 0, Math.sin(a)]);
  }
  return { verts, edges: [[0, 1], [1, 2], [2, 0]] };
}

export function polyTbp(): Poly {
  const eq: Vec3[] = [];
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3;
    eq.push([Math.cos(a), 0, Math.sin(a)]);
  }
  const verts: Vec3[] = [[0, 1.15, 0], [0, -1.15, 0], ...eq];
  const framed = frame(verts, 1);
  const edges: Edge[] = [
    [2, 3],
    [3, 4],
    [4, 2],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 2],
    [1, 3],
    [1, 4],
  ];
  return { verts: framed, edges };
}

export function polySquarePyramid(): Poly {
  const base: Vec3[] = [];
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    base.push([Math.cos(a), -0.15, Math.sin(a)]);
  }
  const verts = frame([...base, [0, 1.05, 0]], 1);
  const edges: Edge[] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
  ];
  return { verts, edges };
}

export function polyPbp(): Poly {
  const R = 1;
  const side = 2 * R * Math.sin(Math.PI / 5);
  const h = Math.sqrt(Math.max(side * side - R * R, 0));
  const verts: Vec3[] = [
    [0, h, 0],
    [0, -h, 0],
  ];
  for (let k = 0; k < 5; k++) {
    const a = (k * 2 * Math.PI) / 5;
    verts.push([R * Math.cos(a), 0, R * Math.sin(a)]);
  }
  const edges: Edge[] = [];
  for (let k = 0; k < 5; k++) {
    const a = 2 + k;
    const b = 2 + ((k + 1) % 5);
    edges.push([a, b], [0, a], [1, a]);
  }
  return { verts: frame(verts, 1), edges };
}

export function polyPrism(): Poly {
  const R = 1;
  const side = R * Math.sqrt(3);
  const y = side / 2;
  const verts: Vec3[] = [];
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3;
    const x = R * Math.cos(a);
    const z = R * Math.sin(a);
    verts.push([x, -y, z]);
  }
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3;
    verts.push([R * Math.cos(a), y, R * Math.sin(a)]);
  }
  const edges: Edge[] = [
    [0, 1],
    [1, 2],
    [2, 0],
    [3, 4],
    [4, 5],
    [5, 3],
    [0, 3],
    [1, 4],
    [2, 5],
  ];
  return { verts: frame(verts, 1), edges };
}

/** Tricapped trigonal prism — the shape of [ReH9]2−. */
export function polyTricapped(): Poly {
  const prism = polyPrism();
  const caps: Vec3[] = [];
  const faces: Edge[] = [
    [0, 1],
    [1, 2],
    [2, 0],
  ];
  for (const [i, j] of faces) {
    const a = prism.verts[i]!;
    const b = prism.verts[j]!;
    const topI = i + 3;
    const topJ = j + 3;
    const c = prism.verts[topI]!;
    const d = prism.verts[topJ]!;
    const mid = vscale(vadd(vadd(a, b), vadd(c, d)), 0.25);
    const normal = vnorm([mid[0], 0, mid[2]]);
    caps.push(vadd(mid, vscale(normal, 0.72)));
  }
  const verts = frame([...prism.verts, ...caps], 1);
  return { verts, edges: edgesByDistance(verts, 1.12) };
}

export function polyAntiprism(): Poly {
  const r = 1;
  const y = (r * Math.pow(2, 0.25)) / 2;
  const verts: Vec3[] = [];
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    verts.push([r * Math.cos(a), -y, r * Math.sin(a)]);
  }
  for (let k = 0; k < 4; k++) {
    const b = (k * Math.PI) / 2 + Math.PI / 4;
    verts.push([r * Math.cos(b), y, r * Math.sin(b)]);
  }
  return poly(verts, undefined, 1.08);
}

export function modulo(i: number, n: number): number {
  if (n <= 0) return 0;
  return ((i % n) + n) % n;
}

/** Signed shortest ring offset from a possibly-unwrapped cursor to item i. */
export function shortest(i: number, shown: number, n: number): number {
  if (n <= 1) return 0;
  let off = i - shown;
  off = modulo(off, n);
  if (off > n / 2) off -= n;
  return off;
}
