import { useState } from 'react';
import {
  TrendingUp, BarChart3, Shield, DollarSign, Download, Clock,
  Users, CheckCircle, FileSpreadsheet, Calendar, Scale, Globe, Mail,
  Activity, Sliders, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const ROI_SAVINGS_DATA = [
  { month: 'Jan', savings: 45000 },
  { month: 'Feb', savings: 52000 },
  { month: 'Mar', savings: 61000 },
  { month: 'Apr', savings: 58000 },
  { month: 'May', savings: 75000 },
  { month: 'Jun', savings: 89000 },
];

const DOWNTIME_DATA = [
  { month: 'Jan', hours: 42 },
  { month: 'Feb', hours: 38 },
  { month: 'Mar', hours: 29 },
  { month: 'Apr', hours: 31 },
  { month: 'May', hours: 22 },
  { month: 'Jun', hours: 14 },
];

const AI_USAGE_DEPT = [
  { name: 'Engineering', value: 45, color: '#6366f1' },
  { name: 'Maintenance', value: 30, color: '#10b981' },
  { name: 'HSE Audit', value: 15, color: '#22d3ee' },
  { name: 'Executive Operations', value: 10, color: '#a855f7' },
];

export default function IndustrialIntelligencePage() {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportSelected, setExportSelected] = useState({
    kpis: true,
    roi: true,
    downtime: true,
    compliance: false,
  });

  const [savingStatus, setSavingStatus] = useState<'idle' | 'exporting' | 'done'>('idle');

  // Feature 1: Date filters state
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-30');

  // Feature 5: Scheduler state
  const [emailTarget, setEmailTarget] = useState('operations-lead@plant.com');
  const [scheduleFreq, setScheduleFreq] = useState('weekly');
  const [isScheduled, setIsScheduled] = useState(false);

  // Feature 6: Calibration threshold state
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);

  // Feature 9: KPI Override Targets
  const [savingsTarget, setSavingsTarget] = useState(500000);
  const [downtimeTarget, setDowntimeTarget] = useState(10);

  // ROI Savings breakdown (Feature 2)
  const assetBreakdown = [
    { id: 'P-101', name: 'Centrifugal Pump P-101', category: 'Predictive', savings: '$120,000', reliability: '94%' },
    { id: 'HX-301', name: 'Heat Exchanger HX-301', category: 'Efficiency', savings: '$85,000', reliability: '89%' },
    { id: 'V-203', name: 'Separator Vessel V-203', category: 'Compliance', savings: '$45,000', reliability: '98%' }
  ];

  // Compliance checks history log (Feature 7)
  const auditLogs = [
    { id: 1, type: 'OSHA 1910', date: 'Jun 24, 2026', scope: 'Lockout/Tagout checks', result: 'Compliant' },
    { id: 2, type: 'ISO 50001', date: 'Jun 18, 2026', scope: 'Energy usage audits', result: 'Compliant' },
    { id: 3, type: 'HSE Fire', date: 'Jun 12, 2026', scope: 'Pressure valve certifications', result: 'Compliant' }
  ];

  const handleExport = () => {
    setSavingStatus('exporting');
    setTimeout(() => {
      setSavingStatus('done');
      // Simulate file download
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(exportSelected, null, 2)], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `industrial_intelligence_export.${exportFormat}`;
      document.body.appendChild(element);
      element.click();
      element.remove();
      setTimeout(() => setSavingStatus('idle'), 1500);
    }, 1200);
  };

  const handleSetupSchedule = () => {
    setIsScheduled(true);
    setTimeout(() => setIsScheduled(false), 2000);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Industrial Intelligence Center</h1>
            <p className="page-subtitle">Executive business analytics and ROI metrics dashboard</p>
          </div>
          
          {/* Feature 1: Date-Range filters */}
          <div className="flex flex-wrap items-center gap-2 bg-surface-850 p-2 rounded-xl border border-white/5 text-xs">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-white border-0 focus:ring-0 p-0 text-[10px] w-24"
            />
            <span className="text-slate-500 font-bold font-mono">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-white border-0 focus:ring-0 p-0 text-[10px] w-24"
            />
          </div>
        </div>

        {/* Executive KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total ROI Savings</p>
              <h3 className="text-xl font-extrabold text-white mt-1">$380,000</h3>
              <p className="text-[9px] text-accent-green font-semibold mt-0.5">Target: ${savingsTarget.toLocaleString()}</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Downtime Reduction</p>
              <h3 className="text-xl font-extrabold text-white mt-1">-66.7%</h3>
              <p className="text-[9px] text-slate-400 mt-0.5">Limit Target: {downtimeTarget}h/mo</p>
            </div>
          </Card>

          {/* Feature 3: Electricity Saved Metric */}
          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Power Saved (MW)</p>
              <h3 className="text-xl font-extrabold text-white mt-1">45.2 MW</h3>
              <p className="text-[9px] text-accent-cyan font-semibold mt-0.5">Motor optimizations efficiency</p>
            </div>
          </Card>

          {/* Feature 4: ESG Carbon Footprint Metric */}
          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ESG Carbon Offset</p>
              <h3 className="text-xl font-extrabold text-white mt-1">124 Tons</h3>
              <p className="text-[9px] text-slate-400 mt-0.5">CO2 emissions avoided</p>
            </div>
          </Card>
        </div>

        {/* Charts & Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Charts & Savings Breakdown list */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Savings line chart */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-4 border-b border-white/5 pb-2.5">
                <TrendingUp className="w-4 h-4 text-primary-400" /> ROI Cost Savings Trend ($)
              </h2>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ROI_SAVINGS_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }} />
                    <Line type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Downtime bar chart */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-4 border-b border-white/5 pb-2.5">
                <Clock className="w-4 h-4 text-accent-cyan" /> Monthly Downtime Reduction (Hours)
              </h2>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DOWNTIME_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)' }} />
                    <Bar dataKey="hours" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Feature 2: Detailed ROI Cost Savings Breakdown Table */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent-green" /> Detailed Asset Reliability & Savings Ledger
              </h3>
              <div className="overflow-x-auto scrollbar-thin text-xs">
                <table className="w-full text-left text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-2.5 px-3">Asset identifier</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Reliability Index</th>
                      <th className="py-2.5 px-3">Calculated Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {assetBreakdown.map((asset) => (
                      <tr key={asset.id} className="hover:bg-surface-850/40">
                        <td className="py-3 px-3 font-semibold text-white">{asset.name}</td>
                        <td className="py-3 px-3"><Badge variant="info">{asset.category}</Badge></td>
                        <td className="py-3 px-3 font-mono">{asset.reliability}</td>
                        <td className="py-3 px-3 font-bold text-accent-green">{asset.savings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right column: Ingestions, schedulers, indicators */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* RAG usage chart */}
            <Card className="bg-surface-900 border border-white/5 p-4 flex flex-col items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3 w-full border-b border-white/5 pb-2">
                <Users className="w-4 h-4 text-accent-cyan" /> RAG Usage by Department
              </h3>

              <div className="w-full h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={AI_USAGE_DEPT}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {AI_USAGE_DEPT.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends */}
              <div className="w-full space-y-1.5 text-[9px] text-slate-400 mt-2 font-mono">
                {AI_USAGE_DEPT.map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-white shrink-0">{item.value}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Feature 6: Predictive Accuracy Calibration threshold */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Sliders className="w-4 h-4 text-primary-400" /> Predictive Bounds Calibration
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>Confidence Limit Filter</span>
                  <span className="text-white font-mono">{confidenceThreshold}%</span>
                </div>
                <input
                  type="range" min="50" max="95" step="5"
                  value={confidenceThreshold} onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                  className="w-full accent-primary-500"
                />
                <p className="text-[9px] text-slate-500 font-mono mt-1">Filters out warnings below this threshold</p>
              </div>
            </Card>

            {/* Feature 7: Compliance Audit History Log */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Shield className="w-4 h-4 text-accent-green" /> Compliance Audits Ledger
              </h3>
              <div className="space-y-2 text-[10px] font-mono leading-relaxed">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-2 bg-surface-850 border border-white/5 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{log.type}</p>
                      <p className="text-[9px] text-slate-500">{log.scope} • {log.date}</p>
                    </div>
                    <Badge variant="success" className="text-[8px] uppercase">{log.result}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Feature 9: Executive KPI target thresholds override panel */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Activity className="w-4 h-4 text-slate-400" /> Executive Target Thresholds
              </h3>
              <div className="space-y-3 text-[10px]">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Target Savings ($)</label>
                  <input
                    type="number" value={savingsTarget} onChange={(e) => setSavingsTarget(parseInt(e.target.value) || 0)}
                    className="w-full bg-surface-850 border border-white/5 text-white rounded p-1.5 text-xs focus:border-primary-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Max Downtime target (h)</label>
                  <input
                    type="number" value={downtimeTarget} onChange={(e) => setDowntimeTarget(parseInt(e.target.value) || 0)}
                    className="w-full bg-surface-850 border border-white/5 text-white rounded p-1.5 text-xs focus:border-primary-500"
                  />
                </div>
              </div>
            </Card>

            {/* Feature 5: Report Export Scheduler */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Mail className="w-4 h-4 text-accent-purple" /> Export Mail Scheduler
              </h3>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Destination Email</label>
                  <input
                    type="email" value={emailTarget} onChange={(e) => setEmailTarget(e.target.value)}
                    className="w-full bg-surface-850 border border-white/5 text-white rounded p-1.5 text-xs focus:border-primary-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Frequency</label>
                  <select
                    value={scheduleFreq} onChange={(e) => setScheduleFreq(e.target.value)}
                    className="w-full bg-surface-850 border border-white/5 text-white rounded p-1.5 text-xs focus:border-primary-500"
                  >
                    <option value="daily">Daily PDF stream</option>
                    <option value="weekly">Weekly Summary report</option>
                    <option value="monthly">Monthly Audit Workbook</option>
                  </select>
                </div>
                <Button onClick={handleSetupSchedule} className="w-full text-[10px]" variant="secondary">
                  {isScheduled ? <CheckCircle className="w-3.5 h-3.5 mr-1 text-accent-green animate-bounce" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
                  {isScheduled ? 'Scheduler Engaged' : 'Confirm Mail Schedule'}
                </Button>
              </div>
            </Card>

            {/* Export Center */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Download className="w-4 h-4 text-primary-400" /> Export Center
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSelected.kpis}
                      onChange={(e) => setExportSelected(prev => ({ ...prev, kpis: e.target.checked }))}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <span>Executive KPI Metrics Ledger</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSelected.roi}
                      onChange={(e) => setExportSelected(prev => ({ ...prev, roi: e.target.checked }))}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <span>ROI Cost Savings Matrix</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportSelected.downtime}
                      onChange={(e) => setExportSelected(prev => ({ ...prev, downtime: e.target.checked }))}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <span>Downtime Reduction Logs</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Export Format</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full bg-surface-850 border border-white/5 text-white rounded-lg p-2 text-xs focus:border-primary-500"
                  >
                    <option value="csv">CSV Spreadsheet format</option>
                    <option value="xlsx">Excel Workbook (.xlsx)</option>
                    <option value="json">JSON Metadata Block</option>
                  </select>
                </div>

                <Button
                  onClick={handleExport}
                  loading={savingStatus === 'exporting'}
                  className="w-full text-xs"
                >
                  {savingStatus === 'done' ? <CheckCircle className="w-4 h-4 mr-1 text-accent-green" /> : <FileSpreadsheet className="w-4 h-4 mr-1" />}
                  {savingStatus === 'exporting' ? 'Assembling...' : savingStatus === 'done' ? 'Exported!' : 'Export Reports'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
