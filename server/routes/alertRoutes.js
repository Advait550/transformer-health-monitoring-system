const express = require('express');
const router = express.Router();
const { getAlertsByTransformer, acknowledgeAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/transformers/:id/alerts', protect, authorize('Admin', 'Engineer', 'Viewer'), getAlertsByTransformer);
router.post('/alerts/:alertId/acknowledge', protect, authorize('Admin', 'Engineer'), acknowledgeAlert);

module.exports = router;
