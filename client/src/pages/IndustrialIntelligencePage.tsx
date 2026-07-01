import { useState } from 'react';
import {
  TrendingUp, BarChart3, Shield, DollarSign, Download, Clock,
  Users, CheckCircle, FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Industrial Intelligence Center</h1>
            <p className="page-subtitle">Executive business analytics and ROI metrics dashboard</p>
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
              <p className="text-[9px] text-accent-green font-semibold mt-0.5">+18% vs Last Quarter</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Downtime Reduction</p>
              <h3 className="text-xl font-extrabold text-white mt-1">-66.7%</h3>
              <p className="text-[9px] text-slate-400 mt-0.5">Dropped from 42h to 14h</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Audit Compliance Rating</p>
              <h3 className="text-xl font-extrabold text-white mt-1">92.4%</h3>
              <p className="text-[9px] text-slate-400 mt-0.5">OSHA & ISO checks clean</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Platform Usage</p>
              <h3 className="text-xl font-extrabold text-white mt-1">1,840 Calls</h3>
              <p className="text-[9px] text-accent-cyan font-semibold mt-0.5">Active engineering RAG calls</p>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ROI Savings and Downtime Reduction */}
          <div className="lg:col-span-2 space-y-6">
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
          </div>

          {/* Right column: Ingestion Analytics & Export Center */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI usage department chart */}
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

            {/* Department Performance */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <BarChart3 className="w-4 h-4 text-slate-500" /> Operational Health Index
              </h3>
              <div className="space-y-3 text-[10px]">
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">Engineering</span>
                    <span className="text-white">94%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500" style={{ width: '94%' }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">Maintenance</span>
                    <span className="text-white">88%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-green" style={{ width: '88%' }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">Compliance & HSE</span>
                    <span className="text-white">92%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-cyan" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Export Center */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Download className="w-4 h-4 text-primary-400" /> Export Center
              </h3>

              <div className="space-y-3.5 text-xs">
                {/* Select export keys */}
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

                {/* Select export format */}
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
