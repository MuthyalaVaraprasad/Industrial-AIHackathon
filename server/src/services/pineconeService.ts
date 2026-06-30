import { Pinecone } from '@pinecone-database/pinecone';
import { env, services } from '../config/env';
import { generateEmbedding } from './geminiService';
import { KnowledgeChunkModel } from '../models';
import { isMongoConnected } from '../db/mongodb';

let pinecone: Pinecone | null = null;

const FALLBACK_CHUNKS = [
  { id: 'chunk-1', title: 'RCA Report #42', content: 'Pump P-101 failed due to mechanical seal degradation. Operating temperature 92°C exceeded 85°C design limit. Seal replacement was 45 days overdue.', source: 'RCA Report #42', page: 'Section 3.2', documentId: 'rca-42', score: 0.95 },
  { id: 'chunk-2', title: 'Maintenance Manual P-101', content: 'Operating limits: Design Pressure 150 PSI, Temperature Range 40-85°C, Flow Rate 500 GPM. Maintenance interval for seals: 60 days.', source: 'Maintenance Manual', page: 'Page 12', documentId: 'doc-p101', score: 0.91 },
  { id: 'chunk-3', title: 'Compliance Dashboard Q2', content: 'Overall compliance 92%. ISO 45001 non-compliant at 68%. Missing: Incident Report IR-089, Safety Training Records.', source: 'Compliance Dashboard', page: 'Summary', score: 0.88 },
  { id: 'chunk-4', title: 'CMMS Maintenance Log', content: 'P-101 history: bearing lubrication Mar 15 2026, impeller inspection Jan 20 2026, full teardown Nov 5 2025. Seal replacement overdue.', source: 'CMMS', page: 'P-101 History', score: 0.87 },
];

export async function connectPinecone(): Promise<boolean> {
  if (!services.pinecone) {
    console.log('[Pinecone] Not configured — using MongoDB/text fallback for RAG');
    return false;
  }

  try {
    pinecone = new Pinecone({ apiKey: env.pineconeApiKey });
    await pinecone.describeIndex(env.pineconeIndex);
    console.log('[Pinecone] Connected to index:', env.pineconeIndex);
    return true;
  } catch (err) {
    pinecone = null;
    services.pinecone = false;
    console.warn('[Pinecone] Connection failed — using fallback RAG:', (err as Error).message);
    return false;
  }
}

export async function searchKnowledge(query: string, topK = 4) {
  if (pinecone && services.pinecone) {
    const embedding = await generateEmbedding(query);
    if (embedding) {
      try {
        const index = pinecone.index(env.pineconeIndex);
        const results = await index.query({ vector: embedding, topK, includeMetadata: true });
        return results.matches?.map((m) => ({
          title: (m.metadata?.title as string) || 'Document',
          content: (m.metadata?.content as string) || '',
          source: (m.metadata?.source as string) || 'Knowledge Base',
          page: m.metadata?.page as string | undefined,
          documentId: m.metadata?.documentId as string | undefined,
          score: m.score ?? 0,
        })) ?? [];
      } catch (err) {
        console.warn('[Pinecone] Search failed:', (err as Error).message);
      }
    }
  }

  if (isMongoConnected()) {
    const regex = new RegExp(query.split(/\s+/).slice(0, 3).join('|'), 'i');
    const chunks = await KnowledgeChunkModel.find({
      $or: [{ content: regex }, { title: regex }],
    }).limit(topK).lean();
    if (chunks.length) {
      return chunks.map((c) => ({
        title: c.title,
        content: c.content,
        source: c.source,
        page: c.page,
        documentId: c.documentId,
        score: 0.8,
      }));
    }
  }

  const lower = query.toLowerCase();
  return FALLBACK_CHUNKS.filter((c) =>
    lower.split(/\s+/).some((word) => word.length > 3 && (c.content.toLowerCase().includes(word) || c.title.toLowerCase().includes(word)))
  ).slice(0, topK);
}

export async function upsertKnowledgeChunk(
  id: string,
  title: string,
  content: string,
  source: string,
  metadata?: { page?: string; documentId?: string }
): Promise<void> {
  if (isMongoConnected()) {
    await KnowledgeChunkModel.findOneAndUpdate(
      { title, source },
      { documentId: metadata?.documentId, title, content, source, page: metadata?.page },
      { upsert: true }
    );
  }

  if (!pinecone || !services.pinecone) return;

  const embedding = await generateEmbedding(`${title}\n${content}`);
  if (!embedding) return;

  try {
    const index = pinecone.index(env.pineconeIndex);
    await index.upsert({
      records: [{
        id,
        values: embedding,
        metadata: {
          title,
          content,
          source,
          ...(metadata?.page ? { page: metadata.page } : {}),
          ...(metadata?.documentId ? { documentId: metadata.documentId } : {}),
        },
      }],
    });
  } catch (err) {
    console.warn('[Pinecone] Upsert failed:', (err as Error).message);
  }
}

export function isPineconeAvailable(): boolean {
  return services.pinecone && pinecone !== null;
}
