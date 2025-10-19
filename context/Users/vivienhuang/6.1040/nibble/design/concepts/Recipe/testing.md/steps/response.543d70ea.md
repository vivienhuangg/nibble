---
timestamp: 'Sat Oct 18 2025 22:18:02 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_221802.e5511abe.md]]'
content_id: 543d70ea07cff75ee1b29c626d479989e14818ac4b70ad9d51da7c0d88f26e61
---

# response:

Here's the implementation for the `Recipe` concept, following the provided guidelines and structure.

```typescript
// file: src/concepts/Recipe/RecipeConcept.ts

import { Collection, Db, ObjectId } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "Recipe" + ".";

// Generic types of this concept
type User = ID; // Refers to the User concept's ID
type RecipeId = ID; // The ID of a Recipe instance
type IngredientId = ID; // Not explicitly used as a top-level ID here, as Ingredient is embedded
type StepId = ID; // Not explicitly used as a top-level ID here, as Step is embedded

/**
 * concept Ingredient
 * purpose represent a specific item needed for a recipe.
 * principle ingredients are foundational building blocks of recipes.
 */
interface Ingredient {
  // _id: IngredientId; // Ingredients are embedded, so no top-level ID needed in this context
  name: string;
  quantity: string; // e.g., "1 cup", "2 tablespoons", "to taste"
  unit?: string; // e.g., "cup", "tbsp", "g"
  notes?: string; // e.g., "freshly chopped"
}

/**
 * concept Step
 * purpose represent a single instruction in a recipe.
 * principle steps guide the cooking process sequentially.
 */
interface Step {
  // _id: StepId; // Steps are embedded, so no top-level ID needed in this context
  description: string;
  duration?: number; // in minutes
  notes?: string; // e.g., "stir until golden brown"
}

/**
 * concept Recipe [User, Ingredient, Step, Tag]
 * purpose represent a canonical recipe owned by a user, with its core ingredients, steps, and descriptive metadata.
 * principle a recipe is authored once and remains the stable source for annotations and versions.
 */
interface RecipeDoc {
  _id: RecipeId;
  owner: User;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[]; // Representing Set[String]
  created: Date;
  updated: Date;
}

export default class RecipeConcept {
  private recipes: Collection<RecipeDoc>;

  constructor(private readonly db: Db) {
    this.recipes = this.db.collection(PREFIX + "recipes");
  }

  /**
   * createRecipe(owner: User, title: String, ingredients: List[Ingredient], steps: List[Step], description?: String)
   *   : (recipe: RecipeId) | (error: String)
   *
   * **requires** owner exists; title ≠ ""; ingredients and steps well-formed
   *
   * **effects** adds new recipe with empty tag set, sets creation/update times; returns the new recipe's ID
   */
  async createRecipe(
    {
      owner,
      title,
      ingredients,
      steps,
      description,
    }: {
      owner: User;
      title: string;
      ingredients: Ingredient[];
      steps: Step[];
      description?: string;
    },
  ): Promise<{ recipe: RecipeId } | { error: string }> {
    // Requires: owner exists (assumed valid ID for this concept's scope, actual check in sync)
    if (!owner) {
      return { error: "Owner ID must be provided." };
    }
    if (!title || title.trim() === "") {
      return { error: "Recipe title cannot be empty." };
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return { error: "Recipe must have at least one ingredient." };
    }
    if (!Array.isArray(steps) || steps.length === 0) {
      return { error: "Recipe must have at least one step." };
    }
    // Basic validation for ingredients and steps structure (can be extended)
    for (const ing of ingredients) {
      if (!ing.name || !ing.quantity) {
        return { error: "Each ingredient must have a name and quantity." };
      }
    }
    for (const step of steps) {
      if (!step.description) {
        return { error: "Each step must have a description." };
      }
    }

    const now = new Date();
    const newRecipeId = freshID();
    const newRecipe: RecipeDoc = {
      _id: newRecipeId,
      owner,
      title,
      description,
      ingredients,
      steps,
      tags: [], // Start with an empty tag set
      created: now,
      updated: now,
    };

    try {
      await this.recipes.insertOne(newRecipe);
      return { recipe: newRecipeId };
    } catch (e) {
      console.error(`Failed to create recipe: ${e.message}`);
      return { error: "Failed to create recipe due to a database error." };
    }
  }

  /**
   * addTag(recipe: RecipeId, tag: String): Empty | (error: String)
   *
   * **requires** recipe exists
   *
   * **effects** tag ∈ recipe.tags
   */
  async addTag(
    { recipe, tag }: { recipe: RecipeId; tag: string },
  ): Promise<Empty | { error: string }> {
    if (!recipe) {
      return { error: "Recipe ID must be provided." };
    }
    if (!tag || tag.trim() === "") {
      return { error: "Tag cannot be empty." };
    }

    try {
      const result = await this.recipes.updateOne(
        { _id: recipe },
        { $addToSet: { tags: tag }, $set: { updated: new Date() } },
      );

      if (result.matchedCount === 0) {
        return { error: "Recipe not found." };
      }
      return {};
    } catch (e) {
      console.error(`Failed to add tag to recipe ${recipe}: ${e.message}`);
      return { error: "Failed to add tag due to a database error." };
    }
  }

  /**
   * removeTag(recipe: RecipeId, tag: String): Empty | (error: String)
   *
   * **requires** tag ∈ recipe.tags
   *
   * **effects** tag ∉ recipe.tags
   */
  async removeTag(
    { recipe, tag }: { recipe: RecipeId; tag: string },
  ): Promise<Empty | { error: string }> {
    if (!recipe) {
      return { error: "Recipe ID must be provided." };
    }
    if (!tag || tag.trim() === "") {
      return { error: "Tag cannot be empty." };
    }

    try {
      // Check if the recipe exists and has the tag first (part of requires)
      const existingRecipe = await this.recipes.findOne(
        { _id: recipe, tags: tag },
      );
      if (!existingRecipe) {
        // This covers both "recipe not found" and "tag not present"
        return { error: "Recipe not found or tag is not present on recipe." };
      }

      const result = await this.recipes.updateOne(
        { _id: recipe },
        { $pull: { tags: tag }, $set: { updated: new Date() } },
      );

      if (result.matchedCount === 0) {
        // This case should ideally not be hit if existingRecipe was found,
        // but provides an extra layer of robustness.
        return { error: "Recipe not found." };
      }
      return {};
    } catch (e) {
      console.error(`Failed to remove tag from recipe ${recipe}: ${e.message}`);
      return { error: "Failed to remove tag due to a database error." };
    }
  }

  /**
   * deleteRecipe(requester: User, recipe: RecipeId): Empty | (error: String)
   *
   * **requires** requester = recipe.owner
   *
   * **effects** removes recipe and triggers cascade deletion of related Versions and Annotations (via sync)
   */
  async deleteRecipe(
    { requester, recipe }: { requester: User; recipe: RecipeId },
  ): Promise<Empty | { error: string }> {
    if (!requester || !recipe) {
      return { error: "Requester ID and Recipe ID must be provided." };
    }

    try {
      const existingRecipe = await this.recipes.findOne({ _id: recipe });
      if (!existingRecipe) {
        return { error: "Recipe not found." };
      }

      if (existingRecipe.owner !== requester) {
        return {
          error: "Requester is not the owner of the recipe and cannot delete it.",
        };
      }

      const result = await this.recipes.deleteOne({ _id: recipe });

      if (result.deletedCount === 0) {
        return { error: "Failed to delete recipe (might not exist)." };
      }
      return {};
    } catch (e) {
      console.error(`Failed to delete recipe ${recipe}: ${e.message}`);
      return { error: "Failed to delete recipe due to a database error." };
    }
  }

  /**
   * updateRecipeDetails(owner: User, recipe: RecipeId, newTitle?: String, newDescription?: String,
   *   newIngredients?: List[Ingredient], newSteps?: List[Step])
   *   : Empty | (error: String)
   *
   * **requires** owner = recipe.owner
   *
   * **effects** updates specified fields and `updated` timestamp.
   */
  async updateRecipeDetails(
    {
      owner,
      recipe,
      newTitle,
      newDescription,
      newIngredients,
      newSteps,
    }: {
      owner: User;
      recipe: RecipeId;
      newTitle?: string;
      newDescription?: string;
      newIngredients?: Ingredient[];
      newSteps?: Step[];
    },
  ): Promise<Empty | { error: string }> {
    if (!owner || !recipe) {
      return { error: "Owner ID and Recipe ID must be provided." };
    }

    try {
      const existingRecipe = await this.recipes.findOne({ _id: recipe });
      if (!existingRecipe) {
        return { error: "Recipe not found." };
      }

      if (existingRecipe.owner !== owner) {
        return {
          error:
            "Provided owner is not the actual owner of the recipe and cannot update it.",
        };
      }

      const updateFields: Partial<RecipeDoc> = { updated: new Date() };
      if (newTitle !== undefined) {
        if (newTitle.trim() === "") {
          return { error: "New title cannot be empty." };
        }
        updateFields.title = newTitle;
      }
      if (newDescription !== undefined) {
        updateFields.description = newDescription;
      }
      if (newIngredients !== undefined) {
        if (!Array.isArray(newIngredients) || newIngredients.length === 0) {
          return { error: "New ingredients list cannot be empty." };
        }
        for (const ing of newIngredients) {
          if (!ing.name || !ing.quantity) {
            return { error: "Each new ingredient must have a name and quantity." };
          }
        }
        updateFields.ingredients = newIngredients;
      }
      if (newSteps !== undefined) {
        if (!Array.isArray(newSteps) || newSteps.length === 0) {
          return { error: "New steps list cannot be empty." };
        }
        for (const step of newSteps) {
          if (!step.description) {
            return { error: "Each new step must have a description." };
          }
        }
        updateFields.steps = newSteps;
      }

      // If no actual fields were passed for update other than 'owner' and 'recipe',
      // only 'updated' will be set. This is fine.
      if (Object.keys(updateFields).length === 1 && updateFields.updated) {
        // No specific content update, just touching the timestamp. Might be a no-op if no real change.
        // For strictness, one might check if any of the *optional* fields were actually provided.
        // For now, allow updating just the timestamp if no other content is provided.
      } else if (Object.keys(updateFields).length === 0) {
        // No updates requested at all
        return { error: "No update fields provided." };
      }

      const result = await this.recipes.updateOne(
        { _id: recipe },
        { $set: updateFields },
      );

      if (result.matchedCount === 0) {
        // Should not happen if existingRecipe was found, but good check
        return { error: "Recipe not found during update." };
      }
      return {};
    } catch (e) {
      console.error(`Failed to update recipe ${recipe}: ${e.message}`);
      return { error: "Failed to update recipe due to a database error." };
    }
  }

  // Example Query (not explicitly requested in 'implement: Recipe' but useful for completeness)
  /**
   * _getRecipeById(recipe: RecipeId): { recipe: RecipeDoc } | { error: String }
   *
   * **requires** recipe exists
   *
   * **effects** returns the full Recipe document
   */
  async _getRecipeById(
    { recipe }: { recipe: RecipeId },
  ): Promise<{ recipe: RecipeDoc[] } | { error: string }> {
    if (!recipe) {
      return { error: "Recipe ID must be provided." };
    }

    try {
      const foundRecipe = await this.recipes.findOne({ _id: recipe });
      if (!foundRecipe) {
        return { error: "Recipe not found." };
      }
      return { recipe: [foundRecipe] }; // Queries return an array
    } catch (e) {
      console.error(`Failed to retrieve recipe ${recipe}: ${e.message}`);
      return { error: "Failed to retrieve recipe due to a database error." };
    }
  }

  /**
   * _listRecipesByOwner(owner: User): { recipe: RecipeDoc }[] | { error: String }
   *
   * **requires** owner exists
   *
   * **effects** returns all recipes owned by the specified user
   */
  async _listRecipesByOwner(
    { owner }: { owner: User },
  ): Promise<{ recipe: RecipeDoc[] } | { error: string }> {
    if (!owner) {
      return { error: "Owner ID must be provided." };
    }

    try {
      const recipes = await this.recipes.find({ owner }).toArray();
      return { recipe: recipes };
    } catch (e) {
      console.error(`Failed to list recipes for owner ${owner}: ${e.message}`);
      return { error: "Failed to list recipes due to a database error." };
    }
  }

  /**
   * _searchRecipesByTag(tag: String): { recipe: RecipeDoc }[] | { error: String }
   *
   * **requires** tag is non-empty
   *
   * **effects** returns all recipes containing the specified tag
   */
  async _searchRecipesByTag(
    { tag }: { tag: string },
  ): Promise<{ recipe: RecipeDoc[] } | { error: string }> {
    if (!tag || tag.trim() === "") {
      return { error: "Tag cannot be empty for search." };
    }

    try {
      const recipes = await this.recipes.find({ tags: tag }).toArray();
      return { recipe: recipes };
    } catch (e) {
      console.error(`Failed to search recipes by tag '${tag}': ${e.message}`);
      return { error: "Failed to search recipes due to a database error." };
    }
  }
}
```
