---
timestamp: 'Sat Oct 18 2025 22:59:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_225952.1bc0cce6.md]]'
content_id: 55576f3c99c3b24c3c1c7fbf14ef4ac9c16103e3397c410a7f85ff374effb423
---

# file: src/utils/database.ts

```typescript
import { MongoClient, Db } from "npm:mongodb";
import { ID } from "./types.ts";

let _db: Db | null = null;
let _client: MongoClient | null = null;

/**
 * Initializes and returns a MongoDB database connection.
 * It reads connection details from environment variables (`MONGO_URI`, `MONGO_DB_NAME`).
 * If a connection already exists, it returns the existing one.
 * @returns A tuple containing the Db instance and the MongoClient instance.
 */
export async function getDb(): Promise<[Db, MongoClient]> {
  if (_db && _client) {
    return [_db, _client];
  }

  // Set default environment variables for local development/testing if not already set
  if (!Deno.env.get("MONGO_URI")) {
    Deno.env.set("MONGO_URI", "mongodb://localhost:27017");
  }
  if (!Deno.env.get("MONGO_DB_NAME")) {
    Deno.env.set("MONGO_DB_NAME", "nibble_concept_db");
  }

  const mongoUri = Deno.env.get("MONGO_URI") as string;
  const dbName = Deno.env.get("MONGO_DB_NAME") as string;

  _client = new MongoClient(mongoUri);
  await _client.connect();
  _db = _client.db(dbName);

  console.log(`Connected to MongoDB: ${mongoUri}, Database: ${dbName}`);
  return [_db, _client];
}

/**
 * Generates a fresh, unique identifier suitable for use as an ID.
 * This uses a simple string prefix and a random alphanumeric suffix.
 * @returns A new branded ID.
 */
export function freshID(): ID {
  return `id:${Math.random().toString(36).substring(2, 15)}` as ID;
}

/**
 * Closes the MongoDB client connection if it's open.
 */
export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.close();
    _client = null;
    _db = null;
    console.log("MongoDB connection closed.");
  }
}
```

The `Version` concept depends on `Recipe` (to verify `baseRecipe` existence and owner) and `VersionDraft` (for AI-assisted drafting). We'll provide a minimal `RecipeConcept` stub here, and implement `VersionDraftConcept` next.
