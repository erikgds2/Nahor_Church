'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

function GoldenCross() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <Float speed={1.2} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Vertical bar */}
        <mesh>
          <boxGeometry args={[0.12, 1.4, 0.07]} />
          <meshStandardMaterial
            color="#d4a843"
            metalness={0.9}
            roughness={0.1}
            emissive="#7a5010"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Horizontal bar */}
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.7, 0.12, 0.07]} />
          <meshStandardMaterial
            color="#d4a843"
            metalness={0.9}
            roughness={0.1}
            emissive="#7a5010"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 55 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={2} color="#ffd080" />
      <pointLight position={[-3, -2, 2]} intensity={1} color="#4080d0" />
      <Stars radius={60} depth={15} count={500} factor={2.5} fade speed={0.4} />
      <GoldenCross />
    </Canvas>
  );
}
