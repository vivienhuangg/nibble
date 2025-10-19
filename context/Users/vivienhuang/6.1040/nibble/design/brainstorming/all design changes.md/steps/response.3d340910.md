---
timestamp: 'Sun Oct 19 2025 14:02:40 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140240.7ef6a09a.md]]'
content_id: 3d340910c833a84ae5137f25da16a0a3ac4a692785cef28545a59253d8a6ea9c
---

# response:

Here are the contrasting major design changes from the `Recipe` concept specification to its implementation:

* **Embedding of Ingredient and Step Entities:**
  * **Concept Spec:** `Ingredient` and `Step` are defined as distinct "concepts" with their own `purpose` and `principle` (though their actions are noted as "generally managed within Recipe/Version actions"). The `Recipe` state references them as `List[Ingredient]` and `List[Step]`. This implies they *could* be independent, managed entities.
  * **Implementation:** `Ingredient` and `Step` are implemented as *embedded interfaces* directly within the `RecipeDoc` structure, and thus stored within the `recipes` MongoDB collection. They are not managed as separate top-level collections or by dedicated `IngredientConcept`/`StepConcept` classes. This design choice prioritizes data locality within the `Recipe` document rather than separate entity management.

* **Explicit Query Definitions:**
  * **Concept Spec:** The `Recipe` concept specification does not explicitly define any query actions.
  * **Implementation:** Several explicit query methods (`_getRecipeById`, `_listRecipesByOwner`, `_searchRecipesByTag`) are added to the `RecipeConcept` class to allow for practical data retrieval.
