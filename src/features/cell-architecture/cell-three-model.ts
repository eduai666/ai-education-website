import {
  Box3,
  Color,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  SphereGeometry,
  Texture,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  getCellModelDefinition,
  type CellModelDefinition,
  type CellModelId,
} from "./cell-model-catalog";
import type { CellStructureId } from "./types";

/*
 * The three detailed GLB meshes are copied unchanged from Cell Architecture
 * Studio commit 1cab982e7a0f96af854a696430c0724707764358. The fixed catalog
 * records their local URLs and transforms. By default, plant and muscle cells
 * are built from project-authored deterministic geometry. A development-only
 * flag may instead read an ignored local reference GLB; every 3D scene is
 * still created only after an explicit learner action.
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
  textures: Texture[];
  renderSource: "glb" | "procedural";
};

type GlbModelSource = {
  assetUrl: string;
  assetBasePath: string;
  materialMode?: "studio" | "native";
  transform?: CellModelDefinition["transform"];
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
  const textures = new Set<Texture>();

  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    geometries.add(object.geometry);
    const meshMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of meshMaterials) {
      materials.add(material);
      for (const texture of getMaterialTextures(material)) textures.add(texture);
    }
  });

  for (const geometry of geometries) geometry.dispose();
  for (const texture of textures) disposeCellTexture(texture);
  for (const material of materials) material.dispose();
}

function getMaterialTextures(material: Material) {
  return Object.values(material).filter(
    (value): value is Texture => value instanceof Texture,
  );
}

type CloseableImage = {
  close: () => void;
};

function isCloseableImage(value: unknown): value is CloseableImage {
  return (
    typeof value === "object" &&
    value !== null &&
    "close" in value &&
    typeof (value as { close?: unknown }).close === "function"
  );
}

export function disposeCellTexture(texture: Texture) {
  texture.dispose();
  if (!isCloseableImage(texture.image)) return;

  try {
    texture.image.close();
  } catch {
    // A previously closed ImageBitmap is already safe to release.
  }
}

function createModelRoot(
  definition: CellModelDefinition,
  content: Object3D,
  transform: CellModelDefinition["transform"] = definition.transform,
) {
  const root = new Group();
  root.name = `detailed-${definition.id}`;
  root.position.set(
    transform.position[0],
    transform.position[1],
    transform.position[2],
  );
  root.rotation.set(
    transform.rotation[0],
    transform.rotation[1],
    transform.rotation[2],
  );
  root.scale.setScalar(transform.scale);
  root.add(content);
  return root;
}

function createPlantCellModel(
  definition: CellModelDefinition,
  ownGeometry: OwnGeometry,
  ownMaterial: OwnMaterial,
): DetailedCellModel {
  /*
   * Geometry proportions and placements follow the MIT-licensed PlantModel in
   * Cell Architecture Studio commit 1cab982e7a0f96af854a696430c0724707764358.
   * It is rewritten with native Three.js primitives for this demand-rendered
   * runtime; no upstream GLB, PNG, texture, or R3F dependency is copied.
   */
  const content = new Group();
  content.name = "project-authored-plant-cell";

  const wallMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: definition.palette[0],
      transparent: true,
      opacity: 0.28,
      roughness: 0.5,
      clearcoat: 0.18,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  const membraneMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: definition.palette[1],
      transparent: true,
      opacity: 0.2,
      roughness: 0.34,
      clearcoat: 0.32,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  const vacuoleMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: definition.palette[2],
      transparent: true,
      opacity: 0.6,
      roughness: 0.22,
      clearcoat: 0.3,
    }),
  );
  const nucleusMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: definition.palette[3],
      roughness: 0.36,
      clearcoat: 0.28,
    }),
  );
  const chloroplastMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: "#4c9b52",
      roughness: 0.42,
      clearcoat: 0.16,
    }),
  );
  const chloroplastRingMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: "#9ed36a",
      roughness: 0.42,
    }),
  );
  const mitochondrionMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: definition.palette[4],
      roughness: 0.4,
      clearcoat: 0.22,
    }),
  );

  const wall = new Mesh(
    ownGeometry(new RoundedBoxGeometry(4.7, 2.7, 0.42, 6, 0.18)),
    wallMaterial,
  );
  wall.name = "plant-cell-wall";

  const membrane = new Mesh(
    ownGeometry(new RoundedBoxGeometry(4.18, 2.24, 0.24, 6, 0.12)),
    membraneMaterial,
  );
  membrane.name = "plant-cell-membrane";
  membrane.position.set(0.02, 0.02, 0.08);

  const vacuole = new Mesh(
    ownGeometry(new SphereGeometry(0.78, 32, 22)),
    vacuoleMaterial,
  );
  vacuole.name = "plant-central-vacuole";
  vacuole.position.set(-0.45, -0.12, 0.32);
  vacuole.scale.set(1.05, 0.78, 0.28);

  const nucleus = new Mesh(
    ownGeometry(new SphereGeometry(0.52, 28, 20)),
    nucleusMaterial,
  );
  nucleus.name = "plant-nucleus";
  nucleus.position.set(0.92, 0.42, 0.45);
  nucleus.scale.set(1, 1, 0.73);

  const chloroplastGeometry = ownGeometry(new SphereGeometry(1, 24, 16));
  const chloroplastRingGeometry = ownGeometry(
    new TorusGeometry(0.22, 0.012, 8, 32),
  );
  const chloroplastPlacements = [
    [-1.65, 0.48, 0.28, 0],
    [1.68, -0.38, 0.3, 0.7],
    [-1.52, -0.62, 0.22, 1.4],
  ] as const;
  for (const [index, [x, y, z, rotation]] of chloroplastPlacements.entries()) {
    const chloroplast = new Mesh(chloroplastGeometry, chloroplastMaterial);
    chloroplast.name = "plant-chloroplast";
    chloroplast.position.set(x, y, z);
    chloroplast.rotation.z = rotation;
    chloroplast.scale.set(0.35, 0.18, 0.12);

    content.add(chloroplast);
    if (index < 2) {
      const ring = new Mesh(
        chloroplastRingGeometry,
        chloroplastRingMaterial,
      );
      ring.name = "plant-chloroplast-inner-ring";
      ring.position.set(x, y, z + 0.13);
      ring.rotation.set(Math.PI / 2, 0, rotation);
      ring.scale.set(1, 0.82, 1);
      content.add(ring);
    }
  }

  const mitochondrionGeometry = ownGeometry(
    new SphereGeometry(0.22, 18, 12),
  );
  const mitochondrionPlacements = [[0.28, -0.72, 0.42]] as const;
  for (const [x, y, z] of mitochondrionPlacements) {
    const mitochondrion = new Mesh(
      mitochondrionGeometry,
      mitochondrionMaterial,
    );
    mitochondrion.name = "plant-mitochondrion";
    mitochondrion.position.set(x, y, z);
    mitochondrion.rotation.set(0.3, 0.2, 1.35);
    mitochondrion.scale.set(1.35, 0.72, 0.72);
    content.add(mitochondrion);
  }

  content.add(wall, membrane, vacuole, nucleus);
  return {
    root: createModelRoot(definition, content),
    structures: [],
    textures: [],
    renderSource: "procedural",
  };
}

function createMuscleCellModel(
  definition: CellModelDefinition,
  ownGeometry: OwnGeometry,
  ownMaterial: OwnMaterial,
): DetailedCellModel {
  const content = new Group();
  content.name = "project-authored-skeletal-muscle-cell";

  const fiberMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: definition.palette[0],
      transparent: true,
      opacity: 0.44,
      roughness: 0.42,
      clearcoat: 0.24,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  const myofibrilMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: definition.palette[2],
      roughness: 0.38,
      clearcoat: 0.18,
    }),
  );
  const striationMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: definition.palette[1],
      roughness: 0.46,
    }),
  );
  const nucleusMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: definition.palette[3],
      roughness: 0.34,
      clearcoat: 0.24,
    }),
  );
  const mitochondrionMaterial = ownMaterial(
    new MeshPhysicalMaterial({
      color: definition.palette[4],
      roughness: 0.4,
    }),
  );

  const fiber = new Mesh(
    ownGeometry(new CylinderGeometry(0.72, 0.72, 4.05, 36, 1, false)),
    fiberMaterial,
  );
  fiber.name = "skeletal-muscle-fiber";
  fiber.rotation.z = Math.PI / 2;
  content.add(fiber);

  const myofibrilGeometry = ownGeometry(
    new CylinderGeometry(0.09, 0.09, 3.72, 16, 1, false),
  );
  const myofibrilPlacements = [
    [0, -0.28, 0.24],
    [0, 0.28, 0.2],
    [0, 0, -0.32],
  ] as const;
  for (const [x, y, z] of myofibrilPlacements) {
    const myofibril = new Mesh(myofibrilGeometry, myofibrilMaterial);
    myofibril.name = "muscle-myofibril";
    myofibril.position.set(x, y, z);
    myofibril.rotation.z = Math.PI / 2;
    content.add(myofibril);
  }

  const striationGeometry = ownGeometry(new TorusGeometry(0.73, 0.026, 8, 36));
  for (const x of [-1.3, -0.44, 0.44, 1.3]) {
    const striation = new Mesh(striationGeometry, striationMaterial);
    striation.name = "muscle-striation";
    striation.position.x = x;
    striation.rotation.y = Math.PI / 2;
    content.add(striation);
  }

  const nucleusGeometry = ownGeometry(new SphereGeometry(0.18, 18, 12));
  const nucleusPlacements = [
    [-1.15, 0.56, 0.28, -0.22],
    [1.18, -0.56, -0.24, 0.2],
  ] as const;
  for (const [x, y, z, rotation] of nucleusPlacements) {
    const nucleus = new Mesh(nucleusGeometry, nucleusMaterial);
    nucleus.name = "muscle-peripheral-nucleus";
    nucleus.position.set(x, y, z);
    nucleus.rotation.z = rotation;
    nucleus.scale.set(1.75, 0.62, 0.72);
    content.add(nucleus);
  }

  const mitochondrionGeometry = ownGeometry(
    new SphereGeometry(0.14, 16, 10),
  );
  for (const [x, y, z] of [
    [0.76, 0.42, 0.46],
  ] as const) {
    const mitochondrion = new Mesh(
      mitochondrionGeometry,
      mitochondrionMaterial,
    );
    mitochondrion.name = "muscle-mitochondrion";
    mitochondrion.position.set(x, y, z);
    mitochondrion.scale.set(1.6, 0.68, 0.72);
    content.add(mitochondrion);
  }

  return {
    root: createModelRoot(definition, content),
    structures: [],
    textures: [],
    renderSource: "procedural",
  };
}

function createProceduralCellModel(
  definition: CellModelDefinition,
  ownGeometry: OwnGeometry,
  ownMaterial: OwnMaterial,
) {
  const proceduralSource =
    definition.source.kind === "procedural" ? definition.source : null;
  if (!proceduralSource) {
    throw new Error(`The ${definition.id} model has no procedural fallback.`);
  }

  return proceduralSource.builder === "plant-cell"
    ? createPlantCellModel(definition, ownGeometry, ownMaterial)
    : createMuscleCellModel(definition, ownGeometry, ownMaterial);
}

function getGlbSource(
  definition: CellModelDefinition,
  useLocalReferenceModels: boolean,
): GlbModelSource | null {
  if (definition.source.kind === "glb") return definition.source;
  return useLocalReferenceModels
    ? (definition.source.localReference ?? null)
    : null;
}

async function loadGlbCellModel(
  definition: CellModelDefinition,
  source: GlbModelSource,
  ownGeometry: OwnGeometry,
  ownMaterial: OwnMaterial,
  signal?: AbortSignal,
): Promise<DetailedCellModel> {
  const response = await fetch(source.assetUrl, {
    credentials: "same-origin",
    signal,
  });
  if (!response.ok) {
    throw new Error(
      `Unable to load the ${definition.id} GLB (HTTP ${response.status}).`,
    );
  }

  const bytes = await response.arrayBuffer();
  throwIfAborted(signal);

  const gltf = await new GLTFLoader().parseAsync(bytes, source.assetBasePath);
  const assetScene = gltf.scene;
  if (signal?.aborted) {
    disposeParsedScene(assetScene);
    throw createAbortError();
  }

  try {
    const usesNativeMaterials = source.materialMode === "native";
    const sourceMaterials = new Set<Material>();
    const sourceTextures = new Set<Texture>();
    let meshCount = 0;
    const surfaceMaterial = usesNativeMaterials
      ? null
      : ownMaterial(
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

      if (usesNativeMaterials) {
        for (const material of originalMaterials) {
          ownMaterial(material);
          for (const texture of getMaterialTextures(material)) {
            sourceTextures.add(texture);
          }
        }
        ownGeometry(object.geometry);
        object.castShadow = false;
        object.receiveShadow = false;
        return;
      }

      for (const material of originalMaterials) {
        sourceMaterials.add(material);
        for (const texture of getMaterialTextures(material)) {
          sourceTextures.add(texture);
        }
      }

      object.geometry.deleteAttribute("normal");
      object.geometry.computeVertexNormals();
      applyStudioVertexColors(object.geometry, definition);
      ownGeometry(object.geometry);
      object.material = surfaceMaterial!;
      object.castShadow = false;
      object.receiveShadow = false;
    });

    if (!usesNativeMaterials) {
      for (const texture of sourceTextures) texture.dispose();
      for (const material of sourceMaterials) material.dispose();
    }
    if (meshCount === 0) {
      throw new Error(`The ${definition.id} GLB contains no renderable mesh.`);
    }
    throwIfAborted(signal);

    assetScene.updateMatrixWorld(true);
    const assetBounds = new Box3().setFromObject(assetScene);
    if (assetBounds.isEmpty()) {
      throw new Error(`The ${definition.id} GLB has empty bounds.`);
    }

    const assetCenter = assetBounds.getCenter(new Vector3());
    assetScene.position.sub(assetCenter);
    assetScene.name = `fixed-source-${definition.id}`;

    const root = createModelRoot(definition, assetScene, source.transform);
    const textures = usesNativeMaterials ? [...sourceTextures] : [];

    if (definition.interaction !== "course-structures") {
      return { root, structures: [], textures, renderSource: "glb" };
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
      textures,
      renderSource: "glb",
      structures: [
        {
          id: "cell-membrane",
          group: root,
          materials: surfaceMaterial ? [surfaceMaterial] : [],
        },
        { id: "nucleus", group: nucleus, materials: [] },
        { id: "mitochondrion", group: mitochondrion, materials: [] },
      ],
    };
  } catch (error) {
    disposeParsedScene(assetScene);
    throw error;
  }
}

export async function loadDetailedCellModel(
  modelId: CellModelId,
  ownGeometry: OwnGeometry,
  ownMaterial: OwnMaterial,
  signal?: AbortSignal,
  useLocalReferenceModels = false,
): Promise<DetailedCellModel> {
  const definition = getCellModelDefinition(modelId);
  throwIfAborted(signal);

  const glbSource = getGlbSource(definition, useLocalReferenceModels);
  if (!glbSource) {
    return createProceduralCellModel(definition, ownGeometry, ownMaterial);
  }

  try {
    return await loadGlbCellModel(
      definition,
      glbSource,
      ownGeometry,
      ownMaterial,
      signal,
    );
  } catch (error) {
    if (signal?.aborted || definition.source.kind !== "procedural") {
      throw error;
    }
    return createProceduralCellModel(definition, ownGeometry, ownMaterial);
  }
}
