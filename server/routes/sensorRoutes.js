const express = require('express');
const router = express.Router();
const { ingestSensorData, getLatestReading, getReadingHistory } = require('../controllers/sensorController');
const { verifyApiKey } = require('../middleware/apiKeyMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.post('/sensor-data', verifyApiKey, ingestSensorData);
router.get('/sensor-data/:transformerId/latest', protect, getLatestReading);
router.get('/sensor-data/:transformerId/history', protect, getReadingHistory);
router.get('/transformers/:id/readings', protect, authorize('Admin', 'Engineer', 'Viewer'), getReadingHistory);

module.exports = router;
