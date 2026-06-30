// Client-side fallback mock database for standalone Vercel hosting
import type {
  DashboardStats,
  ActivityItem,
  ChartDataPoint,
  DocumentRecord,
  GraphData,
  PIDDrawing,
  MaintenanceDashboard,
  ComplianceDashboard,
  LessonLearned,
  RCAReport,
  TwinAsset,
  ExecutiveDashboard,
  QRAsset,
  CollaborationNote,
  ReportTemplate,
  AlertItem,
  AdminUser,
  SystemSettings
} from '@/types';

export const mockDashboardStats: DashboardStats = {
  totalDocuments: 142,
  totalAssets: 150,
  complianceScore: 92,
  riskAlerts: 8,
  activeUsers: 24,
  maintenanceStatus: {
    scheduled: 18,
    overdue: 12,
    completed: 45
  }
};

export const mockActivities: ActivityItem[] = [
  { id: '1', type: 'maintenance', title: 'Pump P-101 seal replacement scheduled', description: 'Assigned to Marcus Vance', timestamp: '2026-06-30T10:00:00Z', severity: 'high' },
  { id: '2', type: 'compliance', title: 'ISO 45001 safety checklist completed', description: 'Verified by Elena Rostova', timestamp: '2026-06-30T09:00:00Z', severity: 'low' },
  { id: '3', type: 'document', title: 'Exchanger drawing blueprint ingested', description: 'Processed by OCR engine', timestamp: '2026-06-30T07:00:00Z', severity: 'medium' }
];

export const mockAssetHealth: ChartDataPoint[] = [
  { name: 'Pump P-101', value: 62 },
  { name: 'Compressor C-204', value: 71 },
  { name: 'Exchanger HX-301', value: 78 },
  { name: 'Valve V-203', value: 91 },
  { name: 'Tank T-105', value: 95 }
];

export const mockMaintenanceTrends: ChartDataPoint[] = [
  { name: 'Week 1', value: 4 },
  { name: 'Week 2', value: 7 },
  { name: 'Week 3', value: 3 },
  { name: 'Week 4', value: 8 }
];

export const mockDocuments: DocumentRecord[] = [
  { 
    id: 'doc-1', 
    name: 'Pump P-101 Failure Report.pdf', 
    type: 'pdf', 
    size: 2400000, 
    status: 'completed', 
    progress: 100,
    uploadedAt: '2026-06-20', 
    entities: [], 
    metadata: { title: 'Failure Report' } 
  },
  { 
    id: 'doc-2', 
    name: 'Shell Heat Exchanger specifications.pdf', 
    type: 'pdf', 
    size: 1800000, 
    status: 'completed', 
    progress: 100,
    uploadedAt: '2026-06-18', 
    entities: [], 
    metadata: { title: 'Exchanger Spec' } 
  },
  { 
    id: 'doc-3', 
    name: 'OSHA separator guidelines.pdf', 
    type: 'pdf', 
    size: 3100000, 
    status: 'completed', 
    progress: 100,
    uploadedAt: '2026-06-15', 
    entities: [], 
    metadata: { title: 'OSHA standard' } 
  }
];

export const mockGraphData: GraphData = {
  nodes: [
    { id: 'p101', label: 'Pump P-101', type: 'asset', data: { unit: 'Unit 3', status: 'Critical' } },
    { id: 'v203', label: 'Valve V-203', type: 'asset', data: { unit: 'Unit 3' } },
    { id: 'hx301', label: 'HX-301', type: 'asset', data: { unit: 'Unit 3' } },
    { id: 'm1', label: 'Maint Report Q1', type: 'maintenance' },
    { id: 'i1', label: 'Overheat Incident', type: 'incident' },
    { id: 'r1', label: 'RCA Report #42', type: 'report' }
  ],
  edges: [
    { id: 'e1', source: 'p101', target: 'm1', label: 'maintained' },
    { id: 'e2', source: 'p101', target: 'i1', label: 'failed' },
    { id: 'e3', source: 'p101', target: 'v203', label: 'connected' },
    { id: 'e4', source: 'p101', target: 'hx301', label: 'feeds' },
    { id: 'e5', source: 'i1', target: 'r1', label: 'investigated' }
  ]
};

export const mockPidDrawing: PIDDrawing = {
  id: 'pid-u3',
  name: 'Unit 3 Process P&ID Flow Diagram',
  unit: 'Unit 3',
  equipment: [
    { id: 'eq1', tag: 'P-101', type: 'Pump', x: 20, y: 40, connections: ['V-203', 'HX-301'] },
    { id: 'eq2', tag: 'V-203', type: 'Valve', x: 45, y: 35, connections: ['P-101', 'T-105'] },
    { id: 'eq3', tag: 'HX-301', type: 'Heat Exchanger', x: 70, y: 45, connections: ['P-101', 'C-204'] },
    { id: 'eq4', tag: 'C-204', type: 'Compressor', x: 55, y: 65, connections: ['HX-301'] },
    { id: 'eq5', tag: 'T-105', type: 'Tank', x: 30, y: 70, connections: ['V-203'] }
  ]
};

export const mockMaintenance: MaintenanceDashboard = {
  distribution: [
    { name: 'High Risk', value: 12, color: '#ef4444' },
    { name: 'Medium Risk', value: 28, color: '#f59e0b' },
    { name: 'Low Risk', value: 60, color: '#10b981' }
  ],
  assets: [
    { id: '1', tag: 'P-101', name: 'Centrifugal Pump P-101', healthScore: 62, failureRisk: 87, riskLevel: 'high', lastMaintenance: '2026-03-15', recommendation: 'Schedule seal replacement within 7 days' },
    { id: '2', tag: 'C-204', name: 'Compressor C-204', healthScore: 71, failureRisk: 78, riskLevel: 'high', lastMaintenance: '2026-04-01', recommendation: 'Monitor bearing vibration daily' },
    { id: '3', tag: 'HX-301', name: 'Heat Exchanger HX-301', healthScore: 78, failureRisk: 55, riskLevel: 'medium', lastMaintenance: '2026-05-10', recommendation: 'Clean tubes during next shutdown' },
    { id: '4', tag: 'V-203', name: 'Control Valve V-203', healthScore: 85, failureRisk: 32, riskLevel: 'low', lastMaintenance: '2026-05-20', recommendation: 'Routine inspection sufficient' },
    { id: '5', tag: 'T-105', name: 'Storage Tank T-105', healthScore: 91, failureRisk: 15, riskLevel: 'low', lastMaintenance: '2026-06-01', recommendation: 'No action required' }
  ]
};

export const mockCompliance: ComplianceDashboard = {
  overallScore: 92,
  auditReadiness: 88,
  violations: 3,
  items: [
    { id: '1', standard: 'ISO 14001', status: 'compliant', score: 96, lastAudit: '2026-05-15', missingReports: [] },
    { id: '2', standard: 'API 610', status: 'compliant', score: 94, lastAudit: '2026-04-20', missingReports: [] },
    { id: '3', standard: 'OSHA 1910', status: 'partial', score: 82, lastAudit: '2026-03-10', missingReports: ['Lockout/Tagout Log Q2'] },
    { id: '4', standard: 'EPA Clean Air', status: 'compliant', score: 91, lastAudit: '2026-05-01', missingReports: [] },
    { id: '5', standard: 'ISO 45001', status: 'non-compliant', score: 68, lastAudit: '2026-02-28', missingReports: ['Incident Report #IR-089', 'Safety Training Records'] }
  ],
  recommendations: [
    'Complete missing OSHA lockout/tagout documentation for Unit 3',
    'Schedule ISO 45001 remediation audit within 30 days',
    'Update safety training records for 12 technicians'
  ]
};

export const mockLessons: LessonLearned[] = [
  { id: '1', pattern: 'Overheating is the leading cause of pump failures in Unit 3', frequency: 14, trend: 'increasing', recommendation: 'Install continuous temperature monitoring on all critical pumps', preventiveAction: 'Implement thermal imaging during monthly inspections' },
  { id: '2', pattern: 'Seal failures correlate with delayed maintenance beyond 90 days', frequency: 9, trend: 'stable', recommendation: 'Reduce maintenance interval for seal assemblies to 60 days', preventiveAction: 'Auto-schedule seal inspections in CMMS' },
  { id: '3', pattern: 'Vibration spikes precede 78% of compressor failures', frequency: 7, trend: 'decreasing', recommendation: 'Deploy IoT vibration sensors on C-204 and C-205', preventiveAction: 'Set alert threshold at 4.5 mm/s RMS' }
];

export const mockRca: RCAReport[] = [
  {
    id: 'rca-42',
    assetTag: 'P-101',
    incident: 'Centrifugal pump failure — unplanned shutdown',
    date: '2026-05-28',
    rootCause: 'Mechanical seal degradation due to operating temperature exceeding design limits (92°C vs 85°C max)',
    contributingFactors: ['Delayed seal replacement (45 days overdue)', 'Insufficient cooling water flow', 'Missed vibration alert on May 20'],
    evidence: [
      { title: 'Maintenance Manual P-101', source: 'Page 12 — Operating Limits' },
      { title: 'CMMS Work Order #4521', source: 'Overdue seal replacement' }
    ],
    confidence: 91,
    recommendations: ['Replace mechanical seal immediately', 'Install redundant temperature sensors']
  }
];

export const mockDigitalTwin: TwinAsset[] = [
  { id: '1', tag: 'P-101', name: 'Pump P-101', x: -3, z: 0, status: 'critical', healthScore: 62 },
  { id: '2', tag: 'C-204', name: 'Compressor C-204', x: 3, z: -2, status: 'warning', healthScore: 71 },
  { id: '3', tag: 'HX-301', name: 'HX-301', x: 0, z: 3, status: 'warning', healthScore: 78 },
  { id: '4', tag: 'V-203', name: 'Valve V-203', x: -2, z: -3, status: 'healthy', healthScore: 91 }
];

export const mockExecutive: ExecutiveDashboard = {
  kpis: [
    { label: 'Downtime Risk', value: '$2.4M', change: -12, positive: true },
    { label: 'Compliance Status', value: '92%', change: 3, positive: true },
    { label: 'Maintenance Backlog', value: 12, change: 8, positive: false },
    { label: 'Cost Impact (YTD)', value: '$890K', change: -5, positive: true }
  ],
  downtimeTrend: [
    { name: 'Jan', value: 48, hours: 48 }, { name: 'Feb', value: 42, hours: 42 }, { name: 'Mar', value: 36, hours: 36 },
    { name: 'Apr', value: 52, hours: 52 }, { name: 'May', value: 28, hours: 28 }, { name: 'Jun', value: 22, hours: 22 }
  ],
  costImpact: [
    { name: 'Jan', value: 180, cost: 180 }, { name: 'Feb', value: 150, cost: 150 }, { name: 'Mar', value: 120, cost: 120 },
    { name: 'Apr', value: 200, cost: 200 }, { name: 'May', value: 95, cost: 95 }, { name: 'Jun', value: 80, cost: 80 }
  ]
};

export const mockQrAssets: Record<string, QRAsset> = {
  'P-101': {
    id: 'qr-p101', tag: 'P-101', name: 'Centrifugal Pump P-101', healthScore: 62,
    location: 'Unit 3 — Process Area A', lastMaintenance: '2026-03-15',
    documents: ['Maintenance Manual', 'P&ID Unit 3', 'RCA Report #42'],
    insights: ['High failure risk — seal replacement overdue', 'Temperature trending above normal'],
    maintenanceHistory: [
      { date: '2026-03-15', action: 'Bearing lubrication', technician: 'J. Martinez' },
      { date: '2026-01-20', action: 'Impeller inspection', technician: 'S. Chen' }
    ]
  }
};

export const mockCollaboration: CollaborationNote[] = [
  { id: '1', author: 'Sarah Chen', role: 'engineer', assetTag: 'P-101', content: 'Vibration readings on P-101 are elevated. Recommend scheduling inspection before weekend shutdown.', mentions: ['J. Martinez'], timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', author: 'Mike Torres', role: 'manager', assetTag: 'C-204', content: 'Approved replacement budget. @Sarah Chen please coordinate with maintenance.', mentions: ['Sarah Chen'], timestamp: new Date(Date.now() - 7200000).toISOString() }
];

export const mockReportTemplates: ReportTemplate[] = [
  { id: 'r1', name: 'Maintenance Summary Report', type: 'maintenance', description: 'Monthly maintenance activities, overdue items, and recommendations' },
  { id: 'r2', name: 'Compliance Audit Report', type: 'compliance', description: 'Regulatory compliance status across all standards' },
  { id: 'r3', name: 'Safety Audit Report', type: 'audit', description: 'OSHA and ISO 45001 audit readiness assessment' },
  { id: 'r4', name: 'Incident Investigation Report', type: 'incident', description: 'Detailed incident analysis with RCA findings' },
  { id: 'r5', name: 'ISO 14001 Environmental Audit', type: 'compliance', description: 'Verify emissions thresholds and environmental loop safety indices' },
  { id: 'r6', name: 'Pump P-101 Calibration Logs', type: 'maintenance', description: 'Alignment metrics, seal fatigue measurements, and thermal tests' },
  { id: 'r7', name: 'Separator Stress Test Protocol', type: 'audit', description: 'Unit 4 separator vessel pressure test and safety valve loops' },
  { id: 'r8', name: 'HSE Safety Training Log Template', type: 'audit', description: 'Archive safety briefings and employee certificate validations' }
];

export const mockAlerts: AlertItem[] = [
  { id: '1', type: 'risk', title: 'High Temperature — Pump P-101', description: 'Operating temp exceeds threshold', severity: 'critical', timestamp: new Date(Date.now() - 900000).toISOString(), acknowledged: false, assetTag: 'P-101' },
  { id: '2', type: 'maintenance', title: 'Overdue Maintenance — HX-301', description: 'Tube cleaning overdue by 14 days', severity: 'high', timestamp: new Date(Date.now() - 3600000).toISOString(), acknowledged: false, assetTag: 'HX-301' }
];

export const mockAdminUsers: AdminUser[] = [
  { id: '1', name: 'Admin User', email: 'admin@industria.ai', role: 'admin', status: 'active', lastLogin: new Date(Date.now() - 3600000).toISOString() }
];

export const mockSettings: SystemSettings = {
  geminiModel: 'gemini-2.0-flash',
  autoProcessing: true,
  alertThreshold: 85,
  retentionDays: 365
};
