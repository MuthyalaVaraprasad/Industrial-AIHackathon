import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TwinAsset } from '@/types';

const STATUS_COLORS = {
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
};

// Render custom industrial geometries based on asset tag/type
function AssetMesh({ asset, selected }: { asset: TwinAsset; selected: boolean }) {
  const color = STATUS_COLORS[asset.status];
  const name = asset.name.toLowerCase();

  if (name.includes('pump') || asset.tag.startsWith('P')) {
    // Pump: Cylinder motor base + Sphere fluid head + side drive shaft cylinder
    return (
      <group>
        {/* Selection wireframe indicator */}
        {selected && (
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.5, 1.3, 1.5]} />
            <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.4} />
          </mesh>
        )}
        {/* Base Cylinder */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Motor casing Cylinder */}
        <mesh position={[0, 0.3, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.6, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        {/* Head Sphere */}
        <mesh position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
    );
  } else if (name.includes('valve') || asset.tag.startsWith('V')) {
    // Valve: Sphere center + small horizontal pipe cylinders + Torus for handle wheel
    return (
      <group>
        {/* Selection wireframe indicator */}
        {selected && (
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.4, 1.3, 1.4]} />
            <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.4} />
          </mesh>
        )}
        {/* Center Sphere */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Flow pipes */}
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.9, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>
        {/* Handle wheel Torus */}
        <mesh position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.06, 8, 20]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>
    );
  } else {
    // Heat Exchanger (HX) or Default: Horizontal Cylinder shell + support legs
    return (
      <group>
        {/* Selection wireframe indicator */}
        {selected && (
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.8, 1.4, 1.4]} />
            <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.4} />
          </mesh>
        )}
        {/* Main Shell Cylinder */}
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 1.2, 20]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Supporting legs */}
        <mesh position={[-0.3, 0.1, 0]}>
          <boxGeometry args={[0.15, 0.2, 0.8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0.3, 0.1, 0]}>
          <boxGeometry args={[0.15, 0.2, 0.8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
    );
  }
}

function AssetBox({
  asset,
  selected,
  onSelect,
}: {
  asset: TwinAsset;
  selected: boolean;
  onSelect: (asset: TwinAsset) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Critical/Warning assets pulse or float up and down to catch operator attention
  useFrame((state) => {
    if (groupRef.current && asset.status !== 'healthy') {
      groupRef.current.position.y = asset.status === 'critical'
        ? Math.sin(state.clock.elapsedTime * 3.5) * 0.08
        : Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[asset.x, 0, asset.z]}>
      {/* Click target wrapper */}
      <mesh position={[0, 0.5, 0]} visible={false} onClick={(e) => { e.stopPropagation(); onSelect(asset); }}>
        <boxGeometry args={[1.5, 1.2, 1.5]} />
      </mesh>

      <AssetMesh asset={asset} selected={selected} />

      <Text position={[0, 1.15, 0]} fontSize={0.2} color="white" anchorX="center" font="/fonts/Inter-SemiBold.ttf">
        {asset.tag}
      </Text>
    </group>
  );
}

function PlantFloor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
      <gridHelper args={[20, 20, '#1e293b', '#0f172a']} />
    </>
  );
}

interface PlantTwinProps {
  assets: TwinAsset[];
  selectedAsset: TwinAsset | null;
  onSelectAsset: (asset: TwinAsset) => void;
}

function Scene({ assets, selectedAsset, onSelectAsset }: PlantTwinProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={0.9} castShadow />
      <pointLight position={[-8, 6, -8]} intensity={0.4} color="#6366f1" />
      <PlantFloor />
      {assets.map((asset) => (
        <AssetBox
          key={asset.id}
          asset={asset}
          selected={selectedAsset?.id === asset.id}
          onSelect={onSelectAsset}
        />
      ))}
      <OrbitControls enablePan maxPolarAngle={Math.PI / 2.1} minDistance={4} maxDistance={18} />
    </>
  );
}

export function PlantTwin({ assets, selectedAsset, onSelectAsset }: PlantTwinProps) {
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-surface-900 border border-white/5 shadow-2xl relative">
      <Canvas camera={{ position: [8, 8, 8], fov: 45 }} shadows>
        <Suspense fallback={null}>
          <Scene assets={assets} selectedAsset={selectedAsset} onSelectAsset={onSelectAsset} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function PlantTwinLegend() {
  return (
    <div className="flex gap-4 text-xs font-semibold">
      {(['healthy', 'warning', 'critical'] as const).map((status) => (
        <div key={status} className="flex items-center gap-2 bg-surface-850 px-2.5 py-1.5 rounded-lg border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
          <span className="text-slate-400 capitalize">{status}</span>
        </div>
      ))}
    </div>
  );
}
