import { useState } from 'react';
import {
  Search, CheckCircle, ShieldAlert, Cpu, UserCheck, XCircle, BarChart3,
  Filter, Award, Shield, DollarSign, Clock, Download, Terminal
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface DecisionItem {
  id: string;
  recommendation: string;
  asset: string;
  riskScore: number;
  priority: 'critical' | 'high' | 'medium';
  costImpact: string;
  downtimeAvoided: string;
  engineer: string;
  status: 'pending' | 'approved' | 'rejected';
  explainability: string;
  vibrationWeight: number;
  tempWeight: number;
  ageWeight: number;
  ettf: string; // Estimated Time To Failure
}

const INITIAL_DECISIONS: DecisionItem[] = [
  {
    id: 'dec-1',
    recommendation: 'Replace P-101 Shaft Mechanical Seal Pack',
    asset: 'Centrifugal Pump P-101',
    riskScore: 88,
    priority: 'critical',
    costImpact: '$45,000 savings',
    downtimeAvoided: '12h downtime avoided',
    engineer: 'Marcus Vance',
    status: 'pending',
    explainability: 'SHAP analysis indicates high shaft vibration (8.4mm/s) and bearing casing heat (172°F) have a 91% correlation with imminent seal failure models.',
    vibrationWeight: 75,
    tempWeight: 15,
    ageWeight: 10,
    ettf: '14 Hours remaining'
  },
  {
    id: 'dec-2',
    recommendation: 'Perform Chemical Tube Cleaning HX-301',
    asset: 'Heat Exchanger HX-301',
    riskScore: 74,
    priority: 'high',
    costImpact: '$18,000 savings',
    downtimeAvoided: '4h efficiency degradation avoided',
    engineer: 'Marcus Vance',
    status: 'pending',
    explainability: 'Fouling coefficient factor rose by 22% in the past 14 days, reducing thermal heat transfer exchange rate below 75% efficiency bounds.',
    vibrationWeight: 10,
    tempWeight: 70,
    ageWeight: 20,
    ettf: '5 Days remaining'
  },
  {
    id: 'dec-3',
    recommendation: 'Upload Missing Q2 Lockout/Tagout Logs',
    asset: 'Separator V-203',
    riskScore: 65,
    priority: 'medium',
    costImpact: 'Avoid regulatory penalty ($12k)',
    downtimeAvoided: 'Audit non-compliance mitigation',
    engineer: 'Lisa Park',
    status: 'pending',
    explainability: 'Cross-reference validation database indicates training records and safety signs checks logs are empty for current audit period.',
    vibrationWeight: 5,
    tempWeight: 5,
    ageWeight: 90,
    ettf: '12 Days remaining'
  }
];

export default function DecisionIntelligencePage() {
  const [decisions, setDecisions] = useState<DecisionItem[]>(INITIAL_DECISIONS);
  const [selectedId, setSelectedId] = useState<string>('dec-1');
  const [searchQuery, setSearchQuery] = useState('');

  // Feature 1: Decision priority filter
  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  // Feature 5: Cost comparison calculator inputs
  const [repairCost, setRepairCost] = useState(2500);
  const [failureCost, setFailureCost] = useState(48000);

  // Feature 9: Co-Sign Status state
  const [coSigned, setCoSigned] = useState(false);

  // Feature 8: Emergency alarm dispatcher toggles
  const [pingControlRoom, setPingControlRoom] = useState(false);

  const selectedDecision = decisions.find(d => d.id === selectedId) || decisions[0];

  const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected') => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const handleAssignEngineer = (id: string, engineer: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, engineer } : d));
  };

  // Feature 10: PDF Exporter
  const handleExportPDF = () => {
    const text = `
    === DECISION REPORT ===
    Asset: ${selectedDecision.asset}
    Recommendation: ${selectedDecision.recommendation}
    Confidence Score: ${selectedDecision.riskScore}%
    Assigned To: ${selectedDecision.engineer}
    Status: ${selectedDecision.status.toUpperCase()}
    SHAP Weights: Vibration (${selectedDecision.vibrationWeight}%), Temperature (${selectedDecision.tempWeight}%), Age (${selectedDecision.ageWeight}%)
    Time to failure: ${selectedDecision.ettf}
    `;
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedDecision.id}_decision_report.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  const filteredDecisions = decisions.filter(d => {
    const matchesSearch = d.recommendation.toLowerCase().includes(searchQuery.toLowerCase()) || d.asset.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || d.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Decision Intelligence Center</h1>
            <p className="page-subtitle">Explainable AI prioritization, risk matrix, and action approvals ledger</p>
          </div>

          {/* Feature 1: Filter Priority selector */}
          <div className="flex items-center gap-2 bg-surface-850 p-1.5 rounded-lg border border-white/5 text-xs">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="bg-transparent text-white border-0 focus:ring-0 p-0 text-[10px] uppercase font-bold"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Decision Queue list */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-surface-900 border border-white/5 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2.5 border-b border-white/5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-accent-cyan" /> Pending AI Decisions Queue
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter decisions..."
                    className="input-field pl-10 text-xs py-1.5 !mb-0"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Decision Recommendation</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Risk Score</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredDecisions.map((dec) => (
                      <tr
                        key={dec.id}
                        onClick={() => setSelectedId(dec.id)}
                        className={`hover:bg-surface-850/50 cursor-pointer transition-colors ${selectedId === dec.id ? 'bg-primary-500/10' : ''}`}
                      >
                        <td className="py-3 px-3">
                          <p className="font-semibold text-white">{dec.recommendation}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{dec.asset}</p>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={dec.priority === 'critical' ? 'danger' : dec.priority === 'high' ? 'warning' : 'info'} className="text-[8px] uppercase">
                            {dec.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-white">{dec.riskScore}%</td>
                        <td className="py-3 px-3">
                          <Badge variant={dec.status === 'approved' ? 'success' : dec.status === 'rejected' ? 'danger' : 'warning'} className="text-[8px] uppercase">
                            {dec.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Risk Prioritization Matrix (Visual Indicator Grid) */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5 border-b border-white/5 pb-2.5">
                <BarChart3 className="w-4 h-4 text-primary-400" /> Risk Prioritization Matrix
              </h3>
              
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-semibold">
                <div className="p-4 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red space-y-1">
                  <p className="text-lg font-bold font-mono">1 Critical</p>
                  <p className="text-[9px] text-slate-500 uppercase font-semibold">Risk score &gt; 80%</p>
                </div>
                <div className="p-4 rounded-xl bg-accent-amber/10 border border-accent-amber/20 text-accent-amber space-y-1">
                  <p className="text-lg font-bold font-mono">1 Warning</p>
                  <p className="text-[9px] text-slate-500 uppercase font-semibold">Risk score 60% - 80%</p>
                </div>
                <div className="p-4 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green space-y-1">
                  <p className="text-lg font-bold font-mono">1 Stable</p>
                  <p className="text-[9px] text-slate-500 uppercase font-semibold">Risk score &lt; 60%</p>
                </div>
              </div>
            </Card>

            {/* Feature 2: Assignee Workload Balance Tracker */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Award className="w-5 h-5 text-accent-green" /> Engineer Workload Balance tracker
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-surface-850 border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400">Marcus Vance</span>
                  <Badge variant="warning">2 Tasks</Badge>
                </div>
                <div className="p-3 rounded-lg bg-surface-850 border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400">Lisa Park</span>
                  <Badge variant="info">1 Task</Badge>
                </div>
                <div className="p-3 rounded-lg bg-surface-850 border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400">Auto-pool</span>
                  <Badge variant="success">0 Idle</Badge>
                </div>
              </div>
            </Card>

            {/* Feature 4: Historical Decisions Audit Logs Table */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-slate-500" /> Historical Decisions Audit log
              </h3>
              <div className="space-y-2 text-[10px] font-mono text-slate-400">
                <div className="p-2.5 bg-surface-850 rounded-lg flex justify-between">
                  <span>Approved: HX-301 valve replacement</span>
                  <span className="text-slate-600">Lisa Park • Jun 28, 2026</span>
                </div>
                <div className="p-2.5 bg-surface-850 rounded-lg flex justify-between">
                  <span>Rejected: C-204 motor shutdown override</span>
                  <span className="text-slate-600">Marcus Vance • Jun 25, 2026</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Column 2: Selected Decision details & approval workflow */}
          <div className="lg:col-span-1 space-y-6">
            {selectedDecision && (
              <>
                {/* AI Explainability Panel */}
                <Card className="bg-surface-900 border border-white/5 p-4 space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <Badge variant="info" className="uppercase text-[8px]">{selectedDecision.priority}</Badge>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-accent-cyan" /> AI Explainability Panel
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed">
                    <p className="text-slate-300 font-sans">{selectedDecision.explainability}</p>

                    {/* Feature 3: SHAP Feature Importance Plot */}
                    <div className="space-y-2 border-t border-white/5 pt-2">
                      <p className="font-semibold text-slate-400 text-[10px]">SHAP Feature Weightings</p>
                      <div className="space-y-1.5 text-[9px] font-mono">
                        <div>
                          <div className="flex justify-between mb-0.5">
                            <span>Vibration Coefficient:</span>
                            <span>{selectedDecision.vibrationWeight}%</span>
                          </div>
                          <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-cyan" style={{ width: `${selectedDecision.vibrationWeight}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-0.5">
                            <span>Temperature Reading:</span>
                            <span>{selectedDecision.tempWeight}%</span>
                          </div>
                          <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-amber" style={{ width: `${selectedDecision.tempWeight}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-0.5">
                            <span>Asset Age:</span>
                            <span>{selectedDecision.ageWeight}%</span>
                          </div>
                          <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: `${selectedDecision.ageWeight}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-surface-850 border border-white/5 space-y-2 font-mono text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Business Impact:</span>
                        <span className="text-accent-green font-bold">{selectedDecision.costImpact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Downtime avoided:</span>
                        <span className="text-white font-bold">{selectedDecision.downtimeAvoided}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Confidence Score:</span>
                        <span className="text-accent-cyan font-bold">{selectedDecision.riskScore}%</span>
                      </div>
                      
                      {/* Feature 6: Estimated Time-to-Failure (ETTF) */}
                      <div className="flex justify-between border-t border-white/5 pt-1 mt-1 font-bold text-accent-red">
                        <span>ETTF Forecast:</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedDecision.ettf}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Feature 5: Mitigation Cost Comparison Calculator */}
                <Card className="bg-surface-900 border border-white/5 p-4 space-y-3 text-xs">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-accent-green" /> Cost Mitigation Calculator
                  </h3>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-slate-500">Repair Cost ($)</label>
                        <input
                          type="number" value={repairCost} onChange={(e) => setRepairCost(parseInt(e.target.value) || 0)}
                          className="w-full bg-surface-850 border border-white/5 text-white rounded p-1 text-xs focus:ring-0"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-slate-500">Outage Cost ($)</label>
                        <input
                          type="number" value={failureCost} onChange={(e) => setFailureCost(parseInt(e.target.value) || 0)}
                          className="w-full bg-surface-850 border border-white/5 text-white rounded p-1 text-xs focus:ring-0"
                        />
                      </div>
                    </div>
                    <div className="p-2 bg-surface-850 rounded border border-white/5 font-mono text-[9px] text-accent-green flex justify-between">
                      <span>Calculated Net Benefit:</span>
                      <span className="font-bold">+${(failureCost - repairCost).toLocaleString()} Saved</span>
                    </div>
                  </div>
                </Card>

                {/* Feature 7: Safety & Compliance Checkboxes */}
                <Card className="bg-surface-900 border border-white/5 p-4 space-y-2 text-xs">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-accent-cyan" /> Regulatory compliance checks
                  </h3>
                  <div className="space-y-1.5 text-[9px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-accent-green shrink-0" />
                      <span>OSHA 1910.147 Control of Haz Energy</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-accent-green shrink-0" />
                      <span>ISO 9001 Maintenance Logs Signoff</span>
                    </div>
                  </div>
                </Card>

                {/* Approval Workflow & Engineer Assignment */}
                <Card className="bg-surface-900 border border-white/5 p-4 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-slate-400" /> Action Assignment
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    {/* Engineer assignment */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-400">Assigned Dispatch Engineer</label>
                      <select
                        value={selectedDecision.engineer}
                        onChange={(e) => handleAssignEngineer(selectedDecision.id, e.target.value)}
                        className="w-full bg-surface-850 border border-white/5 text-white rounded-lg p-2 text-xs focus:border-primary-500"
                      >
                        <option value="Marcus Vance">Marcus Vance (Maintenance Lead)</option>
                        <option value="Lisa Park">Lisa Park (Compliance Officer)</option>
                        <option value="Engineer Dispatch">Auto-dispatch Pool</option>
                      </select>
                    </div>

                    {/* Feature 9: Co-Sign status */}
                    <div className="flex items-center justify-between text-[10px] py-1 border-t border-white/5">
                      <span className="text-slate-400 font-semibold">Dual Operator Co-Sign</span>
                      <button
                        onClick={() => setCoSigned(!coSigned)}
                        className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${coSigned ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' : 'bg-surface-850 text-slate-500 border border-white/5'}`}
                      >
                        {coSigned ? '✓ Co-signed' : 'Pending Signoff'}
                      </button>
                    </div>

                    {/* Feature 8: Emergency Alarm dispatch */}
                    <div className="flex items-center justify-between text-[10px] py-1 border-t border-white/5">
                      <span className="text-slate-400 font-semibold">Emergency Control room ping</span>
                      <button
                        onClick={() => setPingControlRoom(!pingControlRoom)}
                        className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${pingControlRoom ? 'bg-accent-red/20 text-accent-red border border-accent-red/30' : 'bg-surface-850 text-slate-500 border border-white/5'}`}
                      >
                        {pingControlRoom ? '🚨 PINGED' : 'STANDBY'}
                      </button>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleStatusChange(selectedDecision.id, 'rejected')}
                        className="flex-1 text-[11px] py-2 h-auto"
                        disabled={selectedDecision.status === 'rejected'}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1 text-accent-red" /> Reject
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleStatusChange(selectedDecision.id, 'approved')}
                        className="flex-1 text-[11px] py-2 h-auto bg-gradient-to-r from-accent-green to-emerald-600"
                        disabled={selectedDecision.status === 'approved'}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve Action
                      </Button>
                    </div>

                    {/* Feature 10: PDF Exporter Button */}
                    <Button onClick={handleExportPDF} className="w-full text-[10px] py-2 h-auto" variant="secondary">
                      <Download className="w-3.5 h-3.5 mr-1" /> Export Decision Summary
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
