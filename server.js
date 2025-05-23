// Import required packages
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

// Initialize Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Initialize Supabase client
// Replace these with your actual Supabase URL and service role key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Contact form submission endpoint
app.post('/submit-form', async (req, res) => {
    try {
        // Get form data from request body
        const { name, email, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Insert data into Supabase
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert([
                {
                    name,
                    email,
                    message,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Failed to store submission' });
        }

        // Send success response
        res.status(200).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 