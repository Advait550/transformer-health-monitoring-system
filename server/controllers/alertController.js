const Alert = require('../models/Alert');

// @desc    Get alert history for a transformer (paginated)
// @route   GET /api/transformers/:id/alerts
// @access  Private (All roles)
const getAlertsByTransformer = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await Alert.countDocuments({ transformerId: req.params.id });

    const alerts = await Alert.find({ transformerId: req.params.id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: alerts.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Acknowledge an open alert
// @route   POST /api/alerts/:alertId/acknowledge
// @access  Private (Admin & Engineer)
const acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    if (alert.status === 'resolved') {
      return res.status(400).json({ success: false, message: 'Cannot acknowledge an already resolved alert' });
    }

    alert.status = 'acknowledged';
    await alert.save();

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlertsByTransformer,
  acknowledgeAlert,
};
