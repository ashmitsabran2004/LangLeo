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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log('Server running...')
    );
  })
  .catch(err => console.error(err));
