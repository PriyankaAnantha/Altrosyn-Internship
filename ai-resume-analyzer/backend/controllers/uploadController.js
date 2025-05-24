// backend/controllers/uploadController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node.js File System module
const { promises: fsPromises } = require('fs'); // Promises API for fs

const supabaseService = require('../services/supabaseService');
const resumeParserService = require('../services/resumeParserService'); // New
const aiAnalysisService = require('../services/aiAnalysisService');   // New

// Configure Multer (same as Day 1)
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Buffer.from(file.originalname, 'latin1').toString('utf8')); // Handle special characters in filenames
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/msword') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilter
}).single('resumeFile');

// Helper function to clean up uploaded file
async function cleanupFile(filePath) {
    if (filePath) {
        try {
            await fsPromises.unlink(filePath);
            console.log(`Successfully deleted temporary file: ${filePath}`);
        } catch (unlinkErr) {
            console.error(`Error deleting temporary file ${filePath}:`, unlinkErr);
        }
    }
}

const handleUpload = async (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Multer error: ${err.message}`, errorType: 'multer' });
        } else if (err) {
            return res.status(400).json({ message: err.message || 'File upload error.', errorType: 'validation' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No resume file uploaded.', errorType: 'missing_file' });
        }

        const resumeFile = req.file;
        const jobDescription = req.body.jobDescription || '';
        let logEntryId = null;

        try {
            // 1. Log initial upload to Supabase
            const logData = {
                fileName: resumeFile.originalname,
                fileType: resumeFile.mimetype,
                fileSizeBytes: resumeFile.size,
                jobDescriptionProvided: !!jobDescription,
                jobDescriptionLength: jobDescription.length,
                status: 'processing_extraction', // New status
            };
            const logResult = await supabaseService.logUpload(logData);
            if (logResult && logResult.id) {
                logEntryId = logResult.id;
            } else {
                console.warn('Failed to log initial upload to Supabase or get ID, but proceeding.');
            }

            // 2. Extract text from the resume
            console.log(`Extracting text from: ${resumeFile.path}`);
            const extractedText = await resumeParserService.extractTextFromFile(resumeFile.path, resumeFile.mimetype);

            if (!extractedText || extractedText.trim().length < 50) { // Basic check for meaningful content
                await cleanupFile(resumeFile.path);
                // Optionally update Supabase log status to 'error_extraction'
                return res.status(400).json({ message: 'Could not extract sufficient text from the resume. The file might be empty, image-based, or corrupted.', errorType: 'extraction_failed' });
            }
            console.log(`Extracted text length: ${extractedText.length} characters`);

            // Optionally update Supabase log status
            // await supabaseService.updateLogStatus(logEntryId, 'processing_ai');

            // 3. Send text to AI for analysis
            console.log("Sending to AI for analysis...");
            const aiAnalysisResult = await aiAnalysisService.analyzeResumeWithAI(extractedText, jobDescription);

            // 4. Clean up the uploaded file AFTER successful processing
            await cleanupFile(resumeFile.path);

            // Optionally update Supabase log status
            // await supabaseService.updateLogStatus(logEntryId, 'success', aiAnalysisResult); // Maybe store a summary

            // 5. Return the full AI analysis
            res.status(200).json({
                message: "Analysis complete.",
                fileName: resumeFile.originalname,
                analysis: aiAnalysisResult,
                logId: logEntryId,
            });

        } catch (error) {
            console.error('Error during upload processing pipeline:', error);
            await cleanupFile(resumeFile.path); // Ensure cleanup on error too

            // Optionally update Supabase log status to reflect the error
            // if (logEntryId) await supabaseService.updateLogStatus(logEntryId, 'error_processing', {errorMessage: error.message});

            let statusCode = 500;
            let clientMessage = 'An error occurred while processing your resume.';
            if (error.message.includes("AI Service is not configured") || error.message.includes("Failed to get analysis from AI service")) {
                clientMessage = `AI Service Error: ${error.message}. Please contact support if this persists.`;
                statusCode = 503; // Service Unavailable
            } else if (error.message.includes("Failed to extract text")) {
                clientMessage = `Text Extraction Error: ${error.message}`;
                statusCode = 400;
            } else if (error.message.includes("AI response was not valid JSON")) {
                clientMessage = "The AI returned an unexpected response. We are looking into it. Please try again later.";
                // You might want to log the raw AI response here for debugging, but don't send it to client
            }

            res.status(statusCode).json({
                message: clientMessage,
                errorType: 'processing_error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined // Only send detailed errors in dev
             });
        }
    });
};

module.exports = {
    handleUpload,
};