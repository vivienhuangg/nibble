---
timestamp: 'Sat Oct 18 2025 22:59:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_225952.1bc0cce6.md]]'
content_id: c553570729356179369f6e8720f66199bd295158b13217ad5bf576750596535c
---

# file: src/utils/types.ts

```typescript
/**
 * A branded type for unique identifiers.
 * This allows distinguishing between different types of IDs (e.g., UserID, RecipeID)
 * while still treating them as strings for underlying storage and operations.
 */
export type ID = string & { __brand: "ID" };

/**
 * Represents an empty dictionary, typically used as a return type for actions
 * that do not produce specific output data on success.
 */
export type Empty = Record<PropertyKey, never>;
```
