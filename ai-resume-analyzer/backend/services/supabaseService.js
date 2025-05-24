//This file will handle interactions with Supabase.

// backend/services/supabaseService.js
  require('dotenv').config(); // Load environment variables
  const { createClient } = require('@supabase/supabase-js');

  // Retrieve Supabase URL and Service Key from environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  // Check if Supabase credentials are provided
  if (!supabaseUrl || !supabaseKey) {
      console.error("Error: Supabase URL or Key is missing. Make sure .env is configured correctly.");
      // You might want to throw an error here or handle it more gracefully
      // For now, we'll let the app try to initialize, and it will fail if they are missing.
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  /**
   * Logs an upload event to the Supabase 'upload_logs' table.
   * @param {Object} logData - The data to log.
   * @param {string} logData.fileName - The name of the uploaded file.
   * @param {string} logData.fileType - The MIME type of the uploaded file.
   * @param {number} logData.fileSizeBytes - The size of the file in bytes.
   * @param {boolean} logData.jobDescriptionProvided - Whether a job description was provided.
   * @param {number} logData.jobDescriptionLength - Length of the job description.
   * @returns {Promise<Object|null>} The inserted data or null if an error occurred.
   */
  async function logUpload(logData) {
      try {
          const { data, error } = await supabase
              .from('upload_logs')
              .insert([
                  {
                      file_name: logData.fileName,
                      file_type: logData.fileType,
                      file_size_bytes: logData.fileSizeBytes,
                      job_description_provided: logData.jobDescriptionProvided,
                      job_description_length: logData.jobDescriptionLength,
                      status: 'uploaded', // Initial status
                  },
              ])
              .select(); // .select() will return the inserted rows

          if (error) {
              console.error('Supabase logUpload error:', error);
              return null;
          }
          return data ? data[0] : null;
      } catch (err) {
          console.error('Unexpected error in logUpload:', err);
          return null;
      }
  }

  /**
 * Updates the status of an existing log entry.
 * @param {string} logId - The ID of the log entry to update.
 * @param {string} newStatus - The new status (e.g., 'processing', 'success', 'error').
 * @param {Object} [details] - Optional: Additional details to store (e.g., error message, summary of analysis).
 * @returns {Promise<Object|null>} The updated data or null if an error occurred.
 */
async function updateLogStatus(logId, newStatus, details = {}) {
    if (!logId) {
        console.warn("updateLogStatus called without logId.");
        return null;
    }
    try {
        const { data, error } = await supabase
            .from('upload_logs')
            .update({
                status: newStatus,
                // You could add a 'details' JSONB column to your table to store 'details' object
                // For now, we're just updating status.
            })
            .eq('id', logId)
            .select();

        if (error) {
            console.error('Supabase updateLogStatus error:', error);
            return null;
        }
        return data ? data[0] : null;
    } catch (err) {
        console.error('Unexpected error in updateLogStatus:', err);
        return null;
    }
}


module.exports = {
    logUpload,
    updateLogStatus, // Export the new function
};

