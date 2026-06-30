import { cn } from '@/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className, hover, padding = 'md', onClick }: CardProps) {
  return (
    <div onClick={onClick} className={cn(hover ? 'glass-card-hover' : 'glass-card', paddingMap[padding], className)}>
      {children}
    </div>
  );
}
