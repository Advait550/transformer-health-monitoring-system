const SensorReading = require('../../models/SensorReading');

/**
 * Checks if a transformer is stale/offline.
 * A transformer is considered stale if its last sensor reading timestamp is older than STALE_THRESHOLD_MINUTES.
 * 
 * @param {string} transformerId 
 * @returns {Promise<{ isStale: boolean, lastReadingAt: Date|null }>}
 */
const checkStaleness = async (transformerId) => {
  const thresholdMinutes = Number(process.env.STALE_THRESHOLD_MINUTES) || 60;
  
  const latestReading = await SensorReading.findOne({ transformerId })
    .sort({ timestamp: -1 })
    .exec();

  if (!latestReading) {
    return { isStale: true, lastReadingAt: null };
  }

  const now = new Date();
  const diffMs = now - new Date(latestReading.timestamp);
  const diffMinutes = diffMs / (1000 * 60);

  const isStale = diffMinutes > thresholdMinutes;

  return {
    isStale,
    lastReadingAt: latestReading.timestamp,
  };
};

module.exports = {
  checkStaleness,
};
