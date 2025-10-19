---
timestamp: 'Sun Oct 19 2025 14:04:54 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140454.d63934ab.md]]'
content_id: 202f40c416bd642f8ff10559b166ee5092bfc95917d083584f9187c7a23defd8
---

# response:

Here are the contrasting major design conceptual (not implementation-specific) changes from the `VersionDraft` concept spec to its implementation:

* **Lifecycle Ownership:**
  * **Concept Spec:** Explicitly states `VersionDraft` actions are "Managed by `draftVersionWithAI`, `approveDraft`, `rejectDraft` actions on the `Version` concept," implying a passive data structure whose lifecycle is entirely controlled externally.
  * **Implementation:** Introduces `createDraft` and `deleteDraft` actions directly within `VersionDraftConcept`, making it responsible for its own creation and explicit removal.
* **Internal Query Capabilities:**
  * **Concept Spec:** Defines no explicit query actions for `VersionDraft`.
  * **Implementation:** Adds `_getDraftById` and `_listDraftsByRequester` queries, allowing direct retrieval of its state by other concepts or the client without proxying through `Version`.
* **Autonomous Expiration Management:**
  * **Concept Spec:** Includes an `expires: DateTime` state field without defining how it's enforced.
  * **Implementation:** Introduces a `system _cleanupExpiredDrafts` action, giving `VersionDraftConcept` autonomous responsibility for managing the transient nature of its data by automatically removing expired drafts.
