/**
 * Health Score Calculation Module
 * 
 * Strategy pattern: Frontend NEVER calculates the health score.
 * This module is the single source of truth for health score calculations.
 * Designed so that an AI/ML model can be plugged in later by swapping calculate().
 */

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Calculates health score and status based on sensor values.
 * 
 * @param {number} voltage - In Volts
 * @param {number} current - In Amperes
 * @param {number} temperature - In Celsius
 * @returns {object} { score, status, modelVersion }
 */
const calculate = (voltage, current, temperature) => {
  const nominalVoltage = Number(process.env.NOMINAL_VOLTAGE) || 230;
  const voltageTolerance = Number(process.env.VOLTAGE_TOLERANCE) || 50;

  const nominalCurrent = Number(process.env.NOMINAL_CURRENT) || 50;
  const currentTolerance = Number(process.env.CURRENT_TOLERANCE) || 30;

  const nominalTemp = Number(process.env.NOMINAL_TEMP) || 50;
  const tempTolerance = Number(process.env.TEMP_TOLERANCE) || 40;

  // Calculate individual parameter sub-scores (0 - 100)
  const voltageDevPct = (Math.abs(voltage - nominalVoltage) / voltageTolerance) * 100;
  const voltageScore = 100 - clamp(voltageDevPct, 0, 100);

  const currentDevPct = (Math.abs(current - nominalCurrent) / currentTolerance) * 100;
  const currentScore = 100 - clamp(currentDevPct, 0, 100);

  const tempDevPct = (Math.abs(temperature - nominalTemp) / tempTolerance) * 100;
  const tempScore = 100 - clamp(tempDevPct, 0, 100);

  // Weighted average: Voltage (40%), Current (30%), Temperature (30%)
  const rawScore = (voltageScore * 0.40) + (currentScore * 0.30) + (tempScore * 0.30);
  const score = Math.round(rawScore);

  // Status rules per BRD v2.0:
  // < 60     → Critical
  // 60 - <80 → Warning
  // >= 80    → Healthy
  let status = 'Healthy';
  if (score < 60) {
    status = 'Critical';
  } else if (score < 80) {
    status = 'Warning';
  } else {
    status = 'Healthy';
  }

  return {
    score,
    status,
    modelVersion: 'weighted-avg-v1',
  };
};

module.exports = {
  calculate,
};
