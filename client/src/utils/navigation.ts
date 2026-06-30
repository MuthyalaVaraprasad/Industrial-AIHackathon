import type { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/app/dashboard', icon: 'LayoutDashboard', enabled: true },
  { id: 'documents', label: 'Document Intelligence', path: '/app/documents', icon: 'FileText', enabled: true },
  { id: 'processing', label: 'OCR & Processing', path: '/app/processing', icon: 'Scan', enabled: true },
  { id: 'knowledge-graph', label: 'Knowledge Graph', path: '/app/knowledge-graph', icon: 'Share2', enabled: true },
  { id: 'copilot', label: 'AI Copilot', path: '/app/copilot', icon: 'MessageSquare', enabled: true },
  { id: 'pid', label: 'P&ID Intelligence', path: '/app/pid', icon: 'GitBranch', enabled: true },
  { id: 'maintenance', label: 'Predictive Maintenance', path: '/app/maintenance', icon: 'Wrench', enabled: true },
  { id: 'compliance', label: 'Compliance', path: '/app/compliance', icon: 'Shield', enabled: true },
  { id: 'lessons', label: 'Lessons Learned', path: '/app/lessons', icon: 'BookOpen', enabled: true },
  { id: 'rca', label: 'Root Cause Analysis', path: '/app/rca', icon: 'Search', enabled: true },
  { id: 'digital-twin', label: 'Digital Twin', path: '/app/digital-twin', icon: 'Box', enabled: true },
  { id: 'executive', label: 'Executive Center', path: '/app/executive', icon: 'BarChart3', enabled: true },
  { id: 'qr-scanner', label: 'QR Asset Scanner', path: '/app/qr-scanner', icon: 'QrCode', enabled: true },
  { id: 'simulator', label: 'AI Impact Simulator', path: '/app/simulator', icon: 'Sliders', enabled: true },
  { id: 'collaboration', label: 'Team Notes', path: '/app/collaboration', icon: 'Users', enabled: true },
  { id: 'voice', label: 'Voice Assistant', path: '/app/voice', icon: 'Mic', enabled: true },
  { id: 'reports', label: 'Report Generator', path: '/app/reports', icon: 'FileOutput', enabled: true },
  { id: 'alerts', label: 'Alerts', path: '/app/alerts', icon: 'Bell', enabled: true },
  { id: 'settings', label: 'Settings & Profile', path: '/app/settings', icon: 'Settings', enabled: true },
  { id: 'asset-360', label: 'Asset 360 Profile', path: '/app/asset-360', icon: 'Activity', enabled: true },
];

export const LANDING_FEATURES = [
  {
    title: 'Document Intelligence',
    description: 'Upload PDFs, DOCX, XLSX, and images. Automatic OCR, entity extraction, and classification powered by Gemini AI.',
    icon: 'FileText',
  },
  {
    title: 'Knowledge Graph Explorer',
    description: 'Interactive Neo4j-powered graph connecting assets, maintenance, incidents, and compliance records.',
    icon: 'Share2',
  },
  {
    title: 'AI Copilot',
    description: 'Ask anything about your plant. Get answers with source citations and confidence scores via RAG.',
    icon: 'MessageSquare',
  },
  {
    title: 'Predictive Maintenance',
    description: 'AI-driven asset health scoring, failure risk prediction, and maintenance recommendations.',
    icon: 'Wrench',
  },
  {
    title: 'Digital Twin',
    description: 'Interactive 3D plant overview with real-time asset health and risk status visualization.',
    icon: 'Box',
  },
  {
    title: 'Compliance Dashboard',
    description: 'Track regulatory compliance, audit readiness, violations, and automated recommendations.',
    icon: 'Shield',
  },
];

export const ARCHITECTURE_LAYERS = [
  { name: 'Data Sources', items: ['PDFs', 'CAD/P&ID', 'CMMS', 'IoT Sensors', 'Regulations'] },
  { name: 'Ingestion Layer', items: ['OCR', 'Chunking', 'Entity Extraction', 'Classification'] },
  { name: 'Knowledge Layer', items: ['Neo4j Graph', 'Pinecone Vectors', 'MongoDB Store'] },
  { name: 'AI Agent Layer', items: ['Supervisor Agent', 'Specialized Agents', 'LangChain'] },
  { name: 'Application Layer', items: ['Dashboard', 'Copilot', 'Digital Twin', 'Reports'] },
];

export const BUSINESS_IMPACT = [
  { metric: '40%', label: 'Reduction in unplanned downtime' },
  { metric: '60%', label: 'Faster document retrieval' },
  { metric: '85%', label: 'Compliance audit readiness' },
  { metric: '3x', label: 'Faster root cause analysis' },
];
