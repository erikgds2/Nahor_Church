'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

function LightOrbs() {
  const orbs: { pos: [number, number, number]; color: string; scale: number; speed: number }[] = [
    { pos: [0, 0, 0],      color: '#d4a843', scale: 0.18, speed: 1.0 },
    { pos: [-1.2, 0.6, -0.5], color: '#4a90d9', scale: 0.10, speed: 1.4 },
    { pos: [1.3, -0.5, -0.3], color: '#ffffff', scale: 0.07, speed: 0.8 },
    { pos: [0.6, 0.9, 0.2],  color: '#d4a843', scale: 0.06, speed: 1.2 },
    { pos: [-0.8, -0.8, 0.1],color: '#a0c8f0', scale: 0.08, speed: 1.6 },
  ];

  return (
    <>
      {orbs.map((orb, i) => (
        <Float key={i} speed={orb.speed} floatIntensity={0.6} rotationIntensity={0}>
          <mesh position={orb.pos}>
            <sphereGeometry args={[orb.scale, 16, 16]} />
            <meshStandardMaterial
              color={orb.color}
              emissive={orb.color}
              emissiveIntensity={1.2}
              metalness={0.1}
              roughness={0.2}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 55 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color="#ffd080" />
      <pointLight position={[-3, -2, 2]} intensity={0.8} color="#4080d0" />
      <Stars radius={60} depth={15} count={500} factor={2.5} fade speed={0.4} />
      <LightOrbs />
    </Canvas>
  );
}
