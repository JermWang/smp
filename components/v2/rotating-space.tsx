"use client";

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useVideoTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Points } from 'three';

function VideoOrb() {
  const videoTexture = useVideoTexture('/IMG_4608.MOV', {
    loop: true,
    muted: true,
  });
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 1;
      meshRef.current.position.x = Math.cos(clock.getElapsedTime() * 0.3) * 4;
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]} scale={1.5}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial map={videoTexture} toneMapped={false} />
    </mesh>
  );
}

function Starfield() {
  const starsRef = useRef<Points>(null!);

  useFrame((state, delta) => {
    // Slowly rotate the starfield
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <Stars
      ref={starsRef}
      radius={80}
      depth={50}
      count={10000}
      factor={5}
      saturation={0}
      fade
      speed={1}
    />
  );
}

export function RotatingSpace() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 3, 5]} intensity={1.5} />
        <Suspense fallback={null}>
          <VideoOrb />
        </Suspense>
        <Starfield />
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.9}
            height={300}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
} 