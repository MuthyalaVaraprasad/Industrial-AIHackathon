import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode, Mic, Download, Wrench, Shield, FileText, AlertTriangle,
  Activity, Clock, Sparkles, Share2, CheckCircle, FileSpreadsheet
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AssetData360 {
  id: string;
  tag: string;
  name: string;
  location: string;
  status: 'healthy' | 'warning' | 'critical';
  healthScore: number;
  description: string;
  commissioned: string;
  type: string;
  efficiency: number;
  temperature: number;
  vibration: number;
  hoursRun: number;
  maintenanceHistory: { date: string; action: string; tech: string; status: string }[];
  timeline: { step: string; date: string; completed: boolean }[];
  compliance: { standard: string; status: string }[];
  graphRelations: { label: string; type: string }[];
  relatedDocs: { title: string; type: string; size: string }[];
  inspectionReports: { title: string; date: string }[];
  rca: { incident: string; rootCause: string; confidence: number };
  lessons: { pattern: string; recommendation: string }[];
  recommendations: string[];
  telemetryData: { name: string; val: number }[];
}

const ASSET_DATASETS: Record<string, AssetData360> = {
  'P-101': {
    id: 'p-101',
    tag: 'P-101',
    name: 'Centrifugal Water Pump P-101',
    location: 'Unit 4 Processing Plant - Bay 2',
    status: 'warning',
    healthScore: 62,
    type: 'Rotary Fluid Pump',
    description: 'High-capacity centrifugal pump responsible for primary cooling loop circulation across unit 4 exchangers.',
    commissioned: '2022-04-12',
    efficiency: 84.2,
    temperature: 172.4,
    vibration: 8.4,
    hoursRun: 14205,
    maintenanceHistory: [
      { date: '2026-06-15', action: 'Standard recalibration check', tech: 'Marcus Vance', status: 'Completed' },
      { date: '2026-05-10', action: 'Visual flange seal inspection', tech: 'Marcus Vance', status: 'Completed' },
      { date: '2026-03-01', action: 'Impeller balance test', tech: 'Marcus Vance', status: 'Completed' }
    ],
    timeline: [
      { step: 'Commissioned & Safety Signed', date: '2022-04-12', completed: true },
      { step: 'Routine Seal Swap', date: '2025-06-20', completed: true },
      { step: 'Vibration Out of Range Logged', date: '2026-06-12', completed: true },
      { step: 'Shaft Realignment Scheduled', date: '2026-07-05', completed: false }
    ],
    compliance: [
      { standard: 'ISO 9001 (Quality)', status: 'Compliant' },
      { standard: 'OSHA 1910.119 (Process Safety)', status: 'Requires Verification' }
    ],
    graphRelations: [
      { label: 'Heat Exchanger HX-301', type: 'Flow Destination' },
      { label: 'Control Valve V-203', type: 'Throttle Input' },
      { label: 'Main Reservoir R-1', type: 'Feed Suction' }
    ],
    relatedDocs: [
      { title: 'Centrifugal Pump P-101 OEM Manual.pdf', type: 'PDF', size: '4.2 MB' },
      { title: 'Cooling Loop P&ID Diagram.dwg', type: 'CAD Drawing', size: '12.8 MB' }
    ],
    inspectionReports: [
      { title: 'Q2 2026 Vibration Diagnostics Analysis.pdf', date: '2026-06-14' },
      { title: 'Annual Process Safety Audit Report.pdf', date: '2026-04-10' }
    ],
    rca: {
      incident: 'Seal Seizure Alert',
      rootCause: 'Mechanical seal degradation caused by shaft tolerance deviation.',
      confidence: 94
    },
    lessons: [
      { pattern: 'Pump seal degradation under continuous thermal loop', recommendation: 'Calibrate alignment tolerances every 90 days.' }
    ],
    recommendations: [
      'Initiate alignment recalibration prior to next thermal peak cycle.',
      'Replace elastomer backup rings on next scheduled shutdown.'
    ],
    telemetryData: [
      { name: '08:00', val: 7.2 },
      { name: '10:00', val: 7.6 },
      { name: '12:00', val: 8.4 },
      { name: '14:00', val: 8.2 },
      { name: '16:00', val: 8.5 },
      { name: '18:00', val: 8.4 }
    ]
  },
  'HX-301': {
    id: 'hx-301',
    tag: 'HX-301',
    name: 'Shell & Tube Heat Exchanger HX-301',
    location: 'Unit 4 Processing Plant - Bay 3',
    status: 'healthy',
    healthScore: 89,
    type: 'Thermal Transfer Exchanger',
    description: 'High-pressure thermal exchanger cooling product streams using feedwater loops driven by P-101.',
    commissioned: '2021-09-18',
    efficiency: 91.5,
    temperature: 145.2,
    vibration: 1.8,
    hoursRun: 21840,
    maintenanceHistory: [
      { date: '2026-06-20', action: 'Visual safety check HX-301', tech: 'Elena Rostova', status: 'Completed' },
      { date: '2026-02-15', action: 'Tube cleaning & descaling', tech: 'Marcus Vance', status: 'Completed' }
    ],
    timeline: [
      { step: 'Installation & Pressure test', date: '2021-09-18', completed: true },
      { step: 'Annual tube descaling', date: '2026-02-15', completed: true },
      { step: 'Pressure integrity log check', date: '2026-06-20', completed: true },
      { step: 'Ultrasonic wall thickness scan', date: '2026-10-10', completed: false }
    ],
    compliance: [
      { standard: 'ASME Boiler Code Sec VIII', status: 'Compliant' },
      { standard: 'ISO 14001 (Environmental)', status: 'Compliant' }
    ],
    graphRelations: [
      { label: 'Circulation Pump P-101', type: 'Coolant Source' },
      { label: 'Product Outlet V-204', type: 'Process Flow' }
    ],
    relatedDocs: [
      { title: 'ASME HX-301 Design Specification.pdf', type: 'PDF', size: '8.4 MB' },
      { title: 'Maintenance Descaling Guide.xlsx', type: 'XLSX', size: '1.2 MB' }
    ],
    inspectionReports: [
      { title: 'Tube wall thickness ultrasonic test logs.pdf', date: '2026-02-14' }
    ],
    rca: {
      incident: 'Secondary Thermal Expansion Alert',
      rootCause: 'Trace fouling deposits reduced heat transfer rate slightly.',
      confidence: 88
    },
    lessons: [
      { pattern: 'Feedwater scaling deposit accumulation', recommendation: 'Inject chemical descalers during quarterly inspections.' }
    ],
    recommendations: [
      'Maintain chemical feedwater treatment levels.',
      'Schedule ultrasonic shell scanning in Q4.'
    ],
    telemetryData: [
      { name: '08:00', val: 92 },
      { name: '10:00', val: 91.8 },
      { name: '12:00', val: 91.5 },
      { name: '14:00', val: 91.6 },
      { name: '16:00', val: 91.2 },
      { name: '18:00', val: 91.5 }
    ]
  },
  'V-203': {
    id: 'v-203',
    tag: 'V-203',
    name: 'Control Pressure Valve V-203',
    location: 'Unit 4 Processing Plant - Pipe Rack A',
    status: 'critical',
    healthScore: 35,
    type: 'Throttle Control Valve',
    description: 'Electro-pneumatic control valve regulating pressure loops in separator inlet feeds.',
    commissioned: '2023-01-10',
    efficiency: 58.0,
    temperature: 110.5,
    vibration: 4.2,
    hoursRun: 9540,
    maintenanceHistory: [
      { date: '2026-04-12', action: 'Actuator recalibration', tech: 'Marcus Vance', status: 'Completed' },
      { date: '2026-01-05', action: 'Packing gland tightening', tech: 'Elena Rostova', status: 'Completed' }
    ],
    timeline: [
      { step: 'Commissioned and Calibrated', date: '2023-01-10', completed: true },
      { step: 'Actuator checkup', date: '2026-04-12', completed: true },
      { step: 'Pressure drop leakage detected', date: '2026-06-25', completed: true },
      { step: 'Seat & packing replacement', date: '2026-07-02', completed: false }
    ],
    compliance: [
      { standard: 'ISA 75.01 (Control Valve sizing)', status: 'Compliant' },
      { standard: 'OSHA 1910.119', status: 'Non-Compliant' }
    ],
    graphRelations: [
      { label: 'Circulation Pump P-101', type: 'Upstream Regulator' },
      { label: 'Separator V-204', type: 'Feed Inlet' }
    ],
    relatedDocs: [
      { title: 'Fisher V-203 Technical Spec Sheet.pdf', type: 'PDF', size: '2.1 MB' }
    ],
    inspectionReports: [
      { title: 'Separator pressure leak diagnostics audit.pdf', date: '2026-06-26' }
    ],
    rca: {
      incident: 'Pressure Loop Deviation',
      rootCause: 'Pneumatic actuator diaphragms worn resulting in stem sticking.',
      confidence: 96
    },
    lessons: [
      { pattern: 'Actuator diaphragm fatigue on pressure cycles', recommendation: 'Perform diaphragm swaps every 24 months.' }
    ],
    recommendations: [
      'Urgent packing seal replacement required to arrest gas vent leaks.',
      'Recalibrate digital positioner feedback loop.'
    ],
    telemetryData: [
      { name: '08:00', val: 59 },
      { name: '10:00', val: 58.5 },
      { name: '12:00', val: 58.1 },
      { name: '14:00', val: 56.4 },
      { name: '16:00', val: 55.2 },
      { name: '18:00', val: 58.0 }
    ]
  }
};

const statusBadgeVariant = {
  healthy: 'success',
  warning: 'warning',
  critical: 'danger',
} as const;

export default function Asset360Page() {
  const [selectedTag, setSelectedTag] = useState<string>('P-101');
  const navigate = useNavigate();

  const asset = useMemo(() => ASSET_DATASETS[selectedTag] || ASSET_DATASETS['P-101'], [selectedTag]);

  // Mock download trigger
  const handleDownloadQR = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(asset, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `qr_asset_${asset.tag}_ledger.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Activity className="w-6 h-6 text-accent-cyan" /> Asset 360 Profile Dashboard
            </h1>
            <p className="page-subtitle">Consolidated operational, maintenance, compliance, and AI views</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Inspect Asset:</span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="input-field text-xs py-1.5 px-3 w-auto font-mono !mb-0"
            >
              {Object.keys(ASSET_DATASETS).map(tag => (
                <option key={tag} value={tag}>{tag} — {ASSET_DATASETS[tag].name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Top summary layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Col 1: Overview & Specs */}
          <Card className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-start">
              <Badge variant="info" className="font-mono text-[9px] uppercase tracking-wider">{asset.tag}</Badge>
              <Badge variant={statusBadgeVariant[asset.status]}>{asset.status} status</Badge>
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{asset.name}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{asset.type}</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{asset.description}</p>
            
            <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="text-white font-medium">{asset.location}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Commissioned</span><span className="text-white font-mono">{asset.commissioned}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Hours Run</span><span className="text-white font-mono">{asset.hoursRun.toLocaleString()} hrs</span></div>
            </div>
          </Card>

          {/* Col 2: Health score, dial, & stats */}
          <Card className="lg:col-span-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-semibold text-slate-400 text-xs flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-accent-green" /> Real-time Diagnostics</h3>
              <div className="flex items-center gap-4 mt-4">
                <div className="w-16 h-16 rounded-full border-4 border-slate-700/50 flex items-center justify-center relative shrink-0">
                  <span className="text-sm font-bold text-white">{asset.healthScore}%</span>
                  <div className={cn(
                    'absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent animate-spin-slow',
                    asset.healthScore > 80 ? 'border-accent-green' : asset.healthScore > 60 ? 'border-accent-amber' : 'border-accent-red'
                  )} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Plant Health Score</p>
                  <p className="text-white font-semibold text-xs mt-0.5">Operating Efficiency: {asset.efficiency}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-500">Casing Temperature</span>
                <span className="text-white font-mono font-semibold">{asset.temperature} °F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vibration Amplitude</span>
                <span className="text-white font-mono font-semibold">{asset.vibration} mm/s</span>
              </div>
            </div>
          </Card>

          {/* Col 3: AI Recommendations */}
          <Card className="lg:col-span-1 space-y-4 border-l-4 border-accent-amber">
            <h3 className="font-semibold text-accent-amber text-xs flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI Recommendation</h3>
            <div className="space-y-2 text-xs">
              {asset.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2 text-slate-300">
                  <span className="text-accent-amber">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/app/voice')}
                className="w-full py-2 rounded-lg bg-surface-850 hover:bg-surface-700 text-[10px] text-white flex items-center justify-center gap-1.5 border border-white/5 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-accent-cyan animate-pulse" /> Voice Command Shortcut
              </button>
            </div>
          </Card>

          {/* Col 4: QR & downloads */}
          <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center p-4">
            <div className="p-3 bg-white rounded-xl mb-3 shadow-lg">
              <QrCode className="w-20 h-20 text-slate-900" />
            </div>
            <p className="text-[10px] text-slate-500 font-semibold mb-3">SYSTEM QR ASSET LEDGER</p>
            <Button size="sm" variant="secondary" onClick={handleDownloadQR} className="w-full text-xs">
              <Download className="w-3.5 h-3.5 mr-1" /> Download JSON Ledger
            </Button>
          </Card>
        </div>

        {/* Charts & Timelines Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Telemetry charts */}
          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-white text-sm mb-4">Vibration Telemetry Graph (Past 12 hrs)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={asset.telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                <Line type="monotone" dataKey="val" stroke="#22d3ee" strokeWidth={2.5} dot={{ fill: '#22d3ee' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Timeline steps */}
          <Card className="lg:col-span-1">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary-400" /> Asset Timeline</h3>
            <div className="space-y-4">
              {asset.timeline.map((step, idx) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center border text-[9px] font-bold',
                      step.completed ? 'bg-accent-green/20 border-accent-green text-accent-green' : 'bg-surface-700 border-white/10 text-slate-500'
                    )}>
                      {step.completed ? '✓' : '•'}
                    </div>
                    {idx < asset.timeline.length - 1 && <div className="w-0.5 h-8 bg-surface-700/60 my-0.5" />}
                  </div>
                  <div>
                    <p className={cn('font-semibold', step.completed ? 'text-white' : 'text-slate-500')}>{step.step}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Detailed profiles section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column A: Maintenance history & Compliance */}
          <div className="space-y-6 lg:col-span-1">
            {/* Maintenance history */}
            <Card>
              <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-1.5"><Wrench className="w-4 h-4 text-primary-400" /> Maintenance History</h3>
              <div className="space-y-3">
                {asset.maintenanceHistory.map((hist, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-surface-850/50 border border-white/5 text-xs">
                    <div className="flex justify-between font-semibold text-white">
                      <span>{hist.action}</span>
                      <span className="text-[10px] text-slate-500">{hist.date}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 mt-1">
                      <span>Tech: {hist.tech}</span>
                      <span className="text-accent-green">{hist.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Compliance */}
            <Card>
              <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-1.5"><Shield className="w-4 h-4 text-accent-green" /> Compliance Status</h3>
              <div className="space-y-2">
                {asset.compliance.map((comp, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-surface-850/50 border border-white/5 text-xs">
                    <span className="text-white font-medium">{comp.standard}</span>
                    <Badge variant={comp.status === 'Compliant' ? 'success' : 'warning'}>
                      {comp.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Column B: Knowledge Graph connections & docs */}
          <div className="space-y-6 lg:col-span-1">
            {/* Graph Relations */}
            <Card>
              <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-1.5"><Share2 className="w-4 h-4 text-accent-cyan" /> Knowledge Graph Connections</h3>
              <div className="space-y-2">
                {asset.graphRelations.map((rel, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-surface-850/50 border border-white/5 text-xs">
                    <span className="text-white font-medium">{rel.label}</span>
                    <span className="text-[10px] text-slate-500 bg-surface-800 px-2 py-0.5 rounded border border-white/5">{rel.type}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Related docs */}
            <Card>
              <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-1.5"><FileText className="w-4 h-4 text-primary-400" /> Related Drawings & Manuals</h3>
              <div className="space-y-2">
                {asset.relatedDocs.map((doc, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-surface-850 border border-white/5 text-xs hover:border-primary-500/20 transition-all">
                    <div>
                      <p className="font-semibold text-white truncate max-w-[160px]">{doc.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{doc.type} • {doc.size}</p>
                    </div>
                    <Badge variant="default" className="text-[9px] cursor-pointer">View</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Column C: RCA, Lessons, & Inspection Reports */}
          <div className="space-y-6 lg:col-span-1">
            {/* Root Cause Analysis */}
            <Card className="border-t-4 border-accent-red">
              <h3 className="font-semibold text-accent-red text-sm mb-3 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Root Cause Analysis</h3>
              <div className="text-xs space-y-2">
                <div className="flex justify-between font-semibold text-white">
                  <span>Incident: {asset.rca.incident}</span>
                  <Badge variant="danger">{asset.rca.confidence}% confidence</Badge>
                </div>
                <p className="text-slate-400 leading-relaxed p-2.5 bg-surface-850 border border-white/5 rounded-lg">
                  {asset.rca.rootCause}
                </p>
              </div>
            </Card>

            {/* Lessons Learned */}
            <Card>
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-accent-green" /> Lessons Learned</h3>
              <div className="text-xs space-y-2">
                {asset.lessons.map((les, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-surface-850/50 border border-white/5 space-y-1.5">
                    <p className="font-semibold text-white capitalize">{les.pattern}</p>
                    <p className="text-slate-400">{les.recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Inspection Reports */}
            <Card>
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-1.5"><FileSpreadsheet className="w-4 h-4 text-accent-cyan" /> Inspection Reports</h3>
              <div className="space-y-2">
                {asset.inspectionReports.map((rep, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-surface-850 border border-white/5 text-xs hover:border-primary-500/20 transition-all">
                    <div>
                      <p className="font-semibold text-white truncate max-w-[160px]">{rep.title}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Audit date: {rep.date}</p>
                    </div>
                    <Download className="w-4 h-4 text-slate-500 hover:text-white shrink-0 cursor-pointer" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
