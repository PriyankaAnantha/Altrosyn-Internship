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
                // You could redirect to an error page here too, or just keep the alert for simple validation
                alert('Please fill in all fields.');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Disable the submit button to prevent multiple submissions
            const submitButton = contactForm.querySelector('button[type="submit"]');
            if(submitButton) submitButton.disabled = true;


            try {
                console.log('Attempting to send data to the backend...');
                const response = await fetch('http://localhost:3000/submit-form', { // Ensure this URL is correct
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                console.log('Response received from backend. Status:', response.status);

                if (response.ok) { // status in the range 200-299
                    // const responseData = await response.json(); // Only if you need data from the success response
                    // console.log('Parsed response data:', responseData);
                    contactForm.reset();
                    window.location.href = 'success.html'; // Redirect to success page
                } else {
                    // Handle non-OK responses
                    let errorMsgForPage = `Error: ${response.status} ${response.statusText || ''}. `;
                    let errorDetailsFromServer = 'Failed to send message. Please try again.';

                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        try {
                            const errorData = await response.json();
                            errorDetailsFromServer = errorData.error || (errorData.details ? `Details: ${errorData.details}` : '');
                            if(errorData.code) errorDetailsFromServer += ` (Code: ${errorData.code})`;
                            if(errorData.hint) errorDetailsFromServer += ` Hint: ${errorData.hint}`;
                            console.error('Server responded with error (parsed JSON):', errorData);
                        } catch (jsonError) {
                            console.warn('Could not parse error response as JSON:', jsonError);
                            errorDetailsFromServer = "Server sent a JSON error, but parsing failed."
                        }
                    } else {
                        try {
                            const textError = await response.text();
                            errorDetailsFromServer = textError || 'No specific error message from server.';
                            console.error('Server responded with non-JSON error (text):', textError);
                        } catch (textParseError){
                             console.warn('Could not parse error response as text:', textParseError);
                             errorDetailsFromServer = "Could not read error message from server."
                        }
                    }
                    // Redirect to an error page, optionally passing the error message
                    // For simplicity, just redirecting. You can pass 'errorDetailsFromServer' via query param if desired.
                    // Example: window.location.href = `error.html?message=${encodeURIComponent(errorDetailsFromServer)}`;
                    console.error("Redirecting to error page due to:", errorMsgForPage + errorDetailsFromServer);
                    window.location.href = 'error.html';
                }
            } catch (error) { // Catches network errors or JS errors in the try block
                console.error('An error occurred during form submission (network or script):', error);
                // Redirect to an error page for network errors too
                // window.location.href = `error.html?message=${encodeURIComponent('Network error or script issue. Could not connect to server.')}`;
                window.location.href = 'error.html';
            } finally {
                 // Re-enable the submit button if it exists, regardless of outcome (unless navigating away)
                 // Since we are navigating away, this might not be strictly necessary,
                 // but good practice if you weren't.
                 if(submitButton) submitButton.disabled = false;
            }
        });
    } else {
        console.log('Contact form element not found on this page.');
    }
});