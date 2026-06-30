import { FileQuestion } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-600/50 flex items-center justify-center mb-4">
        {icon || <FileQuestion className="w-8 h-8 text-slate-500" />}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-slate-400 max-w-md mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
