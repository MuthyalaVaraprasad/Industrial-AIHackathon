import mongoose, { Schema, type Document as MongooseDocument } from 'mongoose';

export interface IDocumentRecord extends MongooseDocument {
  name: string;
  type: string;
  size: number;
  status: string;
  progress: number;
  uploadedAt: Date;
  processedAt?: Date;
  entities: { type: string; value: string; confidence: number }[];
  metadata: Record<string, unknown>;
  ocrText?: string;
  confidenceScore?: number;
  error?: string;
}

const DocumentSchema = new Schema<IDocumentRecord>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  status: { type: String, required: true },
  progress: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
  processedAt: Date,
  entities: [{ type: { type: String }, value: String, confidence: Number }],
  metadata: { type: Schema.Types.Mixed, default: {} },
  ocrText: String,
  confidenceScore: Number,
  error: String,
});

export const DocumentModel = mongoose.model<IDocumentRecord>('Document', DocumentSchema);

export interface ICollaborationNote extends MongooseDocument {
  author: string;
  role: string;
  assetTag: string;
  content: string;
  mentions: string[];
  timestamp: Date;
}

const CollaborationNoteSchema = new Schema<ICollaborationNote>({
  author: { type: String, required: true },
  role: { type: String, default: 'engineer' },
  assetTag: { type: String, default: 'General' },
  content: { type: String, required: true },
  mentions: [String],
  timestamp: { type: Date, default: Date.now },
});

export const CollaborationNoteModel = mongoose.model<ICollaborationNote>('CollaborationNote', CollaborationNoteSchema);

export interface IAlert extends MongooseDocument {
  type: string;
  title: string;
  description: string;
  severity: string;
  timestamp: Date;
  acknowledged: boolean;
  assetTag?: string;
}

const AlertSchema = new Schema<IAlert>({
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  acknowledged: { type: Boolean, default: false },
  assetTag: String,
});

export const AlertModel = mongoose.model<IAlert>('Alert', AlertSchema);

export interface ISystemSettings extends MongooseDocument {
  geminiModel: string;
  autoProcessing: boolean;
  alertThreshold: number;
  retentionDays: number;
}

const SystemSettingsSchema = new Schema<ISystemSettings>({
  geminiModel: { type: String, default: 'gemini-2.0-flash' },
  autoProcessing: { type: Boolean, default: true },
  alertThreshold: { type: Number, default: 85 },
  retentionDays: { type: Number, default: 365 },
});

export const SystemSettingsModel = mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

export interface IKnowledgeChunk extends MongooseDocument {
  documentId: string;
  title: string;
  content: string;
  source: string;
  page?: string;
  embeddingId?: string;
}

const KnowledgeChunkSchema = new Schema<IKnowledgeChunk>({
  documentId: String,
  title: { type: String, required: true },
  content: { type: String, required: true },
  source: { type: String, required: true },
  page: String,
  embeddingId: String,
});

export const KnowledgeChunkModel = mongoose.model<IKnowledgeChunk>('KnowledgeChunk', KnowledgeChunkSchema);
