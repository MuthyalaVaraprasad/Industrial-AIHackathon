import { KnowledgeChunkModel } from '../models';
import { isMongoConnected } from '../db/mongodb';
import { upsertKnowledgeChunk } from './pineconeService';

const SEED_CHUNKS = [
  { title: 'RCA Report #42', content: 'Pump P-101 failed due to mechanical seal degradation. Temperature 92°C exceeded 85°C limit.', source: 'RCA Report #42', page: 'Section 3.2', documentId: 'rca-42' },
  { title: 'Maintenance Manual P-101', content: 'Design Pressure 150 PSI, Temperature 40-85°C. Seal maintenance every 60 days.', source: 'Maintenance Manual', page: 'Page 12', documentId: 'doc-p101' },
  { title: 'Compliance Dashboard Q2', content: 'Compliance 92%. ISO 45001 at 68%. Missing incident and training records.', source: 'Compliance Dashboard', page: 'Summary' },
  { title: 'CMMS P-101 Log', content: 'Bearing lubrication Mar 2026. Seal replacement overdue 45 days.', source: 'CMMS', page: 'P-101' },
];

export async function seedKnowledgeBase(): Promise<void> {
  if (!isMongoConnected()) return;

  const count = await KnowledgeChunkModel.countDocuments();
  if (count > 0) return;

  for (let i = 0; i < SEED_CHUNKS.length; i++) {
    const chunk = SEED_CHUNKS[i];
    await KnowledgeChunkModel.create(chunk);
    await upsertKnowledgeChunk(`seed-${i}`, chunk.title, chunk.content, chunk.source, {
      page: chunk.page,
      documentId: chunk.documentId,
    });
  }
  console.log('[Seed] Knowledge base initialized');
}

export async function indexDocumentKnowledge(
  documentId: string,
  title: string,
  content: string,
  source: string
): Promise<void> {
  await upsertKnowledgeChunk(`doc-${documentId}`, title, content, source, { documentId });
}
