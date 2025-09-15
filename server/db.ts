import 'dotenv/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

// Use a local SQLite file (creates if doesn't exist)
const sqlite = new Database('./local.db');
export const db = drizzle({ client: sqlite, schema });
