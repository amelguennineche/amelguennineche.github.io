(function () {
    'use strict';

    var form = document.getElementById('reservation-form');
    var tripSelect = document.getElementById('trip');
    var tripSummary = document.getElementById('trip-summary');
    var formStatus = document.getElementById('form-status');
    var participantsField = document.getElementById('participants-field');
    var participantsInput = document.getElementById('participants');
    var divingFields = document.getElementById('diving-information');
    var liveaboardFields = document.getElementById('liveaboard-information');
    var certificationInput = document.getElementById('certificationLevel');
    var loggedDivesInput = document.getElementById('loggedDives');
    var diversInput = document.getElementById('divers');
    var liveaboardRouteName = document.getElementById('liveaboard-route-name');

    var fieldMap = [
        { input: 'fullname', error: 'error-fullname' },
        { input: 'email', error: 'error-email' },
        { input: 'phone', error: 'error-phone' },
        { input: 'country', error: 'error-country' },
        { input: 'participants', error: 'error-participants' },
        { input: 'trip', error: 'error-trip' },
        { input: 'date', error: 'error-date' },
        { input: 'divers', error: 'error-divers' }
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
            price: '450 €',
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
            price: '250–350 €',
            type: 'PADI Course'
        },
        'efr': {
            name: 'Emergency First Response (EFR)',
            location: 'Red Sea',
            duration: '1 day',
            price: '450 €',
            type: 'PADI Course'
        },
        'rescue': {
            name: 'Rescue Diver',
            location: 'Red Sea',
            duration: '3 days',
            price: '300–400 €',
            type: 'PADI Course'
        },
        'divemaster': {
            name: 'Divemaster',
            location: 'Red Sea',
            duration: '2–4 weeks',
            price: '700–1200 €',
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
        },
        'classic-north': {
            name: 'Classic North Red Sea Safari',
            location: 'Sharm El Sheikh',
            duration: '1 week',
            price: 'Starting from €1300 per person',
            type: 'Liveaboard'
        },
        'south-shark': {
            name: 'South Red Sea Shark & Adventure Safari',
            location: 'Hurghada',
            duration: '1 week',
            price: 'Starting from €1400 per person',
            type: 'Liveaboard'
        }
    };

    function getExperienceType(data) {
        if (!data) return '';
        if (data.experienceType) return data.experienceType;
        var typeMap = {
            'Daily Trip': 'daily-trip',
            'Professional Dive': 'professional-dive',
            'Camping': 'camping',
            'Safari': 'safari',
            'Activity': 'activity',
            'PADI Course': 'padi-course',
            'PADI Specialty': 'padi-specialty',
            'Liveaboard': 'liveaboard'
        };
        return typeMap[data.type] || '';
    }

    function setFieldEnabled(field, enabled, required) {
        if (!field) return;
        field.disabled = !enabled;
        if (required) {
            field.setAttribute('required', '');
            field.setAttribute('aria-required', 'true');
        } else {
            field.removeAttribute('required');
            field.removeAttribute('aria-required');
        }
        if (!enabled) {
            field.removeAttribute('aria-invalid');
        }
    }

    function updateConditionalFields() {
        var slug = tripSelect ? tripSelect.value : '';
        var trip = slug && tripData[slug] ? tripData[slug] : null;
        var type = getExperienceType(trip);
        var isDiving = type === 'padi-course' || type === 'padi-specialty';
        var isLiveaboard = type === 'liveaboard';

        if (divingFields) divingFields.hidden = true;
        if (liveaboardFields) liveaboardFields.hidden = true;
        setFieldEnabled(certificationInput, false, false);
        setFieldEnabled(loggedDivesInput, false, false);
        setFieldEnabled(diversInput, false, false);

        if (isLiveaboard) {
            if (liveaboardFields) liveaboardFields.hidden = false;
            if (liveaboardRouteName) liveaboardRouteName.textContent = trip.name;
            setFieldEnabled(diversInput, true, true);
            if (participantsField) participantsField.hidden = true;
            setFieldEnabled(participantsInput, false, false);
            setFieldState('participants', 'error-participants', '');
            setFieldState('divers', 'error-divers', '');
            return;
        }

        if (isDiving) {
            if (divingFields) divingFields.hidden = false;
            setFieldEnabled(certificationInput, true, false);
            setFieldEnabled(loggedDivesInput, true, false);
            if (participantsField) participantsField.hidden = true;
            setFieldEnabled(participantsInput, false, false);
            setFieldState('participants', 'error-participants', '');
            return;
        }

        if (participantsField) participantsField.hidden = false;
        setFieldEnabled(participantsInput, true, true);
    }

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
        updateConditionalFields();
    }

    function initTripFromUrl() {
        var tripId = getQueryParam('trip');
        if (tripId && tripData[tripId]) {
            showTripSummary(tripId);
            return;
        }
        if (tripSelect) tripSelect.value = '';
        if (tripSummary) tripSummary.hidden = true;
        updateConditionalFields();
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

    var isSubmitting = false;
    var defaultSubmitLabel = 'Confirm Booking Request';

    function fieldValue(id) {
        var el = document.getElementById(id);
        return el && typeof el.value === 'string' ? el.value.trim() : '';
    }

    function parseCount(value) {
        var n = parseInt(value, 10);
        return isNaN(n) ? NaN : n;
    }

    function buildBookingPayload() {
        var trip = fieldValue('trip');
        var selectedTrip = trip && tripData[trip] ? tripData[trip] : null;
        var experienceType = getExperienceType(selectedTrip);
        var payload = {
            fullname: fieldValue('fullname'),
            email: fieldValue('email'),
            phone: fieldValue('phone'),
            country: fieldValue('country'),
            trip: trip,
            date: fieldValue('date')
        };
        var message = fieldValue('message');
        if (message) {
            payload.message = message;
        }

        if (experienceType === 'liveaboard') {
            payload.divers = parseCount(fieldValue('divers'));
        } else if (experienceType === 'padi-course' || experienceType === 'padi-specialty') {
            var certificationLevel = fieldValue('certificationLevel');
            if (certificationLevel) {
                payload.certificationLevel = certificationLevel;
            }
            var loggedDivesRaw = fieldValue('loggedDives');
            if (loggedDivesRaw !== '') {
                payload.loggedDives = parseCount(loggedDivesRaw);
            }
            // Worker still requires participants for non-liveaboard trips.
            payload.participants = 1;
        } else {
            payload.participants = parseCount(fieldValue('participants'));
        }

        return payload;
    }

    function serverErrorMessage(data, fallback) {
        if (data && typeof data.error === 'string' && data.error.trim()) {
            return data.error.trim();
        }
        return fallback;
    }

    function validateForm() {
        var fullname = document.getElementById('fullname');
        var email = document.getElementById('email');
        var phone = document.getElementById('phone');
        var country = document.getElementById('country');
        var date = document.getElementById('date');
        var selectedTrip = tripSelect && tripData[tripSelect.value] ? tripData[tripSelect.value] : null;
        var experienceType = getExperienceType(selectedTrip);
        var isLiveaboard = experienceType === 'liveaboard';
        var isDiving = experienceType === 'padi-course' || experienceType === 'padi-specialty';
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
        if (!country || !country.value) {
            setFieldState('country', 'error-country', 'Please select your country.');
            firstInvalid = firstInvalid || country;
            valid = false;
        }
        if (!tripSelect || !tripSelect.value || !tripData[tripSelect.value]) {
            setFieldState('trip', 'error-trip', 'Please select an experience.');
            firstInvalid = firstInvalid || tripSelect;
            valid = false;
        }
        if (isLiveaboard) {
            var diversCount = diversInput ? parseInt(diversInput.value, 10) : NaN;
            if (!diversInput || diversInput.disabled || !diversInput.value || isNaN(diversCount) || diversCount < 1) {
                setFieldState('divers', 'error-divers', 'Please enter at least 1 diver.');
                firstInvalid = firstInvalid || diversInput;
                valid = false;
            }
        } else if (!isDiving) {
            var participantsCount = participantsInput ? parseInt(participantsInput.value, 10) : NaN;
            if (!participantsInput || participantsInput.disabled || !participantsInput.value || isNaN(participantsCount) || participantsCount < 1) {
                setFieldState('participants', 'error-participants', 'Please enter at least 1 participant.');
                firstInvalid = firstInvalid || participantsInput;
                valid = false;
            } else if (participantsCount > 20) {
                setFieldState('participants', 'error-participants', 'Please enter no more than 20 participants.');
                firstInvalid = firstInvalid || participantsInput;
                valid = false;
            }
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
        field.addEventListener('change', function () {
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
            if (isSubmitting) return;
            if (!validateForm()) return;

            var submitBtn = form.querySelector('.book-submit');
            var originalLabel = submitBtn && submitBtn.textContent
                ? submitBtn.textContent
                : defaultSubmitLabel;
            var payload = buildBookingPayload();

            isSubmitting = true;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending request…';
            }
            announceStatus('Sending your booking request…');

            fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(function (response) {
                    return response.json().then(function (data) {
                        return { response: response, data: data };
                    }).catch(function () {
                        return { response: response, data: null };
                    });
                })
                .then(function (result) {
                    if (result.response.ok && result.data && result.data.ok === true) {
                        if (submitBtn) {
                            submitBtn.textContent = 'Request sent — we\'ll confirm soon!';
                            submitBtn.disabled = true;
                        }
                        announceStatus('Your booking request was sent. We will confirm your reservation as soon as possible.');
                        return;
                    }
                    isSubmitting = false;
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalLabel;
                    }
                    announceStatus(serverErrorMessage(
                        result.data,
                        'We could not send your request. Please try again.'
                    ));
                })
                .catch(function () {
                    isSubmitting = false;
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalLabel;
                    }
                    announceStatus('We could not send your request. Please try again.');
                });
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
            } else {
                if (tripSummary) tripSummary.hidden = true;
                updateConditionalFields();
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
