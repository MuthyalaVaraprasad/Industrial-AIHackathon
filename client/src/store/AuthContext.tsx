import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authService } from '@/services/firebase';
import type { AuthState, User, UserRole } from '@/types';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  signup: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: Partial<User>) => Promise<User>;
  clearError: () => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setState((prev) => ({ ...prev, user, loading: false }));
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string, role?: UserRole) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const user = await authService.login(email, password, role);
      setState({ user, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string, role?: UserRole) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const user = await authService.signup(email, password, displayName, role);
      setState({ user, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const loginWithGoogle = useCallback(async (role?: UserRole) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const user = await authService.loginWithGoogle(role);
      setState({ user, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await authService.forgotPassword(email);
      setState((prev) => ({ ...prev, loading: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({ user: null, loading: false, error: null });
  }, []);

  const updateUserProfile = useCallback(async (profile: Partial<User>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const user = await authService.updateUserProfile(profile);
      setState({ user, loading: false, error: null });
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        loginWithGoogle,
        forgotPassword,
        logout,
        updateUserProfile,
        clearError,
        isDemoMode: authService.isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
