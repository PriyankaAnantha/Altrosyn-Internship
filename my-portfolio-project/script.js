// Wait for the DOM (Document Object Model) to be fully loaded and parsed
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing form logic...');
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        console.log('Contact form element found:', contactForm);
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Form submission intercepted.');

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                message: messageInput.value.trim()
            };
            console.log('Form data collected:', formData);

            if (!formData.name || !formData.email || !formData.message) {
                alert('Please fill in all fields.');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address.');
                return;
            }

            try {
                console.log('Attempting to send data to the backend...');
                const response = await fetch('http://localhost:3000/submit-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                console.log('Response received from backend. Status:', response.status);

                // ***** MODIFIED ERROR HANDLING *****
                if (response.ok) { // status in the range 200-299
                    const responseData = await response.json(); // Only parse JSON if response.ok
                    console.log('Parsed response data:', responseData);
                    alert('Message sent successfully! Thank you for reaching out.');
                    contactForm.reset();
                } else {
                    // Handle non-OK responses (like 401, 400, 500)
                    let errorMsg = `Error: ${response.status} ${response.statusText || ''}. `;
                    try {
                        // Try to parse as JSON, as our backend now sends JSON errors
                        const errorData = await response.json();
                        errorMsg += errorData.error || (errorData.details ? `Details: ${errorData.details}` : 'Failed to send message.');
                        if(errorData.code) errorMsg += ` (Code: ${errorData.code})`;
                        if(errorData.hint) errorMsg += ` Hint: ${errorData.hint}`;
                        console.error('Server responded with error (parsed JSON):', errorData);
                    } catch (e) {
                        // If parsing as JSON fails, read as text (e.g., for HTML error pages or plain text)
                        const textError = await response.text();
                        errorMsg += textError || 'Failed to send message. Please try again.';
                        console.error('Server responded with non-JSON error:', textError);
                    }
                    alert(errorMsg);
                }
            } catch (error) { // Catches network errors or JS errors in the try block
                console.error('An error occurred during form submission:', error);
                alert('Connection error or script error. Check console for details. Ensure server is at http://localhost:3000.');
            }
        });
    } else {
        console.log('Contact form element not found on this page.');
    }
});