import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import {
  User, Settings, Shield, Bell, Key, Check,
  Laptop, Moon, Sun, Trash2, Eye, EyeOff, BellRing
} from 'lucide-react';
import { cn } from '@/utils';
import type { UserRole } from '@/types';

const ROLES: UserRole[] = ['admin', 'manager', 'engineer', 'technician', 'auditor'];

interface SettingsNotificationItem {
  id: string;
  title: string;
  category: 'risk' | 'maintenance' | 'compliance';
  time: string;
  read: boolean;
}

const INITIAL_MOCK_NOTIFICATIONS: SettingsNotificationItem[] = [
  { id: 'n-1', title: 'Pump P-101 high vibration deviation alert logged', category: 'risk', time: '10m ago', read: false },
  { id: 'n-2', title: 'OSHA compliance valve safety audit update required', category: 'compliance', time: '1h ago', read: false },
  { id: 'n-3', title: 'Heat Exchanger HX-301 maintenance schedule set', category: 'maintenance', time: '4h ago', read: true }
];

export default function SettingsPage() {
  const { user, updateUserProfile, loading } = useAuth();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security' | 'accessibility'>('profile');

  // Profile Form states
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [company, setCompany] = useState('Industria Global Corp');
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'engineer');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

  // Preferences states
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC-5 (EST)');

  // Notification Toggles states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [alertCategories, setAlertCategories] = useState({
    risk: true,
    maintenance: true,
    compliance: false,
  });

  // Notification center alerts feed
  const [notificationsList, setNotificationsList] = useState<SettingsNotificationItem[]>(INITIAL_MOCK_NOTIFICATIONS);

  // Security States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; key: string; created: string }[]>([
    { id: '1', name: 'Gemini RAG Integration', key: 'ind_live_8f3a...91bc', created: '2026-05-14' },
    { id: '2', name: 'IoT Gateway Connector', key: 'ind_live_d2c9...55ee', created: '2026-06-01' }
  ]);
  const [newKeyName, setNewKeyName] = useState('');

  // Accessibility States
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Status notification
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setEmail(user.email);
      setSelectedRole(user.role);
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  // Sync theme selection to HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        displayName,
        email,
        role: selectedRole,
        photoURL
      });
      showStatus('success', 'Profile details and avatar updated successfully.');
    } catch (err) {
      showStatus('error', err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showStatus('success', 'Preferences saved and theme applied.');
    }, 650);
  };

  const handleNotificationsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showStatus('success', 'Notification channels configuration updated.');
    }, 550);
  };

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword.length < 6) {
      showStatus('error', 'New password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      showStatus('success', 'Security details updated successfully.');
    }, 700);
  };

  const generateApiKey = () => {
    if (!newKeyName.trim()) return;
    const randomHex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey = {
      id: String(Date.now()),
      name: newKeyName.trim(),
      key: `ind_live_${randomHex}...${Date.now().toString().slice(-4)}`,
      created: new Date().toISOString().split('T')[0]
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    showStatus('success', `API Token key "${newKey.name}" generated.`);
  };

  const revokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    showStatus('success', 'API Token Key revoked.');
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all configurations to default?')) {
      setTheme('dark');
      setLanguage('en');
      setTimezone('UTC-5 (EST)');
      setEmailAlerts(true);
      setSmsAlerts(false);
      setPushAlerts(true);
      setAlertCategories({ risk: true, maintenance: true, compliance: false });
      setFontSize('md');
      setHighContrast(false);
      setReducedMotion(false);
      showStatus('success', 'All configuration settings reset to default.');
    }
  };

  const handleMarkAllRead = () => {
    setNotificationsList((prev) => prev.map(n => ({ ...n, read: true })));
    showStatus('success', 'Marked all notifications as read.');
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Settings & Profile</h1>
            <p className="page-subtitle">Configure your personal profile details, notification feeds, appearance, and access</p>
          </div>
          <Button variant="secondary" onClick={handleResetSettings} className="text-xs">
            Reset Settings
          </Button>
        </div>

        {statusMsg && (
          <div className={cn(
            'p-4 rounded-xl text-xs border flex items-center gap-2 transition-all',
            statusMsg.type === 'success'
              ? 'bg-accent-green/10 border-accent-green/20 text-accent-green'
              : 'bg-accent-red/10 border-accent-red/20 text-accent-red'
          )}>
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Side navigation tabs */}
          <div className="md:col-span-1 space-y-1">
            {[
              { id: 'profile', label: 'Profile Details', icon: User },
              { id: 'preferences', label: 'Preferences', icon: Settings },
              { id: 'notifications', label: 'Notifications Feed', icon: Bell },
              { id: 'security', label: 'Security & APIs', icon: Shield },
              { id: 'accessibility', label: 'Accessibility', icon: Key }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer',
                    activeTab === tab.id
                      ? 'bg-primary-500/10 border-primary-500/20 text-primary-300'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-surface-800'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Card Content */}
          <div className="md:col-span-3">
            {/* Tab: Profile */}
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-sm font-semibold text-white mb-6">User Profile Details</h2>
                <form onSubmit={handleProfileSave} className="space-y-6">
                  
                  {/* Profile Header View (Google Integration support) */}
                  <div className="flex items-center gap-4 pb-5 border-b border-white/5">
                    {photoURL ? (
                      <img
                        src={photoURL}
                        alt="Profile Avatar"
                        className="w-16 h-16 rounded-full object-cover border border-white/10 shadow-lg shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                        {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{displayName || 'User Profile'}</h3>
                      <p className="text-xs text-slate-500 capitalize">{selectedRole} Account Portal</p>
                    </div>
                  </div>

                  {/* Profile Avatar Selection Preset Grid */}
                  <div className="space-y-2.5">
                    <label className="label-text">Choose Profile Avatar Preset</label>
                    <div className="flex flex-wrap items-center gap-3">
                      {[
                        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80&q=80',
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80',
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
                        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80'
                      ].map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoURL(presetUrl)}
                          className={cn(
                            'w-11 h-11 rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105',
                            photoURL === presetUrl ? 'border-primary-500 scale-105' : 'border-transparent'
                          )}
                        >
                          <img src={presetUrl} alt={`Avatar-${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => setPhotoURL('')} className="text-[10px] p-2 hover:bg-surface-800">
                        Clear Photo
                      </Button>
                    </div>

                    <Input
                      label="Or Custom Photo URL Link"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      placeholder="Paste image web link URL (e.g. https://example.com/photo.jpg)"
                      className="text-xs !mb-0"
                    />
                  </div>

                  {/* Profile inputs */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@plant.com"
                      required
                    />
                    <Input
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                    <Input
                      label="Company / Unit Branch"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="label-text">Select Active System Permission Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="input-field text-xs capitalize"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r} Dashboard View
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      System permission roles toggle access rights and RAG decision dashboards globally.
                    </p>
                  </div>

                  <Button type="submit" loading={saving || loading} className="w-full">
                    Save Profile Settings
                  </Button>
                </form>
              </Card>
            )}

            {/* Tab: Preferences */}
            {activeTab === 'preferences' && (
              <Card>
                <h2 className="text-sm font-semibold text-white mb-6">User Customization Preferences</h2>
                <form onSubmit={handlePreferencesSave} className="space-y-6">
                  
                  {/* Theme toggles */}
                  <div>
                    <label className="label-text mb-3 block">Application Color Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={cn(
                          'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all',
                          theme === 'light' ? 'bg-primary-500/10 border-primary-500 text-white shadow-lg' : 'bg-surface-850 border-white/5 text-slate-400 hover:text-white'
                        )}
                      >
                        <Sun className="w-4 h-4 mb-1.5 text-accent-amber" />
                        Light Theme
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={cn(
                          'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all',
                          theme === 'dark' ? 'bg-primary-500/10 border-primary-500 text-white shadow-lg' : 'bg-surface-850 border-white/5 text-slate-400 hover:text-white'
                        )}
                      >
                        <Moon className="w-4 h-4 mb-1.5 text-primary-400" />
                        Dark Theme
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('system')}
                        className={cn(
                          'flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all',
                          theme === 'system' ? 'bg-primary-500/10 border-primary-500 text-white shadow-lg' : 'bg-surface-850 border-white/5 text-slate-400 hover:text-white'
                        )}
                      >
                        <Laptop className="w-4 h-4 mb-1.5 text-accent-cyan" />
                        System Sync
                      </button>
                    </div>
                  </div>

                  {/* Language and Timezone */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label-text">Interface Language</label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field text-xs">
                        <option value="en">English (US)</option>
                        <option value="es">Español (ES)</option>
                        <option value="de">Deutsch (DE)</option>
                        <option value="fr">Français (FR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="label-text">Operational Timezone</label>
                      <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field text-xs">
                        <option value="UTC-5 (EST)">UTC-5 (EST — Eastern Time)</option>
                        <option value="UTC-0 (GMT)">UTC-0 (GMT — Greenwhich Time)</option>
                        <option value="UTC+1 (CET)">UTC+1 (CET — Central European)</option>
                        <option value="UTC+5:30 (IST)">UTC+5:30 (IST — Indian Standard)</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" loading={saving} className="w-full">
                    Save Preferences
                  </Button>
                </form>
              </Card>
            )}

            {/* Tab: Notifications & Alert Notification Center Feed */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* Notification Feed center overlay */}
                <Card>
                  <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                    <h3 className="font-semibold text-white text-xs flex items-center gap-1.5"><BellRing className="w-4 h-4 text-accent-cyan animate-pulse" /> Live Alert Notification Center</h3>
                    <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-[10px] p-2 hover:bg-surface-800">
                      Mark All Read
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {notificationsList.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'p-3 rounded-lg border flex justify-between items-center text-xs transition-all',
                          notif.read ? 'bg-surface-850/50 border-white/5 opacity-60' : 'bg-primary-500/5 border-primary-500/10 font-medium'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            notif.category === 'risk' ? 'bg-accent-red' : notif.category === 'maintenance' ? 'bg-accent-amber' : 'bg-accent-cyan'
                          )} />
                          <span className="text-white truncate max-w-[200px] sm:max-w-sm">{notif.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Configurations card */}
                <Card>
                  <h2 className="text-sm font-semibold text-white mb-6">Channel Subscriptions</h2>
                  <form onSubmit={handleNotificationsSave} className="space-y-6">
                    <div className="space-y-3.5 pb-5 border-b border-white/5">
                      <div className="flex items-center justify-between py-1.5">
                        <div>
                          <p className="text-xs font-semibold text-white">Email Subscriptions</p>
                          <p className="text-[10px] text-slate-500">Weekly report templates updates digests.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailAlerts}
                          onChange={(e) => setEmailAlerts(e.target.checked)}
                          className="w-4 h-4 accent-primary-500"
                        />
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <div>
                          <p className="text-xs font-semibold text-white">SMS Critical Alerts</p>
                          <p className="text-[10px] text-slate-500">Emergency mobile text loops notification broadcasts.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={smsAlerts}
                          onChange={(e) => setSmsAlerts(e.target.checked)}
                          className="w-4 h-4 accent-primary-500"
                        />
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <div>
                          <p className="text-xs font-semibold text-white">Browser Push Alerts</p>
                          <p className="text-[10px] text-slate-500">Real-time desktop system alerts.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={pushAlerts}
                          onChange={(e) => setPushAlerts(e.target.checked)}
                          className="w-4 h-4 accent-primary-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-slate-300">Category Filters</h3>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-slate-500">Fault Diagnostic Alarms</span>
                        <input
                          type="checkbox"
                          checked={alertCategories.risk}
                          onChange={(e) => setAlertCategories({ ...alertCategories, risk: e.target.checked })}
                          className="w-4 h-4 accent-accent-red"
                        />
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs text-slate-500">Predictive Overhaul Milestones</span>
                        <input
                          type="checkbox"
                          checked={alertCategories.maintenance}
                          onChange={(e) => setAlertCategories({ ...alertCategories, maintenance: e.target.checked })}
                          className="w-4 h-4 accent-accent-amber"
                        />
                      </div>
                    </div>

                    <Button type="submit" loading={saving} className="w-full">
                      Save Notification Options
                    </Button>
                  </form>
                </Card>
              </div>
            )}

            {/* Tab: Security & Personal API keys */}
            {activeTab === 'security' && (
              <Card className="space-y-8">
                <div>
                  <h2 className="text-sm font-semibold text-white mb-4">Reset Portal Account Password</h2>
                  <form onSubmit={handleSecuritySave} className="space-y-4">
                    <div className="relative">
                      <Input
                        label="Current Password"
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-9 text-slate-500 hover:text-white"
                      >
                        {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        label="New Password"
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-9 text-slate-500 hover:text-white"
                      >
                        {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <Button type="submit" loading={saving} disabled={!currentPassword || !newPassword} className="w-full">
                      Update password
                    </Button>
                  </form>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h3 className="text-sm font-semibold text-white">Client Personal API Tokens</h3>
                  <div className="flex gap-2">
                    <Input
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Token key name description"
                      className="!mb-0 text-xs flex-1"
                    />
                    <Button variant="secondary" onClick={generateApiKey} disabled={!newKeyName.trim()} className="text-xs px-3">
                      Generate
                    </Button>
                  </div>
                  <div className="space-y-2 mt-4">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-850 border border-white/5 text-xs">
                        <div>
                          <p className="font-semibold text-white">{key.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{key.key} • Created {key.created}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-accent-red hover:bg-accent-red/10" onClick={() => revokeApiKey(key.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Tab: Accessibility */}
            {activeTab === 'accessibility' && (
              <Card>
                <h2 className="text-sm font-semibold text-white mb-6">Accessibility Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="label-text mb-2 block">Interface Text Sizing</label>
                    <div className="flex gap-2">
                      {(['sm', 'md', 'lg'] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setFontSize(sz)}
                          className={cn(
                            'flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer',
                            fontSize === sz ? 'bg-primary-500/10 border-primary-500 text-white' : 'bg-surface-850 border-white/5 text-slate-500 hover:text-white'
                          )}
                        >
                          {sz === 'sm' && 'Small'}
                          {sz === 'md' && 'Medium (Default)'}
                          {sz === 'lg' && 'Large'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <div>
                        <p className="text-xs font-semibold text-white">Optimize High Contrast UI Elements</p>
                        <p className="text-[10px] text-slate-500">Provides higher visibility outlines.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={highContrast}
                        onChange={(e) => setHighContrast(e.target.checked)}
                        className="w-4 h-4 accent-primary-500"
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-xs font-semibold text-white">Deactivate Structural Page Zoom Animations</p>
                        <p className="text-[10px] text-slate-500">Provides static views without page load transitions.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={reducedMotion}
                        onChange={(e) => setReducedMotion(e.target.checked)}
                        className="w-4 h-4 accent-primary-500"
                      />
                    </div>
                  </div>

                  <Button onClick={() => showStatus('success', 'Accessibility configurations applied.')} className="w-full">
                    Apply Accessibility Settings
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
