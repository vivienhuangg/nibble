import { getDb } from "./src/utils/database.ts";

const [db, client] = await getDb();

console.log("Clearing database...");

// Get all collection names
const collections = await db.listCollections().toArray();

// Drop each collection
for (const collection of collections) {
  console.log(`Dropping collection: ${collection.name}`);
  await db.collection(collection.name).drop();
}

console.log("Database cleared!");
await client.close();
