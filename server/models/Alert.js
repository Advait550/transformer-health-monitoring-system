const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    transformerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transformer',
      required: true,
      index: true,
    },
    type: {
      type: String,
      default: 'CRITICAL_HEALTH_SCORE',
    },
    severity: {
      type: String,
      enum: ['Critical', 'Warning', 'Info'],
      default: 'Critical',
    },
    valueContext: {
      type: mongoose.Schema.Types.Mixed,
    },
    deduplicationKey: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'resolved'],
      default: 'open',
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ transformerId: 1, status: 1 });

module.exports = mongoose.model('Alert', alertSchema);
