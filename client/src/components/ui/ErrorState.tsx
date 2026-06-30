import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="alert">
      <div className="w-16 h-16 rounded-2xl bg-accent-red/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-accent-red" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
