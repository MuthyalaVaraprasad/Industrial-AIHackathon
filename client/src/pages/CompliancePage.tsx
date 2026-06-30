import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Shield, AlertCircle, CheckCircle, Clock, Calendar, X, ChevronRight, BookOpen } from 'lucide-react';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/common/StatCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Loading';
import { cn } from '@/utils';

const statusVariant = { compliant: 'success', partial: 'warning', 'non-compliant': 'danger' } as const;

interface StandardItem {
  id: string;
  standard: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  score: number;
  lastAudit: string;
  missingReports: string[];
}

export default function CompliancePage() {
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['compliance'],
    queryFn: modulesApi.getCompliance,
  });

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  const items: StandardItem[] = data?.items || [];
  const selectedStandard = items.find((item) => item.id === selectedStandardId);

  const handleOpenGapAnalysis = (id: string) => {
    setSelectedStandardId(id);
    setDrawerOpen(true);
  };

  // Helper to enrich standard details for Gap Analysis
  const getGapAnalysisDetails = (standard: StandardItem | undefined) => {
    if (!standard) return { gaps: [], remediation: '', hours: 0, severity: 'Low' };
    
    // Custom mock details
    switch (standard.id) {
      case 'iso-9001':
        return {
          gaps: ['Vibration validation records for Unit 4 pumps not indexed', 'Daily pressure logs calibration certificate missing'],
          remediation: 'Initiate standard calibration schedule and ingest daily logs through Document Center.',
          hours: 18,
          severity: 'Medium'
        };
      case 'iso-14001':
        return {
          gaps: ['Waste drainage inspection certificates missing for Q2 2026', 'Environmental wear telemetry logs not verified'],
          remediation: 'Deploy QR scanning check-ins for drain valves and archive emissions logs.',
          hours: 32,
          severity: 'High'
        };
      default:
        return {
          gaps: ['General safety check logs not signed by certified auditor', 'Emergency valve release testing schedule expired'],
          remediation: 'Schedule valve release drill with plant lead technician and update compliance ledger.',
          hours: 8,
          severity: 'Low'
        };
    }
  };

  const gapDetails = getGapAnalysisDetails(selectedStandard);

  // Compliance timelines mock
  const complianceTimeline = [
    { date: 'July 15, 2026', event: 'ISO 9001 Recertification Audit', status: 'Upcoming', type: 'external' },
    { date: 'August 02, 2026', event: 'OSHA Safety Review Check', status: 'Scheduled', type: 'regulatory' },
    { date: 'September 10, 2026', event: 'Internal Environmental Compliance Audit', status: 'Planned', type: 'internal' },
    { date: 'June 20, 2026', event: 'AnnualSeparator V-203 Inspections', status: 'Completed', type: 'completed' },
  ];

  const makeGaugeData = (score: number) => [
    { name: 'Compliant', value: score, color: '#10b981' },
    { name: 'Pending', value: 100 - score, color: '#1e293b' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Compliance Dashboard</h1>
          <p className="page-subtitle">Regulatory compliance tracking and audit readiness</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : data && (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Compliance Score" value={data.overallScore} suffix="%" icon={<Shield className="w-5 h-5" />} color="green" />
              <StatCard label="Audit Readiness" value={data.auditReadiness} suffix="%" icon={<CheckCircle className="w-5 h-5" />} color="cyan" />
              <StatCard label="Violations" value={data.violations} icon={<AlertCircle className="w-5 h-5" />} color="red" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative overflow-hidden">
              
              {/* Left Side: Gauges and Timelines */}
              <div className="space-y-6 lg:col-span-1">
                {/* Visual Dials / Half Donut Gauges */}
                <Card>
                  <h2 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-1.5"><Shield className="w-4 h-4 text-accent-green" /> Compliance Health Dial</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center relative">
                      <div className="h-28 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={100}>
                          <PieChart>
                            <Pie
                              data={makeGaugeData(data.overallScore)}
                              cx="50%"
                              cy="100%"
                              startAngle={180}
                              endAngle={0}
                              innerRadius={38}
                              outerRadius={52}
                              dataKey="value"
                            >
                              <Cell fill="#10b981" />
                              <Cell fill="#1a2340" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="absolute bottom-1 left-0 right-0">
                        <p className="text-base font-bold text-white">{data.overallScore}%</p>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Overall Index</p>
                      </div>
                    </div>

                    <div className="text-center relative">
                      <div className="h-28 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={100}>
                          <PieChart>
                            <Pie
                              data={makeGaugeData(data.auditReadiness)}
                              cx="50%"
                              cy="100%"
                              startAngle={180}
                              endAngle={0}
                              innerRadius={38}
                              outerRadius={52}
                              dataKey="value"
                            >
                              <Cell fill="#22d3ee" />
                              <Cell fill="#1a2340" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="absolute bottom-1 left-0 right-0">
                        <p className="text-base font-bold text-white">{data.auditReadiness}%</p>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Audit Readiness</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Compliance Timeline */}
                <Card>
                  <h2 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary-400" /> Compliance Timeline</h2>
                  <div className="space-y-4">
                    {complianceTimeline.map((item, idx) => (
                      <div key={idx} className="flex gap-3 text-xs">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            item.status === 'Completed' ? 'bg-accent-green' : item.status === 'Upcoming' ? 'bg-accent-cyan' : 'bg-surface-600'
                          )} />
                          {idx < complianceTimeline.length - 1 && <div className="w-0.5 h-10 bg-surface-700/60 my-0.5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.event}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{item.date} • {item.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Side: Standards Status Table */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <h2 className="text-lg font-semibold text-white mb-4">Standards Status</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500 border-b border-white/5">
                          <th className="pb-3 pr-4 font-medium">Standard</th>
                          <th className="pb-3 pr-4 font-medium">Status</th>
                          <th className="pb-3 pr-4 font-medium">Score</th>
                          <th className="pb-3 pr-4 font-medium">Last Audit</th>
                          <th className="pb-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-surface-800/10 transition-colors">
                            <td className="py-3.5 pr-4 text-white font-medium">{item.standard}</td>
                            <td className="py-3.5 pr-4">
                              <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                            </td>
                            <td className="py-3.5 pr-4 text-white font-semibold">{item.score}%</td>
                            <td className="py-3.5 pr-4 text-slate-400 text-xs">{item.lastAudit}</td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => handleOpenGapAnalysis(item.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-surface-750 hover:bg-primary-500/10 text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 ml-auto cursor-pointer border border-white/5"
                              >
                                Gap Analysis <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Recommendations */}
                <Card>
                  <h2 className="text-lg font-semibold text-white mb-4">System Recommendations</h2>
                  <ul className="space-y-2">
                    {data.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <AlertCircle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

            </div>

            {/* Sliding Gap Analysis Details Drawer */}
            <div className={cn(
              'fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-surface-800/95 backdrop-blur-xl border-l border-white/5 shadow-2xl transition-transform duration-300 transform flex flex-col',
              drawerOpen && selectedStandard ? 'translate-x-0' : 'translate-x-full'
            )}>
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent-cyan" />
                  <div>
                    <h3 className="font-semibold text-white text-sm">{selectedStandard?.standard}</h3>
                    <p className="text-[10px] text-slate-500">Gap Analysis & Remediations</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedStandard && gapDetails && (
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5 text-xs text-slate-300">
                  {/* Status Card */}
                  <div className="p-4 rounded-xl bg-surface-850 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Standard Score</span>
                      <span className="text-base font-bold text-white">{selectedStandard.score}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Risk Severity</span>
                      <Badge variant={gapDetails.severity === 'High' ? 'danger' : gapDetails.severity === 'Medium' ? 'warning' : 'success'}>
                        {gapDetails.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Remediation Effort</span>
                      <span className="text-white font-semibold flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-accent-cyan" /> ~{gapDetails.hours} Hours</span>
                    </div>
                  </div>

                  {/* Compliance Gaps List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-400 flex items-center gap-1"><AlertCircle className="w-4 h-4 text-accent-red" /> Identified Compliance Gaps</h4>
                    <div className="space-y-2">
                      {gapDetails.gaps.map((gap, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-surface-850 border-l-4 border-accent-red text-slate-300">
                          {gap}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Remediation Plan */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-400 flex items-center gap-1"><Shield className="w-4 h-4 text-accent-green" /> Remediation Action Plan</h4>
                    <p className="p-3 rounded-lg bg-surface-850 text-slate-400 leading-relaxed leading-5">
                      {gapDetails.remediation}
                    </p>
                  </div>

                  {/* Missing Documentation */}
                  {selectedStandard.missingReports.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-semibold text-slate-400 block">Missing Audit Files:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedStandard.missingReports.map((file, idx) => (
                          <Badge key={idx} variant="danger" className="text-[10px]">
                            {file}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
