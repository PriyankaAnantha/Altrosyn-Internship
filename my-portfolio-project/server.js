const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = 'https://nbntegijvnrguwfobabn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ibnRlZ2lqdm5yZ3V3Zm9iYWJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk4MjUxMCwiZXhwIjoyMDYzNTU4NTEwfQ.o41pdm5c2XGbJYtZgyvBx-V618uWVC-HizUGmorGyC0';
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("Supabase client initialized (default options).");

const YOUR_TABLE_NAME = 'contacts';

async function runSupabaseTests() { /* ... your test function ... no changes needed here */
    console.log(`--- Running Supabase Tests (v5) for table: ${YOUR_TABLE_NAME} ---`);
    try {
        console.log(`Attempting to select from '${YOUR_TABLE_NAME}'...`);
        const { data, error } = await supabase.from(YOUR_TABLE_NAME).select('*').limit(1);
        if (error) { console.error(`SELECT from '${YOUR_TABLE_NAME}' FAILED. Error:`, error); }
        else {
            console.log(`SELECT from '${YOUR_TABLE_NAME}' SUCCEEDED.`);
            if (data && data.length > 0) { console.log("Sample data:", data[0]); }
            else { console.log(`'${YOUR_TABLE_NAME}' is empty or no rows returned.`); }
        }
    } catch (e) { console.error("Exception during SELECT test:", e); }
    try {
        console.log("\nAttempting RPC call to 'pg_backend_pid' (unqualified)...");
        const { data: rpcData, error: rpcError } = await supabase.rpc('pg_backend_pid');
        if(rpcError){ console.error("RPC to 'pg_backend_pid' (unqualified) FAILED. Error:", rpcError); }
        else { console.log("RPC to 'pg_backend_pid' (unqualified) SUCCEEDED. PID:", rpcData); }
    } catch (e) { console.error("Exception during RPC test:", e); }
    console.log("--- Supabase Tests (v5) Complete ---");
}
runSupabaseTests();

app.post('/submit-form', async (req, res) => {
    console.log('\nReceived POST request to /submit-form');
    console.log('Request body:', req.body);
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) { return res.status(400).json({ error: 'All fields required.' });}
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { return res.status(400).json({ error: 'Invalid email.' });}

        console.log(`Attempting to insert into "${YOUR_TABLE_NAME}"...`);
        const { data, error: supabaseError } = await supabase
            .from(YOUR_TABLE_NAME)
            .insert([{ name, email, message, created_at: new Date().toISOString() }])
            .select(); // .select() is good practice to confirm the insert

        if (supabaseError) {
            console.error('Supabase INSERT FAILED. Full Error Object:', supabaseError);
            // Send the actual Supabase error message to the client if possible
            return res.status(supabaseError.status || 500).json({ // Use Supabase status if available
                error: supabaseError.message || 'Supabase insert operation failed.',
                details: supabaseError.details || 'No additional details.',
                code: supabaseError.code,
                hint: supabaseError.hint
            });
        }

        console.log('INSERT SUCCEEDED. Data:', data);
        res.status(200).json({ message: 'Form submitted successfully.', data_inserted: data });

    } catch (error) { // Catch errors from within the Express handler itself
        console.error('Server error handler /submit-form:', error);
        res.status(500).json({ error: 'Internal server error in handler', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});