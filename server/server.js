const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { Server } = require('socket.io');

dotenv.config();

const connectDB = require('./config/db');
const { initSocket } = require('./services/realtime/socketService');
const errorHandler = require('./middleware/errorHandler');

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev/testing; restrict in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
initSocket(io);

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());

// Rate Limiter for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' },
});
app.use('/api/auth', authLimiter);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transformers', require('./routes/transformerRoutes'));
app.use('/api', require('./routes/sensorRoutes'));
app.use('/api', require('./routes/maintenanceRoutes'));
app.use('/api', require('./routes/alertRoutes'));

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart Transformer Health Monitoring System',
    location: 'Kolhapur',
    timestamp: new Date(),
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[Server] THMS Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
