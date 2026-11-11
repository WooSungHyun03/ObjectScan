"use client";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Bounds,
  Center,
  OrbitControls,
  useGLTF,
  Grid,
  ContactShadows,
} from "@react-three/drei";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  Component,
} from "react";
import * as THREE from "three";
import {
  Box,
  RotateCcw,
  Grid2X2,
  Sun,
  Camera,
  Expand,
  Layers,
  Eye,
} from "lucide-react";
import { Button } from "./ui/button";
const DEMO = "/demo/shoe.glb";
class ViewerBoundary extends Component<
  { children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="viewer-fallback">
        <Box size={28} />
        <p>3D 파일을 불러오지 못했습니다.</p>
        <small>
          WebGL 지원과 파일 접근 권한을 확인한 후 페이지를 새로고침하세요.
        </small>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Mesh({
  url,
  wire,
  texture,
  split,
}: {
  url: string;
  wire: boolean;
  texture: boolean;
  split: boolean;
}) {
  const gltf = useGLTF(url);
  const { gl } = useThree();
  useEffect(() => {
    // Expose readiness only after the decoded model has committed and rendered.
    let frame = 0;
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        gl.domElement.dataset.modelLoaded = "true";
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      delete gl.domElement.dataset.modelLoaded;
    };
  }, [gltf, gl]);
  const model = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry = o.geometry.clone();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const mapped = mats.map((m) => {
          const material = m.clone();
          if (material instanceof THREE.MeshStandardMaterial) {
            material.wireframe = wire;
            if (!texture) material.map = null;
            if (split)
              material.clippingPlanes = [
                new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
              ];
          }
          return material;
        });
        o.material = Array.isArray(o.material) ? mapped : mapped[0];
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return root;
  }, [gltf, wire, texture, split]);
  const wireModel = useMemo(() => {
    if (!split) return null;
    const root = gltf.scene.clone(true);
    root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry = o.geometry.clone();
        o.material = new THREE.MeshBasicMaterial({
          color: "#89eac2",
          wireframe: true,
          transparent: true,
          opacity: 0.65,
          clippingPlanes: [new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)],
        });
      }
    });
    return root;
  }, [gltf, split]);
  useEffect(
    () => () => {
      for (const root of [model, wireModel])
        root?.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose();
            (Array.isArray(o.material) ? o.material : [o.material]).forEach(
              (m) => m.dispose(),
            );
          }
        });
    },
    [model, wireModel],
  );
  const size = new THREE.Box3()
    .setFromObject(gltf.scene)
    .getSize(new THREE.Vector3());
  const modelScale = 2.8 / Math.max(size.x, size.y, size.z, 0.001);
  return (
    <Bounds fit clip observe margin={1.35}>
      <Center position={[0, 0.08, 0]}>
        <group rotation={[0, 0.2, 0]} scale={modelScale}>
          <primitive object={model} />
          {wireModel && <primitive object={wireModel} />}
        </group>
      </Center>
    </Bounds>
  );
}
function CameraTools({
  captureRef,
}: {
  captureRef: React.MutableRefObject<(() => void) | null>;
}) {
  const { gl } = useThree();
  useEffect(() => {
    captureRef.current = () => {
      const a = document.createElement("a");
      a.download = "objectscan-preview.png";
      a.href = gl.domElement.toDataURL("image/png");
      a.click();
    };
    return () => {
      captureRef.current = null;
    };
  }, [gl, captureRef]);
  return null;
}
export function ModelViewer({
  url = DEMO,
  hero = false,
  showControls = true,
  demo = true,
}: {
  url?: string;
  hero?: boolean;
  showControls?: boolean;
  demo?: boolean;
}) {
  const [wire, setWire] = useState(false),
    [texture, setTexture] = useState(true),
    [grid, setGrid] = useState(true),
    [light, setLight] = useState(3),
    [background, setBackground] = useState(false),
    [reset, setReset] = useState(0);
  const capture = useRef<(() => void) | null>(null),
    container = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={container}
      className={`model-viewer ${hero ? "hero-viewer" : ""} ${background ? "viewer-light" : ""}`}
    >
      <div className="viewer-label">
        <span className="live-square" />
        {demo ? "공개 3D 예제 · 생성 결과 아님" : "검증된 3D 에셋"}
      </div>
      <ViewerBoundary key={url}>
        <Suspense
          fallback={
            <div className="viewer-fallback">
              <span className="spinner" />
              <p>3D 파일 불러오는 중</p>
            </div>
          }
        >
          <Canvas
            key={reset}
            dpr={[1, 1.5]}
            shadows
            camera={{ position: [3, 1.8, -4], fov: 36 }}
            gl={{
              antialias: true,
              alpha: true,
              localClippingEnabled: true,
              preserveDrawingBuffer: true,
            }}
          >
            <ambientLight intensity={1.6} />
            <hemisphereLight args={["#e8f5ff", "#32413b", 1.7]} />
            <directionalLight
              position={[3, 5, 4]}
              intensity={light}
              color="#ffffff"
              castShadow
            />
            <directionalLight
              position={[-4, 2, -3]}
              intensity={2.4}
              color="#a6bcE6"
            />
            <Mesh url={url} wire={wire} texture={texture} split={hero} />
            {grid && (
              <Grid
                position={[0, -0.55, 0]}
                args={[12, 12]}
                cellSize={0.4}
                cellThickness={0.45}
                cellColor="#42565c"
                sectionSize={2}
                sectionThickness={0.7}
                sectionColor="#548579"
                fadeDistance={12}
                infiniteGrid
              />
            )}
            <ContactShadows
              position={[0, -0.55, 0]}
              opacity={0.4}
              scale={12}
              blur={2.8}
              far={6}
            />
            <OrbitControls
              makeDefault
              enablePan={false}
              enableDamping
              minDistance={0.3}
              maxDistance={15}
            />
            <CameraTools captureRef={capture} />
          </Canvas>
        </Suspense>
      </ViewerBoundary>
      {hero && <div className="scan-ring" aria-hidden="true" />}
      {showControls && (
        <div className="viewer-toolbar">
          <Button
            size="icon"
            variant="ghost"
            aria-label="시점 초기화"
            onClick={() => setReset(reset + 1)}
          >
            <RotateCcw size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="와이어프레임"
            aria-pressed={wire}
            onClick={() => setWire(!wire)}
          >
            <Grid2X2 size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="텍스처"
            aria-pressed={texture}
            onClick={() => setTexture(!texture)}
          >
            <Layers size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="그리드"
            aria-pressed={grid}
            onClick={() => setGrid(!grid)}
          >
            <Box size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="배경 전환"
            onClick={() => setBackground(!background)}
          >
            <Eye size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="미리보기 스크린샷"
            onClick={() => capture.current?.()}
          >
            <Camera size={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="전체 화면"
            onClick={() => void container.current?.requestFullscreen()}
          >
            <Expand size={16} />
          </Button>
          <label className="viewer-light-control">
            <Sun size={15} />
            <input
              aria-label="조명 밝기"
              type="range"
              min=".5"
              max="6"
              step=".1"
              value={light}
              onChange={(e) => setLight(+e.target.value)}
            />
          </label>
        </div>
      )}
      <span className="viewer-hint">드래그하여 회전 · 스크롤하여 확대</span>
    </div>
  );
}
