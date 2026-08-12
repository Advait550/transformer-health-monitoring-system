const Transformer = require('../models/Transformer');
const SensorReading = require('../models/SensorReading');
const HealthScore = require('../models/HealthScore');
const healthScoreService = require('../services/healthScore/healthScoreService');
const alertEngine = require('../services/alerts/alertEngine');
const socketService = require('../services/realtime/socketService');

// @desc    Ingest sensor reading from ESP32, calculate health score, trigger alerts & real-time update
// @route   POST /api/sensor-data
// @access  IoT API Key protected
const ingestSensorData = async (req, res, next) => {
  try {
    const { transformerId, voltage, current, temperature } = req.body;

    if (!transformerId || voltage === undefined || current === undefined || temperature === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide transformerId, voltage, current, and temperature',
      });
    }

    const transformer = await Transformer.findById(transformerId);
    if (!transformer || !transformer.active) {
      return res.status(404).json({
        success: false,
        message: 'Transformer not found or is currently inactive/deactivated',
      });
    }

    // 1. Save Sensor Reading
    const sensorReading = await SensorReading.create({
      transformerId,
      voltage: Number(voltage),
      current: Number(current),
      temperature: Number(temperature),
      timestamp: new Date(),
    });

    // 2. Fetch previous health score status to detect status change
    const previousScore = await HealthScore.findOne({ transformerId })
      .sort({ calculatedAt: -1 })
      .exec();

    const previousStatus = previousScore ? previousScore.status : null;

    // 3. Backend Health Score Module Calculation
    const { score, status, modelVersion } = healthScoreService.calculate(
      Number(voltage),
      Number(current),
      Number(temperature)
    );

    // 4. Save Health Score Document
    const healthScoreDoc = await HealthScore.create({
      transformerId,
      score,
      status,
      calculatedAt: new Date(),
      modelVersion,
    });

    // 5. Run Alert Engine (Critical detection, deduplication, recovery)
    const alertResult = await alertEngine.evaluate(transformerId, status, score, {
      voltage: Number(voltage),
      current: Number(current),
      temperature: Number(temperature),
    });

    // 6. Socket.IO Real-time Emissions
    const realTimePayload = {
      transformerId,
      transformerName: transformer.name,
      location: transformer.location,
      voltage: Number(voltage),
      current: Number(current),
      temperature: Number(temperature),
      healthScore: score,
      status,
      timestamp: sensorReading.timestamp,
    };

    socketService.emitSensorUpdate(realTimePayload);

    if (previousStatus && previousStatus !== status) {
      socketService.emitStatusChange({
        transformerId,
        oldStatus: previousStatus,
        newStatus: status,
        score,
        timestamp: new Date(),
      });
    }

    if (alertResult.alertCreated) {
      socketService.emitAlertCreated({
        transformerId,
        alertId: alertResult.alert._id,
        severity: alertResult.alert.severity,
        type: alertResult.alert.type,
        createdAt: alertResult.alert.createdAt,
      });
    }

    if (alertResult.alertResolved) {
      socketService.emitAlertResolved({
        transformerId,
        alertId: alertResult.alert._id,
        resolvedAt: alertResult.alert.resolvedAt,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Sensor data ingested successfully',
      data: {
        readingId: sensorReading._id,
        healthScore: score,
        status,
        modelVersion,
        alertState: {
          alertCreated: alertResult.alertCreated,
          alertResolved: alertResult.alertResolved,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sensor reading history for a transformer (paginated)
// @route   GET /api/transformers/:id/readings
// @access  Private (All roles)
const getReadingsByTransformer = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await SensorReading.countDocuments({ transformerId: req.params.id });

    const readings = await SensorReading.find({ transformerId: req.params.id })
      .sort({ timestamp: -1 })
      .skip(startIndex)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: readings.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: readings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ingestSensorData,
  getReadingsByTransformer,
};
