import { useState } from 'react';
import {
  GitBranch, Search, Database, Activity, Clock, Radio, RefreshCw, FileText, Volume2
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface LinkedDoc {
  id: string;
  name: string;
  system: string;
  type: string;
  lastUpdated: string;
  confidence: number;
  citationPage: number;
}

export default function CrossSystemLinkerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSystem, setSearchSystem] = useState('all');
  const [timeSaved] = useState(34.8); // 35% average McKinsey savings
  const [downtimePrevented] = useState(21.4); // 18-22% BIS Research
  const [voiceNotes, setVoiceNotes] = useState('');
  const [voiceLogged, setVoiceLogged] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Custom checklist
  const [connectors, setConnectors] = useState([
    { id: 'pid', name: 'Engineering P&IDs (Vapor CAD)', connected: true },
    { id: 'cmms', name: 'Maintenance Work Orders (SAP)', connected: true },
    { id: 'sop', name: 'Operating Procedures (SharePoint)', connected: true },
    { id: 'insp', name: 'Inspection Records (Local DB)', connected: true },
    { id: 'email', name: 'Regulatory Submissions (Outlook)', connected: false }
  ]);

  // Search Results
  const [results] = useState<LinkedDoc[]>([
    { id: 'doc-1', name: 'P-101_v3_Isometric_Drawing.pdf', system: 'P&IDs CAD', type: 'Engineering Drawing', lastUpdated: '12h ago', confidence: 96, citationPage: 4 },
    { id: 'doc-2', name: 'Pump_Seal_Maintenance_2025.docx', system: 'SAP CMMS', type: 'Maintenance Record', lastUpdated: '2d ago', confidence: 91, citationPage: 12 },
    { id: 'doc-3', name: 'LOTO_OSHA_Safety_Audit.pdf', system: 'SharePoint SOP', type: 'Safety Procedure', lastUpdated: '1w ago', confidence: 88, citationPage: 1 }
  ]);

  const [logs, setLogs] = useState([
    { text: 'Indexing pipeline synchronized with Neo4j & Pinecone.', time: '12:05 PM' },
    { text: 'Cross-system document references cross-matched: 42 tags found.', time: '11:58 AM' }
  ]);

  const [pingStatus, setPingStatus] = useState<Record<string, boolean>>({});

  const handleToggleConnector = (id: string) => {
    setConnectors(prev => prev.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  };

  const handleSyncSystems = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLogs(l => [{ text: 'Dynamic cross-matching completed: 7 systems validated.', time: new Date().toLocaleTimeString() }, ...l]);
    }, 1500);
  };

  const handleSaveVoiceNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceNotes) return;
    setVoiceLogged(true);
    setLogs(l => [{ text: `Ingested retiring operator note: "${voiceNotes.substring(0, 30)}..."`, time: new Date().toLocaleTimeString() }, ...l]);
    setVoiceNotes('');
    setTimeout(() => setVoiceLogged(false), 2000);
  };

  const handlePingSystem = (sys: string) => {
    setPingStatus(prev => ({ ...prev, [sys]: true }));
    setTimeout(() => {
      setPingStatus(prev => ({ ...prev, [sys]: false }));
      setLogs(l => [{ text: `Ping command resolved for system database: ${sys}`, time: new Date().toLocaleTimeString() }, ...l]);
    }, 1000);
  };

  const filteredResults = results.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.system.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = searchSystem === 'all' || doc.system === searchSystem;
    return matchesSearch && matchesSystem;
  });

  return (
    <PageTransition>
      <div className="relative space-y-6 min-h-screen">
        {/* Aesthetic background animation blobs (WOW element) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[10%] w-96 h-96 rounded-full bg-accent-cyan/5 blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[20%] left-[5%] w-80 h-80 rounded-full bg-indigo-500/5 blur-[90px] animate-float-medium" />
        </div>

        <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <GitBranch className="w-8 h-8 text-accent-cyan" /> Enterprise Systems Linker
            </h1>
            <p className="page-subtitle">Mitigating NASSCOM fragmentation & knowledge cliff: 15+ search and connection widgets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSyncSystems} loading={isSyncing}>
              <RefreshCw className="w-4 h-4 mr-1" /> Re-sync Disconnected Systems
            </Button>
          </div>
        </div>

        {/* Top KPIs Row: McKinsey 35% time saved, BIS Research 18-22% downtime prevention */}
        <div className="z-10 relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Average Time Saved Searching</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{timeSaved}% hours</h3>
              <p className="text-[9px] text-slate-400">Reclaiming McKinsey 35% waste</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Downtime Prevented</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{downtimePrevented}% reduction</h3>
              <p className="text-[9px] text-slate-400">BIS Research downtime bounds</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Connected Document Hubs</p>
              <h3 className="text-xl font-extrabold text-white mt-1">7 of 8 Hubs</h3>
              <p className="text-[9px] text-slate-400">P&IDs, SAP, SharePoint synced</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-purple/10 text-accent-purple shrink-0">
              <Volume2 className="w-6 h-6 animate-bounce" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Captured Operator Secrets</p>
              <h3 className="text-xl font-extrabold text-white mt-1">12 Knowledge Chunks</h3>
              <p className="text-[9px] text-slate-400">Retirement cliff buffer active</p>
            </div>
          </Card>
        </div>

        {/* 3-Column Layout */}
        <div className="z-10 relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Semantic Cross-System Search Box */}
            <Card className="bg-surface-900 border border-white/5 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2.5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-5 h-5 text-accent-cyan" /> Cross-System Knowledge Search
                </h2>
                <div className="flex gap-2">
                  <select
                    value={searchSystem}
                    onChange={(e) => setSearchSystem(e.target.value)}
                    className="bg-surface-850 border border-white/5 text-white rounded p-1.5 text-xs focus:ring-0"
                  >
                    <option value="all">All Connected Systems</option>
                    <option value="P&IDs CAD">P&IDs CAD Drawings</option>
                    <option value="SAP CMMS">SAP CMMS Logs</option>
                    <option value="SharePoint SOP">SharePoint SOPs</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query mechanical bearings, relief valve certificates, LOTO requirements..."
                  className="input-field pl-10 text-xs py-2.5 !mb-0"
                />
              </div>

              {/* Dynamic search results table with citation page numbers and confidence indices */}
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-2 px-3">Matching Document</th>
                      <th className="py-2 px-3">System Hub</th>
                      <th className="py-2 px-3">Citation Anchor</th>
                      <th className="py-2 px-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredResults.map(doc => (
                      <tr key={doc.id} className="hover:bg-surface-850/50">
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-white">{doc.name}</p>
                          <p className="text-[9px] text-slate-500">Classification: {doc.type}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="info">{doc.system}</Badge>
                        </td>
                        <td className="py-2.5 px-3 font-mono">Page #{doc.citationPage}</td>
                        <td className="py-2.5 px-3 font-bold text-accent-green">{doc.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Retiring Engineer Knowledge Capture Panel (Feature 9) */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-accent-purple" /> Retiring Operator Secrets Capture Panel
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                Over 25% of engineers will retire within the next decade. Ingest their undocumented notes directly into the RAG vector cache here:
              </p>
              <form onSubmit={handleSaveVoiceNote} className="space-y-3 text-xs">
                <textarea
                  rows={2} value={voiceNotes} onChange={(e) => setVoiceNotes(e.target.value)}
                  placeholder="Record pump back-pressure bypass procedure, bearing calibration nuances..."
                  className="w-full bg-surface-850 border border-white/5 text-white rounded p-2 text-xs focus:ring-0 focus:border-primary-500"
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 text-[10px] py-2 h-auto bg-gradient-to-r from-accent-purple to-indigo-600">
                    {voiceLogged ? 'Secrets Vectorized!' : 'Save Secrets Note'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column: Connection toggles, diagnostics ping test, pipeline log */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* System Connectors checklist (Feature 1) */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                📂 Active Connected Document Hubs
              </h3>
              <div className="space-y-2 text-xs">
                {connectors.map(c => (
                  <div key={c.id} className="flex justify-between items-center gap-2">
                    <label className="flex items-center gap-2 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={c.connected}
                        onChange={() => handleToggleConnector(c.id)}
                        className="w-3.5 h-3.5 accent-primary-500"
                      />
                      <span className={c.connected ? 'text-white' : 'text-slate-500 line-through'}>{c.name}</span>
                    </label>
                    <button
                      onClick={() => handlePingSystem(c.id)}
                      disabled={pingStatus[c.id]}
                      className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-surface-850 text-slate-400 hover:text-white"
                    >
                      {pingStatus[c.id] ? 'Ping...' : 'Ping'}
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pipeline logs stream */}
            <Card className="bg-surface-900 border border-white/5 p-4 flex flex-col h-[260px]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5 mb-2">
                <Radio className="w-4 h-4 text-accent-cyan animate-pulse" /> Linking Pipeline Log Ticker
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

            {/* Ingest manuals trigger */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Ingest PDF Manuals/Drawings
              </h3>
              <div className="border border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-accent-cyan/40">
                <FileText className="w-8 h-8 text-slate-500 mx-auto mb-1.5" />
                <span className="text-[10px] text-slate-400">Upload P&ID CAD PDFs or SOP sheets</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
