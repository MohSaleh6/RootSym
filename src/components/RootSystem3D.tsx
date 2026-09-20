"use client";

import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------
   A small hand-rolled 3D wireframe renderer.
   It draws the RootSym idea literally: a gear assembly turning above a
   branching root system, with the whole structure rendered as an
   engineering blueprint. No 3D library — every vertex is projected by
   hand so the line weights, depth fade and colour ramp stay on-brand.
   ------------------------------------------------------------------ */

type V3 = { x: number; y: number; z: number };
type Segment = { a: V3; b: V3; color: string; weight: number; glow?: boolean };
type Node3 = { p: V3; r: number; color: string; phase: number };

const COLORS = {
  teal: "27, 94, 117",
  tide: "46, 134, 171",
  sky: "107, 179, 207",
  moss: "47, 107, 79",
  leaf: "74, 143, 104",
  gold: "201, 162, 39",
  ember: "224, 122, 40",
};

function rotX(p: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}
function rotY(p: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}
function rotZ(p: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
}

/** A spur gear profile, generated in the XY plane then tilted into place. */
function buildGear(
  teeth: number,
  rInner: number,
  rRoot: number,
  rTip: number,
  z: number,
  color: string,
  weight: number,
): { segments: Segment[]; spin: (t: number) => number } {
  const segments: Segment[] = [];
  const profile: V3[] = [];
  const step = (Math.PI * 2) / teeth;

  for (let i = 0; i < teeth; i += 1) {
    const a0 = i * step;
    const a1 = a0 + step * 0.26;
    const a2 = a0 + step * 0.5;
    const a3 = a0 + step * 0.76;
    profile.push({ x: Math.cos(a0) * rRoot, y: Math.sin(a0) * rRoot, z });
    profile.push({ x: Math.cos(a1) * rTip, y: Math.sin(a1) * rTip, z });
    profile.push({ x: Math.cos(a2) * rTip, y: Math.sin(a2) * rTip, z });
    profile.push({ x: Math.cos(a3) * rRoot, y: Math.sin(a3) * rRoot, z });
  }
  for (let i = 0; i < profile.length; i += 1) {
    segments.push({ a: profile[i], b: profile[(i + 1) % profile.length], color, weight });
  }

  // hub + spokes
  const hub: V3[] = [];
  const hubSteps = 28;
  for (let i = 0; i < hubSteps; i += 1) {
    const a = (i / hubSteps) * Math.PI * 2;
    hub.push({ x: Math.cos(a) * rInner, y: Math.sin(a) * rInner, z });
  }
  for (let i = 0; i < hub.length; i += 1) {
    segments.push({ a: hub[i], b: hub[(i + 1) % hub.length], color, weight: weight * 0.8 });
  }
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    segments.push({
      a: { x: Math.cos(a) * rInner, y: Math.sin(a) * rInner, z },
      b: { x: Math.cos(a) * rRoot * 0.94, y: Math.sin(a) * rRoot * 0.94, z },
      color,
      weight: weight * 0.7,
    });
  }

  return { segments, spin: (t: number) => t };
}

/** Icosahedron wireframe — the "core" of the investigation. */
function buildIcosahedron(r: number, color: string): Segment[] {
  const t = (1 + Math.sqrt(5)) / 2;
  const raw: [number, number, number][] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  const norm = Math.sqrt(1 + t * t);
  const verts: V3[] = raw.map(([x, y, z]) => ({
    x: (x / norm) * r,
    y: (y / norm) * r,
    z: (z / norm) * r,
  }));
  const faces: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const seen = new Set<string>();
  const segments: Segment[] = [];
  for (const [a, b, c] of faces) {
    for (const [i, j] of [[a, b], [b, c], [c, a]] as [number, number][]) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      segments.push({ a: verts[i], b: verts[j], color, weight: 1 });
    }
  }
  return segments;
}

/** Recursive root system growing downward from the gear assembly. */
function buildRoots(seed: number): { segments: Segment[]; nodes: Node3[] } {
  const segments: Segment[] = [];
  const nodes: Node3[] = [];
  let rng = seed;
  const rand = () => {
    rng = (rng * 1664525 + 1013904223) % 4294967296;
    return rng / 4294967296;
  };

  function grow(from: V3, dir: V3, len: number, depth: number, thickness: number) {
    if (depth === 0 || len < 6) {
      const golden = rand() > 0.82;
      nodes.push({
        p: from,
        r: golden ? 1.9 : 1.1 + thickness * 0.35,
        color: golden ? COLORS.gold : COLORS.leaf,
        phase: rand() * Math.PI * 2,
      });
      return;
    }
    const steps = 4;
    let cur = from;
    let d = dir;
    for (let s = 0; s < steps; s += 1) {
      const next: V3 = {
        x: cur.x + d.x * (len / steps),
        y: cur.y + d.y * (len / steps),
        z: cur.z + d.z * (len / steps),
      };
      const mix = depth / 5;
      segments.push({
        a: cur,
        b: next,
        color: mix > 0.6 ? COLORS.moss : COLORS.leaf,
        weight: thickness,
      });
      cur = next;
      d = {
        x: d.x + (rand() - 0.5) * 0.24,
        y: d.y + 0.1,
        z: d.z + (rand() - 0.5) * 0.24,
      };
      const m = Math.hypot(d.x, d.y, d.z) || 1;
      d = { x: d.x / m, y: d.y / m, z: d.z / m };
    }
    const branches = depth > 3 ? 3 : 2;
    for (let b = 0; b < branches; b += 1) {
      const spread = 0.7;
      const nd: V3 = {
        x: d.x + (rand() - 0.5) * spread * 2,
        y: Math.abs(d.y) + rand() * 0.35,
        z: d.z + (rand() - 0.5) * spread * 2,
      };
      const m = Math.hypot(nd.x, nd.y, nd.z) || 1;
      grow(cur, { x: nd.x / m, y: nd.y / m, z: nd.z / m }, len * 0.66, depth - 1, thickness * 0.68);
    }
  }

  const trunkTop: V3 = { x: 0, y: 14, z: 0 };
  const trunkBase: V3 = { x: 0, y: 46, z: 0 };
  segments.push({ a: trunkTop, b: trunkBase, color: COLORS.moss, weight: 3.4 });

  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + 0.35;
    grow(
      trunkBase,
      { x: Math.cos(a) * 0.95, y: 0.44, z: Math.sin(a) * 0.95 },
      46,
      3,
      1.9,
    );
  }
  return { segments, nodes };
}

/** Orbiting data nodes linked by thin "signal" lines. */
function buildOrbit(count: number, radius: number): Node3[] {
  const nodes: Node3[] = [];
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    const tilt = (i % 3) * 0.45 - 0.45;
    nodes.push({
      p: {
        x: Math.cos(a) * radius,
        y: Math.sin(tilt) * radius * 0.55,
        z: Math.sin(a) * radius,
      },
      r: i % 4 === 0 ? 3.4 : 2.1,
      color: i % 4 === 0 ? COLORS.ember : COLORS.sky,
      phase: i * 0.7,
    });
  }
  return nodes;
}

export default function RootSystem3D({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gearA = buildGear(22, 14, 40, 52, -14, COLORS.teal, 1.35);
    const gearB = buildGear(16, 10, 27, 36, 30, COLORS.tide, 1.15);
    const gearC = buildGear(28, 18, 56, 68, 4, COLORS.sky, 0.85);
    const core = buildIcosahedron(22, COLORS.gold);
    const roots = buildRoots(20260920);
    const orbit = buildOrbit(18, 96);

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.current.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let raf = 0;
    const t0 = performance.now();

    const project = (p: V3, scale: number, cx: number, cy: number) => {
      const focal = 460;
      const zz = p.z + 360;
      const k = (focal / Math.max(zz, 40)) * scale;
      return { x: cx + p.x * k, y: cy + p.y * k, k, z: p.z };
    };

    const render = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, width, height);

      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.045;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.045;

      const scale = Math.min(width, height) / 430;
      const cx = width / 2;
      const cy = height * 0.40;

      const baseYaw = (reduced ? 0.4 : t * 0.16) + pointer.current.x * 0.5;
      const basePitch = -0.32 + pointer.current.y * 0.28;

      const drawable: (Segment & { az: number })[] = [];
      const points: (Node3 & { az: number; sx: number; sy: number; sr: number })[] = [];

      const place = (
        p: V3,
        localSpin: number,
        tiltX: number,
        tiltZ: number,
      ): V3 => {
        let q = rotZ(p, localSpin);
        q = rotX(q, tiltX);
        q = rotZ(q, tiltZ);
        q = rotY(q, baseYaw);
        q = rotX(q, basePitch);
        return q;
      };

      const push = (
        segs: Segment[],
        localSpin: number,
        tiltX: number,
        tiltZ: number,
        alphaBoost = 1,
      ) => {
        for (const s of segs) {
          const a = place(s.a, localSpin, tiltX, tiltZ);
          const b = place(s.b, localSpin, tiltX, tiltZ);
          drawable.push({
            a,
            b,
            color: s.color,
            weight: s.weight * alphaBoost,
            glow: s.glow,
            az: (a.z + b.z) / 2,
          });
        }
      };

      const spin = reduced ? 0 : t;
      push(gearA.segments, spin * 0.42, 0.44, 0, 1);
      push(gearB.segments, -spin * 0.58, -0.55, 0.75, 1);
      push(gearC.segments, spin * 0.24, 1.28, -0.35, 0.75);
      push(core, spin * 0.35, spin * 0.2, 0, 1.1);
      push(roots.segments, 0, 0, 0, 1);

      for (const n of roots.nodes) {
        const q = place(n.p, 0, 0, 0);
        const pr = project(q, scale, cx, cy);
        points.push({ ...n, az: q.z, sx: pr.x, sy: pr.y, sr: n.r * pr.k * 0.9 });
      }
      for (const n of orbit) {
        const wobble = reduced ? 0 : Math.sin(t * 0.8 + n.phase) * 10;
        const q = place({ x: n.p.x, y: n.p.y + wobble, z: n.p.z }, 0, 0, -spin * 0.12);
        const pr = project(q, scale, cx, cy);
        points.push({ ...n, az: q.z, sx: pr.x, sy: pr.y, sr: n.r * pr.k * 0.9 });
      }

      drawable.sort((p, q) => p.az - q.az);

      for (const s of drawable) {
        const pa = project(s.a, scale, cx, cy);
        const pb = project(s.b, scale, cx, cy);
        const depth = (s.az + 140) / 280;
        const alpha = Math.max(0.08, Math.min(1, 0.24 + depth * 0.78));
        ctx.strokeStyle = `rgba(${s.color}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = Math.max(0.35, s.weight * (0.55 + depth * 0.85));
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      // signal lines between nearby orbit nodes
      const orbitPts = points.slice(roots.nodes.length);
      for (let i = 0; i < orbitPts.length; i += 1) {
        for (let j = i + 1; j < orbitPts.length; j += 1) {
          const d = Math.hypot(orbitPts[i].sx - orbitPts[j].sx, orbitPts[i].sy - orbitPts[j].sy);
          if (d > 120) continue;
          const alpha = (1 - d / 120) * 0.22;
          ctx.strokeStyle = `rgba(${COLORS.sky}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(orbitPts[i].sx, orbitPts[i].sy);
          ctx.lineTo(orbitPts[j].sx, orbitPts[j].sy);
          ctx.stroke();
        }
      }

      points.sort((p, q) => p.az - q.az);
      for (const p of points) {
        const depth = (p.az + 140) / 280;
        const pulse = reduced ? 1 : 0.8 + Math.sin(t * 2 + p.phase) * 0.2;
        const r = Math.max(0.6, p.sr * pulse);
        const alpha = Math.max(0.12, Math.min(1, 0.25 + depth * 0.75));
        const halo = r * 3;
        const grad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, halo);
        grad.addColorStop(0, `rgba(${p.color}, ${(alpha * 0.55).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, halo, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${p.color}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      role="presentation"
    />
  );
}
