const verifyApiKey = (req, res, next) => {
  const apiKeyHeader = req.headers['x-api-key'];
  const apiKeyBody = req.body ? req.body.apiKey : undefined;
  const validApiKey = process.env.ESP32_API_KEY || 'esp32_sec_key_kolhapur_transformer_2026';

  const providedKey = apiKeyHeader || apiKeyBody;

  if (!providedKey || providedKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized IoT device: Invalid or missing API key',
    });
  }

  next();
};

module.exports = { verifyApiKey };
