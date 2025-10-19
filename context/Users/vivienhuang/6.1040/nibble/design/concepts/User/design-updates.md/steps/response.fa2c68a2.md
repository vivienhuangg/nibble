---
timestamp: 'Sat Oct 18 2025 21:43:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_214335.15ab2a0d.md]]'
content_id: fa2c68a2012faf911e57b1f789bb3a95ca71e463fe645845dfa7f65e8b39d4e8
---

# response:

The following are the major contrasting design changes from the `User` concept specification to its TypeScript implementation:

1. **Explicit Password Storage in State**:
   * **Concept Spec:** The `state` definition for `User` does *not* explicitly list a password field. Passwords are only mentioned as input arguments to the `registerUser` and `login` actions, implicitly suggesting they would be stored.
   * **Implementation:** The `UserDoc` interface explicitly includes `passwordHash: string` in the concept's persistent state. This makes the storage of (a hashed) password a clear part of the user's data model, along with an important security note regarding actual password hashing practices.

2. **Standardized Error Handling for Actions**:
   * **Concept Spec:** The `User` actions (`registerUser`, `login`, `updateProfile`) do not explicitly define error return types in their signatures. While the general concept design principles mention overloaded actions with `(error: String)`, it's not explicitly applied to the `User` actions provided.
   * **Implementation:** All `UserConcept` actions are designed to consistently return a `Promise` that resolves to either a successful result (e.g., `{ user: ID }` or `Empty`) *or* a dictionary containing an `error` string (`{ error: string }`). This makes error scenarios an explicit part of the action's API contract.

3. **Addition of Query Methods**:
   * **Concept Spec:** No query actions are explicitly listed for the `User` concept.
   * **Implementation:** Two query methods, `_getUserDetails` and `_getUserIDByEmail`, were added. These queries are essential for retrieving user information (e.g., for profile display or validation) and for fulfilling test assertions, aligning with the general concept design guidance that queries, while sometimes implicit, should be explicitly defined for code.
