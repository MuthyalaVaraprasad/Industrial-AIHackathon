import { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, useNodesState, useEdgesState,
  type Node, type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { GraphData, GraphNode } from '@/types';
import { cn } from '@/utils';
import {
  Download, X, Share2, FileText, Wrench, Shield, Search,
  BarChart2, Info, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const NODE_COLORS: Record<GraphNode['type'], string> = {
  asset: '#6366f1',
  maintenance: '#10b981',
  incident: '#ef4444',
  inspection: '#22d3ee',
  alert: '#f59e0b',
  report: '#a855f7',
};

function toFlowNodes(nodes: GraphNode[], selected: string | null): Node[] {
  const positions: Record<string, { x: number; y: number }> = {
    p101: { x: 250, y: 200 },
    v203: { x: 100, y: 100 },
    hx301: { x: 400, y: 100 },
    c204: { x: 400, y: 350 },
    m1: { x: 50, y: 250 },
    m2: { x: 150, y: 350 },
    i1: { x: 350, y: 250 },
    in1: { x: 500, y: 200 },
    a1: { x: 300, y: 50 },
    r1: { x: 550, y: 300 },
  };

  return nodes.map((node) => ({
    id: node.id,
    position: positions[node.id] || { x: Math.random() * 400, y: Math.random() * 300 },
    data: {
      label: (
        <div className={cn('px-3 py-2 rounded-lg text-xs font-medium text-white', selected === node.id && 'ring-2 ring-white/50')}>
          <div className="font-semibold">{node.label}</div>
          <div className="text-[10px] opacity-70 capitalize">{node.type}</div>
        </div>
      ),
    },
    style: {
      background: NODE_COLORS[node.type],
      border: 'none',
      borderRadius: 12,
      padding: 0,
      width: 'auto',
      boxShadow: selected === node.id ? '0 0 20px rgba(99,102,241,0.5)' : '0 4px 12px rgba(0,0,0,0.3)',
    },
  }));
}

function toFlowEdges(edges: GraphData['edges']): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 1.5 },
    labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 500 },
  }));
}

interface GraphExplorerProps {
  data: GraphData;
}

export function GraphExplorer({ data }: GraphExplorerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredNodes = useMemo(() => {
    return data.nodes.filter((n) => {
      const matchesSearch = n.label.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || n.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [data.nodes, search, filter]);

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = data.edges.filter(
    (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes(toFlowNodes(filteredNodes, selected));
    setEdges(toFlowEdges(filteredEdges));
  }, [filteredNodes, filteredEdges, selected, setNodes, setEdges]);

  const selectedNode = data.nodes.find((n) => n.id === selected);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelected(node.id);
    setDrawerOpen(true);
  }, []);

  const handleExportGraph = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'knowledge_graph_export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Node stats summary mapping
  const graphStats = useMemo(() => {
    const stats: Record<string, number> = {};
    data.nodes.forEach(n => {
      stats[n.type] = (stats[n.type] || 0) + 1;
    });
    return {
      totalNodes: data.nodes.length,
      totalEdges: data.edges.length,
      byType: stats
    };
  }, [data]);

  // Mock relations for detail view
  const getNodeRelationsDetails = (node: GraphNode) => {
    if (!node) return { docs: [], assets: [], history: [], compliance: [], insights: '' };
    
    return {
      docs: [
        { title: `${node.label} Operations Manual`, source: 'Ingested PDF' },
        { title: `Incident Investigation Report - ${node.id.toUpperCase()}`, source: 'RCA Center' }
      ],
      assets: [
        { label: 'Centrifugal Pump P-101', type: 'Upstream' },
        { label: 'Control Valve V-203', type: 'Downstream' }
      ],
      history: [
        { date: '2026-06-15', action: 'Standard recalibration check', tech: 'Marcus Vance' },
        { date: '2026-05-10', action: 'Visual flange seal inspection', tech: 'Marcus Vance' }
      ],
      compliance: [
        { standard: 'ISO 45001 (Safety)', status: 'Compliant' },
        { standard: 'OSHA standard 1910.119', status: 'Requires Verification' }
      ],
      insights: `AI Prediction: Based on RAG ingestion, ${node.label} shows a correlation with high vibration indices during peak load loops. I recommend vibration checking within 14 days.`
    };
  };

  const details = selectedNode ? getNodeRelationsDetails(selectedNode) : null;

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search graph nodes..."
              className="input-field pl-10 text-sm !mb-0"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field text-sm w-full sm:w-44 !mb-0"
          >
            <option value="all">All Node Types</option>
            <option value="asset">Assets</option>
            <option value="maintenance">Maintenance</option>
            <option value="incident">Incidents</option>
            <option value="inspection">Inspections</option>
            <option value="alert">Alerts</option>
            <option value="report">Reports</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportGraph}>
            <Download className="w-4 h-4" /> Export Graph (JSON)
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[600px] relative overflow-hidden">
        {/* ReactFlow Canvas */}
        <div className="flex-1 glass-card overflow-hidden rounded-2xl relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#1a2340" gap={20} />
            <Controls className="!bg-surface-700 !border-white/10 !rounded-xl [&>button]:!bg-surface-600 [&>button]:!border-white/10 [&>button]:!text-white" />
            <MiniMap
              nodeColor={(n) => {
                const node = data.nodes.find((nd) => nd.id === n.id);
                return node ? NODE_COLORS[node.type] : '#6366f1';
              }}
              className="!bg-surface-800 !border-white/10 !rounded-xl"
            />
          </ReactFlow>

          {/* Collapsible Stats Legend overlay */}
          <div className="absolute top-4 left-4 z-10 glass-card p-3 max-w-xs space-y-2 text-xs">
            <h4 className="font-semibold text-white flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> Graph Summary</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
              <span>Total Nodes:</span><span className="text-white font-medium">{graphStats.totalNodes}</span>
              <span>Total Relations:</span><span className="text-white font-medium">{graphStats.totalEdges}</span>
            </div>
            <div className="pt-1.5 border-t border-white/5 space-y-1">
              {Object.entries(graphStats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center gap-1.5 capitalize text-slate-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: NODE_COLORS[type as GraphNode['type']] }} />
                  <span>{type}s:</span><span className="text-white ml-auto">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sliding Details Drawer */}
        <div className={cn(
          'fixed lg:absolute top-0 right-0 z-50 h-full w-full sm:w-96 bg-surface-800/95 backdrop-blur-xl border-l border-white/5 shadow-2xl transition-transform duration-300 transform flex flex-col',
          drawerOpen && selectedNode ? 'translate-x-0' : 'translate-x-full'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 rounded-full" style={{ backgroundColor: selectedNode ? NODE_COLORS[selectedNode.type] : '#6366f1' }} />
              <div>
                <h3 className="font-semibold text-white text-sm">{selectedNode?.label}</h3>
                <p className="text-[10px] text-slate-500 capitalize">{selectedNode?.type} details</p>
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-surface-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          {selectedNode && details && (
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5 text-xs">
              {/* Properties Card */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-400 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Node Metadata</h4>
                <div className="p-3 rounded-xl bg-surface-850 border border-white/5 space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">ID Reference</span><span className="text-white font-mono">{selectedNode.id}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Classification</span><span className="text-white capitalize">{selectedNode.type}</span></div>
                  {selectedNode.data && Object.entries(selectedNode.data).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500 capitalize">{k}</span>
                      <span className="text-white font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RAG AI Insights */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-400 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-accent-amber" /> AI Copilot Insights</h4>
                <p className="p-3 rounded-xl bg-accent-amber/5 border border-accent-amber/10 text-slate-300 leading-relaxed font-medium">
                  {details.insights}
                </p>
              </div>

              {/* Related Documents */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-400 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Related Manuals</h4>
                <div className="space-y-1.5">
                  {details.docs.map((doc, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface-850 border border-white/5 flex items-center justify-between">
                      <span className="text-white font-medium truncate">{doc.title}</span>
                      <Badge variant="info" className="text-[9px]">{doc.source}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Assets */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-400 flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Related Asset Pipeline</h4>
                <div className="space-y-1.5">
                  {details.assets.map((asset, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface-850 border border-white/5 flex items-center justify-between">
                      <span className="text-white font-medium">{asset.label}</span>
                      <span className="text-slate-500 text-[10px]">{asset.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance History */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-400 flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> Maintenance History</h4>
                <div className="space-y-1.5">
                  {details.history.map((hist, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface-850 border border-white/5 space-y-1">
                      <div className="flex justify-between font-semibold text-white">
                        <span>{hist.action}</span>
                        <span>{hist.date}</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">Technician: {hist.tech}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance & Standards Links */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-400 flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Compliance Links</h4>
                <div className="space-y-1.5">
                  {details.compliance.map((comp, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface-850 border border-white/5 flex items-center justify-between">
                      <span className="text-white font-medium">{comp.standard}</span>
                      <Badge variant={comp.status === 'Compliant' ? 'success' : 'warning'} className="text-[9px]">
                        {comp.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
