import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { QrCode, Camera, FileText, Wrench, Sparkles, AlertTriangle, ShieldCheck, Clock, Volume2, VolumeX, ListRestart } from 'lucide-react';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils';
import type { QRAsset } from '@/types';

export default function QRScannerPage() {
  const [tag, setTag] = useState('');
  const [asset, setAsset] = useState<QRAsset | null>(null);
  const [scanning, setScanning] = useState(false);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [laserPos, setLaserPos] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanHistory, setScanHistory] = useState<string[]>(['P-101', 'V-203']);

  const navigate = useNavigate();

  const scanMutation = useMutation({
    mutationFn: modulesApi.getQRAsset,
    onSuccess: (data) => {
      setAsset(data);
      if (soundEnabled) playBeep();
      if (data && !scanHistory.includes(data.tag)) {
        setScanHistory(prev => [data.tag, ...prev].slice(0, 5));
      }
    },
  });

  // Synthesize sound beep using browser Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A5 note beep
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 120);
    } catch {
      // Audio block fallback
    }
  };

  // Animate laser scanner line
  useEffect(() => {
    if (scanning) {
      const interval = setInterval(() => {
        setLaserPos((prev) => (prev >= 85 ? 15 : prev + 4));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [scanning]);

  const requestPermission = () => {
    setPermission('granted');
  };

  const simulateScan = () => {
    if (permission !== 'granted') {
      setPermission('granted');
    }
    setScanning(true);
    setAsset(null);
    setTimeout(() => {
      setScanning(false);
      scanMutation.mutate('P-101');
      setTag('P-101');
    }, 2000);
  };

  const handleLookup = () => {
    if (tag.trim()) {
      setAsset(null);
      scanMutation.mutate(tag.trim().toUpperCase());
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="page-title">QR Asset Scanner Portal</h1>
          <p className="page-subtitle">Scan equipment barcodes or QR nodes to instantly retrieve live diagnostic telemetry</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scanner Control Column */}
          <div className="md:col-span-1 space-y-4">
            <Card className="flex flex-col items-center justify-center text-center p-5 bg-surface-900 border border-white/5">
              <div className="flex justify-between items-center w-full mb-3 pb-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scanner Options</span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                  title="Toggle scan audio confirmation beep"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-primary-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
                </button>
              </div>

              {/* Permission status badge */}
              <div className="mb-4">
                {permission === 'granted' ? (
                  <Badge variant="success" className="flex items-center gap-1 text-[9px]"><ShieldCheck className="w-3.5 h-3.5" /> Camera Active</Badge>
                ) : permission === 'denied' ? (
                  <Badge variant="danger" className="flex items-center gap-1 text-[9px]"><AlertTriangle className="w-3.5 h-3.5" /> Camera Denied</Badge>
                ) : (
                  <Badge variant="warning" className="flex items-center gap-1 text-[9px]"><Clock className="w-3.5 h-3.5" /> Camera Prompt</Badge>
                )}
              </div>

              {/* Interactive Viewfinder */}
              <div className={cn(
                'w-40 h-40 rounded-2xl border-2 flex flex-col items-center justify-center mb-5 relative overflow-hidden transition-all duration-300',
                scanning ? 'border-primary-500 bg-primary-950/20' : 'border-white/10 bg-surface-850'
              )}>
                {scanning ? (
                  <>
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary-400" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary-400" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-primary-400" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-primary-400" />
                    
                    <div
                      className="absolute left-3 right-3 h-0.5 bg-accent-red shadow-[0_0_8px_#ef4444] transition-all duration-75"
                      style={{ top: `${laserPos}%` }}
                    />
                    <Camera className="w-7 h-7 text-primary-400 animate-pulse" />
                    <span className="text-[9px] text-primary-300 font-semibold tracking-widest mt-2 uppercase">Scanning...</span>
                  </>
                ) : (
                  <QrCode className="w-12 h-12 text-slate-600" />
                )}
              </div>

              {permission !== 'granted' && (
                <Button variant="secondary" size="sm" onClick={requestPermission} className="w-full mb-2 text-xs">
                  Allow Camera Permission
                </Button>
              )}

              <Button onClick={simulateScan} loading={scanning || scanMutation.isPending} className="w-full mb-4 text-xs bg-gradient-to-r from-primary-600 to-accent-cyan">
                <Camera className="w-4 h-4 mr-1" /> Start Laser Scan
              </Button>

              <div className="w-full relative my-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center text-[9px]"><span className="px-2 bg-surface-900 text-slate-500 uppercase font-semibold">Or Query Tag</span></div>
              </div>

              <div className="flex gap-2 w-full">
                <Input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Tag (e.g. P-101)"
                  className="!mb-0 text-xs flex-1 bg-surface-850 border-white/5"
                />
                <Button variant="secondary" onClick={handleLookup} disabled={!tag.trim()} className="px-3 text-xs">
                  Lookup
                </Button>
              </div>
              {scanMutation.isError && <p className="text-accent-red text-[10px] mt-2">Asset tag not found in operations ledger</p>}
            </Card>

            {/* Scan History */}
            <Card className="p-4 bg-surface-900 border border-white/5 space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><ListRestart className="w-3.5 h-3.5" /> Recent Scans</h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {scanHistory.map((item) => (
                  <button
                    key={item}
                    onClick={() => { setTag(item); scanMutation.mutate(item); }}
                    className="px-2.5 py-1 rounded bg-surface-800 hover:bg-surface-700 text-[10px] text-slate-300 font-semibold cursor-pointer transition-colors"
                  >
                    🔍 {item}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Scanner Details View */}
          <div className="md:col-span-2">
            {asset ? (
              <Card padding="lg" className="space-y-5 bg-surface-900 border border-white/5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-white">{asset.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{asset.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate('/app/asset-360')}
                      className="px-2.5 py-1.5 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-300 border border-primary-500/20 text-[10px] font-bold cursor-pointer transition-all"
                    >
                      🔍 360 Profile
                    </button>
                    <Badge variant={asset.healthScore > 80 ? 'success' : asset.healthScore > 60 ? 'warning' : 'danger'}>
                      {asset.healthScore}% Health
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-surface-850 rounded-xl border border-white/5">
                    <p className="text-slate-500 font-semibold mb-0.5">Asset Code Tag</p>
                    <p className="text-white font-mono font-bold">{asset.tag}</p>
                  </div>
                  <div className="p-3 bg-surface-850 rounded-xl border border-white/5">
                    <p className="text-slate-500 font-semibold mb-0.5">Last Inspection Date</p>
                    <p className="text-white font-semibold">{asset.lastMaintenance}</p>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-accent-amber flex items-center gap-1"><Sparkles className="w-4 h-4" /> AI Diagnostics Insights</h3>
                  <div className="p-3 bg-accent-amber/5 border border-accent-amber/10 rounded-xl space-y-1.5 text-xs text-slate-300">
                    {asset.insights.map((insight, i) => (
                      <p key={i} className="leading-relaxed font-sans">• {insight}</p>
                    ))}
                  </div>
                </div>

                {/* Linked Drawings and Manuals */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5"><FileText className="w-4 h-4 text-primary-400" /> Linked Technical Documentation</h3>
                  <div className="flex flex-wrap gap-2">
                    {asset.documents.map((doc) => (
                      <Badge key={doc} variant="info" className="text-xs font-medium py-1 px-2 font-mono">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Maintenance Audit Ledger */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5"><Wrench className="w-4 h-4 text-accent-green" /> Maintenance Ledger</h3>
                  <div className="space-y-1">
                    {asset.maintenanceHistory.map((h, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-surface-850/50 border border-white/5 text-xs">
                        <div>
                          <p className="font-semibold text-white">{h.action}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">Technician: {h.technician}</p>
                        </div>
                        <span className="text-slate-400 font-medium text-[10px]">{h.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="text-center py-24 bg-surface-900 border border-white/5 h-full flex flex-col items-center justify-center">
                <QrCode className="w-14 h-14 text-slate-600 mb-4 animate-pulse" />
                <h3 className="text-base font-semibold text-white mb-1">Scan or Query Asset</h3>
                <p className="text-xs text-slate-500 max-w-xs">Tap "Start Laser Scan" to simulate camera capture or search tag manually in the control center.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
