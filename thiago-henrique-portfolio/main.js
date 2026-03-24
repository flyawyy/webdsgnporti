// Force scroll to top on reload to ensure cinematic entrance always plays
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
}
window.onbeforeunload = function() { window.scrollTo(0,0); }; // Guarantee top on refresh

document.addEventListener('DOMContentLoaded', () => {
    
    // 0. PRELOADER & ENTRANCE ANIMATION (Liquid Fill)
    const preloader = document.querySelector('.preloader');
    const waterFill = document.querySelector('.water-fill');
    
    if (preloader && waterFill) {
        let progress = 0;
        // Fast fake liquid fill
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                waterFill.style.top = '-100%'; // Fully filled to cover the top edge of the sphere
                
                // Allow a tiny pause fully filled then slide up
                setTimeout(() => {
                    preloader.classList.add('slide-up');
                    // Add loaded class to body to trigger hero animations
                    setTimeout(() => {
                        document.body.classList.add('loaded');
                        // Start observers now to ensure reveal animations happen fresh
                        initObservers();
                    }, 400); 
                }, 300);
            } else {
                // Map 0-100 progress to 100% (empty) to -100% (full)
                // Since our element is 250% tall, driving the top to -100% ensures full coverage
                waterFill.style.top = `${100 - (progress * 2)}%`;
            }
        }, 30); // Updates very fast natively
    } else {
        document.body.classList.add('loaded'); // Fallback
    }

    // 1. SCROLL REVEAL OBSERVER (Initialized ONLY after preloader finishes)
    function initObservers() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        revealElements.forEach(el => revealObserver.observe(el));

        // Footer specific observer
        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('footer-revealed');
                    footerObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px' }); // Lower threshold for guaranteed trigger
        if(footer) footerObserver.observe(footer);
    }

    // 2. MAGNETIC BUTTONS PHYSICS (High-end sticky feel)
    const magneticElements = document.querySelectorAll('.magnetic-btn');

    magneticElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            // Add a temporary smooth transition only during entry to avoid the jump
            el.style.transition = 'transform 0.4s var(--smooth-ease)';
            setTimeout(() => {
                if (el.matches(':hover')) el.style.transition = ''; 
            }, 400);
        });

        el.addEventListener('mousemove', (e) => {
            const position = el.getBoundingClientRect();
            // Reduced to 0.15 for a subtle, high-end agency feel instead of exaggerated dragging
            const x = (e.clientX - position.left - position.width / 2) * 0.15;
            const y = (e.clientY - position.top - position.height / 2) * 0.15;
            
            el.style.transform = `translate(${x}px, ${y}px)`;
            
            const innerElements = el.querySelectorAll('span, .pulse-dot');
            innerElements.forEach(inner => {
                // Inner content follows at half speed for parallax depth
                inner.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
            });
        });

        el.addEventListener('mouseleave', () => {
            // Smooth snap back to original position
            el.style.transition = `transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)`;
            el.style.transform = `translate(0px, 0px)`;
            
            const innerElements = el.querySelectorAll('span, .pulse-dot');
            innerElements.forEach(inner => {
                inner.style.transition = `transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)`;
                inner.style.transform = `translate(0px, 0px)`;
            });
            
            setTimeout(() => {
                el.style.transition = '';
                innerElements.forEach(inner => inner.style.transition = '');
            }, 500);
        });
    });

    // 3. AMBIENT MESH GLOW (Follows cursor globally to keep site alive)
    const meshes = document.querySelectorAll('.liquid-mesh');
    
    document.body.addEventListener('mousemove', (e) => {
        meshes.forEach(mesh => {
            const rect = mesh.getBoundingClientRect();
            // Check if mouse is near or in the section to optimize
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Clean subtle glow that feels like liquid under the surface
            mesh.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(200, 200, 255, 0.08) 0%, transparent 65%)`;
        });
    });

    // 4. HIGH-END PARALLAX HERO SHRINK EFFECT (Nixtio Style)
    const heroSection = document.querySelector('.hero-section');
    const heroCenter = document.querySelector('.hero-center');
    const bottomStats = document.querySelector('.bottom-stats');
    const floatingProfile = document.querySelector('.floating-profile-card');
    
    if(heroSection) {
        // Use requestAnimationFrame for buttery smooth 60fps scrolling
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const heroHeight = window.innerHeight; 
                    
                    // Floating Profile minimal trigger
                    if (floatingProfile) {
                        if (scrollY > heroHeight * 0.4) {
                            floatingProfile.classList.add('minimal');
                        } else {
                            floatingProfile.classList.remove('minimal');
                        }
                    }
                    
                    // Floating Nav scroll inversion trigger (White to Black)
                    const floatingNav = document.querySelector('.floating-nav');
                    if (floatingNav) {
                        if (scrollY > heroHeight * 0.8) {
                            floatingNav.classList.add('scrolled');
                        } else {
                            floatingNav.classList.remove('scrolled');
                        }
                    }
                    
                    // Only compute when hero is somewhat in view
                    if(scrollY < heroHeight) {
                        const progress = scrollY / heroHeight;
                        
                        // Scale down to 0.92 maximum
                        const scale = 1 - (progress * 0.08);
                        const brightness = 100 - (progress * 80); 
                        
                        heroSection.style.transform = `scale(${scale})`;
                        heroSection.style.filter = `brightness(${Math.max(20, brightness)}%)`;
                        
                        // Inner parallax for the huge text
                        if(heroCenter) {
                            heroCenter.style.transform = `translateY(${scrollY * 0.3}px)`;
                            heroCenter.style.opacity = 1 - (progress * 1.5); 
                        }
                        
                        // Parallax for the bottom text
                        if(bottomStats) {
                            bottomStats.style.transform = `translateY(-${scrollY * 0.45}px)`;
                            bottomStats.style.opacity = Math.max(0, Math.min(1, 1 - (progress * 2.2)));
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // Removal of old footer observer initialization (now in initObservers)
    // const footer = document.querySelector('.footer-section');
    // if(footer) footerObserver.observe(footer);

    // 6. SWEEP OVERLAY TRANSITION FOR INTERNAL LINKS
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetHref = this.getAttribute('href');
            if(targetHref === '#') return;
            
            // If it's the contact button from the fixed widget, let it sweep
            e.preventDefault();
            
            // Create Sweep element dynamically
            const sweep = document.createElement('div');
            sweep.className = 'page-sweep';
            document.body.appendChild(sweep);
            
            // Force reflow
            sweep.offsetHeight;
            
            // Trigger curtain overlay covering the screen
            sweep.classList.add('active');
            
            setTimeout(() => {
                // Instantly jump to the destination while perfectly hidden
                const targetEl = document.querySelector(targetHref);
                if(targetEl) {
                    targetEl.scrollIntoView(); 
                }
                
                // Extra settling delay to ensure the scroll 'lands' before opening the curtain
                setTimeout(() => {
                    sweep.classList.remove('active');
                    sweep.classList.add('exit');
                    
                    setTimeout(() => {
                        sweep.remove();
                    }, 1000); 
                }, 300); // 300ms settling time
            }, 800); // Curtain takes 800ms to cover fully (matched to CSS)
        });
    });

});
