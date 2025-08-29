// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Loading Screen
    const loadingScreen = document.getElementById('loadingScreen');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 2000); // 2 seconds loading time
    });

    // Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        // Add a slight delay to the follower for a trailing effect
        setTimeout(() => {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }, 100);
    });

    // Change cursor style on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .nav-link, .cta-button, .btn-primary, .btn-secondary, .social-link');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursorFollower.style.transform = 'scale(1.2)';
            cursorFollower.style.borderColor = 'rgba(138, 43, 226, 0.8)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursorFollower.style.transform = 'scale(1)';
            cursorFollower.style.borderColor = 'rgba(138, 43, 226, 0.5)';
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Back to top button
    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Stats counter animation
    const statItems = document.querySelectorAll('.stat-item');
    const statsSection = document.getElementById('stats');
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
    
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
            
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    stat.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current).toLocaleString();
                }
            }, 16);
        });
    }

    // Mobile menu toggle (if needed in future)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });

    // Equalizer animation
    const bars = document.querySelectorAll('.equalizer .bar');
    
    function animateEqualizer() {
        bars.forEach(bar => {
            const randomHeight = Math.floor(Math.random() * 40) + 20;
            bar.style.height = `${randomHeight}px`;
        });
    }
    
    // Only animate if the equalizer is in viewport
    const equalizerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setInterval(animateEqualizer, 100);
                equalizerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const equalizer = document.querySelector('.equalizer');
    if (equalizer) {
        equalizerObserver.observe(equalizer);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Parallax effect for background elements
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        // Move background elements at different speeds
        document.querySelectorAll('.orb').forEach((orb, index) => {
            const speed = 0.05 * (index + 1);
            orb.style.transform = `translateY(${scrollPosition * speed}px)`;
        });
        
        document.querySelectorAll('.shape').forEach((shape, index) => {
            const speed = 0.03 * (index + 1);
            shape.style.transform = `translateY(${scrollPosition * speed}px)`;
        });
    });

    // Audio context for interactive sound (if user interacts)
    let audioContext;
    let isAudioEnabled = false;
    
    document.addEventListener('click', function initAudio() {
        if (isAudioEnabled) return;
        
        // Create audio context only after user interaction
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        isAudioEnabled = true;
        
        // Remove this event listener after first interaction
        document.removeEventListener('click', initAudio);
    });

    // Hover sound effect for buttons (optional)
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (!isAudioEnabled) return;
            
            // Create a simple hover sound
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        });
    });

    // Particle animation enhancement
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        // Add random initial positions and animations
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDelay = Math.random() * 5;
        const randomDuration = 15 + Math.random() * 10;
        
        particle.style.left = `${randomX}%`;
        particle.style.top = `${randomY}%`;
        particle.style.animationDelay = `${randomDelay}s`;
        particle.style.animationDuration = `${randomDuration}s`;
    });

    // Prevent default behavior for certain elements
    document.querySelectorAll('.logo, .cta-button').forEach(el => {
        el.addEventListener('click', (e) => {
            if (el.getAttribute('href') === '#') {
                e.preventDefault();
            }
        });
    });
});