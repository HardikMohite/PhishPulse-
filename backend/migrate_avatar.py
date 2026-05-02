import sqlite3
import os

# Adjust this path to where your SQLite db file actually is
DB_PATH = os.path.join(os.path.dirname(__file__), "phishpulse.db")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Check if columns already exist before adding
cursor.execute("PRAGMA table_info(users)")
columns = [col[1] for col in cursor.fetchall()]

if "avatar_seed" not in columns:
    cursor.execute(
        "ALTER TABLE users ADD COLUMN avatar_seed VARCHAR DEFAULT 'agent-one'"
    )
    print("Added avatar_seed column")
else:
    print("avatar_seed already exists")

if "avatar_style" not in columns:
    cursor.execute(
        "ALTER TABLE users ADD COLUMN avatar_style VARCHAR DEFAULT 'avataaars'"
    )
    print("Added avatar_style column")
else:
    print("avatar_style already exists")

conn.commit()
conn.close()
print("Migration complete")
