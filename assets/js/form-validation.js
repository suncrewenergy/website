/**
 * form-validation.js — Sun Crew Energy Website
 * Client-side validation for the inquiry form
 */

document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('inquiryForm');
    if (!form) return;

    // ─── VALIDATION RULES ────────────────────────────────────────────
    const rules = {
        name: function (v) {
            if (!v.trim())           return 'Full name is required.';
            if (v.trim().length < 2) return 'Name must be at least 2 characters.';
            return null;
        },
        phone: function (v) {
            if (!v.trim()) return 'Phone number is required.';
            if (!/^[\+]?[\d\s\-\(\)]{8,20}$/.test(v.trim())) return 'Please enter a valid phone number.';
            return null;
        },
        email: function (v) {
            if (!v.trim()) return 'Email address is required.';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Please enter a valid email address.';
            return null;
        },
        service: function (v) {
            if (!v) return 'Please select a service.';
            return null;
        },
        message: function (v) {
            if (!v.trim())            return 'Message is required.';
            if (v.trim().length < 10) return 'Message must be at least 10 characters.';
            return null;
        }
    };

    // ─── HELPERS ─────────────────────────────────────────────────────
    function getField(name) {
        return form.querySelector('[name="' + name + '"]');
    }

    function markError(input, message) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        let fb = input.parentElement.querySelector('.invalid-feedback');
        if (!fb) {
            fb = document.createElement('div');
            fb.className = 'invalid-feedback';
            input.parentElement.appendChild(fb);
        }
        fb.textContent = message;
    }

    function markValid(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        const fb = input.parentElement.querySelector('.invalid-feedback');
        if (fb) fb.textContent = '';
    }

    function clearState(input) {
        input.classList.remove('is-invalid', 'is-valid');
    }

    // ─── REAL-TIME VALIDATION ────────────────────────────────────────
    Object.keys(rules).forEach(function (name) {
        const input = getField(name);
        if (!input) return;

        const eventType = input.tagName === 'SELECT' ? 'change' : 'blur';

        input.addEventListener(eventType, function () {
            const error = rules[name](this.value);
            error ? markError(this, error) : markValid(this);
        });

        input.addEventListener('focus', function () {
            clearState(this);
        });
    });

    // ─── SUBMIT ──────────────────────────────────────────────────────
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        let isValid = true;

        Object.keys(rules).forEach(function (name) {
            const input = getField(name);
            if (!input) return;
            const error = rules[name](input.value);
            if (error) {
                markError(input, error);
                isValid = false;
            } else {
                markValid(input);
            }
        });

        if (!isValid) {
            const firstBad = form.querySelector('.is-invalid');
            if (firstBad) {
                firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstBad.focus();
            }
            return;
        }

        // Loading state
        const submitBtn = form.querySelector('[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending…';
        submitBtn.disabled = true;

        // Submit to PHP handler
        form.submit();

        // Safety re-enable
        setTimeout(function () {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }, 12000);
    });

});
