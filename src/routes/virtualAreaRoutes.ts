import { Router } from 'express';
import { requireAuth } from '../utils/requireAuth';
import { createVirtualArea, getVirtualAreas, updateVirtualArea, deleteVirtualArea } from '../controllers/virtualAreaController';

const router = Router();

router.post('/:id/virtual-areas', requireAuth, createVirtualArea);
router.get('/:id/virtual-areas', getVirtualAreas);
router.patch('/virtual-areas/:areaId', requireAuth, updateVirtualArea);
router.delete('/virtual-areas/:areaId', requireAuth, deleteVirtualArea);

export default router;
