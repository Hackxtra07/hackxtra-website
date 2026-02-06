"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, useHelper } from "@react-three/drei";
import { useInView } from "framer-motion";
import { useEffect, useState } from "react";
import type * as THREE from "three";

function GeometricShape({
  position,
  scale = 1,
  rotationSpeed = 0.002,
}: {
  position: [number, number, number];
  scale?: number;
  rotationSpeed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed;
      meshRef.current.rotation.y += rotationSpeed * 0.7;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} /> {/* Reduced detail from 1 to 0 */}
        <MeshDistortMaterial
          color="#4a6fa5"
          roughness={0.8}
          metalness={0.2}
          distort={0.2}
          speed={1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

function WireframeSphere({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
      meshRef.current.rotation.z += 0.0005;
    }
  });

  return (
    <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[2, 1]} /> {/* Reduced detail from 2 to 1 */}
        <meshBasicMaterial color="#3a5a7c" wireframe transparent opacity={0.3} />
      </mesh>
    </Float>
  );
}

function NetworkNodes() {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    const points: { position: [number, number, number]; size: number }[] = [];
    // Further reduced from 15 to 8 nodes
    for (let i = 0; i < 8; i++) {
      points.push({
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8,
        ],
        size: Math.random() * 0.05 + 0.02,
      });
    }
    return points;
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[node.size, 4, 4]} /> {/* Reduced segments from 8,8 to 4,4 */}
          <meshBasicMaterial color="#5a7a9a" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function ThreeScene() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef);
  const [isActive, setIsActive] = useState(true);

  // Monitor window focus to pause rendering when tab is inactive
  useEffect(() => {
    const handleFocus = () => setIsActive(true);
    const handleBlur = () => setIsActive(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Performance: Completely unmount if not visible or hidden
  if (!isActive || !isInView) return <div ref={containerRef} className="absolute inset-0 -z-10 bg-[#0d0f14]" />;

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={0.8} // Lower pixel ratio for speed
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          precision: "lowp"
        }}
      >
        <color attach="background" args={["#0d0f14"]} />
        <fog attach="fog" args={["#0d0f14", 8, 25]} />

        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} />

        <GeometricShape position={[-4, 2, -3]} scale={0.8} rotationSpeed={0.001} />
        <GeometricShape position={[4, -1, -2]} scale={0.6} rotationSpeed={0.001} />

        <WireframeSphere position={[3, 1, -5]} scale={1.2} />

        <NetworkNodes />
      </Canvas>
    </div>
  );
}
