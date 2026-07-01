import { useState, useEffect } from 'react';
import {
  Activity, Sliders, FileText, Cpu, Bell, Sparkles, RefreshCw, CheckCircle,
  BarChart2, ShieldAlert, Zap, FolderMinus, Download, ClipboardList, HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const CONFIDENCE_DATA = [
  { name: 'RCA Accuracy', value: 94, color: '#6366f1' },
  { name: 'Predictive Bounds', value: 89, color: '#10b981' },
  { name: 'OCR Ingestion', value: 92, color: '#22d3ee' },
  { name: 'Compliance Audits', value: 96, color: '#a855f7' },
];

const LATENCY_DATA = [
  { time: '10:00', ms: 142 },
  { time: '10:10', ms: 235 },
  { time: '10:20', ms: 198 },
  { time: '10:30', ms: 120 },
  { time: '10:40', ms: 340 },
  { time: '10:50', ms: 185 },
];

const STREAM_DETAILS = {
  'P-101': {
    vibration: '8.4 mm/s',
    temp: '172.4°F',
    risk: '91%',
    desc: 'Critical threshold vibration spike detected on Free-End motor bearing assembly. Thermal casings friction wear detected.'
  },
  'V-203': {
    vibration: '1.2 mm/s',
    temp: '94.2°F',
    risk: '12%',
    desc: 'Separator vessel operating within standard pressure limits. Missing Lockout/Tagout physical records.'
  },
  'HX-301': {
    vibration: '3.1 mm/s',
    temp: '142.1°F',
    risk: '45%',
    desc: 'Thermal heat transfer rates falling. Scale fouling suspected inside tube bundles.'
  }
};

export default function CommandCenterPage() {
  const [activeStream, setActiveStream] = useState<'P-101' | 'V-203' | 'HX-301'>('P-101');
  const [ocrProgress, setOcrProgress] = useState(45);
  const [ocrStatus, setOcrStatus] = useState<'active' | 'completed'>('active');

  // Sliders for Model Parameter Override Controls (Feature 1)
  const [temperature, setTemperature] = useState(0.2);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(1024);

  // Ingestion Failure Queue state (Feature 4)
  const [failedJobs, setFailedJobs] = useState([
    { id: 'f-1', filename: 'P-101_v2_unreadable_scan.pdf', error: 'Low Resolution / Blur', size: '12.4 MB' },
    { id: 'f-2', filename: 'HSE_Compliance_Form_Q1_Draft.pdf', error: 'Empty Signature Fields', size: '1.8 MB' }
  ]);

  // Prompt Templates state (Feature 5)
  const [selectedPrompt, setSelectedPrompt] = useState('Standard RCA Investigation template');

  // Safety Interlocks ESD state (Feature 7)
  const [esdLock, setEsdLock] = useState(false);

  // Pre-shift Operations Checklist state (Feature 8)
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Confirm SCADA sensor tag calibration', checked: true },
    { id: 2, text: 'Check P-101 temperature log compliance', checked: false },
    { id: 3, text: 'Verify HSE training status signoffs', checked: false }
  ]);

  // Model Cost Token Counters state (Feature 10)
  const [tokenStats] = useState({
    inputTokens: 124500,
    outputTokens: 42300,
    estimatedCost: 0.38
  });

  const [alerts, setAlerts] = useState([
    { id: 1, title: 'Flange Seal Wear Overdue', asset: 'Pump P-101', severity: 'critical', time: '5m ago' },
    { id: 2, title: 'Heat Exchanger Tube Efficiency Low', asset: 'HX-301', severity: 'warning', time: '12m ago' },
    { id: 3, title: 'Relief Valve Missing Compliance Cert', asset: 'V-203', severity: 'warning', time: '1h ago' }
  ]);
  const [recommendations, setRecommendations] = useState([
    { id: 1, action: 'Perform shaft alignment calibration', asset: 'P-101', impact: 'Avoid 4.2h unplanned downtime', checked: false },
    { id: 2, action: 'Schedule heat exchanger tube cleaning', asset: 'HX-301', impact: 'Improve heat transfer efficiency by 15%', checked: false },
    { id: 3, action: 'Upload missing Lockout/Tagout log', asset: 'V-203', impact: 'Remediate OSHA 1910 audit compliance gap', checked: false }
  ]);
  const [logs, setLogs] = useState([
    { id: 1, type: 'System', text: 'Gemini RAG context chunk vectors successfully reindexed.', time: '10:45 AM' },
    { id: 2, type: 'OCR', text: 'Pump_P101_RCA_Report_Final.pdf processed successfully.', time: '10:30 AM' },
    { id: 3, type: 'AI', text: 'Predictive health scoring updated for 24 monitored assets.', time: '10:15 AM' }
  ]);

  // Simulate active OCR progress
  useEffect(() => {
    if (ocrStatus === 'active') {
      const interval = setInterval(() => {
        setOcrProgress((prev) => {
          if (prev >= 100) {
            setOcrStatus('completed');
            clearInterval(interval);
            // Append log
            setLogs((prevLogs) => [
              { id: Date.now(), type: 'OCR', text: 'Structural drawing P-101_v3.pdf completed ingestion.', time: '11:15 AM' },
              ...prevLogs
            ]);
            return 100;
          }
          return prev + 5;
        });
      }, 900);
      return () => clearInterval(interval);
    }
  }, [ocrStatus]);

  const handleDismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleTriggerAction = (id: number) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, checked: true } : r));
    setTimeout(() => {
      setRecommendations(prev => prev.filter(r => r.id !== id));
      // Append a log
      setLogs(prev => [
        { id: Date.now(), type: 'Action', text: `Recalibration task queued for asset.`, time: 'Just now' },
        ...prev
      ]);
    }, 1200);
  };

  const handleRetryFailedJob = (id: string, filename: string) => {
    setFailedJobs(prev => prev.filter(j => j.id !== id));
    setOcrProgress(10);
    setOcrStatus('active');
    setLogs(prev => [
      { id: Date.now(), type: 'System', text: `Retrying failed ingestion job for ${filename}`, time: 'Just now' },
      ...prev
    ]);
  };

  const handleToggleChecklist = (id: number) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleExportSystemLogs = () => {
    const text = logs.map(l => `[${l.time}] [${l.type}] ${l.text}`).join('\n');
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `system_command_center_logs.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  const handleRefresh = () => {
    setOcrProgress(15);
    setOcrStatus('active');
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">AI Operations Command Center</h1>
            <p className="page-subtitle">Unified real-time neural network control panel & workflow engine</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Telemetry Stream Selector (Feature 11) */}
            <span className="text-[10px] text-slate-500 font-bold uppercase">Stream Context:</span>
            <select
              value={activeStream}
              onChange={(e) => setActiveStream(e.target.value as any)}
              className="bg-surface-850 border border-white/5 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:border-primary-500"
            >
              <option value="P-101">Pump P-101</option>
              <option value="V-203">Valve V-203</option>
              <option value="HX-301">Exchanger HX-301</option>
            </select>
            <Button variant="secondary" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-1" /> Re-sync
            </Button>
          </div>
        </div>

        {/* Live KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-900 border border-white/5 flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Operations Status</p>
                <h3 className="text-xl font-extrabold text-white mt-1">ONLINE</h3>
              </div>
              <Badge variant="success" className="text-[9px]">98.7% Up</Badge>
            </div>
            <p className="text-[10px] text-accent-cyan flex items-center gap-1 mt-2 font-medium">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Live models sync active
            </p>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vibration Index ({activeStream})</p>
                <h3 className="text-xl font-extrabold text-white mt-1">{STREAM_DETAILS[activeStream].vibration}</h3>
              </div>
              <Badge variant={activeStream === 'P-101' ? 'danger' : 'success'} className="text-[9px]">{activeStream === 'P-101' ? 'Vibration Alert' : 'Normal'}</Badge>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Casing Temperature: {STREAM_DETAILS[activeStream].temp}</p>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Smart Alerts</p>
                <h3 className="text-xl font-extrabold text-accent-red mt-1">{alerts.length} Warnings</h3>
              </div>
              <Badge variant="danger" className="text-[9px]">High Priority</Badge>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Requires engineer response verification</p>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Failure Risk ({activeStream})</p>
                <h3 className="text-xl font-extrabold text-white mt-1">{STREAM_DETAILS[activeStream].risk}</h3>
              </div>
              <Badge variant="warning" className="text-[9px]">Calculated Risk</Badge>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Pipeline: Ingest -&gt; Extract -&gt; Graph</p>
          </Card>
        </div>

        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: AI Summary, Recommendations, Ingestion Failure Retry Queue */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Executive Summary */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
                <Sparkles className="w-5 h-5 text-accent-cyan" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Executive Summary ({activeStream})</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {STREAM_DETAILS[activeStream].desc} 
                Average safety compliance score remains highly stable at **92%**, but missing training records for hazardous handling could cause a minor rating deviation.
              </p>
            </Card>

            {/* AI Recommendation Center */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2.5">
                <Cpu className="w-5 h-5 text-primary-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Recommendation Center</h2>
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="p-3.5 rounded-xl bg-surface-850 border border-white/5 flex justify-between items-center gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{rec.action}</span>
                          <Badge variant="info" className="text-[8px] py-0 font-mono">{rec.asset}</Badge>
                        </div>
                        <p className="text-slate-400 font-sans">{rec.impact}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={rec.checked ? 'secondary' : 'primary'}
                        onClick={() => handleTriggerAction(rec.id)}
                        disabled={rec.checked}
                        className="text-[10px] py-1 px-2.5 h-auto shrink-0"
                      >
                        {rec.checked ? <CheckCircle className="w-3 h-3 text-accent-green" /> : 'Trigger'}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">All recommended actions have been processed.</div>
              )}
            </Card>

            {/* Feature 4: Ingestion Failure Retry Queue */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2.5">
                <FolderMinus className="w-5 h-5 text-accent-red" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Ingestion Failure Queue</h2>
              </div>
              {failedJobs.length > 0 ? (
                <div className="space-y-3 text-xs">
                  {failedJobs.map((job) => (
                    <div key={job.id} className="p-3.5 rounded-xl bg-surface-850 border border-accent-red/20 flex justify-between items-center gap-4">
                      <div>
                        <p className="font-bold text-white font-mono">{job.filename}</p>
                        <p className="text-[10px] text-accent-red mt-0.5">Error: {job.error} ({job.size})</p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRetryFailedJob(job.id, job.filename)}
                        className="text-[10px] py-1 px-2.5 h-auto shrink-0"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" /> Retry Ingestion
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No failed ingestion processes detected.</p>
              )}
            </Card>

            {/* Ingestion Pipeline Progress */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2.5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><FileText className="w-5 h-5 text-accent-amber" /> Ingestion Pipeline Progress</h2>
                {ocrStatus === 'active' && <span className="text-[10px] text-accent-cyan font-mono animate-pulse">4.2 KB/s</span>}
              </div>
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-850 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">Ingesting: P-101_v3_Isometric_Drawing.pdf</span>
                    <span className="text-[10px] font-mono text-slate-400">{ocrProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Feature 2: Global System Health Status Ledger */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-green" /> Global System Services Health
              </h2>
              <div className="overflow-x-auto scrollbar-thin text-xs">
                <table className="w-full text-left text-slate-300 font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-2">Service ID</th>
                      <th className="py-2">Interface Sync</th>
                      <th className="py-2">Ping Latency</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-2.5 font-bold">Neo4j Node DB</td>
                      <td className="py-2.5 text-slate-500">Live Graph Sync</td>
                      <td className="py-2.5">14 ms</td>
                      <td className="py-2.5"><Badge variant="success">Active</Badge></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Vector Storage</td>
                      <td className="py-2.5 text-slate-500">MongoDB Index</td>
                      <td className="py-2.5">38 ms</td>
                      <td className="py-2.5"><Badge variant="success">Active</Badge></td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Google Identity</td>
                      <td className="py-2.5 text-slate-500">OAuth Popup flow</td>
                      <td className="py-2.5">8 ms</td>
                      <td className="py-2.5"><Badge variant="success">Active</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Column 2: Prompt override, Latency, ESD interlocks, checklist, token count */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Feature 1: Model Parameter Override Controls */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Sliders className="w-4 h-4 text-primary-400" /> Model Parameters Override
              </h3>
              <div className="space-y-3 text-[10px]">
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Temperature (Creativity)</span>
                    <span className="text-white font-mono">{temperature}</span>
                  </div>
                  <input
                    type="range" min="0" max="1.0" step="0.1"
                    value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Top P Bounds</span>
                    <span className="text-white font-mono">{topP}</span>
                  </div>
                  <input
                    type="range" min="0.5" max="1.0" step="0.05"
                    value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Max tokens response</span>
                    <span className="text-white font-mono">{maxTokens}</span>
                  </div>
                  <input
                    type="range" min="256" max="2048" step="256"
                    value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>
              </div>
            </Card>

            {/* Feature 3: Model Query Latency Graph */}
            <Card className="bg-surface-900 border border-white/5 p-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3 border-b border-white/5 pb-2">
                <BarChart2 className="w-4 h-4 text-accent-cyan" /> LLM Query Latency (ms)
              </h3>
              <div className="w-full h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={LATENCY_DATA}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)', fontSize: 9 }} />
                    <Area type="monotone" dataKey="ms" stroke="#22d3ee" fill="rgba(34,211,238,0.1)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Active Smart Alerts Feed */}
            <Card className="bg-surface-900 border border-white/5 p-4 flex flex-col h-[230px]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3 border-b border-white/5 pb-2">
                <Bell className="w-4 h-4 text-accent-red animate-pulse" /> Active Smart Alerts Feed
              </h3>
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 text-[10px]">
                {alerts.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-lg bg-surface-850 border border-white/5 flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{a.title}</span>
                        <Badge variant="danger" className="text-[7px] py-0 px-1 font-mono uppercase">{a.severity}</Badge>
                      </div>
                      <p className="text-slate-400">{a.asset} • {a.time}</p>
                    </div>
                    <button onClick={() => handleDismissAlert(a.id)} className="text-slate-500 hover:text-white font-bold cursor-pointer">✕</button>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Confidence Pie Chart */}
            <Card className="bg-surface-900 border border-white/5 p-4 flex flex-col items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3 w-full border-b border-white/5 pb-2">
                <Activity className="w-4 h-4 text-primary-400" /> Model Accuracy Indexes
              </h3>
              <div className="w-full h-32 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CONFIDENCE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {CONFIDENCE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full grid grid-cols-2 gap-2 text-[8px] text-slate-400 font-mono">
                {CONFIDENCE_DATA.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Feature 5: Prompt Templates Catalog */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <HelpCircle className="w-4 h-4 text-slate-500" /> Prompt Templates Catalog
              </h3>
              <select
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
                className="w-full bg-surface-850 border border-white/5 text-white rounded-lg p-2 text-[10px] focus:border-primary-500"
              >
                <option value="Standard RCA Investigation template">RCA Failure Path Analysis</option>
                <option value="ISO compliance check">HSE Regulation Audit</option>
                <option value="Structural CAD parsing prompt">Isometric Blueprint Info</option>
              </select>
              <p className="text-[9px] text-slate-500 italic mt-1 font-mono">Template: {selectedPrompt}</p>
            </Card>

            {/* Feature 7: Emergency Shutdown ESD interlocks */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <ShieldAlert className="w-4 h-4 text-accent-red" /> Safety Interlocks (ESD)
              </h3>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-300 font-semibold uppercase">ESD Interlock System</span>
                <button
                  onClick={() => setEsdLock(!esdLock)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${esdLock ? 'bg-accent-red/20 text-accent-red border border-accent-red/30' : 'bg-surface-850 text-slate-500 border border-white/5'}`}
                >
                  {esdLock ? '🔒 Locked' : '🔓 Active'}
                </button>
              </div>
            </Card>

            {/* Feature 8: Pre-shift Operations Checklist */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <ClipboardList className="w-4 h-4 text-accent-amber" /> Pre-Shift Audit checklist
              </h3>
              <div className="space-y-2 text-[10px]">
                {checklist.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 text-slate-300 select-none cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="w-3.5 h-3.5 accent-primary-500"
                    />
                    <span className={item.checked ? 'line-through text-slate-500 font-mono' : 'font-sans'}>{item.text}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Feature 10: Model Cost Token Counters */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Zap className="w-4 h-4 text-accent-cyan" /> Model Token Cost Counter
              </h3>
              <div className="space-y-1.5 text-[9px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Input Tokens:</span>
                  <span className="text-white font-bold">{tokenStats.inputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Output Tokens:</span>
                  <span className="text-white font-bold">{tokenStats.outputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
                  <span>Estimated Cost ($):</span>
                  <span className="text-accent-cyan font-bold">${tokenStats.estimatedCost}</span>
                </div>
              </div>
            </Card>

            {/* Feature 9: Interactive System Logs Export */}
            <Card className="bg-surface-900 border border-white/5 p-4">
              <Button onClick={handleExportSystemLogs} className="w-full text-[10px] py-2 h-auto" variant="secondary">
                <Download className="w-3.5 h-3.5 mr-1" /> Export Ingestion logs (.TXT)
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
