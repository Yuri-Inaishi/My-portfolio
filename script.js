// Intersection Observer for scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px'
        };

        // Track animated sections to prevent re-animation
        const animatedSections = new Set();

        // Section observer
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animatedSections.has(entry.target.id)) {
                    animatedSections.add(entry.target.id);
                    animateSection(entry.target);
                }
            });
        }, observerOptions);

        // Navigation observer
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const navDot = document.querySelector(`.floating-nav [href="#${entry.target.id}"]`);
                const headerNavLink = document.querySelector(`.header-nav [href="#${entry.target.id}"]`);
                
                if (entry.isIntersecting) {
                    // Update floating nav
                    document.querySelectorAll('.nav-dot').forEach(dot => dot.classList.remove('active'));
                    if (navDot) navDot.classList.add('active');
                    
                    // Update header nav
                    document.querySelectorAll('.header-nav a').forEach(link => link.classList.remove('active'));
                    if (headerNavLink) headerNavLink.classList.add('active');
                }
            });
        }, { threshold: 0.15 });

        // Animate section function
        function animateSection(section) {
            requestAnimationFrame(() => {
                section.classList.add('animate');
                
                const header = section.querySelector('.section-header');
                if (header) {
                    setTimeout(() => header.classList.add('animate'), 200);
                }

                const cards = section.querySelectorAll('.content-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate');
                    }, 400 + (index * 150));
                });
            });
        }

        // Progress bar update
        function updateProgressBar() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            document.querySelector('.progress-bar').style.width = scrollPercent + '%';
        }

        // Parallax effect for hero section (Disabled for performance testing)
        /*
        function updateParallax() {
            const scrollY = window.pageYOffset;
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.style.transform = `translateY(${scrollY * 0.5}px)`;
            }
        }
        */

        // Particle system
        function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
            particle.style.opacity = Math.random() * 0.5 + 0.3;
            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 8000);
        }

        // Optimized scroll handler with requestAnimationFrame
        let ticking = false;
        function handleScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateProgressBar();
                    // updateParallax(); // Disabled for performance testing
                    ticking = false;
                });
                ticking = true;
            }
        }

        // Navigation click handler
        function handleNavClick(e) {
            e.preventDefault();
            const target = document.querySelector(e.target.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        // Header navigation click handler
        function handleHeaderNavClick(e) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        // Initialize observers and event listeners
        document.addEventListener('DOMContentLoaded', () => {
            // Observe all sections
            document.querySelectorAll('section').forEach(section => {
                sectionObserver.observe(section);
                navObserver.observe(section);
            });

            // Timeline item observer for individual animation
            const timelineItemObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                        timelineItemObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            document.querySelectorAll('.timeline-item').forEach(item => {
                timelineItemObserver.observe(item);
            });

            // Add scroll event listener (passive for performance)
            window.addEventListener('scroll', handleScroll, { passive: true });

            // Add navigation click handlers
            document.querySelectorAll('.nav-dot').forEach(dot => {
                dot.addEventListener('click', handleNavClick);
            });

            // Add header navigation click handlers
            document.querySelectorAll('.header-nav a').forEach(link => {
                link.addEventListener('click', handleHeaderNavClick);
            });

            // Scroll indicator click handler
            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (scrollIndicator) {
                scrollIndicator.addEventListener('click', () => {
                    document.getElementById('about').scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            }

            // Create particles periodically
            setInterval(createParticle, 2000);

            // Initial progress bar update
            updateProgressBar();

            // Animate hero section immediately
            const heroSection = document.getElementById('hero');
            if (heroSection) {
                heroSection.classList.add('animate');
            }

            

            // Modal functionality
            const openModalButtons = document.querySelectorAll('[data-modal-target]');
            const closeModalButtons = document.querySelectorAll('.modal-close');
            const overlays = document.querySelectorAll('.modal-overlay');

            openModalButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const modal = document.querySelector(button.dataset.modalTarget);
                    openModal(modal);
                });
            });

            overlays.forEach(overlay => {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        closeModal(overlay);
                    }
                });
            });

            closeModalButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const modal = button.closest('.modal-overlay');
                    closeModal(modal);
                });
            });

            function openModal(modal) {
                if (modal == null) return;
                modal.classList.add('active');
            }

            function closeModal(modal) {
                if (modal == null) return;
                modal.classList.remove('active');
            }

            // Image carousel for modals
            document.querySelectorAll('.modal-img-container').forEach(container => {
                const prevButton = container.querySelector('.modal-img-prev');
                const nextButton = container.querySelector('.modal-img-next');
                const images = Array.from(container.querySelectorAll('.carousel-img'));
                let currentIndex = 0;

                function updateImages() {
                    if (images.length === 0) return;
                    images.forEach((img, index) => {
                        img.classList.toggle('active', index === currentIndex);
                    });
                }

                if (prevButton && nextButton && images.length > 1) {
                    const initialActiveIndex = images.findIndex(img => img.classList.contains('active'));
                    if (initialActiveIndex !== -1) {
                        currentIndex = initialActiveIndex;
                    }
                    updateImages(); // Call initially to set the correct image

                    prevButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentIndex = (currentIndex - 1 + images.length) % images.length;
                        updateImages();
                    });

                    nextButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentIndex = (currentIndex + 1) % images.length;
                        updateImages();
                    });
                }
            });
        });

        // Handle reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        }

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            sectionObserver.disconnect();
            navObserver.disconnect();
        });

        

        

// Hero background image loading
window.addEventListener('load', () => {
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        heroSection.classList.add('hero-loaded');
    }
});
