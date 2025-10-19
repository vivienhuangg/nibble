---
timestamp: 'Sat Oct 18 2025 21:31:13 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_213113.938aed55.md]]'
content_id: 971d51c5e2a158347d8192d69c2112966d73af5bfcb2db49c757a213425c0fec
---

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
