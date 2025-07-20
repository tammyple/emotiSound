import sqlite3
import os

def create_db(db_name="moods.db"):
    if not os.path.exists(db_name):
        print(f"Creating database: {db_name}")
    else:
        print(f"Database {db_name} already exists. Ensuring table exists...")

    conn = sqlite3.connect(db_name)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS user_choices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            timestamp TEXT,
            intention TEXT,
            mood TEXT,
            style TEXT,
            quadrant TEXT
        )
    """)
    conn.commit()
    conn.close()
    print(f"Database '{db_name}' initialized successfully.")

if __name__ == "__main__":
    create_db()

