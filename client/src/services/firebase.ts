import type { User, UserRole } from '@/types';

// Read configuration
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

// Client-side local storage keys
const USERS_DB_KEY = 'industria_users_database';
const ACTIVE_USER_KEY = 'industria_active_user';

// Mock/Initial User
const DEFAULT_USER: User = {
  uid: 'demo-user-1',
  email: 'operator@industria.ai',
  displayName: 'Marcus Vance',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

// Retrieve all local registered users
function getUsersDatabase(): Record<string, any> {
  const stored = localStorage.getItem(USERS_DB_KEY);
  if (!stored) {
    // Seed default credentials
    const initial = {
      'operator@industria.ai': {
        email: 'operator@industria.ai',
        password: 'password',
        displayName: 'Marcus Vance',
        role: 'admin',
      }
    };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

// Retrieve currently active logged-in user
function getActiveUser(): User | null {
  const stored = localStorage.getItem(ACTIVE_USER_KEY);
  if (!stored) {
    // For demo/fallback ease, if in demo mode and nothing active, seed default
    if (isDemoMode) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return null;
  }
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

function setActiveUser(user: User | null): void {
  if (user) {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
}

export const authService = {
  isDemoMode,

  async login(email: string, password: string, role?: UserRole): Promise<User> {
    await delay(600);
    const db = getUsersDatabase();
    const userRecord = db[email.toLowerCase()];
    if (!userRecord || userRecord.password !== password) {
      throw new Error('Invalid email or password credentials');
    }

    const activeRole = role || userRecord.role || 'engineer';
    localStorage.setItem('industria_role', activeRole);
    
    const user: User = {
      uid: `u-${email.split('@')[0]}`,
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: activeRole,
      createdAt: new Date().toISOString(),
    };

    setActiveUser(user);
    return user;
  },

  async signup(email: string, password: string, displayName: string, role?: UserRole): Promise<User> {
    await delay(700);
    const db = getUsersDatabase();
    if (db[email.toLowerCase()]) {
      throw new Error('Email address already registered');
    }

    const activeRole = role || 'engineer';
    db[email.toLowerCase()] = {
      email: email.toLowerCase(),
      password,
      displayName,
      role: activeRole,
    };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    localStorage.setItem('industria_role', activeRole);

    const user: User = {
      uid: `u-${email.split('@')[0]}`,
      email,
      displayName,
      role: activeRole,
      createdAt: new Date().toISOString(),
    };

    setActiveUser(user);
    return user;
  },

  async loginWithGoogle(role?: UserRole): Promise<User> {
    const googleClientId = '20722063480-rnnik1ric1plf4l93307ekfn1rg62e53.apps.googleusercontent.com';

    // Verify GIS script is loaded in browser
    const win = window as any;
    if (!win.google || !win.google.accounts || !win.google.accounts.oauth2) {
      // Fallback popup simulated login if google script is offline/blocked
      console.warn('Google Identity Services client library is not loaded. Falling back to simulation.');
      await delay(1000);
      const mockUser: User = {
        uid: 'g-google-id-mock',
        email: 'operator@gmail.com',
        displayName: 'Google Operator',
        photoURL: 'https://ui-avatars.com/api/?name=Google+Operator&background=6366f1&color=fff',
        role: role || 'admin',
        createdAt: new Date().toISOString(),
      };
      setActiveUser(mockUser);
      localStorage.setItem('industria_role', role || 'admin');
      return mockUser;
    }

    // Trigger google OAuth access token client popup flow natively
    return new Promise<User>((resolve, reject) => {
      try {
        const client = win.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                // Fetch profile using standard Google OAuth userinfo endpoint
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await res.json();
                
                const activeRole = role || (localStorage.getItem('industria_role') as UserRole) || 'engineer';
                localStorage.setItem('industria_role', activeRole);

                const user: User = {
                  uid: profile.sub || `g-${Date.now()}`,
                  email: profile.email || 'user@gmail.com',
                  displayName: profile.name || 'Google User',
                  photoURL: profile.picture || undefined,
                  role: activeRole,
                  createdAt: new Date().toISOString(),
                };

                localStorage.setItem('industria_token', tokenResponse.access_token);
                setActiveUser(user);
                resolve(user);
              } catch (fetchErr) {
                reject(new Error('Failed to retrieve user profile from Google.'));
              }
            } else {
              reject(new Error('Google sign-in popup authorization denied.'));
            }
          },
          error_callback: (err: any) => {
            reject(err);
          }
        });

        client.requestAccessToken();
      } catch (err) {
        reject(err);
      }
    });
  },

  async forgotPassword(email: string): Promise<void> {
    await delay(500);
    const db = getUsersDatabase();
    if (!db[email.toLowerCase()]) {
      throw new Error('Email address not registered in system ledger');
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('industria_token');
    localStorage.removeItem('industria_role');
    setActiveUser(null);
  },

  async updateUserProfile(profile: Partial<User>): Promise<User> {
    await delay(400);
    const current = getActiveUser();
    if (!current) throw new Error('No user is currently authenticated');
    
    const updated = { ...current, ...profile };
    setActiveUser(updated);

    // Save in user database as well
    if (updated.email) {
      const db = getUsersDatabase();
      const dbRecord = db[updated.email.toLowerCase()];
      if (dbRecord) {
        if (profile.displayName) dbRecord.displayName = profile.displayName;
        if (profile.role) dbRecord.role = profile.role;
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
      }
    }

    if (profile.role) {
      localStorage.setItem('industria_role', profile.role);
    }

    // Trigger local storage changes event to update layout context listeners
    window.dispatchEvent(new StorageEvent('storage', {
      key: ACTIVE_USER_KEY,
      newValue: JSON.stringify(updated)
    }));

    return updated;
  },

  onAuthChange(callback: (user: User | null) => void): () => void {
    callback(getActiveUser());
    const handler = (e: StorageEvent) => {
      if (e.key === ACTIVE_USER_KEY) {
        callback(getActiveUser());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },

  getCurrentUser(): User | null {
    return getActiveUser();
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { isDemoMode };
