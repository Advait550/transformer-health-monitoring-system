const Alert = require('../../models/Alert');

/**
 * Alert Engine Module
 * Evaluates transformer status and manages Alert lifecycle and deduplication.
 * 
 * @param {string} transformerId 
 * @param {string} status - 'Critical' | 'Warning' | 'Healthy'
 * @param {number} score 
 * @param {object} readingContext - { voltage, current, temperature }
 * @returns {Promise<{ alertCreated: boolean, alertResolved: boolean, alert: object|null }>}
 */
const evaluate = async (transformerId, status, score, readingContext = {}) => {
  let alertCreated = false;
  let alertResolved = false;
  let activeAlert = null;

  try {
    if (status === 'Critical') {
      // Check for any existing active (open or acknowledged) alert for this transformer
      const existingAlert = await Alert.findOne({
        transformerId,
        status: { $in: ['open', 'acknowledged'] },
      });

      if (!existingAlert) {
        // Create new Alert
        const deduplicationKey = `${transformerId}_critical_${Date.now()}`;
        activeAlert = await Alert.create({
          transformerId,
          type: 'CRITICAL_HEALTH_SCORE',
          severity: 'Critical',
          valueContext: { score, ...readingContext },
          deduplicationKey,
          status: 'open',
        });
        alertCreated = true;
        console.log(`[AlertEngine] Created new Critical Alert for Transformer ${transformerId}`);
      } else {
        // Persistent fault - deduplication in action
        console.log(`[AlertEngine] Persistent Critical fault for Transformer ${transformerId}. Deduplication active (existing alert ID: ${existingAlert._id}).`);
        activeAlert = existingAlert;
      }
    } else if (status === 'Warning' || status === 'Healthy') {
      // Check if there is an unresolved alert to recover/resolve
      const openAlert = await Alert.findOne({
        transformerId,
        status: { $in: ['open', 'acknowledged'] },
      });

      if (openAlert) {
        openAlert.status = 'resolved';
        openAlert.resolvedAt = new Date();
        await openAlert.save();
        alertResolved = true;
        activeAlert = openAlert;
        console.log(`[AlertEngine] Recovered & Resolved Alert ${openAlert._id} for Transformer ${transformerId} (New Status: ${status}, Score: ${score})`);
      }
    }
  } catch (error) {
    console.error('[AlertEngine Error]', error);
  }

  return { alertCreated, alertResolved, alert: activeAlert };
};

module.exports = {
  evaluate,
};
