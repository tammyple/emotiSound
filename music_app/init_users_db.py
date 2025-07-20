import sqlite3
import os

def create_users_db():
    db_path = os.path.join(os.path.dirname(__file__), "users.db")

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()
    print("users.db initialized with 'users' table.")

if __name__ == "__main__":
    create_users_db()
