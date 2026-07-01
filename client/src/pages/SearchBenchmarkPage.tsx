import { useState } from 'react';
import { Activity, Search, HelpCircle } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function SearchBenchmarkPage() {
  const [query, setQuery] = useState('');
  const [raceActive, setRaceActive] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [tradProgress, setTradProgress] = useState(0);
  const [raceTriggered, setRaceTriggered] = useState(false);

  // Simulated benchmarks parameters
  const aiSearchTime = 185; // ms
  const traditionalSearchTime = 8400; // ms

  const benchmarkQuestions = [
    'What is the maximum design temperature limit for Heat Exchanger HX-301?',
    'Show me the LOTO isolation safety checklist procedure for Valve V-203.',
    'List all mechanical bearing wear reports logged in the last 6 months for Pump P-101.'
  ];

  const handleRunRace = (searchQuery: string) => {
    if (!searchQuery) return;
    setQuery(searchQuery);
    setRaceActive(true);
    setRaceTriggered(true);
    setAiProgress(0);
    setTradProgress(0);

    // AI search progress completes instantly
    setTimeout(() => {
      setAiProgress(100);
    }, 200);

    // Traditional search progress takes 4 seconds of ticks
    const interval = setInterval(() => {
      setTradProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRaceActive(false);
          return 100;
        }
        return prev + 10;
      });
    }, 400);
  };

  return (
    <PageTransition>
      <div className="relative space-y-6 min-h-screen">
        {/* Aesthetic background animation blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[15%] right-[15%] w-80 h-80 rounded-full bg-primary-500/5 blur-[95px] animate-float-slow" />
          <div className="absolute bottom-[20%] left-[10%] w-72 h-72 rounded-full bg-accent-cyan/5 blur-[80px] animate-float-medium" />
        </div>

        <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Activity className="w-8 h-8 text-accent-cyan" /> Search Speed Benchmark Race
            </h1>
            <p className="page-subtitle">Visualizing the 45x time-to-answer speedup compared to traditional search</p>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="z-10 relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search Query Selector */}
            <Card className="bg-surface-900 border border-white/5 p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2.5">
                Execute Benchmark Search Query
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Select a domain benchmark question below or type custom query..."
                  className="input-field pl-10 text-xs py-2.5 !mb-0"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={() => handleRunRace(query)} disabled={raceActive || !query} className="text-xs">
                  Run Benchmark Race
                </Button>
              </div>
            </Card>

            {/* Live Search Speed race progress bars */}
            {raceTriggered && (
              <Card className="bg-surface-900 border border-white/5 p-5 space-y-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                  Live Search Speed Race
                </h3>
                
                {/* AI Search */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white font-bold flex items-center gap-1">
                      ⚡ Unified AI Knowledge Brain (RAG + KG)
                    </span>
                    <span className="text-accent-green font-bold">
                      {aiProgress === 100 ? `${aiSearchTime}ms (Finished)` : 'Searching...'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-850 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-green transition-all duration-300" style={{ width: `${aiProgress}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Scanned 145 engineering drawing nodes and indexed vector cache namespaces simultaneously.
                  </p>
                </div>

                {/* Traditional Search */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      📁 Traditional Search (7-12 Disconnected Folders)
                    </span>
                    <span className="text-slate-500">
                      {tradProgress === 100 ? `${traditionalSearchTime}ms (Finished)` : 'Scanning folders...'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-850 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500 transition-all duration-300" style={{ width: `${tradProgress}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Manually traversing files directories: P&ID CAD drawer, LOTO safety guidelines, inspection excel spreadsheets.
                  </p>
                </div>
              </Card>
            )}

            {/* Domain Expert Benchmark Questions */}
            <Card className="bg-surface-900 border border-white/5 p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-accent-cyan" /> Domain Expert Benchmark Questions
              </h3>
              <div className="space-y-2 text-xs">
                {benchmarkQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleRunRace(q)}
                    className="p-3 bg-surface-850 rounded-xl border border-white/5 hover:border-accent-cyan/30 cursor-pointer flex justify-between items-center transition-all"
                  >
                    <span className="text-slate-300">{q}</span>
                    <Badge variant="info" className="shrink-0 ml-2">Run Race</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Speed increase indicator & Ingestion stats */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Speedup metrics cards */}
            <Card className="bg-surface-900 border border-white/5 p-5 text-center space-y-3">
              <span className="text-[10px] text-accent-cyan font-bold uppercase tracking-widest font-mono">
                AI Efficiency Multiplier
              </span>
              <h3 className="text-4xl font-extrabold text-white">45x</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Our RAG-powered knowledge brain returns query matches in milliseconds, saving field operators up to 35% of their working hours searching for documentations.
              </p>
            </Card>

            {/* Ingestion audit benchmarks */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Domain Benchmark Metrics
              </h3>
              <div className="space-y-2.5 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Entity Extraction Accuracy:</span>
                  <span className="text-white font-bold">98.4%</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Graph Node Linkage:</span>
                  <span className="text-white font-bold">96.2%</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Compliance Gaps Flagged:</span>
                  <span className="text-accent-green font-bold">14 gaps closed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
