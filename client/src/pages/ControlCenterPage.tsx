import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu, Users, QrCode, FileText, Mic, MessageSquare, Activity,
  HeartHandshake, CheckCircle, Clock, Search, Send, PlusCircle, ShieldAlert
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ControlCenterPage() {
  const navigate = useNavigate();
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());

  // Feature 1: SCADA Sensor Tag Reader
  const [scadaTag, setScadaTag] = useState('TE-101');
  const [scadaVal, setScadaVal] = useState('172.4 °F');

  // Feature 4: Live Chat Stream state
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Marcus Vance', text: 'Seal inspection scheduled for pump P-101 motor shaft.', time: '11:02 AM' },
    { id: 2, sender: 'Lisa Park', text: 'Checked pressure valve certifications for separator V-203.', time: '10:48 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Feature 5: Voice Dictation Assistant
  const [dictationText, setDictationText] = useState('Vibration checks completed for casing HX-301.');
  const [isRecording, setIsRecording] = useState(false);

  // Feature 8: HSE Incident Log
  const [hazardText, setHazardText] = useState('');
  const [hazardSuccess, setHazardSuccess] = useState(false);

  // Feature 9: CMMS Work Order Form
  const [workOrderAsset, setWorkOrderAsset] = useState('P-101');
  const [workOrderDesc, setWorkOrderDesc] = useState('');
  const [workOrderSuccess, setWorkOrderSuccess] = useState(false);

  // Feature 10: Telemetry refresh frequency
  const [refreshSpeed, setRefreshSpeed] = useState('5s');

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuerySCADA = () => {
    if (scadaTag === 'TE-101') setScadaVal('172.4 °F');
    else if (scadaTag === 'PT-203') setScadaVal('34.8 PSI');
    else if (scadaTag === 'VE-101') setScadaVal('8.4 mm/s');
    else setScadaVal('0.00 (Tag Out of Range)');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'Operator', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setNewMessage('');
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setDictationText('Auto-dictated: Seal pack wear rating verified at 65%.');
    }, 1500);
  };

  const handleLogHazard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardText.trim()) return;
    setHazardSuccess(true);
    setHazardText('');
    setTimeout(() => setHazardSuccess(false), 2000);
  };

  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workOrderDesc.trim()) return;
    setWorkOrderSuccess(true);
    setWorkOrderDesc('');
    setTimeout(() => setWorkOrderSuccess(false), 2000);
  };

  const assets = [
    { name: 'Centrifugal Pump P-101', status: 'critical', health: 62 },
    { name: 'Heat Exchanger HX-301', status: 'warning', health: 74 },
    { name: 'Separator Vessel V-203', status: 'stable', health: 91 },
    { name: 'Compressor Unit C-204', status: 'stable', health: 94 }
  ];

  const engineers = [
    { name: 'Marcus Vance', role: 'Maintenance Lead', status: 'Active on Site' },
    { name: 'Lisa Park', role: 'HSE Auditor', status: 'Active on Audit' }
  ];

  // Feature 3: Live QR scans ledger
  const qrScans = [
    { asset: 'P-101', date: 'Jun 30, 2026', operator: 'Marcus Vance', status: 'Casing wear check' },
    { asset: 'V-203', date: 'Jun 28, 2026', operator: 'Lisa Park', status: 'Missing tag uploaded' }
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Industrial Control Center</h1>
            <p className="page-subtitle">Unified plant operations status, dispatcher console, and active logs</p>
          </div>
          <div className="flex items-center gap-4 text-right">
            {/* Feature 10: Refresh Controls */}
            <div className="flex items-center gap-1.5 bg-surface-850 p-1 rounded-lg border border-white/5 text-xs">
              <span className="text-[9px] text-slate-500 font-bold uppercase pl-1">Sync:</span>
              <select
                value={refreshSpeed} onChange={(e) => setRefreshSpeed(e.target.value)}
                className="bg-transparent text-white border-0 focus:ring-0 p-0 text-[10px] uppercase font-bold"
              >
                <option value="1s">1s Refresh</option>
                <option value="5s">5s Refresh</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>
            <div>
              <span className="font-mono text-xs text-slate-500 font-bold uppercase tracking-widest">Live System Clock:</span>
              <p className="font-mono text-white text-base font-extrabold">{timestamp}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: SCADA, Asset status, shift log, QR activity, Incidents, Work Orders */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Feature 1: SCADA Sensor Tag Reader */}
            <Card className="bg-surface-900 border border-white/5 p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Search className="w-5 h-5 text-accent-cyan" /> SCADA Sensor Tag Reader
              </h2>
              <div className="flex gap-2">
                <input
                  value={scadaTag}
                  onChange={(e) => setScadaTag(e.target.value)}
                  placeholder="Enter tag (e.g. TE-101, PT-203)..."
                  className="input-field py-2 text-xs !mb-0"
                />
                <Button onClick={handleQuerySCADA} className="text-xs h-auto">Query Tag</Button>
              </div>
              <div className="p-3 bg-surface-850 border border-white/5 rounded-xl flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Current Tag value:</span>
                <span className="text-accent-cyan font-bold">{scadaVal}</span>
              </div>
            </Card>

            {/* Asset status grid */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-cyan" /> Monitored Assets Status
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assets.map((asset, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-surface-850 border border-white/5 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-white">{asset.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Telemetry Active</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={asset.status === 'critical' ? 'danger' : asset.status === 'warning' ? 'warning' : 'success'}>
                        {asset.health}% Health
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Feature 3: Live QR scans ledger */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-accent-amber" /> Live QR Scan logs
              </h2>
              <div className="overflow-x-auto scrollbar-thin text-xs font-mono">
                <table className="w-full text-left text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-2 px-2">Asset Tag</th>
                      <th className="py-2 px-2">Scan date</th>
                      <th className="py-2 px-2">Operator</th>
                      <th className="py-2 px-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {qrScans.map((scan, i) => (
                      <tr key={i} className="hover:bg-surface-850/40">
                        <td className="py-2.5 px-2 font-bold text-white">{scan.asset}</td>
                        <td className="py-2.5 px-2">{scan.date}</td>
                        <td className="py-2.5 px-2">{scan.operator}</td>
                        <td className="py-2.5 px-2 text-accent-cyan">{scan.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Active engineers */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-400" /> Dispatcher & Engineers Duty Log
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {engineers.map((eng, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-surface-850 border border-white/5 flex items-center gap-3.5 text-xs">
                    <div className="w-9 h-9 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center font-bold text-primary-300">
                      {eng.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{eng.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{eng.role}</p>
                    </div>
                    <Badge variant="success" className="text-[8px] uppercase">{eng.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Feature 8: HSE Incident hazard logger form */}
            <Card className="bg-surface-900 border border-white/5 p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2.5 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-accent-red" /> HSE Incident Hazard Logger
              </h2>
              <form onSubmit={handleLogHazard} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Describe Hazard / Incident</label>
                  <textarea
                    rows={2} value={hazardText} onChange={(e) => setHazardText(e.target.value)}
                    placeholder="Describe leak, fire, or chemical risk observed..."
                    className="w-full bg-surface-850 border border-white/5 text-white rounded-xl p-2.5 text-xs focus:ring-0 focus:border-primary-500"
                  />
                </div>
                <Button type="submit" variant="secondary" className="text-[10px] py-1.5 h-auto">
                  {hazardSuccess ? <CheckCircle className="w-3.5 h-3.5 mr-1 text-accent-green" /> : <PlusCircle className="w-3.5 h-3.5 mr-1" />}
                  {hazardSuccess ? 'Incident Registered!' : 'Log Active Hazard'}
                </Button>
              </form>
            </Card>

            {/* Feature 9: CMMS Work Order Form */}
            <Card className="bg-surface-900 border border-white/5 p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2.5 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-accent-green" /> CMMS Maintenance Work Order
              </h2>
              <form onSubmit={handleCreateWorkOrder} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Asset Selection</label>
                    <select
                      value={workOrderAsset} onChange={(e) => setWorkOrderAsset(e.target.value)}
                      className="w-full bg-surface-850 border border-white/5 text-white rounded p-1.5 text-xs focus:ring-0"
                    >
                      <option value="P-101">Pump P-101</option>
                      <option value="HX-301">Heat Exchanger HX-301</option>
                      <option value="V-203">Separator V-203</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Priority Level</label>
                    <Badge variant="warning">High Priority</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Work Description</label>
                  <input
                    value={workOrderDesc} onChange={(e) => setWorkOrderDesc(e.target.value)}
                    placeholder="Tasks details (e.g. clean scaling, recalibrate shaft bearings)..."
                    className="w-full bg-surface-850 border border-white/5 text-white rounded p-2 text-xs focus:ring-0"
                  />
                </div>
                <Button type="submit" className="text-[10px] py-1.5 h-auto">
                  {workOrderSuccess ? <CheckCircle className="w-3.5 h-3.5 mr-1 text-accent-green" /> : <PlusCircle className="w-3.5 h-3.5 mr-1" />}
                  {workOrderSuccess ? 'Work Order Dispatched!' : 'Submit Work Order to CMMS'}
                </Button>
              </form>
            </Card>

            {/* Operations Shortcuts */}
            <Card className="p-5 bg-surface-900 border border-white/5">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-3.5 flex items-center gap-1.5"><HeartHandshake className="w-4 h-4 text-accent-green" /> Operations Shortcuts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <button onClick={() => navigate('/app/qr-scanner')} className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface-850 hover:bg-surface-800 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-white transition-all text-center cursor-pointer gap-2">
                  <QrCode className="w-5 h-5 text-accent-cyan" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Asset Scanner</span>
                </button>
                <button onClick={() => navigate('/app/voice')} className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface-850 hover:bg-surface-800 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-white transition-all text-center cursor-pointer gap-2">
                  <Mic className="w-5 h-5 text-accent-red" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Voice Control</span>
                </button>
                <button onClick={() => navigate('/app/copilot')} className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface-850 hover:bg-surface-800 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-white transition-all text-center cursor-pointer gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">RAG Copilot</span>
                </button>
                <button onClick={() => navigate('/app/reports')} className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-surface-850 hover:bg-surface-800 border border-white/5 hover:border-cyan-500/20 text-slate-300 hover:text-white transition-all text-center cursor-pointer gap-2">
                  <FileText className="w-5 h-5 text-accent-purple" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Reports</span>
                </button>
              </div>
            </Card>
          </div>

          {/* Column 2: Chat channel, voice dictation, system logs, timeline */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Feature 4: Operations Chat Channel / Message Board */}
            <Card className="bg-surface-900 border border-white/5 p-4 flex flex-col h-[280px]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2 mb-2">
                <MessageSquare className="w-4 h-4 text-primary-400" /> Shift Logs Message Board
              </h3>
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2.5 text-[10px] pr-1">
                {messages.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-surface-850 border border-white/5 space-y-1">
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="font-bold text-white">{m.sender}</span>
                      <span className="font-mono text-[8px]">{m.time}</span>
                    </div>
                    <p className="text-slate-300">{m.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 pt-2 border-t border-white/5 mt-2">
                <input
                  value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Post log update..."
                  className="bg-surface-850 border border-white/5 rounded-lg px-2 py-1 text-xs text-white placeholder:text-slate-500 flex-1 focus:ring-0 focus:border-primary-500"
                />
                <button onClick={handleSendMessage} className="p-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white cursor-pointer"><Send className="w-3.5 h-3.5" /></button>
              </div>
            </Card>

            {/* Feature 5: Voice dictation box */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Mic className="w-4 h-4 text-accent-red" /> Voice Dictation assistant
              </h3>
              <div className="space-y-2 text-xs">
                <textarea
                  rows={2} value={dictationText} onChange={(e) => setDictationText(e.target.value)}
                  className="w-full bg-surface-850 border border-white/5 text-white rounded p-2 text-[10px] focus:ring-0"
                />
                <Button onClick={handleStartRecording} className="w-full text-[10px] py-1.5 h-auto" variant={isRecording ? 'secondary' : 'primary'}>
                  <Mic className={`w-3.5 h-3.5 mr-1 ${isRecording ? 'animate-pulse text-accent-red' : ''}`} />
                  {isRecording ? 'Recording Sound...' : 'Simulate Dictation Input'}
                </Button>
              </div>
            </Card>

            {/* Feature 6: AI Copilot Usage analytics */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Cpu className="w-4 h-4 text-accent-purple" /> AI platform stats
              </h3>
              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
                <div className="p-2 bg-surface-850 rounded border border-white/5">
                  <p className="text-white font-bold text-sm">184</p>
                  <p className="text-slate-500 text-[8px] uppercase">RAG Queries</p>
                </div>
                <div className="p-2 bg-surface-850 rounded border border-white/5">
                  <p className="text-white font-bold text-sm">92%</p>
                  <p className="text-slate-500 text-[8px] uppercase">Match Bounds</p>
                </div>
              </div>
            </Card>

            {/* System Services Health */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Cpu className="w-4 h-4 text-accent-green" /> System Services Health
              </h3>
              <div className="space-y-2 text-[10px] font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">RAG Context Engine:</span>
                  <span className="text-accent-green font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">OCR Parser Core:</span>
                  <span className="text-accent-green font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Speech Synthesis:</span>
                  <span className="text-accent-green font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Healthy</span>
                </div>
              </div>
            </Card>

            {/* Recent timeline activities list */}
            <Card className="bg-surface-900 border border-white/5 p-4 flex flex-col h-[280px]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3 border-b border-white/5 pb-2">
                <Clock className="w-4 h-4 text-slate-500" /> Recent Timeline Feed
              </h3>
              
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 text-[10px] font-mono leading-relaxed">
                <div className="flex gap-2">
                  <span className="text-slate-500">11:05 AM</span>
                  <span className="text-slate-300">Work order assigned to Marcus Vance for seal replacement.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-500">10:58 AM</span>
                  <span className="text-slate-300">QR Code scanned: Centrifugal Pump P-101.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-500">10:45 AM</span>
                  <span className="text-slate-300">RAG model parameters updated by operator.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
