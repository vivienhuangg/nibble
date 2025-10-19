# prompt: list only contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.         


[@Recipe](Recipe.md)

[@implementation](implementation.md)

[@testing](testing.md)

[@README](../../../README.md)

[@rubric](../../background/rubric.md)

[@concept-state](../../background/detailed/concept-state.md)

[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)


# response:

Here are the contrasting major design changes from the `Recipe` concept specification to its implementation:

*   **Embedding of Ingredient and Step Entities:**
    *   **Concept Spec:** `Ingredient` and `Step` are defined as distinct "concepts" with their own `purpose` and `principle` (though their actions are noted as "generally managed within Recipe/Version actions"). The `Recipe` state references them as `List[Ingredient]` and `List[Step]`. This implies they *could* be independent, managed entities.
    *   **Implementation:** `Ingredient` and `Step` are implemented as *embedded interfaces* directly within the `RecipeDoc` structure, and thus stored within the `recipes` MongoDB collection. They are not managed as separate top-level collections or by dedicated `IngredientConcept`/`StepConcept` classes. This design choice prioritizes data locality within the `Recipe` document rather than separate entity management.

*   **Explicit Query Definitions:**
    *   **Concept Spec:** The `Recipe` concept specification does not explicitly define any query actions.
    *   **Implementation:** Several explicit query methods (`_getRecipeById`, `_listRecipesByOwner`, `_searchRecipesByTag`) are added to the `RecipeConcept` class to allow for practical data retrieval.