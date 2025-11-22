// Hero Carousel
(function() {
    const heroBackground = document.getElementById('hero-background');
    if (!heroBackground) {
        console.warn('Hero background element not found');
        return;
    }

    // Dynamically detect numbered carousel images (01.png, 02.png, etc. up to 99.png)
    // Images should be named with 2-digit numbers: 01.png, 02.png, 03.png, etc.
    const carouselImages = [];
    const maxImages = 99; // Support up to 99 images
    
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
            console.warn('No carousel images found');
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
                if (navbar) navbar.classList.remove('menu-open');
            } else {
                // Open menu
                mobileMenuToggle.setAttribute('aria-expanded', 'true');
                navLinks.classList.add('active');
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
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
            // Use scrollIntoView which respects CSS scroll-padding-top
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
    // Fallback for when Facebook embed is blocked (e.g., Chrome iOS)
    function showFacebookFallback(container) {
        // Check if fallback already exists
        if (container.querySelector('.fb-fallback')) {
            return;
        }
        
        const fallback = document.createElement('div');
        fallback.className = 'fb-fallback';
        fallback.style.cssText = 'width:100%;height:600px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f5f5f5;border-radius:8px;padding:2rem;text-align:center;';
        fallback.innerHTML = `
            <h3 style="margin-bottom:1rem;color:#333;">Follow Us on Facebook</h3>
            <p style="margin-bottom:1.5rem;color:#666;">Visit our Facebook page to see the latest updates and community news.</p>
            <a href="https://www.facebook.com/chorltonbikedeliveries" 
               target="_blank" 
               rel="noopener noreferrer" 
               style="display:inline-block;padding:0.75rem 2rem;background:#1877f2;color:white;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1.1rem;">
                Visit Facebook Page
            </a>
        `;
        
        // Hide the Facebook embed and show fallback
        const fbPage = container.querySelector('.fb-page');
        if (fbPage) {
            fbPage.style.display = 'none';
        }
        container.appendChild(fallback);
    }

    function resizeFacebookPlugin() {
        const fbPage = document.querySelector('.fb-page');
        if (!fbPage) {
            console.warn('Facebook page element not found');
            return;
        }
        
        const container = fbPage.closest('.social-feed-embed');
        if (!container) {
            console.warn('Facebook container not found');
            return;
        }
        
        // Get container width with multiple fallbacks
        const containerWidth = container.offsetWidth || container.clientWidth || container.getBoundingClientRect().width || window.innerWidth;
        
        if (containerWidth > 0) {
            // Facebook max width is 500px, set to container width (capped at 500)
            // On mobile, use the full container width (minimum 280px)
            const isMobile = window.innerWidth <= 768;
            const width = isMobile ? Math.max(Math.floor(containerWidth), 280) : Math.min(Math.floor(containerWidth), 500);
            fbPage.setAttribute('data-width', width.toString());
            
            // Force re-render Facebook plugin
            const isChrome = /CriOS|Chrome/i.test(navigator.userAgent);
            
            if (window.FB) {
                try {
                    window.FB.XFBML.parse(container);
                } catch (e) {
                    console.error('Error parsing XFBML:', e);
                }
                
                // Chrome-specific: Force re-parse after a delay
                if (isChrome) {
                    setTimeout(function() {
                        if (window.FB) {
                            try {
                                window.FB.XFBML.parse(container);
                            } catch (e) {
                                console.error('Chrome re-parse error:', e);
                            }
                        }
                    }, 1500);
                }
            } else {
                // If SDK not loaded and we're in Chrome, try to wait longer
                if (isChrome) {
                    const checkSDK = setInterval(function() {
                        if (window.FB) {
                            clearInterval(checkSDK);
                            try {
                                window.FB.XFBML.parse(container);
                            } catch (e) {
                                console.error('Chrome parse error:', e);
                            }
                        }
                    }, 500);
                    setTimeout(function() {
                        clearInterval(checkSDK);
                    }, 10000);
                }
            }
            
            // Scale the iframe if container is wider than 500px (desktop only)
            // Chrome needs longer timeout
            const iframeTimeout = isChrome ? 3000 : 2000;
            setTimeout(function() {
                const iframe = container.querySelector('.fb-page iframe');
                if (iframe) {
                    // Force visibility on iframe and parents
                    const parentSpan = iframe.closest('span');
                    const parentFbPage = iframe.closest('.fb-page');
                    const parentContainer = iframe.closest('.social-feed-embed');
                    
                    if (parentSpan) {
                        parentSpan.style.display = 'block';
                        parentSpan.style.visibility = 'visible';
                        parentSpan.style.opacity = '1';
                        parentSpan.style.width = '100%';
                        parentSpan.style.height = '600px';
                        parentSpan.style.minWidth = width + 'px';
                        parentSpan.style.minHeight = '600px';
                        parentSpan.style.position = 'relative';
                        parentSpan.style.zIndex = '1';
                    }
                    
                    if (parentFbPage) {
                        parentFbPage.style.display = 'block';
                        parentFbPage.style.visibility = 'visible';
                        parentFbPage.style.opacity = '1';
                        parentFbPage.style.width = '100%';
                        parentFbPage.style.height = '600px';
                        parentFbPage.style.minWidth = width + 'px';
                        parentFbPage.style.minHeight = '600px';
                        parentFbPage.style.position = 'relative';
                        parentFbPage.style.zIndex = '1';
                    }
                    
                    // Force iframe visibility
                    iframe.style.display = 'block';
                    iframe.style.visibility = 'visible';
                    iframe.style.opacity = '1';
                    iframe.style.width = width + 'px';
                    iframe.style.height = '600px';
                    iframe.style.minWidth = width + 'px';
                    iframe.style.minHeight = '600px';
                    iframe.style.position = 'relative';
                    iframe.style.zIndex = '2';
                    iframe.style.top = '0';
                    iframe.style.left = '0';
                    
                    // Ensure container allows content
                    if (parentContainer) {
                        parentContainer.style.overflow = 'visible';
                        parentContainer.style.position = 'relative';
                    }
                    
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
                    
                    // Check if iframe actually loaded content (Chrome iOS detection)
                    // Wait a bit longer to see if content appears
                    setTimeout(function() {
                        // Check if iframe has a src but isn't showing content
                        const hasSrcButNoContent = iframe.src && iframe.src.length > 0 && 
                                                   (iframe.offsetWidth === 0 || iframe.offsetHeight === 0 || 
                                                    !iframe.contentWindow);
                        
                        if (hasSrcButNoContent || (isChrome && isMobile && !iframe.contentWindow)) {
                            showFacebookFallback(container);
                        }
                    }, 5000); // Wait 5 seconds to see if content loads
                } else {
                    // Chrome: Try one more time
                    if (isChrome && window.FB) {
                        setTimeout(function() {
                            try {
                                window.FB.XFBML.parse(container);
                            } catch (e) {
                                console.error('Chrome retry error:', e);
                            }
                        }, 1000);
                    } else if (isChrome && isMobile) {
                        // Chrome iOS: Show fallback if iframe never appears
                        setTimeout(function() {
                            const iframe = container.querySelector('.fb-page iframe');
                            if (!iframe) {
                                showFacebookFallback(container);
                            }
                        }, 3000);
                    }
                }
            }, iframeTimeout);
        }
    }

    // Resize on load and window resize
    const isChromeBrowser = /CriOS|Chrome/i.test(navigator.userAgent);
    const initialDelay = isChromeBrowser ? 2000 : 1000; // Chrome needs more time
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(resizeFacebookPlugin, initialDelay);
        });
    } else {
        setTimeout(resizeFacebookPlugin, initialDelay);
    }

    window.addEventListener('resize', function() {
        clearTimeout(window.fbResizeTimeout);
        window.fbResizeTimeout = setTimeout(resizeFacebookPlugin, 250);
    });

    // Also resize after Facebook SDK loads
    const isChrome = /CriOS|Chrome/i.test(navigator.userAgent);
    const originalFbAsyncInit = window.fbAsyncInit;
    window.fbAsyncInit = function() {
        if (window.FB) {
            try {
                window.FB.init({
                    xfbml: true,
                    version: 'v18.0'
                });
                // Chrome needs more time
                const initDelay = isChrome ? 1500 : 500;
                const parseDelay = isChrome ? 2000 : 1000;
                setTimeout(function() {
                    resizeFacebookPlugin();
                    // Try parsing again after a delay (longer for Chrome)
                    setTimeout(function() {
                        if (window.FB) {
                            try {
                                window.FB.XFBML.parse();
                                // Chrome: One more retry
                                if (isChrome) {
                                    setTimeout(function() {
                                        if (window.FB) {
                                            window.FB.XFBML.parse();
                                        }
                                    }, 1000);
                                }
                            } catch (e) {
                                console.error('Error parsing XFBML:', e);
                            }
                        }
                    }, parseDelay);
                }, initDelay);
            } catch (e) {
                console.error('Error initializing Facebook SDK:', e);
            }
        }
        // Call original if it existed
        if (originalFbAsyncInit && typeof originalFbAsyncInit === 'function') {
            originalFbAsyncInit();
        }
    };
    
    // Also try to initialize if SDK is already loaded
    if (window.FB) {
        try {
            window.FB.init({
                xfbml: true,
                version: 'v18.0'
            });
            setTimeout(resizeFacebookPlugin, isChrome ? 2000 : 1000);
        } catch (e) {
            console.error('Error initializing pre-loaded SDK:', e);
        }
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
                    console.error('Bikes4Refugees form error:', error);
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

