import { services } from '../config/env';
import { isMongoConnected } from '../db/mongodb';
import { isGeminiAvailable } from './geminiService';
import { isNeo4jAvailable } from './neo4jService';
import { isPineconeAvailable } from './pineconeService';

export interface ServiceStatus {
  name: string;
  connected: boolean;
  mode: 'live' | 'fallback' | 'demo';
  description: string;
}

export function getServiceStatus(): ServiceStatus[] {
  return [
    {
      name: 'MongoDB Atlas',
      connected: isMongoConnected(),
      mode: isMongoConnected() ? 'live' : 'fallback',
      description: isMongoConnected() ? 'Documents, notes, and alerts persisted' : 'In-memory store active',
    },
    {
      name: 'Gemini API',
      connected: isGeminiAvailable(),
      mode: isGeminiAvailable() ? 'live' : 'fallback',
      description: isGeminiAvailable() ? 'AI copilot and document extraction enabled' : 'Mock AI responses',
    },
    {
      name: 'Neo4j',
      connected: isNeo4jAvailable(),
      mode: isNeo4jAvailable() ? 'live' : 'fallback',
      description: isNeo4jAvailable() ? 'Live knowledge graph queries' : 'Mock graph data',
    },
    {
      name: 'Pinecone',
      connected: isPineconeAvailable(),
      mode: isPineconeAvailable() ? 'live' : 'fallback',
      description: isPineconeAvailable() ? 'Vector RAG search active' : 'Text/MongoDB RAG fallback',
    },
    {
      name: 'Firebase Auth',
      connected: services.firebase,
      mode: services.firebase ? 'live' : 'demo',
      description: services.firebase ? 'Production auth verification' : 'Client demo mode',
    },
  ];
}

export function getHealthPayload() {
  const serviceList = getServiceStatus();
  const liveCount = serviceList.filter((s) => s.connected).length;

  return {
    status: 'ok',
    message: 'INDUSTRIA AI API is running',
    environment: process.env.NODE_ENV || 'development',
    services: serviceList,
    integrations: {
      live: liveCount,
      total: serviceList.length,
      fullyIntegrated: liveCount === serviceList.length,
    },
  };
}
