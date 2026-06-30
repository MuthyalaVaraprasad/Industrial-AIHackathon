import { extractDocumentIntelligence, isGeminiAvailable } from './geminiService';
import { indexDocumentKnowledge } from './seedService';

export type DocumentStatus = 'uploading' | 'processing' | 'ocr' | 'extracting' | 'classifying' | 'completed' | 'failed';
export type DocumentType = 'pdf' | 'docx' | 'xlsx' | 'image' | 'other';

export interface DocumentEntity {
  type: string;
  value: string;
  confidence: number;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  pages?: number;
  createdDate?: string;
  category?: string;
  tags?: string[];
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  status: DocumentStatus;
  progress: number;
  uploadedAt: string;
  processedAt?: string;
  entities: DocumentEntity[];
  metadata: DocumentMetadata;
  ocrText?: string;
  confidenceScore?: number;
  error?: string;
}

const STATUS_PROGRESS: Record<DocumentStatus, number> = {
  uploading: 10,
  processing: 25,
  ocr: 45,
  extracting: 65,
  classifying: 85,
  completed: 100,
  failed: 0,
};

const STATUS_FLOW: DocumentStatus[] = ['uploading', 'processing', 'ocr', 'extracting', 'classifying', 'completed'];

const SAMPLE_ENTITIES: DocumentEntity[] = [
  { type: 'Equipment', value: 'Pump P-101', confidence: 96 },
  { type: 'Equipment', value: 'Valve V-203', confidence: 92 },
  { type: 'Location', value: 'Unit 3 - Process Area', confidence: 88 },
  { type: 'Parameter', value: 'Operating Pressure: 150 PSI', confidence: 94 },
  { type: 'Parameter', value: 'Temperature Range: 40-85°C', confidence: 91 },
  { type: 'Standard', value: 'API 610', confidence: 97 },
  { type: 'Person', value: 'Maintenance Team Lead', confidence: 85 },
];

const SAMPLE_OCR = `MAINTENANCE MANUAL - CENTRIFUGAL PUMP P-101
Unit 3 Process Area | Document ID: MM-P101-2024

Operating Parameters:
- Design Pressure: 150 PSI
- Temperature Range: 40-85°C
- Flow Rate: 500 GPM

Maintenance Schedule:
- Weekly: Visual inspection of seals and bearings
- Monthly: Vibration analysis
- Quarterly: Full teardown inspection

Referenced Standards: API 610, ISO 14224
Associated Equipment: Valve V-203, Heat Exchanger HX-301`;

function getDocumentType(filename: string): DocumentType {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'docx';
  if (['xls', 'xlsx'].includes(ext)) return 'xlsx';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff'].includes(ext)) return 'image';
  return 'other';
}

function generateMetadata(filename: string): DocumentMetadata {
  const categories = ['Maintenance Manual', 'P&ID Drawing', 'Inspection Report', 'Compliance Document', 'Incident Report'];
  return {
    title: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    author: 'Plant Engineering Dept.',
    pages: Math.floor(Math.random() * 50) + 5,
    createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: categories[Math.floor(Math.random() * categories.length)],
    tags: ['P-101', 'Unit 3', 'Critical Asset'],
  };
}

class DocumentStore {
  private documents: Map<string, DocumentRecord> = new Map();
  private processingTimers: Map<string, NodeJS.Timeout[]> = new Map();

  constructor() {
    const seedDocs: DocumentRecord[] = [
      {
        id: 'seed-1',
        name: 'Pump_P101_Maintenance_Manual.pdf',
        type: 'pdf',
        size: 2457600,
        status: 'completed',
        progress: 100,
        uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        processedAt: new Date(Date.now() - 86400000 * 2 + 30000).toISOString(),
        entities: SAMPLE_ENTITIES,
        metadata: { title: 'Pump P101 Maintenance Manual', author: 'Plant Engineering', pages: 42, category: 'Maintenance Manual', tags: ['P-101', 'Critical'] },
        ocrText: SAMPLE_OCR,
        confidenceScore: 94,
      },
      {
        id: 'seed-2',
        name: 'Unit3_Compliance_Audit_Q2.xlsx',
        type: 'xlsx',
        size: 524288,
        status: 'completed',
        progress: 100,
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        processedAt: new Date(Date.now() - 86400000 + 20000).toISOString(),
        entities: [
          { type: 'Standard', value: 'ISO 14001', confidence: 98 },
          { type: 'Status', value: 'Compliant', confidence: 95 },
        ],
        metadata: { title: 'Unit 3 Compliance Audit Q2', category: 'Compliance Document', tags: ['Audit', 'Q2'] },
        confidenceScore: 96,
      },
    ];

    seedDocs.forEach((doc) => this.documents.set(doc.id, doc));
  }

  getAll(page = 1, pageSize = 20) {
    const items = Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
    };
  }

  getById(id: string): DocumentRecord | undefined {
    return this.documents.get(id);
  }

  create(name: string, size: number, fileBuffer?: Buffer): DocumentRecord {
    const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const doc: DocumentRecord = {
      id,
      name,
      type: getDocumentType(name),
      size,
      status: 'uploading',
      progress: 10,
      uploadedAt: new Date().toISOString(),
      entities: [],
      metadata: {},
    };

    this.documents.set(id, doc);
    this.startProcessing(id, fileBuffer?.toString('utf8'));
    return doc;
  }

  delete(id: string): boolean {
    const timers = this.processingTimers.get(id);
    if (timers) {
      timers.forEach(clearTimeout);
      this.processingTimers.delete(id);
    }
    return this.documents.delete(id);
  }

  private startProcessing(id: string, fileContent?: string) {
    const timers: NodeJS.Timeout[] = [];
    let stepIndex = 0;

    const applyExtraction = async (doc: DocumentRecord) => {
      if (isGeminiAvailable()) {
        const ai = await extractDocumentIntelligence(doc.name, fileContent);
        if (ai) {
          doc.entities = ai.entities;
          doc.metadata = { ...generateMetadata(doc.name), ...ai.metadata };
          doc.ocrText = ai.ocrText;
          doc.confidenceScore = ai.confidenceScore;
          this.documents.set(id, { ...doc });
          await indexDocumentKnowledge(
            id,
            doc.metadata.title || doc.name,
            ai.ocrText,
            doc.name
          );
          return;
        }
      }
      doc.entities = SAMPLE_ENTITIES.slice(0, 4 + Math.floor(Math.random() * 4));
      doc.metadata = generateMetadata(doc.name);
      doc.ocrText = SAMPLE_OCR;
      doc.confidenceScore = 88 + Math.random() * 10;
      this.documents.set(id, { ...doc });
    };

    const advance = () => {
      const doc = this.documents.get(id);
      if (!doc || doc.status === 'failed') return;

      if (stepIndex < STATUS_FLOW.length) {
        const status = STATUS_FLOW[stepIndex];
        doc.status = status;
        doc.progress = STATUS_PROGRESS[status];

        if (status === 'completed') {
          doc.processedAt = new Date().toISOString();
          void applyExtraction(doc);
        } else {
          this.documents.set(id, { ...doc });
        }

        stepIndex++;

        if (stepIndex < STATUS_FLOW.length) {
          const timer = setTimeout(advance, 1500 + Math.random() * 1000);
          timers.push(timer);
        }
      }
    };

    const initialTimer = setTimeout(advance, 500);
    timers.push(initialTimer);
    this.processingTimers.set(id, timers);
  }
}

export const documentStore = new DocumentStore();
