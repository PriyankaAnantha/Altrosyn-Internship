document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Navigation (Hamburger Menu) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links'); // Assuming this is your main ul of nav links
    const siteHeader = document.querySelector('.site-header'); // Your <header> or <nav> element

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            // Optional: Prevent body scroll when mobile menu is open
            document.body.classList.toggle('no-scroll', navLinks.classList.contains('active'));
        });

        // Close menu when a link is clicked (for single-page apps or smooth scroll)
        // For MPA, this is less critical as page reloads.
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            });
        });
    }

    // --- Active Navigation Link (for Multi-Page Apps) ---
    const setActiveNavLink = () => {
        const currentPage = window.location.pathname.split("/").pop() || 'index.html'; // Default to index.html if path is '/'
        const desktopNavLinks = document.querySelectorAll('header.site-header .nav-links a'); // Target desktop links

        desktopNavLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split("/").pop() || 'index.html';
            if (currentPage === linkPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };
    if (document.querySelector('header.site-header .nav-links')) {
        setActiveNavLink();
    }

    // --- Scrolled Header Style ---
    if (siteHeader) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                siteHeader.classList.add('scrolled');
            } else {
                siteHeader.classList.remove('scrolled');
            }
        });
    }

    // --- Contact Form Logic (from your existing script) ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // ... (Your existing contact form submission logic - paste it here)
        // Ensure it's the version that redirects to success.html/error.html
        // and handles JSON/text error responses correctly.
        // Example snippet from your provided script.js:
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                message: messageInput.value.trim()
            };

            if (!formData.name || !formData.email || !formData.message) {
                alert('Please fill in all fields.'); return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address.'); return;
            }

            const submitButton = contactForm.querySelector('button[type="submit"]');
            if(submitButton) submitButton.disabled = true;

            try {
                const response = await fetch('http://localhost:3000/submit-form', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (response.ok) {
                    contactForm.reset();
                    window.location.href = 'success.html';
                } else {
                    let errorDetailsFromServer = 'Failed to send message.';
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        try { const errorData = await response.json(); errorDetailsFromServer = errorData.error || errorData.details || 'Server error.'; }
                        catch (e) { console.warn('Could not parse JSON error response.');}
                    } else {
                        try { const textError = await response.text(); errorDetailsFromServer = textError || 'Server error.'; }
                        catch (e) { console.warn('Could not parse text error response.');}
                    }
                    console.error("Redirecting to error page. Details:", errorDetailsFromServer);
                    window.location.href = `error.html?message=${encodeURIComponent(errorDetailsFromServer)}`;
                }
            } catch (error) {
                console.error('Network/script error during form submission:', error);
                window.location.href = `error.html?message=${encodeURIComponent('Network error or script issue.')}`;
            } finally {
                if(submitButton) submitButton.disabled = false;
            }
        });
    }


    // --- Simple Fade-Up Animation on Scroll/Load (Intersection Observer) ---
    const animatedElements = document.querySelectorAll('.animate-on-load');
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target); // Stop observing once visible
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers (just make them visible immediately)
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }

});

// Add to your main CSS if you use .no-scroll for mobile menu
// body.no-scroll {
//    overflow: hidden;
// }