import { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, useNodesState, useEdgesState,
  type Node, type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { GraphData, GraphNode } from '@/types';
import { cn } from '@/utils';
import {
  Download, X, FileText, Search, Sparkles, Plus, ToggleLeft
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

function toFlowNodes(nodes: GraphNode[], selected: string | null, nodePositions: Record<string, { x: number; y: number }>): Node[] {
  return nodes.map((node) => ({
    id: node.id,
    position: nodePositions[node.id] || { x: 300, y: 150 + Math.random() * 100 },
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

function toFlowEdges(edges: GraphData['edges'], visibleRelations: Record<string, boolean>): Edge[] {
  return edges
    .filter(edge => {
      const relLabel = (edge.label || '').toLowerCase();
      if (relLabel.includes('flow') && !visibleRelations.flow) return false;
      if (relLabel.includes('recommends') && !visibleRelations.recommends) return false;
      if (relLabel.includes('logs') && !visibleRelations.logs) return false;
      if (relLabel.includes('targets') && !visibleRelations.targets) return false;
      return true;
    })
    .map((edge) => ({
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

export function GraphExplorer({ data: initialData }: GraphExplorerProps) {
  // In-memory Graph data extensions state
  const [graphData, setGraphData] = useState<GraphData>(initialData);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Dynamic Add Node dialog state
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<GraphNode['type']>('asset');
  const [newNodeTargetLink, setNewNodeTargetLink] = useState('p101');

  // Relationship filter state
  const [visibleRelations, setVisibleRelations] = useState({
    flow: true,
    recommends: true,
    logs: true,
    targets: true,
  });

  // Track positions state in memory
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({
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
  });

  const filteredNodes = useMemo(() => {
    return graphData.nodes.filter((n) => {
      const matchesSearch = n.label.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || n.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [graphData.nodes, search, filter]);

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = graphData.edges.filter(
    (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes(toFlowNodes(filteredNodes, selected, nodePositions));
    setEdges(toFlowEdges(filteredEdges, visibleRelations));
  }, [filteredNodes, filteredEdges, selected, visibleRelations, nodePositions, setNodes, setEdges]);

  const selectedNode = graphData.nodes.find((n) => n.id === selected);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelected(node.id);
    setDrawerOpen(true);
  }, []);

  const handleExportGraph = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(graphData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'knowledge_graph_export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    const newId = 'n-' + Date.now();
    const newGraphNode: GraphNode = {
      id: newId,
      label: newNodeLabel.trim(),
      type: newNodeType,
    };

    const newGraphEdge = {
      id: 'e-' + Date.now(),
      source: newNodeTargetLink,
      target: newId,
      label: newNodeType === 'alert' ? 'targets' : newNodeType === 'maintenance' ? 'logs' : 'flow connection',
    };

    // Add node position dynamically near its target parent
    const parentPos = nodePositions[newNodeTargetLink] || { x: 300, y: 200 };
    const nextPos = { x: parentPos.x + (Math.random() - 0.5) * 160, y: parentPos.y + 120 };

    setNodePositions((prev) => ({ ...prev, [newId]: nextPos }));
    setGraphData((prev) => ({
      nodes: [...prev.nodes, newGraphNode],
      edges: [...prev.edges, newGraphEdge],
    }));

    setNewNodeLabel('');
    setAddNodeOpen(false);
  };



  // Relations details mapping
  const getNodeRelationsDetails = (node: GraphNode) => {
    if (!node) return { docs: [], assets: [], history: [], compliance: [], insights: '' };
    
    return {
      docs: [
        { title: `${node.label} Operations Manual.pdf`, source: 'Ingested PDF' },
        { title: `Incident Investigation Report - ${node.id.toUpperCase()}`, source: 'RCA Center' }
      ],
      assets: [
        { label: 'Centrifugal Pump P-101', type: 'Upstream Flow' },
        { label: 'Control Valve V-203', type: 'Downstream Flow' }
      ],
      history: [
        { date: '2026-06-15', action: 'Standard recalibration check', tech: 'Marcus Vance' },
        { date: '2026-05-10', action: 'Visual flange seal inspection', tech: 'Marcus Vance' }
      ],
      compliance: [
        { standard: 'ISO 45001 (Safety)', status: 'Compliant' },
        { standard: 'OSHA Standard 1910.119', status: 'Requires Verification' }
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
              className="input-field pl-10 text-xs md:text-sm !mb-0"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field text-xs md:text-sm w-full sm:w-44 !mb-0"
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
          <Button variant="secondary" size="sm" onClick={() => setAddNodeOpen(true)} className="text-xs">
            <Plus className="w-4 h-4 mr-1" /> Add Test Node
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportGraph} className="text-xs">
            <Download className="w-4 h-4 mr-1" /> Export Graph JSON
          </Button>
        </div>
      </div>

      {/* Dynamic Link Toggles card */}
      <div className="flex flex-wrap gap-4 p-3 bg-surface-900/60 rounded-xl border border-white/5 text-xs text-slate-400">
        <span className="font-semibold flex items-center gap-1"><ToggleLeft className="w-4 h-4 text-primary-400" /> Show Relations:</span>
        {Object.keys(visibleRelations).map((relKey) => (
          <label key={relKey} className="flex items-center gap-1.5 cursor-pointer hover:text-white capitalize select-none">
            <input
              type="checkbox"
              checked={visibleRelations[relKey as keyof typeof visibleRelations]}
              onChange={(e) => setVisibleRelations(prev => ({ ...prev, [relKey]: e.target.checked }))}
              className="w-3.5 h-3.5 accent-primary-500"
            />
            {relKey} links
          </label>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[550px] relative overflow-hidden">
        {/* ReactFlow Canvas */}
        <div className="flex-1 bg-surface-900 border border-white/5 overflow-hidden rounded-2xl relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.5}
            maxZoom={2}
          >
            <Background color="#1e293b" gap={16} size={1} />
            <Controls className="bg-surface-800 border-white/10 rounded" />
            <MiniMap
              nodeColor={(n) => {
                const nodeData = graphData.nodes.find(g => g.id === n.id);
                return nodeData ? NODE_COLORS[nodeData.type] : '#fff';
              }}
              className="bg-surface-900/90 border border-white/5 rounded-lg hidden md:block"
            />
          </ReactFlow>
        </div>

        {/* Floating Side Drawer details Panel */}
        {drawerOpen && selectedNode && details && (
          <div className="w-full lg:w-80 bg-surface-850 border border-white/5 rounded-2xl p-4 overflow-y-auto scrollbar-thin text-xs space-y-4">
            <div className="flex justify-between items-start border-b border-white/5 pb-2">
              <div>
                <Badge variant="info" className="capitalize text-[9px]">{selectedNode.type}</Badge>
                <h3 className="text-sm font-bold text-white mt-1">{selectedNode.label}</h3>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded bg-surface-800 text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* AI Predictions / Insights */}
            <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20 text-slate-200 leading-relaxed font-sans space-y-1">
              <span className="font-semibold text-accent-cyan flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Proactive Insight</span>
              <p className="text-[11px] text-slate-300">{details.insights}</p>
            </div>

            {/* Related Documents */}
            <div className="space-y-1.5">
              <h4 className="font-semibold text-slate-400">Linked Manuals & PDF Logs</h4>
              <div className="space-y-1">
                {details.docs.map((doc, i) => (
                  <div key={i} className="p-2 rounded bg-surface-800 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-accent-red shrink-0" />
                    <span className="truncate text-[10px] text-slate-300">{doc.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flow connections */}
            <div className="space-y-1.5">
              <h4 className="font-semibold text-slate-400">Flow Neighbors</h4>
              <div className="space-y-1">
                {details.assets.map((asset, i) => (
                  <div key={i} className="p-2 rounded bg-surface-800 flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-slate-300">{asset.label}</span>
                    <Badge variant="default" className="text-[8px] py-0">{asset.type}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance ledger */}
            <div className="space-y-1.5">
              <h4 className="font-semibold text-slate-400">Standard Safety Auditing</h4>
              <div className="space-y-1">
                {details.compliance.map((comp, i) => (
                  <div key={i} className="p-2 rounded bg-surface-800 flex justify-between items-center text-[10px]">
                    <span className="text-slate-300">{comp.standard}</span>
                    <Badge variant={comp.status === 'Compliant' ? 'success' : 'warning'} className="text-[8px] py-0">{comp.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Add Node Dialog Modal */}
      {addNodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-surface-900 border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-xs md:text-sm">Add Test Node to Graph</h3>
              <button onClick={() => setAddNodeOpen(false)} className="text-slate-500 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddNode} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Node Label / Tag</label>
                <input
                  required
                  type="text"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="e.g. Compressor C-205"
                  className="w-full bg-surface-850 border border-white/5 text-white rounded-lg p-2.5 text-xs focus:border-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Node Type Category</label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as GraphNode['type'])}
                  className="w-full bg-surface-850 border border-white/5 text-white rounded-lg p-2.5 text-xs focus:border-primary-500"
                >
                  <option value="asset">Asset (Equipment)</option>
                  <option value="maintenance">Maintenance Log</option>
                  <option value="incident">Incident Alert</option>
                  <option value="inspection">HSE Inspection</option>
                  <option value="alert">Safety Alert</option>
                  <option value="report">Diagnostic Report</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Connect to Parent / Origin</label>
                <select
                  value={newNodeTargetLink}
                  onChange={(e) => setNewNodeTargetLink(e.target.value)}
                  className="w-full bg-surface-850 border border-white/5 text-white rounded-lg p-2.5 text-xs focus:border-primary-500"
                >
                  {graphData.nodes.map(node => (
                    <option key={node.id} value={node.id}>{node.label} ({node.type})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={() => setAddNodeOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Add Node</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
