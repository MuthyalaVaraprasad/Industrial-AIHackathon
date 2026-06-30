import { useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, Play, CheckCircle, FileText, Activity, User, BookOpen, Shield, Folder, ArrowLeft, Loader2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/store/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { QuickActionsFAB } from '@/components/common/QuickActionsFAB';

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

interface NotificationItem {
  id: string;
  type: 'ocr' | 'ai_summary' | 'compliance' | 'maintenance' | 'report' | 'risk' | 'comment';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n-1', type: 'ocr', title: 'OCR Processing Complete', desc: 'Pump P-101 Failure Report manual successfully ingested.', time: '5m ago', read: false },
  { id: 'n-2', type: 'ai_summary', title: 'AI Executive Summary Ready', desc: 'Summary and key performance gaps computed for Unit 4.', time: '10m ago', read: false },
  { id: 'n-3', type: 'compliance', title: 'OSHA compliance alert', desc: 'Lockout/Tagout log missing Q2 audits.', time: '1h ago', read: false },
  { id: 'n-4', type: 'maintenance', title: 'Critical Vibration Risk', desc: 'C-204 vibration levels exceed safety threshold.', time: '2h ago', read: false },
  { id: 'n-5', type: 'report', title: 'Report compiled successfully', desc: 'Monthly Operational cost summary PDF is ready.', time: '1d ago', read: true }
];

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Recent Searches History
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('industria_recent_searches');
      return stored ? JSON.parse(stored) : ['Pump P-101', 'OSHA separator guidelines', 'HX-301'];
    } catch {
      return ['Pump P-101', 'OSHA separator guidelines', 'HX-301'];
    }
  });

  // Notification States
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem('industria_notifications');
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsContainerRef = useRef<HTMLDivElement>(null);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Keyboard shortcut Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulated search debounce loading state
  useEffect(() => {
    if (searchQuery) {
      setSearchLoading(true);
      const timer = setTimeout(() => setSearchLoading(false), 250);
      return () => clearTimeout(timer);
    } else {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  // Demo Mode States
  const [demoLoadedAlert, setDemoLoadedAlert] = useState(false);

  // Close search suggestions & notifications on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notificationsContainerRef.current && !notificationsContainerRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
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
    return GLOBAL_SEARCH_ITEMS.filter((item) => {
      const matchesSearch = fuzzyMatch(item.name, searchQuery) || fuzzyMatch(item.category, searchQuery) || fuzzyMatch(item.desc, searchQuery);
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).slice(0, 6);
  }, [searchQuery, selectedCategory]);

  const handleSelectSearchItem = (path: string, name: string) => {
    // Save to history
    const nextHistory = [name, ...recentSearches.filter(q => q !== name)].slice(0, 5);
    setRecentSearches(nextHistory);
    localStorage.setItem('industria_recent_searches', JSON.stringify(nextHistory));
    
    navigate(path);
    setSearchQuery('');
    setSearchFocused(false);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('industria_notifications', JSON.stringify(updated));
  };

  const handleToggleRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n);
    setNotifications(updated);
    localStorage.setItem('industria_notifications', JSON.stringify(updated));
  };

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
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Global smart search (assets, docs, reports, notes...) [Ctrl+K]"
                className="input-field pl-10 pr-10 text-xs md:text-sm !mb-0 w-full bg-surface-850 border-white/5 focus:border-primary-500/30 transition-all py-2"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-3.5 h-3.5 text-primary-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Smart Suggestions dropdown overlay with Search Fallback Recommendations */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-800/95 backdrop-blur-xl border border-white/5 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
                {/* Category filters */}
                <div className="flex gap-1 overflow-x-auto pb-1.5 border-b border-white/5 scrollbar-none shrink-0">
                  {['All', 'Document', 'Asset', 'Report', 'Compliance', 'Lessons Learned'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(cat);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap cursor-pointer transition-colors ${
                        selectedCategory === cat
                          ? 'bg-primary-500 text-white font-bold'
                          : 'bg-surface-850 hover:bg-surface-700 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {!searchQuery.trim() ? (
                  <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Recent Searches</div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term, i) => (
                        <button
                          key={term + i}
                          type="button"
                          onClick={() => {
                            setSearchQuery(term);
                            searchInputRef.current?.focus();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-surface-850 hover:bg-surface-700 text-slate-300 hover:text-white cursor-pointer font-medium"
                        >
                          🔍 {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : filteredSearchResults.length === 0 ? (
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
                      onClick={() => handleSelectSearchItem(res.path, res.name)}
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

            {/* Interactive Notification Center bell panel dropdown */}
            <div ref={notificationsContainerRef} className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative btn-ghost p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Notifications Panel"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-accent-red text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-surface-900">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-800/95 backdrop-blur-xl border border-white/5 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-2">
                  <div className="flex justify-between items-center px-2 py-1.5 border-b border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Notification Center</span>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[9px] text-primary-400 hover:text-primary-300 cursor-pointer font-medium"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleToggleRead(notif.id)}
                          className={`p-2 rounded-lg transition-colors flex items-start gap-2.5 cursor-pointer ${
                            notif.read ? 'hover:bg-surface-750 opacity-60' : 'bg-primary-500/5 hover:bg-primary-500/10 border-l-2 border-primary-500'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <p className={`font-semibold text-white truncate ${notif.read ? '' : 'text-primary-300'}`}>{notif.title}</p>
                              <span className="text-[9px] text-slate-500 shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{notif.desc}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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

      {/* Floating Action Button for Quick Actions */}
      <QuickActionsFAB onOpenSearch={() => { setSearchFocused(true); searchInputRef.current?.focus(); }} />
    </div>
  );
}
