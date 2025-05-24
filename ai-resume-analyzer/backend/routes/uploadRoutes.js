  //This file defines the routes related to uploads.


  // backend/routes/uploadRoutes.js
  const express = require('express');
  const router = express.Router();
  const uploadController = require('../controllers/uploadController');

  // Define the POST route for file uploads
  // The actual multer middleware is applied within the controller for more fine-grained error handling
  router.post('/', uploadController.handleUpload);

  module.exports = router;
  