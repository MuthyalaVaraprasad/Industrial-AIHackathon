import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Terminal, Activity, ArrowRight } from 'lucide-react';
import * as THREE from 'three';

// 3D Spinning Gyroscope / Gimbal assembly representing unified industrial systems
function GyroscopePreloader() {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const midRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = elapsed * 0.5;
      outerRingRef.current.rotation.y = elapsed * 0.2;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.y = -elapsed * 0.6;
      midRingRef.current.rotation.z = elapsed * 0.3;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = elapsed * 0.8;
      innerRingRef.current.rotation.x = -elapsed * 0.4;
    }
    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(elapsed * 2) * 0.05;
    }
  });

  return (
    <group scale={1.2}>
      {/* Outer Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.5, 0.05, 16, 100]} />
        <meshStandardMaterial color="#0891b2" emissive="#06b6d4" emissiveIntensity={0.6} wireframe />
      </mesh>

      {/* Middle Ring */}
      <mesh ref={midRingRef}>
        <torusGeometry args={[1.15, 0.04, 16, 80]} />
        <meshStandardMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={0.5} wireframe />
      </mesh>

      {/* Inner Ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[0.8, 0.03, 16, 60]} />
        <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.5} wireframe />
      </mesh>

      {/* Core Sphere */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.38, 2]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={1.0}
          wireframe
        />
      </mesh>
    </group>
  );
}

const LOG_MESSAGES = [
  'Initializing Core Neural Net...',
  'Connecting Neo4j Node Graph...',
  'Activating Digital Twin Matrices...',
  'Ingesting PDF Drawings Ledger...',
  'Establishing AI Copilot Channels...',
  'Verifying ISO compliance certificates...',
  'Calibrating P-101 vibration feeds...',
  'Ready to initialize.'
];

export function PreloaderScreen({ onEnter }: { onEnter: () => void }) {
  const [clicked, setClicked] = useState(false);
  const [percent, setPercent] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  // Simulated progressive load progress
  useEffect(() => {
    if (clicked) {
      const interval = setInterval(() => {
        setPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              onEnter();
            }, 300);
            return 100;
          }
          return prev + 4;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [clicked, onEnter]);

  useEffect(() => {
    if (clicked) {
      const interval = setInterval(() => {
        setLogIndex((prev) => (prev < LOG_MESSAGES.length - 1 ? prev + 1 : prev));
      }, 250);
      return () => clearInterval(interval);
    }
  }, [clicked]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#070b13] flex flex-col items-center justify-center overflow-hidden">
      {/* 3D Gyroscope Canvas */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#22d3ee" />
          <GyroscopePreloader />
        </Canvas>
      </div>

      {/* Grid background mask overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1322_1px,transparent_1px),linear-gradient(to_bottom,#0c1322_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Gradient glow center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent)] pointer-events-none" />

      <div className="z-10 text-center max-w-md px-6 flex flex-col items-center select-none">
        <div className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-[10px] font-bold text-accent-cyan tracking-wider uppercase">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Operations Engine Online
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-widest bg-gradient-to-r from-primary-400 via-accent-cyan to-accent-green bg-clip-text text-transparent uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.1)]">
            INDUSTRIA AI
          </h1>
          <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto leading-relaxed uppercase tracking-wider">
            Predictive Analytics • 3D digital Twin • compliance Ledger
          </p>
        </div>

        {!clicked ? (
          <button
            onClick={() => setClicked(true)}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gradient-to-r from-primary-600 to-accent-cyan text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-primary-500/20 transition-all hover:scale-105 border border-white/5"
          >
            Access Operations Control
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <div className="w-64 space-y-4">
            <div className="h-10 text-left bg-black/45 border border-white/5 rounded-lg p-2.5 flex items-center gap-2 font-mono text-[9px] text-slate-400 shadow-inner">
              <Terminal className="w-3.5 h-3.5 text-accent-cyan shrink-0 animate-pulse" />
              <span className="truncate">{LOG_MESSAGES[logIndex]}</span>
            </div>

            <div className="space-y-1 text-left">
              <div className="flex justify-between font-mono text-[10px] text-slate-500">
                <span>SYSTEM SYNCHRONIZATION</span>
                <span>{percent}%</span>
              </div>
              <div className="w-full h-1 bg-surface-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-cyan rounded-full transition-all duration-75"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-[10px] text-slate-600 font-mono tracking-widest">
        INDUSTRIA OPERATIONS BRAIN • PHASE 2
      </div>
    </div>
  );
}
