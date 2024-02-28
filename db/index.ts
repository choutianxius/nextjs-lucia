import sqlite from 'better-sqlite3';

// somehow, the path is relative to the base url of the project
const db = sqlite('./db/main.db');
db.pragma('journal_mode = WAL');

export default db;

export interface DBUser {
  id: string;
  username: string;
  hashed_password: string;
};
