document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - script.js running");

    const siteHeader = document.querySelector('.site-header');
    const menuToggle = document.querySelector('.menu-toggle');
    // Corrected and more robust selector for navLinks within the site header
    const navLinks = document.querySelector('header.site-header .nav-links');

    // --- Mobile Navigation (Hamburger Menu) ---
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            console.log('Hamburger clicked!'); // For debugging
            const isActive = navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active'); // For 'X' animation of hamburger
            menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            document.body.classList.toggle('no-scroll', isActive); // Prevent body scroll
            console.log('navLinks active state:', navLinks.classList.contains('active'));
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('no-scroll');
                }
            });
        });
    } else {
        if (!menuToggle) console.error("CRITICAL: Menu toggle button (.menu-toggle) NOT FOUND!");
        if (!navLinks) console.error("CRITICAL: Nav links container ('header.site-header .nav-links') NOT FOUND!");
    }

    // --- Active Navigation Link ---
    const setActiveNavLink = () => {
        const currentPage = window.location.pathname.split("/").pop() || 'index.html';
        const desktopNavLinks = document.querySelectorAll('header.site-header .nav-links a');
        desktopNavLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (!linkHref) return;
            const linkPage = linkHref.split("/").pop() || 'index.html';
            link.classList.remove('active');
            if (currentPage === linkPage) {
                link.classList.add('active');
            }
        });
    };
    if (document.querySelector('header.site-header .nav-links')) {
        setActiveNavLink();
    }

    // --- Scrolled Header Style ---
    if (siteHeader) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
                siteHeader.classList.add('scrolled');
            } else {
                siteHeader.classList.remove('scrolled');
            }
        });
    }

    // --- CUSTOM CURSOR LOGIC ---
    const cursor = document.querySelector('.custom-cursor');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    const CURSOR_SPEED = 0.12; 
    let isCursorVisibleAndAnimating = false;
    let animationFrameId = null;

    if (cursor) {
        console.log("Custom cursor element found by JS.");
        function animateCursor() {
            if (!isCursorVisibleAndAnimating) {
                cancelAnimationFrame(animationFrameId);
                return;
            }
            let dx = mouseX - cursorX;
            let dy = mouseY - cursorY;
            if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
                cursorX = mouseX;
                cursorY = mouseY;
            } else {
                cursorX += dx * CURSOR_SPEED;
                cursorY += dy * CURSOR_SPEED;
            }
            const halfWidth = cursor.offsetWidth / 2; // Use offsetWidth for actual rendered width
            const halfHeight = cursor.offsetHeight / 2;
            cursor.style.transform = `translate3d(${cursorX - halfWidth}px, ${cursorY - halfHeight}px, 0)`;
            animationFrameId = requestAnimationFrame(animateCursor);
        }

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isCursorVisibleAndAnimating) {
                cursorX = mouseX; 
                cursorY = mouseY;
                const halfWidth = cursor.offsetWidth / 2;
                const halfHeight = cursor.offsetHeight / 2;
                cursor.style.transform = `translate3d(${cursorX - halfWidth}px, ${cursorY - halfHeight}px, 0)`;
                cursor.classList.add('visible'); // Make it visible
                isCursorVisibleAndAnimating = true;
                if(animationFrameId) cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(animateCursor);
            }
        });

        document.addEventListener('mouseleave', () => {
            cursor.classList.remove('visible');
            isCursorVisibleAndAnimating = false;
            cancelAnimationFrame(animationFrameId);
        });
        document.addEventListener('mouseenter', (event) => {
            if(!isCursorVisibleAndAnimating && cursor){
                mouseX = event.clientX; 
                mouseY = event.clientY;
                cursorX = mouseX; 
                cursorY = mouseY;
                const halfWidth = cursor.offsetWidth / 2;
                const halfHeight = cursor.offsetHeight / 2;
                cursor.style.transform = `translate3d(${cursorX - halfWidth}px, ${cursorY - halfHeight}px, 0)`;
                cursor.classList.add('visible');
                isCursorVisibleAndAnimating = true;
                if(animationFrameId) cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(animateCursor);
            }
        });

        // JS-driven hover effects (supplement to CSS :has())
        const pointerQuery = 'a.text-link, label, [data-cursor-pointer]';
        document.querySelectorAll(pointerQuery).forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('pointer-active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('pointer-active'));
        });
        // For general hover effect on larger elements (if CSS :has() is not enough or for specific cases)
        const generalHoverQuery = 'a:not(.text-link), button, [data-cursor-hover], .project-card, .logo, .menu-toggle';
        document.querySelectorAll(generalHoverQuery).forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover-general-active')); // Define .hover-general-active in CSS if needed
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover-general-active'));
        });


    } else {
        console.error("CRITICAL: Custom cursor HTML element (.custom-cursor) NOT FOUND!");
    }

    // --- Contact Form Logic ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            const formData = { name: nameInput.value.trim(), email: emailInput.value.trim(), message: messageInput.value.trim() };

            if (!formData.name || !formData.email || !formData.message) { alert('Please fill in all fields.'); return; }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) { alert('Please enter a valid email address.'); return; }

            const submitButton = contactForm.querySelector('button[type="submit"]');
            if(submitButton) submitButton.disabled = true;

            try {
                const response = await fetch('http://localhost:3000/submit-form', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
                });
                if (response.ok) {
                    contactForm.reset(); window.location.href = 'success.html';
                } else {
                    let errorDetailsFromServer = 'Failed to send message.'; let responseStatus = response.status;
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        try { const errorData = await response.json(); errorDetailsFromServer = errorData.error || errorData.details || `Server error (Status: ${responseStatus})`; if(errorData.code) errorDetailsFromServer += ` (Code: ${errorData.code})`; }
                        catch (e) { console.warn('Could not parse JSON error response.', e); errorDetailsFromServer = `Server error (Status: ${responseStatus}), response not valid JSON.`;}
                    } else {
                        try { const textError = await response.text(); errorDetailsFromServer = textError || `Server error (Status: ${responseStatus})`; }
                        catch (e) { console.warn('Could not parse text error response.', e); errorDetailsFromServer = `Server error (Status: ${responseStatus}), could not read response text.`;}
                    }
                    console.error("Redirecting to error page. Details:", errorDetailsFromServer);
                    window.location.href = `error.html?message=${encodeURIComponent(errorDetailsFromServer)}`;
                }
            } catch (error) {
                console.error('Network/script error during form submission:', error);
                window.location.href = `error.html?message=${encodeURIComponent('Network error. Could not connect to server.')}`;
            } finally {
                if(submitButton) submitButton.disabled = false;
            }
        });
    }

    // --- Simple Fade-Up Animation on Scroll/Load ---
    const animatedElements = document.querySelectorAll('.animate-on-load');
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }
});