---
timestamp: 'Sat Oct 18 2025 22:59:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_225952.1bc0cce6.md]]'
content_id: d09563ddb6d5e0b67d38332f222a1c0779dba1c21beca5576ebf0ebf8919a27f
---

# file: src/concepts/Recipe/RecipeConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Define generic types for Recipe
export type RecipeID = ID;
export type UserID = ID;

// Embedded types for Recipe (also used in Version)
export interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
  notes?: string;
}

export interface Step {
  description: string;
  duration?: number;
  notes?: string;
}

/**
 * Represents the core state of a Recipe.
 * This is a minimal definition for its use as a dependency for VersionConcept.
 */
interface RecipeDoc {
  _id: RecipeID;
  owner: UserID;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  created: Date;
  updated: Date;
}

/**
 * A stub implementation of the Recipe concept, primarily for dependency resolution
 * for the Version concept. It provides just enough functionality to check if
 * a recipe exists and retrieve its owner.
 */
export default class RecipeConcept {
  recipes: Collection<RecipeDoc>;
  constructor(private readonly db: Db) {
    this.recipes = this.db.collection("Recipe" + ".recipes");
  }

  /**
   * _getRecipeById (id: RecipeID): (recipe: RecipeDoc)
   *
   * **requires** A recipe with the given ID exists.
   *
   * **effects** Returns the Recipe document corresponding to the ID.
   */
  async _getRecipeById(id: RecipeID): Promise<RecipeDoc | null> {
    return await this.recipes.findOne({ _id: id });
  }

  /**
   * createRecipe (owner: UserID, title: string, ingredients: Ingredient[], steps: Step[], description?: string) : (recipe: RecipeID)
   *
   * **requires** owner exists; title ≠ ""; ingredients and steps well-formed
   *
   * **effects** adds new recipe with empty tag set, sets creation/update times, returns the new recipe's ID.
   */
  async createRecipe(
    { owner, title, ingredients = [], steps = [], description }: {
      owner: UserID;
      title: string;
      ingredients?: Ingredient[];
      steps?: Step[];
      description?: string;
    },
  ): Promise<{ recipe: RecipeID } | { error: string }> {
    if (!owner || !title) return { error: "Owner and title are required." };

    const newRecipe: RecipeDoc = {
      _id: freshID(),
      owner,
      title,
      description,
      ingredients,
      steps,
      tags: [],
      created: new Date(),
      updated: new Date(),
    };
    await this.recipes.insertOne(newRecipe);
    return { recipe: newRecipe._id };
  }

  /**
   * deleteRecipe (requester: UserID, recipe: RecipeID): Empty
   *
   * **requires** requester = recipe.owner
   *
   * **effects** removes recipe and triggers cascade deletion of related Versions and Annotations (via sync)
   */
  async deleteRecipe(
    { requester, recipe }: { requester: UserID; recipe: RecipeID },
  ): Promise<Empty | { error: string }> {
    const existingRecipe = await this._getRecipeById(recipe);
    if (!existingRecipe) {
      return { error: "Recipe not found." };
    }
    if (existingRecipe.owner !== requester) {
      return { error: "Only the recipe owner can delete the recipe." };
    }
    await this.recipes.deleteOne({ _id: recipe });
    return {};
  }
}
```

Now, the `VersionDraft` concept.
