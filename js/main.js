/**
 * Main Application — Navbar, Typed.js, tsParticles, AOS, Tilt, Counters, Timeline
 * Deferred: animations wait for preloader to complete before initializing.
 */
document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth < 768;

    // ===== NAVBAR (safe to initialize immediately) =====
    const navbar = document.getElementById('navbar');
    const navLinks = document.getElementById('nav-links');
    const navToggle = document.getElementById('nav-toggle');
    const sections = document.querySelectorAll('.section[id]');

    // Scroll: add blur background
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        updateActiveSection();
    });

    // Mobile hamburger
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // Active section highlight
    function updateActiveSection() {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = navLinks.querySelector(`a[href="#${id}"]`);
            if (link) {
                link.classList.toggle('active', scrollY >= top && scrollY < top + height);
            }
        });
    }

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ===== CONTACT FORM (safe to bind immediately) =====
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            const mailtoLink = `mailto:rahilkkln@gmail.com?subject=${subject}&body=${body}`;

            window.location.href = mailtoLink;

            // Visual feedback
            const btn = contactForm.querySelector('.btn-submit');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Message prepared! Opening email client...';
            btn.style.background = 'linear-gradient(135deg, #39ff14, #00cc44)';

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                contactForm.reset();
            }, 3000);
        });
    }

    // ===== DEFERRED INITIALIZATION (after preloader completes) =====
    function initPortfolioAnimations() {

        // ===== TYPED.JS =====
        if (typeof Typed !== 'undefined') {
            new Typed('#typed-output', {
                strings: [
                    'DevOps Engineer',
                    'Cloud Architect',
                    'Linux Server Admin',
                    'CI/CD Specialist',
                    'Infrastructure Automator'
                ],
                typeSpeed: 60,
                backSpeed: 40,
                backDelay: 2000,
                loop: true,
                cursorChar: '▌'
            });
        }

        // ===== AOS =====
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 80,
                disable: false
            });
        }

        // ===== VANILLA TILT =====
        if (typeof VanillaTilt !== 'undefined' && !isMobile) {
            const tiltElements = document.querySelectorAll('[data-tilt]');
            VanillaTilt.init(tiltElements, {
                max: 8,
                speed: 400,
                glare: true,
                'max-glare': 0.15,
                scale: 1.02
            });
        }

        // ===== tsParticles =====
        if (typeof tsParticles !== 'undefined') {
            tsParticles.load('tsparticles', {
                fullScreen: false,
                particles: {
                    number: {
                        value: isMobile ? 30 : 70,
                        density: { enable: true, area: 900 }
                    },
                    color: { value: ['#00f5ff', '#39ff14', '#bd00ff'] },
                    shape: { type: 'circle' },
                    opacity: {
                        value: { min: 0.1, max: 0.3 },
                        animation: { enable: true, speed: 0.5, minimumValue: 0.05 }
                    },
                    size: {
                        value: { min: 1, max: 2.5 },
                        animation: { enable: true, speed: 1, minimumValue: 0.5 }
                    },
                    links: {
                        enable: true,
                        distance: 150,
                        color: '#00f5ff',
                        opacity: 0.06,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 0.4,
                        direction: 'none',
                        random: true,
                        straight: false,
                        outModes: { default: 'out' }
                    }
                },
                interactivity: {
                    events: {
                        onHover: { enable: !isMobile, mode: 'grab' },
                        resize: true
                    },
                    modes: {
                        grab: {
                            distance: 180,
                            links: { opacity: 0.2, color: '#00f5ff' }
                        }
                    }
                },
                detectRetina: true
            });
        }

        // ===== ANIMATED COUNTERS =====
        const counters = document.querySelectorAll('.counter');
        let countersAnimated = false;

        function animateCounters() {
            if (countersAnimated) return;
            countersAnimated = true;

            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000;
                const start = performance.now();

                function updateCounter(timestamp) {
                    const elapsed = timestamp - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    counter.textContent = Math.floor(target * eased);

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                }

                requestAnimationFrame(updateCounter);
            });
        }

        // Counter observer
        const achievementsSection = document.getElementById('achievements');
        if (achievementsSection) {
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounters();
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            counterObserver.observe(achievementsSection);
        }

        // ===== TIMELINE ANIMATION =====
        const timelineLine = document.getElementById('timeline-line');
        if (timelineLine) {
            const timelineObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        timelineLine.classList.add('animate');
                        timelineObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            timelineObserver.observe(document.getElementById('timeline'));
        }

        // ===== TERMINAL CURSOR BLINK =====
        const blinkCursor = document.querySelector('.blink-cursor');
        if (blinkCursor) {
            setInterval(() => {
                blinkCursor.style.opacity = blinkCursor.style.opacity === '0' ? '1' : '0';
            }, 530);
        }

        // ===== CUSTOM CURSOR WITH TRAIL =====
        if (!isMobile) {
            const cursorDot = document.createElement('div');
            cursorDot.classList.add('cursor-dot');
            document.body.appendChild(cursorDot);

            const trailCount = 8;
            const trails = [];
            for (let i = 0; i < trailCount; i++) {
                const t = document.createElement('div');
                t.classList.add('cursor-trail');
                document.body.appendChild(t);
                trails.push({ el: t, x: 0, y: 0 });
            }

            let mouseX = 0, mouseY = 0;

            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                cursorDot.style.left = mouseX - 4 + 'px';
                cursorDot.style.top = mouseY - 4 + 'px';
            });

            // Animate trail particles
            function animateTrail() {
                let prevX = mouseX, prevY = mouseY;
                trails.forEach((trail, i) => {
                    const speed = 0.25 - i * 0.02;
                    trail.x += (prevX - trail.x) * speed;
                    trail.y += (prevY - trail.y) * speed;
                    trail.el.style.left = trail.x - 2 + 'px';
                    trail.el.style.top = trail.y - 2 + 'px';
                    trail.el.style.opacity = (1 - i / trailCount) * 0.5;
                    trail.el.style.transform = `scale(${1 - i * 0.08})`;
                    prevX = trail.x;
                    prevY = trail.y;
                });
                requestAnimationFrame(animateTrail);
            }
            animateTrail();

            // Scale cursor on interactive elements
            document.querySelectorAll('a, button, .btn, .skill-tag, .project-card, .nav-toggle').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursorDot.style.transform = 'scale(2.5)';
                    cursorDot.style.background = '#39ff14';
                    cursorDot.style.boxShadow = '0 0 20px #39ff14, 0 0 40px rgba(57,255,20,0.4)';
                });
                el.addEventListener('mouseleave', () => {
                    cursorDot.style.transform = 'scale(1)';
                    cursorDot.style.background = '#00f5ff';
                    cursorDot.style.boxShadow = '0 0 12px #00f5ff, 0 0 24px rgba(0,245,255,0.3)';
                });
            });
        }
    }

    // Listen for preloader completion, then fire up all animations
    window.addEventListener('preloaderComplete', initPortfolioAnimations);
});
