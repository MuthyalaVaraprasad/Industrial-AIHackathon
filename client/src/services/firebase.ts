import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { User, UserRole } from '@/types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' ||
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'your_api_key';

let app: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (isDemoMode) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

const DEMO_USER_KEY = 'industria_demo_user';

function getDemoUser(): User | null {
  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

function setDemoUser(user: User | null): void {
  if (user) {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DEMO_USER_KEY);
  }
}

function mapFirebaseUser(fbUser: FirebaseUser, role?: UserRole): User {
  const savedRole = (localStorage.getItem('industria_role') as UserRole) || role || 'engineer';
  return {
    uid: fbUser.uid,
    email: fbUser.email ?? '',
    displayName: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'User',
    photoURL: fbUser.photoURL ?? undefined,
    role: savedRole,
    createdAt: fbUser.metadata.creationTime ?? new Date().toISOString(),
  };
}

export const authService = {
  isDemoMode,

  async login(email: string, password: string, role?: UserRole): Promise<User> {
    if (role) {
      localStorage.setItem('industria_role', role);
    }
    if (isDemoMode) {
      await delay(800);
      const chosenRole = role || (email.includes('admin') ? 'admin' : 'engineer');
      const user: User = {
        uid: 'demo-user-1',
        email,
        displayName: email.split('@')[0],
        role: chosenRole,
        createdAt: new Date().toISOString(),
      };
      setDemoUser(user);
      return user;
    }

    const auth = getAuth(getFirebaseApp()!);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const token = await credential.user.getIdToken();
    localStorage.setItem('industria_token', token);
    return mapFirebaseUser(credential.user, role);
  },

  async signup(email: string, password: string, displayName: string, role?: UserRole): Promise<User> {
    if (role) {
      localStorage.setItem('industria_role', role);
    }
    if (isDemoMode) {
      await delay(800);
      const user: User = {
        uid: `demo-${Date.now()}`,
        email,
        displayName,
        role: role || 'engineer',
        createdAt: new Date().toISOString(),
      };
      setDemoUser(user);
      return user;
    }

    const auth = getAuth(getFirebaseApp()!);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    const token = await credential.user.getIdToken();
    localStorage.setItem('industria_token', token);
    return mapFirebaseUser(credential.user, role);
  },

  async loginWithGoogle(role?: UserRole): Promise<User> {
    if (role) {
      localStorage.setItem('industria_role', role);
    }
    if (isDemoMode) {
      await delay(800);
      const user: User = {
        uid: 'demo-google-user',
        email: 'demo@gmail.com',
        displayName: 'Demo User',
        photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff',
        role: role || 'manager',
        createdAt: new Date().toISOString(),
      };
      setDemoUser(user);
      return user;
    }

    const auth = getAuth(getFirebaseApp()!);
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const token = await credential.user.getIdToken();
    localStorage.setItem('industria_token', token);
    return mapFirebaseUser(credential.user, role);
  },

  async forgotPassword(email: string): Promise<void> {
    if (isDemoMode) {
      await delay(600);
      return;
    }
    const auth = getAuth(getFirebaseApp()!);
    await sendPasswordResetEmail(auth, email);
  },

  async logout(): Promise<void> {
    if (isDemoMode) {
      setDemoUser(null);
      localStorage.removeItem('industria_role');
      return;
    }
    localStorage.removeItem('industria_token');
    localStorage.removeItem('industria_role');
    const auth = getAuth(getFirebaseApp()!);
    await signOut(auth);
  },

  async updateUserProfile(profile: Partial<User>): Promise<User> {
    if (isDemoMode) {
      await delay(500);
      const current = getDemoUser();
      if (!current) throw new Error('Not logged in');
      const updated = { ...current, ...profile };
      if (profile.role) {
        localStorage.setItem('industria_role', profile.role);
      }
      setDemoUser(updated);
      // Dispatch a custom event to notify listeners (since onAuthChange in demo mode relies on local storage events)
      window.dispatchEvent(new StorageEvent('storage', {
        key: DEMO_USER_KEY,
        newValue: JSON.stringify(updated)
      }));
      return updated;
    }
    const auth = getAuth(getFirebaseApp()!);
    const user = auth.currentUser;
    if (!user) throw new Error('Not logged in');
    if (profile.displayName) {
      await updateProfile(user, { displayName: profile.displayName });
    }
    if (profile.role) {
      localStorage.setItem('industria_role', profile.role);
    }
    const updated = mapFirebaseUser(user, profile.role);
    return updated;
  },

  onAuthChange(callback: (user: User | null) => void): () => void {
    if (isDemoMode) {
      callback(getDemoUser());
      const handler = (e: StorageEvent) => {
        if (e.key === DEMO_USER_KEY) {
          callback(getDemoUser());
        }
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }

    const auth = getAuth(getFirebaseApp()!);
    return onAuthStateChanged(auth, (fbUser) => {
      callback(fbUser ? mapFirebaseUser(fbUser) : null);
    });
  },

  getCurrentUser(): User | null {
    if (isDemoMode) return getDemoUser();
    const auth = getAuth(getFirebaseApp()!);
    const fbUser = auth.currentUser;
    return fbUser ? mapFirebaseUser(fbUser) : null;
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { isDemoMode };
