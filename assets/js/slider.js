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
