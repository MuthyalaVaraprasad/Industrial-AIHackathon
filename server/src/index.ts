import express from 'express';
import cors from 'cors';
import dashboardRoutes from './routes/dashboard';
import documentRoutes from './routes/documents';
import moduleRoutes from './routes/modules';
import { connectMongoDB } from './db/mongodb';
import { connectNeo4j, closeNeo4j } from './services/neo4jService';
import { connectPinecone } from './services/pineconeService';
import { initFirebaseAdmin, verifyAuth } from './middleware/auth';
import { getHealthPayload } from './services/serviceStatus';
import { seedKnowledgeBase } from './services/seedService';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(verifyAuth);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: getHealthPayload() });
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', moduleRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

async function bootstrap() {
  console.log('\n=== INDUSTRIA AI — Starting Services ===\n');

  await connectMongoDB();
  await connectNeo4j();
  await connectPinecone();
  initFirebaseAdmin();
  await seedKnowledgeBase();

  const health = getHealthPayload();
  console.log(`\nIntegrations: ${health.integrations.live}/${health.integrations.total} live`);
  health.services.forEach((s) => {
    console.log(`  ${s.connected ? '✓' : '○'} ${s.name} (${s.mode})`);
  });
  console.log('');

  app.listen(PORT, () => {
    console.log(`INDUSTRIA AI server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await closeNeo4j();
  process.exit(0);
});

export default app;
