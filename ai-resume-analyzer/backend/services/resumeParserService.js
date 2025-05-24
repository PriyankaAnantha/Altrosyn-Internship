// This service will be responsible for extracting text from the uploaded files.


// backend/services/resumeParserService.js
const fs = require('fs').promises; // Use promises version of fs
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts text content from a resume file (PDF or DOCX).
 * @param {string} filePath - The path to the resume file.
 * @param {string} fileType - The MIME type of the file (e.g., 'application/pdf').
 * @returns {Promise<string>} The extracted text content.
 * @throws {Error} If the file type is unsupported or text extraction fails.
 */
async function extractTextFromFile(filePath, fileType) {
    try {
        const dataBuffer = await fs.readFile(filePath);

        if (fileType === 'application/pdf') {
            const data = await pdf(dataBuffer);
            return data.text;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // DOCX
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            return result.value;
        } else if (fileType === 'application/msword') { // Older .doc (might be less reliable with mammoth)
             // Mammoth has limited .doc support. It's better to encourage DOCX or PDF.
             // For basic text, it might work.
            console.warn("Attempting to parse .doc file. Results may vary. DOCX or PDF is recommended.");
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            return result.value;
        }
        else {
            throw new Error('Unsupported file type for text extraction. Please use PDF or DOCX.');
        }
    } catch (error) {
        console.error('Error extracting text from file:', error);
        throw new Error(`Failed to extract text from file: ${error.message}`);
    }
}

module.exports = {
    extractTextFromFile,
};