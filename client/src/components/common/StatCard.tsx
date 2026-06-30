import { useAnimatedCounter } from '@/hooks';
import { cn, formatNumber } from '@/utils';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  color?: 'primary' | 'cyan' | 'green' | 'amber' | 'red' | 'purple';
  animate?: boolean;
}

const colorMap = {
  primary: 'from-primary-500/20 to-primary-600/5 border-primary-500/30 text-primary-400',
  cyan: 'from-accent-cyan/20 to-accent-cyan/5 border-accent-cyan/30 text-accent-cyan',
  green: 'from-accent-green/20 to-accent-green/5 border-accent-green/30 text-accent-green',
  amber: 'from-accent-amber/20 to-accent-amber/5 border-accent-amber/30 text-accent-amber',
  red: 'from-accent-red/20 to-accent-red/5 border-accent-red/30 text-accent-red',
  purple: 'from-accent-purple/20 to-accent-purple/5 border-accent-purple/30 text-accent-purple',
};

export function StatCard({
  label,
  value,
  suffix = '',
  prefix = '',
  icon,
  trend,
  color = 'primary',
  animate = true,
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value);
  const displayValue = animate ? animatedValue : value;

  return (
    <div className={cn('glass-card-hover p-5 md:p-6 bg-gradient-to-br border', colorMap[color])}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white/5">{icon}</div>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-1 rounded-lg',
              trend.positive ? 'text-accent-green bg-accent-green/10' : 'text-accent-red bg-accent-red/10'
            )}
          >
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className="stat-value text-white">
        {prefix}{formatNumber(displayValue)}{suffix}
      </p>
    </div>
  );
}
