import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { CatmullRomCurve3, type Group, MathUtils, Vector2, Vector3 } from 'three';

import type { HeroMotion } from '../model/types';

const flightPath = new CatmullRomCurve3([
  new Vector3(1.35, 0.05, 0),
  new Vector3(-0.65, -0.15, 0.35),
  new Vector3(1.2, -0.25, 0.15),
  new Vector3(3.9, 2.2, -1.5),
]);
const plateProfile = [
  [0, -0.42],
  [0.82, -0.42],
  [1.02, -0.27],
  [1.02, 0.27],
  [0.82, 0.42],
  [0, 0.42],
].map(([radius, height]) => new Vector2(radius, height));

function Dumbbell({ motion }: { motion: React.RefObject<HeroMotion> }) {
  const group = useRef<Group>(null);
  const nodes = useRef<Group>(null);
  const position = useRef(new Vector3());
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const currentMotion = motion.current;
    currentMotion.invalidate = invalidate;
    invalidate();
    return () => {
      currentMotion.invalidate = () => undefined;
    };
  }, [invalidate, motion]);
  useFrame(() => {
    if (!group.current) return;
    const { progress, reveal, floatTime } = motion.current;
    flightPath.getPoint(progress, position.current);
    group.current.position.copy(position.current);
    group.current.position.x += (1 - reveal) * 5;
    group.current.position.y += (1 - reveal) * 1.2 + Math.sin(floatTime * 0.85) * 0.075;
    group.current.rotation.set(
      0.35 + Math.sin(progress * Math.PI) * 0.55 + Math.sin(floatTime * 0.5) * 0.035,
      -0.55 + progress * 2.45 + (1 - reveal) * 0.8,
      -0.4 + progress * 0.95 + Math.sin(floatTime * 0.65) * 0.025,
    );
    group.current.scale.setScalar(MathUtils.lerp(0.65, 1.05, reveal) * (1 - progress * 0.12));
    if (nodes.current) nodes.current.visible = progress > 0.36;
  });
  return (
    <group ref={group}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.145, 0.145, 2.65, 40]} />
        <meshStandardMaterial color="#454b46" metalness={0.85} roughness={0.34} />
      </mesh>
      {Array.from({ length: 33 }, (_, i) => (
        <mesh key={i} position={[(i - 16) * 0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.147, 0.006, 6, 32]} />
          <meshStandardMaterial color="#788278" metalness={0.65} roughness={0.5} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.47, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <latheGeometry args={[plateProfile, 12]} />
            <meshStandardMaterial color="#202823" metalness={0.48} roughness={0.5} flatShading />
          </mesh>
          {[-0.424, 0.424].map((offset) => (
            <mesh key={offset} position={[0, offset, 0]}>
              <cylinderGeometry args={[0.77, 0.77, 0.014, 48]} />
              <meshStandardMaterial color="#343e36" metalness={0.6} roughness={0.42} />
            </mesh>
          ))}
          <mesh position={[0, -side * 0.445, 0]}>
            <cylinderGeometry args={[0.29, 0.29, 0.022, 48]} />
            <meshStandardMaterial color="#454b46" metalness={0.7} roughness={0.46} />
          </mesh>
        </group>
      ))}
      <group ref={nodes} visible={false}>
        {[-1.88, 1.88].flatMap((x) =>
          [0, 1, 2, 3, 4, 5].map((point) => (
            <mesh
              key={x + '-' + point}
              position={[
                x,
                Math.cos((point * Math.PI) / 3) * 0.97,
                Math.sin((point * Math.PI) / 3) * 0.97,
              ]}
            >
              <sphereGeometry args={[0.034, 12, 12]} />
              <meshBasicMaterial color="#A7F0DD" />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}

export function DumbbellFallback() {
  return (
    <div className="fit-dumbbell-fallback" aria-label="Minh họa tạ đôi">
      <span />
      <i />
      <span />
    </div>
  );
}

function supportsWebGL() {
  try {
    const probe = document.createElement('canvas');
    const context = probe.getContext('webgl2');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function DumbbellScene({ motion }: { motion: React.RefObject<HeroMotion> }) {
  const [available, setAvailable] = useState(supportsWebGL);
  const removeContextListener = useRef<(() => void) | null>(null);
  useEffect(() => () => removeContextListener.current?.(), []);
  if (!available) return <DumbbellFallback />;
  return (
    <Canvas
      frameloop="demand"
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        const onContextLost = () => setAvailable(false);
        canvas.addEventListener('webglcontextlost', onContextLost, { once: true });
        removeContextListener.current?.();
        removeContextListener.current = () =>
          canvas.removeEventListener('webglcontextlost', onContextLost);
      }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7.5], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      fallback={<DumbbellFallback />}
      aria-label="Tạ đôi 3D minh họa, xoay khi cuộn trang"
    >
      <ambientLight intensity={1.4} />
      <hemisphereLight args={['#FFFFFF', '#345C32', 2]} />
      <directionalLight position={[3, 5, 5]} intensity={4.5} />
      <directionalLight position={[-4, 1, -2]} color="#A7F0DD" intensity={5} />
      <directionalLight position={[0, -2, 3]} intensity={0.8} />
      <Dumbbell motion={motion} />
    </Canvas>
  );
}
