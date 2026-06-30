import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  FileText, Box, Shield, AlertTriangle, Users, Wrench, Activity,
  CloudSun, Calendar, ArrowRight, HardDrive, Clock, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { dashboardApi, modulesApi } from '@/services/api';
import { useAuth } from '@/store/AuthContext';
import { PageTransition } from '@/components/ui/PageTransition';
import { StatCard } from '@/components/common/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';

const CHART_COLORS = {
  primary: '#6366f1',
  cyan: '#22d3ee',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

interface DashboardWidget {
  id: string;
  title: string;
  category: string;
  visible: boolean;
  pinned: boolean;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'ai_recommendations', title: 'AI Recommendation Center', category: 'Intelligence', visible: true, pinned: true },
  { id: 'health_distribution', title: 'Asset Health Distribution', category: 'Charts', visible: true, pinned: false },
  { id: 'maintenance_trends', title: 'Maintenance Trends', category: 'Charts', visible: true, pinned: false },
  { id: 'compliance_trends', title: 'Compliance Trends', category: 'Charts', visible: true, pinned: false },
  { id: 'failure_trends', title: 'Failure Trends', category: 'Charts', visible: true, pinned: false },
  { id: 'system_health', title: 'System Health Status', category: 'Infrastructure', visible: true, pinned: false },
  { id: 'recent_activities', title: 'Recent Activities Log', category: 'Infrastructure', visible: true, pinned: false },
  { id: 'todays_schedule', title: 'Today\'s Schedule Calendar', category: 'Infrastructure', visible: true, pinned: false },
  { id: 'activity_timeline', title: 'Operations Activity Timeline', category: 'Infrastructure', visible: true, pinned: false }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const statsQuery = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardApi.getStats });
  const activitiesQuery = useQuery({ queryKey: ['dashboard-activities'], queryFn: dashboardApi.getActivities });
  const assetHealthQuery = useQuery({ queryKey: ['asset-health'], queryFn: dashboardApi.getAssetHealth });
  const maintenanceQuery = useQuery({ queryKey: ['maintenance-trends'], queryFn: dashboardApi.getMaintenanceTrends });
  const complianceQuery = useQuery({ queryKey: ['compliance-trends'], queryFn: dashboardApi.getComplianceTrends });
  const failureQuery = useQuery({ queryKey: ['failure-trends'], queryFn: dashboardApi.getFailureTrends });
  const healthQuery = useQuery({ queryKey: ['health'], queryFn: modulesApi.getHealth });

  // Dashboard Layout Customization States
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const stored = localStorage.getItem('industria_dashboard_widgets_v2');
      return stored ? JSON.parse(stored) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const saveLayout = (updatedWidgets: DashboardWidget[]) => {
    setWidgets(updatedWidgets);
    localStorage.setItem('industria_dashboard_widgets_v2', JSON.stringify(updatedWidgets));
  };

  const moveWidget = (idx: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= widgets.length) return;
    const updated = [...widgets];
    const temp = updated[idx];
    updated[idx] = updated[nextIdx];
    updated[nextIdx] = temp;
    saveLayout(updated);
  };

  const toggleVisibility = (id: string) => {
    const updated = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    saveLayout(updated);
  };

  const togglePinned = (id: string) => {
    const updated = widgets.map(w => w.id === id ? { ...w, pinned: !w.pinned } : w);
    saveLayout(updated);
  };

  const resetLayout = () => {
    saveLayout(DEFAULT_WIDGETS);
  };

  const isLoading = statsQuery.isLoading;
  const hasError = statsQuery.isError;

  if (hasError) {
    return (
      <PageTransition>
        <ErrorState onRetry={() => statsQuery.refetch()} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;

  // Role-based custom operational messages
  const getRoleWelcomeMessage = () => {
    switch (user?.role) {
      case 'admin':
        return 'System health is 100% operational. Dynamic integrations, role mappings, and RAG configurations are active.';
      case 'manager':
        return 'Overall plant compliance rating is stable at 92%. Downtime risk is mitigated. Review monthly ROI metrics.';
      case 'engineer':
        return 'RAG pipeline indexed successfully. Graph database shows 24 active nodes. Ingest drawings for OCR mapping.';
      case 'technician':
        return '12 scheduled maintenance items overdue. High-priority seals and valves need calibration. Start scanner to log repairs.';
      case 'auditor':
        return 'ISO audit logs and compliance history updated. 4 inspection reports are pending signature details.';
      default:
        return 'Industria AI 2.0 asset operations dashboard active. Choose a quick action to get started.';
    }
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case 'ai_recommendations':
        return (
          <Card key={id} className="border border-accent-amber/20 bg-gradient-to-br from-accent-amber/5 to-transparent relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-amber" /> AI Recommendation Center
              </h2>
              <Badge variant="danger">Proactive Intel</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-surface-850/50 border border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">⚠️ High-Risk Asset Recommendation</span>
                    <Badge variant="danger">Critical</Badge>
                  </div>
                  <p className="text-slate-400">Centrifugal Pump P-101 has a predicted seal failure probability of <strong className="text-accent-red">87%</strong> within the next 7 days.</p>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>Est. Savings: <strong className="text-accent-green">$18,500</strong></span>
                    <span>Est. Downtime: <strong className="text-accent-red">4.5 Hrs</strong></span>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-surface-850/50 border border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">🔧 Suggested Inspections</span>
                    <Badge variant="warning">Medium</Badge>
                  </div>
                  <p className="text-slate-400">Schedule mechanical calibration on Compressor C-204 bearing assemblies to mitigate fatigue.</p>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>Priority: <strong>Medium</strong></span>
                    <span>Confidence: <strong>81%</strong></span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-surface-850/50 border border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">📋 Compliance Gaps Detected</span>
                    <Badge variant="danger">Audit Risk</Badge>
                  </div>
                  <p className="text-slate-400">OSHA lockout/tagout logs missing signature validations for Unit 3. Immediate remediation recommended.</p>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>Impact: <strong>High</strong></span>
                    <span>Ref: <strong>OSHA 1910.147</strong></span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-850/50 border border-white/5 space-y-2">
                  <span className="font-semibold text-white block mb-1">🔗 Related Diagnostic Reports</span>
                  <div className="flex gap-2">
                    <button onClick={() => navigate('/app/rca')} className="px-2.5 py-1.5 rounded bg-surface-800 hover:bg-surface-700 text-slate-300 hover:text-white cursor-pointer font-semibold text-[10px] transition-colors">RCA Report #42</button>
                    <button onClick={() => navigate('/app/reports')} className="px-2.5 py-1.5 rounded bg-surface-800 hover:bg-surface-700 text-slate-300 hover:text-white cursor-pointer font-semibold text-[10px] transition-colors">Maintenance Log Q1</button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      case 'health_distribution':
        return (
          <Card key={id}>
            <h2 className="text-lg font-semibold text-white mb-4">Asset Health Distribution</h2>
            {assetHealthQuery.isLoading ? (
              <div className="h-64 skeleton" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={assetHealthQuery.data}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="healthy" name="Healthy" stroke={CHART_COLORS.green} fill="url(#healthGrad)" />
                  <Area type="monotone" dataKey="atRisk" name="At Risk" stroke={CHART_COLORS.amber} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        );
      case 'maintenance_trends':
        return (
          <Card key={id}>
            <h2 className="text-lg font-semibold text-white mb-4">Maintenance Trends</h2>
            {maintenanceQuery.isLoading ? (
              <div className="h-64 skeleton" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={maintenanceQuery.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Bar dataKey="scheduled" name="Scheduled" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="overdue" name="Overdue" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        );
      case 'compliance_trends':
        return (
          <Card key={id}>
            <h2 className="text-lg font-semibold text-white mb-4">Compliance Trends</h2>
            {complianceQuery.isLoading ? (
              <div className="h-64 skeleton" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={complianceQuery.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[70, 100]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="score" name="Compliance %" stroke={CHART_COLORS.cyan} strokeWidth={2} dot={{ fill: CHART_COLORS.cyan }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        );
      case 'failure_trends':
        return (
          <Card key={id}>
            <h2 className="text-lg font-semibold text-white mb-4">Failure Trends</h2>
            {failureQuery.isLoading ? (
              <div className="h-64 skeleton" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={failureQuery.data}>
                  <defs>
                    <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.red} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.red} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="failures" name="Failures" stroke={CHART_COLORS.red} fill="url(#failGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        );
      case 'system_health':
        return (
          <Card key={id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-accent-green" /> System Health
              </h2>
              <Badge variant={healthQuery.data?.integrations.fullyIntegrated ? 'success' : 'warning'}>
                {healthQuery.data?.integrations.live ?? 0}/{healthQuery.data?.integrations.total ?? 5} Live
              </Badge>
            </div>
            
            {healthQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 skeleton" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {healthQuery.data?.services.map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-850/50 border border-white/5 text-xs">
                    <div>
                      <p className="font-semibold text-white">{svc.name}</p>
                      <p className="text-slate-500 mt-0.5">{svc.description}</p>
                    </div>
                    <Badge variant={svc.connected ? 'success' : svc.mode === 'demo' ? 'warning' : 'default'}>
                      {svc.mode}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      case 'recent_activities':
        return (
          <Card key={id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Activities</h2>
              <Activity className="w-5 h-5 text-slate-500" />
            </div>
            {activitiesQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 skeleton" />
                ))}
              </div>
            ) : activitiesQuery.data?.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No recent activities</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
                {activitiesQuery.data?.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-2.5 rounded-lg bg-surface-850/50 hover:bg-surface-800 transition-colors">
                    <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-primary-400" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-white">{activity.title}</p>
                        {activity.severity && (
                          <Badge variant={activity.severity === 'high' ? 'danger' : activity.severity === 'medium' ? 'warning' : 'info'} className="text-[9px] px-1 py-0">
                            {activity.severity}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{activity.description}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      case 'todays_schedule':
        return (
          <Card key={id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" /> Today\'s Schedule
              </h2>
              <span className="text-xs text-slate-500">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border-l-4 border-accent-red bg-surface-850/50 border-y border-r border-white/5">
                <div className="flex justify-between font-semibold text-white">
                  <span>Pump P-101 Calibration</span>
                  <span>10:00 AM</span>
                </div>
                <p className="text-slate-400 mt-1">Scheduled vibration testing & seal check</p>
                <p className="text-[10px] text-slate-500 mt-1">Technician: Marcus Vance</p>
              </div>

              <div className="p-3 rounded-lg border-l-4 border-accent-cyan bg-surface-850/50 border-y border-r border-white/5">
                <div className="flex justify-between font-semibold text-white">
                  <span>HSE Compliance Review</span>
                  <span>02:00 PM</span>
                </div>
                <p className="text-slate-400 mt-1">Standard ISO certification data auditing</p>
                <p className="text-[10px] text-slate-500 mt-1">Auditor: Elena Rostova</p>
              </div>
            </div>
          </Card>
        );
      case 'activity_timeline':
        return (
          <Card key={id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-cyan" /> Operations Activity Timeline
              </h2>
              <Badge variant="success">Updated Live</Badge>
            </div>
            
            <div className="relative pl-6 space-y-4 text-xs">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-surface-700/60" />
              
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-accent-green ring-4 ring-accent-green/20" />
                <p className="font-semibold text-white">Document Ingestion Completed</p>
                <p className="text-slate-400 mt-0.5">Pump P-101 Failure Report manual uploaded.</p>
                <span className="text-[10px] text-slate-500 mt-0.5 block">10m ago</span>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-accent-green ring-4 ring-accent-green/20" />
                <p className="font-semibold text-white">OCR Ingest In-Progress</p>
                <p className="text-slate-400 mt-0.5">Vessel drawings and specs processed.</p>
                <span className="text-[10px] text-slate-500 mt-0.5 block">8m ago</span>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary-500 ring-4 ring-primary-500/20 animate-pulse" />
                <p className="font-semibold text-white">RAG Entity Extraction</p>
                <p className="text-slate-400 mt-0.5">24 asset metadata attributes mapped to Neo4j.</p>
                <span className="text-[10px] text-slate-500 mt-0.5 block">5m ago</span>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-surface-600" />
                <p className="font-semibold text-slate-450">Knowledge Graph Node Generation</p>
                <p className="text-slate-500 mt-0.5">Pending database synchronization verification.</p>
              </div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  const pinnedWidgets = widgets.filter(w => w.visible && w.pinned);
  const normalWidgets = widgets.filter(w => w.visible && !w.pinned);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Welcome Banner Row */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-900/40 to-surface-800/80 backdrop-blur-xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 flex-1">
            <div className="space-y-1.5 relative z-10">
              <Badge variant="info" className="text-[10px] uppercase tracking-wider font-semibold">
                Live Operations Panel
              </Badge>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                Welcome back, {user?.displayName || 'Operator'}
              </h1>
              <p className="text-slate-300 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
                {getRoleWelcomeMessage()}
              </p>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-850 border border-white/5 self-start md:self-auto relative z-10">
              <CloudSun className="w-8 h-8 text-accent-cyan shrink-0" />
              <div className="text-xs">
                <p className="text-white font-semibold">Unit 4 Plant • Houston</p>
                <p className="text-slate-400 mt-0.5">84°F / Sunny • Air quality: Good</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCustomizerOpen(!customizerOpen)}
            className="px-4 py-3 rounded-xl bg-surface-800 border border-white/5 hover:bg-surface-700 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer transition-colors self-stretch md:self-auto justify-center"
          >
            ⚙️ Customize Dashboard
          </button>
        </div>

        {/* Customization Controls widget Panel */}
        {customizerOpen && (
          <Card className="border border-primary-500/25 bg-surface-850/90 backdrop-blur p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="font-semibold text-white text-xs flex items-center gap-1.5">🔧 Dashboard Layout Customizer</h3>
              <button onClick={resetLayout} className="text-[10px] text-accent-red hover:underline cursor-pointer">Reset to Default</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {widgets.map((widget, i) => (
                <div key={widget.id} className="p-3 rounded-lg bg-surface-800/40 border border-white/5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{widget.title}</p>
                    <p className="text-[10px] text-slate-500">{widget.category}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleVisibility(widget.id)}
                      className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${widget.visible ? 'bg-accent-green/20 text-accent-green' : 'bg-surface-700 text-slate-450'}`}
                    >
                      {widget.visible ? 'Show' : 'Hide'}
                    </button>
                    <button
                      onClick={() => togglePinned(widget.id)}
                      className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${widget.pinned ? 'bg-primary-500 text-white font-bold' : 'bg-surface-700 text-slate-450'}`}
                      title="Pin card to top"
                    >
                      📌
                    </button>
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveWidget(i, 'up')} disabled={i === 0} className="hover:text-white text-[9px] disabled:opacity-30 cursor-pointer">▲</button>
                      <button onClick={() => moveWidget(i, 'down')} disabled={i === widgets.length - 1} className="hover:text-white text-[9px] disabled:opacity-30 cursor-pointer">▼</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/app/documents')}
            className="group flex items-center justify-between p-4 rounded-xl bg-surface-800/40 hover:bg-primary-500/10 border border-white/5 hover:border-primary-500/20 text-left transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-primary-300">Upload Center</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">Bulk upload industrial PDFs</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
          </button>
          <button
            onClick={() => navigate('/app/knowledge-graph')}
            className="group flex items-center justify-between p-4 rounded-xl bg-surface-800/40 hover:bg-accent-green/10 border border-white/5 hover:border-accent-green/20 text-left transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-accent-green">Relationship Graph</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">View Neo4j visual mapping</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-accent-green group-hover:translate-x-1 transition-all" />
          </button>
          <button
            onClick={() => navigate('/app/qr-scanner')}
            className="group flex items-center justify-between p-4 rounded-xl bg-surface-800/40 hover:bg-accent-cyan/10 border border-white/5 hover:border-accent-cyan/20 text-left transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-accent-cyan">QR Scanner</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">Open camera barcode reader</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-accent-cyan group-hover:translate-x-1 transition-all" />
          </button>
          <button
            onClick={() => navigate('/app/copilot')}
            className="group flex items-center justify-between p-4 rounded-xl bg-surface-800/40 hover:bg-accent-amber/10 border border-white/5 hover:border-accent-amber/20 text-left transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-accent-amber">RAG Copilot</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">Prompt plant manuals database</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-accent-amber group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {/* Stats KPIs Row */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
            <StatCard label="Total Documents" value={stats.totalDocuments} icon={<FileText className="w-5 h-5" />} color="cyan" trend={{ value: 12, positive: true }} />
            <StatCard label="Assets" value={stats.totalAssets} icon={<Box className="w-5 h-5" />} color="green" trend={{ value: 3, positive: true }} />
            <StatCard label="Compliance Score" value={stats.complianceScore} suffix="%" icon={<Shield className="w-5 h-5" />} color="purple" trend={{ value: 2, positive: true }} />
            <StatCard label="Risk Alerts" value={stats.riskAlerts} icon={<AlertTriangle className="w-5 h-5" />} color="red" trend={{ value: 15, positive: false }} />
            <StatCard label="Active Users" value={stats.activeUsers} icon={<Users className="w-5 h-5" />} color="primary" />
            <StatCard
              label="Maintenance Overdue"
              value={stats.maintenanceStatus.overdue}
              icon={<Wrench className="w-5 h-5" />}
              color="amber"
              trend={{ value: 8, positive: false }}
            />
          </div>
        )}

        {/* Pinned Widgets Section (Grid layout) */}
        {pinnedWidgets.length > 0 && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">📌 Pinned Cards</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pinnedWidgets.map(widget => (
                <div key={widget.id} className="lg:col-span-2">
                  {renderWidget(widget.id)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Dashboard dynamic widgets ordered lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {normalWidgets.map(widget => (
            <div
              key={widget.id}
              className={
                widget.id === 'ai_recommendations' || widget.id === 'activity_timeline'
                  ? 'lg:col-span-2'
                  : 'col-span-1'
              }
            >
              {renderWidget(widget.id)}
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
