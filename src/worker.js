/**
 * Booking API for diving-preview.
 * Catalog slugs and types copied from js/book.js tripData (do not invent trips).
 * Country and certification values copied from pages/book-now.html.
 */

const MAX_BODY_BYTES = 8192;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const COUNTRIES = {
    Algeria: true,
    Australia: true,
    Austria: true,
    Belgium: true,
    Brazil: true,
    Canada: true,
    China: true,
    'Czech Republic': true,
    Denmark: true,
    Egypt: true,
    Finland: true,
    France: true,
    Germany: true,
    Greece: true,
    India: true,
    Ireland: true,
    Italy: true,
    Japan: true,
    Netherlands: true,
    Norway: true,
    Poland: true,
    Portugal: true,
    'Saudi Arabia': true,
    Spain: true,
    Sweden: true,
    Switzerland: true,
    'United Arab Emirates': true,
    'United Kingdom': true,
    'United States': true,
    Other: true
};

const CERTIFICATION_LEVELS = {
    'No certification': true,
    'Open Water Diver': true,
    'Advanced Open Water Diver': true,
    'Rescue Diver': true,
    Divemaster: true,
    'Other / Equivalent': true
};

const TRIP_CATALOG = {
    'ras-mohammed': { type: 'Daily Trip' },
    'tiran-island': { type: 'Daily Trip' },
    dahab: { type: 'Daily Trip' },
    'ss-thistlegorm': { type: 'Professional Dive' },
    'camping-ras-mohammed': { type: 'Camping' },
    'colored-canyon': { type: 'Safari' },
    'bedouin-desert-dinner': { type: 'Safari' },
    'quad-camel-safari': { type: 'Safari' },
    'mount-sinai-st-catherine': { type: 'Safari' },
    'snorkeling-fun': { type: 'Activity' },
    'open-water': { type: 'PADI Course' },
    adventure: { type: 'PADI Course' },
    'advanced-open-water': { type: 'PADI Course' },
    efr: { type: 'PADI Course' },
    rescue: { type: 'PADI Course' },
    divemaster: { type: 'PADI Course' },
    'master-scuba-diver': { type: 'PADI Course' },
    'deep-diver': { type: 'PADI Specialty' },
    'enriched-air-nitrox': { type: 'PADI Specialty' },
    'wreck-diver': { type: 'PADI Specialty' },
    'equipment-specialist': { type: 'PADI Specialty' },
    'emergency-oxygen-provider': { type: 'PADI Specialty' },
    'dive-against-debris': { type: 'PADI Specialty' },
    'classic-north': { type: 'Liveaboard' },
    'south-shark': { type: 'Liveaboard' }
};

const TYPE_MAP = {
    'Daily Trip': 'daily-trip',
    'Professional Dive': 'professional-dive',
    Camping: 'camping',
    Safari: 'safari',
    Activity: 'activity',
    'PADI Course': 'padi-course',
    'PADI Specialty': 'padi-specialty',
    Liveaboard: 'liveaboard'
};

function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {
        status: status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    });
}

function errorResponse(status, message) {
    return jsonResponse({ ok: false, error: message }, status);
}

function asString(value, maxLen) {
    if (value == null) return '';
    if (typeof value !== 'string') return null;
    var trimmed = value.trim();
    if (trimmed.length > maxLen) return null;
    return trimmed;
}

function asOptionalInt(value, min, max) {
    if (value == null || value === '') return null;
    var n = typeof value === 'number' ? value : parseInt(String(value), 10);
    if (!Number.isFinite(n) || n !== Math.floor(n)) return undefined;
    if (n < min || n > max) return undefined;
    return n;
}

function getExperienceType(tripType) {
    return TYPE_MAP[tripType] || '';
}

function validateBooking(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return { error: 'Invalid JSON body.' };
    }

    var fullname = asString(payload.fullname, 120);
    var email = asString(payload.email, 254);
    var phone = asString(payload.phone, 40);
    var country = asString(payload.country, 80);
    var trip = asString(payload.trip, 80);
    var preferredDate = asString(payload.date, 10);
    var message = payload.message == null || payload.message === ''
        ? ''
        : asString(payload.message, 2000);

    if (fullname == null || !fullname) return { error: 'Please enter your full name.' };
    if (email == null || !email) return { error: 'Please enter your email address.' };
    if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' };
    if (phone == null || !phone) return { error: 'Please enter your phone number.' };
    if (country == null || !country || !COUNTRIES[country]) {
        return { error: 'Please select your country.' };
    }
    if (trip == null || !trip || !TRIP_CATALOG[trip]) {
        return { error: 'Please select a valid experience.' };
    }
    if (preferredDate == null || !DATE_RE.test(preferredDate)) {
        return { error: 'Please select your preferred date.' };
    }
    if (message == null) return { error: 'Message is too long.' };

    var catalogEntry = TRIP_CATALOG[trip];
    var experienceType = getExperienceType(catalogEntry.type);
    var isLiveaboard = experienceType === 'liveaboard';
    var isDiving = experienceType === 'padi-course' || experienceType === 'padi-specialty';

    var participants = null;
    var divers = null;

    if (isLiveaboard) {
        divers = asOptionalInt(payload.divers, 1, 50);
        if (divers == null || divers === undefined) {
            return { error: 'Please enter at least 1 diver.' };
        }
    } else {
        participants = asOptionalInt(payload.participants, 1, 20);
        if (participants == null || participants === undefined) {
            return { error: 'Please enter a valid number of participants.' };
        }
    }

    var certificationLevel = null;
    var loggedDives = null;

    if (isDiving) {
        if (payload.certificationLevel) {
            certificationLevel = asString(payload.certificationLevel, 80);
            if (!certificationLevel || !CERTIFICATION_LEVELS[certificationLevel]) {
                return { error: 'Please choose a valid certification level.' };
            }
        }
        if (payload.loggedDives != null && payload.loggedDives !== '') {
            loggedDives = asOptionalInt(payload.loggedDives, 0, 100000);
            if (loggedDives === undefined) {
                return { error: 'Please enter a valid number of logged dives.' };
            }
        }
    }

    return {
        data: {
            fullname: fullname,
            email: email,
            phone: phone,
            country: country,
            trip: trip,
            tripType: catalogEntry.type,
            preferredDate: preferredDate,
            participants: participants,
            divers: divers,
            certificationLevel: certificationLevel,
            loggedDives: loggedDives,
            message: message || null
        }
    };
}

async function handleCreateBooking(request, env) {
    var contentType = request.headers.get('content-type') || '';
    if (contentType.indexOf('application/json') === -1) {
        return errorResponse(415, 'Content-Type must be application/json.');
    }

    var declaredLength = request.headers.get('content-length');
    if (declaredLength && Number(declaredLength) > MAX_BODY_BYTES) {
        return errorResponse(413, 'Request too large.');
    }

    var raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
        return errorResponse(413, 'Request too large.');
    }

    var payload;
    try {
        payload = JSON.parse(raw);
    } catch (err) {
        return errorResponse(400, 'Invalid JSON body.');
    }

    var result = validateBooking(payload);
    if (result.error) {
        return errorResponse(400, result.error);
    }

    if (!env.DB) {
        return errorResponse(500, 'Database binding is not configured.');
    }

    var row = result.data;
    var insert = await env.DB.prepare(
        'INSERT INTO bookings (status, fullname, email, phone, country, trip, trip_type, preferred_date, participants, divers, certification_level, logged_dives, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
        .bind(
            'pending',
            row.fullname,
            row.email,
            row.phone,
            row.country,
            row.trip,
            row.tripType,
            row.preferredDate,
            row.participants,
            row.divers,
            row.certificationLevel,
            row.loggedDives,
            row.message
        )
        .run();

    return jsonResponse(
        {
            ok: true,
            id: insert.meta && insert.meta.last_row_id != null ? insert.meta.last_row_id : null
        },
        201
    );
}

export default {
    async fetch(request, env) {
        var url = new URL(request.url);

        if (!url.pathname.startsWith('/api/')) {
            return new Response('Not found', { status: 404 });
        }

        if (url.pathname === '/api/bookings') {
            if (request.method === 'POST') {
                try {
                    return await handleCreateBooking(request, env);
                } catch (err) {
                    return errorResponse(500, 'Unable to save booking request.');
                }
            }
            return errorResponse(405, 'Method not allowed.');
        }

        return errorResponse(404, 'Not found.');
    }
};
