const http = require('http');

/**
 * ESP32 Simulator Script for THMS
 * Sends simulated multi-sensor telemetry to backend API.
 */

const API_KEY = process.env.ESP32_API_KEY || 'esp32_sec_key_kolhapur_transformer_2026';
const PORT = process.env.PORT || 5000;

const sendReading = (transformerId, voltage, current, temperature, powerFactor = 0.95, oilLevel = 85, oilTemperature = 50, vibrations = 1.2, moisture = 15, dga = 20) => {
  const data = JSON.stringify({
    transformerId,
    voltage,
    current,
    temperature,
    powerFactor,
    oilLevel,
    oilTemperature,
    vibrations,
    moisture,
    dga,
    apiKey: API_KEY,
  });

  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/sensor-data',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'x-api-key': API_KEY,
    },
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log(`[ESP32 Sim] Status: ${res.statusCode} | Response:`, JSON.parse(body));
    });
  });

  req.on('error', (err) => {
    console.error('[ESP32 Sim Error]', err.message);
  });

  req.write(data);
  req.end();
};

// Usage check
const args = process.argv.slice(2);
if (args.length < 4) {
  console.log(`
==================================================
ESP32 Sensor Data Simulator
==================================================
Usage: node simulateESP32.js <transformerId> <voltage> <current> <temperature> [powerFactor] [oilLevel] [oilTemp] [vibrations] [moisture] [dga]

Example Healthy Reading:
  node simulateESP32.js 66b7a123... 230 48 45 0.96 88 52 1.1 12 18

Example Critical Reading:
  node simulateESP32.js 66b7a123... 278 78 88 0.75 45 85 4.8 48 95
`);
  process.exit(1);
}

const [transformerId, v, c, t, pf, ol, ot, vib, m, dga] = args;
sendReading(
  transformerId,
  parseFloat(v),
  parseFloat(c),
  parseFloat(t),
  pf !== undefined ? parseFloat(pf) : 0.95,
  ol !== undefined ? parseFloat(ol) : 85,
  ot !== undefined ? parseFloat(ot) : 50,
  vib !== undefined ? parseFloat(vib) : 1.2,
  m !== undefined ? parseFloat(m) : 15,
  dga !== undefined ? parseFloat(dga) : 20
);
