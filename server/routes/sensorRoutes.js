const express = require('express');
const router = express.Router();
const { ingestSensorData, getReadingsByTransformer } = require('../controllers/sensorController');
const { verifyApiKey } = require('../middleware/apiKeyMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.post('/sensor-data', verifyApiKey, ingestSensorData);
router.get('/transformers/:id/readings', protect, authorize('Admin', 'Engineer', 'Viewer'), getReadingsByTransformer);

module.exports = router;
