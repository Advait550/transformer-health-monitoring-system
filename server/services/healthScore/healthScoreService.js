/**
 * Health Score Calculation Module
 * 
 * Strategy pattern: Frontend NEVER calculates the health score.
 * This module is the single source of truth for health score calculations.
 * Designed so that an AI/ML model can be plugged in later by swapping calculate().
 */

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Calculates health score and status based on multi-sensor values.
 * 
 * Primary sensors:
 * @param {number} voltage - In Volts (nominal 230V)
 * @param {number} current - In Amperes (nominal 50A)
 * @param {number} temperature - In Celsius (nominal 50°C)
 * Extended sensors:
 * @param {number} powerFactor - 0.0 to 1.0 (nominal 0.95)
 * @param {number} oilLevel - % (nominal 85%)
 * @param {number} oilTemperature - In Celsius (nominal 55°C)
 * @param {number} vibrations - mm/s (nominal 1.2 mm/s)
 * @param {number} moisture - ppm (nominal 15 ppm)
 * @param {number} dga - Dissolved Gas Analysis in ppm (nominal 20 ppm)
 * 
 * @returns {object} { score, status, modelVersion }
 */
const calculate = (voltage, current, temperature, options = {}) => {
  const powerFactor = options.powerFactor !== undefined ? options.powerFactor : 0.95;
  const oilLevel = options.oilLevel !== undefined ? options.oilLevel : 85;
  const oilTemperature = options.oilTemperature !== undefined ? options.oilTemperature : 50;
  const vibrations = options.vibrations !== undefined ? options.vibrations : 1.2;
  const moisture = options.moisture !== undefined ? options.moisture : 15;
  const dga = options.dga !== undefined ? options.dga : 20;

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

  // Extended parameter sub-scores
  const pfScore = clamp(powerFactor * 100, 0, 100);
  const oilLevelScore = clamp(oilLevel, 0, 100);
  const oilTempDevPct = (Math.abs(oilTemperature - 55) / 35) * 100;
  const oilTempScore = 100 - clamp(oilTempDevPct, 0, 100);

  const vibrationScore = 100 - clamp((vibrations / 5.0) * 100, 0, 100);
  const moistureScore = 100 - clamp((moisture / 50.0) * 100, 0, 100);
  const dgaScore = 100 - clamp((dga / 100.0) * 100, 0, 100);

  // Weighted average across primary & extended sensors:
  // Voltage 25%, Current 20%, Temp 15%, PowerFactor 10%, OilLevel 10%, OilTemp 10%, Vibrations 4%, Moisture 3%, DGA 3%
  const rawScore =
    voltageScore * 0.25 +
    currentScore * 0.20 +
    tempScore * 0.15 +
    pfScore * 0.10 +
    oilLevelScore * 0.10 +
    oilTempScore * 0.10 +
    vibrationScore * 0.04 +
    moistureScore * 0.03 +
    dgaScore * 0.03;

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
    modelVersion: 'multi-sensor-v2',
  };
};

module.exports = {
  calculate,
};
