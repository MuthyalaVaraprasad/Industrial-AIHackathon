import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Users, Shield, Save, Server, RefreshCw } from 'lucide-react';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Loading';
import type { SystemSettings, UserRole } from '@/types';

const ROLES: UserRole[] = ['admin', 'manager', 'engineer', 'technician', 'auditor'];
const roleColors: Record<UserRole, 'success' | 'info' | 'warning' | 'default' | 'danger'> = {
  admin: 'danger', manager: 'warning', engineer: 'info', technician: 'default', auditor: 'success',
};

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: modulesApi.getAdminUsers });
  const settingsQuery = useQuery({
    queryKey: ['admin-settings'],
    queryFn: modulesApi.getSystemSettings,
  });

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: modulesApi.getHealth,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (settingsQuery.data && !settings) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data, settings]);

  const saveMutation = useMutation({
    mutationFn: () => modulesApi.updateSystemSettings(settings!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-settings'] }),
  });

  if (usersQuery.isError || settingsQuery.isError) {
    return <PageTransition><ErrorState onRetry={() => { usersQuery.refetch(); settingsQuery.refetch(); }} /></PageTransition>;
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">User management, roles, permissions, and system settings</p>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-accent-green" /> System Integrations
            </h2>
            <Button variant="ghost" size="sm" onClick={() => healthQuery.refetch()}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
          {healthQuery.isLoading ? (
            <SkeletonCard />
          ) : healthQuery.data && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={healthQuery.data.integrations.fullyIntegrated ? 'success' : 'warning'}>
                  {healthQuery.data.integrations.live}/{healthQuery.data.integrations.total} services live
                </Badge>
                <span className="text-sm text-slate-500">{healthQuery.data.environment}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {healthQuery.data.services.map((service) => (
                  <div key={service.name} className="p-4 rounded-xl bg-surface-800/50 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white text-sm">{service.name}</span>
                      <Badge variant={service.connected ? 'success' : service.mode === 'demo' ? 'warning' : 'default'}>
                        {service.mode}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{service.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-400" /> User Management
          </h2>
          {usersQuery.isLoading ? (
            <SkeletonCard />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-white/5">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {usersQuery.data?.map((u) => (
                    <tr key={u.id} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-white">{u.name}</td>
                      <td className="py-3 pr-4 text-slate-400">{u.email}</td>
                      <td className="py-3 pr-4"><Badge variant={roleColors[u.role]}>{u.role}</Badge></td>
                      <td className="py-3 pr-4"><Badge variant={u.status === 'active' ? 'success' : 'default'}>{u.status}</Badge></td>
                      <td className="py-3 text-slate-400">{new Date(u.lastLogin).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-cyan" /> Roles & Permissions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLES.map((role) => (
              <div key={role} className="p-4 rounded-xl bg-surface-800/50">
                <Badge variant={roleColors[role]} className="mb-2 capitalize">{role}</Badge>
                <p className="text-xs text-slate-400">
                  {role === 'admin' && 'Full system access, user management, settings'}
                  {role === 'manager' && 'Dashboard, reports, executive center, approvals'}
                  {role === 'engineer' && 'Documents, copilot, RCA, knowledge graph'}
                  {role === 'technician' && 'Maintenance, QR scanner, work orders'}
                  {role === 'auditor' && 'Compliance, reports, audit trails'}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {settings && (
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent-purple" /> System Settings
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label-text">Gemini Model</label>
                <input className="input-field" value={settings.geminiModel} onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Alert Threshold (%)</label>
                <input type="number" className="input-field" value={settings.alertThreshold} onChange={(e) => setSettings({ ...settings, alertThreshold: +e.target.value })} />
              </div>
              <div>
                <label className="label-text">Data Retention (days)</label>
                <input type="number" className="input-field" value={settings.retentionDays} onChange={(e) => setSettings({ ...settings, retentionDays: +e.target.value })} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="autoProcessing" checked={settings.autoProcessing} onChange={(e) => setSettings({ ...settings, autoProcessing: e.target.checked })} className="w-4 h-4 accent-primary-500" />
                <label htmlFor="autoProcessing" className="text-sm text-slate-300">Auto-process uploaded documents</label>
              </div>
            </div>
            <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
              <Save className="w-4 h-4" /> Save Settings
            </Button>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
