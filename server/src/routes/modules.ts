import { Router } from 'express';
import {
  maintenanceDashboard, complianceDashboard, lessonsLearned,
  rcaReports, twinAssets, executiveDashboard, qrAssets, pidDrawing,
  reportTemplates,
} from '../data/mockData';
import { getKnowledgeGraph } from '../services/neo4jService';
import { handleCopilotChat } from '../services/copilotService';
import {
  getCollaborationNotes, addCollaborationNote,
  getAlerts, acknowledgeAlert,
  getSystemSettings, updateSystemSettings, getAdminUsers,
} from '../services/dataRepository';

const router = Router();

router.get('/knowledge-graph', async (req, res) => {
  const search = req.query.search as string | undefined;
  const type = req.query.type as string | undefined;
  const data = await getKnowledgeGraph(search, type);
  res.json({ success: true, data });
});

router.post('/copilot/chat', async (req, res) => {
  try {
    const { message } = req.body as { message: string };
    const response = await handleCopilotChat(message);
    res.json({ success: true, data: { message: response } });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/pid', (_req, res) => {
  res.json({ success: true, data: pidDrawing });
});

router.get('/maintenance', (_req, res) => {
  res.json({ success: true, data: maintenanceDashboard });
});

router.get('/compliance', (_req, res) => {
  res.json({ success: true, data: complianceDashboard });
});

router.get('/lessons', (_req, res) => {
  res.json({ success: true, data: lessonsLearned });
});

router.get('/rca', (_req, res) => {
  res.json({ success: true, data: rcaReports });
});

router.get('/digital-twin', (_req, res) => {
  res.json({ success: true, data: twinAssets });
});

router.get('/executive', (_req, res) => {
  res.json({ success: true, data: executiveDashboard });
});

router.get('/qr/:tag', (req, res) => {
  const tag = req.params.tag.toUpperCase();
  const asset = qrAssets[tag];
  if (!asset) {
    res.status(404).json({ success: false, message: 'Asset not found' });
    return;
  }
  res.json({ success: true, data: asset });
});

router.post('/simulator', (req, res) => {
  const { maintenanceDelayDays, assetCondition, riskMultiplier } = req.body as {
    maintenanceDelayDays: number;
    assetCondition: number;
    riskMultiplier: number;
  };

  const baseRisk = 100 - assetCondition;
  const delayFactor = maintenanceDelayDays * 2.5;
  const predictedRisk = Math.min(99, Math.round(baseRisk + delayFactor * (riskMultiplier / 50)));
  const estimatedCost = Math.round(predictedRisk * 1250 + maintenanceDelayDays * 800);
  const estimatedDowntime = Math.round(predictedRisk * 0.15 + maintenanceDelayDays * 0.5);

  let recommendation = 'Current parameters are within acceptable range. Continue standard monitoring.';
  if (predictedRisk > 70) recommendation = 'Critical: Schedule immediate maintenance. Delaying further increases failure probability significantly.';
  else if (predictedRisk > 45) recommendation = 'Warning: Plan maintenance within 14 days. Monitor asset condition daily.';

  res.json({
    success: true,
    data: { predictedRisk, estimatedCost, estimatedDowntime, recommendation },
  });
});

router.get('/collaboration', async (_req, res) => {
  const data = await getCollaborationNotes();
  res.json({ success: true, data });
});

router.post('/collaboration', async (req, res) => {
  const { author, role, assetTag, content, mentions } = req.body;
  const note = await addCollaborationNote({
    author: author || 'Current User',
    role: role || 'engineer',
    assetTag: assetTag || 'General',
    content,
    mentions: mentions || [],
  });
  res.status(201).json({ success: true, data: note });
});

router.get('/reports/templates', (_req, res) => {
  res.json({ success: true, data: reportTemplates });
});

router.post('/reports/generate', (req, res) => {
  const { templateId, format } = req.body as { templateId: string; format: string };
  const template = reportTemplates.find((t) => t.id === templateId);
  res.json({
    success: true,
    data: {
      filename: `${template?.name.replace(/\s/g, '_')}_${Date.now()}.${format}`,
      generatedAt: new Date().toISOString(),
      pages: Math.floor(Math.random() * 20) + 5,
    },
  });
});

router.get('/alerts', async (_req, res) => {
  const data = await getAlerts();
  res.json({ success: true, data });
});

router.patch('/alerts/:id/acknowledge', async (req, res) => {
  const alert = await acknowledgeAlert(req.params.id);
  res.json({ success: true, data: alert });
});

router.get('/admin/users', (_req, res) => {
  res.json({ success: true, data: getAdminUsers() });
});

router.get('/admin/settings', async (_req, res) => {
  const data = await getSystemSettings();
  res.json({ success: true, data });
});

router.put('/admin/settings', async (req, res) => {
  const data = await updateSystemSettings(req.body);
  res.json({ success: true, data });
});

export default router;
