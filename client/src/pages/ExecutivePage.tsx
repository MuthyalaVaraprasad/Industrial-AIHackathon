import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, TrendingUp, TrendingDown, Sparkles, Clock, DollarSign,
  AlertTriangle, CheckCircle, Download, Info
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Loading';
import { cn } from '@/utils';

interface DecisionRecommendation {
  asset: string;
  maintenance: string;
  risk: string;
  gap: string;
  action: string;
  impact: string;
  downtime: string;
  cost: string;
  priority: 'critical' | 'high' | 'medium';
  confidence: number;
}

const PROACTIVE_RECOMMENDATIONS: DecisionRecommendation[] = [
  {
    asset: 'Centrifugal Water Pump P-101',
    maintenance: 'Mechanical Seal Replacement & Alignment Correction',
    risk: '92% probability of mechanical seal seizure within 12 days',
    gap: 'ISO 9001 quality calibration records outstanding',
    action: 'Execute realignments on Unit 4 bearings and swap current mechanical seal with Type-B silicon carbide seal.',
    impact: 'Prevents 24 hours of line shutdown, saving an estimated $35,000 in cumulative downtime penalties.',
    downtime: '4 Hours (Scheduled)',
    cost: '$8,500',
    priority: 'critical',
    confidence: 96
  },
  {
    asset: 'Control Pressure Valve V-203',
    maintenance: 'Actuator Diaphragm Swap & Gland Tightening',
    risk: 'Gas pressure loop venting leaks detected via sensor delta',
    gap: 'OSHA standard 1910.119 process safety log overdue',
    action: 'Tighten packing gland sleeves and replace worn pneumatic actuator rubber diaphragm.',
    impact: 'Ensures environmental emissions safety and stabilizes separator fluid levels.',
    downtime: '2 Hours (Scheduled)',
    cost: '$3,200',
    priority: 'high',
    confidence: 91
  },
  {
    asset: 'Shell & Tube Heat Exchanger HX-301',
    maintenance: 'Tube Bundle Descaling & Wall Integrity Scan',
    risk: 'Heat transfer coefficient reduction due to thermal scaling',
    gap: 'ASME Boiler Code Section VIII wall check outstanding',
    action: 'Flush shell with sulfamic acid cleaner and execute ultrasonic thickness test sweep.',
    impact: 'Recovers 12.5% cooling loop efficiency across product streams.',
    downtime: '8 Hours (Planned)',
    cost: '$12,000',
    priority: 'medium',
    confidence: 88
  }
];

const priorityVariant = {
  critical: 'danger',
  high: 'warning',
  medium: 'info'
} as const;

export default function ExecutivePage() {
  const [activeTab, setActiveTab] = useState<'financials' | 'summary' | 'decisions'>('financials');
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['executive'],
    queryFn: modulesApi.getExecutive,
  });

  // Mock PDF Exporter
  const handleExportPDF = () => {
    setPdfGenerating(true);
    setTimeout(() => {
      setPdfGenerating(false);
      
      const docContent = `
=========================================
      INDUSTRIA AI 2.0 - EXECUTIVE REPORT
=========================================
Date Logged: ${new Date().toLocaleDateString()}
Report Type: AI Executive Summary & Operations Report

Operational Overview:
Overall plant reliability is stable. Centrifugal Pump P-101 mechanical
wear remains the primary threat vector. Compliance metrics are compliant
with ISO standards.

Key Metrics:
- Total Ingested Documents: 144
- Assets Discovered & Ledgered: 85
- Plant Compliance Index: 92%
- High Risk Asset Count: 4
- Maintenance Alerts Logged: 12
- Critical Incidents Registered: 2

Mitigation Recommendation:
Authorize immediate schedule check for Realignment on Pump P-101.
=========================================
`;

      const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `executive_operations_summary.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, 1500);
  };

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-accent-cyan" /> Executive Decision Center
            </h1>
            <p className="page-subtitle">Business impact KPIs, downtime risk, and cost analysis</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('financials')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                activeTab === 'financials'
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-300'
                  : 'bg-surface-800 border-white/5 text-slate-400 hover:text-white'
              )}
            >
              Financials & Charts
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                activeTab === 'summary'
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-300'
                  : 'bg-surface-800 border-white/5 text-slate-400 hover:text-white'
              )}
            >
              AI Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('decisions')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                activeTab === 'decisions'
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-300'
                  : 'bg-surface-800 border-white/5 text-slate-400 hover:text-white'
              )}
            >
              AI Decision Assistant
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : data && (
          <>
            {/* TAB 1: Financials & Charts */}
            {activeTab === 'financials' && (
              <div className="space-y-6 animate-fade-in">
                {/* KPIs Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {data.kpis.map((kpi) => (
                    <Card key={kpi.label} hover>
                      <div className="flex items-start justify-between mb-2">
                        <BarChart3 className="w-5 h-5 text-primary-400" />
                        <span className={cn('text-xs font-semibold flex items-center gap-0.5', kpi.positive ? 'text-accent-green' : 'text-accent-red')}>
                          {kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {kpi.positive ? '+' : ''}{kpi.change}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{kpi.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                    </Card>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Downtime Trend (Hours)</h2>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={data.downtimeTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip contentStyle={{ background: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                        <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                  <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Cost Impact ($K)</h2>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={data.costImpact}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip contentStyle={{ background: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                        <Bar dataKey="cost" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 2: AI Executive Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-6 animate-fade-in">
                {/* PDF Export Header */}
                <div className="flex justify-between items-center bg-surface-850 p-4 rounded-2xl border border-white/5">
                  <div>
                    <h3 className="font-semibold text-white text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" /> AI Operational Summary Report</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Auto-generated after document OCR and model ingestion analysis</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleExportPDF} loading={pdfGenerating}>
                    <Download className="w-4 h-4 mr-1" /> Export Executive Summary (PDF)
                  </Button>
                </div>

                {/* Narrative Overview Card */}
                <Card className="border-l-4 border-primary-500 p-6 space-y-3">
                  <h3 className="font-bold text-white text-base">RAG Plant Summary Narrative</h3>
                  <p className="text-slate-300 text-sm leading-relaxed leading-6 font-medium">
                    Plant operations are currently stable with a composite safety index of 92%. Gemini AI models have ingested 144 design drawings and technical specifications, identifying 85 unique equipment assets. 
                    Maintenance pipelines indicate 12 active alarms, with Pump P-101 seal fatigue presenting the highest likelihood of immediate production loop failure. Recommended realignment actions are scheduled to prevent costly downtime.
                  </p>
                </Card>

                {/* Summary KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Ingested Documents', val: 144, color: 'text-accent-cyan' },
                    { label: 'Discovered Assets', val: 85, color: 'text-accent-green' },
                    { label: 'Plant Compliance Score', val: '92%', color: 'text-primary-400' },
                    { label: 'High Risk Assets', val: 4, color: 'text-accent-red' },
                    { label: 'Maintenance Alerts', val: 12, color: 'text-accent-amber' },
                    { label: 'Critical Incidents', val: 2, color: 'text-accent-red/90' }
                  ].map((summaryCard) => (
                    <Card key={summaryCard.label} padding="sm" className="text-center space-y-1">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{summaryCard.label}</p>
                      <p className={cn('text-2xl font-black mt-1', summaryCard.color)}>{summaryCard.val}</p>
                    </Card>
                  ))}
                </div>

                {/* AI Recommendations */}
                <Card>
                  <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-accent-green" /> Immediate Executive Recommendations</h3>
                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="p-3.5 rounded-xl bg-surface-850 border border-white/5 space-y-1 leading-5">
                      <p className="font-semibold text-white flex items-center gap-2"><Badge variant="danger">Critical</Badge> Pump P-101 Alignment Swap</p>
                      <p className="text-slate-400 mt-0.5">Recalibrate radial tolerances before thermal expansion cycles seize internal seals.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surface-850 border border-white/5 space-y-1 leading-5">
                      <p className="font-semibold text-white flex items-center gap-2"><Badge variant="warning">High</Badge> Separator V-203 OSHA Inspection</p>
                      <p className="text-slate-400 mt-0.5">Archive pressure safety valves validation logs to restore local compliance ratings.</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* TAB 3: AI Decision Assistant */}
            {activeTab === 'decisions' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-surface-850 p-4 rounded-2xl border border-white/5">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-accent-amber" /> Proactive AI Decision Recommendations</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Continuous background monitoring suggests the following high-impact mitigation steps:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PROACTIVE_RECOMMENDATIONS.map((rec, i) => (
                    <Card key={i} className="flex flex-col justify-between border-t-4 border-primary-500 space-y-4">
                      <div className="space-y-2">
                        {/* Title & Priority Badge */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-sm">{rec.asset}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{rec.maintenance}</p>
                          </div>
                          <Badge variant={priorityVariant[rec.priority]}>{rec.priority}</Badge>
                        </div>

                        {/* Diagnostics Risk & Gaps */}
                        <div className="p-3 bg-surface-850 border border-white/5 rounded-xl space-y-2 text-xs">
                          <p className="text-accent-red flex items-start gap-1"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span className="font-medium">{rec.risk}</span></p>
                          <p className="text-slate-400 flex items-start gap-1"><Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>Gap: {rec.gap}</span></p>
                        </div>

                        {/* Recommended action and Business Impact */}
                        <div className="text-xs space-y-2 pt-1.5">
                          <p className="text-slate-300 font-semibold">Recommended Mitigations:</p>
                          <p className="text-slate-400 leading-relaxed leading-5">{rec.action}</p>

                          <p className="text-accent-green font-semibold mt-2">Business ROI & Impact:</p>
                          <p className="text-slate-400 leading-relaxed leading-5">{rec.impact}</p>
                        </div>
                      </div>

                      {/* Downtime & Cost Estimates footer */}
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-3 border-t border-white/5">
                        <div>
                          <span className="block text-slate-500 font-bold">EST. DOWNTIME</span>
                          <span className="font-semibold text-white flex items-center gap-0.5"><Clock className="w-3 h-3 text-accent-cyan" /> {rec.downtime}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 font-bold">EST. COST</span>
                          <span className="font-semibold text-white flex items-center gap-0.5"><DollarSign className="w-3 h-3 text-accent-green" /> {rec.cost}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500 font-bold">CONFIDENCE</span>
                          <span className="font-semibold text-accent-green">{rec.confidence}%</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
