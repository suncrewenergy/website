/**
 * slider.js — Sun Crew Energy Website
 * Hero carousel enhancements: touch swipe + pause on hover
 */

document.addEventListener('DOMContentLoaded', function () {

    const heroCarousel = document.getElementById('heroCarousel');
    if (!heroCarousel) return;

    // Bootstrap carousel instance (initialized via data-bs-ride attribute)
    function getCarousel() {
        return bootstrap.Carousel.getOrCreateInstance(heroCarousel);
    }

    // ─── TOUCH SWIPE SUPPORT ─────────────────────────────────────────
    let touchStartX = 0;
    let touchStartY = 0;

    heroCarousel.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    heroCarousel.addEventListener('touchend', function (e) {
        const dx = touchStartX - e.changedTouches[0].clientX;
        const dy = touchStartY - e.changedTouches[0].clientY;

        // Only horizontal swipes
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            const carousel = getCarousel();
            dx > 0 ? carousel.next() : carousel.prev();
        }
    }, { passive: true });

    // ─── PAUSE ON HOVER / FOCUS ──────────────────────────────────────
    heroCarousel.addEventListener('mouseenter', function () {
        getCarousel().pause();
    });
    heroCarousel.addEventListener('mouseleave', function () {
        getCarousel().cycle();
    });
    heroCarousel.addEventListener('focusin', function () {
        getCarousel().pause();
    });
    heroCarousel.addEventListener('focusout', function () {
        getCarousel().cycle();
    });

});

/* ─── SERVICES SECTOR RAIL ──────────────────────────────────────────
 * Manual, mobile-first horizontal card rail: prev/next arrows,
 * progress dots, keyboard support, reduced-motion aware. No autoplay.
 */
document.addEventListener('DOMContentLoaded', function () {

    const rail = document.getElementById('servicesRail');
    if (!rail) return;

    const slides = Array.from(rail.querySelectorAll('.service-slide'));
    if (!slides.length) return;

    const dotsWrap = document.getElementById('servicesRailDots');
    const prevBtn = document.querySelector('.rail-prev');
    const nextBtn = document.querySelector('.rail-next');

    function prefersReduced() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    function behavior() {
        return prefersReduced() ? 'auto' : 'smooth';
    }
    function slideStep() {
        const style = getComputedStyle(rail);
        const gap = parseFloat(style.columnGap || style.gap || '20') || 20;
        return slides[0].getBoundingClientRect().width + gap;
    }
    function currentIndex() {
        return Math.round(rail.scrollLeft / slideStep());
    }

    // Build progress dots
    const dots = [];
    if (dotsWrap) {
        slides.forEach(function (s, i) {
            const b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('aria-label', 'Go to service ' + (i + 1));
            b.addEventListener('click', function () {
                rail.scrollTo({ left: i * slideStep(), behavior: behavior() });
            });
            dotsWrap.appendChild(b);
            dots.push(b);
        });
    }

    function update() {
        const idx = currentIndex();
        dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
        if (prevBtn) prevBtn.disabled = rail.scrollLeft <= 4;
        if (nextBtn) nextBtn.disabled = rail.scrollLeft >= (rail.scrollWidth - rail.clientWidth - 4);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () {
        rail.scrollBy({ left: -slideStep(), behavior: behavior() });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
        rail.scrollBy({ left: slideStep(), behavior: behavior() });
    });

    rail.addEventListener('scroll', function () {
        window.requestAnimationFrame(update);
    }, { passive: true });

    rail.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left: slideStep(), behavior: behavior() }); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); rail.scrollBy({ left: -slideStep(), behavior: behavior() }); }
    });

    window.addEventListener('resize', update);
    update();

});
