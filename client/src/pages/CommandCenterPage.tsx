import { useState, useEffect } from 'react';
import {
  Activity, Sliders, FileText, Cpu, Bell,
  Sparkles, RefreshCw, CheckCircle, Clock
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const CONFIDENCE_DATA = [
  { name: 'RCA Accuracy', value: 94, color: '#6366f1' },
  { name: 'Predictive Bounds', value: 89, color: '#10b981' },
  { name: 'OCR Ingestion', value: 92, color: '#22d3ee' },
  { name: 'Compliance Audits', value: 96, color: '#a855f7' },
];

export default function CommandCenterPage() {
  const [ocrProgress, setOcrProgress] = useState(45);
  const [ocrStatus, setOcrStatus] = useState<'active' | 'completed'>('active');
  const [alerts, setAlerts] = useState([
    { id: 1, title: 'Flange Seal Wear Overdue', asset: 'Pump P-101', severity: 'critical', time: '5m ago' },
    { id: 2, title: 'Heat Exchanger Tube Efficiency Low', asset: 'HX-301', severity: 'warning', time: '12m ago' },
    { id: 3, title: 'Relief Valve Missing Compliance Cert', asset: 'V-203', severity: 'warning', time: '1h ago' }
  ]);
  const [recommendations, setRecommendations] = useState([
    { id: 1, action: 'Perform shaft alignment calibration', asset: 'P-101', impact: 'Avoid 4.2h unplanned downtime', checked: false },
    { id: 2, action: 'Schedule heat exchanger tube cleaning', asset: 'HX-301', impact: 'Improve heat transfer efficiency by 15%', checked: false },
    { id: 3, action: 'Upload missing Lockout/Tagout log', asset: 'V-203', impact: 'Remediate OSHA 1910 audit compliance gap', checked: false }
  ]);
  const [logs, setLogs] = useState([
    { id: 1, type: 'System', text: 'Gemini RAG context chunk vectors successfully reindexed.', time: '10:45 AM' },
    { id: 2, type: 'OCR', text: 'Pump_P101_RCA_Report_Final.pdf processed successfully.', time: '10:30 AM' },
    { id: 3, type: 'AI', text: 'Predictive health scoring updated for 24 monitored assets.', time: '10:15 AM' }
  ]);

  // Simulate active OCR progress
  useEffect(() => {
    if (ocrStatus === 'active') {
      const interval = setInterval(() => {
        setOcrProgress((prev) => {
          if (prev >= 100) {
            setOcrStatus('completed');
            clearInterval(interval);
            // Append log
            setLogs((prevLogs) => [
              { id: Date.now(), type: 'OCR', text: 'Structural drawing P-101_v3.pdf completed ingestion.', time: '11:15 AM' },
              ...prevLogs
            ]);
            return 100;
          }
          return prev + 5;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [ocrStatus]);

  const handleDismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleTriggerAction = (id: number) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, checked: true } : r));
    setTimeout(() => {
      setRecommendations(prev => prev.filter(r => r.id !== id));
      // Append a log
      setLogs(prev => [
        { id: Date.now(), type: 'Action', text: `Recalibration task queued for asset.`, time: 'Just now' },
        ...prev
      ]);
    }, 1200);
  };

  const handleRefresh = () => {
    setOcrProgress(15);
    setOcrStatus('active');
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">AI Operations Command Center</h1>
            <p className="page-subtitle">Unified real-time neural network control panel & workflow engine</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh Feeds
          </Button>
        </div>

        {/* Live KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-900 border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Operations Status</p>
                <h3 className="text-xl font-extrabold text-white mt-1">ONLINE</h3>
              </div>
              <Badge variant="success" className="text-[9px]">98.7% Up</Badge>
            </div>
            <p className="text-[10px] text-accent-cyan flex items-center gap-1 mt-2 font-medium">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Live models sync active
            </p>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average RAG Confidence</p>
                <h3 className="text-xl font-extrabold text-white mt-1">92.8%</h3>
              </div>
              <Badge variant="info" className="text-[9px]">Target &gt;90%</Badge>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Based on 145 ingested operational records</p>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Smart Alerts</p>
                <h3 className="text-xl font-extrabold text-accent-red mt-1">{alerts.length} Warnings</h3>
              </div>
              <Badge variant="danger" className="text-[9px]">High Priority</Badge>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Requires engineer response verification</p>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Ingestion Jobs</p>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  {ocrStatus === 'active' ? '1 OCR Running' : '0 Idle'}
                </h3>
              </div>
              <Badge variant="warning" className="text-[9px]">{ocrStatus === 'active' ? 'Processing' : 'Standby'}</Badge>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">{"Pipeline: Ingest -> Extract -> Graph"}</p>
          </Card>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: AI Executive Summary & Recommendation Center */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Executive Summary */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
                <Sparkles className="w-5 h-5 text-accent-cyan" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Executive Summary</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Our plant neural analyzer has verified 24 telemetry indexes and compliance logs. 
                We detected a critical alignment threshold issue on **Pump P-101** causing a vibration spike (8.4 mm/s). 
                Immediate corrective actions are loaded in the queue. 
                Average safety compliance score remains highly stable at **92%**, but missing training records for hazardous handling could cause a minor rating deviation.
              </p>
            </Card>

            {/* AI Recommendation Center */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2.5">
                <Cpu className="w-5 h-5 text-primary-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Recommendation Center</h2>
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="p-3.5 rounded-xl bg-surface-850 border border-white/5 flex justify-between items-center gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{rec.action}</span>
                          <Badge variant="info" className="text-[8px] py-0 font-mono">{rec.asset}</Badge>
                        </div>
                        <p className="text-slate-400 font-sans">{rec.impact}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={rec.checked ? 'secondary' : 'primary'}
                        onClick={() => handleTriggerAction(rec.id)}
                        disabled={rec.checked}
                        className="text-[10px] py-1 px-2.5 h-auto shrink-0"
                      >
                        {rec.checked ? <CheckCircle className="w-3 h-3 text-accent-green" /> : 'Trigger'}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">All recommended actions have been processed.</div>
              )}
            </Card>

            {/* Ingestion & Active OCR Status */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2.5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><FileText className="w-5 h-5 text-accent-amber" /> Ingestion Pipeline</h2>
                {ocrStatus === 'active' && <span className="text-[10px] text-accent-cyan font-mono animate-pulse">4.2 KB/s</span>}
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-850 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">Ingesting: P-101_v3_Isometric_Drawing.pdf</span>
                    <span className="text-[10px] font-mono text-slate-400">{ocrProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Task ID: ocr-job-429</span>
                    <span>Status: {ocrStatus === 'active' ? 'Extracting entities...' : 'Completed'}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Column 2: Confidence Model & Smart Alerts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Smart Alerts Feed */}
            <Card className="bg-surface-900 border border-white/5 p-4 flex flex-col h-[280px]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3 border-b border-white/5 pb-2">
                <Bell className="w-4 h-4 text-accent-red" /> Active Smart Alerts
              </h3>
              
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 text-[10px]">
                {alerts.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-lg bg-surface-850 border border-white/5 flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{a.title}</span>
                        <Badge variant="danger" className="text-[7px] py-0 px-1 font-mono uppercase">{a.severity}</Badge>
                      </div>
                      <p className="text-slate-400">{a.asset} • {a.time}</p>
                    </div>
                    <button onClick={() => handleDismissAlert(a.id)} className="text-slate-500 hover:text-white font-bold cursor-pointer">✕</button>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Confidence Pie Chart */}
            <Card className="bg-surface-900 border border-white/5 p-4 flex flex-col items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3 w-full border-b border-white/5 pb-2">
                <Sliders className="w-4 h-4 text-primary-400" /> Model Accuracy Indexes
              </h3>

              <div className="w-full h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CONFIDENCE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {CONFIDENCE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0e1a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="w-full grid grid-cols-2 gap-2 text-[9px] text-slate-400 mt-2 font-mono">
                {CONFIDENCE_DATA.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent activity log stream */}
            <Card className="bg-surface-900 border border-white/5 p-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3 border-b border-white/5 pb-2">
                <Clock className="w-4 h-4 text-slate-500" /> Recent AI Ingestion logs
              </h3>
              <div className="space-y-3 font-mono text-[9px]">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-2 items-start text-slate-400 leading-relaxed">
                    <span className="text-accent-cyan uppercase font-bold text-[8px] px-1 bg-accent-cyan/10 rounded shrink-0">{log.type}</span>
                    <span className="flex-1">{log.text}</span>
                    <span className="text-slate-600 font-bold shrink-0">{log.time}</span>
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
