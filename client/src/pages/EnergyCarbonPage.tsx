import { useState } from 'react';
import {
  Zap, Globe, Activity, Sliders, CheckCircle, Sun, BatteryCharging
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const LOAD_DATA = [
  { time: '08:00', load: 12.4 },
  { time: '09:00', load: 14.8 },
  { time: '10:00', load: 15.1 },
  { time: '11:00', load: 14.2 },
  { time: '12:00', load: 13.9 },
  { time: '13:00', load: 11.2 },
];

export default function EnergyCarbonPage() {
  const [gridLimit, setGridLimit] = useState(16.5);
  const [megawatts] = useState(13.2);
  const [carbonOffset] = useState(124);
  const [powerFactor] = useState(0.92);
  const [carbonPrice, setCarbonPrice] = useState(65);

  // States
  const [solarOutput] = useState(4.2);
  const [steamTurbineEff] = useState(88);
  const [isGridConnected, setIsGridConnected] = useState(true);

  // Checklist
  const [checks, setChecks] = useState([
    { id: 1, text: 'Clean scale fouling HX-301 solar tube arrays', checked: true },
    { id: 2, text: 'Confirm motor power factor above 0.90 threshold', checked: true },
    { id: 3, text: 'Recalibrate steam turbine backup pressure valves', checked: false }
  ]);

  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'done'>('idle');

  const handleToggleCheck = (id: number) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleExport = () => {
    setSavingStatus('saving');
    setTimeout(() => {
      setSavingStatus('done');
      // Simulate file download
      const text = `
      === ENERGY & CARBON LEDGER ===
      Solar Field Output: ${solarOutput} MW
      Steam Turbine Efficiency: ${steamTurbineEff}%
      Grid Connection State: ${isGridConnected ? 'CONNECTED' : 'DISCONNECTED'}
      Carbon Credits Price: $${carbonPrice}/Ton
      Estimated Carbon Value: $${(carbonOffset * carbonPrice).toLocaleString()}
      `;
      const element = document.createElement("a");
      const file = new Blob([text], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `energy_carbon_report.txt`;
      document.body.appendChild(element);
      element.click();
      element.remove();
      setTimeout(() => setSavingStatus('idle'), 1500);
    }, 1200);
  };

  return (
    <PageTransition>
      <div className="relative space-y-6 min-h-screen">
        {/* Aesthetic background animation blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] right-[15%] w-80 h-80 rounded-full bg-accent-green/5 blur-[90px] animate-float-slow" />
          <div className="absolute bottom-[10%] left-[10%] w-72 h-72 rounded-full bg-cyan-500/5 blur-[80px] animate-float-medium" />
        </div>

        <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Zap className="w-8 h-8 text-primary-400" /> Energy & Carbon Analytics Panel
            </h1>
            <p className="page-subtitle">15+ power grids, solar telemetry, carbon credits value, and turbine checkups</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isGridConnected ? 'success' : 'danger'} className="uppercase py-1.5 px-3">
              {isGridConnected ? '⚡ Grid Synced' : '⚠️ Island Mode'}
            </Badge>
          </div>
        </div>

        {/* Top KPI row */}
        <div className="z-10 relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 shrink-0">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Plant Grid Load (MW)</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{megawatts} MW</h3>
              <p className="text-[9px] text-slate-400">Limit: {gridLimit} MW max</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Carbon Offset Total</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{carbonOffset} Tons</h3>
              <p className="text-[9px] text-slate-400">Valued at ${carbonPrice}/Ton</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan shrink-0">
              <Sun className="w-6 h-6 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Solar Arrays Output</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{solarOutput} MW</h3>
              <p className="text-[9px] text-slate-400">Panel efficiency index 94%</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-purple/10 text-accent-purple shrink-0">
              <BatteryCharging className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Power Factor Cos Φ</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{powerFactor}</h3>
              <p className="text-[9px] text-slate-400">Capacitor banks operational</p>
            </div>
          </Card>
        </div>

        {/* 3-Column layout */}
        <div className="z-10 relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Grid Load trend */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-400" /> Plant Megawatt (MW) load history
              </h2>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={LOAD_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }} />
                    <Area type="monotone" dataKey="load" stroke="#6366f1" fill="rgba(99,102,241,0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Solar arrays and turbine casing status */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                <BatteryCharging className="w-5 h-5 text-accent-cyan" /> Subsystem Solar & Steam Turbine Status
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                  <span>Solar Output Level</span>
                  <span className="text-white font-bold">{solarOutput} MW</span>
                </div>
                <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                  <span>Turbine Efficiency Factor</span>
                  <span className="text-accent-green font-bold">{steamTurbineEff}%</span>
                </div>
                <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                  <span>Grid Sync Frequency</span>
                  <span className="text-white font-bold">60.02 Hz</span>
                </div>
                <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                  <span>Electrical Cost Offset</span>
                  <span className="text-accent-green font-bold">$12,400 saved</span>
                </div>
              </div>
            </Card>

            {/* Checklist */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent-green" /> Energy Saving Audits checklist
              </h2>
              <div className="space-y-2 text-xs">
                {checks.map(c => (
                  <label key={c.id} className="flex items-center gap-2 text-slate-300 select-none cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={c.checked}
                      onChange={() => handleToggleCheck(c.id)}
                      className="w-3.5 h-3.5 accent-primary-500"
                    />
                    <span className={c.checked ? 'line-through text-slate-500 font-mono' : 'font-sans'}>{c.text}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column: carbon values, limit override sliders, scheduler */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Grid limit slider */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Sliders className="w-4 h-4 text-primary-400" /> Peak Megawatts Grid Limits
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>Grid Alert Capping</span>
                  <span className="text-white font-mono">{gridLimit} MW</span>
                </div>
                <input
                  type="range" min="10" max="25" step="0.5"
                  value={gridLimit} onChange={(e) => setGridLimit(parseFloat(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>
            </Card>

            {/* Carbon credit price value input */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Carbon Credits Pricing Override
              </h3>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Credit price ($ per Ton)</label>
                <input
                  type="number" value={carbonPrice} onChange={(e) => setCarbonPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-850 border border-white/5 text-white rounded p-1.5 text-xs focus:ring-0 focus:border-primary-500"
                />
              </div>
              <div className="p-2 bg-surface-850 rounded border border-white/5 font-mono text-[9px] text-accent-green flex justify-between">
                <span>Calculated Offsets Value:</span>
                <span className="font-bold">${(carbonOffset * carbonPrice).toLocaleString()}</span>
              </div>
            </Card>

            {/* Grid Sync Controller toggle */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Plant Island Controller
              </h3>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Plant Bus Connector</span>
                <button
                  onClick={() => setIsGridConnected(!isGridConnected)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${isGridConnected ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' : 'bg-accent-red/20 text-accent-red border border-accent-red/30'}`}
                >
                  {isGridConnected ? '⚡ Connected' : '⚠️ Isolated'}
                </button>
              </div>
            </Card>

            {/* Report Exporter */}
            <Card className="bg-surface-900 border border-white/5 p-4">
              <Button onClick={handleExport} loading={savingStatus === 'saving'} className="w-full text-xs font-bold uppercase tracking-wider">
                {savingStatus === 'done' ? 'Excel Exported!' : 'Export Energy ledger'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
