---
timestamp: 'Sun Oct 19 2025 14:02:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140253.f47239db.md]]'
content_id: 663f55e682af60293147b27b0f44551527f8a5259722d648e264290803d30358
---

# response:

Here are the contrasting major design conceptual (not implementation-specific) changes from the `VersionDraft` concept spec to its implementation:

* **Autonomy of Lifecycle Management:**
  * **Concept Spec:** Explicitly states that `VersionDraft`'s actions are "Managed by `draftVersionWithAI`, `approveDraft`, `rejectDraft` actions on the `Version` concept," implying a passive data role for `VersionDraft`.
  * **Implementation:** Introduces `createDraft` and `deleteDraft` actions directly within `VersionDraftConcept`, giving it active responsibility for managing its own creation and removal within its dedicated state.
* **Self-Service Query Capability:**
  * **Concept Spec:** Defines no explicit query actions for `VersionDraft`.
  * **Implementation:** Adds `_getDraftById` and `_listDraftsByRequester` queries, allowing direct retrieval of `VersionDraft`s independent of the `Version` concept.
* **Self-Enforcement of Transient Nature:**
  * **Concept Spec:** Includes an `expires: DateTime` field, hinting at transience but without specifying a mechanism.
  * **Implementation:** Adds a `system _cleanupExpiredDrafts` action, making `VersionDraftConcept` responsible for actively removing its own expired transient data from the system.
