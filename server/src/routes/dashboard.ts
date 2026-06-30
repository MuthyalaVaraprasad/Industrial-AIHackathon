import { Router } from 'express';

const router = Router();

router.get('/stats', (_req, res) => {
  res.json({
    success: true,
    data: {
      totalDocuments: 1284,
      totalAssets: 342,
      complianceScore: 92,
      riskAlerts: 7,
      activeUsers: 48,
      maintenanceStatus: {
        scheduled: 45,
        overdue: 12,
        completed: 128,
      },
    },
  });
});

router.get('/activities', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        type: 'document',
        title: 'Maintenance Manual Processed',
        description: 'Pump P-101 maintenance manual extracted 47 entities',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        severity: 'low',
      },
      {
        id: '2',
        type: 'alert',
        title: 'High Temperature Alert',
        description: 'Compressor C-204 exceeded threshold (92°C)',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        severity: 'high',
      },
      {
        id: '3',
        type: 'maintenance',
        title: 'Scheduled Maintenance Due',
        description: 'Heat Exchanger HX-301 maintenance overdue by 3 days',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        severity: 'medium',
      },
      {
        id: '4',
        type: 'compliance',
        title: 'Audit Report Generated',
        description: 'Q2 compliance audit report ready for review',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        severity: 'low',
      },
      {
        id: '5',
        type: 'user',
        title: 'New User Onboarded',
        description: 'Sarah Chen (Auditor) joined the platform',
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      },
    ],
  });
});

router.get('/charts/asset-health', (_req, res) => {
  res.json({
    success: true,
    data: [
      { name: 'Jan', healthy: 280, atRisk: 45 },
      { name: 'Feb', healthy: 285, atRisk: 42 },
      { name: 'Mar', healthy: 290, atRisk: 38 },
      { name: 'Apr', healthy: 295, atRisk: 35 },
      { name: 'May', healthy: 300, atRisk: 32 },
      { name: 'Jun', healthy: 305, atRisk: 28 },
    ],
  });
});

router.get('/charts/maintenance', (_req, res) => {
  res.json({
    success: true,
    data: [
      { name: 'Jan', scheduled: 40, completed: 35, overdue: 8 },
      { name: 'Feb', scheduled: 42, completed: 38, overdue: 6 },
      { name: 'Mar', scheduled: 38, completed: 36, overdue: 5 },
      { name: 'Apr', scheduled: 45, completed: 42, overdue: 7 },
      { name: 'May', scheduled: 43, completed: 40, overdue: 9 },
      { name: 'Jun', scheduled: 45, completed: 38, overdue: 12 },
    ],
  });
});

router.get('/charts/compliance', (_req, res) => {
  res.json({
    success: true,
    data: [
      { name: 'Jan', score: 85 },
      { name: 'Feb', score: 87 },
      { name: 'Mar', score: 88 },
      { name: 'Apr', score: 90 },
      { name: 'May', score: 91 },
      { name: 'Jun', score: 92 },
    ],
  });
});

router.get('/charts/failures', (_req, res) => {
  res.json({
    success: true,
    data: [
      { name: 'Jan', failures: 8 },
      { name: 'Feb', failures: 6 },
      { name: 'Mar', failures: 5 },
      { name: 'Apr', failures: 7 },
      { name: 'May', failures: 4 },
      { name: 'Jun', failures: 3 },
    ],
  });
});

export default router;
