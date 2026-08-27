import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadDataset, listDatasets, getDatasetById, deleteDataset, seedSampleDataset } from '../controllers/datasetController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

const router = Router();

router.post('/upload', authMiddleware, upload.single('file'), uploadDataset);
router.get('/', authMiddleware, listDatasets);
router.post('/seed', authMiddleware, seedSampleDataset);
router.get('/:id', authMiddleware, getDatasetById);
router.delete('/:id', authMiddleware, deleteDataset);

export default router;
