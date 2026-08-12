const Transformer = require('../models/Transformer');
const SensorReading = require('../models/SensorReading');
const HealthScore = require('../models/HealthScore');
const { checkStaleness } = require('../services/healthScore/stalenessService');

// @desc    Get all active transformers with latest readings and health scores
// @route   GET /api/transformers
// @access  Private (All roles)
const getTransformers = async (req, res, next) => {
  try {
    const { search, status, sort } = req.query;

    const query = { active: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const transformers = await Transformer.find(query).lean();

    // Attach latest health score, reading, and staleness info for each transformer
    const enhancedTransformers = await Promise.all(
      transformers.map(async (tx) => {
        const latestScore = await HealthScore.findOne({ transformerId: tx._id })
          .sort({ calculatedAt: -1 })
          .lean();

        const latestReading = await SensorReading.findOne({ transformerId: tx._id })
          .sort({ timestamp: -1 })
          .lean();

        const staleness = await checkStaleness(tx._id);

        return {
          ...tx,
          healthScore: latestScore ? latestScore.score : null,
          status: latestScore ? latestScore.status : 'Unknown',
          modelVersion: latestScore ? latestScore.modelVersion : null,
          lastCalculatedAt: latestScore ? latestScore.calculatedAt : null,
          latestReading: latestReading || null,
          isStale: staleness.isStale,
          lastReadingAt: staleness.lastReadingAt,
        };
      })
    );

    // Filter by status if specified
    let filtered = enhancedTransformers;
    if (status && ['Critical', 'Warning', 'Healthy'].includes(status)) {
      filtered = filtered.filter((t) => t.status === status);
    }

    // Sort: default or 'lowest-score' -> lowest health score first
    if (sort === 'lowest-score' || !sort) {
      filtered.sort((a, b) => {
        const scoreA = a.healthScore !== null ? a.healthScore : 999;
        const scoreB = b.healthScore !== null ? b.healthScore : 999;
        return scoreA - scoreB;
      });
    } else if (sort === 'highest-score') {
      filtered.sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));
    } else if (sort === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transformer details by ID
// @route   GET /api/transformers/:id
// @access  Private (All roles)
const getTransformerById = async (req, res, next) => {
  try {
    const transformer = await Transformer.findById(req.params.id).lean();

    if (!transformer) {
      return res.status(404).json({ success: false, message: 'Transformer not found' });
    }

    const latestScore = await HealthScore.findOne({ transformerId: transformer._id })
      .sort({ calculatedAt: -1 })
      .lean();

    const latestReading = await SensorReading.findOne({ transformerId: transformer._id })
      .sort({ timestamp: -1 })
      .lean();

    const staleness = await checkStaleness(transformer._id);

    res.json({
      success: true,
      data: {
        ...transformer,
        healthScore: latestScore ? latestScore.score : null,
        status: latestScore ? latestScore.status : 'Unknown',
        modelVersion: latestScore ? latestScore.modelVersion : null,
        lastCalculatedAt: latestScore ? latestScore.calculatedAt : null,
        latestReading: latestReading || null,
        isStale: staleness.isStale,
        lastReadingAt: staleness.lastReadingAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transformer
// @route   POST /api/transformers
// @access  Private (Admin only)
const createTransformer = async (req, res, next) => {
  try {
    const { name, location, latitude, longitude, capacity, installationDate } = req.body;

    if (!name || !location || latitude === undefined || longitude === undefined || !capacity || !installationDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required transformer fields' });
    }

    const transformer = await Transformer.create({
      name,
      location,
      latitude,
      longitude,
      capacity,
      installationDate,
      active: true,
    });

    res.status(201).json({
      success: true,
      data: transformer,
      message: 'Transformer created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transformer details
// @route   PUT /api/transformers/:id
// @access  Private (Admin & Engineer)
const updateTransformer = async (req, res, next) => {
  try {
    const transformer = await Transformer.findById(req.params.id);

    if (!transformer) {
      return res.status(404).json({ success: false, message: 'Transformer not found' });
    }

    const { name, location, latitude, longitude, capacity, installationDate } = req.body;

    if (name) transformer.name = name;
    if (location) transformer.location = location;
    if (latitude !== undefined) transformer.latitude = latitude;
    if (longitude !== undefined) transformer.longitude = longitude;
    if (capacity) transformer.capacity = capacity;
    if (installationDate) transformer.installationDate = installationDate;

    const updated = await transformer.save();

    res.json({
      success: true,
      data: updated,
      message: 'Transformer updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate / Soft Delete transformer
// @route   DELETE /api/transformers/:id
// @access  Private (Admin only)
const deleteTransformer = async (req, res, next) => {
  try {
    const transformer = await Transformer.findById(req.params.id);

    if (!transformer) {
      return res.status(404).json({ success: false, message: 'Transformer not found' });
    }

    // Soft deletion: set active to false
    transformer.active = false;
    await transformer.save();

    res.json({
      success: true,
      message: `Transformer '${transformer.name}' deactivated successfully. Historical data remains available.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransformers,
  getTransformerById,
  createTransformer,
  updateTransformer,
  deleteTransformer,
};
