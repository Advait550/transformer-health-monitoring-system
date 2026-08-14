const Transformer = require('../models/Transformer');
const SensorReading = require('../models/SensorReading');
const HealthScore = require('../models/HealthScore');
const healthScoreService = require('../services/healthScore/healthScoreService');
const alertEngine = require('../services/alerts/alertEngine');
const socketService = require('../services/realtime/socketService');

// @desc    Ingest multi-sensor reading from ESP32, calculate health score, trigger alerts & real-time update
// @route   POST /api/sensor-data
// @access  IoT API Key protected
const ingestSensorData = async (req, res, next) => {
  try {
    const {
      transformerId,
      voltage,
      current,
      temperature,
      powerFactor = 0.95,
      oilLevel = 85,
      oilTemperature = 50,
      vibrations = 1.2,
      moisture = 15,
      dga = 20,
    } = req.body;

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

    // 1. Save Sensor Reading with all 9 parameters
    const sensorReading = await SensorReading.create({
      transformerId,
      voltage: Number(voltage),
      current: Number(current),
      temperature: Number(temperature),
      powerFactor: Number(powerFactor),
      oilLevel: Number(oilLevel),
      oilTemperature: Number(oilTemperature),
      vibrations: Number(vibrations),
      moisture: Number(moisture),
      dga: Number(dga),
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
      Number(temperature),
      {
        powerFactor: Number(powerFactor),
        oilLevel: Number(oilLevel),
        oilTemperature: Number(oilTemperature),
        vibrations: Number(vibrations),
        moisture: Number(moisture),
        dga: Number(dga),
      }
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
      powerFactor: Number(powerFactor),
      oilLevel: Number(oilLevel),
      oilTemperature: Number(oilTemperature),
      vibrations: Number(vibrations),
      moisture: Number(moisture),
      dga: Number(dga),
    });

    // 6. Socket.IO Real-time Emissions
    const realTimePayload = {
      transformerId,
      transformerName: transformer.name,
      location: transformer.location,
      voltage: Number(voltage),
      current: Number(current),
      temperature: Number(temperature),
      powerFactor: Number(powerFactor),
      oilLevel: Number(oilLevel),
      oilTemperature: Number(oilTemperature),
      vibrations: Number(vibrations),
      moisture: Number(moisture),
      dga: Number(dga),
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
          created: alertResult.alertCreated,
          resolved: alertResult.alertResolved,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest sensor reading for a transformer
// @route   GET /api/sensor-data/:transformerId/latest
// @access  Protected
const getLatestReading = async (req, res, next) => {
  try {
    const { transformerId } = req.params;

    const latestReading = await SensorReading.findOne({ transformerId })
      .sort({ timestamp: -1 })
      .exec();

    if (!latestReading) {
      return res.status(404).json({
        success: false,
        message: 'No sensor readings found for this transformer',
      });
    }

    res.status(200).json({
      success: true,
      data: latestReading,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical sensor telemetry for a transformer
// @route   GET /api/sensor-data/:transformerId/history?limit=50
// @access  Protected
const getReadingHistory = async (req, res, next) => {
  try {
    const { transformerId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;

    const readings = await SensorReading.find({ transformerId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ingestSensorData,
  getLatestReading,
  getReadingHistory,
};
