"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import {
  Bounds,
  OrbitControls,
  TransformControls,
  useBounds,
} from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Mesh, MeshStandardMaterial, Object3D, Texture } from "three";
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from "three-mesh-bvh";
import type { MeshEditOperation } from "@objectscan/mesh-editor";
function Model({
  url,
  selected,
  onSelect,
  onTransform,
  tool,
  wire,
  fit,
  axis,
}: {
  url: string;
  selected: number | null;
  onSelect: (n: number) => void;
  onTransform: (o: MeshEditOperation) => void;
  tool: "translate" | "rotate" | "scale";
  wire: boolean;
  fit: number;
  axis: string;
}) {
  const gltf = useLoader(GLTFLoader, url),
    bounds = useBounds(),
    fitted = useRef(-1),
    activeScene = useRef<Object3D | null>(null);
  const scene = gltf.scene;
  const { gl } = useThree();
  const dragStart = useRef<{
    position: number[];
    rotation: number[];
    scale: number[];
  } | null>(null);
  useFrame(() => {
    gl.domElement.setAttribute("data-editor-loaded", "true");
    gl.domElement.setAttribute("data-editor-source", url);
  });
  useEffect(() => {
    activeScene.current = scene;
    scene.traverse((o) => {
      if (o instanceof Mesh) {
        if (o.geometry.getAttribute("position").count < 250000) {
          computeBoundsTree.call(o.geometry);
          o.raycast = acceleratedRaycast;
        }
      }
    });
    return () => {
      activeScene.current = null;
      setTimeout(() => {
        if (activeScene.current === scene) return;
        const textures = new Set<Texture>();
        scene.traverse((o) => {
          if (o instanceof Mesh) {
            disposeBoundsTree.call(o.geometry);
            o.geometry.dispose();
            for (const material of Array.isArray(o.material)
              ? o.material
              : [o.material]) {
              for (const value of Object.values(material))
                if (value instanceof Texture) textures.add(value);
              material.dispose();
            }
          }
        });
        for (const texture of textures) {
          texture.dispose();
          if (
            typeof ImageBitmap !== "undefined" &&
            texture.image instanceof ImageBitmap
          )
            texture.image.close();
        }
        useLoader.clear(GLTFLoader, url);
      }, 0);
    };
  }, [scene, url]);
  useEffect(() => {
    scene.traverse((o) => {
      if (o instanceof Mesh)
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          if (m instanceof MeshStandardMaterial) m.wireframe = wire;
    });
  }, [scene, wire]);
  useEffect(() => {
    if (fitted.current !== fit) {
      bounds.refresh(scene).clip().fit();
      fitted.current = fit;
    }
  }, [fit, bounds, scene]);
  const target = useMemo(() => {
    let found: Object3D | undefined;
    scene.traverse((o) => {
      if (o.userData.objectscanNode === selected) found = o;
    });
    return found;
  }, [scene, selected]);
  return (
    <>
      <primitive
        object={scene}
        onPointerDown={(e: {
          stopPropagation: () => void;
          object: Object3D;
        }) => {
          e.stopPropagation();
          let o: Object3D | null = e.object;
          while (o && o.userData.objectscanNode === undefined) o = o.parent;
          if (o && Number.isInteger(o.userData.objectscanNode))
            onSelect(o.userData.objectscanNode);
        }}
      />
      {target && (
        <TransformControls
          object={target}
          mode={tool}
          showX={axis === "all" || axis === "x"}
          showY={axis === "all" || axis === "y"}
          showZ={axis === "all" || axis === "z"}
          onMouseDown={() => {
            dragStart.current = {
              position: target.position.toArray(),
              rotation: [
                target.rotation.x,
                target.rotation.y,
                target.rotation.z,
              ],
              scale: target.scale.toArray(),
            };
          }}
          onMouseUp={() => {
            onTransform({
              type: "transform",
              node: selected!,
              position: target.position.toArray(),
              rotation: [
                target.rotation.x,
                target.rotation.y,
                target.rotation.z,
              ].map((v) => (v * 180) / Math.PI) as [number, number, number],
              scale: target.scale.toArray(),
            });
            if (dragStart.current) {
              target.position.fromArray(dragStart.current.position);
              target.rotation.set(
                ...(dragStart.current.rotation as [number, number, number]),
              );
              target.scale.fromArray(dragStart.current.scale);
            }
          }}
        />
      )}
    </>
  );
}
export function EditorCanvas(props: {
  url: string;
  selected: number | null;
  onSelect: (n: number) => void;
  onTransform: (o: MeshEditOperation) => void;
  tool: "translate" | "rotate" | "scale";
  wire: boolean;
  fit: number;
  axis: string;
  grid: boolean;
  light: number;
  background: string;
}) {
  return (
    <div className="editor-canvas" data-editor-source={props.url}>
      <Canvas
        camera={{ position: [3, 2, 4], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ preserveDrawingBuffer: true }}
      >
        <color attach="background" args={[props.background]} />
        <ambientLight intensity={props.light} />
        <directionalLight position={[3, 6, 4]} intensity={props.light * 2} />
        <directionalLight position={[-3, 2, -3]} intensity={props.light} />
        <Suspense fallback={null}>
          <Bounds margin={1.25} maxDuration={0}>
            <Model {...props} />
          </Bounds>
        </Suspense>
        {props.grid && <gridHelper args={[20, 20, "#454c5a", "#2a303b"]} />}
        <OrbitControls makeDefault enableDamping />
      </Canvas>
    </div>
  );
}
