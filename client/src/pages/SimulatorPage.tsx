import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sliders, AlertTriangle, DollarSign, Clock, Download, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { SimulationResult } from '@/types';

interface HistoricalRun {
  id: string;
  name: string;
  delay: number;
  condition: number;
  riskMult: number;
  result: SimulationResult;
  timestamp: string;
}

const MOCK_HISTORY: HistoricalRun[] = [
  {
    id: 'run-1',
    name: 'P-101 Emergency Delay Scenario',
    delay: 45,
    condition: 40,
    riskMult: 80,
    timestamp: '2026-06-29 14:15',
    result: {
      predictedRisk: 92,
      estimatedCost: 35000,
      estimatedDowntime: 24,
      recommendation: 'Immediate shut down required. Mechanical seals are operating outside safety parameters.'
    }
  },
  {
    id: 'run-2',
    name: 'Standard Separator Inspection Delay',
    delay: 14,
    condition: 75,
    riskMult: 30,
    timestamp: '2026-06-28 09:30',
    result: {
      predictedRisk: 42,
      estimatedCost: 8500,
      estimatedDowntime: 6,
      recommendation: 'Plan maintenance during the next scheduled plant turnaround loop.'
    }
  }
];

export default function SimulatorPage() {
  const [delay, setDelay] = useState(14);
  const [condition, setCondition] = useState(65);
  const [riskMult, setRiskMult] = useState(50);
  const [result, setResult] = useState<SimulationResult | null>(null);
  
  // Simulation history tracking state
  const [history, setHistory] = useState<HistoricalRun[]>(MOCK_HISTORY);

  const simMutation = useMutation({
    mutationFn: () => modulesApi.runSimulation({
      maintenanceDelayDays: delay,
      assetCondition: condition,
      riskMultiplier: riskMult,
    }),
    onSuccess: (data) => {
      setResult(data);
      // Log to history tracker
      const newRun: HistoricalRun = {
        id: `run-${Date.now()}`,
        name: `Custom Simulation Run (${delay}d delay)`,
        delay,
        condition,
        riskMult,
        result: data,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
      setHistory((prev) => [newRun, ...prev]);
    },
  });

  const handleExportSimulation = () => {
    if (!result) return;
    const exportData = {
      parameters: {
        maintenanceDelayDays: delay,
        assetConditionPercent: condition,
        riskMultiplierPercent: riskMult,
      },
      results: result,
      exportedAt: new Date().toISOString()
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `simulation_report_${delay}days.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoadHistory = (run: HistoricalRun) => {
    setDelay(run.delay);
    setCondition(run.condition);
    setRiskMult(run.riskMult);
    setResult(run.result);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="page-title">AI Impact Simulator</h1>
          <p className="page-subtitle">What-if analysis for maintenance decisions and risk parameters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Sliders and Trigger (2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary-400" /> Input Parameters
                </h2>
                <Badge variant="info">AI Predictor</Badge>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <label className="text-slate-300">Delay Maintenance By</label>
                    <span className="text-primary-400 font-semibold">{delay} days</span>
                  </div>
                  <input type="range" min={0} max={90} value={delay} onChange={(e) => setDelay(+e.target.value)} className="w-full accent-primary-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <label className="text-slate-300">Asset Condition Index</label>
                    <span className="text-accent-green font-semibold">{condition}%</span>
                  </div>
                  <input type="range" min={10} max={100} value={condition} onChange={(e) => setCondition(+e.target.value)} className="w-full accent-accent-green" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <label className="text-slate-300">System Risk Multiplier</label>
                    <span className="text-accent-amber font-semibold">{riskMult}%</span>
                  </div>
                  <input type="range" min={10} max={100} value={riskMult} onChange={(e) => setRiskMult(+e.target.value)} className="w-full accent-accent-amber" />
                </div>
              </div>

              <Button onClick={() => simMutation.mutate()} loading={simMutation.isPending} className="w-full mt-8">
                Run AI Impact Simulation
              </Button>
            </Card>

            {/* Results Display */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="text-center p-4 border-b-2 border-accent-red">
                    <AlertTriangle className="w-5 h-5 text-accent-red mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{result.predictedRisk}%</p>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Predicted Failure Risk</p>
                  </Card>
                  <Card className="text-center p-4 border-b-2 border-accent-amber">
                    <DollarSign className="w-5 h-5 text-accent-amber mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">${result.estimatedCost.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Est. Cost Impact</p>
                  </Card>
                  <Card className="text-center p-4 border-b-2 border-accent-cyan">
                    <Clock className="w-5 h-5 text-accent-cyan mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{result.estimatedDowntime} Hours</p>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Est. Downtime</p>
                  </Card>
                </div>

                <Card>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 border-b border-white/5 pb-2">
                    <h3 className="font-semibold text-white text-sm">AI Mitigation Plan</h3>
                    <Button variant="ghost" size="sm" onClick={handleExportSimulation} className="text-xs font-semibold text-primary-400">
                      <Download className="w-3.5 h-3.5 mr-1" /> Export Simulation Report
                    </Button>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{result.recommendation}</p>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column: History Tracker (1 column on large screens) */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col overflow-hidden" padding="none">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-1.5"><History className="w-4 h-4 text-slate-500" /> Scenario History</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">{history.length} Runs</span>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
                {history.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => handleLoadHistory(run)}
                    className="p-3 rounded-xl bg-surface-850 hover:bg-surface-800 transition-all border border-white/5 cursor-pointer text-xs space-y-2 group"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-white group-hover:text-primary-300 transition-colors truncate max-w-[140px]">{run.name}</h4>
                      <span className="text-[9px] text-slate-500 shrink-0">{run.timestamp}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400 border-t border-white/5 pt-2">
                      <div>
                        <span className="block text-slate-500">Delay</span>
                        <span className="font-semibold text-white">{run.delay}d</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Risk</span>
                        <span className="font-semibold text-accent-red">{run.result.predictedRisk}%</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Cost</span>
                        <span className="font-semibold text-accent-amber">${(run.result.estimatedCost/1000).toFixed(1)}k</span>
                      </div>
                    </div>
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
