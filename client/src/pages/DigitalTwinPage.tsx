import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { PlantTwin, PlantTwinLegend } from '@/features/digital-twin/PlantTwin';
import type { TwinAsset } from '@/types';

export default function DigitalTwinPage() {
  const [selected, setSelected] = useState<TwinAsset | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['digital-twin'],
    queryFn: modulesApi.getDigitalTwin,
  });

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Digital Twin</h1>
            <p className="page-subtitle">Interactive 3D plant overview with real-time asset health</p>
          </div>
          <PlantTwinLegend />
        </div>

        {isLoading ? (
          <div className="skeleton h-[500px] rounded-2xl" />
        ) : data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PlantTwin assets={data} selectedAsset={selected} onSelectAsset={setSelected} />
            </div>
            <div className="space-y-4">
              {selected ? (
                <Card>
                  <h3 className="font-semibold text-white mb-3">{selected.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Tag</span><span className="text-white">{selected.tag}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Health</span><span className="text-white">{selected.healthScore}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Status</span><Badge variant={selected.status === 'healthy' ? 'success' : selected.status === 'warning' ? 'warning' : 'danger'}>{selected.status}</Badge></div>
                  </div>
                </Card>
              ) : (
                <Card><p className="text-sm text-slate-500">Click an asset in the 3D view to see details</p></Card>
              )}
              <Card>
                <h3 className="font-semibold text-white mb-3">All Assets</h3>
                <div className="space-y-2">
                  {data.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => setSelected(asset)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors text-sm"
                    >
                      <span className="text-white">{asset.tag}</span>
                      <Badge variant={asset.status === 'healthy' ? 'success' : asset.status === 'warning' ? 'warning' : 'danger'}>{asset.healthScore}%</Badge>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
