import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PageTransition } from '@/components/ui/PageTransition';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState('');
  const { forgotPassword, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email) {
      setLocalError('Please enter your email');
      return;
    }

    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      // error handled by context
    }
  };

  const displayError = localError || error;

  if (sent) {
    return (
      <PageTransition>
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-green/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-accent-green" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Check your email</h1>
          <p className="text-slate-400 mb-6">
            We've sent a password reset link to <strong className="text-white">{email}</strong>. Please check your inbox.
          </p>
          <Link to="/login">
            <Button variant="secondary">Back to Sign In</Button>
          </Link>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Card padding="lg">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-white mb-2">Reset password</h1>
          <p className="text-slate-400">Enter your email to receive a reset link</p>
        </div>

        {displayError && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="engineer@plant.com"
            autoComplete="email"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            <Mail className="w-4 h-4" />
            Send Reset Link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </Card>
    </PageTransition>
  );
}
