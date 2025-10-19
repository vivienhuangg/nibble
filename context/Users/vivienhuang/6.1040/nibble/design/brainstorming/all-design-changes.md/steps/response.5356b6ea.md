---
timestamp: 'Sun Oct 19 2025 14:06:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140645.c032c783.md]]'
content_id: 5356b6ea9364e323f728de348d22d2cd99380b0c4f3f4f2fedab674074784b87
---

# response:

The following are the contrasting major design changes from the `concept User` specification to its TypeScript implementation:

1. **Password Representation and Security**:
   * **Concept Spec**: Defines `password: String` directly within the user's state, implying a straightforward storage of the password itself.
   * **Implementation**: Introduces `passwordHash: string` in the `UserDoc` interface. While it notes that for the exercise it stores the plain password, it explicitly highlights that in a production environment, passwords should *always* be hashed. This is a significant practical security design consideration that evolves the abstract `password` field into a `passwordHash` for better security (even if simplified for this context).

2. **Explicit Error Handling in Action Signatures**:
   * **Concept Spec**: Actions are specified with a successful return type (e.g., `→ user`). While the general concept design framework allows for overloaded action signatures to include an `(error: String)` return, this was not explicitly part of the given `concept User` action definitions.
   * **Implementation**: All actions that can fail are explicitly designed to return a union type that includes a dedicated error object (e.g., `Promise<{ user: ID } | { error: string }>` or `Promise<Empty | { error: string }>`). This formalizes and enforces robust error communication as a primary aspect of the concept's API.
