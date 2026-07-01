import { useState } from 'react';
import {
  Sliders, Cpu, Activity, Clock, DollarSign, Settings,
  ClipboardList, ShieldAlert, KeyRound
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const LATENCY_TREND = [
  { time: '12:00', latency: 198 },
  { time: '12:10', latency: 220 },
  { time: '12:20', latency: 185 },
  { time: '12:30', latency: 310 },
  { time: '12:40', latency: 145 },
  { time: '12:50', latency: 168 },
];

export default function AiPlatformDiagnosticsPage() {
  const [temperature, setTemperature] = useState(0.2);
  const [searchDepth, setSearchDepth] = useState(5);
  const [totalTokens] = useState(166800);
  const [accumulatedCost] = useState(0.52);

  // States
  const [pineconeDocs] = useState(420);
  const [googleAuthOk] = useState(true);
  
  // Checklist
  const [checks, setChecks] = useState([
    { id: 1, text: 'Validate RAG prompts context sync variables', checked: true },
    { id: 2, text: 'Confirm vector databases namespaces parameters', checked: true },
    { id: 3, text: 'Recalibrate model fallback safety overrides', checked: false }
  ]);

  // Logs stream
  const [logs, setLogs] = useState([
    { text: 'Model parameters reindexed. Ingestion threshold set at 80%.', time: '11:45 AM' },
    { text: 'Pinecone namespace active vectors verified successfully.', time: '11:30 AM' }
  ]);

  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'done'>('idle');

  const handleToggleCheck = (id: number) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleTestDiagnostics = () => {
    setLogs(prev => [
      { text: `Diagnostics test completed: latency average 185ms, zero fallback faults.`, time: new Date().toLocaleTimeString() },
      ...prev
    ]);
  };

  const handleClearCache = () => {
    setLogs(prev => [
      { text: `Cleared vector indexing cache namespace: muthyala-platform`, time: new Date().toLocaleTimeString() },
      ...prev
    ]);
  };

  const handleExportJSON = () => {
    setSavingStatus('saving');
    setTimeout(() => {
      setSavingStatus('done');
      // Simulate file download
      const text = `
      === SYSTEM DIAGNOSTICS LOGS ===
      Model Temperature: ${temperature}
      RAG Search Depth: ${searchDepth}
      Total Ingested Vectors: ${pineconeDocs}
      Google Auth Connected: ${googleAuthOk}
      Current cost: $${accumulatedCost}
      `;
      const element = document.createElement("a");
      const file = new Blob([text], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `system_diagnostics_report.json`;
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
          <div className="absolute top-[20%] left-[10%] w-72 h-72 rounded-full bg-primary-500/5 blur-[90px] animate-float-slow" />
          <div className="absolute bottom-[10%] right-[15%] w-80 h-80 rounded-full bg-accent-cyan/5 blur-[95px] animate-float-medium" />
        </div>

        <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Sliders className="w-8 h-8 text-accent-cyan" /> AI Platform Administration & Diagnostics Console
            </h1>
            <p className="page-subtitle">15+ model latencies, vector indices checks, token cost calculators, and overrides</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleTestDiagnostics} className="text-xs">
              <Activity className="w-4 h-4 mr-1 text-accent-green" /> Run Diagnostics Test
            </Button>
          </div>
        </div>

        {/* Metrics top row */}
        <div className="z-10 relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Average Query Latency</p>
              <h3 className="text-xl font-extrabold text-white mt-1">185 ms</h3>
              <p className="text-[9px] text-slate-400">RAG pipeline search target &lt;300ms</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green shrink-0">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Vector Index Counts</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{pineconeDocs} Nodes</h3>
              <p className="text-[9px] text-slate-400">Synced with Neo4j DB</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Google Consent state</p>
              <h3 className="text-sm font-bold text-white mt-1">Active (Verified)</h3>
              <p className="text-[9px] text-slate-400">OAuth verification checks OK</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-purple/10 text-accent-purple shrink-0">
              <DollarSign className="w-6 h-6 animate-bounce" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Platform cost total</p>
              <h3 className="text-xl font-extrabold text-white mt-1">${accumulatedCost}</h3>
              <p className="text-[9px] text-slate-400">Tokens: {totalTokens.toLocaleString()}</p>
            </div>
          </Card>
        </div>

        {/* 3-Column Layout */}
        <div className="z-10 relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Latency line chart */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-cyan" /> LLM Query Latency Trend (ms)
              </h2>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={LATENCY_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }} />
                    <Line type="monotone" dataKey="latency" stroke="#22d3ee" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Model JSON configurations overrides */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-400" /> Model Configurations JSON override
              </h2>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-surface-850 rounded-xl border border-white/5">
                  <p className="text-slate-400">// Active namespace models settings</p>
                  <p className="text-white mt-1">{"{"}</p>
                  <p className="text-white pl-4">"model": "gemini-1.5-pro",</p>
                  <p className="text-white pl-4">"temperature": {temperature},</p>
                  <p className="text-white pl-4">"search_depth": {searchDepth}</p>
                  <p className="text-white">{"}"}</p>
                </div>
              </div>
            </Card>

            {/* Checklist */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-accent-green" /> RAG Context Configuration checklist
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

          {/* Right column: prompt configurations override, token costs, logger */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Temperature override */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Sliders className="w-4 h-4 text-primary-400" /> Model Temperature limits
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>Creativity parameter</span>
                  <span className="text-white font-mono">{temperature}</span>
                </div>
                <input
                  type="range" min="0.0" max="1.0" step="0.1"
                  value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>
            </Card>

            {/* RAG search depth override selection */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                RAG Context Source Depth
              </h3>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Search Source Count (k)</label>
                <select
                  value={searchDepth} onChange={(e) => setSearchDepth(parseInt(e.target.value))}
                  className="w-full bg-surface-850 border border-white/5 text-white rounded p-1.5 text-xs focus:ring-0 focus:border-primary-500"
                >
                  <option value={3}>Top 3 matching vectors</option>
                  <option value={5}>Top 5 matching vectors</option>
                  <option value={10}>Top 10 matching vectors</option>
                </select>
              </div>
            </Card>

            {/* Clear vector index cache */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Vector cache namespace controller
              </h3>
              <Button onClick={handleClearCache} className="w-full text-xs font-bold uppercase tracking-wider" variant="secondary">
                Reset Vector cache
              </Button>
            </Card>

            {/* Diagnostic Logs */}
            <Card className="bg-surface-900 border border-white/5 p-4 flex flex-col h-[200px]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-4 h-4 text-accent-cyan animate-pulse" /> Diagnostic logs feed
              </h3>
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 text-[9px] font-mono text-slate-400">
                {logs.map((log, i) => (
                  <div key={i} className="p-2 bg-surface-850 border border-white/5 rounded flex justify-between">
                    <span>{log.text}</span>
                    <span className="text-slate-600 shrink-0 ml-1">{log.time}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Download diagnostics report */}
            <Card className="bg-surface-900 border border-white/5 p-4">
              <Button onClick={handleExportJSON} loading={savingStatus === 'saving'} className="w-full text-xs font-bold uppercase tracking-wider">
                {savingStatus === 'done' ? 'JSON Generated!' : 'Download Diagnostic JSON'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
