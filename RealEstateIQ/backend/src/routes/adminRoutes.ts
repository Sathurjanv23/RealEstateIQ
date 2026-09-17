import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDashboardMetrics,
  getUsers,
  updateUserRole,
  deleteUser,
  getPredictionAnalytics,
  getMlModels,
  updateModelStatus,
  getDatasets,
  getAuditLogs,
} from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All admin routes require AUTH + ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

router.get('/dashboard', getDashboardMetrics);
router.get('/users', getUsers);
router.put(
  '/users/:id/role',
  [body('role').isIn(['USER', 'ADMIN']).withMessage('Role must be USER or ADMIN.')],
  validate,
  updateUserRole
);
router.delete('/users/:id', deleteUser);
router.get('/predictions/analytics', getPredictionAnalytics);
router.get('/models', getMlModels);
router.put(
  '/models/:id/status',
  [
    body('status')
      .isIn(['development', 'staging', 'production', 'archived'])
      .withMessage('Invalid status.'),
  ],
  validate,
  updateModelStatus
);
router.get('/datasets', getDatasets);
router.get('/audit-logs', getAuditLogs);

export default router;
