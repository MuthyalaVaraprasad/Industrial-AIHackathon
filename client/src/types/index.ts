export type UserRole = 'admin' | 'manager' | 'engineer' | 'technician' | 'auditor';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface DashboardStats {
  totalDocuments: number;
  totalAssets: number;
  complianceScore: number;
  riskAlerts: number;
  activeUsers: number;
  maintenanceStatus: {
    scheduled: number;
    overdue: number;
    completed: number;
  };
}

export interface ActivityItem {
  id: string;
  type: 'document' | 'maintenance' | 'alert' | 'compliance' | 'user';
  title: string;
  description: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

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

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  timestamp?: string;
  confidence?: number;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  enabled: boolean;
  badge?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Phase 2 Types
export interface GraphNode {
  id: string;
  label: string;
  type: 'asset' | 'maintenance' | 'incident' | 'inspection' | 'alert' | 'report';
  data?: Record<string, string>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: CopilotSource[];
  confidence?: number;
  recommendations?: string[];
  reasoningSummary?: string;
  relatedDocuments?: string[];
  relatedAssets?: string[];
}

export interface CopilotSource {
  title: string;
  page?: string;
  documentId?: string;
}

export interface CopilotQueryResponse {
  message: CopilotMessage;
}

export interface PIDEquipment {
  id: string;
  tag: string;
  type: string;
  x: number;
  y: number;
  connections: string[];
}

export interface PIDDrawing {
  id: string;
  name: string;
  unit: string;
  equipment: PIDEquipment[];
}

export interface AssetRisk {
  id: string;
  tag: string;
  name: string;
  healthScore: number;
  failureRisk: number;
  riskLevel: 'high' | 'medium' | 'low';
  lastMaintenance: string;
  recommendation: string;
}

export interface MaintenanceDashboard {
  distribution: { name: string; value: number; color: string }[];
  assets: AssetRisk[];
}

export interface ComplianceItem {
  id: string;
  standard: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  score: number;
  lastAudit: string;
  missingReports: string[];
}

export interface ComplianceDashboard {
  overallScore: number;
  auditReadiness: number;
  violations: number;
  items: ComplianceItem[];
  recommendations: string[];
}

export interface LessonLearned {
  id: string;
  pattern: string;
  frequency: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendation: string;
  preventiveAction: string;
}

export interface RCAReport {
  id: string;
  assetTag: string;
  incident: string;
  date: string;
  rootCause: string;
  contributingFactors: string[];
  evidence: { title: string; source: string }[];
  confidence: number;
  recommendations: string[];
}

export interface TwinAsset {
  id: string;
  tag: string;
  name: string;
  x: number;
  z: number;
  status: 'healthy' | 'warning' | 'critical';
  healthScore: number;
}

export interface ExecutiveKPI {
  label: string;
  value: string | number;
  change: number;
  positive: boolean;
}

export interface ExecutiveDashboard {
  kpis: ExecutiveKPI[];
  downtimeTrend: ChartDataPoint[];
  costImpact: ChartDataPoint[];
}

export interface QRAsset {
  id: string;
  tag: string;
  name: string;
  healthScore: number;
  location: string;
  lastMaintenance: string;
  documents: string[];
  insights: string[];
  maintenanceHistory: { date: string; action: string; technician: string }[];
}

export interface SimulationInput {
  maintenanceDelayDays: number;
  assetCondition: number;
  riskMultiplier: number;
}

export interface SimulationResult {
  predictedRisk: number;
  estimatedCost: number;
  estimatedDowntime: number;
  recommendation: string;
}

export interface CollaborationNote {
  id: string;
  author: string;
  role: UserRole;
  assetTag: string;
  content: string;
  mentions: string[];
  timestamp: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: 'maintenance' | 'compliance' | 'audit' | 'incident';
  description: string;
}

export interface AlertItem {
  id: string;
  type: 'risk' | 'compliance' | 'maintenance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  acknowledged: boolean;
  assetTag?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface SystemSettings {
  geminiModel: string;
  autoProcessing: boolean;
  alertThreshold: number;
  retentionDays: number;
}

export interface ServiceStatusItem {
  name: string;
  connected: boolean;
  mode: 'live' | 'fallback' | 'demo';
  description: string;
}

export interface HealthPayload {
  status: string;
  message: string;
  environment: string;
  services: ServiceStatusItem[];
  integrations: {
    live: number;
    total: number;
    fullyIntegrated: boolean;
  };
}
