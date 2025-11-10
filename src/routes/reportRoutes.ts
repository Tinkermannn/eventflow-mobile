import { Router } from 'express';
import { requireAuth } from '../utils/requireAuth';
import { createReport, getReports, updateReportStatus, deleteReport } from '../controllers/reportController';

const router = Router();

router.post('/:id/reports', requireAuth, createReport);
router.get('/:id/reports', getReports);
router.patch('/reports/:reportId', requireAuth, updateReportStatus);
router.delete('/reports/:reportId', requireAuth, deleteReport);

export default router;
