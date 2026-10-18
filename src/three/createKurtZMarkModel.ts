import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type ProceduralModelOptions = {
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  textureSize?: number;
  textureAnisotropy?: number;
  qualityPriority?: 'reference-fidelity' | 'balanced';
};

export type ProceduralModelRuntime = {
  nodes: Record<string, THREE.Object3D>;
  meshes: Record<string, THREE.Mesh>;
  sockets: Record<string, THREE.Object3D>;
  colliders: Record<string, unknown>;
  destructionGroups: Record<string, THREE.Object3D[]>;
};

type SculptMaterialSpec = Record<string, any>;

// bevelEnabled defaults to true on THREE.ExtrudeGeometry and rounds every
// corner — sharp/pointed profiles (blades, fork tines, spikes) need
// bevelEnabled: false plus lineTo()-only path segments near the tip, since a
// curve command cannot produce a true converging point.
function buildExtrudeShape(points: [number, number][], holes?: [number, number][][]): THREE.Shape {
  const shape = new THREE.Shape();
  if (points.length > 0) {
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) {
      shape.lineTo(points[i][0], points[i][1]);
    }
  }
  // Cutouts (e.g. an oval wire-cutter hole) as THREE.Path added to shape.holes —
  // dep-free boolean subtraction via the tessellator, no CSG library needed.
  for (const loop of holes ?? []) {
    if (loop.length < 3) continue;
    const path = new THREE.Path();
    path.moveTo(loop[0][0], loop[0][1]);
    for (let i = 1; i < loop.length; i += 1) path.lineTo(loop[i][0], loop[i][1]);
    path.closePath();
    shape.holes.push(path);
  }
  return shape;
}

// Build an N-gon oval loop (for hole authoring from a compact {cx,cy,rx,ry} descriptor).
function ovalLoop(cx: number, cy: number, rx: number, ry: number, seg = 24): [number, number][] {
  const loop: [number, number][] = [];
  for (let i = 0; i < seg; i += 1) {
    const a = (i / seg) * Math.PI * 2;
    loop.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return loop;
}

function buildExtrudeGeometry(profile: { points: [number, number][]; depth: number; holes?: [number, number][][]; ovalHoles?: { cx: number; cy: number; rx: number; ry: number }[] }): THREE.ExtrudeGeometry {
  const holes = [...(profile.holes ?? []), ...((profile.ovalHoles ?? []).map((o) => ovalLoop(o.cx, o.cy, o.rx, o.ry)))];
  const shape = buildExtrudeShape(profile.points, holes);
  return new THREE.ExtrudeGeometry(shape, {
    depth: profile.depth,
    bevelEnabled: false,
    steps: 1,
  });
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function readLayerNumber(value: unknown, keys: string[], fallback: number): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of keys) {
      if (typeof record[key] === 'number') return record[key] as number;
    }
  }
  return fallback;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = /^#[0-9a-f]{3}$/i.test(hex)
    ? '#' + hex.slice(1).split('').map((part) => part + part).join('')
    : hex;
  const value = /^#[0-9a-f]{6}$/i.test(normalized) ? Number.parseInt(normalized.slice(1), 16) : 0x8a7a5f;
  return [clampAlbedoChannel((value >> 16) & 255), clampAlbedoChannel((value >> 8) & 255), clampAlbedoChannel(value & 255)];
}

function materialPalette(spec: SculptMaterialSpec): string[] {
  const palette = spec.colorVariation?.palette;
  if (Array.isArray(palette) && palette.length > 0) return palette.filter((value) => typeof value === 'string');
  const secondary = spec.albedo?.secondary;
  const colors = [spec.baseColor ?? spec.color ?? spec.albedo?.dominant, ...(Array.isArray(secondary) ? secondary : [])];
  return colors.filter((value): value is string => typeof value === 'string' && value.startsWith('#'));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampAlbedoChannel(value: number): number {
  return Math.max(30, Math.min(240, Math.round(value)));
}

function clampPbrF0(value: number): number {
  return Math.max(0.02, Math.min(1, value));
}

function clampPbrIor(value: number): number {
  return Math.max(1, Math.min(2.5, value));
}

function clampPbrMetalness(value: number): number {
  return value >= 0.5 ? 1 : 0;
}

function clampedAlbedoColor(spec: SculptMaterialSpec): THREE.Color {
  const source = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  // setStyle with an explicit SRGBColorSpace, NOT the numeric constructor.
  //
  // `new THREE.Color(r, g, b)` treats its arguments as LINEAR working-space components,
  // while an authored `baseColor` hex is sRGB. Feeding one to the other skipped the
  // transfer function and lifted every dark albedo: #2e2a28, authored as a near-black
  // vinyl, rendered at roughly sRGB 0.46 — a mid grey. The error is largest exactly where
  // it matters most, because the transfer curve is steepest near black.
  return new THREE.Color().setStyle(source, THREE.SRGBColorSpace);
}

function smoothCurve(value: number): number {
  return value * value * (3 - 2 * value);
}

function periodicHash(x: number, y: number, seed: number, periodX: number, periodY: number): number {
  const wrappedX = ((x % periodX) + periodX) % periodX;
  const wrappedY = ((y % periodY) + periodY) % periodY;
  let value = Math.imul(wrappedX + seed * 17, 374761393) ^ Math.imul(wrappedY + seed * 31, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function periodicValueNoise(u: number, v: number, seed: number, periodX: number, periodY: number): number {
  const x = u * periodX;
  const y = v * periodY;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothCurve(x - x0);
  const ty = smoothCurve(y - y0);
  const a = periodicHash(x0, y0, seed, periodX, periodY);
  const b = periodicHash(x0 + 1, y0, seed, periodX, periodY);
  const c = periodicHash(x0, y0 + 1, seed, periodX, periodY);
  const d = periodicHash(x0 + 1, y0 + 1, seed, periodX, periodY);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, tx), THREE.MathUtils.lerp(c, d, tx), ty);
}

type SurfaceBand = {
  frequency: number;
  amplitude: number;
  stretchX: number;
  stretchY: number;
  ridge: boolean;
};

function surfaceBands(spec: SculptMaterialSpec): SurfaceBand[] {
  const source = Array.isArray(spec.surfaceFrequencyBands) ? spec.surfaceFrequencyBands : [];
  const parsed = source.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const band = item as Record<string, unknown>;
    const frequency = typeof band.frequency === 'number' ? band.frequency : 0;
    const amplitude = typeof band.amplitude === 'number' ? band.amplitude : 0;
    if (frequency <= 0 || amplitude <= 0) return [];
    const stretch = Array.isArray(band.stretch) ? band.stretch : [1, 1];
    const description = `${String(band.pattern ?? '')} ${String(band.role ?? '')}`.toLowerCase();
    return [{
      frequency,
      amplitude,
      stretchX: typeof stretch[0] === 'number' ? Math.max(0.1, stretch[0]) : 1,
      stretchY: typeof stretch[1] === 'number' ? Math.max(0.1, stretch[1]) : 1,
      ridge: /(ridge|groove|grain|fiber|striated|crack)/.test(description),
    }];
  });
  return parsed.length > 0 ? parsed : [
    { frequency: 2, amplitude: 0.42, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 12, amplitude: 0.22, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 56, amplitude: 0.08, stretchX: 1, stretchY: 1, ridge: false },
  ];
}

function sampleSurface(u: number, v: number, bands: SurfaceBand[], seed: number): number {
  let value = 0;
  let weight = 0;
  for (let index = 0; index < bands.length; index += 1) {
    const band = bands[index];
    const periodX = Math.max(1, Math.round(band.frequency * band.stretchX));
    const periodY = Math.max(1, Math.round(band.frequency * band.stretchY));
    let sample = periodicValueNoise(u, v, seed + index * 1013, periodX, periodY);
    if (band.ridge) sample = 1 - Math.abs(sample * 2 - 1);
    value += sample * band.amplitude;
    weight += band.amplitude;
  }
  return weight > 0 ? clamp01(value / weight) : 0.5;
}

function mixPalette(colors: [number, number, number][], value: number): [number, number, number] {
  if (colors.length === 1) return colors[0];
  const scaled = clamp01(value) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const a = colors[index];
  const b = colors[index + 1];
  return [
    Math.round(THREE.MathUtils.lerp(a[0], b[0], mix)),
    Math.round(THREE.MathUtils.lerp(a[1], b[1], mix)),
    Math.round(THREE.MathUtils.lerp(a[2], b[2], mix)),
  ];
}

type ColorGradientStop = { offset: number; color: string };
type ColorGradientSpec = {
  type: 'linear' | 'radial';
  axis: [number, number];
  stops: ColorGradientStop[];
};

function parseRgba(value: string): [number, number, number] {
  const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(value);
  if (!match) return [138, 122, 95];
  return [clampAlbedoChannel(Number(match[1])), clampAlbedoChannel(Number(match[2])), clampAlbedoChannel(Number(match[3]))];
}

// Analytical per-pixel gradient sample. The extraction schema's colorGradient carries
// exact rgba(...) stop colors (see extract_part_color_recipe.py), so this samples the
// same trend directly in JS math rather than round-tripping through a Canvas 2D
// createLinearGradient/createRadialGradient object — same visual result, and it composes
// directly with the existing noise/height-correlated colorVariation blend below.
function sampleColorGradient(gradient: ColorGradientSpec, u: number, v: number): [number, number, number] {
  const stops = gradient.stops.length >= 2 ? gradient.stops : [{ offset: 0, color: 'rgba(138,122,95,1)' }, { offset: 1, color: 'rgba(138,122,95,1)' }];
  let t: number;
  if (gradient.type === 'radial') {
    const [cx, cy] = gradient.axis;
    const dx = u - cx;
    const dy = v - cy;
    const maxRadius = Math.max(0.001, Math.hypot(Math.max(cx, 1 - cx), Math.max(cy, 1 - cy)));
    t = clamp01(Math.hypot(dx, dy) / maxRadius);
  } else {
    const [ax, ay] = gradient.axis;
    const projection = (u - 0.5) * ax + (v - 0.5) * ay;
    const maxProjection = 0.5 * (Math.abs(ax) + Math.abs(ay)) || 0.5;
    t = clamp01(projection / maxProjection + 0.5);
  }
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.max(0, Math.floor(scaled)));
  const mix = scaled - index;
  const a = parseRgba(stops[index].color);
  const b = parseRgba(stops[index + 1].color);
  return [
    THREE.MathUtils.lerp(a[0], b[0], mix),
    THREE.MathUtils.lerp(a[1], b[1], mix),
    THREE.MathUtils.lerp(a[2], b[2], mix),
  ];
}

function writePixel(data: Uint8ClampedArray, offset: number, red: number, green: number, blue: number): void {
  data[offset] = Math.max(0, Math.min(255, Math.round(red)));
  data[offset + 1] = Math.max(0, Math.min(255, Math.round(green)));
  data[offset + 2] = Math.max(0, Math.min(255, Math.round(blue)));
  data[offset + 3] = 255;
}

function makeCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function createMapTexture(
  canvas: HTMLCanvasElement,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [2, 2];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 2,
    typeof repeat[1] === 'number' ? repeat[1] : 2,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

type ProceduralTextureSet = {
  albedo: THREE.Texture;
  roughness: THREE.Texture;
  height: THREE.Texture;
  normal: THREE.Texture;
  ao: THREE.Texture;
  source: 'reference-pixel-extraction' | 'procedural';
};

function referenceMapUrl(spec: SculptMaterialSpec, channel: string): string | null {
  const reference = spec.referencePbr;
  if (!reference || typeof reference !== 'object') return null;
  if (reference.usable === false) return null;
  const confidence = typeof reference.confidence === 'number'
    ? reference.confidence
    : (typeof reference.estimatedFidelity === 'number' ? reference.estimatedFidelity : 0);
  const threshold = typeof reference.targetThreshold === 'number' ? reference.targetThreshold : 0.7;
  if (confidence < threshold) return null;
  const maps = reference.maps;
  if (!maps || typeof maps !== 'object') return null;
  const map = (maps as Record<string, unknown>)[channel];
  if (!map || typeof map !== 'object') return null;
  const record = map as Record<string, unknown>;
  const url = typeof record.url === 'string' && record.url.trim() ? record.url : record.path;
  return typeof url === 'string' && url.trim() ? url : null;
}

function createLoadedMapTexture(
  url: string,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [1, 1];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 1,
    typeof repeat[1] === 'number' ? repeat[1] : 1,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

function makeReferenceTextureSet(spec: SculptMaterialSpec, options: ProceduralModelOptions): ProceduralTextureSet | null {
  const albedo = referenceMapUrl(spec, 'albedo');
  const roughness = referenceMapUrl(spec, 'roughness');
  const height = referenceMapUrl(spec, 'height');
  const normal = referenceMapUrl(spec, 'normal');
  const ao = referenceMapUrl(spec, 'ao');
  if (!albedo || !roughness || !height || !normal || !ao) return null;
  return {
    albedo: createLoadedMapTexture(albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createLoadedMapTexture(roughness, THREE.NoColorSpace, spec, options),
    height: createLoadedMapTexture(height, THREE.NoColorSpace, spec, options),
    normal: createLoadedMapTexture(normal, THREE.NoColorSpace, spec, options),
    ao: createLoadedMapTexture(ao, THREE.NoColorSpace, spec, options),
    source: 'reference-pixel-extraction',
  };
}

function makeProceduralTextureSet(
  id: string,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): ProceduralTextureSet | null {
  if (typeof document === 'undefined') return null;
  const qualityFirst = (options.qualityPriority ?? 'reference-fidelity') === 'reference-fidelity';
  const requested = options.textureSize ?? spec.textureResolution;
  const requestedSize = typeof requested === 'number' && Number.isFinite(requested)
    ? requested
    : (qualityFirst ? 1024 : 512);
  const size = Math.max(256, Math.min(2048, 2 ** Math.round(Math.log2(requestedSize))));
  const canvases = {
    albedo: makeCanvas(size),
    roughness: makeCanvas(size),
    height: makeCanvas(size),
    normal: makeCanvas(size),
    ao: makeCanvas(size),
  };
  const contexts = {
    albedo: canvases.albedo.getContext('2d'),
    roughness: canvases.roughness.getContext('2d'),
    height: canvases.height.getContext('2d'),
    normal: canvases.normal.getContext('2d'),
    ao: canvases.ao.getContext('2d'),
  };
  if (!contexts.albedo || !contexts.roughness || !contexts.height || !contexts.normal || !contexts.ao) return null;
  const images = {
    albedo: contexts.albedo.createImageData(size, size),
    roughness: contexts.roughness.createImageData(size, size),
    height: contexts.height.createImageData(size, size),
    normal: contexts.normal.createImageData(size, size),
    ao: contexts.ao.createImageData(size, size),
  };
  const seed = hashString(id);
  const bands = surfaceBands(spec);
  const heightField = new Float32Array(size * size);
  const roughnessField = new Float32Array(size * size);
  const palette = materialPalette(spec);
  const fallback = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  const colors = (palette.length >= 2 ? palette : [fallback, '#6E614B', '#A08F70']).map(hexToRgb);
  const baseRoughness = clamp01(readLayerNumber(spec.roughness, ['base'], 0.76));
  const roughnessVariation = clamp01(readLayerNumber(spec.roughness, ['variation'], 0.18));
  const colorAmplitude = clamp01(readLayerNumber(spec.colorVariation, ['amplitude', 'variation'], 0.18));
  const heightCorrelation = clamp01(readLayerNumber(spec.colorVariation, ['heightCorrelation'], 0.3));
  const colorGradient: ColorGradientSpec | undefined = spec.colorGradient;
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const index = y * size + x;
      const height = sampleSurface(u, v, bands, seed + 101);
      const roughNoise = sampleSurface(u, v, bands, seed + 7001);
      const colorNoise = sampleSurface(u, v, bands, seed + 15013);
      heightField[index] = height;
      roughnessField[index] = clamp01(baseRoughness + (roughNoise - 0.5) * roughnessVariation * 2);
      let color: [number, number, number];
      if (colorGradient) {
        // Evidence-derived spatial gradient (Plan 1.3 Workstream C) takes priority
        // over the noise-based palette blend below — it is a measured trend, not a guess.
        color = sampleColorGradient(colorGradient, u, v);
      } else {
        const paletteValue = clamp01(
          0.5 + (colorNoise - 0.5) * colorAmplitude * 2 + (height - 0.5) * heightCorrelation
        );
        color = mixPalette(colors, paletteValue);
      }
      writePixel(images.albedo.data, index * 4, color[0], color[1], color[2]);
    }
  }
  const normalStrength = Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35));
  const aoStrength = clamp01(readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35));
  for (let y = 0; y < size; y += 1) {
    const up = ((y - 1 + size) % size) * size;
    const down = ((y + 1) % size) * size;
    for (let x = 0; x < size; x += 1) {
      const left = (x - 1 + size) % size;
      const right = (x + 1) % size;
      const index = y * size + x;
      const center = heightField[index];
      const dx = (heightField[y * size + right] - heightField[y * size + left]) * normalStrength * 6;
      const dy = (heightField[down + x] - heightField[up + x]) * normalStrength * 6;
      const inverseLength = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const normalX = -dx * inverseLength;
      const normalY = -dy * inverseLength;
      const normalZ = inverseLength;
      const neighborAverage = (
        heightField[y * size + left] + heightField[y * size + right]
        + heightField[up + x] + heightField[down + x]
      ) * 0.25;
      const cavity = Math.max(0, neighborAverage - center);
      const ao = clamp01(1 - aoStrength * (cavity * 12 + (1 - center) * 0.16));
      const offset = index * 4;
      const heightByte = center * 255;
      const roughnessByte = roughnessField[index] * 255;
      writePixel(images.height.data, offset, heightByte, heightByte, heightByte);
      writePixel(images.roughness.data, offset, roughnessByte, roughnessByte, roughnessByte);
      writePixel(
        images.normal.data, offset,
        (normalX * 0.5 + 0.5) * 255,
        (normalY * 0.5 + 0.5) * 255,
        (normalZ * 0.5 + 0.5) * 255,
      );
      writePixel(images.ao.data, offset, ao * 255, ao * 255, ao * 255);
    }
  }
  contexts.albedo.putImageData(images.albedo, 0, 0);
  contexts.roughness.putImageData(images.roughness, 0, 0);
  contexts.height.putImageData(images.height, 0, 0);
  contexts.normal.putImageData(images.normal, 0, 0);
  contexts.ao.putImageData(images.ao, 0, 0);
  return {
    albedo: createMapTexture(canvases.albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createMapTexture(canvases.roughness, THREE.NoColorSpace, spec, options),
    height: createMapTexture(canvases.height, THREE.NoColorSpace, spec, options),
    normal: createMapTexture(canvases.normal, THREE.NoColorSpace, spec, options),
    ao: createMapTexture(canvases.ao, THREE.NoColorSpace, spec, options),
    source: 'procedural',
  };
}

function createSculptMaterial(id: string, spec: SculptMaterialSpec, options: ProceduralModelOptions, denseComponent = false): THREE.MeshPhysicalMaterial {
  // A material that declares -- with evidence -- that its subject carries no texture
  // detail gets NO texture set. Synthesising one anyway is not a harmless default: the
  // branch below then forces color to white and roughness to 1 and reads both from the
  // generated maps, so the authored albedo and the reference-derived roughness are both
  // discarded, and the model gains mottling the reference does not have. Measured on the
  // tuxedo cat, whose black fur rendered as speckled grey-and-white from a palette that
  // only ever described two flat regions.
  const textureless = (spec.textureless as { declared?: boolean } | undefined)?.declared === true;
  const textures = textureless
    ? null
    : makeReferenceTextureSet(spec, options) ?? makeProceduralTextureSet(id, spec, options);
  const material = new THREE.MeshPhysicalMaterial({
    color: textures ? 0xffffff : clampedAlbedoColor(spec),
    roughness: textures ? 1 : clamp01(readLayerNumber(spec.roughness, ['base'], 0.76)),
    metalness: clampPbrMetalness(readLayerNumber(spec.metalness, ['base'], 0.0)),
    clearcoat: clamp01(readLayerNumber(spec.clearcoat, ['base', 'amount'], 0)),
    clearcoatRoughness: clamp01(readLayerNumber(spec.clearcoatRoughness, ['base'], 0.25)),
    transmission: clamp01(readLayerNumber(spec.transmission, ['base', 'amount'], 0)),
    ior: clampPbrIor(readLayerNumber(spec.ior, ['base', 'value'], 1.5)),
    thickness: Math.max(0, readLayerNumber(spec.thickness, ['base', 'amount'], 0)),
    attenuationDistance: Math.max(0.001, readLayerNumber(spec.attenuationDistance, ['base', 'value'], Infinity)),
    attenuationColor: new THREE.Color(typeof spec.attenuationColor === 'string' ? spec.attenuationColor : '#ffffff'),
    sheen: clamp01(readLayerNumber(spec.sheen, ['base', 'amount'], 0)),
    sheenColor: new THREE.Color(typeof spec.sheenColor === 'string' ? spec.sheenColor : '#ffffff'),
    sheenRoughness: clamp01(readLayerNumber(spec.sheenRoughness, ['base'], 1.0)),
    iridescence: clamp01(readLayerNumber(spec.iridescence, ['base', 'amount'], 0)),
    iridescenceIOR: clampPbrIor(readLayerNumber(spec.iridescenceIOR, ['base', 'value'], 1.3)),
    anisotropy: clamp01(readLayerNumber(spec.anisotropy, ['base', 'amount'], 0)),
    anisotropyRotation: readLayerNumber(spec.anisotropy, ['rotation'], 0),
    specularIntensity: clampPbrF0(readLayerNumber(spec.specularF0 ?? spec.f0 ?? spec.specularIntensity, ['base', 'value'], 1.0)),
    specularColor: new THREE.Color(typeof spec.specularColor === 'string' ? spec.specularColor : '#ffffff'),
    emissive: new THREE.Color(typeof spec.emissive === 'string' ? spec.emissive : '#000000'),
    emissiveIntensity: Math.max(0, readLayerNumber(spec.emissiveIntensity, ['base'], 1.0)),
    opacity: clamp01(readLayerNumber(spec.opacity, ['base'], 1)),
    transparent: readLayerNumber(spec.transmission, ['base', 'amount'], 0) > 0 || readLayerNumber(spec.opacity, ['base'], 1) < 1,
    alphaTest: Math.max(0, readLayerNumber(spec.alpha, ['cutoff', 'alphaTest'], 0)),
    wireframe: options.wireframe ?? false,
    side: spec.doubleSided === true ? THREE.DoubleSide : THREE.FrontSide,
    flatShading: spec.flatShading === true,
  });
  if (textures) {
    material.map = textures.albedo;
    material.roughnessMap = textures.roughness;
    material.normalMap = textures.normal;
    material.normalScale.setScalar(Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35)));
    material.aoMap = textures.ao;
    material.aoMap.channel = 0;
    material.aoMapIntensity = readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35);
    const denseMesh = denseComponent || spec.denseMesh === true || spec.geometryDensity === 'dense' || spec.topologyClass === 'dense';
    const bumpScale = Math.max(0, readLayerNumber(spec.bump, ['amplitude', 'strength'], 0));
    const effectiveBumpScale = denseMesh ? Math.max(0.05, bumpScale) : bumpScale;
    if (effectiveBumpScale > 0) {
      material.bumpMap = textures.height;
      material.bumpScale = effectiveBumpScale;
    }
    const displacementScale = Math.max(0, readLayerNumber(spec.displacement, ['amplitude', 'strength'], 0));
    const effectiveDisplacementScale = denseMesh ? Math.max(0.005, displacementScale) : displacementScale;
    if (effectiveDisplacementScale > 0) {
      material.displacementMap = textures.height;
      material.displacementScale = effectiveDisplacementScale;
      material.displacementBias = -effectiveDisplacementScale * 0.5;
    }
  }
  material.envMapIntensity = readLayerNumber(spec, ['envMapIntensity'], 0.8);
  material.userData.sculptMaterial = spec;
  material.userData.proceduralMapsIndependent = true;
  material.userData.pbrConstraints = { albedoRange: [30, 240], binaryMetalness: true, f0Range: [0.02, 1], iorRange: [1, 2.5] };
  material.userData.pbrTextureSource = textures?.source ?? 'flat-fallback';
  material.userData.referencePbr = spec.referencePbr ?? null;
  material.userData.referenceMaterialId = spec.referenceMaterialId ?? spec.materialReference?.profileId ?? null;
  material.userData.materialEvidence = spec.materialEvidence ?? null;
  material.userData.validationViews = spec.materialReference?.validationViews ?? [];
  material.needsUpdate = true;
  return material;
}

type AttachmentEndpoint = {
  start: THREE.Vector3;
  midpoint: THREE.Vector3;
  quaternion: THREE.Quaternion;
  length: number;
  baseRadius: number;
  endRadius: number;
};

function readVector3(value: unknown, fallback: [number, number, number]): THREE.Vector3 {
  if (Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === 'number')) {
    return new THREE.Vector3(value[0], value[1], value[2]);
  }
  return new THREE.Vector3(fallback[0], fallback[1], fallback[2]);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function makeAttachmentEndpoint(attachment: unknown): AttachmentEndpoint | null {
  if (!attachment || typeof attachment !== 'object') return null;
  const record = attachment as Record<string, unknown>;
  const start = readVector3(record.localStart, [0, 0, 0]);
  const end = readVector3(record.localEnd, [0, 1, 0]);
  const delta = end.clone().sub(start);
  const length = delta.length();
  if (length <= 0.0001) return null;
  const direction = delta.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  const baseRadius = Math.max(0.005, readNumber(record.baseRadius, 0.06));
  const endRadius = Math.max(0.003, readNumber(record.endRadius, baseRadius * 0.55));
  return {
    start,
    midpoint: delta.multiplyScalar(0.5),
    quaternion,
    length,
    baseRadius,
    endRadius,
  };
}

// Generated from ObjectSculptSpec target: KURT Z Brand Mark
// Sculpt build pass: blockout
// This factory is intentionally pass-gated. Finish browser screenshot review before unlocking deeper passes.
export function createKURTZBrandMarkModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = "KURT Z Brand Mark";
  root.userData.reconstructionEvidence = {"itemFamily": null, "subtype": null, "componentAdapter": null, "route": null, "exactnessTier": null, "referenceCamera": {"solved": false, "fovDegrees": 40.0, "aspect": 1.0, "orientation": {"yaw": 0.0, "pitch": 0.0, "roll": 0.0}, "positionHint": [0.0, 0.0, 3.0], "note": "For likeness work, solve the reference camera (forge/stage1_intake/solve_camera_pose.py) so the review render aligns with the photo and the reference can be projected. Confirm by overlay review."}, "approximationNotes": []};
  root.userData.materialPipeline = {};
  root.userData.materialReferenceRegistry = null;

  const materialMap: Record<string, THREE.Material> = {};
  materialMap["paint-red"] = createSculptMaterial(
    "paint-red",
    {"id": "paint-red", "name": "KURT signature red — metallic automotive paint", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "materialClass": "metal", "baseColor": "#e20613", "color": "#e20613", "albedo": {"dominant": "#e20613", "secondary": ["#ff2a20", "#a8040e"], "samplingNotes": "Exact value counted on the reference raster; measured, not averaged."}, "textureless": {"declared": true, "evidence": ["Pixel census of the reference raster: exactly two solid colour values across 1,231,324 foreground pixels — rgb(226,6,19) over 994,988 px and rgb(112,130,150) over 236,336 px.", "Edge census of the same raster: zero antialiased pixels, so the artwork is vector-derived flat fill rather than a photographed surface.", "Reference view 'full-object' shows no gradient, grain, wear or specular variation anywhere inside either colour region."], "measuredColourCount": 2}, "metalness": 0.08, "roughness": {"base": 0.3, "variation": 0.06}, "clearcoat": 1.0, "clearcoatRoughness": 0.06, "envMapIntensity": 0.55, "notes": "Albedo rgb(226,6,19) is measured. Metalness is near zero because automotive paint is a dielectric base carrying metallic flakes — the metallic read comes from the clearcoat and the flake band, not from a conductor. Driving metalness up desaturates the measured albedo against the environment, which is exactly the wash this value corrects.", "localOverrides": [{"id": "edge-sheen", "mask": "grazing-angle Fresnel along the extruded side walls", "channel": "roughness", "delta": -0.1, "note": "DECLARED look-dev for the hero render, not reference-observed."}, {"id": "cavity-ao", "mask": "concave junctions where the diagonal meets the bars", "channel": "ambient-occlusion", "delta": 0.18, "note": "Contact darkening at the Z inner corners so the extrusion reads as a solid."}], "colorVariation": {"palette": ["#e20613", "#ff2a20", "#a8040e"], "pattern": "metallic flake (declared look-dev, shader-side not texture-side)", "amplitude": 0.05, "heightCorrelation": 0.0}},
    options
  );
  materialMap["paint-slate"] = createSculptMaterial(
    "paint-slate",
    {"id": "paint-slate", "name": "Slate swoosh — satin painted metal", "type": "physical", "shaderModel": "MeshPhysicalMaterial", "materialClass": "metal", "baseColor": "#708296", "color": "#708296", "albedo": {"dominant": "#708296", "secondary": ["#8a9cb0", "#53626f"], "samplingNotes": "Exact value counted on the reference raster; measured, not averaged."}, "textureless": {"declared": true, "evidence": ["Pixel census of the reference raster: exactly two solid colour values across 1,231,324 foreground pixels — rgb(226,6,19) over 994,988 px and rgb(112,130,150) over 236,336 px.", "Edge census of the same raster: zero antialiased pixels, so the artwork is vector-derived flat fill rather than a photographed surface.", "Reference view 'full-object' shows no gradient, grain, wear or specular variation anywhere inside either colour region."], "measuredColourCount": 2}, "metalness": 0.06, "roughness": {"base": 0.42, "variation": 0.05}, "clearcoat": 0.45, "clearcoatRoughness": 0.18, "envMapIntensity": 0.45, "notes": "Albedo rgb(112,130,150) is measured. Satin finish: lower clearcoat and higher roughness than the red so the ribbon stays the quieter element.", "localOverrides": [{"id": "edge-sheen", "mask": "grazing-angle Fresnel along the extruded side walls", "channel": "roughness", "delta": -0.1, "note": "DECLARED look-dev for the hero render, not reference-observed."}, {"id": "cavity-ao", "mask": "concave junctions where the diagonal meets the bars", "channel": "ambient-occlusion", "delta": 0.18, "note": "Contact darkening at the Z inner corners so the extrusion reads as a solid."}], "colorVariation": {"palette": ["#708296", "#8a9cb0", "#53626f"], "pattern": "metallic flake (declared look-dev, shader-side not texture-side)", "amplitude": 0.05, "heightCorrelation": 0.0}},
    options
  );

  const nodes: Record<string, THREE.Object3D> = { root };
  const meshes: Record<string, THREE.Mesh> = {};
  const sockets: Record<string, THREE.Object3D> = {};
  const colliders: Record<string, unknown> = {};
  const destructionGroups: Record<string, THREE.Object3D[]> = {};

  const endpoint_z_mark_0 = makeAttachmentEndpoint(null);
  const node_z_mark_0 = new THREE.Group();
  node_z_mark_0.name = "Red Z mark__pivot";
  node_z_mark_0.scale.set(1, 1, 1);
  if (endpoint_z_mark_0) {
    node_z_mark_0.position.copy(endpoint_z_mark_0.start);
    node_z_mark_0.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_z_mark_0.position.set(0.0, 0.0, 0.0);
    node_z_mark_0.rotation.set(0.0, 0.0, 0.0);
  }
  node_z_mark_0.userData.sculptComponent = {"id": "z-mark", "name": "Red Z mark", "level": "macro", "role": "body", "importance": 1.0, "confidence": 0.95, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "A flat closed profile given thickness in Z. The identity lives entirely in the 2D outline, which was measured from the reference raster by boundary trace rather than estimated, so an extruded profile reproduces it exactly; no other primitive can carry this silhouette without approximating it.", "geometryDescriptor": {"topologyIntent": "closed planar profile extruded along +Z, flat-capped", "profile2D": {"points": [[-0.5585, 0.5], [0.2619, 0.5], [0.2792, 0.4977], [0.2951, 0.494], [0.3223, 0.4842], [0.3502, 0.4698], [0.3796, 0.4487], [0.3977, 0.4313], [0.4068, 0.4208], [0.4249, 0.3936], [0.4332, 0.3762], [0.4392, 0.3589], [0.4453, 0.3264], [0.4453, 0.2917], [0.443, 0.2736], [0.4377, 0.2494], [0.4234, 0.2094], [0.4053, 0.1762], [0.3977, 0.1657], [0.3864, 0.1536], [-0.0377, -0.2117], [-0.0355, -0.2125], [-0.0211, -0.2072], [0.0045, -0.2004], [0.0423, -0.1936], [0.0838, -0.1898], [0.126, -0.1898], [0.1675, -0.1936], [0.2091, -0.2011], [0.2475, -0.2117], [0.2883, -0.2268], [0.3253, -0.2442], [0.3668, -0.2683], [0.4083, -0.2977], [0.434, -0.3189], [0.4619, -0.3445], [0.4958, -0.38], [0.5275, -0.4177], [0.5592, -0.4608], [0.4626, -0.4291], [0.3992, -0.4102], [0.3374, -0.3943], [0.2838, -0.383], [0.2128, -0.3717], [0.1532, -0.3657], [0.1102, -0.3634], [0.0475, -0.3634], [-0.0113, -0.3672], [-0.0649, -0.374], [-0.1238, -0.3853], [-0.1857, -0.4019], [-0.24, -0.4208], [-0.28, -0.4374], [-0.3442, -0.4691], [-0.3758, -0.4872], [-0.3834, -0.4932], [-0.3992, -0.4985], [-0.4121, -0.5], [-0.4287, -0.5], [-0.4543, -0.4955], [-0.4717, -0.4887], [-0.4936, -0.4743], [-0.5079, -0.46], [-0.52, -0.4426], [-0.526, -0.4306], [-0.5313, -0.4155], [-0.5351, -0.3958], [-0.5351, -0.3702], [-0.5313, -0.3506], [-0.526, -0.3355], [-0.52, -0.3234], [-0.5079, -0.306], [-0.4672, -0.2706], [0.1004, 0.2026], [0.1079, 0.2109], [0.1132, 0.2208], [0.1155, 0.2291], [0.1155, 0.2389], [0.1117, 0.2502], [0.1019, 0.2608], [0.0928, 0.2653], [0.0823, 0.2675], [-0.3494, 0.2675], [-0.3819, 0.2721], [-0.4128, 0.2811], [-0.4408, 0.294], [-0.4687, 0.3121], [-0.4815, 0.3226], [-0.5004, 0.3415], [-0.5155, 0.3604], [-0.5268, 0.3777], [-0.5389, 0.4011], [-0.5487, 0.4275], [-0.5562, 0.46], [-0.5592, 0.4992]], "depth": 0.14}, "edgeTreatment": {"type": "none", "bevelRadius": 0.0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat face normals from ExtrudeGeometry caps and walls", "provenance": {"method": "Moore-neighbour boundary trace of the colour mask, simplified with Ramer-Douglas-Peucker at epsilon 1.1 px", "sourceImage": "reference/kurt-z-mark.png", "sourcePixels": [1592, 1533], "normalisation": "centred on the red bounding box, y-up, unit = red bbox height", "measuredFidelity": "red mask IoU 0.99486 vs reference"}}, "parent": null, "attachment": null, "dimensions": {"width": 1.1184, "height": 1.0, "depth": 0.14, "units": "relative to red bbox height = 1.0", "confidence": 0.95}, "transform": {"position": [0, 0, 0.0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "root", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "paint-red"}}, "material": "paint-red", "materialLayers": ["paint-red"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "rounded-top-right-terminal", "description": "Convex semicircular cap closing the top bar; carried by the traced outline, not approximated.", "evidenceRef": "full-object", "identityCritical": true}, {"id": "pointed-bottom-right-tail", "description": "Sharp converging apex at the right end of the bottom bar. bevelEnabled is false so the tip stays a true point instead of being rounded off by the extruder.", "evidenceRef": "full-object", "identityCritical": true}, {"id": "arched-bottom-bar", "description": "The bottom bar is convex-upward; the arch lifts clear of the baseline mid-span.", "evidenceRef": "full-object", "identityCritical": true}, {"id": "concave-upper-left-sweep", "description": "Concave arc cutting the left end of the top bar down and to the left.", "evidenceRef": "full-object", "identityCritical": false}], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "materialId": "paint-red", "notes": "Primary brand element. Contour traced at 48 points.", "colorMaterialRecipe": {"dominantAlbedo": "rgba(226, 6, 19, 1.0)", "secondaryAlbedo": "rgba(168, 4, 14, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.55, "evidence": "Albedo measured by exact pixel count on the reference raster. The metal class is a declared automotive-paint interpretation; flat artwork cannot evidence a material class.", "colorGradient": {"type": "linear", "stops": [{"position": 0.0, "color": "rgba(226, 6, 19, 1.0)"}, {"position": 1.0, "color": "rgba(168, 4, 14, 1.0)"}]}}};
  node_z_mark_0.userData.actionProfile = {"animationRole": "root", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "paint-red"}};
  (nodes["root"] ?? root).add(node_z_mark_0);
  nodes["z-mark"] = node_z_mark_0;
  const mesh_z_mark_0Geometry = endpoint_z_mark_0
    ? new THREE.CylinderGeometry(endpoint_z_mark_0.endRadius, endpoint_z_mark_0.baseRadius, endpoint_z_mark_0.length, 8, 4)
    : buildExtrudeGeometry({"points": [[-0.5585, 0.5], [0.2619, 0.5], [0.2792, 0.4977], [0.2951, 0.494], [0.3223, 0.4842], [0.3502, 0.4698], [0.3796, 0.4487], [0.3977, 0.4313], [0.4068, 0.4208], [0.4249, 0.3936], [0.4332, 0.3762], [0.4392, 0.3589], [0.4453, 0.3264], [0.4453, 0.2917], [0.443, 0.2736], [0.4377, 0.2494], [0.4234, 0.2094], [0.4053, 0.1762], [0.3977, 0.1657], [0.3864, 0.1536], [-0.0377, -0.2117], [-0.0355, -0.2125], [-0.0211, -0.2072], [0.0045, -0.2004], [0.0423, -0.1936], [0.0838, -0.1898], [0.126, -0.1898], [0.1675, -0.1936], [0.2091, -0.2011], [0.2475, -0.2117], [0.2883, -0.2268], [0.3253, -0.2442], [0.3668, -0.2683], [0.4083, -0.2977], [0.434, -0.3189], [0.4619, -0.3445], [0.4958, -0.38], [0.5275, -0.4177], [0.5592, -0.4608], [0.4626, -0.4291], [0.3992, -0.4102], [0.3374, -0.3943], [0.2838, -0.383], [0.2128, -0.3717], [0.1532, -0.3657], [0.1102, -0.3634], [0.0475, -0.3634], [-0.0113, -0.3672], [-0.0649, -0.374], [-0.1238, -0.3853], [-0.1857, -0.4019], [-0.24, -0.4208], [-0.28, -0.4374], [-0.3442, -0.4691], [-0.3758, -0.4872], [-0.3834, -0.4932], [-0.3992, -0.4985], [-0.4121, -0.5], [-0.4287, -0.5], [-0.4543, -0.4955], [-0.4717, -0.4887], [-0.4936, -0.4743], [-0.5079, -0.46], [-0.52, -0.4426], [-0.526, -0.4306], [-0.5313, -0.4155], [-0.5351, -0.3958], [-0.5351, -0.3702], [-0.5313, -0.3506], [-0.526, -0.3355], [-0.52, -0.3234], [-0.5079, -0.306], [-0.4672, -0.2706], [0.1004, 0.2026], [0.1079, 0.2109], [0.1132, 0.2208], [0.1155, 0.2291], [0.1155, 0.2389], [0.1117, 0.2502], [0.1019, 0.2608], [0.0928, 0.2653], [0.0823, 0.2675], [-0.3494, 0.2675], [-0.3819, 0.2721], [-0.4128, 0.2811], [-0.4408, 0.294], [-0.4687, 0.3121], [-0.4815, 0.3226], [-0.5004, 0.3415], [-0.5155, 0.3604], [-0.5268, 0.3777], [-0.5389, 0.4011], [-0.5487, 0.4275], [-0.5562, 0.46], [-0.5592, 0.4992]], "depth": 0.14});
  if (!endpoint_z_mark_0) {
    mesh_z_mark_0Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_z_mark_0 = new THREE.Mesh(
    mesh_z_mark_0Geometry,
    materialMap["paint-red"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_z_mark_0.name = "Red Z mark";
  if (endpoint_z_mark_0) {
    mesh_z_mark_0.position.copy(endpoint_z_mark_0.midpoint);
    mesh_z_mark_0.quaternion.copy(endpoint_z_mark_0.quaternion);
  }
  mesh_z_mark_0.castShadow = options.castShadow ?? true;
  mesh_z_mark_0.receiveShadow = options.receiveShadow ?? true;
  mesh_z_mark_0.userData.sculptComponent = {"id": "z-mark", "name": "Red Z mark", "level": "macro", "role": "body", "importance": 1.0, "confidence": 0.95, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "A flat closed profile given thickness in Z. The identity lives entirely in the 2D outline, which was measured from the reference raster by boundary trace rather than estimated, so an extruded profile reproduces it exactly; no other primitive can carry this silhouette without approximating it.", "geometryDescriptor": {"topologyIntent": "closed planar profile extruded along +Z, flat-capped", "profile2D": {"points": [[-0.5585, 0.5], [0.2619, 0.5], [0.2792, 0.4977], [0.2951, 0.494], [0.3223, 0.4842], [0.3502, 0.4698], [0.3796, 0.4487], [0.3977, 0.4313], [0.4068, 0.4208], [0.4249, 0.3936], [0.4332, 0.3762], [0.4392, 0.3589], [0.4453, 0.3264], [0.4453, 0.2917], [0.443, 0.2736], [0.4377, 0.2494], [0.4234, 0.2094], [0.4053, 0.1762], [0.3977, 0.1657], [0.3864, 0.1536], [-0.0377, -0.2117], [-0.0355, -0.2125], [-0.0211, -0.2072], [0.0045, -0.2004], [0.0423, -0.1936], [0.0838, -0.1898], [0.126, -0.1898], [0.1675, -0.1936], [0.2091, -0.2011], [0.2475, -0.2117], [0.2883, -0.2268], [0.3253, -0.2442], [0.3668, -0.2683], [0.4083, -0.2977], [0.434, -0.3189], [0.4619, -0.3445], [0.4958, -0.38], [0.5275, -0.4177], [0.5592, -0.4608], [0.4626, -0.4291], [0.3992, -0.4102], [0.3374, -0.3943], [0.2838, -0.383], [0.2128, -0.3717], [0.1532, -0.3657], [0.1102, -0.3634], [0.0475, -0.3634], [-0.0113, -0.3672], [-0.0649, -0.374], [-0.1238, -0.3853], [-0.1857, -0.4019], [-0.24, -0.4208], [-0.28, -0.4374], [-0.3442, -0.4691], [-0.3758, -0.4872], [-0.3834, -0.4932], [-0.3992, -0.4985], [-0.4121, -0.5], [-0.4287, -0.5], [-0.4543, -0.4955], [-0.4717, -0.4887], [-0.4936, -0.4743], [-0.5079, -0.46], [-0.52, -0.4426], [-0.526, -0.4306], [-0.5313, -0.4155], [-0.5351, -0.3958], [-0.5351, -0.3702], [-0.5313, -0.3506], [-0.526, -0.3355], [-0.52, -0.3234], [-0.5079, -0.306], [-0.4672, -0.2706], [0.1004, 0.2026], [0.1079, 0.2109], [0.1132, 0.2208], [0.1155, 0.2291], [0.1155, 0.2389], [0.1117, 0.2502], [0.1019, 0.2608], [0.0928, 0.2653], [0.0823, 0.2675], [-0.3494, 0.2675], [-0.3819, 0.2721], [-0.4128, 0.2811], [-0.4408, 0.294], [-0.4687, 0.3121], [-0.4815, 0.3226], [-0.5004, 0.3415], [-0.5155, 0.3604], [-0.5268, 0.3777], [-0.5389, 0.4011], [-0.5487, 0.4275], [-0.5562, 0.46], [-0.5592, 0.4992]], "depth": 0.14}, "edgeTreatment": {"type": "none", "bevelRadius": 0.0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat face normals from ExtrudeGeometry caps and walls", "provenance": {"method": "Moore-neighbour boundary trace of the colour mask, simplified with Ramer-Douglas-Peucker at epsilon 1.1 px", "sourceImage": "reference/kurt-z-mark.png", "sourcePixels": [1592, 1533], "normalisation": "centred on the red bounding box, y-up, unit = red bbox height", "measuredFidelity": "red mask IoU 0.99486 vs reference"}}, "parent": null, "attachment": null, "dimensions": {"width": 1.1184, "height": 1.0, "depth": 0.14, "units": "relative to red bbox height = 1.0", "confidence": 0.95}, "transform": {"position": [0, 0, 0.0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "root", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "paint-red"}}, "material": "paint-red", "materialLayers": ["paint-red"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "rounded-top-right-terminal", "description": "Convex semicircular cap closing the top bar; carried by the traced outline, not approximated.", "evidenceRef": "full-object", "identityCritical": true}, {"id": "pointed-bottom-right-tail", "description": "Sharp converging apex at the right end of the bottom bar. bevelEnabled is false so the tip stays a true point instead of being rounded off by the extruder.", "evidenceRef": "full-object", "identityCritical": true}, {"id": "arched-bottom-bar", "description": "The bottom bar is convex-upward; the arch lifts clear of the baseline mid-span.", "evidenceRef": "full-object", "identityCritical": true}, {"id": "concave-upper-left-sweep", "description": "Concave arc cutting the left end of the top bar down and to the left.", "evidenceRef": "full-object", "identityCritical": false}], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "materialId": "paint-red", "notes": "Primary brand element. Contour traced at 48 points.", "colorMaterialRecipe": {"dominantAlbedo": "rgba(226, 6, 19, 1.0)", "secondaryAlbedo": "rgba(168, 4, 14, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.55, "evidence": "Albedo measured by exact pixel count on the reference raster. The metal class is a declared automotive-paint interpretation; flat artwork cannot evidence a material class.", "colorGradient": {"type": "linear", "stops": [{"position": 0.0, "color": "rgba(226, 6, 19, 1.0)"}, {"position": 1.0, "color": "rgba(168, 4, 14, 1.0)"}]}}};
  node_z_mark_0.add(mesh_z_mark_0);
  meshes["z-mark"] = mesh_z_mark_0;
  colliders["z-mark"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_z_mark_0);

  const endpoint_swoosh_ribbon_1 = makeAttachmentEndpoint(null);
  const node_swoosh_ribbon_1 = new THREE.Group();
  node_swoosh_ribbon_1.name = "Slate swoosh ribbon__pivot";
  node_swoosh_ribbon_1.scale.set(1, 1, 1);
  if (endpoint_swoosh_ribbon_1) {
    node_swoosh_ribbon_1.position.copy(endpoint_swoosh_ribbon_1.start);
    node_swoosh_ribbon_1.rotation.set(0.0, 0.0, 0.0);
  } else {
    node_swoosh_ribbon_1.position.set(0.0, 0.0, -0.035);
    node_swoosh_ribbon_1.rotation.set(0.0, 0.0, 0.0);
  }
  node_swoosh_ribbon_1.userData.sculptComponent = {"id": "swoosh-ribbon", "name": "Slate swoosh ribbon", "level": "macro", "role": "accent", "importance": 1.0, "confidence": 0.95, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "A flat closed profile given thickness in Z. The identity lives entirely in the 2D outline, which was measured from the reference raster by boundary trace rather than estimated, so an extruded profile reproduces it exactly; no other primitive can carry this silhouette without approximating it.", "geometryDescriptor": {"topologyIntent": "closed planar profile extruded along +Z, flat-capped", "profile2D": {"points": [[0.046, -0.3996], [0.1117, -0.3996], [0.154, -0.4019], [0.2189, -0.4087], [0.2838, -0.4192], [0.3404, -0.4313], [0.4045, -0.4479], [0.4649, -0.466], [0.5592, -0.497], [0.6408, -0.6306], [0.5487, -0.6011], [0.4755, -0.58], [0.406, -0.5626], [0.3374, -0.5483], [0.2626, -0.5362], [0.2038, -0.5294], [0.1358, -0.5249], [0.0664, -0.5242], [0.0038, -0.5272], [-0.0475, -0.5325], [-0.1004, -0.5408], [-0.1494, -0.5513], [-0.2106, -0.5687], [-0.2755, -0.5928], [-0.3291, -0.6177], [-0.3691, -0.6396], [-0.3751, -0.6434], [-0.3774, -0.6464], [-0.3909, -0.6517], [-0.4136, -0.6562], [-0.4325, -0.6562], [-0.4468, -0.654], [-0.4596, -0.6502], [-0.4777, -0.6419], [-0.4921, -0.6321], [-0.5042, -0.6208], [-0.5155, -0.6057], [-0.5155, -0.4864], [-0.5079, -0.4962], [-0.4943, -0.5098], [-0.4785, -0.5211], [-0.4649, -0.5279], [-0.4543, -0.5317], [-0.4362, -0.5355], [-0.406, -0.5355], [-0.3947, -0.5325], [-0.3811, -0.5264], [-0.3358, -0.5008], [-0.2732, -0.4706], [-0.2279, -0.4525], [-0.1728, -0.4343], [-0.117, -0.42], [-0.0604, -0.4094], [-0.0038, -0.4026], [0.0453, -0.4004]], "depth": 0.1}, "edgeTreatment": {"type": "none", "bevelRadius": 0.0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat face normals from ExtrudeGeometry caps and walls", "provenance": {"method": "Moore-neighbour boundary trace of the colour mask, simplified with Ramer-Douglas-Peucker at epsilon 1.1 px", "sourceImage": "reference/kurt-z-mark.png", "sourcePixels": [1592, 1533], "normalisation": "centred on the red bounding box, y-up, unit = red bbox height", "measuredFidelity": "red mask IoU 0.99486 vs reference"}}, "parent": "z-mark", "attachment": null, "dimensions": {"width": 1.1563, "height": 0.2566, "depth": 0.1, "units": "relative to red bbox height = 1.0", "confidence": 0.95}, "transform": {"position": [0, 0, -0.035], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "accent", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "paint-slate"}}, "material": "paint-slate", "materialLayers": ["paint-slate"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "white-separation-gap", "description": "The ribbon never touches the red mark. The background gap is part of the artwork and is preserved by the two independent traced outlines; no geometry bridges them.", "evidenceRef": "full-object", "identityCritical": true}, {"id": "ribbon-arc-echo", "description": "The ribbon repeats the bottom bar's arc at a larger radius and runs further right.", "evidenceRef": "full-object", "identityCritical": true}], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "materialId": "paint-slate", "notes": "Separate element sitting slightly behind the mark. Contour traced at 55 points.", "colorMaterialRecipe": {"dominantAlbedo": "rgba(112, 130, 150, 1.0)", "secondaryAlbedo": "rgba(83, 98, 111, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.55, "evidence": "Albedo measured by exact pixel count on the reference raster. The metal class is a declared automotive-paint interpretation; flat artwork cannot evidence a material class.", "colorGradient": {"type": "linear", "stops": [{"position": 0.0, "color": "rgba(112, 130, 150, 1.0)"}, {"position": 1.0, "color": "rgba(83, 98, 111, 1.0)"}]}}};
  node_swoosh_ribbon_1.userData.actionProfile = {"animationRole": "accent", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "paint-slate"}};
  (nodes["z-mark"] ?? root).add(node_swoosh_ribbon_1);
  nodes["swoosh-ribbon"] = node_swoosh_ribbon_1;
  const mesh_swoosh_ribbon_1Geometry = endpoint_swoosh_ribbon_1
    ? new THREE.CylinderGeometry(endpoint_swoosh_ribbon_1.endRadius, endpoint_swoosh_ribbon_1.baseRadius, endpoint_swoosh_ribbon_1.length, 8, 4)
    : buildExtrudeGeometry({"points": [[0.046, -0.3996], [0.1117, -0.3996], [0.154, -0.4019], [0.2189, -0.4087], [0.2838, -0.4192], [0.3404, -0.4313], [0.4045, -0.4479], [0.4649, -0.466], [0.5592, -0.497], [0.6408, -0.6306], [0.5487, -0.6011], [0.4755, -0.58], [0.406, -0.5626], [0.3374, -0.5483], [0.2626, -0.5362], [0.2038, -0.5294], [0.1358, -0.5249], [0.0664, -0.5242], [0.0038, -0.5272], [-0.0475, -0.5325], [-0.1004, -0.5408], [-0.1494, -0.5513], [-0.2106, -0.5687], [-0.2755, -0.5928], [-0.3291, -0.6177], [-0.3691, -0.6396], [-0.3751, -0.6434], [-0.3774, -0.6464], [-0.3909, -0.6517], [-0.4136, -0.6562], [-0.4325, -0.6562], [-0.4468, -0.654], [-0.4596, -0.6502], [-0.4777, -0.6419], [-0.4921, -0.6321], [-0.5042, -0.6208], [-0.5155, -0.6057], [-0.5155, -0.4864], [-0.5079, -0.4962], [-0.4943, -0.5098], [-0.4785, -0.5211], [-0.4649, -0.5279], [-0.4543, -0.5317], [-0.4362, -0.5355], [-0.406, -0.5355], [-0.3947, -0.5325], [-0.3811, -0.5264], [-0.3358, -0.5008], [-0.2732, -0.4706], [-0.2279, -0.4525], [-0.1728, -0.4343], [-0.117, -0.42], [-0.0604, -0.4094], [-0.0038, -0.4026], [0.0453, -0.4004]], "depth": 0.1});
  if (!endpoint_swoosh_ribbon_1) {
    mesh_swoosh_ribbon_1Geometry.scale(1.0, 1.0, 1.0);
  }
  const mesh_swoosh_ribbon_1 = new THREE.Mesh(
    mesh_swoosh_ribbon_1Geometry,
    materialMap["paint-slate"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_swoosh_ribbon_1.name = "Slate swoosh ribbon";
  if (endpoint_swoosh_ribbon_1) {
    mesh_swoosh_ribbon_1.position.copy(endpoint_swoosh_ribbon_1.midpoint);
    mesh_swoosh_ribbon_1.quaternion.copy(endpoint_swoosh_ribbon_1.quaternion);
  }
  mesh_swoosh_ribbon_1.castShadow = options.castShadow ?? true;
  mesh_swoosh_ribbon_1.receiveShadow = options.receiveShadow ?? true;
  mesh_swoosh_ribbon_1.userData.sculptComponent = {"id": "swoosh-ribbon", "name": "Slate swoosh ribbon", "level": "macro", "role": "accent", "importance": 1.0, "confidence": 0.95, "primitive": "extrude", "topologyClass": "assembled-solid", "topologyRationale": "A flat closed profile given thickness in Z. The identity lives entirely in the 2D outline, which was measured from the reference raster by boundary trace rather than estimated, so an extruded profile reproduces it exactly; no other primitive can carry this silhouette without approximating it.", "geometryDescriptor": {"topologyIntent": "closed planar profile extruded along +Z, flat-capped", "profile2D": {"points": [[0.046, -0.3996], [0.1117, -0.3996], [0.154, -0.4019], [0.2189, -0.4087], [0.2838, -0.4192], [0.3404, -0.4313], [0.4045, -0.4479], [0.4649, -0.466], [0.5592, -0.497], [0.6408, -0.6306], [0.5487, -0.6011], [0.4755, -0.58], [0.406, -0.5626], [0.3374, -0.5483], [0.2626, -0.5362], [0.2038, -0.5294], [0.1358, -0.5249], [0.0664, -0.5242], [0.0038, -0.5272], [-0.0475, -0.5325], [-0.1004, -0.5408], [-0.1494, -0.5513], [-0.2106, -0.5687], [-0.2755, -0.5928], [-0.3291, -0.6177], [-0.3691, -0.6396], [-0.3751, -0.6434], [-0.3774, -0.6464], [-0.3909, -0.6517], [-0.4136, -0.6562], [-0.4325, -0.6562], [-0.4468, -0.654], [-0.4596, -0.6502], [-0.4777, -0.6419], [-0.4921, -0.6321], [-0.5042, -0.6208], [-0.5155, -0.6057], [-0.5155, -0.4864], [-0.5079, -0.4962], [-0.4943, -0.5098], [-0.4785, -0.5211], [-0.4649, -0.5279], [-0.4543, -0.5317], [-0.4362, -0.5355], [-0.406, -0.5355], [-0.3947, -0.5325], [-0.3811, -0.5264], [-0.3358, -0.5008], [-0.2732, -0.4706], [-0.2279, -0.4525], [-0.1728, -0.4343], [-0.117, -0.42], [-0.0604, -0.4094], [-0.0038, -0.4026], [0.0453, -0.4004]], "depth": 0.1}, "edgeTreatment": {"type": "none", "bevelRadius": 0.0, "segments": 1}, "deformationStack": [], "uvStrategy": "generated procedural coordinates", "normalStrategy": "flat face normals from ExtrudeGeometry caps and walls", "provenance": {"method": "Moore-neighbour boundary trace of the colour mask, simplified with Ramer-Douglas-Peucker at epsilon 1.1 px", "sourceImage": "reference/kurt-z-mark.png", "sourcePixels": [1592, 1533], "normalisation": "centred on the red bounding box, y-up, unit = red bbox height", "measuredFidelity": "red mask IoU 0.99486 vs reference"}}, "parent": "z-mark", "attachment": null, "dimensions": {"width": 1.1563, "height": 0.2566, "depth": 0.1, "units": "relative to red bbox height = 1.0", "confidence": 0.95}, "transform": {"position": [0, 0, -0.035], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "accent", "pivot": {"mode": "center", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.9}, "transformChannels": {"translate": true, "rotate": true, "scale": true, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it."}, "constraints": [], "destruction": {"breakable": false, "fractureGroup": "root", "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": "paint-slate"}}, "material": "paint-slate", "materialLayers": ["paint-slate"], "deformations": [], "joints": [], "seams": [], "localFeatures": [{"id": "white-separation-gap", "description": "The ribbon never touches the red mark. The background gap is part of the artwork and is preserved by the two independent traced outlines; no geometry bridges them.", "evidenceRef": "full-object", "identityCritical": true}, {"id": "ribbon-arc-echo", "description": "The ribbon repeats the bottom bar's arc at a larger radius and runs further right.", "evidenceRef": "full-object", "identityCritical": true}], "surfaceDetail": {"macroRoughness": 0.0, "microRoughness": 0.0, "bumpAmplitude": 0.0, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""}, "evidenceRefs": ["full-object"], "details": [], "fidelityTier": "blockout", "materialId": "paint-slate", "notes": "Separate element sitting slightly behind the mark. Contour traced at 55 points.", "colorMaterialRecipe": {"dominantAlbedo": "rgba(112, 130, 150, 1.0)", "secondaryAlbedo": "rgba(83, 98, 111, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.55, "evidence": "Albedo measured by exact pixel count on the reference raster. The metal class is a declared automotive-paint interpretation; flat artwork cannot evidence a material class.", "colorGradient": {"type": "linear", "stops": [{"position": 0.0, "color": "rgba(112, 130, 150, 1.0)"}, {"position": 1.0, "color": "rgba(83, 98, 111, 1.0)"}]}}};
  node_swoosh_ribbon_1.add(mesh_swoosh_ribbon_1);
  meshes["swoosh-ribbon"] = mesh_swoosh_ribbon_1;
  colliders["swoosh-ribbon"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "Replace with sphere/capsule/compound proxy when the object shape demands it."};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_swoosh_ribbon_1);

  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups } satisfies ProceduralModelRuntime;
  root.userData.lookDevTargets = {"qualityPriority": "reference-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": false, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "Source is flat vector artwork with zero antialiasing. Albedo is measured exactly; roughness, normal, height and AO are declared look-dev, accepted at 0.647 confidence for paint-red."}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"]}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  root.userData.actionReadiness = {
    note: 'Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets.',
  };
  return root;
}

export function createKURTZBrandMarkLookDevLights(
  mode: 'neutral' | 'grazing' | 'reference' = 'neutral',
): THREE.Group {
  const lights = new THREE.Group();
  lights.name = "KURT Z Brand Mark look-dev lights";
  const hemi = new THREE.HemisphereLight(
    mode === 'reference' ? 0xfff0d6 : 0xf2f4ff,
    0x363b42,
    mode === 'grazing' ? 0.28 : mode === 'reference' ? 0.72 : 0.85,
  );
  lights.add(hemi);
  const key = new THREE.DirectionalLight(
    mode === 'reference' ? 0xffcf8a : 0xfff4e8,
    mode === 'grazing' ? 4.2 : mode === 'reference' ? 2.6 : 2.15,
  );
  if (mode === 'grazing') key.position.set(7.5, 1.1, 4.0);
  else if (mode === 'reference') key.position.set(-4.5, 7.5, 5.0);
  else key.position.set(-4.0, 6.0, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.018;
  key.shadow.radius = 7;
  key.shadow.blurSamples = 24;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -2.6;
  key.shadow.camera.right = 2.6;
  key.shadow.camera.top = 2.6;
  key.shadow.camera.bottom = -2.6;
  key.shadow.camera.updateProjectionMatrix();
  lights.add(key);
  const fill = new THREE.DirectionalLight(0xa8c4ff, mode === 'grazing' ? 0.12 : 0.42);
  fill.position.set(4.0, 3.0, 3.5);
  lights.add(fill);
  const rim = new THREE.DirectionalLight(0xfff1c4, mode === 'grazing' ? 0.28 : 0.85);
  rim.position.set(0.5, 4.5, -6.0);
  lights.add(rim);
  lights.userData.reviewMode = mode;
  lights.userData.lightingFromPhoto = [{"id": "key", "type": "directional", "position": [2.4, 3.0, 2.6], "intensity": 1.6, "color": "#ffffff", "note": "Upper-front-right key raking across the extruded walls so the Z reads as a solid. Exposure 1.0 with ACES filmic tone mapping."}, {"id": "fill", "type": "directional", "position": [-3.0, 0.6, 1.8], "intensity": 0.7, "color": "#9fb4cc", "note": "Cool low fill from the left, tinted toward the slate ribbon, lifting the shadow side without flattening the form."}, {"id": "rim", "type": "directional", "position": [-1.0, 2.2, -3.0], "intensity": 1.1, "color": "#ff6a5e", "note": "Warm red rim from behind separating the mark from the dark stage and catching the pointed tail."}, {"id": "environment", "type": "environment", "preset": "studio HDRI, 0.9 intensity", "note": "Studio environment drives the clearcoat reflections. Contact shadow: a soft ground shadow plus the cavity ambient-occlusion override at the Z inner corners."}];
  lights.userData.lookDevTargets = {"qualityPriority": "reference-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": false, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "Source is flat vector artwork with zero antialiasing. Albedo is measured exactly; roughness, normal, height and AO are declared look-dev, accepted at 0.647 confidence for paint-red."}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"]}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  return lights;
}

// PBR materials (clearcoat/iridescence/transmission/anisotropy) need an environment
// map to visually behave as intended — call this once per renderer and assign the
// result to scene.environment before rendering. No external HDR asset required.
export function createKURTZBrandMarkEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return texture;
}

// Plan 1.3 §3.2 — auto-framing by bounding box. The Divine Eye can only compare a
// render to the reference if the object is FRAMED consistently (an object framed
// differently scores as wrong even when its shape is right). This positions the camera
// deterministically from the object's bounding box so it fills the frame at a stable
// margin, and sets near/far to the object scale. Call after adding the model to the
// scene, and again on resize (after updating camera.aspect).
export function frameKURTZBrandMarkCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: { margin?: number; azimuthDeg?: number; elevationDeg?: number } = {},
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const margin = options.margin ?? 1.15;
  const maxDim = Math.max(size.x, size.y, size.z) * margin;
  const fov = (camera.fov * Math.PI) / 180;
  // distance so the largest object dimension fits vertically in the frame
  const distance = (maxDim / 2) / Math.tan(fov / 2);
  const az = ((options.azimuthDeg ?? 0) * Math.PI) / 180;
  const el = ((options.elevationDeg ?? 0) * Math.PI) / 180;
  const dir = new THREE.Vector3(
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el),
  );
  camera.position.copy(center).addScaledVector(dir, distance);
  camera.near = Math.max(0.01, distance - maxDim);
  camera.far = distance + maxDim * 2;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

// Plan 1.3 §3.2c — PRESENTATION composer (DOF + bloom). CRITICAL (R-POSTFX): this is
// for the showcase/hero render ONLY. The Divine Eye's EVALUATION render MUST use a
// plain renderer with NO composer — bloom blows highlights and DOF blurs edges, which
// would corrupt the deterministic IoU/DCD/edge/blowout signals. Enable dof/bloom ONLY
// when the reference photo actually exhibits them (detect_reference_effects.py authorizes).
export function createKURTZBrandMarkPresentationComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: { dof?: boolean; bloom?: boolean; bloomStrength?: number; dofFocus?: number; dofAperture?: number } = {},
): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (options.dof) {
    composer.addPass(new BokehPass(scene, camera, {
      focus: options.dofFocus ?? 10.0,
      aperture: options.dofAperture ?? 0.0002,
      maxblur: 0.01,
    }));
  }
  if (options.bloom) {
    const size = new THREE.Vector2();
    renderer.getSize(size);
    composer.addPass(new UnrealBloomPass(size, options.bloomStrength ?? 0.4, 0.4, 0.85));
  }
  return composer;
}

export function configureKURTZBrandMarkRenderer(renderer: THREE.WebGLRenderer): void {
  // Load-bearing for view-dependent finishes (anodized / Doppler): without ACES + sRGB
  // the environment reflection reads flat/washed instead of a believable metal response.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
}

export function createKURTZBrandMarkInspectControls(
  camera: THREE.Camera,
  domElement: HTMLElement,
): OrbitControls {
  // View-dependent finishes only read correctly once the user orbits — their color
  // comes from the environment reflection, not albedo, so free rotation matters here.
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.minDistance = 1.0;
  controls.maxDistance = 8.0;
  controls.autoRotate = false;
  return controls;
}
