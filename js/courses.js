(function () {
    'use strict';

    var courseData = {
        'open-water': {
            title: 'Open Water Diver',
            tagline: 'Your first PADI certification. The starting point for every diver.',
            badges: { level: 'Beginner', duration: '3–4 days', price: '€300–400' },
            overview: [
                'Learn essential scuba skills step by step.',
                'Dive with a buddy up to 18 metres.',
                'Earn a certification recognised worldwide.'
            ],
            includes: [
                'PADI eLearning theory',
                'Confined water sessions',
                '4 open water dives',
                'International certification'
            ],
            requirements: [
                'No prior certification required',
                'Minimum age: 10 (Junior) or 15 (Adult)',
                'Medically fit · Basic swimming ability',
                'Format: Classroom + Confined + Open Water'
            ],
            outcome: [
                'Dive independently with a buddy.',
                'Explore reefs and dive sites worldwide.'
            ]
        },
        'advanced': {
            title: 'Advanced Open Water Diver',
            tagline: 'Five adventure dives to expand your skills and limits.',
            badges: { level: 'Intermediate', duration: '2 days', price: '€250–350' },
            overview: [
                'Complete deep and navigation dives.',
                'Choose three additional adventure dives.',
                'The natural next step after Open Water.'
            ],
            includes: [
                '5 Adventure Dives',
                'Deep dive · Navigation dive',
                'PADI eLearning',
                'International certification'
            ],
            requirements: [
                'Open Water Diver (or equivalent)',
                'Minimum age: 12 (Junior) or 15 (Adult)',
                'Medically fit for diving',
                'Format: Open Water + eLearning'
            ],
            outcome: [
                'Dive confidently up to 30 metres.',
                'Unlock more advanced sites and specialties.'
            ]
        },
        'efr': {
            title: 'Emergency First Response (EFR)',
            tagline: 'CPR and first aid — required before Rescue Diver.',
            badges: { level: 'All levels', duration: '1 day', price: '€450' },
            overview: [
                'Learn Primary and Secondary Care.',
                'Respond to emergencies on land and at sea.',
                'No in-water training required.'
            ],
            includes: [
                'Primary Care (CPR)',
                'Secondary Care (First Aid)',
                'AED and emergency assessment',
                'International certification'
            ],
            requirements: [
                'No diving certification required',
                'Open to all ages',
                'Fit to participate in CPR training',
                'Format: Classroom + Practical'
            ],
            outcome: [
                'Be ready to help in a diving emergency.',
                'Meet the Rescue Diver prerequisite.'
            ]
        },
        'rescue': {
            title: 'Rescue Diver',
            tagline: 'Prevent problems and assist divers in emergencies.',
            badges: { level: 'Advanced', duration: '3 days', price: '€300–400' },
            overview: [
                'Recognise stress before it becomes an emergency.',
                'Practise rescue scenarios in and out of the water.',
                'One of the most rewarding courses in diving.'
            ],
            includes: [
                'Confined water rescue scenarios',
                'Open water rescue exercises',
                'Emergency prevention training',
                'International certification'
            ],
            requirements: [
                'Advanced OW + valid EFR (or equivalent)',
                'Minimum age: 12 years',
                'Medically fit for diving',
                'Format: Classroom + Confined + Open Water'
            ],
            outcome: [
                'Become the diver others rely on.',
                'Foundation for professional-level training.'
            ]
        },
        'divemaster': {
            title: 'Divemaster',
            tagline: 'Your first professional PADI rating.',
            badges: { level: 'Professional', duration: '2–4 weeks', price: '€700–1200' },
            overview: [
                'Train as a dive leader in the Red Sea.',
                'Guide certified divers and assist instructors.',
                'Intensive knowledge and internship experience.'
            ],
            includes: [
                'Professional knowledge development',
                'Water skills evaluation',
                'Instructor internship',
                'Leadership and guide training'
            ],
            requirements: [
                'Rescue Diver · 5 specialties · ~50 dives',
                'Minimum age: 18 years',
                'Medically fit · Strong rescue skills',
                'Format: Classroom + Open Water + Internship'
            ],
            outcome: [
                'Launch your professional diving career.',
                'Earn the Divemaster certification.'
            ]
        }
    };

    var badgeOrder = ['level', 'duration', 'price'];

    var tripSlugMap = {
        'open-water': 'open-water',
        'advanced': 'advanced-open-water',
        'efr': 'efr',
        'rescue': 'rescue',
        'divemaster': 'divemaster'
    };

    function renderBadges(container, badges) {
        if (!container || !badges) return;
        container.innerHTML = '';
        badgeOrder.forEach(function (key) {
            if (!badges[key]) return;
            var span = document.createElement('span');
            span.className = 'course-showcase-badge';
            if (key === 'level') span.classList.add('course-showcase-badge--level');
            if (key === 'price') span.classList.add('course-showcase-badge--price');
            span.textContent = badges[key];
            container.appendChild(span);
        });
    }

    function renderLineList(container, items) {
        if (!container) return;
        container.innerHTML = '';
        if (!items || !items.length) return;
        items.forEach(function (item) {
            var li = document.createElement('li');
            li.textContent = item;
            container.appendChild(li);
        });
    }

    function renderChecklist(container, items) {
        if (!container) return;
        container.innerHTML = '';
        if (!items || !items.length) return;
        items.slice(0, 5).forEach(function (item) {
            var li = document.createElement('li');
            li.textContent = item;
            container.appendChild(li);
        });
    }

    function renderOutcome(container, lines) {
        if (!container) return;
        container.innerHTML = '';
        if (!lines) return;
        var items = Array.isArray(lines) ? lines : [lines];
        items.slice(0, 2).forEach(function (line) {
            var p = document.createElement('p');
            p.className = 'course-outcome-line';
            p.textContent = line;
            container.appendChild(p);
        });
    }

    function renderCourse(panel, courseKey, skipAnimation) {
        var data = courseData[courseKey];
        if (!data || !panel) return;

        var titleEl = panel.querySelector('.course-title');
        var taglineEl = panel.querySelector('.course-showcase-tagline');
        var badgesEl = panel.querySelector('.course-showcase-badges');
        var overviewEl = panel.querySelector('.course-overview-lines');
        var includesEl = panel.querySelector('.course-includes');
        var requirementsEl = panel.querySelector('.course-requirements');
        var outcomeEl = panel.querySelector('.course-outcome-lines');

        var ctaEl = panel.querySelector('.course-showcase-cta');

        function applyContent() {
            titleEl.textContent = data.title;
            taglineEl.textContent = data.tagline;
            renderBadges(badgesEl, data.badges);
            renderLineList(overviewEl, data.overview);
            renderChecklist(includesEl, data.includes);
            renderLineList(requirementsEl, data.requirements);
            renderOutcome(outcomeEl, data.outcome);
            if (ctaEl) {
                ctaEl.textContent = 'Book ' + data.title + ' Course';
                ctaEl.href = 'book-now.html?trip=' + (tripSlugMap[courseKey] || courseKey);
            }
            panel.style.backgroundImage = '';
            panel.classList.add('is-visible');
        }

        if (skipAnimation) {
            applyContent();
            return;
        }

        panel.classList.remove('is-visible');
        window.setTimeout(applyContent, 120);
    }

    function activateTab(tabs, panel, tab, moveFocus) {
        tabs.forEach(function (btn) {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-selected', 'false');
            btn.setAttribute('tabindex', '-1');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        panel.setAttribute('aria-labelledby', tab.id);
        renderCourse(panel, tab.getAttribute('data-course'));
        if (moveFocus) {
            tab.focus();
        }
    }

    document.querySelectorAll('.courses-path').forEach(function (pathEl) {
        var tabs = Array.prototype.slice.call(pathEl.querySelectorAll('.course-tab'));
        var panel = pathEl.querySelector('.course-panel');
        var activeTab = pathEl.querySelector('.course-tab.is-active');

        if (!panel || !tabs.length) return;

        panel.id = panel.id || ('course-panel-' + (pathEl.id || 'programs'));
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('tabindex', '0');

        tabs.forEach(function (tab) {
            var courseKey = tab.getAttribute('data-course');
            tab.id = tab.id || ('tab-' + courseKey);
            tab.setAttribute('aria-controls', panel.id);
            if (!tab.hasAttribute('aria-selected')) {
                tab.setAttribute('aria-selected', 'false');
            }
        });

        if (activeTab) {
            activeTab.setAttribute('tabindex', '0');
            tabs.forEach(function (tab) {
                if (tab !== activeTab) tab.setAttribute('tabindex', '-1');
            });
            panel.setAttribute('aria-labelledby', activeTab.id);
            renderCourse(panel, activeTab.getAttribute('data-course'), true);
        }

        tabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                activateTab(tabs, panel, tab, false);
            });

            tab.addEventListener('keydown', function (e) {
                var nextIndex = index;

                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    nextIndex = (index + 1) % tabs.length;
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    nextIndex = (index - 1 + tabs.length) % tabs.length;
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    nextIndex = 0;
                } else if (e.key === 'End') {
                    e.preventDefault();
                    nextIndex = tabs.length - 1;
                } else {
                    return;
                }

                activateTab(tabs, panel, tabs[nextIndex], true);
            });
        });
    });
})();
