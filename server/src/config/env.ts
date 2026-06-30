import dotenv from 'dotenv';

dotenv.config();

function isSet(value: string | undefined): boolean {
  return !!value && value !== 'your_gemini_api_key' && !value.startsWith('your_');
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  neo4jUri: process.env.NEO4J_URI || '',
  neo4jUser: process.env.NEO4J_USER || 'neo4j',
  neo4jPassword: process.env.NEO4J_PASSWORD || '',
  pineconeApiKey: process.env.PINECONE_API_KEY || '',
  pineconeIndex: process.env.PINECONE_INDEX || 'industria-ai',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
};

export const services = {
  mongodb: isSet(env.mongodbUri),
  gemini: isSet(env.geminiApiKey),
  neo4j: isSet(env.neo4jUri) && isSet(env.neo4jPassword),
  pinecone: isSet(env.pineconeApiKey),
  firebase: isSet(env.firebaseProjectId),
};

export type ServiceName = keyof typeof services;
