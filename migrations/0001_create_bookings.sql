CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL DEFAULT 'pending',
    fullname TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    country TEXT NOT NULL,
    trip TEXT NOT NULL,
    trip_type TEXT,
    preferred_date TEXT NOT NULL,
    participants INTEGER,
    divers INTEGER,
    certification_level TEXT,
    logged_dives INTEGER,
    message TEXT
);
