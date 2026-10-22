import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import { SCHEMA_SQL } from "./schema";

let dbInstance: DatabaseSync | null = null;

export function getDatabasePath(): string {
  const customPath = process.env.DATABASE_PATH || "./data/relasy.db";
  return path.isAbsolute(customPath)
    ? customPath
    : path.resolve(process.cwd(), customPath);
}

export function getDatabase(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getDatabasePath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);

  // Enable WAL mode and foreign key constraints for performance and data integrity
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  // Run schema initialization
  db.exec(SCHEMA_SQL);

  dbInstance = db;
  return dbInstance;
}

/**
 * Creates an isolated in-memory database instance for testing.
 */
export function createTestDatabase(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA_SQL);
  return db;
}
