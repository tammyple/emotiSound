
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("app.db")

SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT UNIQUE,
    password   TEXT,                  -- NULL for guests
    is_guest   INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_choices (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    timestamp  DATETIME DEFAULT CURRENT_TIMESTAMP,
    intention  TEXT,
    mood       TEXT,
    style      TEXT,
    quadrant   TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    q1         TEXT,
    q2         TEXT,
    timestamp  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""

def main():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(SCHEMA)
        print(f"Initialized {DB_PATH.name} with tables: users, user_choices, feedback")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
