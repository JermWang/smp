"use client"

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Box, useVideoTexture, RoundedBox } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

function TVScreen() {
  const texture = useVideoTexture('/IMG_4608.MOV', {
    muted: true,
    loop: true,
    start: true,
  })

  return (
    <mesh>
      <planeGeometry args={[3.2, 2]} />
      <meshStandardMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

function FloatingPanel() {
  const meshRef = useRef<any>()

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2
      meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1
    }
  })

  return (
    <group ref={meshRef}>
      {/* Screen */}
      <Suspense fallback={null}>
        <TVScreen />
      </Suspense>
      {/* Emissive Frame */}
      <RoundedBox args={[3.4, 2.2, 0.2]} radius={0.1}>
        <meshStandardMaterial color="#00ff99" emissive="#00ff99" emissiveIntensity={2} toneMapped={false} />
      </RoundedBox>
    </group>
  )
}

export function Floating3DTV() {
  return (
    <div className="fixed top-[10%] left-[5%] w-[400px] h-[300px] z-40 pointer-events-auto">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <FloatingPanel />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
        <EffectComposer>
          <Bloom luminanceThreshold={1} intensity={2} levels={9} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  )
} 