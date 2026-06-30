import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageTransition } from '@/components/ui/PageTransition';
import { Brain, AlertCircle, Sparkles } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Background animation for the sign-in dashboard (floating connection nodes)
function LoginBackgroundNodes() {
  const pointsRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    const positions = [];
    const count = 300;
    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        color="#06b6d4"
        size={0.05}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function LoginPage() {
  const { loginWithGoogle, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [successSplash, setSuccessSplash] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app/dashboard';

  const handleGoogleSignIn = async () => {
    clearError();
    try {
      // Direct sign in using mock or firebase (role defaults to engineer or admin)
      await loginWithGoogle('admin');
      
      // Trigger special login success animation before redirect
      setSuccessSplash(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);
    } catch {
      // error handled by context
    }
  };

  return (
    <PageTransition>
      {/* 3D background wrapper specifically for the login container */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <LoginBackgroundNodes />
        </Canvas>
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto">
        {/* Glow card with hover transitions */}
        <Card 
          padding="lg" 
          className="border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)] bg-surface-900/90 backdrop-blur-2xl transition-all duration-500 hover:border-cyan-500/40 relative overflow-hidden"
        >
          {/* Success Splash overlay */}
          {successSplash && (
            <div className="absolute inset-0 bg-[#070b13] flex flex-col items-center justify-center text-center p-6 z-50 animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-accent-green/20 border border-accent-green/30 flex items-center justify-center mb-4 animate-bounce">
                <Sparkles className="w-6 h-6 text-accent-green" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Access Granted</h3>
              <p className="text-[10px] text-slate-500 mt-1">Connecting security channel...</p>
            </div>
          )}

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">INDUSTRIA AI</h2>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Operations Brain Portal</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs" role="alert">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Simple premium Sign In with Google only */}
          <div className="space-y-4 pt-2">
            <Button 
              variant="primary" 
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-cyan hover:from-primary-500 hover:to-cyan-400 text-white font-bold rounded-xl border border-white/5 cursor-pointer flex items-center justify-center gap-2" 
              onClick={handleGoogleSignIn} 
              loading={loading}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" className="opacity-80"/>
                <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" className="opacity-70"/>
                <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" className="opacity-90"/>
              </svg>
              Sign In with Google
            </Button>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
