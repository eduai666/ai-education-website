import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Texture,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  getCellModelDefinition,
  type CellModelId,
} from "./cell-model-catalog";
import {
  disposeCellTexture,
  loadDetailedCellModel,
} from "./cell-three-model";
import {
  CELL_STRUCTURE_IDS,
  type CellSceneConfig,
  type CellSceneStats,
  type CellStructureId,
} from "./types";

type CellSceneHooks = {
  onSelect: (id: CellStructureId | null) => void;
  onContextLost: () => void;
};

export type CellSceneController = {
  select: (id: CellStructureId | null) => void;
  reset: (id: CellStructureId | null) => void;
  getStats: () => CellSceneStats;
  dispose: () => void;
};

export class CellSceneMountError extends Error {
  code:
    | "webgl2-unavailable"
    | "model-load-failed"
    | "scene-mount-failed";

  constructor(
    code:
      | "webgl2-unavailable"
      | "model-load-failed"
      | "scene-mount-failed",
    message: string,
  ) {
    super(message);
    this.name = "CellSceneMountError";
    this.code = code;
  }
}

const membraneId: CellStructureId = "cell-membrane";
const structureIds = new Set<string>(CELL_STRUCTURE_IDS);

function getStructureId(object: Object3D) {
  let current: Object3D | null = object;

  while (current) {
    const id = current.userData.structureId as unknown;
    if (typeof id === "string" && structureIds.has(id)) {
      return id as CellStructureId;
    }
    current = current.parent;
  }

  return null;
}

function blocksMembranePick(object: Object3D) {
  let current: Object3D | null = object;

  while (current) {
    if (current.userData.cellPickBehavior === "block-membrane") return true;
    current = current.parent;
  }

  return false;
}

export async function mountCellScene(
  canvas: HTMLCanvasElement,
  config: CellSceneConfig,
  modelId: CellModelId,
  hooks: CellSceneHooks,
  signal?: AbortSignal,
  useLocalReferenceModels = false,
): Promise<CellSceneController> {
  let disposed = false;
  let contextLost = false;
  let controls: OrbitControls | null = null;
  let renderer: WebGLRenderer | null = null;
  let context: WebGL2RenderingContext | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let mountedScene: Scene | null = null;
  let render = () => {};
  const abortController = new AbortController();
  const ownedGeometries = new Set<BufferGeometry>();
  const ownedMaterials = new Set<Material>();
  const ownedTextures = new Set<Texture>();

  const ownGeometry = <T extends BufferGeometry>(geometry: T) => {
    ownedGeometries.add(geometry);
    return geometry;
  };

  const ownMaterial = <T extends Material>(material: T) => {
    ownedMaterials.add(material);
    return material;
  };

  const ownTexture = <T extends Texture>(texture: T) => {
    ownedTextures.add(texture);
    return texture;
  };

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    if (disposed || contextLost) return;

    contextLost = true;
    if (controls) controls.enabled = false;
    hooks.onContextLost();
  };

  const runCleanupStep = (step: () => void) => {
    try {
      step();
    } catch {
      // Continue releasing the remaining resources after a partial mount failure.
    }
  };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;

    runCleanupStep(() => abortController.abort());
    runCleanupStep(() => resizeObserver?.disconnect());
    resizeObserver = null;
    runCleanupStep(() =>
      canvas.removeEventListener("webglcontextlost", handleContextLost, false),
    );

    if (controls) {
      const activeControls = controls;
      controls = null;
      runCleanupStep(() =>
        activeControls.removeEventListener("change", render),
      );
      runCleanupStep(() => activeControls.dispose());
    }

    if (mountedScene) {
      mountedScene.traverse((object) => {
        const renderable = object as Object3D & {
          geometry?: BufferGeometry;
          material?: Material | Material[];
        };
        if (renderable.geometry) ownedGeometries.add(renderable.geometry);
        if (Array.isArray(renderable.material)) {
          for (const material of renderable.material) {
            ownedMaterials.add(material);
          }
        } else if (renderable.material) {
          ownedMaterials.add(renderable.material);
        }
      });
    }

    for (const geometry of ownedGeometries) {
      runCleanupStep(() => geometry.dispose());
    }
    for (const material of ownedMaterials) {
      runCleanupStep(() => material.dispose());
    }
    for (const texture of ownedTextures) {
      runCleanupStep(() => disposeCellTexture(texture));
    }
    ownedGeometries.clear();
    ownedMaterials.clear();
    ownedTextures.clear();

    if (mountedScene) {
      mountedScene.clear();
      mountedScene = null;
    }

    if (renderer) {
      const activeRenderer = renderer;
      renderer = null;
      runCleanupStep(() => activeRenderer.dispose());
      if (!contextLost) {
        runCleanupStep(() => activeRenderer.forceContextLoss());
      }
    } else if (context && !contextLost) {
      runCleanupStep(() =>
        context?.getExtension("WEBGL_lose_context")?.loseContext(),
      );
    }
    context = null;
  };

  try {
    canvas.addEventListener("webglcontextlost", handleContextLost, false);

    context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      depth: true,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });

    if (!context) {
      throw new CellSceneMountError(
        "webgl2-unavailable",
        "This browser cannot create a WebGL2 context.",
      );
    }

    renderer = new WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    renderer.setPixelRatio(config.initialDpr);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = getCellModelDefinition(modelId).exposure;
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    mountedScene = scene;
    const camera = new PerspectiveCamera(
      config.camera.fov,
      1,
      config.camera.near,
      config.camera.far,
    );
    camera.position.set(...config.camera.position);

    let detailedModel;
    try {
      detailedModel = await loadDetailedCellModel(
        modelId,
        ownGeometry,
        ownMaterial,
        signal,
        useLocalReferenceModels,
      );
      if (signal?.aborted) {
        throw signal.reason ?? new DOMException("Scene load aborted.", "AbortError");
      }
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new CellSceneMountError(
        "model-load-failed",
        error instanceof Error ? error.message : "Unable to load cell model.",
      );
    }
    const modelRoot = detailedModel.root;
    for (const texture of detailedModel.textures) ownTexture(texture);
    scene.add(modelRoot);
    const supportsStructureInteraction =
      getCellModelDefinition(modelId).interaction === "course-structures";

    const structureGroups = new Map<CellStructureId, Group[]>();
    const structureMaterials = new Map<
      CellStructureId,
      MeshStandardMaterial[]
    >();
    const structureBaseScales = new Map<Group, Vector3>();

    const registerStructure = (
      id: CellStructureId,
      group: Group,
      materials: MeshStandardMaterial[],
    ) => {
      group.userData.structureId = id;
      group.traverse((object) => {
        object.userData.structureId = id;
      });
      structureBaseScales.set(group, group.scale.clone());
      structureGroups.set(id, [...(structureGroups.get(id) ?? []), group]);
      structureMaterials.set(id, [
        ...(structureMaterials.get(id) ?? []),
        ...materials,
      ]);
    };

    if (supportsStructureInteraction) {
      for (const structure of detailedModel.structures) {
        registerStructure(structure.id, structure.group, structure.materials);
      }
    }

    const selectionBounds = new Box3();
    const selectionCenter = new Vector3();
    const selectionSize = new Vector3();
    const selectionHalos = supportsStructureInteraction
      ? (() => {
          const geometry = ownGeometry(new TorusGeometry(1, 0.026, 10, 72));
          const material = ownMaterial(
            new MeshBasicMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.92,
              depthTest: false,
              depthWrite: false,
              toneMapped: false,
            }),
          );

          return Array.from({ length: 3 }, () => {
            const halo = new Mesh(geometry, material);
            halo.visible = false;
            halo.renderOrder = 100;
            scene.add(halo);
            return halo;
          });
        })()
      : [];

    const orientSelectionHalos = () => {
      for (const halo of selectionHalos) {
        if (halo.visible) halo.quaternion.copy(camera.quaternion);
      }
    };

    const hemisphereLight = new HemisphereLight(0xf3ffff, 0x153743, 2.1);
    const keyLight = new DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(4, 5, 7);
    const fillLight = new DirectionalLight(0x75cfe4, 1.55);
    fillLight.position.set(-4, -1, 3);
    const rimLight = new DirectionalLight(0xffbd8f, 1.35);
    rimLight.position.set(1, -4, -5);
    scene.add(hemisphereLight, keyLight, fillLight, rimLight);

    render = () => {
      if (disposed || contextLost || !renderer) return;
      orientSelectionHalos();
      renderer.render(scene, camera);
    };

    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.minDistance = config.camera.minDistance;
    controls.maxDistance = config.camera.maxDistance;
    controls.target.set(...config.camera.target);
    controls.update();
    controls.saveState();
    controls.addEventListener("change", render);

    const resize = () => {
      if (disposed || contextLost || !renderer) return;
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };

    const observer = new ResizeObserver(resize);
    resizeObserver = observer;
    observer.observe(canvas);

    const originalEmissive = new Map<MeshStandardMaterial, Color>();
    const originalEmissiveIntensity = new Map<MeshStandardMaterial, number>();
    const selectionGlow = new Color(0xf5fffd);
    for (const materials of structureMaterials.values()) {
      for (const material of materials) {
        if (!originalEmissive.has(material)) {
          originalEmissive.set(material, material.emissive.clone());
          originalEmissiveIntensity.set(material, material.emissiveIntensity);
        }
      }
    }

    const select = (selectedId: CellStructureId | null) => {
      if (disposed || contextLost) return;

      for (const [id, groups] of structureGroups) {
        const isSelected = id === selectedId;
        for (const group of groups) {
          const baseScale = structureBaseScales.get(group);
          if (baseScale) {
            group.scale.copy(baseScale).multiplyScalar(isSelected ? 1.06 : 1);
          }
        }

        for (const material of structureMaterials.get(id) ?? []) {
          const baseEmissive = originalEmissive.get(material);
          if (baseEmissive) material.emissive.copy(baseEmissive);
          material.emissiveIntensity =
            originalEmissiveIntensity.get(material) ?? 0;
          if (isSelected) {
            material.emissive.copy(material.color).lerp(selectionGlow, 0.16);
            material.emissiveIntensity += 0.2;
          }
        }
      }

      for (const halo of selectionHalos) halo.visible = false;
      if (selectedId) {
        const selectedGroups = structureGroups.get(selectedId) ?? [];
        scene.updateMatrixWorld(true);
        selectedGroups.slice(0, selectionHalos.length).forEach((group, index) => {
          selectionBounds.setFromObject(group);
          if (selectionBounds.isEmpty()) return;

          selectionBounds.getCenter(selectionCenter);
          selectionBounds.getSize(selectionSize);
          const radius = Math.max(
            selectionSize.x,
            selectionSize.y,
            selectionSize.z,
          ) * (selectedId === membraneId ? 0.52 : 0.56);
          const halo = selectionHalos[index];
          halo.position.copy(selectionCenter);
          halo.scale.setScalar(Math.max(radius, 0.18));
          halo.visible = true;
        });
      }

      if (selectedId === membraneId) {
        for (const halo of selectionHalos.slice(1)) {
          halo.visible = false;
        }
      }

      render();
    };

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const activePointers = new Set<number>();
    let pointerStart: {
      id: number;
      x: number;
      y: number;
      primaryButton: boolean;
    } | null = null;
    let hadMultiplePointers = false;
    let movedBeyondPickThreshold = false;

    const handlePointerDown = (event: PointerEvent) => {
      activePointers.add(event.pointerId);
      if (activePointers.size > 1) hadMultiplePointers = true;

      if (activePointers.size === 1) {
        movedBeyondPickThreshold = false;
        pointerStart = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          primaryButton: event.button === 0,
        };
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const start = pointerStart;
      if (
        start?.id === event.pointerId &&
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6
      ) {
        movedBeyondPickThreshold = true;
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const start = pointerStart;
      const moved = start
        ? Math.hypot(event.clientX - start.x, event.clientY - start.y)
        : Number.POSITIVE_INFINITY;
      const shouldPick =
        start?.id === event.pointerId &&
        start.primaryButton &&
        !hadMultiplePointers &&
        !movedBeyondPickThreshold &&
        moved <= 6;

      activePointers.delete(event.pointerId);

      if (
        supportsStructureInteraction &&
        shouldPick &&
        !disposed &&
        !contextLost
      ) {
        const bounds = canvas.getBoundingClientRect();
        if (bounds.width > 0 && bounds.height > 0) {
          pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
          pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);

          const intersections = raycaster.intersectObject(modelRoot, true);
          let membraneWasHit = false;
          let selectedId: CellStructureId | null = null;

          for (const intersection of intersections) {
            const id = getStructureId(intersection.object);

            if (id && id !== membraneId) {
              selectedId = id;
              break;
            }
            if (blocksMembranePick(intersection.object)) {
              membraneWasHit = false;
              break;
            }
            if (id === membraneId) membraneWasHit = true;
          }

          if (!selectedId && membraneWasHit) selectedId = membraneId;

          hooks.onSelect(selectedId);
        }
      }

      if (activePointers.size === 0) {
        pointerStart = null;
        hadMultiplePointers = false;
        movedBeyondPickThreshold = false;
      }
    };

    const handlePointerCancel = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      if (activePointers.size === 0) {
        pointerStart = null;
        hadMultiplePointers = false;
        movedBeyondPickThreshold = false;
      }
    };

    if (supportsStructureInteraction) {
      canvas.addEventListener("pointerdown", handlePointerDown, {
        signal: abortController.signal,
      });
      canvas.addEventListener("pointermove", handlePointerMove, {
        signal: abortController.signal,
      });
      canvas.addEventListener("pointerup", handlePointerUp, {
        signal: abortController.signal,
      });
      canvas.addEventListener("pointercancel", handlePointerCancel, {
        signal: abortController.signal,
      });
    }

    resize();

    return {
      select,
      reset(id) {
        if (disposed || contextLost || !controls) return;
        controls.reset();
        select(id);
        render();
      },
      getStats() {
        render();
        return {
          drawCalls: renderer?.info.render.calls ?? 0,
          triangles: renderer?.info.render.triangles ?? 0,
          source: detailedModel.renderSource,
        };
      },
      dispose() {
        cleanup();
      },
    };
  } catch (error) {
    cleanup();
    if (error instanceof CellSceneMountError) throw error;

    throw new CellSceneMountError(
      "scene-mount-failed",
      error instanceof Error ? error.message : "Unable to mount scene.",
    );
  }
}
