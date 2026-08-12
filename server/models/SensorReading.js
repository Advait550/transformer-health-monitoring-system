const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema(
  {
    transformerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transformer',
      required: true,
      index: true,
    },
    voltage: {
      type: Number,
      required: [true, 'Voltage reading is required'],
    },
    current: {
      type: Number,
      required: [true, 'Current reading is required'],
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature reading is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

sensorReadingSchema.index({ transformerId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
