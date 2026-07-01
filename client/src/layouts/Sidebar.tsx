import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Scan, Share2, MessageSquare, GitBranch, Wrench,
  Shield, BookOpen, Search, Box, BarChart3, QrCode, Sliders, Users, Mic,
  FileOutput, Bell, Settings, ChevronLeft, ChevronRight, LogOut, Brain,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/AuthContext';
import { NAV_ITEMS } from '@/utils/navigation';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, FileText, Scan, Share2, MessageSquare, GitBranch, Wrench,
  Shield, BookOpen, Search, Box, BarChart3, QrCode, Sliders, Users, Mic,
  FileOutput, Bell, Settings,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={cn('flex items-center gap-3 p-4 border-b border-white/5', collapsed && 'justify-center')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display font-bold text-white text-sm truncate">INDUSTRIA AI</p>
            <p className="text-xs text-slate-500 truncate">Operations Brain</p>
          </div>
        )}
      </div>



      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = location.pathname.startsWith(item.path);

          if (!item.enabled) {
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 cursor-not-allowed opacity-60',
                  collapsed && 'justify-center px-2'
                )}
                title={`${item.label} — ${item.badge}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && <Badge variant="info" className="text-[10px] px-1.5">{item.badge}</Badge>}
                  </>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onMobileClose}
              className={isActive ? 'nav-link-active' : 'nav-link'}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-500/30 flex items-center justify-center text-sm font-semibold text-primary-300 shrink-0">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className={cn('nav-link w-full text-accent-red/80 hover:text-accent-red hover:bg-accent-red/10', collapsed && 'justify-center')}
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen bg-surface-800/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {sidebarContent}
        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-600 border border-white/10 items-center justify-center text-slate-400 hover:text-white transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}
