---
timestamp: 'Sun Oct 19 2025 01:45:17 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_014517.679caedc.md]]'
content_id: 06d5e2f00ecf66ff80bf25abee572d5a44a3e0fdb24b1a320261dc6b6eee2bf4
---

# response:

The test is failing due to resource leaks, specifically "4 async calls to op\_read" and "6 timers" that were started but never completed, as well as an unclosed TLS connection. This typically points to an issue with database connections or asynchronous operations not being properly shut down or awaited.

Let's break down the potential causes and how to fix them.

### Problem Analysis

1. **"4 async calls to op\_read were started in this test, but never completed."**: This strongly suggests that there are ongoing database operations that haven't finished by the time Deno tries to clean up. MongoDB client operations are asynchronous, and if the client is closed while they are still in flight, they can become "leaked."
2. **"6 timers were started in this test, but never completed. This is often caused by not calling `clearTimeout`."**: You have `setTimeout(resolve, 500)` and `setTimeout(resolve, 200)` in your `Deno.test.afterAll` hook. These `setTimeout` calls are designed to introduce delays. If they are not fully resolved (i.e., the `resolve` function is called and the promise finishes) before the test runner exits, they will be reported as leaked timers. While you do `await new Promise(...)`, it's possible the surrounding `afterAll` hook isn't waiting long enough, or other operations are still occurring.
3. **"A TLS connection was opened/accepted during the test, but not closed during the test."**: This is the most critical symptom, directly related to the MongoDB client. `client.close(true)` attempts to force close the connection, but if there are still operations, it might not fully succeed, or the underlying connection isn't cleanly torn down from Deno's perspective.

The core issue is likely that the `client.close(true)` is being called too aggressively, or too early, while underlying database operations or `setTimeout` delays are still active.

### Proposed Solution

The most robust way to ensure a clean shutdown in Deno tests with MongoDB is to:

1. **Ensure all database operations are awaited.** Your individual `t.step` blocks look mostly fine in terms of `await`ing MongoDB calls, but the `beforeAll` and `afterAll` hooks also perform async DB operations.
2. **Remove unnecessary `setTimeout` calls.** The `setTimeout` calls are usually a workaround for race conditions or slow shutdowns. With proper `await`ing, they are often not needed and can mask underlying issues or create new ones (like leaked timers).
3. **Ensure the MongoDB client fully disconnects.** The `client.close()` method should ideally be called after all database operations are *guaranteed* to be finished.

Let's modify the `Deno.test.afterAll` block:

```typescript
  Deno.test.afterAll(async () => {
    console.log("--- Starting afterAll cleanup ---");
    // Clear any remaining data from both collections
    // Await these deletions to ensure they complete before closing the client.
    await versionConcept.versions.deleteMany({});
    await versionDraftConcept.drafts.deleteMany({});
    console.log("--- Collections cleared ---");

    // Force close database connection
    // The `true` parameter forces immediate closure. If there are pending operations,
    // they might be aborted or lead to connection leaks if not properly handled
    // by the driver itself. A simpler `await client.close()` is often sufficient
    // and cleaner if all operations are truly finished.
    // Let's try `await client.close()` first. If leaks persist, we might need to investigate
    // if the MongoDB driver has a specific hook for Deno's `Deno.test.afterAll`.
    await client.close();
    console.log("--- MongoDB client closed ---");

    // Remove these timeouts. They are usually not needed if database operations are awaited.
    // await new Promise((resolve) => setTimeout(resolve, 500));
    // await new Promise((resolve) => setTimeout(resolve, 200));

    console.log("--- afterAll cleanup finished ---");
  });
```

### Explanation of Changes:

1. **`await versionConcept.versions.deleteMany({});`**: Explicitly `await` these cleanup operations. While Deno's test runner usually waits for top-level `await`s in `afterAll`, it's good practice to be explicit. This ensures the deletion operations complete before moving on.
2. **`await client.close();`**: Changed from `client.close(true)` to `await client.close()`. The non-`true` version typically attempts a graceful shutdown, waiting for any *known* in-flight operations to complete. The `true` argument *forces* a close, which can sometimes leave underlying resources in a limbo state if the driver or runtime isn't prepared for an abrupt cut-off, potentially causing the TLS leak. By `await`ing the graceful close, we give the driver a chance to clean up properly.
3. **Removed `setTimeout` calls**: These were likely added to "give more time" for cleanup. However, if the `await` on `client.close()` is effective, these `setTimeout` calls become unnecessary and contribute to the "leaked timers" warning. With proper `await`ing, the test runner will naturally wait for the operations to complete.

### If Leaks Persist

If the leaks still occur after this change, consider these possibilities:

* **Deno's Test Isolation**: In some Deno versions or configurations, even `afterAll` might struggle with truly global resources like database connections if not initialized and closed carefully. The `testDb()` utility function (which is external to the provided code) should ensure a fresh, isolated connection for each test run if needed, or at least manage the lifecycle of a shared connection properly.
* **External `testDb` function issues**: Double-check `testDb` to ensure it's not holding onto connections or creating resources that aren't fully managed by `client.close()`.
* **MongoDB Driver Behavior**: Occasionally, certain MongoDB Node/Deno driver versions might have subtle connection management quirks. Ensure your `npm:mongodb` dependency is up-to-date.

Start with the `afterAll` modification. It's the most direct fix for the reported leak types.
