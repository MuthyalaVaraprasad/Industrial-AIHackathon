import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PageTransition } from '@/components/ui/PageTransition';
import type { UserRole } from '@/types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin (System controls)' },
  { value: 'manager', label: 'Manager (Operations & Executive)' },
  { value: 'engineer', label: 'Engineer (Copilot & Graph)' },
  { value: 'technician', label: 'Technician (Maintenance & QR)' },
  { value: 'auditor', label: 'Auditor (Compliance & Reports)' },
];

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('engineer');
  const [localError, setLocalError] = useState('');
  const { signup, loginWithGoogle, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'bg-slate-700' };
    if (pwd.length < 6) return { label: 'Too short', color: 'bg-accent-red' };
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
    
    if (hasLetters && hasNumbers && hasSpecial && pwd.length >= 8) {
      return { label: 'Strong', color: 'bg-accent-green' };
    }
    if (hasLetters && hasNumbers) {
      return { label: 'Medium', color: 'bg-accent-amber' };
    }
    return { label: 'Weak', color: 'bg-accent-red/60' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!displayName || !email || !password) {
      setLocalError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await signup(email, password, displayName, role);
      navigate('/app/dashboard', { replace: true });
    } catch {
      // error handled by context
    }
  };

  const handleGoogle = async () => {
    clearError();
    try {
      await loginWithGoogle(role);
      navigate('/app/dashboard', { replace: true });
    } catch {
      // error handled by context
    }
  };

  const displayError = localError || error;

  return (
    <PageTransition>
      <Card padding="lg">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-white mb-2">Create account</h1>
          <p className="text-slate-400">Start your industrial AI journey</p>
        </div>

        {displayError && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="John Engineer"
            autoComplete="name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="engineer@plant.com"
            autoComplete="email"
            required
          />
          <div>
            <label className="label-text">Select System Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="input-field text-sm capitalize"
              required
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              required
            />
            {password && (
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-1 rounded bg-surface-600 overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: password.length > 8 ? '100%' : password.length >= 6 ? '60%' : '30%' }} />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{strength.label}</span>
              </div>
            )}
          </div>
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
          <Button type="submit" className="w-full mt-2" loading={loading}>
            <UserPlus className="w-4 h-4" />
            Create Account
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-3 bg-surface-700 text-slate-500">or</span></div>
        </div>

        <Button variant="secondary" className="w-full" onClick={handleGoogle} loading={loading}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </Card>
    </PageTransition>
  );
}
