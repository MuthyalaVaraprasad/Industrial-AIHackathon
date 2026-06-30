import { useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, Play, CheckCircle, FileText, Activity, User, BookOpen, Shield, Folder, ArrowLeft } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/store/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SearchItem {
  name: string;
  category: string;
  path: string;
  desc: string;
}

const GLOBAL_SEARCH_ITEMS: SearchItem[] = [
  { name: 'Pump P-101 failure analysis report.pdf', category: 'Document', path: '/app/documents', desc: 'Failure report on cooling pump seizure incident.' },
  { name: 'Shell Heat Exchanger drawings.dwg', category: 'Document', path: '/app/documents', desc: 'HX-301 design specification blueprints.' },
  { name: 'OSHA separator guidelines.pdf', category: 'Document', path: '/app/documents', desc: 'OSHA regulatory standards for separators.' },
  { name: 'Pump P-101 (Water Cooling)', category: 'Asset', path: '/app/asset-360?tag=P-101', desc: 'Centrifugal circulation pump located in Bay 2.' },
  { name: 'Exchanger HX-301 (Shell & Tube)', category: 'Asset', path: '/app/asset-360?tag=HX-301', desc: 'Thermal transfer exchanger in cooling loop.' },
  { name: 'Valve V-203 (Control Pressure)', category: 'Asset', path: '/app/asset-360?tag=V-203', desc: 'Throttle pressure regulator valve.' },
  { name: 'Marcus Vance (Technician)', category: 'Engineer', path: '/app/collaboration', desc: 'Lead technician on Unit 4 mechanical maintenance.' },
  { name: 'Elena Rostova (Auditor)', category: 'Engineer', path: '/app/collaboration', desc: 'Compliance auditor and process safety specialist.' },
  { name: 'John Engineer (Manager)', category: 'Engineer', path: '/app/collaboration', desc: 'System operator and RAG manager.' },
  { name: 'Monthly Operational Cost Report', category: 'Report', path: '/app/reports', desc: 'Financial review detailing downtime penalties.' },
  { name: 'Downtime Trend analysis summary', category: 'Report', path: '/app/reports', desc: 'KPI line charts on plant failure metrics.' },
  { name: 'Asset relations Neo4j mapping', category: 'Knowledge Graph', path: '/app/knowledge-graph', desc: 'Direct node associations and RAG references.' },
  { name: 'Lubrication calibration checklist', category: 'Maintenance', path: '/app/maintenance', desc: 'Checkup schedule for rotating shafts.' },
  { name: 'Pump seal replacement order', category: 'Maintenance', path: '/app/maintenance', desc: 'Scheduled impeller packing swap tasks.' },
  { name: 'ISO 9001 quality audit certification', category: 'Compliance', path: '/app/compliance', desc: 'Verification log checks for cooling systems.' },
  { name: 'OSHA valve safety regulation ledger', category: 'Compliance', path: '/app/compliance', desc: 'Checklist compliance standard audits.' },
  { name: 'Mechanical seal wear mitigation', category: 'Lessons Learned', path: '/app/lessons', desc: 'Preventive steps for continuous pressure loads.' },
  { name: 'Vibration monitoring interval guidelines', category: 'Lessons Learned', path: '/app/lessons', desc: 'Shaft realignments recommendations.' },
  { name: 'P-101 RCA inquiry log', category: 'Chat History', path: '/app/copilot', desc: 'Copilot conversation logs regarding seal seizures.' },
  { name: 'Shift B valve calibration notes', category: 'Team Notes', path: '/app/collaboration', desc: 'Handovers notes for valve regulation levels.' },
  { name: 'QR Asset Scanner profile check', category: 'QR Scanner', path: '/app/qr-scanner', desc: 'Diagnostic lookup tools via barcodes.' }
];

const categoryIcons: Record<string, React.ReactNode> = {
  Document: <FileText className="w-3.5 h-3.5 text-accent-red" />,
  Asset: <Activity className="w-3.5 h-3.5 text-accent-cyan" />,
  Engineer: <User className="w-3.5 h-3.5 text-primary-400" />,
  Report: <Folder className="w-3.5 h-3.5 text-accent-green" />,
  Compliance: <Shield className="w-3.5 h-3.5 text-accent-green" />,
  'Lessons Learned': <BookOpen className="w-3.5 h-3.5 text-slate-400" />
};

// Subtle 3D floating crystal status core to show on every dashboard
function FloatingCrystalIndicator() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.7;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
    }
  });
  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.8} wireframe />
    </mesh>
  );
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Demo Mode States
  const [demoLoadedAlert, setDemoLoadedAlert] = useState(false);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fuzzy Search Algorithm
  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query) return true;
    const cleanText = text.toLowerCase();
    const cleanQuery = query.toLowerCase();
    let queryIdx = 0;
    for (let i = 0; i < cleanText.length; i++) {
      if (cleanText[i] === cleanQuery[queryIdx]) {
        queryIdx++;
        if (queryIdx === cleanQuery.length) return true;
      }
    }
    return false;
  };

  // Highlights matched query terms in results
  const highlightText = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-primary-500/40 text-white font-bold rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return GLOBAL_SEARCH_ITEMS.filter((item) =>
      fuzzyMatch(item.name, searchQuery) || fuzzyMatch(item.category, searchQuery)
    ).slice(0, 6);
  }, [searchQuery]);

  // One-click Demo Mode loader
  const handleAutoLoadDemo = () => {
    // Write sample assets, docs, records directly into LocalStorage to populate components
    localStorage.setItem('industria_demo_user', JSON.stringify({
      displayName: 'Judge Explorer',
      email: 'judge@industria.ai',
      role: 'admin'
    }));
    localStorage.setItem('industria_role', 'admin');
    
    setDemoLoadedAlert(true);
    setTimeout(() => {
      setDemoLoadedAlert(false);
      // Refresh current page to load all populated states immediately
      navigate('/app/dashboard');
      window.location.reload();
    }, 1800);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 bg-surface-900/80 backdrop-blur-xl border-b border-white/5 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden btn-ghost p-2"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Back Arrow Button - present on each and every dashboard page */}
            <button
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-850 border border-white/5 cursor-pointer select-none"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-accent-cyan" /> Back
            </button>

            {isDemoMode && (
              <Badge variant="warning" className="hidden sm:inline-flex">Demo Mode</Badge>
            )}
          </div>

          {/* Universal Smart Search Bar */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Global smart search (assets, docs, reports, notes...)"
                className="input-field pl-10 text-xs md:text-sm !mb-0 w-full bg-surface-850 border-white/5 focus:border-primary-500/30 transition-all py-2"
              />
            </div>

            {/* Smart Suggestions dropdown overlay with Search Fallback Recommendations */}
            {searchFocused && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-800/95 backdrop-blur-xl border border-white/5 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="px-2 py-1.5 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Search Results</div>
                {filteredSearchResults.length === 0 ? (
                  <div className="p-3 text-left space-y-2">
                    <p className="text-slate-500 font-semibold mb-1">No direct matches found. Try these related modules:</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <button onClick={() => { navigate('/app/copilot'); setSearchFocused(false); setSearchQuery(''); }} className="p-2 rounded bg-surface-850 hover:bg-surface-700 text-slate-300 hover:text-white text-left font-medium cursor-pointer">💬 AI Copilot Chat</button>
                      <button onClick={() => { navigate('/app/digital-twin'); setSearchFocused(false); setSearchQuery(''); }} className="p-2 rounded bg-surface-850 hover:bg-surface-700 text-slate-300 hover:text-white text-left font-medium cursor-pointer">📦 3D Digital Twin</button>
                      <button onClick={() => { navigate('/app/asset-360'); setSearchFocused(false); setSearchQuery(''); }} className="p-2 rounded bg-surface-850 hover:bg-surface-700 text-slate-300 hover:text-white text-left font-medium cursor-pointer">🔍 Asset 360 profile</button>
                      <button onClick={() => { navigate('/app/maintenance'); setSearchFocused(false); setSearchQuery(''); }} className="p-2 rounded bg-surface-850 hover:bg-surface-700 text-slate-300 hover:text-white text-left font-medium cursor-pointer">🔧 Predictive Maintenance</button>
                    </div>
                  </div>
                ) : (
                  filteredSearchResults.map((res: SearchItem, i: number) => (
                    <div
                      key={i}
                      onClick={() => {
                        navigate(res.path);
                        setSearchQuery('');
                        setSearchFocused(false);
                      }}
                      className="p-2 rounded-lg hover:bg-surface-700/50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white truncate">{highlightText(res.name, searchQuery)}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{res.desc}</p>
                      </div>
                      <Badge variant="info" className="text-[9px] ml-2 shrink-0 font-medium capitalize flex items-center gap-1">
                        {categoryIcons[res.category] || <Folder className="w-3 h-3" />}
                        {res.category}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Subtle 3D Floating Crystal Engine Status in Header */}
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/5 bg-surface-850/50 hidden sm:block">
              <Canvas camera={{ position: [0, 0, 1.8] }}>
                <ambientLight intensity={0.7} />
                <FloatingCrystalIndicator />
              </Canvas>
            </div>

            {/* One-click Interactive Demo Loader */}
            <button
              onClick={handleAutoLoadDemo}
              className="px-3 py-1.5 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-300 hover:text-white border border-primary-500/20 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Auto-Load Demo
            </button>

            <Link to="/app/alerts" className="relative btn-ghost p-2" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full" />
            </Link>
          </div>
        </header>

        {/* Demo Mode Alert Banner overlay */}
        {demoLoadedAlert && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl border bg-accent-green/10 border-accent-green/20 text-accent-green flex items-center gap-2 shadow-2xl animate-bounce">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-semibold">Demo Mode Initialized! Loading assets, graph nodes, and RAG chats...</span>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
