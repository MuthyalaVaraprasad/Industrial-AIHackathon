import { Router } from 'express';
import multer from 'multer';
import { documentStore } from '../services/documentStore';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const data = documentStore.getAll(page, pageSize);
  res.json({ success: true, data });
});

router.get('/:id', (req, res) => {
  const doc = documentStore.getById(req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Document not found' });
    return;
  }
  res.json({ success: true, data: doc });
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  const doc = documentStore.create(req.file.originalname, req.file.size, req.file.buffer);
  res.status(201).json({ success: true, data: doc });
});

router.delete('/:id', (req, res) => {
  const deleted = documentStore.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Document not found' });
    return;
  }
  res.json({ success: true, message: 'Document deleted' });
});

router.post('/:id/reprocess', (req, res) => {
  const doc = documentStore.getById(req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Document not found' });
    return;
  }
  res.json({ success: true, data: doc });
});

export default router;
