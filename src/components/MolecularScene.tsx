import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  className?: string;
  /** When true, the camera slowly rotates and atoms gently float */
  interactive?: boolean;
  /** Number of atom-node pairs */
  density?: number;
};

// Generates a stable, branched molecular-ish shape made of nodes and connecting edges.
// Nodes drift on a sine wave; the whole thing slowly rotates.
function buildAtomPositions(n: number) {
  const positions: { pos: THREE.Vector3; size: number; phase: number; axis: number }[] = [];
  const center = new THREE.Vector3(0, 0, 0);
  // A central cluster
  positions.push({ pos: center.clone(), size: 0.55, phase: 0, axis: 0 });
  for (let i = 0; i < n; i++) {
    const theta = (i / n) * Math.PI * 2 + Math.random() * 0.6;
    const phi = (Math.random() - 0.5) * Math.PI * 0.8;
    const r = 1.6 + Math.random() * 1.4;
    const pos = new THREE.Vector3(
      r * Math.cos(phi) * Math.cos(theta),
      r * Math.sin(phi) * 0.8,
      r * Math.cos(phi) * Math.sin(theta)
    );
    positions.push({
      pos,
      size: 0.14 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      axis: Math.floor(Math.random() * 3),
    });
  }
  return positions;
}

export default function MolecularScene({
  className = "",
  interactive = true,
  density = 28,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.04);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0.5, 7);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0x4a4a6a, 0.6);
    scene.add(ambient);
    const cyan = new THREE.PointLight(0x00d4ff, 2.5, 12);
    cyan.position.set(3, 2, 2);
    scene.add(cyan);
    const violet = new THREE.PointLight(0xa78bfa, 2.0, 12);
    violet.position.set(-3, -1, 1);
    scene.add(violet);
    const soft = new THREE.PointLight(0x5eead4, 1.5, 10);
    soft.position.set(0, -2, 3);
    scene.add(soft);

    // Atoms
    const atoms = buildAtomPositions(density);
    const atomGroup = new THREE.Group();
    const atomMeshes: THREE.Mesh[] = [];
    const atomMaterials: THREE.MeshStandardMaterial[] = [];

    atoms.forEach((a, i) => {
      const isCore = i === 0;
      const colorHex = isCore
        ? 0xfafafa
        : i % 3 === 0
          ? 0x00d4ff
          : i % 3 === 1
            ? 0xa78bfa
            : 0x5eead4;

      const geo = new THREE.SphereGeometry(a.size, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: isCore ? 0.6 : 0.4,
        roughness: 0.3,
        metalness: 0.6,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(a.pos);
      atomGroup.add(m);
      atomMeshes.push(m);
      atomMaterials.push(mat);
    });

    // Bonds — connect each non-core atom to its 2 nearest neighbours and to center
    const bondGeo = new THREE.CylinderGeometry(0.018, 0.018, 1, 6);
    const bondMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.35,
    });
    const bonds: { mesh: THREE.Mesh; a: THREE.Mesh; b: THREE.Mesh; offset: THREE.Vector3 }[] = [];

    function addBond(a: THREE.Mesh, b: THREE.Mesh) {
      const mesh = new THREE.Mesh(bondGeo, bondMat);
      atomGroup.add(mesh);
      bonds.push({
        mesh,
        a,
        b,
        offset: new THREE.Vector3(),
      });
    }

    // Connect center to first 6 atoms
    for (let i = 1; i <= Math.min(6, atoms.length - 1); i++) {
      addBond(atomMeshes[0], atomMeshes[i]);
    }
    // Connect each atom to its 2 nearest neighbours (cheap)
    for (let i = 1; i < atoms.length; i++) {
      const a = atomMeshes[i];
      const distances: { j: number; d: number }[] = [];
      for (let j = 1; j < atoms.length; j++) {
        if (i === j) continue;
        const d = a.position.distanceTo(atomMeshes[j].position);
        distances.push({ j, d });
      }
      distances.sort((x, y) => x.d - y.d);
      addBond(a, atomMeshes[distances[0].j]);
      if (distances[1] && distances[1].d < 3.2) {
        addBond(a, atomMeshes[distances[1].j]);
      }
    }

    scene.add(atomGroup);

    // Star particles
    const starCount = 200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3 + 0] = (Math.random() - 0.5) * 30;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x5eead4,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Mouse parallax
    const mouse = { x: 0, y: 0 };
    function onMove(e: MouseEvent) {
      const r = mount!.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    }
    if (interactive) {
      mount.addEventListener("mousemove", onMove);
    }

    // Resize
    function onResize() {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // Animate
    const clock = new THREE.Clock();
    let raf = 0;
    const baseAtomPositions = atomMeshes.map((m) => m.position.clone());

    function frame() {
      const t = clock.getElapsedTime();
      atomGroup.rotation.y = t * 0.08;
      atomGroup.rotation.x = Math.sin(t * 0.07) * 0.18;
      if (interactive) {
        atomGroup.rotation.y += mouse.x * 0.5;
        atomGroup.rotation.x += mouse.y * 0.2;
      }

      // Atom drift
      atomMeshes.forEach((m, i) => {
        if (i === 0) return;
        const a = atoms[i];
        const base = baseAtomPositions[i];
        m.position.x = base.x + Math.sin(t * 0.6 + a.phase) * 0.08;
        m.position.y = base.y + Math.cos(t * 0.5 + a.phase) * 0.08;
        m.position.z = base.z + Math.sin(t * 0.4 + a.phase * 0.7) * 0.08;
      });

      // Update bonds — orient cylinder between a and b
      bonds.forEach((bd) => {
        const av = bd.a.position;
        const bv = bd.b.position;
        const dir = new THREE.Vector3().subVectors(bv, av);
        const len = dir.length();
        bd.mesh.position.copy(av).addScaledVector(dir, 0.5);
        bd.mesh.scale.set(1, len, 1);
        bd.mesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.normalize()
        );
      });

      // Lights orbit
      cyan.position.x = Math.cos(t * 0.3) * 4;
      cyan.position.z = Math.sin(t * 0.3) * 4;
      violet.position.x = Math.cos(t * 0.3 + Math.PI) * 4;
      violet.position.z = Math.sin(t * 0.3 + Math.PI) * 4;

      stars.rotation.y = t * 0.02;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (interactive) mount.removeEventListener("mousemove", onMove);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((obj: THREE.Object3D) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const m = mesh.material;
        if (m) {
          if (Array.isArray(m)) m.forEach((x: THREE.Material) => x.dispose());
          else m.dispose();
        }
      });
    };
  }, [interactive, density]);

  return <div ref={mountRef} className={className} />;
}
