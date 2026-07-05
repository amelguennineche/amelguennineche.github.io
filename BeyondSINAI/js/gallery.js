(function () {
    'use strict';

    var gridEl = document.querySelector('.gallery-grid');
    var filters = document.querySelectorAll('.gallery-filter');
    var items = document.querySelectorAll('.gallery-item');
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCaption = document.getElementById('lightbox-caption');
    var overlay = lightbox && lightbox.querySelector('.lightbox-overlay');
    var closeBtn = lightbox && lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox && lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox && lightbox.querySelector('.lightbox-next');

    var masonry = null;
    var currentIndex = 0;
    var visibleItems = [];
    var lastFocusedElement = null;

    function getFocusableElements(container) {
        return Array.prototype.slice.call(
            container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        ).filter(function (el) {
            return !el.disabled && el.offsetParent !== null;
        });
    }

    function setActiveFilter(btn) {
        filters.forEach(function (f) {
            f.classList.remove('active');
            f.setAttribute('aria-pressed', 'false');
        });
        if (btn) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
    }

    function filterGrid(filter) {
        items.forEach(function (item) {
            var show = filter === 'all' || item.classList.contains(filter);
            item.classList.toggle('hidden', !show);
            item.setAttribute('aria-hidden', show ? 'false' : 'true');
        });
        if (masonry && typeof masonry.layout === 'function') {
            masonry.reloadItems();
            masonry.layout();
        }
    }

    function refreshVisibleItems() {
        visibleItems = Array.prototype.slice.call(items).filter(function (item) {
            return !item.classList.contains('hidden');
        });
    }

    function openLightbox(index) {
        refreshVisibleItems();
        if (visibleItems.length === 0) return;
        currentIndex = index >= 0 && index < visibleItems.length ? index : 0;
        var item = visibleItems[currentIndex];
        var img = item.querySelector('img');
        var label = item.querySelector('.gallery-item-label');
        if (lightboxImg && img) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
        }
        if (lightboxCaption && label) lightboxCaption.textContent = label.textContent;
        if (lightbox) {
            lastFocusedElement = document.activeElement;
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            if (closeBtn) closeBtn.focus();
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }
    }

    function showPrev() {
        refreshVisibleItems();
        if (visibleItems.length === 0) return;
        currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
        var item = visibleItems[currentIndex];
        var img = item.querySelector('img');
        var label = item.querySelector('.gallery-item-label');
        if (lightboxImg && img) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
        }
        if (lightboxCaption && label) lightboxCaption.textContent = label.textContent;
    }

    function showNext() {
        refreshVisibleItems();
        if (visibleItems.length === 0) return;
        currentIndex = (currentIndex + 1) % visibleItems.length;
        var item = visibleItems[currentIndex];
        var img = item.querySelector('img');
        var label = item.querySelector('.gallery-item-label');
        if (lightboxImg && img) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
        }
        if (lightboxCaption && label) lightboxCaption.textContent = label.textContent;
    }

    function trapFocus(e) {
        if (!lightbox || !lightbox.classList.contains('is-open') || e.key !== 'Tab') return;
        var focusables = getFocusableElements(lightbox);
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function initMasonry() {
        if (!gridEl || typeof Masonry === 'undefined') return;
        if (typeof imagesLoaded !== 'undefined') {
            imagesLoaded(gridEl, function () {
                masonry = new Masonry(gridEl, {
                    itemSelector: '.gallery-item:not(.hidden)',
                    columnWidth: '.gallery-grid-sizer',
                    gutter: 16,
                    percentPosition: true,
                    transitionDuration: '0.4s'
                });
            });
        } else {
            masonry = new Masonry(gridEl, {
                itemSelector: '.gallery-item:not(.hidden)',
                columnWidth: '.gallery-grid-sizer',
                gutter: 16,
                percentPosition: true,
                transitionDuration: '0.4s'
            });
        }
    }

    function onResize() {
        if (masonry && typeof masonry.layout === 'function') {
            masonry.layout();
        }
    }

    if (filters.length) {
        filters.forEach(function (btn) {
            btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
            btn.addEventListener('click', function () {
                setActiveFilter(btn);
                filterGrid(btn.getAttribute('data-filter'));
            });
        });
    }

    items.forEach(function (item) {
        var inner = item.querySelector('.gallery-item-inner');
        var label = item.querySelector('.gallery-item-label');
        if (!inner) return;

        inner.setAttribute('tabindex', '0');
        inner.setAttribute('role', 'button');
        if (label) {
            inner.setAttribute('aria-label', 'View larger image: ' + label.textContent);
        }

        inner.addEventListener('click', function () {
            refreshVisibleItems();
            var idx = visibleItems.indexOf(item);
            openLightbox(idx >= 0 ? idx : 0);
        });

        inner.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                refreshVisibleItems();
                var idx = visibleItems.indexOf(item);
                openLightbox(idx >= 0 ? idx : 0);
            }
        });
    });

    if (overlay) overlay.addEventListener('click', closeLightbox);
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);

    document.addEventListener('keydown', function (e) {
        trapFocus(e);
        if (!lightbox || !lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMasonry);
    } else {
        initMasonry();
    }

    window.addEventListener('resize', function () {
        clearTimeout(window._galleryResizeTimer);
        window._galleryResizeTimer = setTimeout(onResize, 150);
    });
})();
