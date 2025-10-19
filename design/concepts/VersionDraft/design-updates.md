# prompt: list only contrasting major design conceptual (not implementation-specific) changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.

[@VersionDraft](VersionDraft.md)

[@implementation](implementation.md)

[@testing](testing.md)

[@README](../../../README.md)

[@rubric](../../background/rubric.md)

[@concept-state](../../background/detailed/concept-state.md)

[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)


# response:

Here are the contrasting major design conceptual (not implementation-specific) changes from the `VersionDraft` concept spec to its implementation:

*   **Lifecycle Management:**
    *   **Concept Spec:** Explicitly states that `VersionDraft`'s lifecycle (creation, approval, rejection) is "Managed by `draftVersionWithAI`, `approveDraft`, `rejectDraft` actions on the `Version` concept," implying `VersionDraft` is a passive data structure.
    *   **Implementation:** Introduces `createDraft` and `deleteDraft` actions directly within `VersionDraftConcept`, giving it active responsibility for its own creation and removal.
*   **Internal Query Capability:**
    *   **Concept Spec:** Defines no explicit actions or queries for `VersionDraft`.
    *   **Implementation:** Adds `_getDraftById` and `_listDraftsByRequester` queries, providing `VersionDraft` with an internal interface to expose its state, rather than relying solely on external concepts to access it.
*   **Autonomous Expiration Enforcement:**
    *   **Concept Spec:** Includes an `expires: DateTime` state field but does not define any internal action for its enforcement.
    *   **Implementation:** Introduces a `system _cleanupExpiredDrafts` action, giving `VersionDraftConcept` the autonomous responsibility to manage and enforce its own transient nature by removing expired drafts.