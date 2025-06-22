// Main server file for CampusHub backend
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors'); // ADDED THIS LINE
const path = require('path');
require('dotenv').config();

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Initialize Middleware
app.use(express.json({ extended: false }));
app.use(cors()); // ADDED THIS LINE - Ensure this is before your routes

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/classrooms', require('./routes/classrooms'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/events', require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/chatbot', require('./routes/chatbot'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));