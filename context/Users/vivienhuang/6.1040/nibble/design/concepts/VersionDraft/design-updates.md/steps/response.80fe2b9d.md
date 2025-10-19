---
timestamp: 'Sun Oct 19 2025 13:28:10 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_132810.c08fc62c.md]]'
content_id: 80fe2b9d3b91a9b3db4ff9feea4dd49e1e91c14ee384581f79cb326f9b966b6e
---

# response:

Here are the contrasting major design conceptual (not implementation-specific) changes from the `VersionDraft` concept spec to its implementation:

* **Lifecycle Management:**
  * **Concept Spec:** Explicitly states that `VersionDraft`'s lifecycle (creation, approval, rejection) is "Managed by `draftVersionWithAI`, `approveDraft`, `rejectDraft` actions on the `Version` concept," implying `VersionDraft` is a passive data structure.
  * **Implementation:** Introduces `createDraft` and `deleteDraft` actions directly within `VersionDraftConcept`, giving it active responsibility for its own creation and removal.
* **Internal Query Capability:**
  * **Concept Spec:** Defines no explicit actions or queries for `VersionDraft`.
  * **Implementation:** Adds `_getDraftById` and `_listDraftsByRequester` queries, providing `VersionDraft` with an internal interface to expose its state, rather than relying solely on external concepts to access it.
* **Autonomous Expiration Enforcement:**
  * **Concept Spec:** Includes an `expires: DateTime` state field but does not define any internal action for its enforcement.
  * **Implementation:** Introduces a `system _cleanupExpiredDrafts` action, giving `VersionDraftConcept` the autonomous responsibility to manage and enforce its own transient nature by removing expired drafts.
