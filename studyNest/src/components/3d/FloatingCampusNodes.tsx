"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";

function Node({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.55;
    ref.current.rotation.x += delta * 0.2;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} position={position}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} roughness={0.4} />
      </mesh>
    </Float>
  );
}

function Scene() {
  const nodes = useMemo(
    () => [
      { position: [-1.9, 0.8, 0], color: "#38bdf8" },
      { position: [-0.7, -0.4, 0.2], color: "#06b6d4" },
      { position: [0.5, 0.7, -0.1], color: "#22d3ee" },
      { position: [1.6, -0.6, 0.1], color: "#8b5cf6" },
      { position: [0.1, 1.6, -0.3], color: "#0ea5e9" },
    ] as const,
    []
  );

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 4]} intensity={1.05} color="#dbeafe" />
      {nodes.map((item, index) => (
        <Node key={index} position={[...item.position]} color={item.color} />
      ))}
      <mesh position={[0, -1.45, 0]}>
        <cylinderGeometry args={[3.4, 3.7, 0.25, 64]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} />
      </mesh>
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.65} />
    </>
  );
}

export default function FloatingCampusNodes() {
  return (
    <div className="h-[320px] w-full">
      <Canvas camera={{ position: [0, 0.25, 5], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
