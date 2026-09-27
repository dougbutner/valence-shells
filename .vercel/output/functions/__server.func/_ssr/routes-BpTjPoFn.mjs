import { i as __toESM } from "../_runtime.mjs";
import { a as BufferGeometry, c as Matrix4, i as BufferAttribute, l as Quaternion, m as require_react, n as useFrame, o as Color, p as require_jsx_runtime, r as useThree, s as MathUtils, t as Canvas, u as Vector3 } from "../_libs/@react-three/fiber+[...].mjs";
import { i as ChevronLeft, n as RotateCcw, r as ChevronRight } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BpTjPoFn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function vadd(a, b) {
	return [
		a[0] + b[0],
		a[1] + b[1],
		a[2] + b[2]
	];
}
function vsub(a, b) {
	return [
		a[0] - b[0],
		a[1] - b[1],
		a[2] - b[2]
	];
}
function vscale(a, s) {
	return [
		a[0] * s,
		a[1] * s,
		a[2] * s
	];
}
function vlen(a) {
	return Math.hypot(a[0], a[1], a[2]);
}
function vnorm(a) {
	return vscale(a, 1 / (vlen(a) || 1));
}
function vcross(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
}
function perpendicular(n) {
	return vnorm(vcross(n, Math.abs(n[1]) < .9 ? [
		0,
		1,
		0
	] : [
		1,
		0,
		0
	]));
}
/** Scale a centered cloud so its farthest point sits at `radius`. */
function frame(points, radius = 1) {
	if (points.length === 0) return [];
	const c = [
		0,
		0,
		0
	];
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
function scaleVerts(verts, radius) {
	return verts.map((v) => vscale(v, radius));
}
/** Connect pairs at the shortest distance, within `slack` of that minimum. */
function edgesByDistance(points, slack = 1.08) {
	let min = Infinity;
	const pairs = [];
	for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
		const d = vlen(vsub(points[i], points[j]));
		if (d < min) min = d;
		pairs.push({
			i,
			j,
			d
		});
	}
	return pairs.filter((p) => p.d <= min * slack).map((p) => [p.i, p.j]);
}
function poly(verts, edges, slack = 1.08) {
	const framed = frame(verts, 1);
	return {
		verts: framed,
		edges: edges ?? edgesByDistance(framed, slack)
	};
}
function polyTetra() {
	return poly([
		[
			1,
			1,
			1
		],
		[
			1,
			-1,
			-1
		],
		[
			-1,
			1,
			-1
		],
		[
			-1,
			-1,
			1
		]
	]);
}
function polyOcta() {
	return poly([
		[
			1,
			0,
			0
		],
		[
			-1,
			0,
			0
		],
		[
			0,
			1,
			0
		],
		[
			0,
			-1,
			0
		],
		[
			0,
			0,
			1
		],
		[
			0,
			0,
			-1
		]
	]);
}
function polyCube() {
	const raw = [];
	for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) raw.push([
		x,
		y,
		z
	]);
	return poly(raw);
}
/** Split cube corners into the two dual tetrahedra (a merkaba / stella octangula). */
function merkabaEdges(verts) {
	const A = [];
	const B = [];
	verts.forEach((v, i) => {
		(Math.sign(v[0]) * Math.sign(v[1]) * Math.sign(v[2]) >= 0 ? A : B).push(i);
	});
	const link = (ids) => {
		const e = [];
		for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) e.push([ids[i], ids[j]]);
		return e;
	};
	return {
		a: link(A),
		b: link(B)
	};
}
function polyIcosa() {
	const φ = (1 + Math.sqrt(5)) / 2;
	return poly([
		[
			0,
			1,
			φ
		],
		[
			0,
			1,
			-φ
		],
		[
			0,
			-1,
			φ
		],
		[
			0,
			-1,
			-φ
		],
		[
			1,
			φ,
			0
		],
		[
			1,
			-φ,
			0
		],
		[
			-1,
			φ,
			0
		],
		[
			-1,
			-φ,
			0
		],
		[
			φ,
			0,
			1
		],
		[
			φ,
			0,
			-1
		],
		[
			-φ,
			0,
			1
		],
		[
			-φ,
			0,
			-1
		]
	]);
}
function polyDodeca() {
	const φ = (1 + Math.sqrt(5)) / 2;
	const inv = 1 / φ;
	const raw = [];
	for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) raw.push([
		x,
		y,
		z
	]);
	const belt = (a, b, c) => {
		const signs = [-1, 1];
		if (a === 0) for (const sb of signs) for (const sc of signs) raw.push([
			0,
			b * sb,
			c * sc
		]);
		else if (b === 0) for (const sa of signs) for (const sc of signs) raw.push([
			a * sa,
			0,
			c * sc
		]);
		else for (const sa of signs) for (const sb of signs) raw.push([
			a * sa,
			b * sb,
			0
		]);
	};
	belt(0, inv, φ);
	belt(inv, φ, 0);
	belt(φ, 0, inv);
	return poly(raw);
}
/** Truncated icosahedron — the carbon cage of C60. Even permutations of the three families. */
function polyBucky() {
	const φ = (1 + Math.sqrt(5)) / 2;
	const families = [
		[
			0,
			1,
			3 * φ
		],
		[
			1,
			2 + φ,
			2 * φ
		],
		[
			2,
			1 + 2 * φ,
			φ
		]
	];
	const raw = [];
	for (const [a, b, c] of families) {
		const cycles = [
			[
				a,
				b,
				c
			],
			[
				b,
				c,
				a
			],
			[
				c,
				a,
				b
			]
		];
		for (const xyz of cycles) {
			const ranges = xyz.map((v) => v === 0 ? [1] : [-1, 1]);
			for (const sx of ranges[0]) for (const sy of ranges[1]) for (const sz of ranges[2]) raw.push([
				xyz[0] * sx,
				xyz[1] * sy,
				xyz[2] * sz
			]);
		}
	}
	return poly(raw, void 0, 1.05);
}
function polyCubocta() {
	const raw = [];
	for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
		raw.push([
			s1,
			s2,
			0
		]);
		raw.push([
			s1,
			0,
			s2
		]);
		raw.push([
			0,
			s1,
			s2
		]);
	}
	return poly(raw);
}
function polyLinear() {
	return {
		verts: [[
			-1,
			0,
			0
		], [
			1,
			0,
			0
		]],
		edges: [[0, 1]]
	};
}
function polyTrigonal() {
	const verts = [];
	for (let k = 0; k < 3; k++) {
		const a = k * 2 * Math.PI / 3 - Math.PI / 2;
		verts.push([
			Math.cos(a),
			0,
			Math.sin(a)
		]);
	}
	return {
		verts,
		edges: [
			[0, 1],
			[1, 2],
			[2, 0]
		]
	};
}
function polyTbp() {
	const eq = [];
	for (let k = 0; k < 3; k++) {
		const a = k * 2 * Math.PI / 3;
		eq.push([
			Math.cos(a),
			0,
			Math.sin(a)
		]);
	}
	return {
		verts: frame([
			[
				0,
				1.15,
				0
			],
			[
				0,
				-1.15,
				0
			],
			...eq
		], 1),
		edges: [
			[2, 3],
			[3, 4],
			[4, 2],
			[0, 2],
			[0, 3],
			[0, 4],
			[1, 2],
			[1, 3],
			[1, 4]
		]
	};
}
function polySquarePyramid() {
	const base = [];
	for (let k = 0; k < 4; k++) {
		const a = k * Math.PI / 2 + Math.PI / 4;
		base.push([
			Math.cos(a),
			-.15,
			Math.sin(a)
		]);
	}
	return {
		verts: frame([...base, [
			0,
			1.05,
			0
		]], 1),
		edges: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[0, 4],
			[1, 4],
			[2, 4],
			[3, 4]
		]
	};
}
function polyPbp() {
	const R = 1;
	const side = 2 * Math.sin(Math.PI / 5);
	const h = Math.sqrt(Math.max(side * side - 1, 0));
	const verts = [[
		0,
		h,
		0
	], [
		0,
		-h,
		0
	]];
	for (let k = 0; k < 5; k++) {
		const a = k * 2 * Math.PI / 5;
		verts.push([
			R * Math.cos(a),
			0,
			R * Math.sin(a)
		]);
	}
	const edges = [];
	for (let k = 0; k < 5; k++) {
		const a = 2 + k;
		const b = 2 + (k + 1) % 5;
		edges.push([a, b], [0, a], [1, a]);
	}
	return {
		verts: frame(verts, 1),
		edges
	};
}
function polyPrism() {
	const R = 1;
	const y = R * Math.sqrt(3) / 2;
	const verts = [];
	for (let k = 0; k < 3; k++) {
		const a = k * 2 * Math.PI / 3;
		const x = R * Math.cos(a);
		const z = R * Math.sin(a);
		verts.push([
			x,
			-y,
			z
		]);
	}
	for (let k = 0; k < 3; k++) {
		const a = k * 2 * Math.PI / 3;
		verts.push([
			R * Math.cos(a),
			y,
			R * Math.sin(a)
		]);
	}
	return {
		verts: frame(verts, 1),
		edges: [
			[0, 1],
			[1, 2],
			[2, 0],
			[3, 4],
			[4, 5],
			[5, 3],
			[0, 3],
			[1, 4],
			[2, 5]
		]
	};
}
/** Tricapped trigonal prism — the shape of [ReH9]2−. */
function polyTricapped() {
	const prism = polyPrism();
	const caps = [];
	for (const [i, j] of [
		[0, 1],
		[1, 2],
		[2, 0]
	]) {
		const a = prism.verts[i];
		const b = prism.verts[j];
		const topI = i + 3;
		const topJ = j + 3;
		const c = prism.verts[topI];
		const d = prism.verts[topJ];
		const mid = vscale(vadd(vadd(a, b), vadd(c, d)), .25);
		const normal = vnorm([
			mid[0],
			0,
			mid[2]
		]);
		caps.push(vadd(mid, vscale(normal, .72)));
	}
	const verts = frame([...prism.verts, ...caps], 1);
	return {
		verts,
		edges: edgesByDistance(verts, 1.12)
	};
}
function polyAntiprism() {
	const r = 1;
	const y = r * Math.pow(2, .25) / 2;
	const verts = [];
	for (let k = 0; k < 4; k++) {
		const a = k * Math.PI / 2;
		verts.push([
			r * Math.cos(a),
			-y,
			r * Math.sin(a)
		]);
	}
	for (let k = 0; k < 4; k++) {
		const b = k * Math.PI / 2 + Math.PI / 4;
		verts.push([
			r * Math.cos(b),
			y,
			r * Math.sin(b)
		]);
	}
	return poly(verts, void 0, 1.08);
}
function modulo(i, n) {
	if (n <= 0) return 0;
	return (i % n + n) % n;
}
/** Signed shortest ring offset from a possibly-unwrapped cursor to item i. */
function shortest(i, shown, n) {
	if (n <= 1) return 0;
	let off = i - shown;
	off = modulo(off, n);
	if (off > n / 2) off -= n;
	return off;
}
var tx = (t) => ({ t });
var sub = (t) => ({
	t,
	k: "sub"
});
var sup = (t) => ({
	t,
	k: "sup"
});
function lobesFrom(verts, reach, phase) {
	return verts.map((dir) => {
		const s = dir[0] + dir[1] + dir[2];
		return {
			dir,
			phase: phase === "p" ? s >= 0 ? 1 : -1 : 1,
			reach
		};
	});
}
function central(opts) {
	const placed = opts.poly.verts.map((v, i) => vscale(vnorm(v), opts.dist * (opts.stretch?.[i] ?? 1)));
	const atoms = [{
		el: opts.center,
		at: [
			0,
			0,
			0
		]
	}];
	const bonds = [];
	placed.forEach((at, i) => {
		bonds.push([0, atoms.length]);
		atoms.push({
			el: opts.ligand,
			at
		});
		if (opts.caps) {
			const host = atoms.length - 1;
			addCaps(atoms, bonds, host, opts.caps.el, opts.caps.dist, opts.caps.count);
		}
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
		bondRadius: opts.bondRadius ?? .055,
		guide: placed,
		guideEdges: opts.poly.edges,
		lobes: opts.lobes,
		shellRadius: opts.dist * 1.22
	};
}
function addCaps(atoms, bonds, hostIndex, el, dist, count) {
	const host = atoms[hostIndex].at;
	if (count === 1) {
		bonds.push([hostIndex, atoms.length]);
		atoms.push({
			el,
			at: vadd(host, vscale(vnorm(host), dist))
		});
		return;
	}
	const out = vnorm(host);
	const p = perpendicular(out);
	const q = vnorm(vcross(out, p));
	for (let k = 0; k < count; k++) {
		const ang = k / count * Math.PI * 2 + .4;
		const dir = vnorm(vadd(vadd(vscale(p, Math.cos(ang)), vscale(q, Math.sin(ang))), vscale(out, -.32)));
		bonds.push([hostIndex, atoms.length]);
		atoms.push({
			el,
			at: vadd(host, vscale(dir, dist))
		});
	}
}
function cage(opts) {
	const placed = scaleVerts(opts.poly.verts, opts.dist);
	const atoms = placed.map((at) => ({
		el: opts.el,
		at
	}));
	const bonds = opts.poly.edges.map((e) => [e[0], e[1]]);
	if (opts.cap) {
		const n = placed.length;
		for (let i = 0; i < n; i++) addCaps(atoms, bonds, i, opts.cap.el, opts.cap.dist, 1);
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
		bondRadius: opts.bondRadius ?? .05,
		guide: placed,
		guideEdges: opts.poly.edges,
		lobes: opts.lobes ?? [],
		shellRadius: opts.dist * 1.28
	};
}
function carbonyls(opts) {
	const atoms = [{
		el: opts.metal,
		at: [
			0,
			0,
			0
		]
	}];
	const bonds = [];
	const guide = scaleVerts(opts.poly.verts, 1.2);
	opts.poly.verts.forEach((dir) => {
		const n = vnorm(dir);
		const ci = atoms.length;
		atoms.push({
			el: "C",
			at: vscale(n, 1.2)
		});
		atoms.push({
			el: "O",
			at: vscale(n, 1.78)
		});
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
		atomScale: .92,
		bondRadius: .05,
		guide,
		guideEdges: opts.poly.edges,
		lobes: opts.lobes,
		shellRadius: 2.05
	};
}
var tetra = polyTetra();
var cube = polyCube();
var octa = polyOcta();
var dodeca = polyDodeca();
var icosa = polyIcosa();
var linear = polyLinear();
var trigonal = polyTrigonal();
var tbp = polyTbp();
var sqpy = polySquarePyramid();
var pbp = polyPbp();
var prism = polyPrism();
var tricapped = polyTricapped();
var antiprism = polyAntiprism();
var cubocta = polyCubocta();
var bucky = polyBucky();
function solid(partial) {
	return {
		merkaba: false,
		nodal: false,
		shellRadius: 1.28,
		...partial
	};
}
var SOLIDS = [
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
		summary: "Four electron domains on a sphere land on a tetrahedron. Methane’s hydrogens sit in those four probability peaks.",
		quantum: "A shell is a radial ridge of probability, fixed mainly by n, not a hard ball. The angular part of carbon’s four sp³ hybrids peaks toward the tetrahedron’s vertices. The textbook orbital is an isosurface of |ψ|² — a probability field, not a track.",
		grid: "In the 7-11-12 grids lesson the tetrahedron is the picture offered for the human collective: the simplest Platonic solid, four points, one center. Same shape a carbon atom uses when it holds four bonds.",
		poly: tetra,
		nucleus: true,
		lobes: lobesFrom(tetra.verts, .78, "hybrid"),
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
				lobes: lobesFrom(tetra.verts, .82, "hybrid")
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
				lobes: lobesFrom(tetra.verts, .7, "hybrid")
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
				lobes: lobesFrom(tetra.verts, .95, "hybrid")
			}),
			central({
				id: "nh4",
				name: "Ammonium",
				parts: [
					tx("NH"),
					sub("4"),
					sup("+")
				],
				blurb: "Nitrogen’s four sp³ domains, all bonded. The lone pair of ammonia has been protonated away.",
				note: "NH₃ is a pyramid because one tetrahedral corner is a lone pair. Add a proton and that corner becomes a bond — the ion is a completed tetrahedron.",
				symmetry: "Td",
				detail: "109.5°",
				center: "N",
				poly: tetra,
				dist: 1.12,
				ligand: "H",
				lobes: lobesFrom(tetra.verts, .8, "hybrid")
			})
		]
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
		summary: "Eight vertices, and they are exactly two interlocking tetrahedra. Cubane’s carbons sit on those corners; so do the neighbors of a cesium ion in CsCl.",
		quantum: "The cube and the octahedron are duals: vertices of one are faces of the other, and they share the octahedral group Oh. Eight-coordinate atoms are rarer than six. When they do sit on a cube, the electron domains are the corners, not the face centers.",
		grid: "The grids lesson says Earth prefers a cube, and that the cube contains the merkaba. Turn on Field: the gold and tide tetrahedra are that merkaba. Their eight corners are the cube’s eight corners — a geometric identity, not an extra shape hiding inside.",
		poly: cube,
		merkaba: true,
		nucleus: false,
		lobes: [],
		molecules: [
			cage({
				id: "cubane",
				name: "Cubane",
				parts: [
					tx("C"),
					sub("8"),
					tx("H"),
					sub("8")
				],
				blurb: "Eight carbons, one at each corner, hydrogens pointing outward. A molecule that is a cube.",
				note: "Bond angles are about 90°, not 109.5°. The strain is real and the molecule is still stable enough to isolate. Symmetry Oh — the full symmetry of the cube.",
				symmetry: "Oh",
				detail: "~90°",
				poly: cube,
				dist: 1.2,
				el: "C",
				cap: {
					el: "H",
					dist: .62
				},
				atomScale: .92
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
				atomScale: .92,
				lobes: []
			}),
			(() => {
				const placed = scaleVerts(cube.verts, 1.25);
				const atoms = placed.map((at) => ({
					el: "Si",
					at
				}));
				const bonds = [];
				for (const [i, j] of cube.edges) {
					const mid = vscale(vadd(placed[i], placed[j]), .5);
					const oi = atoms.length;
					atoms.push({
						el: "O",
						at: mid
					});
					bonds.push([i, oi], [j, oi]);
				}
				const nSi = placed.length;
				for (let i = 0; i < nSi; i++) addCaps(atoms, bonds, i, "H", .58, 1);
				return {
					id: "t8",
					name: "Silsesquioxane cube",
					parts: [
						tx("H"),
						sub("8"),
						tx("Si"),
						sub("8"),
						tx("O"),
						sub("12")
					],
					blurb: "Silicons on the cube’s corners, oxygens on the edges. A cage chemists actually build.",
					note: "The T8 core is a molecular cube used as a building block. Carbons in cubane bond to each other; here the edges are Si–O–Si bridges, so the cube is the silicon skeleton.",
					symmetry: "Oh",
					detail: "T8 cage",
					atoms,
					bonds,
					atomScale: .86,
					bondRadius: .045,
					guide: placed,
					guideEdges: cube.edges,
					lobes: [],
					shellRadius: 1.7
				};
			})()
		]
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
		summary: "Six lobes, three axes. The p orbitals of a free atom already point at the octahedron’s vertices — gold one way, tide the other, zero on the discs between.",
		quantum: "Each p orbital has one nodal plane through the nucleus, drawn here as a dim disc. Probability on one side is the opposite phase of the other; |ψ|² itself has no sign, but the phase is why the two lobes belong to one orbital. In an octahedral ligand field the d set splits as well: eg lobes point at ligands, t₂g lobes point between them.",
		grid: "The grids lesson says the Sun prefers an eight-sided solid, an octahedron. Six vertices, eight faces. It is also the dual of the cube assigned there to Earth — vertices and faces swapped, one symmetry group.",
		poly: octa,
		nodal: true,
		nucleus: true,
		lobes: lobesFrom(octa.verts, .92, "p"),
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
				lobes: lobesFrom(octa.verts, .95, "hybrid")
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
				lobes: lobesFrom(octa.verts, .85, "hybrid")
			}),
			central({
				id: "co6",
				name: "Hexaamminecobalt(III)",
				parts: [
					tx("Co(NH"),
					sub("3"),
					tx(")"),
					sub("6"),
					sup("3+")
				],
				blurb: "Six ammonias around cobalt. The nitrogens trace the octahedron; the hydrogens are the caps.",
				note: "A classic Werner complex. The lone pair on each nitrogen points inward, at the metal, which is why the three hydrogens tilt outward. Charge 3+.",
				symmetry: "Oh",
				detail: "90°",
				center: "Co",
				poly: octa,
				dist: 1.28,
				ligand: "N",
				caps: {
					el: "H",
					dist: .58,
					count: 3
				},
				atomScale: .9,
				lobes: lobesFrom(octa.verts, .88, "hybrid")
			})
		]
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
		summary: "Twelve pentagons, twenty vertices. Dodecahedrane puts a CH on each vertex. Water, in gas hydrates, builds the same cage out of hydrogen bonds.",
		quantum: "No s–p–d hybrid set on one atom points at twenty vertices. The dodecahedron shows up as a cage: many atoms, each with ordinary local bonding, the global symmetry Ih. That group is the same one the icosahedron uses — they are duals.",
		grid: "Plato kept the dodecahedron for the cosmos, the fifth solid. The grids lesson doesn’t assign it to a planet; it does say Metatron’s cube contains every Platonic solid, this one included. The rotation group has 60 elements, the largest of the five.",
		poly: dodeca,
		nucleus: false,
		lobes: [],
		molecules: [cage({
			id: "c20h20",
			name: "Dodecahedrane",
			parts: [
				tx("C"),
				sub("20"),
				tx("H"),
				sub("20")
			],
			blurb: "Twenty carbons, each bonded to three neighbors, a hydrogen pointing out. A synthesized Platonic molecule.",
			note: "Paquette’s dodecahedrane. Every face is a pentagon, every angle close to the tetrahedral ideal, which is why this cage is far less strained than cubane.",
			symmetry: "Ih",
			detail: "pentagons",
			poly: dodeca,
			dist: 1.45,
			el: "C",
			cap: {
				el: "H",
				dist: .5
			},
			atomScale: .62,
			bondRadius: .035
		}), cage({
			id: "h2o20",
			name: "Dodecahedral water",
			parts: [
				tx("(H"),
				sub("2"),
				tx("O)"),
				sub("20")
			],
			blurb: "The 5¹² cage of clathrate ice. Twenty oxygens; the hydrogens sit, disordered, along the edges.",
			note: "Methane hydrate and many gas hydrates are built from this cage plus larger ones. Only oxygens are drawn. The edges are hydrogen bonds, not the covalent O–H sticks inside a single water.",
			symmetry: "Ih",
			detail: "H-bond cage",
			poly: dodeca,
			dist: 1.5,
			el: "O",
			atomScale: .7,
			bondRadius: .03
		})]
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
		summary: "Twelve vertices, twenty triangles. closo-borane and carborane are icosahedra you can put in a flask. C₆₀ is the same symmetry with the corners cut off.",
		quantum: "Icosahedral symmetry is forbidden in a periodic crystal — you cannot tile space with 5-fold axes — but a single molecule can have it. Twelve boron atoms, each bonded to five neighbors, is the closo deltahedron. The radial probability is ordinary; the angular skeleton is the icosahedron.",
		grid: "Order-60 rotational symmetry, the alternating group A₅. In the grids lesson, more complex solids are treated as denser encodings. The icosahedron is as complex as a Platonic solid gets.",
		poly: icosa,
		nucleus: false,
		lobes: [],
		molecules: [cage({
			id: "b12",
			name: "closo-Dodecaborate",
			parts: [
				tx("[B"),
				sub("12"),
				tx("H"),
				sub("12"),
				tx("]"),
				sup("2−")
			],
			blurb: "Twelve borons at the icosahedron’s vertices, a hydrogen on each, the whole ion a closed cage.",
			note: "The closo rule: n vertices, n+1 skeletal electron pairs. For B₁₂H₁₂²⁻ that count closes the cage. Elemental boron uses related B₁₂ icosahedra as building blocks.",
			symmetry: "Ih",
			detail: "closo",
			poly: icosa,
			dist: 1.35,
			el: "B",
			cap: {
				el: "H",
				dist: .55
			},
			atomScale: .78,
			bondRadius: .04
		}), (() => {
			const placed = scaleVerts(icosa.verts, 1.35);
			const edge = icosa.edges[0];
			const carbons = /* @__PURE__ */ new Set([edge[0], edge[1]]);
			const atoms = placed.map((at, i) => ({
				el: carbons.has(i) ? "C" : "B",
				at
			}));
			const bonds = icosa.edges.map((e) => [e[0], e[1]]);
			for (let i = 0; i < placed.length; i++) addCaps(atoms, bonds, i, "H", .55, 1);
			return {
				id: "carborane",
				name: "ortho-Carborane",
				parts: [
					tx("C"),
					sub("2"),
					tx("B"),
					sub("10"),
					tx("H"),
					sub("12")
				],
				blurb: "The same icosahedron with two neighboring borons swapped for carbon. A workhorse cage in chemistry.",
				note: "Ortho means the two carbons share an edge. The symmetry drops from Ih to C₂v, but the skeleton you see is still the icosahedron. Hydrogens cap every vertex.",
				symmetry: "C₂v",
				detail: "ortho",
				atoms,
				bonds,
				atomScale: .78,
				bondRadius: .04,
				guide: placed,
				guideEdges: icosa.edges,
				lobes: [],
				shellRadius: 1.75
			};
		})()]
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
		summary: "Two domains. They stand opposite each other because that is as far apart as a sphere allows. Carbon dioxide, acetylene, beryllium hydride.",
		quantum: "sp hybrids point 180° apart. The leftover p orbitals sit perpendicular to the axis and make the π bonds of a triple bond — probability above and below the line, not more vertices on it.",
		poly: linear,
		nucleus: true,
		lobes: lobesFrom(linear.verts, .85, "hybrid"),
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
					{
						el: "O",
						at: [
							-1.25,
							0,
							0
						]
					},
					{
						el: "C",
						at: [
							0,
							0,
							0
						]
					},
					{
						el: "O",
						at: [
							1.25,
							0,
							0
						]
					}
				],
				bonds: [[0, 1], [1, 2]],
				atomScale: 1,
				bondRadius: .06,
				guide: linear.verts.map((v) => vscale(v, 1.25)),
				guideEdges: linear.edges,
				lobes: lobesFrom(linear.verts, .9, "hybrid"),
				shellRadius: 1.55
			},
			{
				id: "c2h2",
				name: "Acetylene",
				parts: [
					tx("C"),
					sub("2"),
					tx("H"),
					sub("2")
				],
				blurb: "H–C≡C–H, still a single straight axis. A triple bond is not a triangle.",
				note: "Each carbon is sp. Two π bonds wrap the C≡C shaft. The hydrogens continue the same line because each carbon has only two domains.",
				symmetry: "D∞h",
				detail: "180°",
				atoms: [
					{
						el: "H",
						at: [
							-1.7,
							0,
							0
						]
					},
					{
						el: "C",
						at: [
							-.7,
							0,
							0
						]
					},
					{
						el: "C",
						at: [
							.7,
							0,
							0
						]
					},
					{
						el: "H",
						at: [
							1.7,
							0,
							0
						]
					}
				],
				bonds: [
					[0, 1],
					[1, 2],
					[2, 3]
				],
				atomScale: 1,
				bondRadius: .055,
				guide: [[
					-.7,
					0,
					0
				], [
					.7,
					0,
					0
				]],
				guideEdges: [[0, 1]],
				lobes: [{
					dir: [
						-1,
						0,
						0
					],
					phase: 1,
					reach: 1.15
				}, {
					dir: [
						1,
						0,
						0
					],
					phase: 1,
					reach: 1.15
				}],
				shellRadius: 1.9
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
					{
						el: "H",
						at: [
							-1.55,
							0,
							0
						]
					},
					{
						el: "C",
						at: [
							-.55,
							0,
							0
						]
					},
					{
						el: "N",
						at: [
							.7,
							0,
							0
						]
					}
				],
				bonds: [[0, 1], [1, 2]],
				atomScale: 1,
				bondRadius: .055,
				guide: [[
					-.55,
					0,
					0
				], [
					.7,
					0,
					0
				]],
				guideEdges: [[0, 1]],
				lobes: lobesFrom(linear.verts, .95, "hybrid"),
				shellRadius: 1.75
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
				lobes: lobesFrom(linear.verts, .85, "hybrid")
			})
		]
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
		summary: "Three domains fill a plane at 120°. Boron trifluoride, nitrate, sulfur trioxide. The leftover p orbital stands perpendicular to the page.",
		quantum: "sp² hybrids lie in the plane and make the σ bonds. The unhybridized p orbital is the π system — in nitrate and SO₃ it is delocalized, which is why all three bonds match. A triangle is not a Platonic solid; it is the regular polygon those three peaks draw.",
		poly: trigonal,
		nucleus: true,
		lobes: lobesFrom(trigonal.verts, .8, "hybrid"),
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
				lobes: lobesFrom(trigonal.verts, .88, "hybrid")
			}),
			central({
				id: "no3",
				name: "Nitrate",
				parts: [
					tx("NO"),
					sub("3"),
					sup("−")
				],
				blurb: "Three oxygens, equal bonds, a resonance average of the π cloud rather than one double bond.",
				note: "D₃h. Drawing one N=O and two N–O would be a lie about the probability: the extra pair is spread over all three oxygens.",
				symmetry: "D₃h",
				detail: "120°",
				center: "N",
				poly: trigonal,
				dist: 1.22,
				ligand: "O",
				lobes: lobesFrom(trigonal.verts, .86, "hybrid")
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
				lobes: lobesFrom(trigonal.verts, .9, "hybrid")
			})
		]
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
		summary: "Five domains cannot make a Platonic solid. The compromise is a triangle in the equator and two atoms on the axis. The two kinds of site are not equivalent.",
		quantum: "Equatorial domains sit at 120° to each other and 90° to the axis. Axial bonds are often longer. Lone pairs, when present (as in SF₄ or ClF₃), prefer the equatorial plane because that gives them more room. There is no regular polyhedron with five vertices.",
		poly: tbp,
		nucleus: true,
		lobes: lobesFrom(tbp.verts, .78, "hybrid"),
		molecules: [central({
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
			stretch: [
				1.14,
				1.14,
				1,
				1,
				1
			],
			atomScale: .9,
			lobes: tbp.verts.map((dir, i) => ({
				dir,
				phase: 1,
				reach: i < 2 ? .95 : .82
			}))
		}), carbonyls({
			id: "feco5",
			name: "Iron pentacarbonyl",
			parts: [tx("Fe(CO)"), sub("5")],
			blurb: "The same bipyramid on a metal. Fe(CO)₅ is fluxional: axial and equatorial carbonyls swap.",
			note: "Berry pseudorotation scrambles the sites without breaking bonds. The static picture is D₃h; the NMR picture, at room temperature, is one averaged carbon.",
			symmetry: "D₃h",
			detail: "fluxional",
			metal: "Fe",
			poly: tbp,
			lobes: lobesFrom(tbp.verts, .85, "hybrid")
		})]
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
		summary: "Five atoms in a pyramid. In BrF₅ the missing sixth corner of an octahedron is a lone pair — the tide lobe under the base.",
		quantum: "Start from an octahedron, replace one ligand with a lone pair, and the remaining five atoms are a square pyramid. The lone pair takes more angular room, so the pyramid is slightly squashed and the central atom sits just below the square. Some metals are square pyramidal with no lone pair; the shape is then just five ligands.",
		poly: sqpy,
		nucleus: true,
		lobes: [...sqpy.verts.map((dir) => ({
			dir,
			phase: 1,
			reach: .78
		})), {
			dir: [
				0,
				-1,
				0
			],
			phase: -1,
			reach: .62
		}],
		molecules: [central({
			id: "brf5",
			name: "Bromine pentafluoride",
			parts: [tx("BrF"), sub("5")],
			blurb: "Four fluorines in a square, one on the axis, and a lone pair completing the octahedron underneath.",
			note: "C₄v. Turn on Field to see the tide lobe — that is the lone pair, not a sixth fluorine. The bonded angles sit near 85°, pushed by that pair.",
			symmetry: "C₄v",
			detail: "lone pair",
			center: "Br",
			poly: sqpy,
			dist: 1,
			ligand: "F",
			lobes: [...scaleVerts(sqpy.verts, 1).map((dir) => ({
				dir,
				phase: 1,
				reach: .85
			})), {
				dir: [
					0,
					-1,
					0
				],
				phase: -1,
				reach: .7
			}]
		})]
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
		summary: "Seven domains. A regular pentagon around the middle, two atoms on the axis. Iodine heptafluoride is the molecule people remember.",
		quantum: "Seven is the first coordination number with several competing polyhedra. The pentagonal bipyramid is the VSEPR ideal for seven bonded domains and no lone pair. Real IF₇ is slightly puckered; the model is the ideal D₅h solid the electron count is aiming at.",
		poly: pbp,
		nucleus: true,
		lobes: lobesFrom(pbp.verts, .72, "hybrid"),
		molecules: [central({
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
			atomScale: .72,
			lobes: lobesFrom(pbp.verts, .8, "hybrid")
		}), (() => {
			const dirs = pbp.verts;
			const atoms = [{
				el: "V",
				at: [
					0,
					0,
					0
				]
			}];
			const bonds = [];
			const guide = scaleVerts(dirs, 1.22);
			dirs.forEach((dir) => {
				const n = vnorm(dir);
				const ci = atoms.length;
				atoms.push({
					el: "C",
					at: vscale(n, 1.22)
				});
				atoms.push({
					el: "N",
					at: vscale(n, 1.78)
				});
				bonds.push([0, ci], [ci, ci + 1]);
			});
			return {
				id: "vcn7",
				name: "Heptacyanovanadate(III)",
				parts: [
					tx("[V(CN)"),
					sub("7"),
					tx("]"),
					sup("4−")
				],
				blurb: "A metal that genuinely prefers this solid. Seven cyanides, pentagonal bipyramid, vanadium(III).",
				note: "Unlike IF₇, this is a complex ion. The carbons are the vertices of the polyhedron; the nitrogens continue outward. Charge 4−.",
				symmetry: "D₅h",
				detail: "idealized",
				atoms,
				bonds,
				atomScale: .88,
				bondRadius: .045,
				guide,
				guideEdges: pbp.edges,
				lobes: lobesFrom(pbp.verts, .85, "hybrid"),
				shellRadius: 2.05
			};
		})()]
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
		summary: "Six ligands usually make an octahedron. W(CH₃)₆ refuses, and sits in a trigonal prism — two triangles, no twist.",
		quantum: "An octahedron is a trigonal antiprism: the two triangles are rotated 60°. A prism has them eclipsed. For most metals the antiprism wins because ligands stay farther apart. Tungsten hexamethyl is the famous exception, helped by the way its d orbitals interact with the methyls.",
		poly: prism,
		nucleus: true,
		lobes: lobesFrom(prism.verts, .75, "hybrid"),
		molecules: [central({
			id: "wme6",
			name: "Tungsten hexamethyl",
			parts: [
				tx("W(CH"),
				sub("3"),
				tx(")"),
				sub("6")
			],
			blurb: "Six methyls, eclipsed in two triangles. Not an octahedron, on purpose.",
			note: "Idealized D₃h. The real molecule distorts slightly, but it does not twist into an octahedron. Each carbon carries three hydrogens, tilted outward.",
			symmetry: "D₃h",
			detail: "eclipsed",
			center: "W",
			poly: prism,
			dist: 1.3,
			ligand: "C",
			caps: {
				el: "H",
				dist: .52,
				count: 3
			},
			atomScale: .82,
			lobes: lobesFrom(prism.verts, .9, "hybrid")
		})]
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
		summary: "Nine hydrides around rhenium. A trigonal prism, plus one hydrogen capping each of the three square faces.",
		quantum: "Nine is past what a simple hybrid picture is for. [ReH₉]²⁻ is the textbook tricapped trigonal prism: six hydrides on the prism, three in the belt. The cage toggle shows that skeleton around the atoms.",
		poly: tricapped,
		nucleus: true,
		lobes: [],
		molecules: [central({
			id: "reh9",
			name: "Enneahydridorhenate",
			parts: [
				tx("[ReH"),
				sub("9"),
				tx("]"),
				sup("2−")
			],
			blurb: "Rhenium and nine hydrogens. The record hydride, and a clean tricapped trigonal prism.",
			note: "D₃h. The three belt hydrogens (the caps) are not the same site as the six prism hydrogens, even though the formula writes them alike. Charge 2−.",
			symmetry: "D₃h",
			detail: "two sites",
			center: "Re",
			poly: tricapped,
			dist: 1.2,
			ligand: "H",
			atomScale: 1,
			lobes: []
		})]
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
		summary: "Eight ligands more often stagger than sit on a cube. Two squares, rotated 45°, is the square antiprism.",
		quantum: "Twisting a cube’s top face by 45° turns square faces into triangles and pushes neighbors apart. That is why [TaF₈]³⁻ and [ZrF₈]⁴⁻ prefer this solid to the cube cubane made famous. Both are legitimate 8-vertex answers; atoms pick by ligand size and electronics.",
		poly: antiprism,
		nucleus: true,
		lobes: lobesFrom(antiprism.verts, .7, "hybrid"),
		molecules: [central({
			id: "taf8",
			name: "Octafluorotantalate",
			parts: [
				tx("[TaF"),
				sub("8"),
				tx("]"),
				sup("3−")
			],
			blurb: "Tantalum(V) inside eight fluorines, staggered into a square antiprism.",
			note: "D₄d idealized. Compare with the cube of CsCl: same number of neighbors, different twist. No lone pair on the metal — Ta(V) is d⁰.",
			symmetry: "D₄d",
			detail: "staggered",
			center: "Ta",
			poly: antiprism,
			dist: 1.25,
			ligand: "F",
			atomScale: .8,
			lobes: lobesFrom(antiprism.verts, .88, "hybrid")
		}), central({
			id: "zrf8",
			name: "Octafluorozirconate",
			parts: [
				tx("[ZrF"),
				sub("8"),
				tx("]"),
				sup("4−")
			],
			blurb: "The same antiprism on zirconium(IV). Eight fluorines, two squares offset by half a turn.",
			note: "Another d⁰ eight-coordinate ion. Cube versus antiprism is the eight-domain version of the question the prism asked at six: eclipsed or staggered?",
			symmetry: "D₄d",
			detail: "staggered",
			center: "Zr",
			poly: antiprism,
			dist: 1.28,
			ligand: "F",
			atomScale: .8,
			lobes: lobesFrom(antiprism.verts, .9, "hybrid")
		})]
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
		summary: "Twelve neighbors, triangles alternating with squares. This is the coordination shell of copper, silver, gold, aluminum — any face-centered cubic metal.",
		quantum: "In a close-packed metal each atom touches twelve others. If the layers stack ABCABC, those twelve trace a cuboctahedron. HCP stacking (ABAB) traces a different 12-vertex solid, the triangular orthobicupola. The count is the same; the twist differs. No localized two-electron bond is pretending to be an orbital lobe here — the vertices are nuclei.",
		poly: cubocta,
		nucleus: true,
		lobes: [],
		molecules: [central({
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
			atomScale: .72,
			bondRadius: .04,
			lobes: []
		})]
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
		summary: "Cut the icosahedron’s twelve vertices off and you get twelve pentagons and twenty hexagons. Buckminsterfullerene puts a carbon on every new vertex.",
		quantum: "C₆₀ is an Archimedean solid, not a Platonic one: two kinds of face, one kind of vertex. Every carbon is sp², bonded to three neighbors, with a delocalized π cloud over the cage. The pentagons are required — Euler’s formula won’t close a sphere of only hexagons. Sixty atoms, ninety bonds, symmetry Ih, the same group as the icosahedron and the dodecahedron.",
		grid: "The grids lesson asks whether information could be encoded with more than the Platonic solids. A fullerene is one earthly answer: a truncated icosahedron, still Ih, no longer regular, and stable enough to dissolve in toluene.",
		poly: bucky,
		nucleus: false,
		lobes: [],
		shellRadius: 1.35,
		molecules: [cage({
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
			atomScale: .42,
			bondRadius: .028
		})]
	})
];
SOLIDS.length;
var ELEMENTS = {
	H: {
		color: "#f3efe6",
		radius: .26,
		name: "Hydrogen"
	},
	C: {
		color: "#9aa1ab",
		radius: .38,
		name: "Carbon"
	},
	N: {
		color: "#6f9e96",
		radius: .38,
		name: "Nitrogen"
	},
	O: {
		color: "#d06a58",
		radius: .36,
		name: "Oxygen"
	},
	F: {
		color: "#8fbf9a",
		radius: .34,
		name: "Fluorine"
	},
	Cl: {
		color: "#9aaa72",
		radius: .46,
		name: "Chlorine"
	},
	Br: {
		color: "#c4784e",
		radius: .5,
		name: "Bromine"
	},
	I: {
		color: "#9a78b0",
		radius: .54,
		name: "Iodine"
	},
	S: {
		color: "#e0b15a",
		radius: .46,
		name: "Sulfur"
	},
	P: {
		color: "#d4894a",
		radius: .46,
		name: "Phosphorus"
	},
	B: {
		color: "#e0b7c4",
		radius: .36,
		name: "Boron"
	},
	Be: {
		color: "#c5d4a8",
		radius: .34,
		name: "Beryllium"
	},
	Si: {
		color: "#d8c6a2",
		radius: .44,
		name: "Silicon"
	},
	Fe: {
		color: "#d2b49a",
		radius: .48,
		name: "Iron",
		metal: true
	},
	Mo: {
		color: "#b7c4d6",
		radius: .5,
		name: "Molybdenum",
		metal: true
	},
	W: {
		color: "#9aa8c2",
		radius: .5,
		name: "Tungsten",
		metal: true
	},
	Ta: {
		color: "#b9b4c9",
		radius: .5,
		name: "Tantalum",
		metal: true
	},
	Re: {
		color: "#c2b7a4",
		radius: .5,
		name: "Rhenium",
		metal: true
	},
	Cs: {
		color: "#e0c98a",
		radius: .62,
		name: "Cesium",
		metal: true
	},
	Cu: {
		color: "#d08a62",
		radius: .44,
		name: "Copper",
		metal: true
	},
	Zr: {
		color: "#aeb8c4",
		radius: .5,
		name: "Zirconium",
		metal: true
	},
	Co: {
		color: "#c49a9a",
		radius: .46,
		name: "Cobalt",
		metal: true
	},
	V: {
		color: "#8f9aa8",
		radius: .46,
		name: "Vanadium",
		metal: true
	}
};
var view = {
	yaw: .64,
	pitch: .26,
	zoom: 1,
	shown: 0,
	target: 0,
	dragging: false,
	moved: false,
	reduce: false
};
function countOf(mode, shape) {
	return mode === "shapes" ? SOLIDS.length : SOLIDS[shape].molecules.length;
}
function jumpTo(index, n) {
	let k = modulo(index, n);
	const cur = view.target;
	while (k < cur - n / 2) k += n;
	while (k > cur + n / 2) k -= n;
	view.target = k;
}
var useStore = create((set, get) => ({
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
		view.yaw = .64;
		view.pitch = .26;
		set({
			mode: "molecules",
			mol: 0,
			hover: null,
			notes: false
		});
	},
	closeMolecules: () => {
		const shape = get().shape;
		view.shown = shape;
		view.target = shape;
		view.zoom = 1;
		set({
			mode: "shapes",
			hover: null,
			notes: false
		});
	},
	toggle: (key) => {
		const current = get()[key];
		set({ [key]: !current });
	},
	setHover: (hover) => set({ hover }),
	resetView: () => {
		view.yaw = .64;
		view.pitch = .26;
		view.zoom = 1;
	}
}));
function Formula({ parts }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-display text-2xl leading-none text-gold",
		children: parts.map((part, i) => {
			if (part.k === "sub") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sub", { children: part.t }, i);
			if (part.k === "sup") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sup", { children: part.t }, i);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part.t }, i);
		})
	});
}
function Toggle({ pressed, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": pressed,
		onClick,
		className: pressed ? "h-11 rounded-full border border-gold px-3 text-sm text-gold" : "h-11 rounded-full border border-line px-3 text-sm text-muted",
		children: label
	});
}
function Hud() {
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
	const stripRef = (0, import_react.useRef)(null);
	const solid = SOLIDS[shape] ?? SOLIDS[0];
	const molecule = solid.molecules[mol] ?? solid.molecules[0];
	const index = mode === "shapes" ? shape : mol;
	const total = mode === "shapes" ? SOLIDS.length : solid.molecules.length;
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
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
	(0, import_react.useEffect)(() => {
		const root = stripRef.current;
		if (!root) return;
		root.querySelector("[data-active='true']")?.scrollIntoView({
			behavior: view.reduce ? "auto" : "smooth",
			inline: "center",
			block: "nearest"
		});
	}, [
		mode,
		shape,
		mol
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "scrim-top pointer-events-none absolute inset-x-0 top-0 z-10" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "scrim-bottom pointer-events-none absolute inset-x-0 bottom-0 z-10" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "safe-top safe-x pointer-events-none absolute inset-x-0 top-0 z-20",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl leading-none text-fg",
					children: "Valence"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "Shells, orbitals, and Platonic solids"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "pointer-events-auto h-11 rounded-full border border-line bg-surface/80 px-4 text-sm text-gold",
					onClick: () => toggle("about"),
					children: "About"
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": mode === "shapes" ? "Previous shape" : "Previous molecule",
			className: "absolute top-24 left-3 z-20 grid size-11 place-items-center rounded-full border border-line bg-surface/80 text-fg",
			onClick: () => step(-1),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { "aria-hidden": "true" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": mode === "shapes" ? "Next shape" : "Next molecule",
			className: "absolute top-24 right-3 z-20 grid size-11 place-items-center rounded-full border border-line bg-surface/80 text-fg",
			onClick: () => step(1),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { "aria-hidden": "true" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
			className: "safe-bot safe-x pointer-events-none absolute inset-x-0 bottom-0 z-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: stripRef,
				className: "filmstrip pointer-events-auto mb-3 flex items-center gap-2",
				"aria-label": mode === "shapes" ? "Shapes" : "Molecules",
				children: [mode === "molecules" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-11 shrink-0 rounded-full border border-line px-3 text-sm text-gold",
					onClick: closeMolecules,
					children: "All shapes"
				}), mode === "shapes" ? SOLIDS.map((item, i) => {
					const prev = SOLIDS[i - 1];
					const showFamily = !prev || prev.family !== item.family;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex shrink-0 items-center gap-2",
						children: [showFamily && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-1 text-xs tracking-widest text-gold uppercase",
							children: item.family === "Platonic solid" ? "Platonic" : item.family === "Domain geometry" ? "Domains" : "Polyhedra"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-active": i === shape,
							className: i === shape ? "h-11 rounded-full border border-gold px-3 text-sm whitespace-nowrap text-fg" : "h-11 rounded-full border border-line px-3 text-sm whitespace-nowrap text-muted",
							onClick: () => go(i),
							children: item.name
						})]
					}, item.id);
				}) : solid.molecules.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-active": i === mol,
					className: i === mol ? "h-11 shrink-0 rounded-full border border-gold px-3 text-sm whitespace-nowrap text-fg" : "h-11 shrink-0 rounded-full border border-line px-3 text-sm whitespace-nowrap text-muted",
					onClick: () => go(i),
					children: item.name
				}, item.id))]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto rounded-2xl border border-line bg-surface/90 p-4 backdrop-blur-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs tracking-widest text-gold uppercase",
						children: [mode === "shapes" ? solid.family : solid.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [
								" ",
								"· ",
								index + 1,
								" / ",
								total
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl leading-none text-fg md:text-3xl",
							children: mode === "shapes" ? solid.name : molecule.name
						}), mode === "molecules" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Formula, { parts: molecule.parts })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed text-fg",
						children: mode === "shapes" ? solid.summary : molecule.blurb
					}),
					hover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-tide",
						children: hover
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-line px-2.5 py-1 text-xs text-muted",
								children: mode === "shapes" ? solid.symmetry : molecule.symmetry
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-line px-2.5 py-1 text-xs text-muted",
								children: mode === "shapes" ? solid.hybrid : molecule.detail
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-line px-2.5 py-1 text-xs text-muted",
								children: mode === "shapes" ? solid.angle : `${solid.v} vertices`
							})
						]
					}),
					notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sheet-scroll mt-3 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-muted",
								children: mode === "shapes" ? solid.quantum : molecule.note
							}),
							mode === "shapes" && solid.grid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-tide",
								children: solid.grid
							}),
							mode === "shapes" && solid.f != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									solid.v,
									" vertices · ",
									solid.e,
									" edges · ",
									solid.f,
									" faces"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "filmstrip mt-3 flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								pressed: field,
								label: "Field",
								onClick: () => toggle("field")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								pressed: shell,
								label: "Shell",
								onClick: () => toggle("shell")
							}),
							mode === "molecules" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								pressed: cage,
								label: "Cage",
								onClick: () => toggle("cage")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								pressed: spin,
								label: "Spin",
								onClick: () => toggle("spin")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								pressed: notes,
								label: "Notes",
								onClick: () => toggle("notes")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Reset view",
								className: "grid size-11 place-items-center rounded-full border border-line text-muted",
								onClick: resetView,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
									"aria-hidden": "true",
									className: "size-4"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-3",
						children: [mode === "shapes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-11 rounded-full bg-gold px-4 text-sm text-ink",
							onClick: openMolecules,
							children: "Show molecules"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-11 rounded-full bg-gold px-4 text-sm text-ink",
							onClick: closeMolecules,
							children: "Back to shapes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Drag turns · pinch or scroll zooms · swipe or arrows move"
						})]
					}),
					field && (mode === "shapes" ? solid.nodal : molecule.lobes.some((l) => l.phase < 0)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gold",
								children: "Gold"
							}),
							" and ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-tide",
								children: "tide"
							}),
							" are opposite phases of one orbital. The dim discs are nodes, where probability is zero."
						]
					})
				]
			})]
		}),
		about && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "safe-top safe-bot safe-x absolute inset-0 z-30 overflow-auto bg-ink/95",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-xl py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-4xl leading-none text-fg",
						children: "Why these solids"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 rounded-full border border-line px-4 text-sm text-gold",
						onClick: () => toggle("about"),
						children: "Close"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 space-y-4 text-sm leading-relaxed text-fg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A valence shell is not a track an electron runs on. In the quantum picture the electron is a standing wave. The principal number n sets how far out the radial probability peaks. The angles come from how those waves interfere. Draw the surface where the probability is constant and you get the orbital pictures from a textbook. That surface is an isosurface of |ψ|²." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Put several valence domains on one atom and they settle as far apart as they can. Two domains make a line. Three, a triangle. Four, a tetrahedron. Five cannot make a Platonic solid, so they compromise on a trigonal bipyramid. Six prefer an octahedron. The five Platonic solids are the only convex regular polyhedra, and three of them — tetrahedron, octahedron, cube — are ordinary coordination shapes. The icosahedron and dodecahedron show up as cages." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The sequence here starts with those five, then the other polyhedra atoms actually use: the bipyramids, the prism tungsten hexamethyl prefers over an octahedron, the square antiprism of eight-coordinate fluorides, the cuboctahedron of a copper atom’s twelve neighbors, and the truncated icosahedron of C₆₀." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-tide",
							children: "The 7-11-12 grids lesson treats the same solids as a geometric language. It pictures the human collective as a tetrahedron, the Earth grid as a cube that contains the merkaba, and the Sun as an octahedron. Turn on Field while the cube is in front: the gold and tide tetrahedra are that merkaba, and their eight corners are the cube’s eight corners. Metatron’s cube is named in that lesson as the figure that contains all five Platonic solids. This instrument does not try to prove that teaching. It sets the same shapes next to the probability fields and the molecules where the geometry is measured."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Field draws the lobes. On the octahedron they are the three p orbitals — opposite phases, and a node through the nucleus. On methane they are the four sp³ hybrids pointing at the hydrogens. Shell draws the radial ridge those lobes sit on, not a hard surface. Cage, on a molecule, draws the polyhedron the nuclei are tracing." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: "Idealized geometries. Gas-phase PCl₅ is the bipyramid; the solid salt is not. IF₇ puckers a little. W(CH₃)₆ is slightly distorted and still not an octahedron. The Sun, Earth, and human assignments are from the grids lesson of Universal Consciousness by Douglas Butner, not from the Schrödinger equation."
						})
					]
				})]
			})
		})
	] });
}
/** WebGL-side colors. DOM colors live as tokens in styles.css — keep these in step. */
var PAL = {
	ink: "#08090c",
	paper: "#ebe6dc",
	gold: "#e0b15a",
	tide: "#6f9e96",
	muted: "#9a9386",
	bond: "#8a8175",
	lone: "#6f9e96"
};
var GAP = 2.75;
var lobeVert = `
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
var lobeFrag = `
  uniform vec3 uColor;
  varying vec3 vN;
  void main() {
    float ndv = abs(normalize(vN).z);
    float alpha = pow(ndv, 1.15) * 0.42;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;
var shellFrag = `
  uniform vec3 uColor;
  varying vec3 vN;
  void main() {
    float ndv = abs(normalize(vN).z);
    float rim = pow(1.0 - ndv, 2.1);
    gl_FragColor = vec4(uColor, rim * 0.7);
  }
`;
function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
}
function useSpinAndSettle() {
	const last = (0, import_react.useRef)("");
	useFrame((_, delta) => {
		const dt = Math.min(delta, .05);
		const mode = useStore.getState().mode;
		const shape = useStore.getState().shape;
		const n = mode === "shapes" ? SOLIDS.length : (SOLIDS[shape] ?? SOLIDS[0]).molecules.length;
		if (!view.dragging) {
			const k = 1 - Math.exp(-12 * dt);
			view.shown += (view.target - view.shown) * k;
			if (useStore.getState().spin && !view.reduce) view.yaw += dt * .28;
			if (Math.abs(view.shown - view.target) < 8e-4 && n > 0) {
				const shift = Math.round(view.shown / n) * n;
				if (Math.abs(shift) >= n) {
					view.shown -= shift;
					view.target -= shift;
				}
			}
		}
		const idx = modulo(Math.round(view.shown), n);
		const key = `${mode}:${idx}`;
		if (last.current !== key) {
			last.current = key;
			if (mode === "shapes") useStore.setState({
				shape: idx,
				hover: null
			});
			else useStore.setState({
				mol: idx,
				hover: null
			});
		}
	});
}
function CameraRig() {
	const camera = useThree((s) => s.camera);
	const size = useThree((s) => s.size);
	useFrame(() => {
		const cam = camera;
		const fov = 40;
		cam.fov = fov;
		const tan = Math.tan(MathUtils.degToRad(fov / 2));
		const aspect = Math.max(size.width / Math.max(size.height, 1), .25);
		const zForH = 2.7 / tan;
		const zForW = 1.32 / (tan * aspect);
		const z = Math.max(zForH, zForW) / clamp(view.zoom, .7, 1.45);
		cam.position.set(0, 0, z);
		cam.lookAt(0, 0, 0);
		cam.updateProjectionMatrix();
	});
	return null;
}
function Stars() {
	const ref = (0, import_react.useRef)(null);
	const geo = (0, import_react.useMemo)(() => {
		const g = new BufferGeometry();
		const a = /* @__PURE__ */ new Float32Array(1260);
		for (let i = 0; i < 420; i++) {
			const r = 14 + Math.random() * 28;
			const th = Math.random() * Math.PI * 2;
			const ph = Math.acos(2 * Math.random() - 1);
			a[i * 3] = r * Math.sin(ph) * Math.cos(th);
			a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
			a[i * 3 + 2] = r * Math.cos(ph);
		}
		g.setAttribute("position", new BufferAttribute(a, 3));
		return g;
	}, []);
	(0, import_react.useEffect)(() => () => geo.dispose(), [geo]);
	useFrame((_, delta) => {
		if (ref.current && !view.reduce) ref.current.rotation.y += Math.min(delta, .05) * .012;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("points", {
		ref,
		geometry: geo,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointsMaterial", {
			color: PAL.paper,
			size: .045,
			sizeAttenuation: true,
			transparent: true,
			opacity: .45,
			depthWrite: false
		})
	});
}
function Tubes({ verts, edges, radius, color, opacity = 1 }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		const mesh = ref.current;
		if (!mesh) return;
		const m = new Matrix4();
		const q = new Quaternion();
		const up = new Vector3(0, 1, 0);
		const dir = new Vector3();
		const mid = new Vector3();
		edges.forEach(([i, j], n) => {
			const a = verts[i];
			const b = verts[j];
			if (!a || !b) return;
			dir.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
			const len = dir.length() || 1;
			mid.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
			dir.multiplyScalar(1 / len);
			q.setFromUnitVectors(up, dir);
			m.compose(mid, q, new Vector3(1, len, 1));
			mesh.setMatrixAt(n, m);
		});
		mesh.instanceMatrix.needsUpdate = true;
	}, [verts, edges]);
	if (edges.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref,
		args: [
			void 0,
			void 0,
			edges.length
		],
		raycast: () => {},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			radius,
			radius,
			1,
			8,
			1
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color,
			emissive: color,
			emissiveIntensity: opacity < 1 ? .25 : .45,
			roughness: .42,
			metalness: .08,
			transparent: opacity < 1,
			opacity,
			depthWrite: opacity >= 1
		})]
	});
}
function Dots({ verts, radius, color }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		const mesh = ref.current;
		if (!mesh) return;
		const m = new Matrix4();
		const q = new Quaternion();
		verts.forEach((v, i) => {
			m.compose(new Vector3(v[0], v[1], v[2]), q, new Vector3(1, 1, 1));
			mesh.setMatrixAt(i, m);
		});
		mesh.instanceMatrix.needsUpdate = true;
	}, [verts]);
	if (verts.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref,
		args: [
			void 0,
			void 0,
			verts.length
		],
		raycast: () => {},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			radius,
			16,
			12
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color,
			emissive: color,
			emissiveIntensity: .35,
			roughness: .4
		})]
	});
}
function LobeMesh({ lobe }) {
	const dir = (0, import_react.useMemo)(() => new Vector3(lobe.dir[0], lobe.dir[1], lobe.dir[2]).normalize(), [lobe.dir]);
	const quat = (0, import_react.useMemo)(() => {
		const q = new Quaternion();
		q.setFromUnitVectors(new Vector3(0, 1, 0), dir);
		return q;
	}, [dir]);
	const reach = lobe.reach * 1.2;
	const radial = .15;
	const halfLen = reach * .46;
	const color = (0, import_react.useMemo)(() => new Color(lobe.phase < 0 ? PAL.tide : PAL.gold), [lobe.phase]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		quaternion: quat,
		position: dir.clone().multiplyScalar(reach * .58),
		scale: [
			radial,
			halfLen,
			radial
		],
		renderOrder: 3,
		raycast: () => {},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			28,
			18
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("shaderMaterial", {
			transparent: true,
			depthWrite: false,
			blending: 2,
			toneMapped: false,
			uniforms: { uColor: { value: color } },
			vertexShader: lobeVert,
			fragmentShader: lobeFrag
		})]
	});
}
function Probability({ lobes }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: lobes.map((lobe, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LobeMesh, { lobe }, i)) });
}
function Shell({ radius }) {
	const color = (0, import_react.useMemo)(() => new Color(PAL.gold), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		renderOrder: 2,
		raycast: () => {},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			radius,
			48,
			32
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("shaderMaterial", {
			transparent: true,
			depthWrite: false,
			side: 2,
			toneMapped: false,
			uniforms: { uColor: { value: color } },
			vertexShader: lobeVert,
			fragmentShader: shellFrag
		})]
	});
}
function NodeDiscs() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: [
		0,
		1,
		2
	].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		raycast: () => {},
		rotation: i === 1 ? [
			Math.PI / 2,
			0,
			0
		] : i === 2 ? [
			0,
			0,
			Math.PI / 2
		] : [
			0,
			0,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [.62, 48] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color: PAL.muted,
			transparent: true,
			opacity: .14,
			side: 2,
			depthWrite: false
		})]
	}, i)) });
}
function placeSlide(group, index, count, dt) {
	const off = shortest(index, view.shown, count);
	const ad = Math.abs(off);
	group.visible = ad < 1.65;
	group.position.x = off * GAP;
	group.position.y = .78;
	group.position.z = -Math.min(ad, 1) * .35;
	const s = ad < .4 ? .74 : .4;
	const focus = Math.max(0, 1 - ad);
	const k = 1 - Math.exp(-10 * dt);
	group.scale.setScalar(MathUtils.lerp(group.scale.x || s, s, k));
	group.rotation.y = view.yaw;
	group.rotation.x = view.pitch * focus;
}
function ShapeSlide({ solid, index }) {
	const ref = (0, import_react.useRef)(null);
	const field = useStore((s) => s.field);
	const shell = useStore((s) => s.shell);
	const count = SOLIDS.length;
	const merk = (0, import_react.useMemo)(() => solid.merkaba ? merkabaEdges(solid.poly.verts) : null, [solid]);
	useFrame((_, delta) => {
		if (ref.current) placeSlide(ref.current, index, count, Math.min(delta, .05));
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tubes, {
				verts: solid.poly.verts,
				edges: solid.poly.edges,
				radius: .048,
				color: PAL.paper
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dots, {
				verts: solid.poly.verts,
				radius: .055,
				color: PAL.paper
			}),
			solid.nucleus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				raycast: () => {},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					.09,
					20,
					16
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: PAL.paper,
					emissive: PAL.paper,
					emissiveIntensity: .2,
					roughness: .35
				})]
			}),
			field && merk && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tubes, {
				verts: solid.poly.verts,
				edges: merk.a,
				radius: .012,
				color: PAL.gold
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tubes, {
				verts: solid.poly.verts,
				edges: merk.b,
				radius: .012,
				color: PAL.tide
			})] }),
			field && solid.lobes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Probability, { lobes: solid.lobes }),
			field && solid.nodal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeDiscs, {}),
			shell && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { radius: solid.shellRadius }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				onClick: (e) => {
					e.stopPropagation();
					if (view.moved) return;
					if (Math.abs(shortest(index, view.shown, count)) > .35) useStore.getState().go(index);
					else useStore.getState().openMolecules();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1.12,
					16,
					12
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					transparent: true,
					opacity: 0,
					depthWrite: false
				})]
			})
		]
	});
}
function AtomCloud({ el, atoms, scale, focused }) {
	const ref = (0, import_react.useRef)(null);
	const spec = ELEMENTS[el] ?? {
		color: PAL.paper,
		radius: .36,
		name: el,
		metal: false
	};
	(0, import_react.useLayoutEffect)(() => {
		const mesh = ref.current;
		if (!mesh) return;
		const m = new Matrix4();
		const q = new Quaternion();
		atoms.forEach((a, i) => {
			m.compose(new Vector3(a.at[0], a.at[1], a.at[2]), q, new Vector3(1, 1, 1));
			mesh.setMatrixAt(i, m);
		});
		mesh.instanceMatrix.needsUpdate = true;
	}, [atoms]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref,
		args: [
			void 0,
			void 0,
			atoms.length
		],
		onPointerOver: (e) => {
			e.stopPropagation();
			if (!focused) return;
			if (e.instanceId == null) return;
			useStore.getState().setHover(spec.name);
		},
		onPointerOut: () => {
			if (useStore.getState().hover === spec.name) useStore.getState().setHover(null);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			spec.radius * scale,
			focused ? 28 : 12,
			focused ? 20 : 10
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: spec.color,
			emissive: spec.color,
			emissiveIntensity: spec.metal ? .12 : .06,
			roughness: spec.metal ? .28 : .42,
			metalness: spec.metal ? .55 : .04
		})]
	});
}
function MolSlide({ mol, index, count }) {
	const ref = (0, import_react.useRef)(null);
	const field = useStore((s) => s.field);
	const shell = useStore((s) => s.shell);
	const cage = useStore((s) => s.cage);
	const focused = useStore((s) => s.mol) === index;
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		mol.atoms.forEach((a, i) => {
			const list = map.get(a.el) ?? [];
			list.push({
				at: a.at,
				index: i
			});
			map.set(a.el, list);
		});
		return [...map.entries()];
	}, [mol]);
	useFrame((_, delta) => {
		if (ref.current) placeSlide(ref.current, index, count, Math.min(delta, .05));
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref,
		onClick: (e) => {
			e.stopPropagation();
			if (view.moved) return;
			if (Math.abs(shortest(index, view.shown, count)) > .35) useStore.getState().go(index);
		},
		children: [
			cage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tubes, {
				verts: mol.guide,
				edges: mol.guideEdges,
				radius: .012,
				color: PAL.tide,
				opacity: .55
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tubes, {
				verts: mol.atoms.map((a) => a.at),
				edges: mol.bonds,
				radius: mol.bondRadius,
				color: PAL.bond
			}),
			grouped.map(([el, atoms]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtomCloud, {
				el,
				atoms,
				scale: mol.atomScale,
				focused
			}, el)),
			field && mol.lobes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Probability, { lobes: mol.lobes }),
			shell && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { radius: mol.shellRadius }),
			!focused && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				onClick: (e) => {
					e.stopPropagation();
					if (view.moved) return;
					useStore.getState().go(index);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1.15,
					12,
					10
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					transparent: true,
					opacity: 0,
					depthWrite: false
				})]
			})
		]
	});
}
function Carousel() {
	const mode = useStore((s) => s.mode);
	const solid = SOLIDS[useStore((s) => s.shape)] ?? SOLIDS[0];
	useSpinAndSettle();
	if (mode === "molecules") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: solid.molecules.map((mol, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MolSlide, {
		mol,
		index,
		count: solid.molecules.length
	}, mol.id)) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: SOLIDS.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShapeSlide, {
		solid: item,
		index
	}, item.id)) });
}
function Gestures() {
	const gl = useThree((s) => s.gl);
	(0, import_react.useEffect)(() => {
		const el = gl.domElement;
		el.style.touchAction = "none";
		const pointers = /* @__PURE__ */ new Map();
		let mode = "none";
		let lastX = 0;
		let lastY = 0;
		let startX = 0;
		let startY = 0;
		let pinDist = 0;
		const pairDist = () => {
			const p = [...pointers.values()];
			if (p.length < 2 || !p[0] || !p[1]) return 0;
			return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
		};
		const down = (e) => {
			el.setPointerCapture(e.pointerId);
			pointers.set(e.pointerId, {
				x: e.clientX,
				y: e.clientY
			});
			view.dragging = true;
			view.moved = false;
			if (pointers.size >= 2) {
				mode = "pinch";
				pinDist = pairDist();
			} else {
				mode = "none";
				startX = lastX = e.clientX;
				startY = lastY = e.clientY;
			}
		};
		const move = (e) => {
			if (!pointers.has(e.pointerId)) return;
			pointers.set(e.pointerId, {
				x: e.clientX,
				y: e.clientY
			});
			if (pointers.size >= 2) {
				const d = pairDist();
				if (pinDist > 0 && d > 0) view.zoom = clamp(view.zoom * (d / pinDist), .72, 1.5);
				pinDist = d;
				view.moved = true;
				mode = "pinch";
				return;
			}
			const dx = e.clientX - lastX;
			const dy = e.clientY - lastY;
			lastX = e.clientX;
			lastY = e.clientY;
			const adx = Math.abs(e.clientX - startX);
			const ady = Math.abs(e.clientY - startY);
			if (mode === "none" && adx + ady > 8) {
				view.moved = true;
				mode = e.pointerType === "touch" && adx > ady * 1.28 ? "scrub" : "rotate";
			}
			if (mode === "rotate") {
				view.moved = true;
				view.yaw += dx * .0085;
				view.pitch = clamp(view.pitch + dy * .006, -1.15, 1.15);
			} else if (mode === "scrub") {
				view.moved = true;
				const deltaSlides = -dx / 150;
				view.shown += deltaSlides;
				view.target = view.shown;
			}
		};
		const up = (e) => {
			pointers.delete(e.pointerId);
			if (pointers.size === 0) {
				if (mode === "scrub") view.target = Math.round(view.shown);
				mode = "none";
				view.dragging = false;
			} else if (pointers.size === 1) {
				const p = [...pointers.values()][0];
				if (p) {
					lastX = startX = p.x;
					lastY = startY = p.y;
				}
				mode = "rotate";
			}
		};
		const wheel = (e) => {
			e.preventDefault();
			if (e.ctrlKey) {
				view.zoom = clamp(view.zoom * Math.exp(-e.deltaY * .008), .72, 1.5);
				return;
			}
			if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > .5) {
				view.shown += e.deltaX / 220;
				view.target = Math.round(view.shown);
			} else view.zoom = clamp(view.zoom * Math.exp(-e.deltaY * .0011), .72, 1.5);
		};
		const menu = (e) => e.preventDefault();
		el.addEventListener("pointerdown", down);
		el.addEventListener("pointermove", move);
		el.addEventListener("pointerup", up);
		el.addEventListener("pointercancel", up);
		el.addEventListener("wheel", wheel, { passive: false });
		el.addEventListener("contextmenu", menu);
		return () => {
			el.removeEventListener("pointerdown", down);
			el.removeEventListener("pointermove", move);
			el.removeEventListener("pointerup", up);
			el.removeEventListener("pointercancel", up);
			el.removeEventListener("wheel", wheel);
			el.removeEventListener("contextmenu", menu);
		};
	}, [gl]);
	return null;
}
function Scene() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: [PAL.ink]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .55 }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				4.5,
				6.5,
				5
			],
			intensity: 1.45,
			color: "#fff4e2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				-5,
				-1.5,
				-3
			],
			intensity: .4,
			color: PAL.tide
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Carousel, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraRig, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gestures, {})
	] });
}
function Stage() {
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const apply = () => {
			view.reduce = mq.matches;
		};
		apply();
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
		className: "stage-canvas",
		dpr: [1, 1.6],
		gl: {
			antialias: true,
			alpha: false,
			powerPreference: "high-performance"
		},
		camera: {
			position: [
				0,
				.05,
				7.2
			],
			fov: 40,
			near: .08,
			far: 80
		},
		onCreated: ({ gl }) => {
			gl.setClearColor(PAL.ink, 1);
			gl.toneMapping = 4;
			gl.toneMappingExposure = 1.08;
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {})
	});
}
function Home() {
	const [on, setOn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setOn(true), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh w-full overflow-hidden bg-ink text-fg",
		children: [on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-ink",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {})]
	});
}
//#endregion
export { Home as component };
