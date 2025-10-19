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
