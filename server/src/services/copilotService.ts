import { copilotResponses } from '../data/mockData';
import { generateCopilotResponse } from './geminiService';
import { searchKnowledge } from './pineconeService';

export interface CopilotMessageResult {
  id: string;
  role: 'assistant';
  content: string;
  timestamp: string;
  sources: { title: string; page?: string; documentId?: string }[];
  confidence: number;
  recommendations: string[];
}

export async function handleCopilotChat(message: string): Promise<CopilotMessageResult> {
  const chunks = await searchKnowledge(message);
  const aiResponse = await generateCopilotResponse(message, chunks);

  if (aiResponse) {
    const sources = aiResponse.sources.length
      ? aiResponse.sources
      : chunks.map((c) => ({ title: c.title, page: c.page, documentId: c.documentId }));

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date().toISOString(),
      sources,
      confidence: aiResponse.confidence,
      recommendations: aiResponse.recommendations,
    };
  }

  const lower = message.toLowerCase();
  let responseKey = 'default';
  if (lower.includes('p-101') || lower.includes('p101') || lower.includes('pump')) responseKey = 'p-101';
  else if (lower.includes('maintenance') || lower.includes('history')) responseKey = 'maintenance';
  else if (lower.includes('compliance') || lower.includes('audit') || lower.includes('gap')) responseKey = 'compliance';

  const template = copilotResponses[responseKey] as {
    content: string;
    sources: { title: string; page?: string; documentId?: string }[];
    confidence: number;
    recommendations: string[];
  };

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: template.content,
    timestamp: new Date().toISOString(),
    sources: template.sources,
    confidence: template.confidence,
    recommendations: template.recommendations,
  };
}
