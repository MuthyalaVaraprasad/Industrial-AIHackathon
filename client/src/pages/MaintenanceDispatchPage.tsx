import { useState } from 'react';
import {
  Wrench, Activity, Clock, Truck, Inbox, PhoneCall, Search, Sliders, ClipboardList
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface WorkOrder {
  id: string;
  asset: string;
  task: string;
  engineer: string;
  status: 'pending' | 'dispatched' | 'completed';
  priority: 'critical' | 'high' | 'medium';
  downtimeSaved: string;
  wearLevel: number;
}

const INITIAL_ORDERS: WorkOrder[] = [
  { id: 'wo-1', asset: 'Pump P-101', task: 'Replace shaft bearing casing', engineer: 'Marcus Vance', status: 'pending', priority: 'critical', downtimeSaved: '12 hours', wearLevel: 88 },
  { id: 'wo-2', asset: 'Exchanger HX-301', task: 'Perform tube scales cleaning', engineer: 'Marcus Vance', status: 'pending', priority: 'high', downtimeSaved: '4 hours', wearLevel: 74 },
  { id: 'wo-3', asset: 'Separator V-203', task: 'Audit safety relief valves', engineer: 'Lisa Park', status: 'completed', priority: 'medium', downtimeSaved: '2 hours', wearLevel: 12 }
];

export default function MaintenanceDispatchPage() {
  const [orders, setOrders] = useState<WorkOrder[]>(INITIAL_ORDERS);
  const [selectedId, setSelectedId] = useState('wo-1');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom states
  const [vibrationLimit, setVibrationLimit] = useState(6.5);
  const [downtimeAvoided] = useState(18);
  const [partsChecked, setPartsChecked] = useState({
    sealP101: true,
    filterHX301: false,
    valvesV203: true
  });
  
  // Dispatch notes
  const [dispatchNote, setDispatchNote] = useState('');
  const [noteStatus, setNoteStatus] = useState(false);

  // Control Room Call State
  const [callActive, setCallActive] = useState(false);

  const selectedOrder = orders.find(o => o.id === selectedId) || orders[0];

  const handleUpdateStatus = (id: string, newStatus: 'dispatched' | 'completed') => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleAssignEngineer = (id: string, engineer: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, engineer } : o));
  };

  const handlePostNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchNote) return;
    setNoteStatus(true);
    setTimeout(() => setNoteStatus(false), 2000);
    setDispatchNote('');
  };

  const filteredOrders = orders.filter(o => 
    o.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="relative space-y-6 min-h-screen">
        {/* Aesthetic background blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[15%] left-[10%] w-80 h-80 rounded-full bg-primary-500/5 blur-[95px] animate-float-slow" />
          <div className="absolute bottom-[20%] right-[15%] w-72 h-72 rounded-full bg-accent-cyan/5 blur-[80px] animate-float-medium" />
        </div>

        <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Wrench className="w-8 h-8 text-accent-cyan" /> CMMS & Maintenance Dispatch Hub
            </h1>
            <p className="page-subtitle">15+ work orders dispatching, parts stock checks, vibration thresholds, and notes</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={callActive ? 'secondary' : 'primary'}
              onClick={() => setCallActive(!callActive)}
              className="text-xs"
            >
              <PhoneCall className="w-4 h-4 mr-1 animate-pulse" />
              {callActive ? '☎ Dispatch Line Open' : 'Call Control Room'}
            </Button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="z-10 relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 shrink-0">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Pending Orders</p>
              <h3 className="text-xl font-extrabold text-white mt-1">
                {orders.filter(o => o.status === 'pending').length} Work Orders
              </h3>
              <p className="text-[9px] text-slate-400">Awaiting engineer dispatch</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Downtime Saved</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{downtimeAvoided} Hours</h3>
              <p className="text-[9px] text-accent-green font-semibold">AI early detection value</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan shrink-0">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Bearing Casing Wear</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{selectedOrder?.wearLevel}%</h3>
              <p className="text-[9px] text-slate-400">Free-end casing sensor GS-101</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface-900 border border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-purple/10 text-accent-purple shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Parts Status</p>
              <h3 className="text-xl font-extrabold text-white mt-1">In Stock</h3>
              <p className="text-[9px] text-slate-400">Bearings & seals verified</p>
            </div>
          </Card>
        </div>

        {/* 3-Column Layout */}
        <div className="z-10 relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Work orders queue */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2.5 border-b border-white/5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-accent-cyan" /> CMMS Active Dispatch Queue
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search work orders..."
                    className="input-field pl-10 text-xs py-1.5 !mb-0"
                  />
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-2.5 px-3">Asset</th>
                      <th className="py-2.5 px-3">Maintenance Task</th>
                      <th className="py-2.5 px-3">Wear Index</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map(order => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedId(order.id)}
                        className={`hover:bg-surface-850/50 cursor-pointer ${selectedId === order.id ? 'bg-primary-500/10' : ''}`}
                      >
                        <td className="py-3 px-3">
                          <p className="font-semibold text-white">{order.asset}</p>
                          <p className="text-[9px] text-slate-500">ETTF: {order.downtimeSaved}</p>
                        </td>
                        <td className="py-3 px-3">{order.task}</td>
                        <td className="py-3 px-3 font-mono font-bold">{order.wearLevel}%</td>
                        <td className="py-3 px-3">
                          <Badge variant={order.status === 'completed' ? 'success' : order.status === 'dispatched' ? 'info' : 'warning'}>
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Parts stock verification checkboxes */}
            <Card className="bg-surface-900 border border-white/5 p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent-cyan" /> Parts & Warehouse Stock Verification
              </h2>
              <div className="space-y-3 text-xs font-mono">
                <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={partsChecked.sealP101}
                    onChange={(e) => setPartsChecked(prev => ({ ...prev, sealP101: e.target.checked }))}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span>Mechanical shaft seals P-101 (2 Units In Stock)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={partsChecked.filterHX301}
                    onChange={(e) => setPartsChecked(prev => ({ ...prev, filterHX301: e.target.checked }))}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span>Scaling cleaning chemicals HX-301 (Awaiting Delivery)</span>
                </label>
              </div>
            </Card>
          </div>

          {/* Right Column: Dispatch controllers, notes form, overrides */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Engineer assignment */}
            {selectedOrder && (
              <Card className="bg-surface-900 border border-white/5 p-4 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                  Dispatch & Assign Engineer
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Assigned Technician</label>
                    <select
                      value={selectedOrder.engineer}
                      onChange={(e) => handleAssignEngineer(selectedOrder.id, e.target.value)}
                      className="w-full bg-surface-850 border border-white/5 text-white rounded p-2 text-xs focus:ring-0 focus:border-primary-500"
                    >
                      <option value="Marcus Vance">Marcus Vance (Maintenance Lead)</option>
                      <option value="Lisa Park">Lisa Park (HSE Officer)</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                      className="flex-1 text-[10px] py-1.5 h-auto"
                      disabled={selectedOrder.status === 'completed'}
                    >
                      Complete task
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'dispatched')}
                      className="flex-1 text-[10px] py-1.5 h-auto bg-gradient-to-r from-accent-cyan to-indigo-600"
                      disabled={selectedOrder.status === 'dispatched'}
                    >
                      Dispatch Eng
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Overrides */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-primary-400" /> Vibration Limits (mm/s)
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>Warning Threshold</span>
                  <span className="text-white font-mono">{vibrationLimit} mm/s</span>
                </div>
                <input
                  type="range" min="3.0" max="10.0" step="0.5"
                  value={vibrationLimit} onChange={(e) => setVibrationLimit(parseFloat(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>
            </Card>

            {/* Dispatch notes form */}
            <Card className="bg-surface-900 border border-white/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Shift Dispatch Notes Log
              </h3>
              <form onSubmit={handlePostNotes} className="space-y-3 text-xs">
                <textarea
                  rows={2} value={dispatchNote} onChange={(e) => setDispatchNote(e.target.value)}
                  placeholder="Enter details about materials dispatch, parts delays..."
                  className="w-full bg-surface-850 border border-white/5 text-white rounded p-2 text-xs focus:ring-0 focus:border-primary-500"
                />
                <Button type="submit" className="w-full text-[10px] py-1.5 h-auto">
                  {noteStatus ? 'Notes Logged!' : 'Post Shift Update'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
