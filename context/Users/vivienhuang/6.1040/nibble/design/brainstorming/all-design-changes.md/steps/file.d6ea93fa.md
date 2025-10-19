---
timestamp: 'Sun Oct 19 2025 14:06:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140645.c032c783.md]]'
content_id: d6ea93fa3702bad18fe452e17a9d17be96321bed0f6df273d446e1ac50412f82
---

# file: /Users/vivienhuang/6.1040/nibble/src/utils/types.ts

```typescript
declare const Brand: unique symbol;

/**
 * Generic ID: effectively a string,
 * but uses type branding.
 */
export type ID = string & { [Brand]: true };

/**
 * Empty record type: enforces no entries.
 */
export type Empty = Record<PropertyKey, never>;

```
