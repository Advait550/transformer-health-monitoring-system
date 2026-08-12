const MaintenanceRecord = require('../models/MaintenanceRecord');
const Transformer = require('../models/Transformer');

// @desc    Get maintenance history for a transformer (paginated)
// @route   GET /api/transformers/:id/maintenance
// @access  Private (All roles)
const getMaintenanceByTransformer = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await MaintenanceRecord.countDocuments({ transformerId: req.params.id });

    const records = await MaintenanceRecord.find({ transformerId: req.params.id })
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: records.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a maintenance record for a transformer
// @route   POST /api/transformers/:id/maintenance
// @access  Private (Admin & Engineer)
const createMaintenanceRecord = async (req, res, next) => {
  try {
    const transformer = await Transformer.findById(req.params.id);
    if (!transformer) {
      return res.status(404).json({ success: false, message: 'Transformer not found' });
    }

    const {
      issueType,
      reportedAt,
      maintenanceDate,
      status,
      workPerformed,
      technician,
      partsUsed,
      observations,
      nextMaintenanceDate,
    } = req.body;

    if (!issueType) {
      return res.status(400).json({ success: false, message: 'Please provide issueType' });
    }

    const recordStatus = status && ['Open', 'In Progress', 'Completed'].includes(status) ? status : 'Open';

    const record = await MaintenanceRecord.create({
      transformerId: req.params.id,
      issueType,
      reportedAt: reportedAt || new Date(),
      maintenanceDate: maintenanceDate || null,
      status: recordStatus,
      workPerformed: workPerformed || '',
      technician: technician || '',
      partsUsed: partsUsed || '',
      observations: observations || '',
      nextMaintenanceDate: nextMaintenanceDate || null,
      createdBy: req.user._id,
    });

    const populatedRecord = await MaintenanceRecord.findById(record._id).populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: populatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance record status and details
// @route   PUT /api/maintenance/:maintenanceId
// @access  Private (Admin & Engineer)
const updateMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findById(req.params.maintenanceId);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const {
      issueType,
      maintenanceDate,
      status,
      workPerformed,
      technician,
      partsUsed,
      observations,
      nextMaintenanceDate,
    } = req.body;

    if (status) {
      if (!['Open', 'In Progress', 'Completed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid maintenance status value' });
      }
      record.status = status;
    }

    if (issueType) record.issueType = issueType;
    if (maintenanceDate !== undefined) record.maintenanceDate = maintenanceDate;
    if (workPerformed !== undefined) record.workPerformed = workPerformed;
    if (technician !== undefined) record.technician = technician;
    if (partsUsed !== undefined) record.partsUsed = partsUsed;
    if (observations !== undefined) record.observations = observations;
    if (nextMaintenanceDate !== undefined) record.nextMaintenanceDate = nextMaintenanceDate;

    await record.save();

    const updatedRecord = await MaintenanceRecord.findById(record._id).populate('createdBy', 'name email role');

    // NOTE: Per BRD rules, completing maintenance MUST NOT directly change transformer health score or status.
    // The health score pipeline determines recovery based on new sensor data.

    res.json({
      success: true,
      message: `Maintenance record updated to '${record.status}'. (Note: Health score remains data-driven).`,
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaintenanceByTransformer,
  createMaintenanceRecord,
  updateMaintenanceRecord,
};
