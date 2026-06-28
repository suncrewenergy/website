/**
 * motion.js — Sun Crew Energy Website
 * Central motion engine (Webflow-grade feel) built on:
 *   - GSAP + ScrollTrigger  → scroll-linked reveals, hero load timeline
 *   - SplitType             → word-stagger reveals on section headings
 *
 * Design goals:
 *   - One reusable system driven off the existing `.fade-in` markup.
 *   - Never break the site: degrades gracefully if a library or
 *     reduced-motion preference is present (everything just shows).
 *   - main.js checks `window.SCE_MOTION` and hands reveal duties here.
 */

(function () {
    'use strict';

    // Set synchronously (before DOMContentLoaded) so main.js can detect us.
    window.SCE_MOTION = true;

    var prefersReduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function () {

        var hasGSAP = window.gsap && window.ScrollTrigger;

        // ── Fallback: no engine or reduced motion → reveal everything ──
        if (prefersReduced || !hasGSAP) {
            document.querySelectorAll('.fade-in').forEach(function (el) {
                el.classList.add('visible');
            });
            return;
        }

        var gsap = window.gsap;
        var ScrollTrigger = window.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        document.documentElement.classList.add('has-motion');

        var EASE = 'power3.out';

        // ─── HERO LOAD TIMELINE ──────────────────────────────────────
        // Plays once on load (no scroll trigger). Staggered entrance.
        var heroEls = gsap.utils.toArray('.hero .fade-in');
        if (heroEls.length) {
            gsap.set(heroEls, { opacity: 0, y: 26 });
            gsap.to(heroEls, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: EASE,
                stagger: 0.12,
                delay: 0.15
            });
            // Exclude from scroll reveals below.
            heroEls.forEach(function (el) { el.classList.add('motion-done'); });
        }

        // ─── SECTION HEADING WORD REVEAL (SplitType) ─────────────────
        if (window.SplitType) {
            gsap.utils.toArray('.section-title').forEach(function (title) {
                // Make the heading itself visible (it may carry .fade-in).
                gsap.set(title, { opacity: 1 });

                var split = new window.SplitType(title, { types: 'words' });
                if (!split.words || !split.words.length) return;

                gsap.set(split.words, { opacity: 0, yPercent: 45 });

                ScrollTrigger.create({
                    trigger: title,
                    start: 'top 86%',
                    once: true,
                    onEnter: function () {
                        gsap.to(split.words, {
                            opacity: 1,
                            yPercent: 0,
                            duration: 0.7,
                            ease: EASE,
                            stagger: 0.035
                        });
                    }
                });

                title.classList.add('motion-done');
            });
        }

        // ─── GENERIC SCROLL REVEALS (batched stagger) ────────────────
        // Everything else with `.fade-in` slides up as it enters view.
        var revealEls = gsap.utils.toArray('.fade-in:not(.motion-done)');
        if (revealEls.length) {
            gsap.set(revealEls, { opacity: 0, y: 30 });

            ScrollTrigger.batch(revealEls, {
                start: 'top 88%',
                onEnter: function (batch) {
                    gsap.to(batch, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: EASE,
                        stagger: 0.1,
                        overwrite: true
                    });
                }
            });
        }

        // ─── HERO PARALLAX ───────────────────────────────────────────
        // Background image drifts slower than scroll for depth.
        var heroBg = document.querySelector('.hero-bg');
        if (heroBg) {
            gsap.to(heroBg, {
                yPercent: 18,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }
        var heroImg = document.querySelector('.hero-image-wrapper');
        if (heroImg) {
            gsap.to(heroImg, {
                y: -28,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }

        // ─── MAGNETIC CTA BUTTONS ────────────────────────────────────
        // Large buttons subtly follow the cursor (fine-pointer devices only).
        var finePointer = window.matchMedia &&
            window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (finePointer) {
            gsap.utils.toArray('.btn-lg').forEach(function (btn) {
                var xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
                var yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
                btn.addEventListener('mousemove', function (e) {
                    var r = btn.getBoundingClientRect();
                    xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
                    yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
                });
                btn.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
            });
        }

        // ─── REFRESH AFTER ASSETS LOAD ───────────────────────────────
        // Images change layout height → recompute trigger positions.
        window.addEventListener('load', function () {
            ScrollTrigger.refresh();
        });
    });
})();
