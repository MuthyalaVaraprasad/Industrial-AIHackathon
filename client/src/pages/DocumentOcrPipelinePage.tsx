import { useState, useEffect } from 'react';
import {
  Scan, FileText, Activity, Cpu, RefreshCw, CheckCircle, Search,
  AlertTriangle, Sliders, Table, Languages
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface OcrJob {
  id: string;
  filename: string;
  status: 'idle' | 'extracting' | 'completed' | 'failed';
  progress: number;
  engine: string;
  lang: string;
  confidence: number;
}

export default function DocumentOcrPipelinePage() {
  const [jobs, setJobs] = useState<OcrJob[]>([
    { id: 'job-1', filename: 'P-101_v3_Isometric_Drawing.pdf', status: 'extracting', progress: 45, engine: 'Gemini 1.5 Pro', lang: 'English', confidence: 94 },
    { id: 'job-2', filename: 'OSHA_LOTO_Compliance_2026.pdf', status: 'completed', progress: 100, engine: 'Vapor OCR v4', lang: 'English', confidence: 98 },
    { id: 'job-3', filename: 'HX-301_Scale_Inspection_Report.png', status: 'failed', progress: 0, engine: 'Gemini 1.5 Flash', lang: 'Spanish', confidence: 0 }
  ]);

  const [activeJobId, setActiveJobId] = useState('job-1');
  const [ocrEngine, setOcrEngine] = useState('Gemini 1.5 Pro');
  const [targetLang, setTargetLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  
  // OCR config sliders (Feature 7)
  const [maxBoxes, setMaxBoxes] = useState(150);
  const [density, setDensity] = useState(85);

  // Ingestion stats
  const [totalParsedPages] = useState(145);
  const [avgConfidence] = useState(94.2);

  // Logs stream
  const [logs, setLogs] = useState([
    { text: 'Completed indexing chunk vectors for job-2 in Pinecone.', time: '11:24 AM' },
    { text: 'Extracted 14 safety entities from job-2 text blocks.', time: '11:22 AM' }
  ]);

  // Checklist
  const [checks, setChecks] = useState([
    { id: 1, text: 'Confirm vector database indexing sync completed', checked: true },
    { id: 2, text: 'Validate LOTO compliance checklists nodes matching', checked: false }
  ]);

  const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];

  // Simulated live progress
  useEffect(() => {
    const timer = setInterval(() => {
      setJobs(prev => prev.map(j => {
        if (j.status === 'extracting') {
          if (j.progress >= 100) {
            setLogs(l => [{ text: `Ingestion completed for ${j.filename}`, time: new Date().toLocaleTimeString() }, ...l]);
            return { ...j, status: 'completed', progress: 100 };
          }
          return { ...j, progress: j.progress + 5 };
        }
        return j;
      }));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const handleRetryJob = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'extracting', progress: 10 } : j));
    setLogs(l => [{ text: `Retrying failed job ${id}`, time: new Date().toLocaleTimeString() }, ...l]);
  };

  const handleToggleCheck = (id: number) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleExportCSV = () => {
    const text = `
    Filename,Engine,Language,Confidence
    ${activeJob.filename},${activeJob.engine},${activeJob.lang},${activeJob.confidence}%
    `;
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeJob.id}_parsed_entities.csv`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  const filteredJobs = jobs.filter(j => j.filename.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <PageTransition>
      <div className="relative space-y-6 min-h-screen">
        {/* Floating background animation blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[15%] w-80 h-80 rounded-full bg-accent-cyan/5 blur-[95px] animate-float-slow" />
          <div className="absolute bottom-[20%] right-[10%] w-72 h-72 rounded-full bg-primary-500/5 blur-[80px] animate-float-medium" />
        </div>

        <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Scan className="w-8 h-8 text-accent-cyan" /> Document Parsing & OCR Pipeline Console
            </h1>
            <p className="page-subtitle">15+ extraction speeds, translation bounds, entities key-values tables, and config parameters</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleRetryJob('job-3')}>
              <RefreshCw className="w-4 h-4 mr-1" /> Re-sync Pipeline
            </Button>
          </div>
        </div>

        {/* Top metrics row */}
        <div className="z-10 relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total Pages Processed</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{totalParsedPages} Pages</h3>
              <p className="text-[9px] text-slate-400">Average parsing rate 12s/pg</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green shrink-0">
              <CheckCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Average Confidence</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{avgConfidence}%</h3>
              <p className="text-[9px] text-slate-400">Based on Gemini evaluation checks</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan shrink-0">
              <Languages className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Active translation target</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{targetLang.toUpperCase()}</h3>
              <p className="text-[9px] text-slate-400">Auto-translate technical labels</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-purple/10 text-accent-purple shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Active Parser Engine</p>
              <h3 className="text-sm font-bold text-white mt-1">{ocrEngine}</h3>
              <p className="text-[9px] text-slate-400">Dynamic model router active</p>
            </div>
          </Card>
        </div>

        {/* 3-Column layout */}
        <div className="z-10 relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Ingestion Queue list table */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2.5 border-b border-white/5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Table className="w-5 h-5 text-accent-cyan" /> OCR Queue & Processing Status
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="input-field pl-10 text-xs py-1.5 !mb-0"
                  />
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-2.5 px-3">Document details</th>
                      <th className="py-2.5 px-3">Parsing Engine</th>
                      <th className="py-2.5 px-3">Confidence</th>
                      <th className="py-2.5 px-3">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredJobs.map(job => (
                      <tr
                        key={job.id}
                        onClick={() => setActiveJobId(job.id)}
                        className={`hover:bg-surface-850/50 cursor-pointer ${activeJobId === job.id ? 'bg-primary-500/10' : ''}`}
                      >
                        <td className="py-3 px-3">
                          <p className="font-semibold text-white">{job.filename}</p>
                          <p className="text-[9px] text-slate-500">Target lang: {job.lang}</p>
                        </td>
                        <td className="py-3 px-3">{job.engine}</td>
                        <td className="py-3 px-3 font-mono">{job.confidence}%</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] w-8">{job.progress}%</span>
                            <div className="h-1.5 w-16 bg-surface-800 rounded-full overflow-hidden shrink-0">
                              <div className="h-full bg-primary-500" style={{ width: `${job.progress}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Extracted key-values parameters */}
            {activeJob && (
              <Card className="bg-surface-900 border border-white/5 p-5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-accent-cyan" /> Extracted Entities & Metadata Tags ({activeJob.filename})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                    <span>Target Casing ID</span>
                    <span className="text-white font-bold">Pump P-101</span>
                  </div>
                  <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                    <span>Bearing Temp Threshold</span>
                    <span className="text-accent-red font-bold">172.4°F</span>
                  </div>
                  <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                    <span>Asset Serial Tag</span>
                    <span className="text-white font-bold">SN-98124-P101</span>
                  </div>
                  <div className="p-3 bg-surface-850 rounded-xl border border-white/5 flex justify-between items-center">
                    <span>Safety Standard check</span>
                    <span className="text-accent-green font-bold">OSHA 1910 Compliance</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Ingestion Checks */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent-green" /> Vector DB Indexing Checks checklist
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

          {/* Right Column: Engine selectors, sliders, logs */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Engine selectors */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Active Parser Configuration
              </h3>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">OCR Routing Model</label>
                  <select
                    value={ocrEngine} onChange={(e) => setOcrEngine(e.target.value)}
                    className="w-full bg-surface-850 border border-white/5 text-white rounded p-1.5 text-xs focus:ring-0"
                  >
                    <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Deep Context)</option>
                    <option value="Vapor OCR v4">Vapor OCR v4 (High Speed)</option>
                    <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Lightweight)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Language translation</label>
                  <select
                    value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full bg-surface-850 border border-white/5 text-white rounded p-1.5 text-xs focus:ring-0"
                  >
                    <option value="en">English (Default)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="de">German (Deutsch)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* OCR Parameter Sliders */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-primary-400" /> Bounding Boxes Bounds
              </h3>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>Max bounding boxes count</span>
                    <span className="text-white font-mono">{maxBoxes}</span>
                  </div>
                  <input
                    type="range" min="50" max="300" step="10"
                    value={maxBoxes} onChange={(e) => setMaxBoxes(parseInt(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>DPI Resolution Density</span>
                    <span className="text-white font-mono">{density}%</span>
                  </div>
                  <input
                    type="range" min="50" max="100" step="5"
                    value={density} onChange={(e) => setDensity(parseInt(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                </div>
              </div>
            </Card>

            {/* Active pipeline status log */}
            <Card className="bg-surface-900 border border-white/5 p-4 flex flex-col h-[240px]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5 mb-2">
                <Activity className="w-4 h-4 text-accent-cyan" /> Pipeline Status stream
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

            {/* Failure retry queue */}
            {jobs.some(j => j.status === 'failed') && (
              <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5 text-accent-red">
                  <AlertTriangle className="w-4 h-4" /> Failed Ingestions Queue
                </h3>
                <div className="space-y-2 text-xs">
                  {jobs.filter(j => j.status === 'failed').map(j => (
                    <div key={j.id} className="flex justify-between items-center gap-2">
                      <span className="truncate text-slate-400 font-mono">{j.filename}</span>
                      <Button size="sm" variant="secondary" onClick={() => handleRetryJob(j.id)} className="text-[9px] py-1 h-auto shrink-0">
                        Retry
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Entities Exporter */}
            <Card className="bg-surface-900 border border-white/5 p-4">
              <Button onClick={handleExportCSV} className="w-full text-xs font-bold uppercase tracking-wider">
                Export entities (.CSV)
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
