import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ELEMENTS, SOLIDS, type Lobe, type Molecule, type Solid } from "@/lib/catalog";
import { merkabaEdges, modulo, shortest, type Edge, type Vec3 } from "@/lib/geom";
import { PAL } from "@/lib/palette";
import { useStore, view } from "@/lib/store";

const GAP = 2.75;
const lobeVert = /* glsl */ `
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const lobeFrag = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vN;
  void main() {
    float ndv = abs(normalize(vN).z);
    float alpha = pow(ndv, 1.15) * 0.42;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;
const shellFrag = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vN;
  void main() {
    float ndv = abs(normalize(vN).z);
    float rim = pow(1.0 - ndv, 2.1);
    gl_FragColor = vec4(uColor, rim * 0.7);
  }
`;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function useSpinAndSettle() {
  const last = useRef("");
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const mode = useStore.getState().mode;
    const shape = useStore.getState().shape;
    const n = mode === "shapes" ? SOLIDS.length : (SOLIDS[shape] ?? SOLIDS[0]!).molecules.length;
    if (!view.dragging) {
      const k = 1 - Math.exp(-12 * dt);
      view.shown += (view.target - view.shown) * k;
      if (useStore.getState().spin && !view.reduce) view.yaw += dt * 0.28;
      if (Math.abs(view.shown - view.target) < 0.0008 && n > 0) {
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
      if (mode === "shapes") useStore.setState({ shape: idx, hover: null });
      else useStore.setState({ mol: idx, hover: null });
    }
  });
}

function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const fov = 40;
    cam.fov = fov;
    const tan = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const aspect = Math.max(size.width / Math.max(size.height, 1), 0.25);
    const zForH = 2.7 / tan;
    const zForW = 1.32 / (tan * aspect);
    const z = Math.max(zForH, zForW) / clamp(view.zoom, 0.7, 1.45);
    cam.position.set(0, 0, z);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  });
  return null;
}

function Stars() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const a = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i++) {
      const r = 14 + Math.random() * 28;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      a[i * 3] = r * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      a[i * 3 + 2] = r * Math.cos(ph);
    }
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((_, delta) => {
    if (ref.current && !view.reduce) ref.current.rotation.y += Math.min(delta, 0.05) * 0.012;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={PAL.paper} size={0.045} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
    </points>
  );
}

function Tubes({
  verts,
  edges,
  radius,
  color,
  opacity = 1,
}: {
  verts: Vec3[];
  edges: Edge[];
  radius: number;
  color: string;
  opacity?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    const mid = new THREE.Vector3();
    edges.forEach(([i, j], n) => {
      const a = verts[i];
      const b = verts[j];
      if (!a || !b) return;
      dir.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      const len = dir.length() || 1;
      mid.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
      dir.multiplyScalar(1 / len);
      q.setFromUnitVectors(up, dir);
      m.compose(mid, q, new THREE.Vector3(1, len, 1));
      mesh.setMatrixAt(n, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [verts, edges]);
  if (edges.length === 0) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, edges.length]} raycast={() => {}}>
      <cylinderGeometry args={[radius, radius, 1, 8, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={opacity < 1 ? 0.25 : 0.45}
        roughness={0.42}
        metalness={0.08}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity >= 1}
      />
    </instancedMesh>
  );
}

function Dots({ verts, radius, color }: { verts: Vec3[]; radius: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    verts.forEach((v, i) => {
      m.compose(new THREE.Vector3(v[0], v[1], v[2]), q, new THREE.Vector3(1, 1, 1));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [verts]);
  if (verts.length === 0) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, verts.length]} raycast={() => {}}>
      <sphereGeometry args={[radius, 16, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.4} />
    </instancedMesh>
  );
}

function LobeMesh({ lobe }: { lobe: Lobe }) {
  const dir = useMemo(() => new THREE.Vector3(lobe.dir[0], lobe.dir[1], lobe.dir[2]).normalize(), [lobe.dir]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [dir]);
  const reach = lobe.reach * 1.2;
  const radial = 0.15;
  const halfLen = reach * 0.46;
  const color = useMemo(() => new THREE.Color(lobe.phase < 0 ? PAL.tide : PAL.gold), [lobe.phase]);
  return (
    <mesh
      quaternion={quat}
      position={dir.clone().multiplyScalar(reach * 0.58)}
      scale={[radial, halfLen, radial]}
      renderOrder={3}
      raycast={() => {}}
    >
      <sphereGeometry args={[1, 28, 18]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        uniforms={{ uColor: { value: color } }}
        vertexShader={lobeVert}
        fragmentShader={lobeFrag}
      />
    </mesh>
  );
}

function Probability({ lobes }: { lobes: Lobe[] }) {
  return (
    <group>
      {lobes.map((lobe, i) => (
        <LobeMesh key={i} lobe={lobe} />
      ))}
    </group>
  );
}

function Shell({ radius }: { radius: number }) {
  const color = useMemo(() => new THREE.Color(PAL.gold), []);
  return (
    <mesh renderOrder={2} raycast={() => {}}>
      <sphereGeometry args={[radius, 48, 32]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
        uniforms={{ uColor: { value: color } }}
        vertexShader={lobeVert}
        fragmentShader={shellFrag}
      />
    </mesh>
  );
}

function NodeDiscs() {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          raycast={() => {}}
          rotation={i === 1 ? [Math.PI / 2, 0, 0] : i === 2 ? [0, 0, Math.PI / 2] : [0, 0, 0]}
        >
          <circleGeometry args={[0.62, 48]} />
          <meshBasicMaterial color={PAL.muted} transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function placeSlide(group: THREE.Group, index: number, count: number, dt: number) {
  const off = shortest(index, view.shown, count);
  const ad = Math.abs(off);
  group.visible = ad < 1.65;
  group.position.x = off * GAP;
  group.position.y = 0.78;
  group.position.z = -Math.min(ad, 1) * 0.35;
  const s = ad < 0.4 ? 0.74 : 0.4;
  const focus = Math.max(0, 1 - ad);
  const k = 1 - Math.exp(-10 * dt);
  group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x || s, s, k));
  group.rotation.y = view.yaw;
  group.rotation.x = view.pitch * focus;
}

function ShapeSlide({ solid, index }: { solid: Solid; index: number }) {
  const ref = useRef<THREE.Group>(null);
  const field = useStore((s) => s.field);
  const shell = useStore((s) => s.shell);
  const count = SOLIDS.length;
  const merk = useMemo(() => (solid.merkaba ? merkabaEdges(solid.poly.verts) : null), [solid]);
  useFrame((_, delta) => {
    if (ref.current) placeSlide(ref.current, index, count, Math.min(delta, 0.05));
  });
  return (
    <group ref={ref}>
      <Tubes verts={solid.poly.verts} edges={solid.poly.edges} radius={0.048} color={PAL.paper} />
      <Dots verts={solid.poly.verts} radius={0.055} color={PAL.paper} />
      {solid.nucleus && (
        <mesh raycast={() => {}}>
          <sphereGeometry args={[0.09, 20, 16]} />
          <meshStandardMaterial color={PAL.paper} emissive={PAL.paper} emissiveIntensity={0.2} roughness={0.35} />
        </mesh>
      )}
      {field && merk && (
        <>
          <Tubes verts={solid.poly.verts} edges={merk.a} radius={0.012} color={PAL.gold} />
          <Tubes verts={solid.poly.verts} edges={merk.b} radius={0.012} color={PAL.tide} />
        </>
      )}
      {field && solid.lobes.length > 0 && <Probability lobes={solid.lobes} />}
      {field && solid.nodal && <NodeDiscs />}
      {shell && <Shell radius={solid.shellRadius} />}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (view.moved) return;
          const off = Math.abs(shortest(index, view.shown, count));
          if (off > 0.35) useStore.getState().go(index);
          else useStore.getState().openMolecules();
        }}
      >
        <sphereGeometry args={[1.12, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function AtomCloud({
  el,
  atoms,
  scale,
  focused,
}: {
  el: string;
  atoms: { at: Vec3; index: number }[];
  scale: number;
  focused: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const spec = ELEMENTS[el] ?? { color: PAL.paper, radius: 0.36, name: el, metal: false };
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    atoms.forEach((a, i) => {
      m.compose(new THREE.Vector3(a.at[0], a.at[1], a.at[2]), q, new THREE.Vector3(1, 1, 1));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [atoms]);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, atoms.length]}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!focused) return;
        const id = e.instanceId;
        if (id == null) return;
        useStore.getState().setHover(spec.name);
      }}
      onPointerOut={() => {
        if (useStore.getState().hover === spec.name) useStore.getState().setHover(null);
      }}
    >
      <sphereGeometry args={[spec.radius * scale, focused ? 28 : 12, focused ? 20 : 10]} />
      <meshStandardMaterial
        color={spec.color}
        emissive={spec.color}
        emissiveIntensity={spec.metal ? 0.12 : 0.06}
        roughness={spec.metal ? 0.28 : 0.42}
        metalness={spec.metal ? 0.55 : 0.04}
      />
    </instancedMesh>
  );
}

function MolSlide({ mol, index, count }: { mol: Molecule; index: number; count: number }) {
  const ref = useRef<THREE.Group>(null);
  const field = useStore((s) => s.field);
  const shell = useStore((s) => s.shell);
  const cage = useStore((s) => s.cage);
  const focusIndex = useStore((s) => s.mol);
  const focused = focusIndex === index;
  const grouped = useMemo(() => {
    const map = new Map<string, { at: Vec3; index: number }[]>();
    mol.atoms.forEach((a, i) => {
      const list = map.get(a.el) ?? [];
      list.push({ at: a.at, index: i });
      map.set(a.el, list);
    });
    return [...map.entries()];
  }, [mol]);
  useFrame((_, delta) => {
    if (ref.current) placeSlide(ref.current, index, count, Math.min(delta, 0.05));
  });
  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        if (view.moved) return;
        const off = Math.abs(shortest(index, view.shown, count));
        if (off > 0.35) useStore.getState().go(index);
      }}
    >
      {cage && (
        <Tubes verts={mol.guide} edges={mol.guideEdges} radius={0.012} color={PAL.tide} opacity={0.55} />
      )}
      <Tubes verts={mol.atoms.map((a) => a.at)} edges={mol.bonds} radius={mol.bondRadius} color={PAL.bond} />
      {grouped.map(([el, atoms]) => (
        <AtomCloud key={el} el={el} atoms={atoms} scale={mol.atomScale} focused={focused} />
      ))}
      {field && mol.lobes.length > 0 && <Probability lobes={mol.lobes} />}
      {shell && <Shell radius={mol.shellRadius} />}
      {!focused && (
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            if (view.moved) return;
            useStore.getState().go(index);
          }}
        >
          <sphereGeometry args={[1.15, 12, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function Carousel() {
  const mode = useStore((s) => s.mode);
  const shape = useStore((s) => s.shape);
  const solid = SOLIDS[shape] ?? SOLIDS[0]!;
  useSpinAndSettle();
  if (mode === "molecules") {
    return (
      <>
        {solid.molecules.map((mol, index) => (
          <MolSlide key={mol.id} mol={mol} index={index} count={solid.molecules.length} />
        ))}
      </>
    );
  }
  return (
    <>
      {SOLIDS.map((item, index) => (
        <ShapeSlide key={item.id} solid={item} index={index} />
      ))}
    </>
  );
}

function Gestures() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "none";
    const pointers = new Map<number, { x: number; y: number }>();
    let mode: "none" | "rotate" | "scrub" | "pinch" = "none";
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

    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
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
    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2) {
        const d = pairDist();
        if (pinDist > 0 && d > 0) view.zoom = clamp(view.zoom * (d / pinDist), 0.72, 1.5);
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
        const touch = e.pointerType === "touch";
        mode = touch && adx > ady * 1.28 ? "scrub" : "rotate";
      }
      if (mode === "rotate") {
        view.moved = true;
        view.yaw += dx * 0.0085;
        view.pitch = clamp(view.pitch + dy * 0.006, -1.15, 1.15);
      } else if (mode === "scrub") {
        view.moved = true;
        const deltaSlides = -dx / 150;
        view.shown += deltaSlides;
        view.target = view.shown;
      }
    };
    const up = (e: PointerEvent) => {
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
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        view.zoom = clamp(view.zoom * Math.exp(-e.deltaY * 0.008), 0.72, 1.5);
        return;
      }
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 0.5) {
        view.shown += e.deltaX / 220;
        view.target = Math.round(view.shown);
      } else {
        view.zoom = clamp(view.zoom * Math.exp(-e.deltaY * 0.0011), 0.72, 1.5);
      }
    };
    const menu = (e: Event) => e.preventDefault();
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
  return (
    <>
      <color attach="background" args={[PAL.ink]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4.5, 6.5, 5]} intensity={1.45} color="#fff4e2" />
      <directionalLight position={[-5, -1.5, -3]} intensity={0.4} color={PAL.tide} />
      <Stars />
      <Carousel />
      <CameraRig />
      <Gestures />
    </>
  );
}

export function Stage() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      view.reduce = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return (
    <Canvas
      className="stage-canvas"
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.05, 7.2], fov: 40, near: 0.08, far: 80 }}
      onCreated={({ gl }) => {
        gl.setClearColor(PAL.ink, 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
    >
      <Scene />
    </Canvas>
  );
}
