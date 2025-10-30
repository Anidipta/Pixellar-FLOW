import re
import sqlite3
from pathlib import Path
from datetime import datetime

BASE = Path(__file__).parent
SQL_FILE = BASE / 'database.sql'
DB_FILE = BASE / 'data.db'

if not SQL_FILE.exists():
    print('database.sql not found')
    raise SystemExit(1)

# Backup existing DB
if DB_FILE.exists():
    bak = BASE / f'data.db.bak.{datetime.now().strftime("%Y%m%d%H%M%S")}'
    DB_FILE.rename(bak)
    print(f'Existing DB backed up to {bak}')

sql = SQL_FILE.read_text()
# Remove dollar-quoted function bodies and plpgsql blocks
# Remove CREATE OR REPLACE FUNCTION ... LANGUAGE plpgsql; blocks
sql = re.sub(r"CREATE OR REPLACE FUNCTION[\s\S]*?LANGUAGE plpgsql;", "", sql, flags=re.IGNORECASE)
# Remove CREATE TRIGGER lines that reference those functions (best-effort: keep CREATE TRIGGER lines but they may fail)
# We'll remove remaining "CREATE TRIGGER ... FOR EACH ROW EXECUTE FUNCTION ...;" patterns
sql = re.sub(r"CREATE TRIGGER[\s\S]*?EXECUTE FUNCTION[\s\S]*?;", "", sql, flags=re.IGNORECASE)

# Basic type conversions
replacements = [
    (r"\bSERIAL\b", "INTEGER"),
    (r"\bVARCHAR\(\d+\)\b", "TEXT"),
    (r"\bDECIMAL\(\d+,\s*\d+\)\b", "NUMERIC"),
    (r"\bBOOLEAN\b", "INTEGER"),
    (r"\bTIMESTAMP\b", "TEXT"),
    (r"DEFAULT\s+CURRENT_TIMESTAMP", "DEFAULT (datetime('now'))"),
    (r"ON DELETE CASCADE", "ON DELETE CASCADE"),
]
for patt, repl in replacements:
    sql = re.sub(patt, repl, sql, flags=re.IGNORECASE)

# Remove "CREATE VIEW ... AS SELECT ... GROUP BY ...;" - SQLite supports CREATE VIEW, so keep it
# Convert "ON CONFLICT (seller_id, artwork_id) DO UPDATE SET" - SQLite uses ON CONFLICT clause at table level or use UPSERT syntax
# We'll replace the ON CONFLICT ... DO UPDATE snippet inside the function blocks (already removed), so safe.

# Remove PG-specific "ALTER TABLE ... ADD CONSTRAINT ... UNIQUE (...)" convert to CREATE UNIQUE INDEX
alter_uniques = re.findall(r"ALTER TABLE\s+(\w+)\s+ADD CONSTRAINT\s+(\w+)\s+UNIQUE\s*\(([^)]+)\);", sql, flags=re.IGNORECASE)
for table, cname, cols in alter_uniques:
    cols_clean = cols.strip()
    idx_stmt = f"CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_{table}_{cname} ON {table}({cols_clean});"
    sql += "\n" + idx_stmt + "\n"
# Remove ALTER TABLE ADD CONSTRAINT lines
sql = re.sub(r"ALTER TABLE[\s\S]*?ADD CONSTRAINT[\s\S]*?;", "", sql, flags=re.IGNORECASE)

# Ensure statements end with semicolons
stmts = [s.strip() for s in sql.split(';') if s.strip()]

conn = sqlite3.connect(DB_FILE)
cur = conn.cursor()

executed = 0
for s in stmts:
    # skip language or create function remnants
    low = s.lower()
    if low.startswith('create or replace function') or 'language plpgsql' in low:
        continue
    try:
        cur.execute(s + ';')
        executed += 1
    except Exception as e:
        print('SKIP/ERROR executing statement:', e)
        print('Statement snippet:', s[:200].replace('\n',' '))

conn.commit()

# Print tables created
cur.execute("SELECT name, type FROM sqlite_master WHERE type IN ('table','index','view') ORDER BY type, name;")
for row in cur.fetchall():
    print(row)

print(f'Executed {executed} statements (best-effort). DB at: {DB_FILE}')
conn.close()
