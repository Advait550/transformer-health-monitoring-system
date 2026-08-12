const express = require('express');
const router = express.Router();
const {
  getMaintenanceByTransformer,
  createMaintenanceRecord,
  updateMaintenanceRecord,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/transformers/:id/maintenance', protect, authorize('Admin', 'Engineer', 'Viewer'), getMaintenanceByTransformer);
router.post('/transformers/:id/maintenance', protect, authorize('Admin', 'Engineer'), createMaintenanceRecord);
router.put('/maintenance/:maintenanceId', protect, authorize('Admin', 'Engineer'), updateMaintenanceRecord);

module.exports = router;
