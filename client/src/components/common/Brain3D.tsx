import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function BrainCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.8, 64, 64]}>
      <MeshDistortMaterial
        color="#6366f1"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

function Particles() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 2.5 + Math.sin(i) * 0.5;
    return { x: Math.cos(angle) * radius, y: Math.sin(i * 0.5) * 0.8, z: Math.sin(angle) * radius };
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <Sphere key={i} args={[0.05, 8, 8]} position={[p.x, p.y, p.z]}>
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </group>
  );
}

export function Brain3D({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#22d3ee" />
        <Suspense fallback={null}>
          <BrainCore />
          <Particles />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
