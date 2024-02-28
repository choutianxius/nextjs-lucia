import sqlite from 'better-sqlite3';

const SQLITE_DB_PATH = process.env?.SQLITE_DB_PATH ?? './db/main.db';

const db = sqlite('./db/main.db');
db.pragma('journal_mode = WAL');

export default db;
