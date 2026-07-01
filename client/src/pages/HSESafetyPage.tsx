import { useState } from 'react';
import {
  Shield, ShieldAlert, FileText, CheckCircle, Flame, Wind, Volume2
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function HSESafetyPage() {
  const [safetyScore] = useState(96);
  const [sirenOn, setSirenOn] = useState(false);
  const [pinged, setPinged] = useState(false);
  const [retireNotes, setRetireNotes] = useState('');
  const [retireSuccess, setRetireSuccess] = useState(false);

  // Features states
  const [gasLeakRate] = useState(0.00);
  const [decibels] = useState(68);
  const [windDir] = useState('NNE at 12 knots');
  
  // PPE camera state
  const [ppeStatus] = useState<'All Compliant' | 'Mask Missing P-101'>('All Compliant');

  // Safety shower test state
  const [showers, setShowers] = useState([
    { id: 1, name: 'Zone A Shower', testDate: 'Jun 28, 2026', status: 'Passed' },
    { id: 2, name: 'Zone B Shower', testDate: 'Jun 29, 2026', status: 'Passed' }
  ]);

  // Permit logs
  const [permits, setPermits] = useState([
    { id: 1, type: 'Hot Work Permit P-101', status: 'Approved', signer: 'Marcus Vance' },
    { id: 2, type: 'Confined Space V-203', status: 'Pending Approval', signer: 'Pending' }
  ]);

  // Violations feed
  const [violations, setViolations] = useState([
    { id: 1, msg: 'Missing hardhat warning on Zone B catwalk', time: '1h ago' }
  ]);

  const [auditSelect, setAuditSelect] = useState('osha-1910');

  // Form states
  const [hazardDesc, setHazardDesc] = useState('');
  const [hazardLogged, setHazardLogged] = useState(false);

  const handleLogHazard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardDesc) return;
    setHazardLogged(true);
    setViolations(prev => [{ id: Date.now(), msg: `User reported: ${hazardDesc}`, time: 'Just now' }, ...prev]);
    setHazardDesc('');
    setTimeout(() => setHazardLogged(false), 2000);
  };

  const handleTestShower = (id: number) => {
    setShowers(prev => prev.map(s => s.id === id ? { ...s, testDate: 'Today', status: 'Passed' } : s));
  };

  const handleApprovePermit = (id: number) => {
    setPermits(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved', signer: 'Safety Officer' } : p));
  };

  const handleSaveRetireNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retireNotes) return;
    setRetireSuccess(true);
    setViolations(prev => [
      { id: Date.now(), msg: `Captured operator knowledge: "${retireNotes.substring(0, 35)}..."`, time: 'Just now' },
      ...prev
    ]);
    setRetireNotes('');
    setTimeout(() => setRetireSuccess(false), 2000);
  };

  const handleTriggerDrill = () => {
    setSirenOn(true);
    setTimeout(() => {
      setSirenOn(false);
    }, 4000);
  };

  return (
    <PageTransition>
      <div className="relative space-y-6 min-h-screen">
        {/* Dynamic float background animation (Aesthetic rule) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[20%] w-72 h-72 rounded-full bg-accent-red/5 blur-[90px] animate-float-slow" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-indigo-500/5 blur-[100px] animate-float-medium" />
        </div>

        <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Shield className="w-8 h-8 text-accent-cyan" /> HSE & Safety Assurance Center
            </h1>
            <p className="page-subtitle font-sans">15+ safety interlocks, emergency drills, and PPE compliance trackers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleTriggerDrill} className="text-xs">
              <Flame className="w-4 h-4 mr-1 text-accent-red animate-pulse" /> Trigger Evac Drill
            </Button>
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="z-10 relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green shrink-0">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Safety Score Index</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{safetyScore}%</h3>
              <p className="text-[9px] text-slate-400">Target rating: &gt;95%</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan shrink-0">
              <Wind className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Wind & Direction</p>
              <h3 className="text-sm font-bold text-white mt-1">{windDir}</h3>
              <p className="text-[9px] text-slate-400">Gas dispersion pathway NNE</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-red/10 text-accent-red shrink-0">
              <Flame className="w-6 h-6 animate-bounce" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Zone Gas Telemetry</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{gasLeakRate} PPM</h3>
              <p className="text-[9px] text-slate-400">Lower Explosive limit LEL standard</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-purple/10 text-accent-purple shrink-0">
              <Volume2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Sound Decibels</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{decibels} dB</h3>
              <p className="text-[9px] text-slate-400">Hearing protection thresholds</p>
            </div>
          </Card>
        </div>

        {/* 3-Column Layout */}
        <div className="z-10 relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Fire Loops & Emergency Shutdown Valves */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent-red" /> Fire Safety Loop & ESD Valves
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                  <span>ESD Valve XV-101 (P-101)</span>
                  <Badge variant="success">Closed (Locked)</Badge>
                </div>
                <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                  <span>Gas Sensor Loop GS-203</span>
                  <Badge variant="success">Active Loop</Badge>
                </div>
                <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                  <span>Evacuation Alarm Speaker</span>
                  <Badge variant={sirenOn ? 'danger' : 'info'}>{sirenOn ? '🚨 Siren On' : 'Standby'}</Badge>
                </div>
                <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                  <span>PPE Compliance Scanner</span>
                  <Badge variant={ppeStatus === 'All Compliant' ? 'success' : 'danger'}>{ppeStatus}</Badge>
                </div>
              </div>
            </Card>

            {/* Shift Permit Signoffs */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-cyan" /> Shift Permits Safety Signoff
              </h2>
              <div className="space-y-3 text-xs">
                {permits.map(permit => (
                  <div key={permit.id} className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{permit.type}</p>
                      <p className="text-[10px] text-slate-500">Signer: {permit.signer}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={permit.status === 'Approved' ? 'secondary' : 'primary'}
                        onClick={() => handleApprovePermit(permit.id)}
                        disabled={permit.status === 'Approved'}
                        className="text-[10px] py-1 px-2.5 h-auto"
                      >
                        {permit.status === 'Approved' ? '✓ Signed' : 'Sign Permit'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Safety Shower tests */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent-green" /> Safety Showers Inspection Checklist
              </h2>
              <div className="space-y-3 text-xs font-mono">
                {showers.map(s => (
                  <div key={s.id} className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-500">Last Test: {s.testDate}</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => handleTestShower(s.id)} className="text-[9px] py-1 h-auto">
                      Test Shower
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Hazard logger, OSHA report selectors, controls pings */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* HSE Hazard logger form */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Log Active Safety Hazard
              </h3>
              <form onSubmit={handleLogHazard} className="space-y-3 text-xs">
                <textarea
                  rows={2} value={hazardDesc} onChange={(e) => setHazardDesc(e.target.value)}
                  placeholder="Report missing safety guard, leak, hot surface..."
                  className="w-full bg-surface-850 border border-white/5 text-white rounded p-2 text-xs focus:ring-0 focus:border-primary-500"
                />
                <Button type="submit" className="w-full text-[10px] py-1.5 h-auto">
                  {hazardLogged ? 'Logged successfully!' : 'Submit Incident'}
                </Button>
              </form>
            </Card>

            {/* OSHA audit selectors */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-accent-cyan" /> Regulatory OSHA Guidelines
              </h3>
              <select
                value={auditSelect} onChange={(e) => setAuditSelect(e.target.value)}
                className="w-full bg-surface-850 border border-white/5 text-white rounded p-2 text-xs focus:ring-0"
              >
                <option value="osha-1910">OSHA 1910.147 (Lockout/Tagout)</option>
                <option value="iso-45001">ISO 45001 Occupational Safety</option>
              </select>
              <p className="text-[9px] text-slate-500 italic font-mono">Reference: {auditSelect.toUpperCase()}</p>
            </Card>

            {/* Violations feed */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3 h-[220px] flex flex-col">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-accent-red animate-pulse" /> PPE Violations Alert Feed
              </h3>
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 text-[10px] font-mono text-slate-400">
                {violations.map(v => (
                  <div key={v.id} className="p-2 bg-surface-850 rounded border border-white/5 flex justify-between">
                    <span>{v.msg}</span>
                    <span className="text-slate-600 shrink-0 ml-1">{v.time}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Retiring Engineer Knowledge Capture Panel */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                🪶 Retiring Operator Knowledge Cliff Capture
              </h3>
              <form onSubmit={handleSaveRetireNotes} className="space-y-3 text-xs">
                <textarea
                  rows={2} value={retireNotes} onChange={(e) => setRetireNotes(e.target.value)}
                  placeholder="Type undocumented operational secrets, Pump alignment checks details..."
                  className="w-full bg-surface-850 border border-white/5 text-white rounded p-2 text-xs focus:ring-0 focus:border-primary-500"
                />
                <Button type="submit" className="w-full text-[10px] py-1.5 h-auto">
                  {retireSuccess ? 'Knowledge Vectorized & Synced!' : 'Capture Knowledge'}
                </Button>
              </form>
            </Card>

            {/* Cross-System Connector Audit */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-2.5 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                🔗 Disconnected Systems Ingestion Audit
              </h3>
              <div className="space-y-1 text-[9px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>P&IDs System (Vapor CAD):</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Email Archives (OSHA compliance):</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance CMMS Logs:</span>
                  <Badge variant="success">Connected</Badge>
                </div>
              </div>
            </Card>

            {/* Emergency pings controls */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Control Room Emergency Link
              </h3>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-semibold uppercase">Broadband Control Ping</span>
                <button
                  onClick={() => setPinged(!pinged)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${pinged ? 'bg-accent-red/20 text-accent-red border border-accent-red/30' : 'bg-surface-850 text-slate-500 border border-white/5'}`}
                >
                  {pinged ? '🚨 Control Room Notified' : 'Ping Command'}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
