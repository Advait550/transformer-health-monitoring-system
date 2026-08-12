const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Transformer = require('../models/Transformer');
const SensorReading = require('../models/SensorReading');
const HealthScore = require('../models/HealthScore');
const healthScoreService = require('../services/healthScore/healthScoreService');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/thms';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // 1. Seed Initial Admin Account
    const adminEmail = 'admin@thms.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Admin@123456', salt);

      await User.create({
        name: 'System Admin',
        email: adminEmail,
        passwordHash,
        role: 'Admin',
      });
      console.log('[Seed] Admin account created: admin@thms.com / Admin@123456');
    } else {
      console.log('[Seed] Admin account already exists');
    }

    // 2. Seed Sample Kolhapur Transformers if none exist
    const txCount = await Transformer.countDocuments();
    if (txCount === 0) {
      const sampleTransformers = [
        {
          name: 'TF-KOL-01 (Tarabai Park Substation)',
          location: 'Tarabai Park, Kolhapur',
          latitude: 16.7050,
          longitude: 74.2433,
          capacity: 500,
          installationDate: new Date('2021-03-15'),
          active: true,
        },
        {
          name: 'TF-KOL-02 (Rajarampuri Feeder)',
          location: 'Rajarampuri Main Rd, Kolhapur',
          latitude: 16.6920,
          longitude: 74.2380,
          capacity: 315,
          installationDate: new Date('2020-08-20'),
          active: true,
        },
        {
          name: 'TF-KOL-03 (MIDC Gokul Shirgaon)',
          location: 'Gokul Shirgaon MIDC, Kolhapur',
          latitude: 16.6450,
          longitude: 74.2750,
          capacity: 1000,
          installationDate: new Date('2019-11-05'),
          active: true,
        },
        {
          name: 'TF-KOL-04 (Rankala Lake Zone)',
          location: 'Rankala Chowk, Kolhapur',
          latitude: 16.6870,
          longitude: 74.2180,
          capacity: 250,
          installationDate: new Date('2022-01-10'),
          active: true,
        },
        {
          name: 'TF-KOL-05 (Mahalaxmi Temple Substation)',
          location: 'Bhawani Mandap Area, Kolhapur',
          latitude: 16.6955,
          longitude: 74.2235,
          capacity: 630,
          installationDate: new Date('2018-05-30'),
          active: true,
        },
      ];

      const createdTx = await Transformer.insertMany(sampleTransformers);
      console.log(`[Seed] Inserted ${createdTx.length} sample Kolhapur transformers`);

      // Initial sensor readings and health scores for each transformer
      const initialReadings = [
        { voltage: 231.2, current: 48.5, temperature: 48.0 }, // Healthy (~98)
        { voltage: 245.0, current: 62.0, temperature: 68.0 }, // Warning (~73)
        { voltage: 278.0, current: 78.5, temperature: 88.0 }, // Critical (~35)
        { voltage: 228.0, current: 51.0, temperature: 52.0 }, // Healthy (~98)
        { voltage: 235.0, current: 55.0, temperature: 56.0 }, // Healthy (~93)
      ];

      for (let i = 0; i < createdTx.length; i++) {
        const tx = createdTx[i];
        const r = initialReadings[i];

        await SensorReading.create({
          transformerId: tx._id,
          voltage: r.voltage,
          current: r.current,
          temperature: r.temperature,
          timestamp: new Date(),
        });

        const { score, status, modelVersion } = healthScoreService.calculate(r.voltage, r.current, r.temperature);

        await HealthScore.create({
          transformerId: tx._id,
          score,
          status,
          calculatedAt: new Date(),
          modelVersion,
        });
      }
      console.log('[Seed] Initial sensor readings & health scores generated');
    }

    console.log('[Seed] Bootstrap completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
