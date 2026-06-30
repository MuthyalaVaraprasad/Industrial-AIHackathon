import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, GitFork, CheckSquare, Eye } from 'lucide-react';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { cn } from '@/utils';

interface RCAReport {
  id: string;
  incident: string;
  assetTag: string;
  date: string;
  confidence: number;
  rootCause: string;
  contributingFactors: string[];
  evidence: { title: string; source: string }[];
  recommendations: string[];
}

export default function RCAPage() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['rca'],
    queryFn: modulesApi.getRCAReports,
  });

  useEffect(() => {
    if (data && data.length > 0 && !selectedReportId) {
      setSelectedReportId(data[0].id);
    }
  }, [data, selectedReportId]);

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  const reports: RCAReport[] = data || [];
  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Root Cause Analysis</h1>
          <p className="page-subtitle">Failure investigation with evidence linking and cause detection</p>
        </div>

        {isLoading ? (
          <div className="skeleton h-96 rounded-2xl animate-pulse" />
        ) : (
          <>
            {/* Horizontal selection menu */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer',
                    selectedReportId === r.id
                      ? 'bg-primary-500/10 border-primary-500/30 text-primary-300'
                      : 'bg-surface-800/40 border-white/5 text-slate-400 hover:text-white'
                  )}
                >
                  {r.incident} ({r.assetTag})
                </button>
              ))}
            </div>

            {activeReport && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG Failure Tree Diagram - spans 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white flex items-center gap-1.5">
                        <GitFork className="w-5 h-5 text-accent-cyan" /> Interactive Failure Tree
                      </h2>
                      <Badge variant="info">Visual RCA Graph</Badge>
                    </div>

                    {/* SVG Canvas */}
                    <div className="w-full overflow-x-auto p-2 bg-surface-850 rounded-2xl border border-white/5">
                      <svg viewBox="0 0 760 260" className="w-full min-w-[700px] h-auto text-xs" style={{ background: 'transparent' }}>
                        {/* Glow filters for nodes */}
                        <defs>
                          <filter id="glow-red" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.4" />
                          </filter>
                          <filter id="glow-cyan" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22d3ee" floodOpacity="0.4" />
                          </filter>
                        </defs>

                        {/* Connecting Line paths */}
                        <g stroke="#334155" strokeWidth="2" fill="none">
                          {/* Incident to Contributing 1 */}
                          <path d="M 180 130 C 220 130, 210 65, 260 65" strokeDasharray="4 2" className="animate-[dash_2s_linear_infinite]" />
                          {/* Incident to Contributing 2 */}
                          <path d="M 180 130 C 220 130, 210 195, 260 195" strokeDasharray="4 2" />
                          {/* Contributing 1 to Root Cause */}
                          <path d="M 420 65 C 460 65, 470 130, 520 130" stroke="#ef4444" />
                          {/* Contributing 2 to Root Cause */}
                          <path d="M 420 195 C 460 195, 470 130, 520 130" stroke="#ef4444" />
                        </g>

                        {/* NODE 1: Incident node */}
                        <g transform="translate(20, 95)" filter="url(#glow-cyan)">
                          <rect width="160" height="70" rx="12" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
                          <text x="15" y="28" fill="#94a3b8" fontSize="9" fontWeight="600" letterSpacing="0.5">PRIMARY FAILURE</text>
                          <text x="15" y="46" fill="#ffffff" fontSize="11" fontWeight="700">
                            {activeReport.incident.length > 20 ? activeReport.incident.slice(0, 18) + '...' : activeReport.incident}
                          </text>
                        </g>

                        {/* NODE 2: Contributing Factor A */}
                        <g transform="translate(260, 30)">
                          <rect width="160" height="70" rx="12" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                          <text x="15" y="28" fill="#94a3b8" fontSize="9" fontWeight="600">CONTRIBUTING ACTOR</text>
                          <text x="15" y="46" fill="#f8fafc" fontSize="10" fontWeight="600">
                            {activeReport.contributingFactors[0] ? activeReport.contributingFactors[0].slice(0, 22) + '...' : 'System Tolerances'}
                          </text>
                        </g>

                        {/* NODE 3: Contributing Factor B */}
                        <g transform="translate(260, 160)">
                          <rect width="160" height="70" rx="12" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                          <text x="15" y="28" fill="#94a3b8" fontSize="9" fontWeight="600">CONTRIBUTING ACTOR</text>
                          <text x="15" y="46" fill="#f8fafc" fontSize="10" fontWeight="600">
                            {activeReport.contributingFactors[1] ? activeReport.contributingFactors[1].slice(0, 22) + '...' : 'Operating Stress'}
                          </text>
                        </g>

                        {/* NODE 4: Root Cause Node (Red) */}
                        <g transform="translate(520, 95)" filter="url(#glow-red)">
                          <rect width="220" height="70" rx="12" fill="#1e1b4b" stroke="#ef4444" strokeWidth="1.8" />
                          <text x="15" y="28" fill="#fca5a5" fontSize="9" fontWeight="700" letterSpacing="0.5">ROOT CAUSE IDENTIFIED</text>
                          <text x="15" y="46" fill="#ffffff" fontSize="11" fontWeight="700">
                            {activeReport.rootCause.length > 28 ? activeReport.rootCause.slice(0, 26) + '...' : activeReport.rootCause}
                          </text>
                        </g>
                      </svg>
                    </div>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckSquare className="w-5 h-5 text-accent-green" />
                      <h2 className="text-lg font-semibold text-white">Recommended Preventative Actions</h2>
                    </div>
                    <ul className="space-y-3">
                      {activeReport.recommendations.map((r, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5 p-3 rounded-xl bg-surface-850 border border-white/5 hover:bg-surface-800 transition-colors">
                          <span className="w-5 h-5 rounded-lg bg-accent-green/10 flex items-center justify-center text-accent-green font-bold shrink-0 text-xs">✓</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                {/* Right Column: Evidence & Report Details */}
                <div className="lg:col-span-1 space-y-6">
                  {/* RCA Overview Card */}
                  <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Investigation Details</h2>
                    <div className="space-y-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-surface-850 border border-white/5 space-y-2.5">
                        <div className="flex justify-between"><span className="text-slate-500">Asset Tag</span><span className="text-white font-mono">{activeReport.assetTag}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Date Logged</span><span className="text-white">{activeReport.date}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500">AI Confidence</span><Badge variant="success">{activeReport.confidence}%</Badge></div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 font-semibold block">Full Root Cause Summary:</span>
                        <p className="text-slate-300 leading-relaxed p-3 bg-surface-850 rounded-xl border border-white/5 font-medium leading-5">
                          {activeReport.rootCause}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Linked Evidence Files */}
                  <Card>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-primary-400" />
                      <h2 className="text-lg font-semibold text-white">Linked Evidence Logs</h2>
                    </div>
                    <div className="space-y-2">
                      {activeReport.evidence.map((e, i) => (
                        <div key={i} className="p-3 rounded-xl bg-surface-850 border border-white/5 flex items-center justify-between text-xs hover:border-primary-500/20 transition-all">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-white truncate">{e.title}</p>
                            <p className="text-slate-500 text-[10px] mt-0.5">{e.source}</p>
                          </div>
                          <Eye className="w-4 h-4 text-slate-500 hover:text-white shrink-0 cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
