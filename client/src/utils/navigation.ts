import type { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/app/dashboard', icon: 'LayoutDashboard', enabled: true },
  { id: 'industrial-intelligence', label: 'Industrial Intelligence', path: '/app/industrial-intelligence', icon: 'BarChart3', enabled: true },
  { id: 'decision-intelligence', label: 'Decision Intelligence', path: '/app/decision-intelligence', icon: 'Search', enabled: true },
  { id: 'control-center', label: 'Industrial Control Center', path: '/app/control-center', icon: 'Box', enabled: true },
  { id: 'hse-safety', label: 'HSE & Safety Assurance', path: '/app/hse-safety', icon: 'Shield', enabled: true },
  { id: 'energy-carbon', label: 'Energy & Carbon Panel', path: '/app/energy-carbon', icon: 'Zap', enabled: true },
  { id: 'maintenance-dispatch', label: 'Maintenance Dispatch Hub', path: '/app/maintenance-dispatch', icon: 'Wrench', enabled: true },
  { id: 'document-ocr-pipeline', label: 'OCR Pipeline Console', path: '/app/document-ocr-pipeline', icon: 'Scan', enabled: true },
  { id: 'ai-platform-diagnostics', label: 'AI Diagnostics Console', path: '/app/ai-platform-diagnostics', icon: 'Sliders', enabled: true },
  { id: 'documents', label: 'Document Intelligence', path: '/app/documents', icon: 'FileText', enabled: true },
  { id: 'processing', label: 'OCR & Processing', path: '/app/processing', icon: 'Scan', enabled: true },
  { id: 'copilot', label: 'AI Copilot', path: '/app/copilot', icon: 'MessageSquare', enabled: true },
  { id: 'maintenance', label: 'Predictive Maintenance', path: '/app/maintenance', icon: 'Wrench', enabled: true },
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
