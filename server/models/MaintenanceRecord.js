const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema(
  {
    transformerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transformer',
      required: true,
      index: true,
    },
    issueType: {
      type: String,
      required: [true, 'Issue type is required'],
      trim: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    maintenanceDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed'],
      default: 'Open',
      required: true,
    },
    workPerformed: {
      type: String,
      default: '',
    },
    technician: {
      type: String,
      default: '',
    },
    partsUsed: {
      type: String,
      default: '',
    },
    observations: {
      type: String,
      default: '',
    },
    nextMaintenanceDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

maintenanceRecordSchema.index({ transformerId: 1, createdAt: -1 });

module.exports = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
