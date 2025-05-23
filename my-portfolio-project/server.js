// Import required Node.js packages
const express = require('express'); // Express.js: A web application framework for Node.js
const { createClient } = require('@supabase/supabase-js'); // Supabase client library for JavaScript
const cors = require('cors'); // CORS: Middleware to enable Cross-Origin Resource Sharing

// Initialize the Express application
const app = express();

// --- Middleware Setup ---

// Enable CORS for all routes and origins.
// This allows your frontend (running on a different port or domain during development)
// to make requests to this backend server.
app.use(cors());

// Parse incoming requests with JSON payloads.
// This middleware makes `req.body` available with the parsed JSON data
// when a client sends a 'Content-Type: application/json' request.
app.use(express.json());

// --- Supabase Client Initialization ---
// Replace with your actual Supabase URL and Service Role Key
// IMPORTANT: The Service Role Key should be kept secret and NOT exposed in client-side code.
// It's safe to use here because this is server-side code.
const supabaseUrl = 'https://nbntegijvnrguwfobabn.supabase.co'; // Your Supabase Project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ibnRlZ2lqdm5yZ3V3Zm9iYWJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk4MjUxMCwiZXhwIjoyMDYzNTU4NTEwfQ.o41pdm5c2XGbJYtZgyvBx-V618uWVC-HizUGmorGyC0'; // Your Supabase Service Role Key
const supabase = createClient(supabaseUrl, supabaseKey);

// --- API Endpoint for Form Submission ---
// Define a POST route at '/submit-form' to handle contact form submissions
app.post('/submit-form', async (req, res) => {
    // 'req' (request) object contains information about the incoming HTTP request
    // 'res' (response) object is used to send a response back to the client
    
    console.log('Received POST request to /submit-form');
    console.log('Request body:', req.body);

    try {
        // Destructure form data (name, email, message) from the request body
        const { name, email, message } = req.body;

        // --- Input Validation (Server-Side) ---
        // It's crucial to validate data on the server, even if you have client-side validation,
        // as client-side validation can be bypassed.

        // Check if all required fields are present
        if (!name || !email || !message) {
            console.warn('Validation failed: Missing required fields.');
            // Send a 400 Bad Request status with an error message
            return res.status(400).json({ error: 'All fields (name, email, message) are required.' });
        }

        // Validate email format using a regular expression
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('Validation failed: Invalid email format.');
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        // --- Data Insertion into Supabase ---
        console.log('Attempting to insert data into Supabase table "contact_submissions"...');
        // Insert the validated data into the 'contact_submissions' table in your Supabase database
        const { data, error: supabaseError } = await supabase // Renamed 'error' to 'supabaseError' to avoid conflict
            .from('contact_submissions') // Specify the table name
            .insert([ // Data to insert (as an array of objects)
                {
                    name: name,         // Column 'name' gets value from 'name' variable
                    email: email,       // Column 'email' gets value from 'email' variable
                    message: message,   // Column 'message' gets value from 'message' variable
                    created_at: new Date().toISOString() // Add a timestamp for when the submission was created
                }
            ])
            .select(); // Optionally, .select() can be added here if you want to get the inserted row back in 'data'

        // Check if there was an error during the Supabase operation
        if (supabaseError) {
            console.error('Supabase error:', supabaseError.message);
            // Send a 500 Internal Server Error status if Supabase insertion fails
            return res.status(500).json({ 
                error: 'Failed to store submission in the database.',
                details: supabaseError.message 
            });
        }

        console.log('Data inserted successfully into Supabase:', data);
        // Send a 200 OK success response to the client
        res.status(200).json({ message: 'Form submitted successfully and stored.' });

    } catch (error) {
        // Catch any other unexpected errors that might occur in the try block
        console.error('Server error during form submission:', error.message);
        // Send a 500 Internal Server Error status for unexpected issues
        res.status(500).json({ 
            error: 'An internal server error occurred.',
            details: error.message 
        });
    }
});

// --- Start the Server ---
// Define the port the server will listen on.
// Use the environment variable PORT if available (common for deployment platforms),
// otherwise default to port 3000.
const PORT = process.env.PORT || 3000;

// Start the Express server and listen for incoming connections on the specified port
app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
    console.log(`Frontend should send POST requests to http://localhost:${PORT}/submit-form`);
});