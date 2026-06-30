import { GoogleGenerativeAI } from '@google/generative-ai';
import { env, services } from '../config/env';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (!services.gemini) return null;
  if (!client) client = new GoogleGenerativeAI(env.geminiApiKey);
  return client;
}

export interface ExtractedDocumentData {
  entities: { type: string; value: string; confidence: number }[];
  metadata: {
    title?: string;
    category?: string;
    tags?: string[];
  };
  ocrText: string;
  confidenceScore: number;
}

export async function extractDocumentIntelligence(
  filename: string,
  fileContent?: string
): Promise<ExtractedDocumentData | null> {
  const genAI = getClient();
  if (!genAI) return null;

  const model = genAI.getGenerativeModel({ model: env.geminiModel });
  const prompt = `You are an industrial document intelligence AI. Analyze this document and return ONLY valid JSON (no markdown):
Filename: ${filename}
${fileContent ? `Content preview: ${fileContent.slice(0, 2000)}` : 'No text content — infer from filename.'}

Return JSON:
{
  "entities": [{"type": "Equipment|Location|Parameter|Standard|Person", "value": "string", "confidence": 85-99}],
  "metadata": {"title": "string", "category": "Maintenance Manual|P&ID Drawing|Inspection Report|Compliance Document|Incident Report", "tags": ["string"]},
  "ocrText": "realistic extracted text summary",
  "confidenceScore": 85-99
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text) as ExtractedDocumentData;
  } catch (err) {
    console.warn('[Gemini] Document extraction failed:', (err as Error).message);
    return null;
  }
}

export interface CopilotAIResponse {
  content: string;
  sources: { title: string; page?: string; documentId?: string }[];
  confidence: number;
  recommendations: string[];
}

export async function generateCopilotResponse(
  userMessage: string,
  contextChunks: { title: string; content: string; source: string; page?: string; documentId?: string }[]
): Promise<CopilotAIResponse | null> {
  const genAI = getClient();
  if (!genAI) return null;

  const context = contextChunks.length
    ? contextChunks.map((c, i) => `[${i + 1}] ${c.title} (${c.source}${c.page ? `, ${c.page}` : ''}): ${c.content}`).join('\n\n')
    : 'No specific context retrieved. Use general industrial knowledge.';

  const model = genAI.getGenerativeModel({ model: env.geminiModel });
  const prompt = `You are INDUSTRIA AI Copilot for an industrial plant. Answer based on the context below.

CONTEXT:
${context}

USER QUESTION: ${userMessage}

Respond with ONLY valid JSON:
{
  "content": "detailed helpful answer",
  "sources": [{"title": "string", "page": "optional", "documentId": "optional"}],
  "confidence": 70-99,
  "recommendations": ["actionable recommendation 1", "recommendation 2"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text) as CopilotAIResponse;
  } catch (err) {
    console.warn('[Gemini] Copilot generation failed:', (err as Error).message);
    return null;
  }
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const genAI = getClient();
  if (!genAI) return null;

  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.warn('[Gemini] Embedding failed:', (err as Error).message);
    return null;
  }
}

export function isGeminiAvailable(): boolean {
  return services.gemini;
}
