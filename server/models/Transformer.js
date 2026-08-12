const mongoose = require('mongoose');

const transformerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Transformer name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location description is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    capacity: {
      type: Number, // kVA
      required: [true, 'Capacity (kVA) is required'],
    },
    installationDate: {
      type: Date,
      required: [true, 'Installation date is required'],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transformer', transformerSchema);
