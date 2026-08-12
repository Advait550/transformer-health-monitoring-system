const http = require('http');

/**
 * ESP32 Simulator Script for THMS
 * Sends simulated voltage, current, and temperature data to the backend API.
 */

const API_KEY = process.env.ESP32_API_KEY || 'esp32_sec_key_kolhapur_transformer_2026';
const PORT = process.env.PORT || 5000;

const sendReading = (transformerId, voltage, current, temperature) => {
  const data = JSON.stringify({
    transformerId,
    voltage,
    current,
    temperature,
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
Usage: node simulateESP32.js <transformerId> <voltage> <current> <temperature>

Example Healthy Reading:
  node simulateESP32.js 66b7a123... 230 48 45

Example Warning Reading:
  node simulateESP32.js 66b7a123... 250 65 68

Example Critical Reading:
  node simulateESP32.js 66b7a123... 275 80 85
==================================================
  `);
  process.exit(0);
}

const [txId, v, c, t] = args;
console.log(`[ESP32 Sim] Transmitting reading to transformer ${txId}...`);
sendReading(txId, parseFloat(v), parseFloat(c), parseFloat(t));
