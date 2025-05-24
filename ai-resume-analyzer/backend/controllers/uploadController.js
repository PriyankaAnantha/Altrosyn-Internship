  //This controller will handle the logic for the `/upload` route.


  // backend/controllers/uploadController.js
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs'); // File system module
  const supabaseService = require('../services/supabaseService');

  // Configure Multer for file storage
  // We'll store files temporarily in an 'uploads/' directory
  // This directory should be in .gitignore
  const UPLOADS_DIR = path.join(__dirname, '..', 'uploads'); // Correct path to backend/uploads
  if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, UPLOADS_DIR);
      },
      filename: function (req, file, cb) {
          // Use a timestamp to make filenames unique
          cb(null, Date.now() + '-' + file.originalname);
      }
  });

  // File filter to accept only PDF and DOCX
  const fileFilter = (req, file, cb) => {
      if (file.mimetype === 'application/pdf' ||
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // DOCX
          file.mimetype === 'application/msword') { // DOC (though mammoth.js might struggle with old .doc)
          cb(null, true);
      } else {
          cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
      }
  };

  // Multer upload instance
  const upload = multer({
      storage: storage,
      limits: {
          fileSize: 10 * 1024 * 1024 // 10MB limit
      },
      fileFilter: fileFilter
  }).single('resumeFile'); // 'resumeFile' is the name of the field in the form-data

  // Upload handler function
  const handleUpload = async (req, res) => {
      // Use the multer middleware
      upload(req, res, async (err) => {
          // Handle multer errors
          if (err instanceof multer.MulterError) {
              if (err.code === 'LIMIT_FILE_SIZE') {
                  return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
              }
              return res.status(400).json({ message: `Multer error: ${err.message}` });
          } else if (err) {
              // Handle other errors (e.g., invalid file type)
              return res.status(400).json({ message: err.message || 'File upload error.' });
          }

          // If no file is uploaded
          if (!req.file) {
              return res.status(400).json({ message: 'No resume file uploaded.' });
          }

          // File uploaded successfully
          const resumeFile = req.file;
          const jobDescription = req.body.jobDescription || ''; // Get job description from form data

          try {
              // Log the upload to Supabase
              const logData = {
                  fileName: resumeFile.originalname,
                  fileType: resumeFile.mimetype,
                  fileSizeBytes: resumeFile.size,
                  jobDescriptionProvided: !!jobDescription,
                  jobDescriptionLength: jobDescription.length,
              };
              const logResult = await supabaseService.logUpload(logData);

              if (!logResult) {
                  console.warn('Failed to log upload to Supabase, but proceeding with response.');
                  // Depending on requirements, you might want to return an error here
              } else {
                  console.log('Upload logged to Supabase:', logResult.id);
              }

              // For Day 1, return a static placeholder response
              // In Day 2, this will be replaced with actual AI analysis
              const staticAnalysis = {
                  message: "File uploaded successfully. Processing will begin soon.",
                  fileName: resumeFile.originalname,
                  fileSize: resumeFile.size,
                  jobDescriptionProvided: !!jobDescription,
                  jobDescriptionPreview: jobDescription.substring(0, 100) + (jobDescription.length > 100 ? '...' : ''),
                  // Placeholder for actual analysis data
                  analysis: {
                      extractedText: "Text extraction will happen in Day 2.",
                      atsScore: "Pending",
                      overallFeedback: "Placeholder feedback: Your resume looks like a good start!",
                      positivePoints: ["Good structure (placeholder)"],
                      areasForImprovement: ["Add more quantifiable achievements (placeholder)"],
                      keywordAnalysis: {
                          foundKeywords: [],
                          missingKeywords: []
                      },
                      jobFitScore: "Pending (if JD provided)"
                  },
                  logId: logResult ? logResult.id : null, // Include log ID if available
              };

              // IMPORTANT: For Day 2, we will need to read the file content here.
              // For now, we just acknowledge the upload.
              // We should also delete the file from the server after processing.
              // fs.unlink(resumeFile.path, (unlinkErr) => {
              //    if (unlinkErr) console.error("Error deleting temp file:", unlinkErr);
              // });
              // For Day 1, let's keep the file for now to verify upload works.
              // We will implement proper cleanup in Day 2/3.

              res.status(200).json(staticAnalysis);

          } catch (error) {
              console.error('Error processing upload:', error);
              // Clean up uploaded file in case of an error during processing
              if (req.file && req.file.path) {
                  fs.unlink(req.file.path, (unlinkErr) => {
                      if (unlinkErr) console.error("Error deleting temp file after error:", unlinkErr);
                  });
              }
              res.status(500).json({ message: 'Server error during processing.' });
          }
      });
  };

  module.exports = {
      handleUpload,
  };