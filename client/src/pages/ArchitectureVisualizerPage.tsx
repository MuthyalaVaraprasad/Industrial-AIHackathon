import { useState, useEffect } from 'react';
import { GitBranch, Database, FileText, Cpu, Server, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ArchitectureVisualizerPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);

  // Auto animation loop to simulate ingestion flow
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const steps = [
    {
      title: '1. Ingest heterogenous data',
      desc: 'CAD drawings, P&IDs, scan forms, SAP work orders, SOP instructions, and Outlook email PST archives.',
      icon: FileText,
      color: 'text-accent-cyan bg-accent-cyan/10'
    },
    {
      title: '2. OCR & Vision processing',
      desc: 'Runs computer vision layout parsers to isolate CAD symbol clusters and extract scanned text grids.',
      icon: Zap,
      color: 'text-primary-400 bg-primary-500/10'
    },
    {
      title: '3. LLM Entity extraction',
      desc: 'Gemini 1.5 Pro parses process parameters, equipment tags, hazard ratings, and engineer logs.',
      icon: Cpu,
      color: 'text-accent-purple bg-accent-purple/10'
    },
    {
      title: '4. Neo4j Knowledge Graph',
      desc: 'Indexes entity relations (e.g. Pump P-101 is-part-of Cooling Loop HX-301) to form a unified ontology.',
      icon: GitBranch,
      color: 'text-accent-green bg-accent-green/10'
    },
    {
      title: '5. Pinecone Vector Embeddings',
      desc: 'Stores text chunks alongside semantic coordinates for rapid context injection during search queries.',
      icon: Database,
      color: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      title: '6. RAG Copilot Orchestration',
      desc: 'Combines Graph Nodes + Vector Embeddings into the LLM prompt context to answer field technician queries.',
      icon: Sparkles,
      color: 'text-accent-cyan bg-accent-cyan/10'
    }
  ];

  return (
    <PageTransition>
      <div className="relative space-y-6 min-h-screen">
        {/* Dynamic floating visual elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] right-[10%] w-80 h-80 rounded-full bg-accent-cyan/5 blur-[95px] animate-float-slow" />
          <div className="absolute bottom-[10%] left-[10%] w-72 h-72 rounded-full bg-primary-500/5 blur-[85px] animate-float-medium" />
        </div>

        <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Server className="w-8 h-8 text-accent-cyan" /> Interactive AI Pipeline Visualizer
            </h1>
            <p className="page-subtitle">Visual diagram representing the architecture flow from raw logs to RAG output</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsSimulating(!isSimulating)} className="text-xs">
              <RefreshCw className="w-4 h-4 mr-1 animate-spin-slow" />
              {isSimulating ? 'Pause Flow Simulation' : 'Resume Ingestion Flow'}
            </Button>
          </div>
        </div>

        {/* 2-Column interactive architecture grid */}
        <div className="z-10 relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel - Active step details */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-surface-900 border border-white/5 p-6 flex flex-col justify-between h-full min-h-[300px]">
              <div>
                <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest font-mono">
                  Active Pipeline Node
                </span>
                <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
                  {(() => {
                    const ActiveIcon = steps[activeStep].icon;
                    return <ActiveIcon className="w-6 h-6 text-accent-cyan" />;
                  })()}
                  {steps[activeStep].title}
                </h2>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed font-sans">
                  {steps[activeStep].desc}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 text-xs text-slate-500 font-mono">
                <p>Status: <span className="text-accent-green font-bold">● Simulating Live Data</span></p>
                <p className="mt-1">Pipeline Ingestion latency: <span className="text-white">185ms average</span></p>
              </div>
            </Card>
          </div>

          {/* Right panel - Flow charts */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-surface-900 border border-white/5 p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Unified Asset & Operations Pipeline Flow Diagram
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === activeStep;
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setActiveStep(index);
                        setIsSimulating(false);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 select-none ${
                        isActive 
                          ? 'bg-primary-500/10 border-primary-500 shadow-[0_0_20px_rgba(99,102,241,0.15)] scale-[1.02]' 
                          : 'bg-surface-850 border-white/5 hover:border-white/10 hover:scale-[1.01]'
                      }`}
                    >
                      <div className={`p-3 rounded-lg shrink-0 ${step.color}`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{step.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-2">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

        </div>

      </div>
    </PageTransition>
  );
}
