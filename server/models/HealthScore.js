const mongoose = require('mongoose');

const healthScoreSchema = new mongoose.Schema(
  {
    transformerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transformer',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['Critical', 'Warning', 'Healthy'],
      required: true,
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    modelVersion: {
      type: String,
      default: 'weighted-avg-v1',
    },
  },
  {
    timestamps: true,
  }
);

healthScoreSchema.index({ transformerId: 1, calculatedAt: -1 });

module.exports = mongoose.model('HealthScore', healthScoreSchema);
