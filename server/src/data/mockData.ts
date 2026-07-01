export const graphData = {
  nodes: [
    { id: 'p101', label: 'Pump P-101', type: 'asset' as const, data: { unit: 'Unit 3', status: 'Critical' } },
    { id: 'v203', label: 'Valve V-203', type: 'asset' as const, data: { unit: 'Unit 3' } },
    { id: 'hx301', label: 'HX-301', type: 'asset' as const, data: { unit: 'Unit 3' } },
    { id: 'm1', label: 'Maint Report Q1', type: 'maintenance' as const },
    { id: 'm2', label: 'Seal Replacement', type: 'maintenance' as const },
    { id: 'i1', label: 'Overheat Incident', type: 'incident' as const },
    { id: 'in1', label: 'Annual Inspection', type: 'inspection' as const },
    { id: 'a1', label: 'High Temp Alert', type: 'alert' as const },
    { id: 'r1', label: 'RCA Report #42', type: 'report' as const },
    { id: 'c204', label: 'Compressor C-204', type: 'asset' as const },
  ],
  edges: [
    { id: 'e1', source: 'p101', target: 'm1', label: 'maintained' },
    { id: 'e2', source: 'p101', target: 'm2', label: 'serviced' },
    { id: 'e3', source: 'p101', target: 'i1', label: 'failed' },
    { id: 'e4', source: 'p101', target: 'in1', label: 'inspected' },
    { id: 'e5', source: 'p101', target: 'a1', label: 'triggered' },
    { id: 'e6', source: 'i1', target: 'r1', label: 'investigated' },
    { id: 'e7', source: 'p101', target: 'v203', label: 'connected' },
    { id: 'e8', source: 'p101', target: 'hx301', label: 'feeds' },
    { id: 'e9', source: 'c204', target: 'a1', label: 'related' },
  ],
};

export const maintenanceDashboard = {
  distribution: [
    { name: 'High Risk', value: 12, color: '#ef4444' },
    { name: 'Medium Risk', value: 28, color: '#f59e0b' },
    { name: 'Low Risk', value: 60, color: '#10b981' },
  ],
  assets: [
    { id: '1', tag: 'P-101', name: 'Centrifugal Pump P-101', healthScore: 62, failureRisk: 87, riskLevel: 'high' as const, lastMaintenance: '2026-03-15', recommendation: 'Schedule seal replacement within 7 days' },
    { id: '2', tag: 'C-204', name: 'Compressor C-204', healthScore: 71, failureRisk: 78, riskLevel: 'high' as const, lastMaintenance: '2026-04-01', recommendation: 'Monitor bearing vibration daily' },
    { id: '3', tag: 'HX-301', name: 'Heat Exchanger HX-301', healthScore: 78, failureRisk: 55, riskLevel: 'medium' as const, lastMaintenance: '2026-05-10', recommendation: 'Clean tubes during next shutdown' },
    { id: '4', tag: 'V-203', name: 'Control Valve V-203', healthScore: 85, failureRisk: 32, riskLevel: 'low' as const, lastMaintenance: '2026-05-20', recommendation: 'Routine inspection sufficient' },
    { id: '5', tag: 'T-105', name: 'Storage Tank T-105', healthScore: 91, failureRisk: 15, riskLevel: 'low' as const, lastMaintenance: '2026-06-01', recommendation: 'No action required' },
  ],
};

export const complianceDashboard = {
  overallScore: 92,
  auditReadiness: 88,
  violations: 3,
  items: [
    { id: '1', standard: 'ISO 14001', status: 'compliant' as const, score: 96, lastAudit: '2026-05-15', missingReports: [] },
    { id: '2', standard: 'API 610', status: 'compliant' as const, score: 94, lastAudit: '2026-04-20', missingReports: [] },
    { id: '3', standard: 'OSHA 1910', status: 'partial' as const, score: 82, lastAudit: '2026-03-10', missingReports: ['Lockout/Tagout Log Q2'] },
    { id: '4', standard: 'EPA Clean Air', status: 'compliant' as const, score: 91, lastAudit: '2026-05-01', missingReports: [] },
    { id: '5', standard: 'ISO 45001', status: 'non-compliant' as const, score: 68, lastAudit: '2026-02-28', missingReports: ['Incident Report #IR-089', 'Safety Training Records'] },
  ],
  recommendations: [
    'Complete missing OSHA lockout/tagout documentation for Unit 3',
    'Schedule ISO 45001 remediation audit within 30 days',
    'Update safety training records for 12 technicians',
  ],
};

export const lessonsLearned = [
  { id: '1', pattern: 'Overheating is the leading cause of pump failures in Unit 3', frequency: 14, trend: 'increasing' as const, recommendation: 'Install continuous temperature monitoring on all critical pumps', preventiveAction: 'Implement thermal imaging during monthly inspections' },
  { id: '2', pattern: 'Seal failures correlate with delayed maintenance beyond 90 days', frequency: 9, trend: 'stable' as const, recommendation: 'Reduce maintenance interval for seal assemblies to 60 days', preventiveAction: 'Auto-schedule seal inspections in CMMS' },
  { id: '3', pattern: 'Vibration spikes precede 78% of compressor failures', frequency: 7, trend: 'decreasing' as const, recommendation: 'Deploy IoT vibration sensors on C-204 and C-205', preventiveAction: 'Set alert threshold at 4.5 mm/s RMS' },
  { id: '4', pattern: 'Heat exchanger fouling reduces efficiency by 15% after 180 days', frequency: 5, trend: 'stable' as const, recommendation: 'Schedule tube cleaning every 120 days', preventiveAction: 'Track pressure differential trends' },
];

export const rcaReports = [
  {
    id: 'rca-42',
    assetTag: 'P-101',
    incident: 'Centrifugal pump failure — unplanned shutdown',
    date: '2026-05-28',
    rootCause: 'Mechanical seal degradation due to operating temperature exceeding design limits (92°C vs 85°C max)',
    contributingFactors: ['Delayed seal replacement (45 days overdue)', 'Insufficient cooling water flow', 'Missed vibration alert on May 20'],
    evidence: [
      { title: 'Maintenance Manual P-101', source: 'Page 12 — Operating Limits' },
      { title: 'CMMS Work Order #4521', source: 'Overdue seal replacement' },
      { title: 'IoT Sensor Log', source: 'Temperature trend May 15-28' },
    ],
    confidence: 91,
    recommendations: ['Replace mechanical seal immediately', 'Install redundant temperature sensors', 'Reduce maintenance interval to 60 days'],
  },
];

export const twinAssets = [
  { id: '1', tag: 'P-101', name: 'Pump P-101', x: -3, z: 0, status: 'critical' as const, healthScore: 62 },
  { id: '2', tag: 'C-204', name: 'Compressor C-204', x: 3, z: -2, status: 'warning' as const, healthScore: 71 },
  { id: '3', tag: 'HX-301', name: 'HX-301', x: 0, z: 3, status: 'warning' as const, healthScore: 78 },
  { id: '4', tag: 'V-203', name: 'Valve V-203', x: -2, z: -3, status: 'healthy' as const, healthScore: 91 },
  { id: '5', tag: 'T-105', name: 'Tank T-105', x: 4, z: 2, status: 'healthy' as const, healthScore: 95 },
  { id: '6', tag: 'E-401', name: 'Exchanger E-401', x: -4, z: 2, status: 'healthy' as const, healthScore: 88 },
];

export const executiveDashboard = {
  kpis: [
    { label: 'Downtime Risk', value: '$2.4M', change: -12, positive: true },
    { label: 'Compliance Status', value: '92%', change: 3, positive: true },
    { label: 'Maintenance Backlog', value: 12, change: 8, positive: false },
    { label: 'Cost Impact (YTD)', value: '$890K', change: -5, positive: true },
  ],
  downtimeTrend: [
    { name: 'Jan', hours: 48 }, { name: 'Feb', hours: 42 }, { name: 'Mar', hours: 36 },
    { name: 'Apr', hours: 52 }, { name: 'May', hours: 28 }, { name: 'Jun', hours: 22 },
  ],
  costImpact: [
    { name: 'Jan', cost: 180 }, { name: 'Feb', cost: 150 }, { name: 'Mar', cost: 120 },
    { name: 'Apr', cost: 200 }, { name: 'May', cost: 95 }, { name: 'Jun', cost: 80 },
  ],
};

export const qrAssets: Record<string, object> = {
  'P-101': {
    id: 'qr-p101', tag: 'P-101', name: 'Centrifugal Pump P-101', healthScore: 62,
    location: 'Unit 3 — Process Area A', lastMaintenance: '2026-03-15',
    documents: ['Maintenance Manual', 'P&ID Unit 3', 'RCA Report #42'],
    insights: ['High failure risk — seal replacement overdue', 'Temperature trending above normal'],
    maintenanceHistory: [
      { date: '2026-03-15', action: 'Bearing lubrication', technician: 'J. Martinez' },
      { date: '2026-01-20', action: 'Impeller inspection', technician: 'S. Chen' },
      { date: '2025-11-05', action: 'Full teardown inspection', technician: 'J. Martinez' },
    ],
  },
};

export const pidDrawing = {
  id: 'pid-u3',
  name: 'Unit 3 Process P&ID',
  unit: 'Unit 3',
  equipment: [
    { id: 'eq1', tag: 'P-101', type: 'Pump', x: 20, y: 40, connections: ['V-203', 'HX-301'] },
    { id: 'eq2', tag: 'V-203', type: 'Valve', x: 45, y: 35, connections: ['P-101', 'T-105'] },
    { id: 'eq3', tag: 'HX-301', type: 'Heat Exchanger', x: 70, y: 45, connections: ['P-101', 'C-204'] },
    { id: 'eq4', tag: 'C-204', type: 'Compressor', x: 55, y: 65, connections: ['HX-301'] },
    { id: 'eq5', tag: 'T-105', type: 'Tank', x: 30, y: 70, connections: ['V-203'] },
    { id: 'eq6', tag: 'FI-101', type: 'Flow Indicator', x: 35, y: 25, connections: ['P-101'] },
    { id: 'eq7', tag: 'TI-201', type: 'Temperature Indicator', x: 60, y: 30, connections: ['HX-301'] },
  ],
};

export const collaborationNotes = [
  { id: '1', author: 'Sarah Chen', role: 'engineer' as const, assetTag: 'P-101', content: 'Vibration readings on P-101 are elevated. Recommend scheduling inspection before weekend shutdown.', mentions: ['J. Martinez'], timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', author: 'Mike Torres', role: 'manager' as const, assetTag: 'C-204', content: 'Approved budget for compressor bearing replacement. @Sarah Chen please coordinate with maintenance team.', mentions: ['Sarah Chen'], timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', author: 'Lisa Park', role: 'auditor' as const, assetTag: 'HX-301', content: 'ISO 45001 audit finding: missing inspection records for Q1. Need documentation by Friday.', mentions: [], timestamp: new Date(Date.now() - 86400000).toISOString() },
];

export const reportTemplates = [
  { id: 'r1', name: 'Maintenance Summary Report', type: 'maintenance' as const, description: 'Monthly maintenance activities, overdue items, and recommendations' },
  { id: 'r2', name: 'Compliance Audit Report', type: 'compliance' as const, description: 'Regulatory compliance status across all standards' },
  { id: 'r3', name: 'Safety Audit Report', type: 'audit' as const, description: 'OSHA and ISO 45001 audit readiness assessment' },
  { id: 'r4', name: 'Incident Investigation Report', type: 'incident' as const, description: 'Detailed incident analysis with RCA findings' },
  { id: 'r5', name: 'ISO 14001 Environmental Audit', type: 'compliance' as const, description: 'Verify emissions thresholds and environmental loop safety indices' },
  { id: 'r6', name: 'Pump P-101 Calibration Logs', type: 'maintenance' as const, description: 'Alignment metrics, seal fatigue measurements, and thermal tests' },
  { id: 'r7', name: 'Separator Stress Test Protocol', type: 'audit' as const, description: 'Unit 4 separator vessel pressure test and safety valve loops' },
  { id: 'r8', name: 'HSE Safety Training Log Template', type: 'audit' as const, description: 'Archive safety briefings and employee certificate validations' },
];

export const alerts = [
  { id: '1', type: 'risk' as const, title: 'High Temperature — Pump P-101', description: 'Operating temperature 92°C exceeds threshold of 85°C', severity: 'critical' as const, timestamp: new Date(Date.now() - 900000).toISOString(), acknowledged: false, assetTag: 'P-101' },
  { id: '2', type: 'maintenance' as const, title: 'Overdue Maintenance — HX-301', description: 'Tube cleaning overdue by 14 days', severity: 'high' as const, timestamp: new Date(Date.now() - 3600000).toISOString(), acknowledged: false, assetTag: 'HX-301' },
  { id: '3', type: 'compliance' as const, title: 'Missing Documentation — ISO 45001', description: '2 required reports missing for Q2 audit', severity: 'medium' as const, timestamp: new Date(Date.now() - 7200000).toISOString(), acknowledged: true },
  { id: '4', type: 'risk' as const, title: 'Vibration Alert — C-204', description: 'Vibration level 5.2 mm/s exceeds alert threshold', severity: 'high' as const, timestamp: new Date(Date.now() - 14400000).toISOString(), acknowledged: false, assetTag: 'C-204' },
  { id: '5', type: 'maintenance' as const, title: 'Scheduled PM — V-203', description: 'Routine valve inspection due in 3 days', severity: 'low' as const, timestamp: new Date(Date.now() - 86400000).toISOString(), acknowledged: true, assetTag: 'V-203' },
];

export const adminUsers = [
  { id: '1', name: 'Admin User', email: 'admin@industria.ai', role: 'admin' as const, status: 'active' as const, lastLogin: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', name: 'Mike Torres', email: 'm.torres@plant.com', role: 'manager' as const, status: 'active' as const, lastLogin: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', name: 'Sarah Chen', email: 's.chen@plant.com', role: 'engineer' as const, status: 'active' as const, lastLogin: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', name: 'J. Martinez', email: 'j.martinez@plant.com', role: 'technician' as const, status: 'active' as const, lastLogin: new Date(Date.now() - 172800000).toISOString() },
  { id: '5', name: 'Lisa Park', email: 'l.park@plant.com', role: 'auditor' as const, status: 'active' as const, lastLogin: new Date(Date.now() - 43200000).toISOString() },
];

export const systemSettings = {
  geminiModel: 'gemini-2.0-flash',
  autoProcessing: true,
  alertThreshold: 85,
  retentionDays: 365,
};

export const copilotResponses: Record<string, object> = {
  default: {
    content: "Based on my analysis of your plant knowledge base, I couldn't find a direct document matching that specific query. However, I highly recommend asking about one of the following key active areas: Pump P-101 root causes, Heat Exchanger HX-301 maintenance, or compliance audits.",
    sources: [
      { title: 'Asset Diagnostics Directory', page: 'Index' },
      { title: 'ISO Regulatory Compliance Catalog', page: 'Summary' }
    ],
    confidence: 88,
    recommendations: [
      'Query: "Why did Pump P-101 fail?"',
      'Query: "What is the maintenance history of HX-301?"',
      'Query: "Show me outstanding compliance gaps"'
    ],
    reasoningSummary: 'RAG search matched general terms against operational asset index.',
    relatedDocuments: ['Asset Catalog.pdf'],
    relatedAssets: ['Centrifugal Pump P-101', 'Heat Exchanger HX-301']
  },
  'p-101': {
    content: 'Pump P-101 experienced an unplanned failure on May 28, 2026. Root cause analysis identified mechanical seal degradation due to operating temperature exceeding design limits (92°C vs 85°C max). The seal replacement was 45 days overdue per CMMS Work Order #4521.',
    sources: [
      { title: 'RCA Report #42', page: 'Section 3.2', documentId: 'rca-42' },
      { title: 'Maintenance Manual P-101', page: 'Page 12' },
      { title: 'CMMS Work Order #4521', page: 'Details' },
    ],
    confidence: 94,
    recommendations: [
      'Schedule immediate seal replacement',
      'Install redundant temperature sensors',
      'Reduce maintenance interval to 60 days',
    ],
    reasoningSummary: 'RCA analysis engine matched thermal seal wear patterns with historic telemetry data.',
    relatedDocuments: ['Pump P-101 Failure Report.pdf', 'CMMS Work Order Log #4521.xlsx'],
    relatedAssets: ['Centrifugal Pump P-101']
  },
  maintenance: {
    content: 'Pump P-101 maintenance history shows: bearing lubrication (Mar 15, 2026), impeller inspection (Jan 20, 2026), and full teardown inspection (Nov 5, 2025). Current seal replacement is 45 days overdue with high failure risk score of 87%.',
    sources: [
      { title: 'CMMS Maintenance Log', page: 'P-101 History' },
      { title: 'Predictive Maintenance Dashboard', page: 'Risk Assessment' },
    ],
    confidence: 91,
    recommendations: ['Schedule seal replacement within 7 days', 'Review cooling water flow rates'],
    reasoningSummary: 'Predictive algorithm evaluated elapsed time since last inspection against bearing wear coefficients.',
    relatedDocuments: ['Maintenance Manual P-101.pdf'],
    relatedAssets: ['Centrifugal Pump P-101']
  },
  compliance: {
    content: 'Overall compliance score is 92%. ISO 45001 is non-compliant (68%) with 2 missing reports. OSHA 1910 is partially compliant — missing Lockout/Tagout Log for Q2. ISO 14001 and API 610 are fully compliant.',
    sources: [
      { title: 'Compliance Dashboard Q2', page: 'Summary' },
      { title: 'ISO 45001 Audit Report', page: 'Findings' },
    ],
    confidence: 96,
    recommendations: ['Complete ISO 45001 remediation within 30 days', 'Update safety training records for 12 technicians'],
    reasoningSummary: 'Safety audit auditor parser checked checklist indexes against regulatory requirements.',
    relatedDocuments: ['OSHA Standard 1910.119', 'HSE Q2 Training Schedule.csv'],
    relatedAssets: ['Centrifugal Pump P-101', 'Heat Exchanger HX-301']
  },
};
