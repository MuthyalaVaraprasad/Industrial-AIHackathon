import { cn } from '@/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className?: string;
}

const variantStyles = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  default: 'badge bg-surface-500/50 text-slate-300',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return <span className={cn(variantStyles[variant], className)}>{children}</span>;
}
