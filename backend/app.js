const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();

app.use(cors());
app.use(express.json());

// mount auth routes under /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// example: app.use('/api/chat', chatRoutes);

// MongoDB connection options
const mongoOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

console.log('Connecting to MongoDB...');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('Successfully connected to MongoDB');

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  // Attempt to reconnect after a delay
  console.log('Attempting to reconnect...');
  setTimeout(() => connectDB(), 5000);
});

// Handle Node process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

// Start the connection
connectDB();
