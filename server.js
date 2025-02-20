const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { connectDB } = require('./config/db');  // Import connectDB
const authRouter = require('./routes/auth');
const roomsRouter = require('./routes/rooms');
const bookingsRouter = require('./routes/bookings');
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials
};


// Middleware
app.use(cors(corsOptions));

// Preflight request handling (CORS OPTIONS requests)
app.options('*', cors(corsOptions));

// Body parser middleware (for parsing JSON requests)
app.use(express.json());  // Built-in middleware to handle JSON body
app.use(bodyParser.json());  // Body parser for JSON payload

// Routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);  // Added this route as a placeholder for admin routes

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error-handling middleware
app.use((error, req, res, next) => {
  console.error("Internal Server Error:", error);
  res.status(500).json({ message: "Server error", error: error.message });
});

// Log CORS requests (for debugging purposes)
app.use((req, res, next) => {
  console.log('CORS Request:', req.method, req.headers.origin, req.headers['access-control-request-method']);
  next();
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
