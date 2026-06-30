import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, AlertTriangle, Shield, Wrench, BellRing } from 'lucide-react';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Loading';
import { cn } from '@/utils';
import type { AlertItem } from '@/types';

const typeIcon = { risk: AlertTriangle, compliance: Shield, maintenance: Wrench };
const severityVariant = { low: 'info', medium: 'warning', high: 'danger', critical: 'danger' } as const;

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: modulesApi.getAlerts,
  });

  const ackMutation = useMutation({
    mutationFn: modulesApi.acknowledgeAlert,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  // Track browser notification API permission state
  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setBrowserPermission(result);
      if (result === 'granted') {
        new Notification('Industria AI 2.0', {
          body: 'Real-time plant critical notifications enabled successfully!',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const unacknowledged = data?.filter((a) => !a.acknowledged).length ?? 0;

  // Filter alerts by selected severity tabs
  const getFilteredAlerts = (alerts: AlertItem[]) => {
    if (activeTab === 'all') return alerts;
    return alerts.filter(a => {
      if (activeTab === 'critical') return a.severity === 'critical' || a.severity === 'high';
      if (activeTab === 'warning') return a.severity === 'medium';
      if (activeTab === 'info') return a.severity === 'low';
      return true;
    });
  };

  const alertsList = data ? getFilteredAlerts(data) : [];

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Alerts & Notifications</h1>
            <p className="page-subtitle">Risk, compliance, and maintenance alerts</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Browser notification activation button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={requestNotificationPermission}
              className="text-xs font-semibold flex items-center gap-1.5"
            >
              <BellRing className="w-4 h-4 text-accent-cyan" />
              {browserPermission === 'granted' ? 'Alerts Enabled' : 'Enable Browser Alerts'}
            </Button>
            {unacknowledged > 0 && (
              <Badge variant="danger" className="animate-pulse">{unacknowledged} Unacknowledged</Badge>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-thin">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'critical', label: 'Critical & High' },
            { id: 'warning', label: 'Warnings' },
            { id: 'info', label: 'Information' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer',
                activeTab === tab.id
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-300'
                  : 'bg-surface-800 border-white/5 text-slate-400 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : alertsList.length === 0 ? (
          <Card className="text-center py-16">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-white mb-1">No alerts found</h3>
            <p className="text-xs text-slate-500">All systems operational for chosen filter category.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {alertsList.map((alert) => (
              <AlertRow key={alert.id} alert={alert} onAcknowledge={() => ackMutation.mutate(alert.id)} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function AlertRow({ alert, onAcknowledge }: { alert: AlertItem; onAcknowledge: () => void }) {
  const Icon = typeIcon[alert.type] || Bell;

  return (
    <Card padding="sm" className={cn('transition-all duration-300 border border-transparent', alert.acknowledged ? 'opacity-50 hover:opacity-70 bg-surface-800/20' : 'hover:border-white/10 bg-surface-850/50')}>
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
          alert.severity === 'critical'
            ? 'bg-accent-red/10 border-accent-red/20 text-accent-red'
            : alert.severity === 'high'
              ? 'bg-accent-amber/10 border-accent-amber/20 text-accent-amber'
              : 'bg-surface-700 border-white/5 text-slate-400'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-white text-xs md:text-sm">{alert.title}</h3>
            <Badge variant={severityVariant[alert.severity]} className="text-[9px] uppercase tracking-wider">{alert.severity}</Badge>
            <Badge variant="default" className="capitalize text-[9px]">{alert.type}</Badge>
            {alert.assetTag && <Badge variant="info" className="text-[9px] font-mono">{alert.assetTag}</Badge>}
          </div>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed leading-5">{alert.description}</p>
          <p className="text-[10px] text-slate-500 mt-1.5">{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</p>
        </div>
        {!alert.acknowledged && (
          <Button variant="ghost" size="sm" onClick={onAcknowledge} aria-label="Acknowledge alert" className="h-8 px-2.5 text-xs text-primary-400 hover:text-white border border-white/5 shrink-0 ml-2">
            <Check className="w-3.5 h-3.5 mr-0.5" /> Ack
          </Button>
        )}
      </div>
    </Card>
  );
}
