---
timestamp: 'Sat Oct 18 2025 21:38:46 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_213846.cad04554.md]]'
content_id: 8cb0b681762183c470c1c9091eee911a0c6afeab899691b9cd59a41bc0b71dee
---

# response:

The primary design change, or rather a clarification in implementation strategy, for the `Ingredient` concept is as follows:

The `Ingredient` concept, despite being a concept specification, is implemented as a **TypeScript interface (`Ingredient`)** rather than a full **concept class** with its own dedicated MongoDB collections and action methods. This decision stems directly from its concept spec, which explicitly states that its `actions` are "Generally managed within Recipe/Version actions," indicating that `Ingredient` itself is not a standalone concept with independent state management and behaviors. Instead, it serves as a reusable **data structure** to be embedded within other concepts like `Recipe` and `Version`.
