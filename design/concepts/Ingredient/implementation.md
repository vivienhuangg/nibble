[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

[@app-overview](../../background/app-overview.md)

[@Ingredient](Ingredient.md)
# implement: Ingredient


# response:

The `Ingredient` concept, as described, does not manage its own state in a dedicated MongoDB collection nor does it have independent actions. Its purpose is to define a reusable *structure* for ingredients that will be embedded within other concepts like `Recipe` and `Version`. Therefore, its "implementation" in TypeScript will be a simple interface definition, rather than a full concept class with `Collection` properties and action methods.

This aligns with the principle of modularity in concept design: `Ingredient` describes *what an ingredient is*, while `Recipe` and `Version` describe *how collections of ingredients are managed* in the context of a recipe.

# file: src/concepts/Ingredient.ts

```typescript
// No dedicated Concept class for Ingredient.
// The Ingredient concept defines a reusable data structure (interface)
// that will be embedded within other concepts, such as Recipe and Version.
// It does not manage its own top-level collection or actions.

/**
 * concept Ingredient
 * purpose represent a specific item needed for a recipe.
 * principle ingredients are foundational building blocks of recipes.
 *
 * state
 * name : String
 * quantity : String (e.g., "1 cup", "2 tablespoons", "to taste")
 * unit : Optional\[String] (e.g., "cup", "tbsp", "g")
 * notes : Optional\[String] (e.g., "freshly chopped")
 *
 * actions
 * (Generally managed within Recipe/Version actions)
 */
export interface Ingredient {
  name: string;
  quantity: string;
  unit?: string; // Optional
  notes?: string; // Optional
}
```