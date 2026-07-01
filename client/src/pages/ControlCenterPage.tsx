import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu, Users, QrCode, FileText, Mic, MessageSquare,
  Activity, HeartHandshake, CheckCircle, Clock
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ControlCenterPage() {
  const navigate = useNavigate();
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const assets = [
    { name: 'Centrifugal Pump P-101', status: 'critical', health: 62 },
    { name: 'Heat Exchanger HX-301', status: 'warning', health: 74 },
    { name: 'Separator Vessel V-203', status: 'stable', health: 91 },
    { name: 'Compressor Unit C-204', status: 'stable', health: 94 }
  ];

  const engineers = [
    { name: 'Marcus Vance', role: 'Maintenance Lead', status: 'Active on Site' },
    { name: 'Lisa Park', role: 'HSE Auditor', status: 'Active on Audit' }
  ];

  const voiceLogs = [
    { text: 'Inquired about Pump P-101 health parameters.', time: '10 mins ago' },
    { text: 'Queried compliance gaps logs.', time: '1h ago' }
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Industrial Control Center</h1>
            <p className="page-subtitle">Unified plant operations status, dispatcher console, and active logs</p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-slate-500 font-bold uppercase tracking-widest">Live System Clock:</span>
            <p className="font-mono text-white text-base font-extrabold">{timestamp}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Asset Status & Active Engineers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset status grid */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-cyan" /> Monitored Assets Status
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assets.map((asset, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-surface-850 border border-white/5 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-white">{asset.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Telemetry Active</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={asset.status === 'critical' ? 'danger' : asset.status === 'warning' ? 'warning' : 'success'}>
                        {asset.health}% Health
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Active engineers */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-400" /> Dispatcher & Engineers Duty Log
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {engineers.map((eng, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-surface-850 border border-white/5 flex items-center gap-3.5 text-xs">
                    <div className="w-9 h-9 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center font-bold text-primary-300">
                      {eng.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{eng.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{eng.role}</p>
                    </div>
                    <Badge variant="success" className="text-[8px] uppercase">{eng.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Navigation grid */}
            <Card className="p-5 bg-surface-900 border border-white/5">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-3.5 flex items-center gap-1.5"><HeartHandshake className="w-4 h-4 text-accent-green" /> Operations Shortcuts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <button
                  onClick={() => navigate('/app/qr-scanner')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface-850 hover:bg-surface-800 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-white transition-all text-center cursor-pointer gap-2"
                >
                  <QrCode className="w-5 h-5 text-accent-cyan" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Asset Scanner</span>
                </button>

                <button
                  onClick={() => navigate('/app/voice')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface-850 hover:bg-surface-800 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-white transition-all text-center cursor-pointer gap-2"
                >
                  <Mic className="w-5 h-5 text-accent-red" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Voice Control</span>
                </button>

                <button
                  onClick={() => navigate('/app/copilot')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface-850 hover:bg-surface-800 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-white transition-all text-center cursor-pointer gap-2"
                >
                  <MessageSquare className="w-5 h-5 text-primary-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">RAG Copilot</span>
                </button>

                <button
                  onClick={() => navigate('/app/reports')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface-850 hover:bg-surface-800 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-white transition-all text-center cursor-pointer gap-2"
                >
                  <FileText className="w-5 h-5 text-accent-purple" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Reports</span>
                </button>
              </div>
            </Card>
          </div>

          {/* Column 2: System Health, Live timeline logs */}
          <div className="lg:col-span-1 space-y-6">
            {/* System Health */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Cpu className="w-4 h-4 text-accent-green" /> System Services Health
              </h3>
              <div className="space-y-2 text-[10px] font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">RAG Context Engine:</span>
                  <span className="text-accent-green font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">OCR Parser Core:</span>
                  <span className="text-accent-green font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Speech Synthesis:</span>
                  <span className="text-accent-green font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Healthy</span>
                </div>
              </div>
            </Card>

            {/* Voice Assistant activity */}
            <Card className="bg-surface-900 border border-white/5 p-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3 border-b border-white/5 pb-2">
                <Mic className="w-4 h-4 text-accent-red" /> Voice Assistant Activity
              </h3>
              <div className="space-y-3 text-[10px]">
                {voiceLogs.map((log, i) => (
                  <div key={i} className="flex gap-2 items-start text-slate-400">
                    <span className="text-accent-red font-bold text-[8px] px-1 bg-accent-red/10 rounded shrink-0">MIC</span>
                    <p className="flex-1 font-sans leading-relaxed">{log.text}</p>
                    <span className="text-slate-600 font-bold shrink-0 font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent timeline activities list */}
            <Card className="bg-surface-900 border border-white/5 p-4 flex flex-col h-[280px]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3 border-b border-white/5 pb-2">
                <Clock className="w-4 h-4 text-slate-500" /> Recent Timeline Feed
              </h3>
              
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 text-[10px] font-mono leading-relaxed">
                <div className="flex gap-2">
                  <span className="text-slate-500">11:05 AM</span>
                  <span className="text-slate-300">Work order assigned to Marcus Vance for seal replacement.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-500">10:58 AM</span>
                  <span className="text-slate-300">QR Code scanned: Centrifugal Pump P-101.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-500">10:45 AM</span>
                  <span className="text-slate-300">RAG model parameters updated by operator.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
