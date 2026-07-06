(function () {
    'use strict';

    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('mobile-menu');
    var overlay = document.getElementById('nav-overlay');

    if (!header || !toggle || !menu || !overlay) {
        return;
    }

    var SCROLL_THRESHOLD = 80;
    var menuLinks = menu.querySelectorAll('a');

    function updateScrollState() {
        header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    }

    function openMenu() {
        menu.classList.add('is-open');
        toggle.classList.add('is-active');
        overlay.hidden = false;
        requestAnimationFrame(function () {
            overlay.classList.add('is-visible');
        });
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close menu');
        menu.setAttribute('aria-hidden', 'false');
        document.body.classList.add('nav-open');
    }

    function closeMenu() {
        menu.classList.remove('is-open');
        toggle.classList.remove('is-active');
        overlay.classList.remove('is-visible');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        menu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('nav-open');

        overlay.addEventListener('transitionend', function onFadeOut(event) {
            if (event.propertyName === 'opacity' && !overlay.classList.contains('is-visible')) {
                overlay.hidden = true;
                overlay.removeEventListener('transitionend', onFadeOut);
            }
        });
    }

    function isMenuOpen() {
        return toggle.getAttribute('aria-expanded') === 'true';
    }

    toggle.addEventListener('click', function () {
        if (isMenuOpen()) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isMenuOpen()) {
            closeMenu();
        }
    });

    menuLinks.forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && isMenuOpen()) {
            closeMenu();
        }
    });

    updateScrollState();
})();
