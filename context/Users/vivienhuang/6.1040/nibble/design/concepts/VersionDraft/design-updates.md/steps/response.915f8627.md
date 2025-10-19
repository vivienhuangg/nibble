---
timestamp: 'Sun Oct 19 2025 13:26:42 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_132642.e9e051d7.md]]'
content_id: 915f8627927634e95edba8998dd6234a584484e1e0c7e2bb004807b5383f0034
---

# response:

Here are the contrasting major design changes from the `VersionDraft` concept specification to its TypeScript implementation:

* **Actions Management Paradigm:**
  * **Concept Spec:** Explicitly states `actions` are "(Managed by `draftVersionWithAI`, `approveDraft`, `rejectDraft` actions on the `Version` concept)," implying `VersionDraft` itself has no internal actions.
  * **Implementation:** Defines specific internal actions (`createDraft`, `deleteDraft`) and queries (`_getDraftById`, `_listDraftsByRequester`) within the `VersionDraftConcept` class to manage its own lifecycle and data retrieval directly. It also adds a `_cleanupExpiredDrafts` system action for autonomous management.

* **Ingredient and Step Definition Approach:**
  * **Concept Spec:** References `Ingredient` and `Step` as separate concepts (`List[Ingredient]`, `List[Step]`), suggesting they would be distinct entities or references.
  * **Implementation:** Defines `Ingredient` and `Step` as inline TypeScript interfaces within the `VersionDraftConcept` file, treating them as value objects or embedded documents directly within the `VersionDraft`'s state rather than separate concept instances.

* **ID Type Handling:**
  * **Concept Spec:** Uses `id : UUID`.
  * **Implementation:** Employs a branded string type `ID` and the `freshID()` utility for MongoDB's `_id` field, moving from a generic `UUID` notation to a more specific, implementation-oriented string-based identifier.

* **Explicit Queries and System Actions:**
  * **Concept Spec:** Does not define any explicit query actions or system actions.
  * **Implementation:** Introduces explicit query methods (prefixed with `_`, like `_getDraftById`) and a `_cleanupExpiredDrafts` system action, providing concrete mechanisms for data access and automated cleanup of transient data.
