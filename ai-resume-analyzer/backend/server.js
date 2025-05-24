  //This is the main entry point for your backend application.

  // backend/server.js
  require('dotenv').config(); // Load environment variables from .env file
  const express = require('express');
  const cors = require('cors');
  const path = require('path'); // Import path module
  const uploadRoutes = require('./routes/uploadRoutes');

  const app = express();
  const PORT = process.env.PORT || 3001;

  // Middleware
  app.use(cors()); // Enable CORS for all routes (you can configure this more strictly)
  app.use(express.json()); // Parse JSON bodies
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

  // Basic route for testing if the server is up
  app.get('/', (req, res) => {
      res.send('AI Resume Analyzer Backend is running!');
  });

  // API routes
  app.use('/api/upload', uploadRoutes); // Mount the upload routes under /api/upload

  // Global error handler (very basic)
  // This should be defined AFTER your routes
  app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
  });

  // Start the server
  app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
      // Check if Supabase env vars are loaded (optional check)
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
          console.warn("WARNING: Supabase environment variables are not set. Supabase integration will fail.");
      }
  });