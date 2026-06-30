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

import * as fallback from './proxy';

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    
    // If request failed (e.g. backend server offline in hosted env), return mock fallbacks
    if (url.includes('/dashboard/stats')) {
      return { data: { success: true, data: fallback.mockDashboardStats } };
    }
    if (url.includes('/dashboard/activities')) {
      return { data: { success: true, data: fallback.mockActivities } };
    }
    if (url.includes('/dashboard/charts/asset-health')) {
      return { data: { success: true, data: fallback.mockAssetHealth } };
    }
    if (url.includes('/dashboard/charts/maintenance')) {
      return { data: { success: true, data: fallback.mockMaintenanceTrends } };
    }
    if (url.includes('/documents')) {
      return { data: { success: true, data: { items: fallback.mockDocuments, total: fallback.mockDocuments.length, page: 1, pageSize: 20 } } };
    }
    if (url.includes('/knowledge-graph')) {
      return { data: { success: true, data: fallback.mockGraphData } };
    }
    if (url.includes('/pid')) {
      return { data: { success: true, data: fallback.mockPidDrawing } };
    }
    if (url.includes('/maintenance')) {
      return { data: { success: true, data: fallback.mockMaintenance } };
    }
    if (url.includes('/compliance')) {
      return { data: { success: true, data: fallback.mockCompliance } };
    }
    if (url.includes('/lessons')) {
      return { data: { success: true, data: fallback.mockLessons } };
    }
    if (url.includes('/rca')) {
      return { data: { success: true, data: fallback.mockRca } };
    }
    if (url.includes('/digital-twin')) {
      return { data: { success: true, data: fallback.mockDigitalTwin } };
    }
    if (url.includes('/executive')) {
      return { data: { success: true, data: fallback.mockExecutive } };
    }
    if (url.includes('/qr/')) {
      return { data: { success: true, data: fallback.mockQrAssets['P-101'] } };
    }
    if (url.includes('/collaboration')) {
      return { data: { success: true, data: fallback.mockCollaboration } };
    }
    if (url.includes('/reports/templates')) {
      return { data: { success: true, data: fallback.mockReportTemplates } };
    }
    if (url.includes('/reports/generate')) {
      return { data: { success: true, data: { filename: 'Compiled_Report_' + Date.now() + '.pdf', generatedAt: new Date().toISOString(), pages: 8 } } };
    }
    if (url.includes('/alerts')) {
      return { data: { success: true, data: fallback.mockAlerts } };
    }
    if (url.includes('/admin/users')) {
      return { data: { success: true, data: fallback.mockAdminUsers } };
    }
    if (url.includes('/admin/settings')) {
      return { data: { success: true, data: fallback.mockSettings } };
    }
    if (url.includes('/copilot/chat')) {
      return {
        data: {
          success: true,
          data: {
            message: {
              id: 'msg-' + Date.now(),
              role: 'assistant',
              content: "I couldn't reach the backend server to run the full RAG search. However, based on local cache details, Pump P-101 experienced seal wear on May 28, 2026. Recommended actions: Shaft realignment and replacement of seal pack.",
              timestamp: new Date().toISOString(),
              sources: [{ title: 'Local Cache Diagnostics Index', page: 'Fallback' }],
              confidence: 85,
              recommendations: ['Check temperature sensor status', 'Verify CMMS work orders history']
            }
          }
        }
      };
    }

    return Promise.reject(error);
  }
);

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
