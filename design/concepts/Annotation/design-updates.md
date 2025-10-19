# prompt: list only contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.         


[@Annotation](Annotation.md)

[@implementation](implementation.md)

[@testing](testing.md)

[@README](../../../README.md)

[@rubric](../../background/rubric.md)

[@concept-state](../../background/detailed/concept-state.md)

[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)



# response:

Here are the contrasting major design changes from the `Annotation` concept specification to its implementation:

*   **Validation Logic Deferral:** The `annotate` action's `requires` clauses (e.g., `recipe exists`, `0 ≤ index < |target list|`) and the `resolveAnnotation` action's `requires` clause (`resolver canView annotation.recipe`) are explicitly deferred to "higher-level logic or syncs" in the implementation. This emphasizes the strict independence of the `Annotation` concept, ensuring it doesn't need to understand the internal structure of a `Recipe` or external user permissions.
*   **Addition of Explicit Queries:** The concept specification did not define any explicit query actions. The implementation adds `_getAnnotationsForRecipe` and `_getAnnotationById` methods to allow for direct retrieval of annotations, enhancing testability and practicality.