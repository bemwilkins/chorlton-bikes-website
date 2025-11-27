// Hero Carousel
(function() {
    const heroBackground = document.getElementById('hero-background');
    if (!heroBackground) {
        return;
    }

    // Dynamically detect numbered carousel images (01.png through 10.png)
    // Images should be named with 2-digit numbers: 01.png, 02.png, 03.png, etc.
    const carouselImages = [];
    const maxImages = 10; // Only check first 10 images
    
    // Try to load images and only add ones that exist
    let loadedCount = 0;
    let checkCount = 0;
    
    function checkImage(num) {
        const paddedNum = String(num).padStart(2, '0'); // Ensure 2-digit format (01, 02, etc.)
        const src = `assets/images/carousel/${paddedNum}.png`;
        const img = new Image();
        
        img.onload = function() {
            carouselImages.push(src);
            loadedCount++;
            checkCount++;
            
            // Once all checks are done, start the carousel
            if (checkCount === maxImages) {
                startCarousel();
            }
        };
        
        img.onerror = function() {
            checkCount++;
            
            // Once all checks are done, start the carousel
            if (checkCount === maxImages) {
                startCarousel();
            }
        };
        
        img.src = src;
    }
    
    // Check all possible numbered images
    for (let i = 1; i <= maxImages; i++) {
        checkImage(i);
    }
    
        function startCarousel() {
        if (carouselImages.length === 0) {
            return;
        }
        
        // Sort images numerically by extracting number from filename
        carouselImages.sort((a, b) => {
            const numA = parseInt(a.match(/(\d+)\.(png|jpg)$/)?.[1] || '0');
            const numB = parseInt(b.match(/(\d+)\.(png|jpg)$/)?.[1] || '0');
            return numA - numB;
        });
        
        let currentIndex = 0;
        const heroBackgroundNext = document.getElementById('hero-background-next');
        
        // Set initial image
        heroBackground.style.backgroundImage = `url('${carouselImages[0]}')`;
        heroBackground.style.opacity = '1';
        
        // Function to change image with smooth crossfade
        function changeImage() {
            if (carouselImages.length === 0) return;
            
            currentIndex = (currentIndex + 1) % carouselImages.length;
            
            // Load next image in the background layer
            if (heroBackgroundNext) {
                heroBackgroundNext.style.backgroundImage = `url('${carouselImages[currentIndex]}')`;
                heroBackgroundNext.style.opacity = '0';
                heroBackgroundNext.style.zIndex = '1';
                
                // Start crossfade
                setTimeout(() => {
                    heroBackgroundNext.style.opacity = '1';
                    
                    // After transition completes, swap layers
                    setTimeout(() => {
                        const currentBg = heroBackground.style.backgroundImage;
                        const currentZ = heroBackground.style.zIndex;
                        
                        heroBackground.style.backgroundImage = heroBackgroundNext.style.backgroundImage;
                        heroBackground.style.opacity = '1';
                        heroBackground.style.zIndex = '0';
                        
                        heroBackgroundNext.style.zIndex = '-1';
                        heroBackgroundNext.style.opacity = '0';
                    }, 1500); // Match transition duration
                }, 50);
            } else {
                // Fallback to simple fade if next layer doesn't exist
                heroBackground.style.opacity = '0';
                setTimeout(() => {
                    heroBackground.style.backgroundImage = `url('${carouselImages[currentIndex]}')`;
                    heroBackground.style.opacity = '1';
                }, 750);
            }
        }
        
        // Change image every 5 seconds
        setInterval(changeImage, 5000);
    }
})();

// Mobile Menu Toggle - Define globally FIRST so onclick can access it
// This must be at the very top before any other code
// Mobile Menu - Clean implementation
(function() {
    'use strict';
    
    function initMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        const overlay = document.querySelector('.mobile-menu-overlay');

        if (!mobileMenuToggle || !navLinks) {
            return;
        }

        function toggleMenu() {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            const navbar = document.querySelector('.navbar');
            
            if (isExpanded) {
                // Close menu
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                document.body.style.paddingTop = ''; // Remove padding compensation
                if (navbar) navbar.classList.remove('menu-open');
            } else {
                // Open menu
                // Get navbar height before making it fixed to compensate for the shift
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                
                mobileMenuToggle.setAttribute('aria-expanded', 'true');
                navLinks.classList.add('active');
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
                // Compensate for navbar becoming fixed by adding padding equal to its height
                document.body.style.paddingTop = navbarHeight + 'px';
                if (navbar) navbar.classList.add('menu-open');
            }
        }

        // Button click
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        // Close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                const navbar = document.querySelector('.navbar');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                document.body.style.paddingTop = ''; // Remove padding compensation
                if (navbar) navbar.classList.remove('menu-open');
            });
        });

        // Close on overlay click
        if (overlay) {
            overlay.addEventListener('click', function() {
                const navbar = document.querySelector('.navbar');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                document.body.style.paddingTop = ''; // Remove padding compensation
                if (navbar) navbar.classList.remove('menu-open');
            });
        }

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                const navbar = document.querySelector('.navbar');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                document.body.style.paddingTop = ''; // Remove padding compensation
                if (navbar) navbar.classList.remove('menu-open');
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
})();

// Note: Forms are now handled by:
// - Paperform (membership and donations) - embedded via iframe
// - Google Apps Script (bike donation form) - see bikes-refugees-form handler below


// Smooth scrolling for navigation links with precise offset for sticky navbar
(function() {
    function getNavbarHeight() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            // Get the actual computed height
            const rect = navbar.getBoundingClientRect();
            return rect.height;
        }
        // Fallback values
        return window.innerWidth <= 768 ? 82 : 122;
    }

    function scrollToSection(target, offset = 0) {
        // Calculate position using getBoundingClientRect for accuracy
        const navbarHeight = getNavbarHeight();
        
        // Get current scroll position
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Get target's position relative to viewport
        const targetRect = target.getBoundingClientRect();
        
        // Calculate target's absolute position in the document
        const targetTopAbsolute = targetRect.top + currentScroll;
        
        // Calculate where we want to scroll to: target position minus navbar height minus extra offset
        // This ensures the target appears navbarHeight + offset pixels from the top of the viewport
        const desiredScrollPosition = targetTopAbsolute - navbarHeight - offset;
        
        // Always scroll, even if the difference is small (ensures proper positioning)
        const finalScrollPosition = Math.max(0, desiredScrollPosition);
        
        // Scroll to the calculated position
        window.scrollTo({
            top: finalScrollPosition,
            behavior: 'smooth'
        });
    }

    function handleAnchorClick(e) {
        const targetId = this.getAttribute('href');
        
        if (!targetId || targetId === '#' || !targetId.startsWith('#')) {
            return;
        }
        
        e.preventDefault();
        
        // Check if mobile menu is open - if so, wait for it to close before scrolling
        const navLinks = document.querySelector('.nav-links');
        const isMenuOpen = navLinks && navLinks.classList.contains('active');
        
        if (targetId === '#top') {
            if (isMenuOpen) {
                // Wait for menu to close, then scroll
                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 300);
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            return;
        }
        
        const target = document.querySelector(targetId);
        if (target) {
            // Scroll to the section element itself so the separator line (border-top) is visible
            // We want the separator to appear just below the navbar
            // Use minimal offset (0px) to get the separator line right at the navbar bottom
            if (isMenuOpen) {
                // Wait for menu to close, then scroll
                setTimeout(() => {
                    scrollToSection(target, 0);
                }, 300);
            } else {
                scrollToSection(target, 0);
            }
        }
    }

    function initSmoothScroll() {
        // Get all anchor links that point to sections
        const anchors = document.querySelectorAll('a[href^="#"]');
        
        anchors.forEach((anchor) => {
            // Add the click listener - use capture to run early
            anchor.addEventListener('click', handleAnchorClick, true);
        });
    }

    // Initialize when DOM is ready
    function setupSmoothScroll() {
        initSmoothScroll();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSmoothScroll);
    } else {
        // DOM already loaded
        setupSmoothScroll();
    }
    
    // Also run after a short delay to catch any dynamically added links
    setTimeout(setupSmoothScroll, 100);
})();

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
    
    // Partner name mapping for SEO-friendly alt text
    const partnerNames = {
        'barbakan.jpg': 'Barbakan Bakery partner',
        'british-cycling.png': 'British Cycling partner',
        'care-uk.webp': 'Care UK partner',
        'chorlton-cheesmongers.png': 'Chorlton Cheesemongers partner',
        'chorlton-traders.webp': 'Chorlton Traders partner',
        'crack-magazine.png': 'Crack Magazine partner',
        'cracking-good-food.png': 'Cracking Good Food partner',
        'emmelines-pantry.png': 'Emmeline\'s Pantry partner',
        'feedr.svg': 'Feedr partner',
        'forest-foods.png': 'Forest Foods partner',
        'holy-grain.png': 'Holy Grain partner',
        'live-from-wythenshaw-park.png': 'Live from Wythenshawe Park partner',
        'makers-market.jpeg': 'Makers Market partner',
        'manchester-south-central-foodbank.webp': 'Manchester South Central Foodbank partner',
        'mcqueen-independent.avif': 'McQueen Independent partner',
        'mcr-active.png': 'MCR Active partner',
        'nhs.png': 'NHS partner',
        'quids-in.jpeg': 'Quids In partner',
        'refugee-aid.png': 'Refugee Aid partner',
        'tea-hive.png': 'Tea Hive partner',
        'tfgm.png': 'Transport for Greater Manchester partner',
        'the-8th-day.png': 'The 8th Day partner',
        'unicorn-grocery.jpeg': 'Unicorn Grocery partner',
        'university-of-manchester.png': 'University of Manchester partner',
        'veg-box-people.png': 'Veg Box People partner'
    };
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
        img.alt = partnerNames[filename] || `Chorlton Bikes partner ${index + 1}`;
        img.loading = 'lazy';
        
        // Handle image load errors
        img.onerror = function() {
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

// Facebook Page Plugin - Ensure responsive scaling and fix header height
(function() {
    function fixFacebookHeaderHeight() {
        const container = document.querySelector('.social-feed-embed:not(.instagram-embed-container)');
        if (!container) return;
        
        const iframe = container.querySelector('.fb-page iframe');
        if (!iframe) return;
        
        // Try to access iframe content (may be blocked by CORS)
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
                // Target the shallow div._1drq element
                const shallowDiv = iframeDoc.querySelector('div._1drq');
                if (shallowDiv) {
                    shallowDiv.style.minHeight = '24px';
                    shallowDiv.style.height = 'auto';
                    shallowDiv.style.paddingTop = '8px';
                    shallowDiv.style.paddingBottom = '8px';
                }
                
                // Also fix parent containers
                const parentContainers = iframeDoc.querySelectorAll('div._1dro, div[class*="_1dr"]');
                parentContainers.forEach(function(div) {
                    if (div.offsetHeight < 20) {
                        div.style.minHeight = '24px';
                        div.style.height = 'auto';
                    }
                });
            }
        } catch (e) {
            // CORS blocked - can't access iframe content directly
            // Fall back to CSS approach
        }
    }
    
    function resizeFacebookPlugin() {
        const fbPage = document.querySelector('.fb-page');
        if (fbPage) {
            const container = fbPage.closest('.social-feed-embed');
            if (container) {
                const containerWidth = container.offsetWidth;
                if (containerWidth > 0) {
                    // Facebook max width is 500px, set to container width (capped at 500)
                    const width = Math.min(containerWidth, 500);
                    fbPage.setAttribute('data-width', width);
                    
                    // Scale the iframe if container is wider than 500px
                    setTimeout(function() {
                        const iframe = container.querySelector('.fb-page iframe');
                        if (iframe && containerWidth > 500) {
                            const scale = containerWidth / 500;
                            iframe.style.transform = `scale(${scale})`;
                            iframe.style.transformOrigin = 'top left';
                            container.style.height = `${700 * scale}px`;
                        } else if (iframe) {
                            iframe.style.transform = 'scale(1)';
                            container.style.height = '700px';
                        }
                        
                        // Try to fix header height after iframe loads
                        fixFacebookHeaderHeight();
                    }, 2000); // Wait longer for Facebook to render
                    
                    // Also try after a longer delay
                    setTimeout(fixFacebookHeaderHeight, 4000);
                    
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
    
    // Monitor iframe load and try to fix height
    const observer = new MutationObserver(function(mutations) {
        const iframe = document.querySelector('.social-feed-embed:not(.instagram-embed-container) .fb-page iframe');
        if (iframe && iframe.src) {
            setTimeout(fixFacebookHeaderHeight, 1000);
        }
    });
    
    const container = document.querySelector('.social-feed-embed:not(.instagram-embed-container)');
    if (container) {
        observer.observe(container, { childList: true, subtree: true });
    }
})();

// Bikes4Refugees Form Handler - Using Google Apps Script (free with Google Workspace!)
(function() {
    const bikesForm = document.getElementById('bikes-refugees-form');
    if (!bikesForm) return;
    
    bikesForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('bikes-refugees-message');
        const nameInput = form.querySelector('#bike-donor-name');
        const emailInput = form.querySelector('#bike-donor-email');
        const photoInput = form.querySelector('#bike-photo');
        
        // Validate form
        if (!nameInput.value || !emailInput.value || !photoInput.files || photoInput.files.length === 0) {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = 'Please fill in all required fields.';
            messageDiv.style.display = 'block';
            return;
        }
        
        // Validate file size (max 10MB - Google Apps Script limit is 50MB but we'll keep it reasonable)
        const photoFile = photoInput.files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (photoFile.size > maxSize) {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = 'Photo file is too large. Please use an image smaller than 10MB.';
            messageDiv.style.display = 'block';
            return;
        }
        
        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        messageDiv.style.display = 'none';
        
        try {
            // Convert photo to base64 for easier handling in Google Apps Script
            const reader = new FileReader();
            
            reader.onload = async function() {
                try {
                    // Get base64 data (remove data:image/...;base64, prefix)
                    const base64Data = reader.result.split(',')[1];
                    const fileType = photoFile.type || 'image/jpeg';
                    
                    // Prepare JSON payload
                    const payload = {
                        name: nameInput.value,
                        email: emailInput.value,
                        photo: base64Data,
                        photoName: photoFile.name,
                        photoType: fileType
                    };
                    
                    // Submit to Google Apps Script using a hidden iframe to avoid CORS issues
                    // Create a temporary form and submit it via iframe
                    const iframe = document.createElement('iframe');
                    iframe.name = 'hidden-iframe-' + Date.now();
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                    
                    const tempForm = document.createElement('form');
                    tempForm.method = 'POST';
                    tempForm.action = form.action;
                    tempForm.target = iframe.name;
                    tempForm.style.display = 'none';
                    
                    // Add form data as hidden inputs
                    const nameField = document.createElement('input');
                    nameField.type = 'hidden';
                    nameField.name = 'name';
                    nameField.value = payload.name;
                    tempForm.appendChild(nameField);
                    
                    const emailField = document.createElement('input');
                    emailField.type = 'hidden';
                    emailField.name = 'email';
                    emailField.value = payload.email;
                    tempForm.appendChild(emailField);
                    
                    const photoField = document.createElement('input');
                    photoField.type = 'hidden';
                    photoField.name = 'photo';
                    photoField.value = payload.photo;
                    tempForm.appendChild(photoField);
                    
                    const photoNameField = document.createElement('input');
                    photoNameField.type = 'hidden';
                    photoNameField.name = 'photoName';
                    photoNameField.value = payload.photoName;
                    tempForm.appendChild(photoNameField);
                    
                    const photoTypeField = document.createElement('input');
                    photoTypeField.type = 'hidden';
                    photoTypeField.name = 'photoType';
                    photoTypeField.value = payload.photoType;
                    tempForm.appendChild(photoTypeField);
                    
                    document.body.appendChild(tempForm);
                    
                    // Listen for iframe load to know when submission is complete
                    iframe.onload = function() {
                        // Success - form submitted
                        messageDiv.className = 'form-message success';
                        messageDiv.textContent = 'Thank you! Your bike donation submission has been sent successfully. We\'ll be in touch soon!';
                        messageDiv.style.display = 'block';
                        
                        // Reset form
                        form.reset();
                        
                        // Clean up
                        setTimeout(function() {
                            document.body.removeChild(tempForm);
                            document.body.removeChild(iframe);
                        }, 1000);
                        
                        // Re-enable submit button
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit Donation';
                    };
                    
                    // Submit the form
                    tempForm.submit();
                    
                } catch (error) {
                    messageDiv.className = 'form-message error';
                    messageDiv.textContent = error.message || 'Sorry, there was an error sending your submission. Please try again or contact us directly.';
                    messageDiv.style.display = 'block';
                    
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit Donation';
                }
            };
            
            reader.onerror = function() {
                messageDiv.className = 'form-message error';
                messageDiv.textContent = 'Error reading photo file. Please try again.';
                messageDiv.style.display = 'block';
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Donation';
            };
            
            // Read file as base64
            reader.readAsDataURL(photoFile);
            
        } catch (error) {
            // This catch handles errors before file reading
            console.error('Bikes4Refugees form error:', error);
            messageDiv.className = 'form-message error';
            messageDiv.textContent = error.message || 'Sorry, there was an error. Please try again or contact us directly.';
            messageDiv.style.display = 'block';
            
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Donation';
        }
    });
})();

// Equalize service card heights across both columns
(function() {
    function equalizeServiceCardHeights() {
        // Only run on desktop
        if (window.innerWidth < 769) {
            // Reset heights on mobile
            document.querySelectorAll('.service-card').forEach(card => {
                card.style.height = '';
            });
            return;
        }
        
        const serviceCards = document.querySelectorAll('.service-card:not(#bikes-refugees)');
        const bikesRefugeesCard = document.getElementById('bikes-refugees');
        
        if (serviceCards.length === 0) {
            return;
        }
        
        // Reset heights to auto to get natural heights
        serviceCards.forEach(card => {
            card.style.height = 'auto';
        });
        
        // Find the tallest regular card
        let maxHeight = 0;
        serviceCards.forEach(card => {
            const height = card.offsetHeight;
            if (height > maxHeight) {
                maxHeight = height;
            }
        });
        
        // Set all regular cards to the same height
        serviceCards.forEach(card => {
            card.style.height = maxHeight + 'px';
        });
        
        // Set bikes-refugees to exactly 2x height + gap (to align with card opposite)
        // This makes it span exactly 2 card slots plus the gap between them
        if (bikesRefugeesCard) {
            // Get the computed gap from CSS (2rem = 32px)
            const gap = 32; // 2rem = 32px
            // Calculate: 2 regular cards + 1 gap between them
            const bikesRefugeesHeight = (maxHeight * 2) + gap;
            bikesRefugeesCard.style.height = bikesRefugeesHeight + 'px';
            
            // Ensure the card content uses the full height properly
            const content = bikesRefugeesCard.querySelector('.service-card-content');
            if (content) {
                content.style.minHeight = '100%';
            }
        }
    }
    
    // Run on load and resize
    function initEqualHeights() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(equalizeServiceCardHeights, 100);
            });
        } else {
            setTimeout(equalizeServiceCardHeights, 100);
        }
    }
    
    initEqualHeights();
    
    // Re-equalize on resize (with debounce)
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Reset heights first
            document.querySelectorAll('.service-card').forEach(card => {
                card.style.height = '';
            });
            equalizeServiceCardHeights();
        }, 250);
    });
})();

