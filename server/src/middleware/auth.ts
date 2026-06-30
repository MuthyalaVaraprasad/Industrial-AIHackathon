import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';
import { env, services } from '../config/env';

let initialized = false;

export function initFirebaseAdmin(): boolean {
  if (!services.firebase || initialized) return initialized;

  try {
    if (!getApps().length) {
      initializeApp({ projectId: env.firebaseProjectId });
    }
    initialized = true;
    console.log('[Firebase Admin] Initialized');
    return true;
  } catch (err) {
    console.warn('[Firebase Admin] Init failed:', (err as Error).message);
    services.firebase = false;
    return false;
  }
}

export async function verifyAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!initialized || !services.firebase) {
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = header.slice(7);
    const decoded = await getAuth().verifyIdToken(token);
    (req as Request & { user?: { uid: string; email?: string } }).user = {
      uid: decoded.uid,
      email: decoded.email,
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid authentication token' });
  }
}

export function isFirebaseAdminReady(): boolean {
  return initialized && services.firebase;
}
