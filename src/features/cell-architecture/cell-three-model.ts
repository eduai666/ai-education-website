import {
  Box3,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  SphereGeometry,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  getCellModelDefinition,
  type CellModelDefinition,
  type CellModelId,
} from "./cell-model-catalog";
import type { CellStructureId } from "./types";

/*
 * These detailed meshes are copied unchanged from Cell Architecture Studio
 * commit 1cab982e7a0f96af854a696430c0724707764358. The fixed catalog records
 * their local URLs and transforms. All three GLBs are loaded only after a
 * learner explicitly chooses a 3D specimen.
 *
 * The source meshes are unlabelled. Only the animal-cell course model gets
 * stable teaching hotspots; the neuron and bacterial-wall specimens remain
 * whole-model observations so we do not invent semantic parts that are not in
 * the source geometry.
 */

type OwnGeometry = <T extends BufferGeometry>(geometry: T) => T;
type OwnMaterial = <T extends Material>(material: T) => T;

export type CellStructureRegistration = {
  id: CellStructureId;
  group: Group;
  materials: MeshPhysicalMaterial[];
};

export type DetailedCellModel = {
  root: Group;
  structures: CellStructureRegistration[];
};

const membraneColor = new Color("#65d7c4");
const nucleusColor = new Color("#8d69d4");
const mitochondrionColor = new Color("#ef7947");
const surfaceHighlight = new Color("#fff4d8");
const surfaceShadow = new Color("#3d4a72");

function smoothstep(edge0: number, edge1: number, value: number) {
  const ratio = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return ratio * ratio * (3 - 2 * ratio);
}

function regionStrength(
  point: Vector3,
  center: [number, number, number],
  radius: [number, number, number],
) {
  const distance = Math.hypot(
    (point.x - center[0]) / radius[0],
    (point.y - center[1]) / radius[1],
    (point.z - center[2]) / radius[2],
  );
  return 1 - smoothstep(0.58, 1.06, distance);
}

function applyStudioVertexColors(
  geometry: BufferGeometry,
  definition: CellModelDefinition,
) {
  const position = geometry.getAttribute("position");
  if (!position) {
    throw new Error(`The ${definition.id} model has no position attribute.`);
  }

  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  if (!bounds) {
    throw new Error(`The ${definition.id} model has no measurable bounds.`);
  }

  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const palette = definition.palette.map((value) => new Color(value));
  const point = new Vector3();
  const color = new Color();
  const colors: number[] = [];

  for (let index = 0; index < position.count; index += 1) {
    point.fromBufferAttribute(position, index);

    const nx = (point.x - bounds.min.x) / Math.max(size.x, 0.001);
    const ny = (point.y - bounds.min.y) / Math.max(size.y, 0.001);
    const nz = (point.z - bounds.min.z) / Math.max(size.z, 0.001);
    const flow =
      Math.sin(nx * 11.6 + ny * 4.8) +
      Math.cos(ny * 9.4 + nz * 7.2);
    const paletteIndex =
      Math.abs(
        Math.floor((flow + nx * 3.2 + ny * 2.6) * palette.length),
      ) % palette.length;

    color
      .copy(palette[0])
      .lerp(palette[paletteIndex], 0.5)
      .lerp(surfaceHighlight, Math.max(0, nz - 0.24) * 0.2)
      .lerp(surfaceShadow, Math.max(0, 0.32 - nz) * 0.11);

    if (definition.id === "animal-cell") {
      const edgeDistance = Math.hypot(
        (point.x - center.x) / Math.max(size.x * 0.5, 0.001),
        (point.y - center.y) / Math.max(size.y * 0.5, 0.001),
      );
      color.lerp(
        membraneColor,
        smoothstep(0.78, 1.02, edgeDistance) * 0.58,
      );

      const nucleusStrength = regionStrength(
        point,
        [34.5, 0.7, 30],
        [10.5, 10.5, 9],
      );
      color.lerp(nucleusColor, nucleusStrength * 0.78);

      const mitochondrionStrength = regionStrength(
        point,
        [51, 20, 30],
        [8, 13, 6],
      );
      color.lerp(mitochondrionColor, mitochondrionStrength * 0.9);
    }

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
}

function createSemanticHotspot({
  id,
  centeredPosition,
  radius,
  ownGeometry,
  material,
}: {
  id: Exclude<CellStructureId, "cell-membrane">;
  centeredPosition: [number, number, number];
  radius: number;
  ownGeometry: OwnGeometry;
  material: MeshBasicMaterial;
}) {
  const group = new Group();
  group.name = `teaching-hotspot-${id}`;
  group.position.set(...centeredPosition);

  const proxy = new Mesh(
    ownGeometry(new SphereGeometry(radius, 16, 12)),
    material,
  );
  proxy.name = `teaching-hotspot-proxy-${id}`;
  group.add(proxy);
  return group;
}

function createAbortError() {
  const error = new Error("The detailed model load was aborted.");
  error.name = "AbortError";
  return error;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw createAbortError();
}

function disposeParsedScene(root: Object3D) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();

  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    geometries.add(object.geometry);
    const meshMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of meshMaterials) materials.add(material);
  });

  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}

export async function loadDetailedCellModel(
  modelId: CellModelId,
  ownGeometry: OwnGeometry,
  ownMaterial: OwnMaterial,
  signal?: AbortSignal,
): Promise<DetailedCellModel> {
  const definition = getCellModelDefinition(modelId);
  throwIfAborted(signal);

  const response = await fetch(definition.assetUrl, {
    credentials: "same-origin",
    signal,
  });
  if (!response.ok) {
    throw new Error(
      `Unable to load the ${modelId} GLB (HTTP ${response.status}).`,
    );
  }

  const bytes = await response.arrayBuffer();
  throwIfAborted(signal);

  const gltf = await new GLTFLoader().parseAsync(
    bytes,
    definition.assetBasePath,
  );
  const assetScene = gltf.scene;
  if (signal?.aborted) {
    disposeParsedScene(assetScene);
    throw createAbortError();
  }

  const sourceMaterials = new Set<Material>();
  let meshCount = 0;
  const surfaceMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      side: DoubleSide,
      roughness: 0.38,
      metalness: 0.015,
      clearcoat: 0.42,
      clearcoatRoughness: 0.24,
      emissive: definition.palette[1],
      emissiveIntensity: 0.045 * definition.exposure,
    }),
  );

  assetScene.traverse((object) => {
    if (!(object instanceof Mesh)) return;

    meshCount += 1;
    const originalMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of originalMaterials) sourceMaterials.add(material);

    object.geometry.deleteAttribute("normal");
    object.geometry.computeVertexNormals();
    applyStudioVertexColors(object.geometry, definition);
    ownGeometry(object.geometry);
    object.material = surfaceMaterial;
    object.castShadow = false;
    object.receiveShadow = false;
  });

  for (const material of sourceMaterials) material.dispose();
  if (meshCount === 0) {
    throw new Error(`The ${modelId} GLB contains no renderable mesh.`);
  }
  throwIfAborted(signal);

  assetScene.updateMatrixWorld(true);
  const assetBounds = new Box3().setFromObject(assetScene);
  if (assetBounds.isEmpty()) {
    throw new Error(`The ${modelId} GLB has empty bounds.`);
  }

  const assetCenter = assetBounds.getCenter(new Vector3());
  assetScene.position.sub(assetCenter);
  assetScene.name = `fixed-source-${modelId}`;

  const root = new Group();
  root.name = `detailed-${modelId}`;
  root.position.set(
    definition.transform.position[0],
    definition.transform.position[1],
    definition.transform.position[2],
  );
  root.rotation.set(
    definition.transform.rotation[0],
    definition.transform.rotation[1],
    definition.transform.rotation[2],
  );
  root.scale.setScalar(definition.transform.scale);
  root.add(assetScene);

  if (definition.interaction !== "course-structures") {
    return { root, structures: [] };
  }

  const hotspotMaterial = ownMaterial(
    new MeshBasicMaterial({
      visible: false,
      depthWrite: false,
      colorWrite: false,
      toneMapped: false,
    }),
  );

  const nucleus = createSemanticHotspot({
    id: "nucleus",
    centeredPosition: [
      34.5 - assetCenter.x,
      0.7 - assetCenter.y,
      30 - assetCenter.z,
    ],
    radius: 10,
    ownGeometry,
    material: hotspotMaterial,
  });
  const mitochondrion = createSemanticHotspot({
    id: "mitochondrion",
    centeredPosition: [
      51 - assetCenter.x,
      20 - assetCenter.y,
      30 - assetCenter.z,
    ],
    radius: 9,
    ownGeometry,
    material: hotspotMaterial,
  });
  root.add(nucleus, mitochondrion);

  return {
    root,
    structures: [
      {
        id: "cell-membrane",
        group: root,
        materials: [surfaceMaterial],
      },
      { id: "nucleus", group: nucleus, materials: [] },
      { id: "mitochondrion", group: mitochondrion, materials: [] },
    ],
  };
}
