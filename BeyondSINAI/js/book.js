(function () {
    'use strict';

    var form = document.getElementById('reservation-form');
    var tripSelect = document.getElementById('trip');
    var tripSummary = document.getElementById('trip-summary');
    var formStatus = document.getElementById('form-status');

    var fieldMap = [
        { input: 'fullname', error: 'error-fullname' },
        { input: 'email', error: 'error-email' },
        { input: 'phone', error: 'error-phone' },
        { input: 'participants', error: 'error-participants' },
        { input: 'trip', error: 'error-trip' },
        { input: 'date', error: 'error-date' }
    ];

    var tripData = {
        'ras-mohammed': {
            name: 'Ras Mohammed One-Day Diving & Snorkeling Adventure',
            location: 'Ras Mohammed National Park',
            duration: '1 day',
            price: 'From €85 per person',
            type: 'Daily Trip'
        },
        'tiran-island': {
            name: 'Tiran Island One-Day Diving & Snorkeling Adventure',
            location: 'Tiran Island',
            duration: '1 day',
            price: 'From €90 per person',
            type: 'Daily Trip'
        },
        'dahab': {
            name: 'Dahab Day Trip: Diving & Sunset Experience',
            location: 'Dahab',
            duration: '1 day',
            price: 'From €75 per person',
            type: 'Daily Trip'
        },
        'ss-thistlegorm': {
            name: 'SS Thistlegorm Professional Diving Adventure',
            location: 'Gulf of Suez',
            duration: '1–2 days',
            price: 'From €180 per person',
            type: 'Professional Dive'
        },
        'camping-ras-mohammed': {
            name: 'Camping & Diving Experience in Ras Mohammed',
            location: 'Ras Mohammed National Park',
            duration: 'Multi-day',
            price: 'Contact us',
            type: 'Camping'
        },
        'colored-canyon': {
            name: 'Colored Canyon',
            location: 'South Sinai Desert',
            duration: 'Half day',
            price: 'Contact us',
            type: 'Safari'
        },
        'bedouin-desert-dinner': {
            name: 'Bedouin Desert Dinner',
            location: 'South Sinai Desert',
            duration: 'Evening',
            price: 'Contact us',
            type: 'Safari'
        },
        'quad-camel-safari': {
            name: 'Quad & Camel Safari',
            location: 'South Sinai Desert',
            duration: 'Half day',
            price: 'Contact us',
            type: 'Safari'
        },
        'mount-sinai-st-catherine': {
            name: 'Mount Sinai & St. Catherine',
            location: 'Mount Sinai / St. Catherine',
            duration: 'Overnight',
            price: 'Contact us',
            type: 'Safari'
        },
        'snorkeling-fun': {
            name: 'Snorkeling & Fun',
            location: 'Red Sea',
            duration: 'Flexible',
            price: 'Contact us',
            type: 'Activity'
        },
        'open-water': {
            name: 'Open Water Diver',
            location: 'Red Sea',
            duration: '3–4 days',
            price: '€300–400',
            type: 'PADI Course'
        },
        'adventure': {
            name: 'Adventure Diver',
            location: 'Red Sea',
            duration: '1–2 days',
            price: 'Contact us',
            type: 'PADI Course'
        },
        'advanced-open-water': {
            name: 'Advanced Open Water Diver',
            location: 'Red Sea',
            duration: '2 days',
            price: '€250–350',
            type: 'PADI Course'
        },
        'efr': {
            name: 'Emergency First Response (EFR)',
            location: 'Red Sea',
            duration: '1 day',
            price: '€450',
            type: 'PADI Course'
        },
        'rescue': {
            name: 'Rescue Diver',
            location: 'Red Sea',
            duration: '3 days',
            price: '€300–400',
            type: 'PADI Course'
        },
        'divemaster': {
            name: 'Divemaster',
            location: 'Red Sea',
            duration: '2–4 weeks',
            price: '€700–1200',
            type: 'PADI Course'
        },
        'master-scuba-diver': {
            name: 'Master Scuba Diver',
            location: 'Red Sea',
            duration: 'Experience-based',
            price: 'Contact us',
            type: 'PADI Course'
        },
        'deep-diver': {
            name: 'Deep Diver',
            location: 'Red Sea',
            duration: '2 days',
            price: 'Contact us',
            type: 'PADI Specialty'
        },
        'enriched-air-nitrox': {
            name: 'Enriched Air Nitrox',
            location: 'Red Sea',
            duration: '1 day',
            price: 'Contact us',
            type: 'PADI Specialty'
        },
        'wreck-diver': {
            name: 'Wreck Diver',
            location: 'Red Sea',
            duration: '2–3 days',
            price: 'Contact us',
            type: 'PADI Specialty'
        },
        'equipment-specialist': {
            name: 'Equipment Specialist',
            location: 'Red Sea',
            duration: '1 day',
            price: 'Contact us',
            type: 'PADI Specialty'
        },
        'emergency-oxygen-provider': {
            name: 'Emergency Oxygen Provider',
            location: 'Red Sea',
            duration: 'Half day',
            price: 'Contact us',
            type: 'PADI Specialty'
        },
        'dive-against-debris': {
            name: 'Dive Against Debris',
            location: 'Red Sea',
            duration: '1 day',
            price: 'Contact us',
            type: 'PADI Specialty'
        }
    };

    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    function showTripSummary(tripId) {
        var data = tripData[tripId];
        if (!data || !tripSummary) return;
        document.getElementById('trip-summary-name').textContent = data.name;
        document.getElementById('trip-summary-location').textContent = data.location;
        document.getElementById('trip-summary-duration').textContent = data.duration;
        document.getElementById('trip-summary-price').textContent = data.price;
        document.getElementById('trip-summary-type').textContent = data.type;
        tripSummary.hidden = false;
        if (tripSelect) tripSelect.value = tripId;
    }

    function initTripFromUrl() {
        var tripId = getQueryParam('trip');
        if (tripId && tripData[tripId]) showTripSummary(tripId);
    }

    function showError(id, message) {
        var el = document.getElementById(id);
        if (el) el.textContent = message || '';
    }

    function setFieldState(inputId, errorId, message) {
        var field = document.getElementById(inputId);
        showError(errorId, message);
        if (!field) return;
        if (message) {
            field.setAttribute('aria-invalid', 'true');
        } else {
            field.removeAttribute('aria-invalid');
        }
    }

    function clearFieldStates() {
        fieldMap.forEach(function (item) {
            setFieldState(item.input, item.error, '');
        });
    }

    function announceStatus(message) {
        if (formStatus) formStatus.textContent = message;
    }

    function validateForm() {
        var fullname = document.getElementById('fullname');
        var email = document.getElementById('email');
        var phone = document.getElementById('phone');
        var participants = document.getElementById('participants');
        var date = document.getElementById('date');
        var valid = true;
        var firstInvalid = null;

        clearFieldStates();
        announceStatus('');

        if (!fullname || !fullname.value.trim()) {
            setFieldState('fullname', 'error-fullname', 'Please enter your full name.');
            firstInvalid = firstInvalid || fullname;
            valid = false;
        }
        if (!email || !email.value.trim()) {
            setFieldState('email', 'error-email', 'Please enter your email address.');
            firstInvalid = firstInvalid || email;
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            setFieldState('email', 'error-email', 'Please enter a valid email address.');
            firstInvalid = firstInvalid || email;
            valid = false;
        }
        if (!phone || !phone.value.trim()) {
            setFieldState('phone', 'error-phone', 'Please enter your phone number.');
            firstInvalid = firstInvalid || phone;
            valid = false;
        }
        if (!participants || !participants.value || parseInt(participants.value, 10) < 1) {
            setFieldState('participants', 'error-participants', 'Please enter at least 1 participant.');
            firstInvalid = firstInvalid || participants;
            valid = false;
        }
        if (!tripSelect || !tripSelect.value) {
            setFieldState('trip', 'error-trip', 'Please select an experience.');
            firstInvalid = firstInvalid || tripSelect;
            valid = false;
        }
        if (!date || !date.value) {
            setFieldState('date', 'error-date', 'Please select your preferred date.');
            firstInvalid = firstInvalid || date;
            valid = false;
        }

        if (!valid) {
            announceStatus('There are errors in the form. Please review the highlighted fields.');
            if (firstInvalid && typeof firstInvalid.focus === 'function') {
                firstInvalid.focus();
            }
        }

        return valid;
    }

    fieldMap.forEach(function (item) {
        var field = document.getElementById(item.input);
        if (!field) return;
        field.setAttribute('aria-describedby', item.error);
        field.addEventListener('input', function () {
            if (field.getAttribute('aria-invalid') === 'true') {
                setFieldState(item.input, item.error, '');
            }
        });
        field.addEventListener('blur', function () {
            if (field.hasAttribute('required') && !field.value.trim()) {
                return;
            }
            setFieldState(item.input, item.error, '');
        });
    });

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!validateForm()) return;
            var submitBtn = form.querySelector('.book-submit');
            if (submitBtn) {
                submitBtn.textContent = 'Request sent — we\'ll confirm soon!';
                submitBtn.disabled = true;
                announceStatus('Your booking request was sent. We will confirm your reservation as soon as possible.');
            }
        });
    }

    var dateInput = document.getElementById('date');
    if (dateInput) {
        var today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    if (tripSelect) {
        tripSelect.addEventListener('change', function () {
            if (tripSelect.value && tripData[tripSelect.value]) {
                showTripSummary(tripSelect.value);
            } else if (tripSummary) {
                tripSummary.hidden = true;
            }
        });
    }

    function initConfidenceSidebar() {
        var details = document.getElementById('confidence-details');
        if (!details) return;

        var desktopQuery = window.matchMedia('(min-width: 901px)');

        function syncPanelState() {
            if (desktopQuery.matches) {
                details.setAttribute('open', '');
            }
        }

        syncPanelState();
        if (typeof desktopQuery.addEventListener === 'function') {
            desktopQuery.addEventListener('change', syncPanelState);
        } else if (typeof desktopQuery.addListener === 'function') {
            desktopQuery.addListener(syncPanelState);
        }
    }

    initConfidenceSidebar();
    initTripFromUrl();
})();
