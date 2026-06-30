import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wrench, AlertTriangle, Clock, DollarSign, Activity } from 'lucide-react';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/common/StatCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Loading';
import { cn } from '@/utils';

const riskBadge = { high: 'danger', medium: 'warning', low: 'success' } as const;

export default function MaintenancePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['maintenance'],
    queryFn: modulesApi.getMaintenance,
  });

  useEffect(() => {
    if (data && data.assets.length > 0 && !selectedId) {
      setSelectedId(data.assets[0].id);
    }
  }, [data, selectedId]);

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  const assets = data?.assets || [];
  const highRisk = assets.filter((a) => a.riskLevel === 'high').length ?? 0;
  const activeAsset = assets.find((a) => a.id === selectedId) || assets[0];

  // Helper to enrich mock assets with cost, downtime, and timeframe parameters
  const getAssetDetails = (asset: typeof activeAsset) => {
    if (!asset) return { cost: 0, downtime: 0, timeframe: 'Unknown' };
    const cost = Math.round(asset.failureRisk * 450 + 5000);
    const downtime = Math.round(asset.failureRisk * 0.2 + 2);
    const days = Math.round((100 - asset.failureRisk) * 0.4 + 2);
    return {
      cost: cost.toLocaleString(),
      downtime,
      timeframe: `${days} Days`,
    };
  };

  const activeDetails = getAssetDetails(activeAsset);

  // Generate Risk probability timeline over next 30 days
  const getTimelineData = (asset: typeof activeAsset) => {
    if (!asset) return [];
    const baseRisk = asset.failureRisk;
    return [
      { name: 'Day 0', risk: baseRisk },
      { name: 'Day 5', risk: Math.min(99, Math.round(baseRisk * 1.05)) },
      { name: 'Day 10', risk: Math.min(99, Math.round(baseRisk * 1.12)) },
      { name: 'Day 15', risk: Math.min(99, Math.round(baseRisk * 1.25)) },
      { name: 'Day 20', risk: Math.min(99, Math.round(baseRisk * 1.38)) },
      { name: 'Day 25', risk: Math.min(99, Math.round(baseRisk * 1.55)) },
      { name: 'Day 30', risk: Math.min(99, Math.round(baseRisk * 1.8)) },
    ];
  };

  const timelineData = getTimelineData(activeAsset);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Predictive Maintenance</h1>
          <p className="page-subtitle">AI-driven asset health scoring and failure risk prediction</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="High Risk Assets" value={highRisk} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
              <StatCard label="Total Monitored" value={assets.length} icon={<Wrench className="w-5 h-5" />} color="cyan" />
              <StatCard label="Avg Health Score" value={Math.round(assets.reduce((s, a) => s + a.healthScore, 0) / assets.length)} suffix="%" icon={<Wrench className="w-5 h-5" />} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Risk Donut Chart */}
              <div className="space-y-6 lg:col-span-1">
                <Card>
                  <h2 className="text-lg font-semibold text-white mb-4">Risk Distribution</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={data.distribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                        {data.distribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {data.distribution.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name} ({d.value})
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Selected Asset Details & Action Card */}
                {activeAsset && (
                  <Card className="border-l-4 border-primary-500">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{activeAsset.tag} Status</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{activeAsset.name}</p>
                      </div>
                      <Badge variant={riskBadge[activeAsset.riskLevel]}>{activeAsset.riskLevel} risk</Badge>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-300">
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3.5 h-3.5 text-accent-cyan" /> Time to Failure</span>
                        <span className="font-semibold text-white text-sm">{activeDetails.timeframe}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="flex items-center gap-1 text-slate-500"><DollarSign className="w-3.5 h-3.5 text-accent-green" /> Repair Cost Est.</span>
                        <span className="font-semibold text-white">${activeDetails.cost}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="flex items-center gap-1 text-slate-500"><Activity className="w-3.5 h-3.5 text-accent-red" /> Downtime Impact</span>
                        <span className="font-semibold text-white">{activeDetails.downtime} Hours</span>
                      </div>
                      <div className="pt-1">
                        <span className="text-slate-500 block mb-1">AI Action Plan:</span>
                        <p className="text-slate-400 font-medium leading-relaxed leading-5">
                          {activeAsset.recommendation}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Column: Asset List & Risk Timeline */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <h2 className="text-lg font-semibold text-white mb-4">Top Monitored Assets</h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                    {assets.sort((a, b) => b.failureRisk - a.failureRisk).map((asset) => {
                      const details = getAssetDetails(asset);
                      return (
                        <div
                          key={asset.id}
                          onClick={() => setSelectedId(asset.id)}
                          className={cn(
                            'p-4 rounded-xl transition-all cursor-pointer border',
                            selectedId === asset.id
                              ? 'bg-primary-500/10 border-primary-500/30'
                              : 'bg-surface-800/40 border-white/5 hover:bg-surface-800/70'
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-semibold text-white">{asset.tag}</span>
                              <span className="text-xs text-slate-500 ml-2">{asset.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500">TTL: {details.timeframe}</span>
                              <Badge variant={riskBadge[asset.riskLevel]}>{asset.riskLevel} risk</Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-slate-500">Health Score</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-surface-600 overflow-hidden">
                                  <div className={cn('h-full rounded-full', asset.healthScore > 80 ? 'bg-accent-green' : asset.healthScore > 60 ? 'bg-accent-amber' : 'bg-accent-red')} style={{ width: `${asset.healthScore}%` }} />
                                </div>
                                <span className="text-xs text-white">{asset.healthScore}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500">Failure Risk</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-surface-600 overflow-hidden">
                                  <div className="h-full rounded-full bg-accent-red" style={{ width: `${asset.failureRisk}%` }} />
                                </div>
                                <span className="text-xs text-accent-red">{asset.failureRisk}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Risk Projection Timeline Chart */}
                {activeAsset && (
                  <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">
                      {activeAsset.tag} — 30-Day Failure Risk Projection
                    </h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" />
                        <Tooltip contentStyle={{ background: '#151d35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                        <Line type="monotone" dataKey="risk" name="Failure Risk Probability" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444' }} />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      Warning: Overdue service causes an exponential increase in physical wear coefficients.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
