/**
 * The hero's point cloud: an abstract head-and-shoulders silhouette (outline plus a sparse, softly toned
 * interior). It is generated offline into public/head.json from a photo; the file holds no facial detail
 * and the photo itself is never shipped.
 */

type HeadData = { aspect: number; h: number; pts: [number, number, number][] };

let cache: Promise<HeadData> | null = null;

function loadHead(): Promise<HeadData> {
  if (!cache) {
    cache = fetch("/head.json").then((r) => {
      if (!r.ok) throw new Error(`head.json ${r.status}`);
      return r.json() as Promise<HeadData>;
    });
  }
  return cache;
}

export type HeadFrame = { cx: number; cy: number; height: number };

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Sample `count` points into world space. `w` is a 0..1 weight per point (outline = 1, interior is dimmer). */
export async function sampleHead(count: number, frame: HeadFrame): Promise<{ pos: Float32Array; w: Float32Array }> {
  const head = await loadHead();
  const scale = frame.height / head.h; // world units per image-width unit
  // deterministic pseudo-random so the shape is identical every visit
  let seed = 1337;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  // the bust is cut off at the bottom of the photo: thin the points out there so it fades instead of ending in a hard edge
  const pool: [number, number, number][] = [];
  for (const p of head.pts) {
    const fade = 1 - smoothstep(0.12, 0.52, p[1]);
    if (rand() < fade) pool.push(p);
  }
  const pos = new Float32Array(count * 3);
  const w = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const p = pool[i % pool.length];
    const jitter = i < pool.length ? 0.0015 : 0.004; // repeats get a little scatter so they don't stack
    pos[i * 3] = frame.cx + (p[0] + (rand() - 0.5) * jitter) * scale;
    pos[i * 3 + 1] = frame.cy - (p[1] + (rand() - 0.5) * jitter) * scale;
    pos[i * 3 + 2] = (rand() - 0.5) * 0.9;
    w[i] = p[2] * (1 - 0.5 * smoothstep(0.05, 0.5, p[1]));
  }
  return { pos, w };
}
