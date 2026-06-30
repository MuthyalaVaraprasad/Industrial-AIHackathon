import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, GitBranch } from 'lucide-react';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { cn } from '@/utils';
import type { PIDEquipment } from '@/types';

export default function PIDPage() {
  const [selected, setSelected] = useState<PIDEquipment | null>(null);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['pid'],
    queryFn: modulesApi.getPIDDrawing,
  });

  const handleSelect = (eq: PIDEquipment) => {
    setSelected(eq);
    const connected = new Set([eq.tag, ...eq.connections]);
    setHighlighted(connected);
  };

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">P&ID Intelligence</h1>
            <p className="page-subtitle">Equipment detection, tag extraction, and relationship mapping</p>
          </div>
          <Button variant="secondary" size="sm"><Upload className="w-4 h-4" /> Upload P&ID</Button>
        </div>

        {isLoading ? (
          <div className="skeleton h-96 rounded-2xl" />
        ) : data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 relative overflow-hidden" padding="none">
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="info">{data.name}</Badge>
              </div>
              <div className="relative w-full aspect-[16/10] bg-surface-800/50">
                <svg viewBox="0 0 100 80" className="w-full h-full">
                  {data.equipment.flatMap((eq) =>
                    eq.connections.map((conn) => {
                      const target = data.equipment.find((e) => e.tag === conn);
                      if (!target) return null;
                      return (
                        <line
                          key={`${eq.tag}-${conn}`}
                          x1={eq.x} y1={eq.y} x2={target.x} y2={target.y}
                          stroke={highlighted.has(eq.tag) && highlighted.has(conn) ? '#6366f1' : '#334155'}
                          strokeWidth={highlighted.has(eq.tag) && highlighted.has(conn) ? 0.8 : 0.3}
                        />
                      );
                    })
                  )}
                  {data.equipment.map((eq) => (
                    <g key={eq.id} onClick={() => handleSelect(eq)} className="cursor-pointer">
                      <circle
                        cx={eq.x} cy={eq.y} r={3}
                        fill={highlighted.has(eq.tag) ? '#6366f1' : eq.type === 'Pump' ? '#22d3ee' : eq.type.includes('Indicator') ? '#a855f7' : '#10b981'}
                        stroke={selected?.id === eq.id ? '#fff' : 'transparent'}
                        strokeWidth={0.5}
                      />
                      <text x={eq.x} y={eq.y - 4} textAnchor="middle" fill="#94a3b8" fontSize="2.5">{eq.tag}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </Card>

            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary-400" /> Extracted Equipment
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                  {data.equipment.map((eq) => (
                    <button
                      key={eq.id}
                      onClick={() => handleSelect(eq)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        selected?.id === eq.id ? 'bg-primary-500/20 text-white border border-primary-500/30' : 'bg-surface-800/50 text-slate-400 hover:text-white'
                      )}
                    >
                      <span className="font-medium">{eq.tag}</span>
                      <span className="text-xs text-slate-500 ml-2">{eq.type}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {selected && (
                <Card>
                  <h3 className="font-semibold text-white mb-3">{selected.tag} Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="text-white">{selected.type}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Unit</span><span className="text-white">{data.unit}</span></div>
                    <div>
                      <span className="text-slate-500">Connections</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selected.connections.map((c) => <Badge key={c} variant="info">{c}</Badge>)}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
