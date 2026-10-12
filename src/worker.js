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

const ADMIN_COOKIE = 'bs_admin';
const SESSION_TTL_SEC = 28800;
const MAX_LOGIN_BODY_BYTES = 1024;

function jsonResponseWithCookie(body, status, cookie) {
    return new Response(JSON.stringify(body), {
        status: status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'Set-Cookie': cookie
        }
    });
}

function isHttpsRequest(request) {
    return new URL(request.url).protocol === 'https:';
}

function buildSessionCookie(value, request, maxAge) {
    var parts = [
        ADMIN_COOKIE + '=' + value,
        'HttpOnly',
        'SameSite=Strict',
        'Path=/',
        'Max-Age=' + String(maxAge)
    ];
    if (isHttpsRequest(request)) {
        parts.push('Secure');
    }
    return parts.join('; ');
}

function clearSessionCookie(request) {
    return buildSessionCookie('', request, 0);
}

function isSameOriginPost(request) {
    var origin = request.headers.get('Origin');
    if (!origin) return false;
    try {
        return new URL(origin).origin === new URL(request.url).origin;
    } catch (err) {
        return false;
    }
}

function bytesToBase64Url(buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = '';
    for (var i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
    var padded = value.replace(/-/g, '+').replace(/_/g, '/');
    var pad = padded.length % 4;
    if (pad) {
        padded += '===='.slice(pad);
    }
    var binary = atob(padded);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function constantTimeEqualBytes(a, b) {
    var len = Math.max(a.length, b.length);
    var diff = a.length ^ b.length;
    var i;
    for (i = 0; i < len; i++) {
        var av = i < a.length ? a[i] : 0;
        var bv = i < b.length ? b[i] : 0;
        diff |= av ^ bv;
    }
    return diff === 0;
}

async function importHmacKey(secret) {
    return crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
}

async function hmacSha256(secret, message) {
    var key = await importHmacKey(secret);
    return crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
}

async function passwordsMatch(provided, stored, sessionSecret) {
    if (typeof provided !== 'string' || typeof stored !== 'string') {
        return false;
    }
    var providedMac = new Uint8Array(await hmacSha256(sessionSecret, 'password:' + provided));
    var storedMac = new Uint8Array(await hmacSha256(sessionSecret, 'password:' + stored));
    return constantTimeEqualBytes(providedMac, storedMac);
}

async function createSessionToken(sessionSecret) {
    var exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
    var payload = JSON.stringify({ v: 1, exp: exp });
    var signature = bytesToBase64Url(await hmacSha256(sessionSecret, payload));
    return bytesToBase64Url(new TextEncoder().encode(payload)) + '.' + signature;
}

async function readValidSession(token, sessionSecret) {
    if (!token || token.indexOf('.') === -1) {
        return false;
    }
    var parts = token.split('.');
    if (parts.length !== 2) {
        return false;
    }
    var payloadBytes;
    var givenSig;
    try {
        payloadBytes = base64UrlToBytes(parts[0]);
        givenSig = base64UrlToBytes(parts[1]);
    } catch (err) {
        return false;
    }
    var payload = new TextDecoder().decode(payloadBytes);
    var expectedSig = new Uint8Array(await hmacSha256(sessionSecret, payload));
    if (!constantTimeEqualBytes(givenSig, expectedSig)) {
        return false;
    }
    var data;
    try {
        data = JSON.parse(payload);
    } catch (err) {
        return false;
    }
    if (!data || data.v !== 1 || typeof data.exp !== 'number') {
        return false;
    }
    return data.exp > Math.floor(Date.now() / 1000);
}

function getCookie(request, name) {
    var header = request.headers.get('Cookie');
    if (!header) return '';
    var parts = header.split(';');
    var prefix = name + '=';
    for (var i = 0; i < parts.length; i++) {
        var piece = parts[i].trim();
        if (piece.indexOf(prefix) === 0) {
            return piece.slice(prefix.length);
        }
    }
    return '';
}

async function handleAdminLogin(request, env) {
    if (!isSameOriginPost(request)) {
        return errorResponse(403, 'Forbidden.');
    }
    if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
        return errorResponse(500, 'Unable to process login.');
    }
    var contentType = request.headers.get('content-type') || '';
    if (contentType.indexOf('application/json') === -1) {
        return errorResponse(415, 'Content-Type must be application/json.');
    }
    var declaredLength = request.headers.get('content-length');
    if (declaredLength && Number(declaredLength) > MAX_LOGIN_BODY_BYTES) {
        return errorResponse(413, 'Request too large.');
    }
    var raw = await request.text();
    if (raw.length > MAX_LOGIN_BODY_BYTES) {
        return errorResponse(413, 'Request too large.');
    }
    var payload;
    try {
        payload = JSON.parse(raw);
    } catch (err) {
        return errorResponse(400, 'Invalid JSON body.');
    }
    var password = payload && typeof payload.password === 'string' ? payload.password : '';
    var matched = await passwordsMatch(password, env.ADMIN_PASSWORD, env.ADMIN_SESSION_SECRET);
    if (!matched) {
        return errorResponse(401, 'Invalid credentials.');
    }
    var token = await createSessionToken(env.ADMIN_SESSION_SECRET);
    return jsonResponseWithCookie(
        { ok: true },
        200,
        buildSessionCookie(token, request, SESSION_TTL_SEC)
    );
}

function handleAdminLogout(request) {
    if (!isSameOriginPost(request)) {
        return errorResponse(403, 'Forbidden.');
    }
    return jsonResponseWithCookie({ ok: true }, 200, clearSessionCookie(request));
}

async function requireAdminSession(request, env) {
    if (!env.ADMIN_SESSION_SECRET) {
        return errorResponse(500, 'Unable to process session.');
    }
    var token = getCookie(request, ADMIN_COOKIE);
    var valid = await readValidSession(token, env.ADMIN_SESSION_SECRET);
    if (!valid) {
        return errorResponse(401, 'Unauthorized.');
    }
    return null;
}

function isAdminPagePath(pathname) {
    return pathname === '/admin' ||
        pathname === '/admin/' ||
        pathname === '/pages/admin' ||
        pathname === '/pages/admin/' ||
        pathname === '/pages/admin.html';
}

function htmlSecurityHeaders() {
    return {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow',
        'Referrer-Policy': 'no-referrer'
    };
}

function loginPageHtml() {
    return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<meta name="robots" content="noindex, nofollow">' +
        '<title>Administration sign in | Beyond SINAI</title>' +
        '<style>' +
        'body{margin:0;font-family:Inter,system-ui,sans-serif;background:#fafaf9;color:#1a1a1a;}' +
        'main{max-width:24rem;margin:4rem auto;padding:0 1.5rem;}' +
        'h1{font-size:1.5rem;margin-bottom:1rem;}' +
        'label{display:block;font-weight:600;margin-bottom:.4rem;}' +
        'input{width:100%;box-sizing:border-box;padding:.85rem 1rem;font-size:1rem;border:1px solid #e0ddd8;border-radius:12px;}' +
        'input:focus{outline:3px solid rgba(0,105,148,.25);border-color:#006994;}' +
        'button{margin-top:1.25rem;width:100%;padding:.85rem 1rem;font-size:1rem;border:0;border-radius:12px;background:#006994;color:#fff;cursor:pointer;}' +
        'button:disabled{opacity:.7;cursor:wait;}' +
        '.error{min-height:1.4em;margin-top:.75rem;color:#c0392b;}' +
        '.status{min-height:1.4em;margin-top:.5rem;color:#5a5a5a;}' +
        '</style></head><body><main>' +
        '<h1>Administration sign in</h1>' +
        '<form id="login-form">' +
        '<label for="password">Password</label>' +
        '<input id="password" name="password" type="password" required autocomplete="current-password">' +
        '<p class="error" id="error" role="alert"></p>' +
        '<p class="status" id="status" role="status" aria-live="polite"></p>' +
        '<button type="submit" id="submit">Sign in</button>' +
        '</form>' +
        '<script>' +
        '(function(){' +
        'var form=document.getElementById("login-form");' +
        'var password=document.getElementById("password");' +
        'var error=document.getElementById("error");' +
        'var status=document.getElementById("status");' +
        'var submit=document.getElementById("submit");' +
        'form.addEventListener("submit",function(e){' +
        'e.preventDefault();' +
        'error.textContent="";' +
        'status.textContent="Signing in…";' +
        'submit.disabled=true;' +
        'fetch("/api/admin/login",{' +
        'method:"POST",' +
        'credentials:"same-origin",' +
        'headers:{"Content-Type":"application/json"},' +
        'body:JSON.stringify({password:password.value})' +
        '}).then(function(res){' +
        'if(res.ok){window.location.replace("/admin");return;}' +
        'status.textContent="";' +
        'submit.disabled=false;' +
        'error.textContent="Unable to sign in. Please try again.";' +
        '}).catch(function(){' +
        'status.textContent="";' +
        'submit.disabled=false;' +
        'error.textContent="Unable to sign in. Please try again.";' +
        '});' +
        '});' +
        '})();' +
        '</script></main></body></html>';
}

function loginPageResponse() {
    return new Response(loginPageHtml(), {
        status: 401,
        headers: htmlSecurityHeaders()
    });
}

async function handleAdminPage(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return errorResponse(405, 'Method not allowed.');
    }
    if (!env.ADMIN_SESSION_SECRET) {
        return loginPageResponse();
    }
    var token = getCookie(request, ADMIN_COOKIE);
    var valid = await readValidSession(token, env.ADMIN_SESSION_SECRET);
    if (!valid) {
        return loginPageResponse();
    }
    if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') {
        return errorResponse(500, 'Unable to load administration.');
    }
    var assetUrl = new URL('/pages/admin.html', request.url);
    var assetResponse = await env.ASSETS.fetch(new Request(assetUrl, {
        method: 'GET',
        headers: request.headers
    }));
    var headers = new Headers(assetResponse.headers);
    var security = htmlSecurityHeaders();
    Object.keys(security).forEach(function (name) {
        headers.set(name, security[name]);
    });
    return new Response(request.method === 'HEAD' ? null : assetResponse.body, {
        status: assetResponse.status,
        headers: headers
    });
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

const ADMIN_BOOKINGS_LIMIT = 100;

function mapAdminBookingRow(row) {
    if (!row || typeof row !== 'object') {
        return null;
    }
    return {
        id: row.id,
        createdAt: row.created_at,
        status: row.status,
        fullname: row.fullname,
        email: row.email,
        phone: row.phone,
        country: row.country,
        trip: row.trip,
        tripType: row.trip_type,
        preferredDate: row.preferred_date,
        participants: row.participants,
        divers: row.divers,
        certificationLevel: row.certification_level,
        loggedDives: row.logged_dives,
        message: row.message
    };
}

async function handleAdminBookingsList(env) {
    if (!env.DB) {
        return errorResponse(500, 'Database binding is not configured.');
    }
    var result = await env.DB.prepare(
        'SELECT id, created_at, status, fullname, email, phone, country, trip, trip_type, preferred_date, participants, divers, certification_level, logged_dives, message FROM bookings ORDER BY id DESC LIMIT ?'
    )
        .bind(ADMIN_BOOKINGS_LIMIT)
        .all();
    var rows = result && Array.isArray(result.results) ? result.results : [];
    var bookings = [];
    var i;
    for (i = 0; i < rows.length; i++) {
        var mapped = mapAdminBookingRow(rows[i]);
        if (mapped) {
            bookings.push(mapped);
        }
    }
    return jsonResponse({ ok: true, bookings: bookings }, 200);
}

export default {
    async fetch(request, env) {
        var url = new URL(request.url);

        if (isAdminPagePath(url.pathname)) {
            try {
                return await handleAdminPage(request, env);
            } catch (err) {
                return errorResponse(500, 'Unable to load administration.');
            }
        }

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

        if (url.pathname.startsWith('/api/admin/')) {
            if (url.pathname === '/api/admin/login') {
                if (request.method !== 'POST') {
                    return errorResponse(405, 'Method not allowed.');
                }
                try {
                    return await handleAdminLogin(request, env);
                } catch (err) {
                    return errorResponse(500, 'Unable to process login.');
                }
            }
            if (url.pathname === '/api/admin/logout') {
                if (request.method !== 'POST') {
                    return errorResponse(405, 'Method not allowed.');
                }
                try {
                    return handleAdminLogout(request);
                } catch (err) {
                    return errorResponse(500, 'Unable to process logout.');
                }
            }
            var authError = await requireAdminSession(request, env);
            if (authError) {
                return authError;
            }
            if (url.pathname === '/api/admin/session' && request.method === 'GET') {
                return jsonResponse({ ok: true }, 200);
            }
            if (url.pathname === '/api/admin/bookings') {
                if (request.method !== 'GET') {
                    return errorResponse(405, 'Method not allowed.');
                }
                try {
                    return await handleAdminBookingsList(env);
                } catch (err) {
                    return errorResponse(500, 'Unable to load bookings.');
                }
            }
            return errorResponse(404, 'Not found.');
        }

        return errorResponse(404, 'Not found.');
    }
};
