// Mobile Menu Toggle - Define globally FIRST so onclick can access it
// This must be at the very top before any other code
window.toggleMobileMenu = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (!mobileMenuToggle || !navLinks) {
        return;
    }

    const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
        // Close menu
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        // Open menu
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        navLinks.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// Initialize mobile menu immediately
(function() {
    try {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        const overlay = document.querySelector('.mobile-menu-overlay');

        if (!mobileMenuToggle || !navLinks) {
            return;
        }

        const closeMenu = () => {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        // Add click listener (in addition to onclick)
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.toggleMobileMenu(e);
        }, false);

        // Close menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu, false);
        });

        // Close menu when clicking on overlay
        if (overlay) {
            overlay.addEventListener('click', closeMenu, false);
        }

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
    } catch (error) {
        console.error('Error initializing mobile menu:', error);
    }
})();

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

// Membership Form Handler (only if form exists)
const membershipForm = document.getElementById('membership-form');
if (membershipForm) {
    membershipForm.addEventListener('submit', async (e) => {
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
}

// Donation Form Handler (only if form exists)
const donationForm = document.getElementById('donation-form');
if (donationForm) {
    donationForm.addEventListener('submit', async (e) => {
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
}

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

// Mobile Menu Toggle - Define globally FIRST so onclick can access it
// This must be defined before any other code that might error
window.toggleMobileMenu = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (!mobileMenuToggle || !navLinks) {
        console.warn('Mobile menu elements not found');
        return;
    }

    const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
        // Close menu
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        // Open menu
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        navLinks.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// Initialize mobile menu immediately
(function() {
    try {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        const overlay = document.querySelector('.mobile-menu-overlay');

        if (!mobileMenuToggle || !navLinks) {
            return;
        }

        const closeMenu = () => {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        // Add click listener (in addition to onclick)
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.toggleMobileMenu(e);
        }, false);

        // Close menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu, false);
        });

        // Close menu when clicking on overlay
        if (overlay) {
            overlay.addEventListener('click', closeMenu, false);
        }

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
    } catch (error) {
        console.error('Error initializing mobile menu:', error);
    }
})();

// Mobile Menu Toggle - Event listeners
(function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (!mobileMenuToggle || !navLinks) {
        return;
    }

    const closeMenu = () => {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Add click listener (in addition to onclick)
    mobileMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.toggleMobileMenu(e);
    }, false);

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu, false);
    });

    // Close menu when clicking on overlay
    if (overlay) {
        overlay.addEventListener('click', closeMenu, false);
    }

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });
})();


// Smooth scrolling for navigation links with offset for sticky navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            const navbar = document.querySelector('.navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
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

// Partners Carousel - Load logos dynamically
(function() {
    const partnersCarousel = document.getElementById('partnersCarousel');
    if (!partnersCarousel) return;

    // ============================================
    // ADD YOUR PARTNER LOGO FILENAMES HERE
    // ============================================
    // Simply add the filename of each logo you place in assets/images/partners/
    const partnerLogos = [
        'barbakan.jpg',
        'british-cycling.png',
        'care-uk.webp',
        'chorlton-cheesmongers.png',
        'chorlton-traders.webp',
        'crack-magazine.png',
        'cracking-good-food.png',
        'emmelines-pantry.png',
        'feedr.svg',
        'forest-foods.png',
        'holy-grain.png',
        'live-from-wythenshaw-park.png',
        'makers-market.jpeg',
        'manchester-south-central-foodbank.webp',
        'mcqueen-independent.avif',
        'mcr-active.png',
        'nhs.png',
        'quids-in.jpeg',
        'refugee-aid.png',
        'tea-hive.png',
        'tfgm.png',
        'the-8th-day.png',
        'unicorn-grocery.jpeg',
        'university-of-manchester.png',
        'veg-box-people.png'
    ];
    // ============================================

    // Function to load logos
    function loadPartnerLogos() {
        if (partnerLogos.length === 0) {
            // Show helpful message if no logos are configured
            const message = document.createElement('div');
            message.style.cssText = 'text-align: center; padding: 3rem; color: var(--text-light);';
            message.innerHTML = `
                <p><strong>No partner logos configured yet.</strong></p>
                <p style="margin-top: 1rem; font-size: 0.9rem;">
                    Add logos to <code>assets/images/partners/</code> folder<br>
                    and update the <code>partnerLogos</code> array in <code>script.js</code>
                </p>
            `;
            partnersCarousel.appendChild(message);
            return;
        }

        partnerLogos.forEach((logo, index) => {
            createLogoElement(logo, index);
        });

        // Duplicate logos for seamless infinite scroll
        duplicateLogos();
    }

    function createLogoElement(filename, index) {
        const logoDiv = document.createElement('div');
        logoDiv.className = 'partner-logo';
        logoDiv.setAttribute('data-index', index);

        const img = document.createElement('img');
        img.src = `assets/images/partners/${filename}`;
        img.alt = `Partner logo ${index + 1}`;
        img.loading = 'lazy';
        
        // Handle image load errors
        img.onerror = function() {
            console.warn(`Failed to load partner logo: ${filename}`);
            logoDiv.style.display = 'none';
        };

        logoDiv.appendChild(img);
        partnersCarousel.appendChild(logoDiv);
    }

    function duplicateLogos() {
        // Clone all logos for seamless infinite scroll
        const logos = partnersCarousel.querySelectorAll('.partner-logo');
        if (logos.length === 0) return;

        logos.forEach(logo => {
            const clone = logo.cloneNode(true);
            partnersCarousel.appendChild(clone);
        });

        // Update animation duration based on number of logos
        updateAnimationDuration();
    }

    function updateAnimationDuration() {
        const logos = partnersCarousel.querySelectorAll('.partner-logo');
        const logoCount = logos.length;
        if (logoCount === 0) return;

        // Calculate duration: ~2 seconds per logo for smooth scrolling
        // We duplicate logos, so we only need to animate through half
        const originalLogoCount = logoCount / 2;
        const duration = originalLogoCount * 2;
        partnersCarousel.style.setProperty('--animation-duration', `${duration}s`);
        
        // Update keyframe to move by half the total width (since we duplicate)
        const totalWidth = logoCount * (200 + 48); // 200px width + 3rem (48px) gap
        const moveDistance = totalWidth / 2;
        
        // Update CSS custom property for animation distance
        document.documentElement.style.setProperty('--carousel-move-distance', `-${moveDistance}px`);
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPartnerLogos);
    } else {
        loadPartnerLogos();
    }
})();

// Facebook Page Plugin - Ensure responsive scaling
(function() {
    function resizeFacebookPlugin() {
        const fbPage = document.querySelector('.fb-page');
        if (fbPage) {
            const container = fbPage.closest('.social-feed-embed');
            if (container) {
                const containerWidth = container.offsetWidth || container.clientWidth;
                if (containerWidth > 0) {
                    // Facebook max width is 500px, set to container width (capped at 500)
                    // On mobile, use the full container width (minimum 280px)
                    const isMobile = window.innerWidth <= 768;
                    const width = isMobile ? Math.max(Math.floor(containerWidth), 280) : Math.min(Math.floor(containerWidth), 500);
                    fbPage.setAttribute('data-width', width.toString());
                    
                    // Scale the iframe if container is wider than 500px (desktop only)
                    setTimeout(function() {
                        const iframe = container.querySelector('.fb-page iframe');
                        if (iframe) {
                            if (!isMobile && containerWidth > 500) {
                                const scale = containerWidth / 500;
                                iframe.style.transform = `scale(${scale})`;
                                iframe.style.transformOrigin = 'top left';
                                container.style.height = `${600 * scale}px`;
                            } else {
                                iframe.style.transform = 'scale(1)';
                                iframe.style.transformOrigin = 'top left';
                                container.style.height = '600px';
                            }
                        }
                    }, 1500); // Wait for Facebook to render
                    
                    // Re-render Facebook plugin if SDK is loaded
                    if (window.FB) {
                        window.FB.XFBML.parse();
                    }
                }
            }
        }
    }

    // Resize on load and window resize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(resizeFacebookPlugin, 1000); // Wait for Facebook SDK to load
        });
    } else {
        setTimeout(resizeFacebookPlugin, 1000);
    }

    window.addEventListener('resize', function() {
        clearTimeout(window.fbResizeTimeout);
        window.fbResizeTimeout = setTimeout(resizeFacebookPlugin, 250);
    });

    // Also resize after Facebook SDK loads
    if (typeof window.fbAsyncInit === 'undefined') {
        window.fbAsyncInit = function() {
            if (window.FB) {
                window.FB.init({
                    xfbml: true,
                    version: 'v18.0'
                });
                setTimeout(resizeFacebookPlugin, 500);
            }
        };
    }
})();

// Instagram Feed - Force 2-column layout
(function() {
    function forceInstagram2Columns() {
        const instagramBlockquote = document.querySelector('.instagram-embed-container blockquote');
        if (!instagramBlockquote) return;

        // Wait for Instagram's embed.js to render content
        const checkInterval = setInterval(function() {
            const instagramContent = instagramBlockquote.querySelector('div');
            if (instagramContent) {
                // Try to find and modify grid layouts
                const allDivs = instagramBlockquote.querySelectorAll('div');
                allDivs.forEach(function(div) {
                    const computedStyle = window.getComputedStyle(div);
                    if (computedStyle.display === 'grid' || computedStyle.gridTemplateColumns) {
                        div.style.setProperty('grid-template-columns', 'repeat(2, 1fr)', 'important');
                    }
                });
                
                clearInterval(checkInterval);
            }
        }, 500);

        // Stop checking after 10 seconds
        setTimeout(function() {
            clearInterval(checkInterval);
        }, 10000);
    }

    // Run after Instagram embed script loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(forceInstagram2Columns, 2000);
        });
    } else {
        setTimeout(forceInstagram2Columns, 2000);
    }

    // Also run when Instagram embed script loads
    const instagramScript = document.querySelector('script[src*="instagram.com/embed.js"]');
    if (instagramScript) {
        instagramScript.addEventListener('load', function() {
            setTimeout(forceInstagram2Columns, 1000);
        });
    }
})();


