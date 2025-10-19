---
timestamp: 'Sun Oct 19 2025 01:49:02 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_014902.3b340a6d.md]]'
content_id: 6c5db0c9957064a15bcbe3820077facc6570e161805b27d84a2cf79e4dc5f2a9
---

# response:

The "Leaks detected" error in Deno tests, especially concerning "async calls to op\_read", "timers", and "TLS connection", almost always points to unclosed network connections or background processes. In the context of a MongoDB client, this means the `MongoClient` instance hasn't fully shut down all its internal resources before the test runner finishes.

While you already have `await client.close()` and a `setTimeout` delay in your `afterAll` hook, the `200ms` delay is often insufficient for the MongoDB driver to gracefully terminate all its connection pool members, heartbeat timers, and other background tasks.

Here's the most likely fix:

**Increase the `setTimeout` delay in `Deno.test.afterAll`**

```typescript
// file: /Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts

  // ... (previous code)

  Deno.test.afterAll(async () => {
    console.log("--- Starting afterAll cleanup ---");
    // Ensure all data from these collections is cleared
    await versionConcept.versions.deleteMany({});
    await versionDraftConcept.drafts.deleteMany({});
    console.log("--- Collections cleared ---");

    // Close the MongoDB client connection
    // It's crucial that this operation is awaited.
    await client.close();
    console.log("--- MongoDB client closed ---");

    // INCREASE THIS DELAY:
    // A small delay after closing the client helps ensure that all internal
    // timers and asynchronous operations initiated by the MongoDB driver
    // have a chance to complete their cleanup before Deno checks for leaks.
    // 500-1000ms is often more sufficient than 200ms.
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Changed from 200 to 1000

    console.log("--- afterAll cleanup finished ---");
  });

  // ... (rest of the test file)
```

**Reasoning:**

The MongoDB driver maintains internal connection pools and uses timers for various tasks (e.g., monitoring connection health, re-establishing connections, or heartbeats). When `client.close()` is called, it initiates the shutdown of these resources, but the actual closure and cleanup might not be instantaneous. The Deno test runner performs leak detection very aggressively *immediately* after the `afterAll` hook completes. If the MongoDB driver's internal cleanup hasn't finished by then, Deno will report these as leaks.

Increasing the delay to `1000ms` (1 second) provides more time for the MongoDB driver to complete its asynchronous cleanup tasks, making it less likely for Deno to detect "leaks."

**If the problem persists after this change:**

1. **Run with `--trace-leaks`:** The error message itself suggests `deno test --trace-leaks`. This will give you much more detailed stack traces for where the leaked resources were created, which can help pinpoint the exact origin if it's not the MongoDB client.
2. **Review `testDb.ts`:** The `testDb()` utility is responsible for creating and returning the `MongoClient`. Ensure it's not doing anything unusual or creating resources that are not properly associated with the `client` object you're closing.
3. **Check for multiple client instances:** Though unlikely with your current `beforeAll` structure, sometimes test helpers can inadvertently create multiple, unmanaged MongoDB client instances.

Start with increasing the delay; it's the most common resolution for this specific type of leak with the MongoDB driver in Deno tests.
