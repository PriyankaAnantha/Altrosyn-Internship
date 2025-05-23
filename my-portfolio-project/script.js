// Wait for the DOM (Document Object Model) to be fully loaded and parsed
document.addEventListener('DOMContentLoaded', () => {
    // This function runs once the HTML document is ready.
    console.log('DOM loaded, initializing form logic...');

    // Get the contact form element by its ID
    // This assumes your form has an id="contactForm"
    const contactForm = document.getElementById('contactForm');

    // Check if the contact form element exists on the current page
    // This is important because this script might be linked on pages without the form
    if (contactForm) {
        console.log('Contact form element found:', contactForm);

        // Add an event listener for the 'submit' event on the form
        contactForm.addEventListener('submit', async (event) => {
            // The 'event' object contains information about the submission event
            
            event.preventDefault(); // Prevent the default form submission behavior (which would cause a page reload)
            console.log('Form submission intercepted.');

            // Get the values from the form fields
            // .trim() removes any leading or trailing whitespace
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                message: messageInput.value.trim()
            };
            console.log('Form data collected:', formData);

            // Basic client-side validation
            if (!formData.name || !formData.email || !formData.message) {
                alert('Please fill in all fields.'); // User-friendly message
                console.warn('Validation failed: Not all fields are filled.');
                return; // Stop further execution if validation fails
            }

            // More specific email validation (simple regex)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address.');
                console.warn('Validation failed: Invalid email format.');
                return;
            }

            try {
                console.log('Attempting to send data to the backend...');
                // Send the form data to the backend server using the Fetch API
                // The URL 'http://localhost:3000/submit-form' should match your backend server endpoint
                const response = await fetch('http://localhost:3000/submit-form', {
                    method: 'POST', // HTTP method for sending data
                    headers: {
                        // 'Content-Type' header tells the server that the request body is JSON
                        'Content-Type': 'application/json'
                    },
                    // 'body' contains the data to send, converted to a JSON string
                    body: JSON.stringify(formData)
                });
                console.log('Response received from backend. Status:', response.status);

                // Parse the JSON response from the server
                // response.json() returns a Promise, so we use 'await'
                const responseData = await response.json();
                console.log('Parsed response data:', responseData);

                if (response.ok) { // response.ok is true if HTTP status is 200-299
                    // Show a success message to the user
                    alert('Message sent successfully! Thank you for reaching out.');
                    console.log('Form submission successful.');
                    // Reset the form fields to their initial state
                    contactForm.reset();
                } else {
                    // Show an error message with details from the server, if available
                    // responseData.error might contain a specific error message from your backend
                    alert(`Error: ${responseData.error || 'Failed to send message. Please try again.'}`);
                    console.error('Form submission failed. Server responded with error:', responseData.error || response.statusText);
                }
            } catch (error) {
                // This block catches network errors or issues with the fetch request itself (e.g., server is down)
                console.error('An error occurred during form submission:', error);
                // Provide a user-friendly message for connection issues
                alert('Connection error: Could not connect to the server. Please ensure the server is running at http://localhost:3000 and try again.');
            }
        });
    } else {
        // This message appears if script.js is loaded on a page without id="contactForm"
        console.log('Contact form element not found on this page. No submit listener added.');
    }
});