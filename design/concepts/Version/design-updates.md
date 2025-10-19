# prompt: list only contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.         


[@Version](Version.md)

[@implementation](implementation.md)

[@testing](testing.md)

[@README](../../../README.md)

[@rubric](../../background/rubric.md)

[@concept-state](../../background/detailed/concept-state.md)

[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)


# response:

Here are the contrasting major design changes from the `Version` concept spec to its implementation:

*   **`createVersion` Action Signature:**
    *   **Concept Spec:** `createVersion(author, recipe, versionNum, notes, ingredients, steps) → version`
    *   **Implementation:** Adds an *optional `promptHistory`* parameter to the `createVersion` action, allowing for explicit inclusion of AI interaction history when creating a version that originates from an approved draft.
*   **`deleteVersion` Authorization Enforcement:**
    *   **Concept Spec:** `requires requester = version.author OR requester = recipe.owner`
    *   **Implementation:** The `deleteVersion` action *only* checks if `requester = version.author`. The `requester = recipe.owner` authorization is explicitly deferred to an external synchronization mechanism, rather than being enforced directly within the action.
*   **`approveDraft` Input Parameters:**
    *   **Concept Spec:** `approveDraft(author, draft, newVersionNum) → version`
    *   **Implementation:** Requires the *caller* to explicitly provide the complete `draftDetails` (including `ingredients`, `steps`, `notes`, `goal`, and `confidence`) as an input parameter, rather than the `Version` concept internally accessing or retrieving these from the `VersionDraft`.
*   **`rejectDraft` Input Parameters:**
    *   **Concept Spec:** `rejectDraft(author, draft)`
    *   **Implementation:** Requires `baseRecipe` and `goal` as additional input parameters, specifically to construct a comprehensive `PromptHistoryEntry` for logging, which is then returned by the action.
*   **Return Types for AI-related Actions (`draftVersionWithAI`, `approveDraft`, `rejectDraft`):**
    *   **Concept Spec:** Generally specifies simpler return types (`→ VersionDraft`, `→ version`, or implied side-effects).
    *   **Implementation:** These actions return rich, structured dictionary objects containing all necessary data (e.g., `draftId`, `newVersionId`, full `PromptHistoryEntry`) to explicitly facilitate external synchronization logic, rather than just performing internal state changes.