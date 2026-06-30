import mongoose from 'mongoose';
import { env, services } from '../config/env';

let connected = false;

export async function connectMongoDB(): Promise<boolean> {
  if (!env.mongodbUri) {
    console.log('[MongoDB] No URI configured — using in-memory store');
    return false;
  }

  try {
    await mongoose.connect(env.mongodbUri);
    connected = true;
    services.mongodb = true;
    console.log('[MongoDB] Connected to Atlas');
    return true;
  } catch (err) {
    connected = false;
    services.mongodb = false;
    console.warn('[MongoDB] Connection failed — using in-memory store:', (err as Error).message);
    return false;
  }
}

export function isMongoConnected(): boolean {
  return connected && mongoose.connection.readyState === 1;
}

export async function disconnectMongoDB(): Promise<void> {
  if (connected) {
    await mongoose.disconnect();
    connected = false;
  }
}
