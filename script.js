// Airtable Integration
// Replace these with your actual Airtable base ID, table names, and API key
const AIRTABLE_CONFIG = {
    baseId: 'YOUR_BASE_ID', // Replace with your Airtable base ID
    membershipTable: 'Members', // Replace with your membership table name
    donationTable: 'Donations', // Replace with your donation table name
    apiKey: 'YOUR_API_KEY' // Replace with your Airtable API key
};

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}`;

// Helper function to submit to Airtable
async function submitToAirtable(table, data) {
    try {
        const response = await fetch(`${AIRTABLE_API_URL}/${table}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: data
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error submitting to Airtable:', error);
        throw error;
    }
}

// Membership Form Handler
document.getElementById('membership-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('membership-message');
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    messageDiv.style.display = 'none';
    
    // Collect form data
    const formData = {
        'Name': form.querySelector('#member-name').value,
        'Email': form.querySelector('#member-email').value,
        'Phone': form.querySelector('#member-phone').value || '',
        'Address': form.querySelector('#member-address').value || '',
        'Message': form.querySelector('#member-message').value || '',
        'Date': new Date().toISOString().split('T')[0]
    };
    
    try {
        await submitToAirtable(AIRTABLE_CONFIG.membershipTable, formData);
        
        // Show success message
        messageDiv.className = 'form-message success';
        messageDiv.textContent = 'Thank you! Your membership application has been submitted successfully. We\'ll be in touch soon!';
        messageDiv.style.display = 'block';
        
        // Reset form
        form.reset();
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        // Show error message
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Sorry, there was an error submitting your application. Please try again or contact us directly at hello@chorltonbikes.coop';
        messageDiv.style.display = 'block';
        
        console.error('Membership form error:', error);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Membership Application';
    }
});

// Donation Form Handler
document.getElementById('donation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('donation-message');
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    messageDiv.style.display = 'none';
    
    // Collect form data
    const formData = {
        'Name': form.querySelector('#donor-name').value,
        'Email': form.querySelector('#donor-email').value,
        'Amount': parseFloat(form.querySelector('#donation-amount').value),
        'Message': form.querySelector('#donation-message').value || '',
        'Date': new Date().toISOString().split('T')[0]
    };
    
    try {
        await submitToAirtable(AIRTABLE_CONFIG.donationTable, formData);
        
        // Show success message
        messageDiv.className = 'form-message success';
        messageDiv.textContent = 'Thank you for your generous donation! We truly appreciate your support. We\'ll be in touch with payment details shortly.';
        messageDiv.style.display = 'block';
        
        // Reset form
        form.reset();
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        // Show error message
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Sorry, there was an error submitting your donation. Please try again or contact us directly at hello@chorltonbikes.coop';
        messageDiv.style.display = 'block';
        
        console.error('Donation form error:', error);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Donation';
    }
});

// Newsletter Form Handler
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('newsletter-message');
        const emailInput = form.querySelector('#newsletter-email');
        
        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        messageDiv.style.display = 'none';
        
        // Collect form data
        const formData = {
            'Email': emailInput.value,
            'Date': new Date().toISOString().split('T')[0],
            'Source': 'Newsletter Signup'
        };
        
        try {
            // You can add a Newsletter table to Airtable or use a different service
            // For now, we'll just show a success message
            // await submitToAirtable('Newsletter', formData);
            
            // Show success message
            messageDiv.className = 'form-message success';
            messageDiv.textContent = 'Thank you for subscribing! We\'ll keep you updated with all the latest news from Chorlton Bikes.';
            messageDiv.style.display = 'block';
            
            // Reset form
            form.reset();
            
            // Scroll to message
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
        } catch (error) {
            // Show error message
            messageDiv.className = 'form-message error';
            messageDiv.textContent = 'Sorry, there was an error subscribing. Please try again or contact us directly at hello@chorltonbikes.coop';
            messageDiv.style.display = 'block';
            
            console.error('Newsletter form error:', error);
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Sign me up';
        }
    });
}

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinks) {
    const overlay = document.querySelector('.mobile-menu-overlay');
    
    const openMenu = () => {
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        navLinks.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    const closeMenu = () => {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when clicking on a link (important for one-page sites)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking on overlay
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
}

// Hero Carousel
const heroCarousel = document.querySelector('.hero-carousel');
if (heroCarousel) {
    const slides = heroCarousel.querySelectorAll('.carousel-slide:not(.fallback)');
    const dotsContainer = document.querySelector('.carousel-dots');
    let currentSlide = 0;
    let carouselInterval;

    // Only proceed if we have slides
    if (slides.length > 0) {
        // Ensure first slide is active
        slides[0].classList.add('active');

        // Create dots for navigation
        if (slides.length > 1 && dotsContainer) {
            slides.forEach((slide, index) => {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot';
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
        } else if (dotsContainer) {
            dotsContainer.style.display = 'none';
        }

        // Auto-advance carousel every 3 seconds if multiple slides
        if (slides.length > 1) {
            function startCarousel() {
                carouselInterval = setInterval(() => {
                    nextSlide();
                }, 3000);
            }

            function stopCarousel() {
                if (carouselInterval) {
                    clearInterval(carouselInterval);
                }
            }

            // Start the carousel
            startCarousel();
            
            // Pause on hover
            heroCarousel.addEventListener('mouseenter', stopCarousel);
            heroCarousel.addEventListener('mouseleave', startCarousel);
        }
    }

    function goToSlide(index) {
        if (slides.length === 0) return;

        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        const dots = dotsContainer?.querySelectorAll('.carousel-dot');
        dots?.forEach(dot => dot.classList.remove('active'));

        // Add active class to current slide and dot
        if (slides[index]) {
            slides[index].classList.add('active');
            if (dots && dots[index]) {
                dots[index].classList.add('active');
            }
        }
        currentSlide = index;
    }

    function nextSlide() {
        if (slides.length > 1) {
            const next = (currentSlide + 1) % slides.length;
            goToSlide(next);
        }
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    }
    
    lastScroll = currentScroll;
});

