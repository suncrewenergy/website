/**
 * main.js — Sun Crew Energy Website
 * Navbar scroll effect, back-to-top, counter animation,
 * fade-in on scroll, project filter tabs, active nav link
 */

document.addEventListener('DOMContentLoaded', function () {

    // ─── NAVBAR SCROLL EFFECT ────────────────────────────────────────
    const navbar = document.querySelector('.navbar');

    function updateNavbar() {
        if (!navbar) return;
        if (navbar.classList.contains('always-dark')) return; // inner pages stay dark
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    if (navbar) {
        window.addEventListener('scroll', updateNavbar, { passive: true });
        updateNavbar();
    }

    // ─── BACK TO TOP ─────────────────────────────────────────────────
    const backToTop = document.querySelector('.back-to-top');

    if (backToTop) {
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });

        backToTop.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─── COUNTER ANIMATION ───────────────────────────────────────────
    function animateCounter(el) {
        const target   = parseInt(el.getAttribute('data-count'), 10);
        const duration = 1800;
        const steps    = 60;
        const increment = target / steps;
        let current  = 0;
        let frame    = 0;

        const timer = setInterval(function () {
            frame++;
            current = Math.min(Math.round(increment * frame), target);
            el.textContent = current.toLocaleString();
            if (current >= target) clearInterval(timer);
        }, duration / steps);
    }

    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        const counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function (el) { counterObserver.observe(el); });
    }

    // ─── FADE-IN ON SCROLL ───────────────────────────────────────────
    // Skip when the GSAP motion engine is active — it owns reveals.
    const fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length && !window.SCE_MOTION) {
        const fadeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        fadeEls.forEach(function (el) { fadeObserver.observe(el); });
    }

    // ─── PROJECT FILTER TABS ─────────────────────────────────────────
    const filterTabs  = document.querySelectorAll('.filter-tab');
    const projectItems = document.querySelectorAll('.project-item');

    filterTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            filterTabs.forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            projectItems.forEach(function (item) {
                const cat = item.getAttribute('data-category');
                const show = filter === 'all' || cat === filter;
                item.style.display = show ? '' : 'none';
                if (show) {
                    item.classList.remove('visible');
                    // Re-trigger fade
                    requestAnimationFrame(function () {
                        item.classList.add('visible');
                    });
                }
            });
        });
    });

    // ─── SMOOTH SCROLL FOR HASH LINKS ────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = parseInt(
                    getComputedStyle(document.documentElement)
                        .getPropertyValue('--navbar-h'), 10
                ) || 72;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                if (window.lenis) {
                    window.lenis.scrollTo(top);
                } else {
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            }
        });
    });

    // ─── ACTIVE NAV LINK ─────────────────────────────────────────────
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(function (link) {
        const href = link.getAttribute('href');
        if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
            link.classList.add('active');
        }
    });

});

/* ─── HERO VIDEO: load portrait on mobile, landscape on desktop ──────
 * Only the needed file is downloaded (not both). Falls back to the
 * poster image when reduced-motion is requested or autoplay is blocked.
 */
document.addEventListener('DOMContentLoaded', function () {

    const video = document.getElementById('heroVideo');
    if (!video) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // CSS hides the video; poster image shows instead

    // Per orientation. MP4 (H.264) is universally supported (incl. iOS Safari)
    // and here is smaller than the source WebM, so it is used everywhere.
    const SOURCES = {
        landscape: [
            { src: 'assets/videos/hero-landscape.mp4', type: 'video/mp4' }
        ],
        portrait: [
            { src: 'assets/videos/hero-portrait.mp4', type: 'video/mp4' }
        ]
    };

    function chooseOrientation() {
        const portrait = window.matchMedia('(max-width: 767px)').matches
            || window.innerHeight > window.innerWidth;
        return portrait ? 'portrait' : 'landscape';
    }

    function applySource() {
        const orientation = chooseOrientation();
        if (video.getAttribute('data-current') === orientation) return;
        video.setAttribute('data-current', orientation);

        while (video.firstChild) { video.removeChild(video.firstChild); }
        SOURCES[orientation].forEach(function (s) {
            const el = document.createElement('source');
            el.src = s.src;
            el.type = s.type;
            video.appendChild(el);
        });

        video.load();
        const p = video.play();
        if (p && typeof p.catch === 'function') { p.catch(function () {}); }
    }

    applySource();

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applySource, 300);
    });

});
