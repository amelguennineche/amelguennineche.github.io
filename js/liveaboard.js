(function () {
    'use strict';

    var trigger = document.getElementById('lb-layout-trigger');
    var layoutImg = document.getElementById('lb-layout-img');
    var lightbox = document.getElementById('lb-lightbox');
    var lightboxImg = document.getElementById('lb-lightbox-img');
    var closeEls = lightbox ? lightbox.querySelectorAll('[data-lb-close]') : [];
    var lastFocused = null;

    if (!trigger || !layoutImg || !lightbox || !lightboxImg) return;

    function openLightbox() {
        lastFocused = document.activeElement;
        lightboxImg.src = layoutImg.currentSrc || layoutImg.src;
        lightboxImg.alt = layoutImg.alt || 'Liveaboard layout enlarged';
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        var closeBtn = lightbox.querySelector('.lb-lightbox-close');
        if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lightboxImg.removeAttribute('src');
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
    }

    trigger.addEventListener('click', openLightbox);

    closeEls.forEach(function (el) {
        el.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
    });
})();
