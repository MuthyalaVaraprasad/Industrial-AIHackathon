import { useState, useEffect } from 'react';
import { Terminal, Activity, ArrowRight } from 'lucide-react';

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
      {/* Dynamic Animated CSS Orbital Ring Background (replacing 3D Three.js canvas) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Outer Ring */}
        <div className="absolute w-[360px] h-[360px] md:w-[500px] md:h-[500px] rounded-full border border-dashed border-cyan-500/20 animate-spin-clockwise" />
        
        {/* Middle Ring */}
        <div className="absolute w-[260px] h-[260px] md:w-[380px] md:h-[380px] rounded-full border border-dotted border-indigo-500/25 animate-spin-counterclockwise" />
        
        {/* Inner Ring */}
        <div className="absolute w-[180px] h-[180px] md:w-[260px] md:h-[260px] rounded-full border border-dashed border-emerald-500/20 animate-spin-clockwise" />

        {/* Core Glowing Orb */}
        <div className="absolute w-24 h-24 rounded-full bg-cyan-500/10 blur-xl animate-pulse-glow" />
        <div className="absolute w-8 h-8 rounded-full border border-cyan-400/40 animate-pulse" />

        {/* Ambient floating blur particles */}
        <div className="absolute top-[20%] left-[15%] w-72 h-72 rounded-full bg-indigo-500/5 blur-[80px] animate-float-slow" />
        <div className="absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full bg-cyan-500/5 blur-[90px] animate-float-medium" />
      </div>

      {/* Grid background mask overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1322_1px,transparent_1px),linear-gradient(to_bottom,#0c1322_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Gradient glow center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent)] pointer-events-none" />

      <div className="z-10 text-center max-w-md px-6 flex flex-col items-center select-none animate-float-slow">
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
              <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 via-accent-cyan to-accent-green transition-all duration-75 rounded-full shadow-[0_0_8px_#22d3ee]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
