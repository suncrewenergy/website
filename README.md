# Suncrew Energy — Website

Marketing website for **Suncrew Energy**, a full-service solar EPC company in Egypt.

## Stack
- Static **HTML5** + **Bootstrap 5** (CDN)
- Custom CSS (`assets/css/`) and JS (`assets/js/`)
- GSAP + ScrollTrigger + SplitType for motion
- One **PHP** form handler (`forms/contact.php`) — requires PHP on the server

## Structure
```
index.html, about.html, services.html, projects.html, contact.html, thank-you.html
assets/css/   → variables.css, style.css, responsive.css
assets/js/    → main.js, motion.js, slider.js, form-validation.js
assets/images/→ logo, team
forms/        → contact.php (mail handler)
```

## Local preview
Open `index.html` in a browser. The contact form (`forms/contact.php`) only
works when served by a PHP-capable web server.

## Deployment
Hosted on a VPS behind Nginx/Apache. The server pulls from this repository.
PHP is required for the contact form (`mail()`); the rest is static.

## Before going live
- [ ] Confirm `RECEIVER_EMAIL` in `forms/contact.php`
- [ ] Replace social links (`href="#"`) in footers with real URLs
- [ ] Swap placeholder testimonials/partner logos for real, approved content
- [ ] Add a favicon (`assets/images/logo/favicon.png`)
