import {
  AmbientLight,
  Box3,
  Box3Helper,
  CapsuleGeometry,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { CellSceneConfig, CellSceneStats, CellStructureId } from "./types";

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
  code: "webgl2-unavailable" | "scene-mount-failed";

  constructor(
    code: "webgl2-unavailable" | "scene-mount-failed",
    message: string,
  ) {
    super(message);
    this.name = "CellSceneMountError";
    this.code = code;
  }
}

const membraneId: CellStructureId = "cell-membrane";
const nucleusId: CellStructureId = "nucleus";
const mitochondrionId: CellStructureId = "mitochondrion";

function getStructureId(object: Object3D) {
  let current: Object3D | null = object;

  while (current) {
    const id = current.userData.structureId as CellStructureId | undefined;
    if (id) return id;
    current = current.parent;
  }

  return null;
}

export function mountCellScene(
  canvas: HTMLCanvasElement,
  config: CellSceneConfig,
  hooks: CellSceneHooks,
): CellSceneController {
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

  const ownGeometry = <T extends BufferGeometry>(geometry: T) => {
    ownedGeometries.add(geometry);
    return geometry;
  };

  const ownMaterial = <T extends Material>(material: T) => {
    ownedMaterials.add(material);
    return material;
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
    ownedGeometries.clear();
    ownedMaterials.clear();

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

    const modelRoot = new Group();
    modelRoot.rotation.set(...config.modelRotation);
    scene.add(modelRoot);

    const structureGroups = new Map<CellStructureId, Group[]>();
    const structureMaterials = new Map<CellStructureId, MeshPhongMaterial[]>();
    const structureBaseScales = new Map<Group, Vector3>();

    const registerStructure = (
      id: CellStructureId,
      group: Group,
      materials: MeshPhongMaterial[],
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

    const cytoplasmMaterial = ownMaterial(
      new MeshPhongMaterial({
        color: 0xb8e8df,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        shininess: 30,
      }),
    );
    const cytoplasm = new Mesh(
      ownGeometry(new SphereGeometry(2.14, 32, 20)),
      cytoplasmMaterial,
    );
    cytoplasm.scale.set(1.16, 0.88, 1);
    modelRoot.add(cytoplasm);

    const membraneGroup = new Group();
    const membraneMaterial = ownMaterial(
      new MeshPhongMaterial({
        color: 0x65d7c4,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        shininess: 80,
      }),
    );
    const membrane = new Mesh(
      ownGeometry(new SphereGeometry(2.26, 36, 24)),
      membraneMaterial,
    );
    membrane.scale.set(1.16, 0.88, 1);
    membraneGroup.add(membrane);
    modelRoot.add(membraneGroup);
    registerStructure(membraneId, membraneGroup, [membraneMaterial]);

    const nucleusGroup = new Group();
    nucleusGroup.position.set(-0.48, 0.28, 0.12);
    const nucleusMaterial = ownMaterial(
      new MeshPhongMaterial({
        color: 0x9a7be4,
        shininess: 55,
      }),
    );
    const nucleolusMaterial = ownMaterial(
      new MeshPhongMaterial({
        color: 0x5f409b,
        shininess: 45,
      }),
    );
    const nucleus = new Mesh(
      ownGeometry(new SphereGeometry(0.72, 28, 20)),
      nucleusMaterial,
    );
    const nucleolus = new Mesh(
      ownGeometry(new SphereGeometry(0.2, 18, 12)),
      nucleolusMaterial,
    );
    nucleolus.position.set(-0.2, 0.16, 0.54);
    nucleusGroup.add(nucleus, nucleolus);
    modelRoot.add(nucleusGroup);
    registerStructure(nucleusId, nucleusGroup, [
      nucleusMaterial,
      nucleolusMaterial,
    ]);

    const mitochondrionBodyGeometry = ownGeometry(
      new CapsuleGeometry(0.3, 0.82, 6, 12),
    );
    const cristaGeometry = ownGeometry(new TorusGeometry(0.17, 0.025, 6, 16));
    const mitochondrionMaterial = ownMaterial(
      new MeshPhongMaterial({
        color: 0xf58e5e,
        shininess: 60,
      }),
    );
    const cristaMaterial = ownMaterial(
      new MeshPhongMaterial({
        color: 0xffe5c9,
        shininess: 30,
      }),
    );

    const createMitochondrion = (
      position: [number, number, number],
      rotation: [number, number, number],
      scale: number,
    ) => {
      const group = new Group();
      group.position.set(...position);
      group.rotation.set(...rotation);
      group.scale.setScalar(scale);

      const body = new Mesh(mitochondrionBodyGeometry, mitochondrionMaterial);
      group.add(body);

      for (const y of [-0.27, 0, 0.27]) {
        const crista = new Mesh(cristaGeometry, cristaMaterial);
        crista.position.y = y;
        crista.rotation.x = Math.PI / 2;
        group.add(crista);
      }

      modelRoot.add(group);
      registerStructure(mitochondrionId, group, [
        mitochondrionMaterial,
        cristaMaterial,
      ]);
    };

    createMitochondrion([0.88, -0.5, 0.5], [0.18, 0.25, 1.08], 1);
    createMitochondrion([1.02, 0.68, -0.38], [-0.08, -0.45, 0.86], 0.72);

    const selectionBounds = new Box3();
    const selectionHelper = new Box3Helper(
      selectionBounds,
      new Color(0xfdfcf5),
    );
    selectionHelper.visible = false;
    scene.add(selectionHelper);

    const ambientLight = new AmbientLight(0xffffff, 1.7);
    const keyLight = new DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4, 5, 7);
    const fillLight = new DirectionalLight(0x8ddfd2, 1.3);
    fillLight.position.set(-4, -1, 3);
    scene.add(ambientLight, keyLight, fillLight);

    render = () => {
      if (disposed || contextLost || !renderer) return;
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

    const originalEmissive = new Map<MeshPhongMaterial, Color>();
    for (const materials of structureMaterials.values()) {
      for (const material of materials) {
        if (!originalEmissive.has(material)) {
          originalEmissive.set(material, material.emissive.clone());
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
          material.emissiveIntensity = isSelected ? 0.55 : 1;
          if (isSelected) material.emissive.set(0x253c43);
        }
      }

      if (selectedId) {
        const selectedGroups = structureGroups.get(selectedId) ?? [];
        selectionBounds.makeEmpty();
        scene.updateMatrixWorld(true);
        for (const group of selectedGroups) {
          selectionBounds.expandByObject(group);
        }
        selectionHelper.visible = !selectionBounds.isEmpty();
      } else {
        selectionHelper.visible = false;
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

      if (shouldPick && !disposed && !contextLost) {
        const bounds = canvas.getBoundingClientRect();
        if (bounds.width > 0 && bounds.height > 0) {
          pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
          pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);

          const intersections = raycaster.intersectObject(modelRoot, true);
          const hitIds = intersections
            .map((intersection) => getStructureId(intersection.object))
            .filter((id): id is CellStructureId => Boolean(id));
          const selectedId =
            hitIds.find((id) => id !== membraneId) ??
            hitIds.find((id) => id === membraneId) ??
            null;

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
