import axios from 'axios';
import type {
  ApiResponse,
  DashboardStats,
  ActivityItem,
  ChartDataPoint,
  DocumentRecord,
  PaginatedResponse,
  GraphData,
  CopilotMessage,
  CopilotQueryResponse,
  PIDDrawing,
  MaintenanceDashboard,
  ComplianceDashboard,
  LessonLearned,
  RCAReport,
  TwinAsset,
  ExecutiveDashboard,
  QRAsset,
  SimulationInput,
  SimulationResult,
  CollaborationNote,
  ReportTemplate,
  AlertItem,
  AdminUser,
  SystemSettings,
  HealthPayload,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('industria_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return data.data;
  },
  async getActivities(): Promise<ActivityItem[]> {
    const { data } = await api.get<ApiResponse<ActivityItem[]>>('/dashboard/activities');
    return data.data;
  },
  async getAssetHealth(): Promise<ChartDataPoint[]> {
    const { data } = await api.get<ApiResponse<ChartDataPoint[]>>('/dashboard/charts/asset-health');
    return data.data;
  },
  async getMaintenanceTrends(): Promise<ChartDataPoint[]> {
    const { data } = await api.get<ApiResponse<ChartDataPoint[]>>('/dashboard/charts/maintenance');
    return data.data;
  },
  async getComplianceTrends(): Promise<ChartDataPoint[]> {
    const { data } = await api.get<ApiResponse<ChartDataPoint[]>>('/dashboard/charts/compliance');
    return data.data;
  },
  async getFailureTrends(): Promise<ChartDataPoint[]> {
    const { data } = await api.get<ApiResponse<ChartDataPoint[]>>('/dashboard/charts/failures');
    return data.data;
  },
};

export const documentsApi = {
  async getAll(page = 1, pageSize = 20): Promise<PaginatedResponse<DocumentRecord>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<DocumentRecord>>>('/documents', { params: { page, pageSize } });
    return data.data;
  },
  async getById(id: string): Promise<DocumentRecord> {
    const { data } = await api.get<ApiResponse<DocumentRecord>>(`/documents/${id}`);
    return data.data;
  },
  async upload(files: File[], onProgress?: (fileId: string, progress: number) => void): Promise<DocumentRecord[]> {
    const results: DocumentRecord[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<ApiResponse<DocumentRecord>>('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total && onProgress) {
            onProgress(file.name, Math.round((event.loaded * 100) / event.total));
          }
        },
      });
      results.push(data.data);
    }
    return results;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
  async reprocess(id: string): Promise<DocumentRecord> {
    const { data } = await api.post<ApiResponse<DocumentRecord>>(`/documents/${id}/reprocess`);
    return data.data;
  },
};

export const modulesApi = {
  getKnowledgeGraph: async (): Promise<GraphData> => {
    const { data } = await api.get<ApiResponse<GraphData>>('/knowledge-graph');
    return data.data;
  },
  sendCopilotMessage: async (message: string): Promise<CopilotMessage> => {
    const { data } = await api.post<ApiResponse<CopilotQueryResponse>>('/copilot/chat', { message });
    return data.data.message;
  },
  getPIDDrawing: async (): Promise<PIDDrawing> => {
    const { data } = await api.get<ApiResponse<PIDDrawing>>('/pid');
    return data.data;
  },
  getMaintenance: async (): Promise<MaintenanceDashboard> => {
    const { data } = await api.get<ApiResponse<MaintenanceDashboard>>('/maintenance');
    return data.data;
  },
  getCompliance: async (): Promise<ComplianceDashboard> => {
    const { data } = await api.get<ApiResponse<ComplianceDashboard>>('/compliance');
    return data.data;
  },
  getLessons: async (): Promise<LessonLearned[]> => {
    const { data } = await api.get<ApiResponse<LessonLearned[]>>('/lessons');
    return data.data;
  },
  getRCAReports: async (): Promise<RCAReport[]> => {
    const { data } = await api.get<ApiResponse<RCAReport[]>>('/rca');
    return data.data;
  },
  getDigitalTwin: async (): Promise<TwinAsset[]> => {
    const { data } = await api.get<ApiResponse<TwinAsset[]>>('/digital-twin');
    return data.data;
  },
  getExecutive: async (): Promise<ExecutiveDashboard> => {
    const { data } = await api.get<ApiResponse<ExecutiveDashboard>>('/executive');
    return data.data;
  },
  getQRAsset: async (tag: string): Promise<QRAsset> => {
    const { data } = await api.get<ApiResponse<QRAsset>>(`/qr/${tag}`);
    return data.data;
  },
  runSimulation: async (input: SimulationInput): Promise<SimulationResult> => {
    const { data } = await api.post<ApiResponse<SimulationResult>>('/simulator', input);
    return data.data;
  },
  getCollaborationNotes: async (): Promise<CollaborationNote[]> => {
    const { data } = await api.get<ApiResponse<CollaborationNote[]>>('/collaboration');
    return data.data;
  },
  addCollaborationNote: async (note: Partial<CollaborationNote>): Promise<CollaborationNote> => {
    const { data } = await api.post<ApiResponse<CollaborationNote>>('/collaboration', note);
    return data.data;
  },
  getReportTemplates: async (): Promise<ReportTemplate[]> => {
    const { data } = await api.get<ApiResponse<ReportTemplate[]>>('/reports/templates');
    return data.data;
  },
  generateReport: async (templateId: string, format: string): Promise<{ filename: string; generatedAt: string; pages: number }> => {
    const { data } = await api.post<ApiResponse<{ filename: string; generatedAt: string; pages: number }>>('/reports/generate', { templateId, format });
    return data.data;
  },
  getAlerts: async (): Promise<AlertItem[]> => {
    const { data } = await api.get<ApiResponse<AlertItem[]>>('/alerts');
    return data.data;
  },
  acknowledgeAlert: async (id: string): Promise<AlertItem | undefined> => {
    const { data } = await api.patch<ApiResponse<AlertItem>>(`/alerts/${id}/acknowledge`);
    return data.data;
  },
  getAdminUsers: async (): Promise<AdminUser[]> => {
    const { data } = await api.get<ApiResponse<AdminUser[]>>('/admin/users');
    return data.data;
  },
  getSystemSettings: async (): Promise<SystemSettings> => {
    const { data } = await api.get<ApiResponse<SystemSettings>>('/admin/settings');
    return data.data;
  },
  updateSystemSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const { data } = await api.put<ApiResponse<SystemSettings>>('/admin/settings', settings);
    return data.data;
  },
  getHealth: async (): Promise<HealthPayload> => {
    const { data } = await api.get<ApiResponse<HealthPayload>>('/health');
    return data.data;
  },
};

export default api;
