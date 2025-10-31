import { GoogleGenAI } from "npm:@google/genai";
import type { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import type { Empty, ID } from "@utils/types.ts";
import "jsr:@std/dotenv/load";

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
  forkedFrom?: RecipeId; // Optional: ID of the recipe this was forked from
  created: Date;
  updated: Date;
}

export default class RecipeConcept {
  private recipes: Collection<RecipeDoc>;

  constructor(private readonly db: Db) {
    this.recipes = this.db.collection(PREFIX + "recipes");
  }

  /**
   * createRecipe(owner: User, title: String, ingredients: List[Ingredient], steps: List[Step], description?: String, forkedFrom?: RecipeId)
   *   : (recipe: RecipeId) | (error: String)
   *
   * **requires** owner exists; title ≠ ""; ingredients and steps well-formed; if forkedFrom is provided, that recipe must exist
   *
   * **effects** adds new recipe with empty tag set, sets creation/update times; optionally tracks the parent recipe if forkedFrom is provided; returns the new recipe's ID
   */
  async createRecipe({
    owner,
    title,
    ingredients,
    steps,
    description,
    forkedFrom,
  }: {
    owner: User;
    title: string;
    ingredients: Ingredient[];
    steps: Step[];
    description?: string;
    forkedFrom?: RecipeId;
  }): Promise<{ recipe: RecipeId } | { error: string }> {
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

    // If forkedFrom is provided, validate that the parent recipe exists
    if (forkedFrom) {
      try {
        const parentRecipe = await this.recipes.findOne({ _id: forkedFrom });
        if (!parentRecipe) {
          return { error: "Parent recipe (forkedFrom) does not exist." };
        }
      } catch (e) {
        console.error(
          `Failed to validate parent recipe: ${
            e instanceof Error ? e.message : String(e)
          }`,
        );
        return { error: "Failed to validate parent recipe." };
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
      forkedFrom, // Will be undefined if not provided
      created: now,
      updated: now,
    };

    try {
      await this.recipes.insertOne(newRecipe);
      return { recipe: newRecipeId };
    } catch (e) {
      console.error(
        `Failed to create recipe: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
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
  async addTag({
    recipe,
    tag,
  }: {
    recipe: RecipeId;
    tag: string;
  }): Promise<Empty | { error: string }> {
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
      console.error(
        `Failed to add tag to recipe ${recipe}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
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
  async removeTag({
    recipe,
    tag,
  }: {
    recipe: RecipeId;
    tag: string;
  }): Promise<Empty | { error: string }> {
    if (!recipe) {
      return { error: "Recipe ID must be provided." };
    }
    if (!tag || tag.trim() === "") {
      return { error: "Tag cannot be empty." };
    }

    try {
      // Check if the recipe exists and has the tag first (part of requires)
      const existingRecipe = await this.recipes.findOne({
        _id: recipe,
        tags: tag,
      });
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
      console.error(
        `Failed to remove tag from recipe ${recipe}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
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
  async deleteRecipe({
    requester,
    recipe,
  }: {
    requester: User;
    recipe: RecipeId;
  }): Promise<Empty | { error: string }> {
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
          error:
            "Requester is not the owner of the recipe and cannot delete it.",
        };
      }

      const result = await this.recipes.deleteOne({ _id: recipe });

      if (result.deletedCount === 0) {
        return { error: "Failed to delete recipe (might not exist)." };
      }
      return {};
    } catch (e) {
      console.error(
        `Failed to delete recipe ${recipe}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
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
  async updateRecipeDetails({
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
  }): Promise<Empty | { error: string }> {
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
            return {
              error: "Each new ingredient must have a name and quantity.",
            };
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
      console.error(
        `Failed to update recipe ${recipe}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
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
  async _getRecipeById({
    recipe,
  }: {
    recipe: RecipeId;
  }): Promise<{ recipe: RecipeDoc[] } | { error: string }> {
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
      console.error(
        `Failed to retrieve recipe ${recipe}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
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
  async _listRecipesByOwner({
    owner,
  }: {
    owner: User;
  }): Promise<{ recipe: RecipeDoc[] } | { error: string }> {
    if (!owner) {
      return { error: "Owner ID must be provided." };
    }

    try {
      const recipes = await this.recipes.find({ owner }).toArray();
      return { recipe: recipes };
    } catch (e) {
      console.error(
        `Failed to list recipes for owner ${owner}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
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
  async _searchRecipesByTag({
    tag,
  }: {
    tag: string;
  }): Promise<{ recipe: RecipeDoc[] } | { error: string }> {
    if (!tag || tag.trim() === "") {
      return { error: "Tag cannot be empty for search." };
    }

    try {
      const recipes = await this.recipes.find({ tags: tag }).toArray();
      return { recipe: recipes };
    } catch (e) {
      console.error(
        `Failed to search recipes by tag '${tag}': ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return { error: "Failed to search recipes due to a database error." };
    }
  }

  /**
   * _getForkCount(recipe: RecipeId): { count: number } | { error: String }
   *
   * **requires** recipe exists
   *
   * **effects** returns the count of recipes that have been forked from the specified recipe
   */
  async _getForkCount({
    recipe,
  }: {
    recipe: RecipeId;
  }): Promise<{ count: number } | { error: string }> {
    if (!recipe) {
      return { error: "Recipe ID must be provided." };
    }

    try {
      // First check if the recipe exists
      const existingRecipe = await this.recipes.findOne({ _id: recipe });
      if (!existingRecipe) {
        return { error: "Recipe not found." };
      }

      // Count all recipes that have this recipe as their forkedFrom value
      const forkCount = await this.recipes.countDocuments({
        forkedFrom: recipe,
      });
      return { count: forkCount };
    } catch (e) {
      console.error(
        `Failed to get fork count for recipe ${recipe}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return { error: "Failed to get fork count due to a database error." };
    }
  }

  /**
   * _listForksOfRecipe(recipe: RecipeId): { recipe: RecipeDoc[] } | { error: String }
   *
   * **requires** recipe exists
   *
   * **effects** returns all recipes that have been forked from the specified recipe
   */
  async _listForksOfRecipe({
    recipe,
  }: {
    recipe: RecipeId;
  }): Promise<{ recipe: RecipeDoc[] } | { error: string }> {
    if (!recipe) {
      return { error: "Recipe ID must be provided." };
    }

    try {
      // First check if the recipe exists
      const existingRecipe = await this.recipes.findOne({ _id: recipe });
      if (!existingRecipe) {
        return { error: "Recipe not found." };
      }

      // Find all recipes that have this recipe as their forkedFrom value
      const forks = await this.recipes.find({ forkedFrom: recipe }).toArray();
      return { recipe: forks };
    } catch (e) {
      console.error(
        `Failed to list forks for recipe ${recipe}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return { error: "Failed to list forks due to a database error." };
    }
  }

  /**
   * draftRecipeWithAI (author: User, recipe: RecipeId, goal: String):
   *   (draftId: ID, baseRecipe: RecipeId, requester: User, goal: String, ingredients: List[Ingredient], steps: Step[], notes: String, confidence?: number, created: Date, expires: Date) | (error: String)
   *
   * **purpose** Uses AI to suggest modifications to a recipe based on a user's goal.
   *
   * **requires** recipe exists; goal ≠ ""; GEMINI_API_KEY is set
   *
   * **effects** Calls Gemini AI with the recipe data and goal; returns draft data for creating a VersionDraft
   */
  async draftRecipeWithAI({
    author,
    recipe,
    goal,
  }: {
    author: User;
    recipe: RecipeId;
    goal: string;
  }): Promise<
    | {
      draftId: ID;
      baseRecipe: RecipeId;
      requester: User;
      goal: string;
      ingredients: Ingredient[];
      steps: Step[];
      notes: string;
      confidence?: number;
      created: Date;
      expires: Date;
    }
    | { error: string }
  > {
    if (!author) return { error: "Author ID must be provided." };
    if (!recipe) return { error: "Recipe ID must be provided." };
    if (!goal || goal.trim() === "") return { error: "Goal cannot be empty." };

    // Fetch the actual recipe data
    const recipeResult = await this._getRecipeById({ recipe });
    if ("error" in recipeResult) {
      return { error: `Failed to fetch recipe: ${recipeResult.error}` };
    }

    const recipeData = recipeResult.recipe[0];
    if (!recipeData) {
      return { error: "Recipe not found." };
    }

    // --- Real LLM call using Gemini ---
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.0-flash-exp";

    if (!GEMINI_API_KEY) {
      return {
        error:
          "GEMINI_API_KEY environment variable is not set. Cannot generate AI draft.",
      };
    }

    const draftId = freshID();
    const created = new Date();
    const expires = new Date(created.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      // Format the recipe data for the prompt
      const ingredientsText = recipeData.ingredients
        .map((ing: Ingredient) => {
          let text = `- ${ing.name}: ${ing.quantity}`;
          if (ing.unit) text += ` ${ing.unit}`;
          if (ing.notes) text += ` (${ing.notes})`;
          return text;
        })
        .join("\n");

      const stepsText = recipeData.steps
        .map((step: Step, idx: number) => {
          let text = `${idx + 1}. ${step.description}`;
          if (step.notes) text += ` (${step.notes})`;
          return text;
        })
        .join("\n");

      const prompt =
        `You are a professional chef assistant. A user wants to modify the following recipe.

ORIGINAL RECIPE: "${recipeData.title}"
${recipeData.description ? `Description: ${recipeData.description}` : ""}

INGREDIENTS:
${ingredientsText}

STEPS:
${stepsText}

USER'S GOAL: ${goal}

Please provide a modified version of this recipe that achieves the user's goal. Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "ingredients": [{"name": "string", "quantity": "string", "unit": "string (optional)", "notes": "string (optional)"}],
  "steps": [{"description": "string", "notes": "string (optional)"}],
  "notes": "Brief summary of changes made",
  "confidence": 0.0-1.0
}`;

      const result = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      // Extract text from Gemini API response
      const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text ||
        result.text;

      if (!responseText) {
        console.error(
          "Failed to extract text from response. Full result:",
          JSON.stringify(result, null, 2),
        );
        return {
          error: `No response from AI model. Debug info logged to console.`,
        };
      }

      // Parse the JSON response
      let llmResponse: {
        ingredients?: Ingredient[];
        steps?: Step[];
        notes?: string;
        confidence?: number;
      };
      try {
        // Remove markdown code blocks if present
        const cleanedResponse = responseText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        llmResponse = JSON.parse(cleanedResponse);
      } catch (_error) {
        console.error("Failed to parse LLM response:", responseText);
        return {
          error:
            "Failed to parse AI response. The AI returned invalid JSON. Please try again.",
        };
      }

      return {
        draftId,
        baseRecipe: recipe,
        requester: author,
        goal,
        ingredients: llmResponse.ingredients || [],
        steps: llmResponse.steps || [],
        notes: llmResponse.notes ||
          `AI-generated draft based on goal: "${goal}"`,
        confidence: llmResponse.confidence || 0.75,
        created,
        expires,
      };
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return {
        error: `Failed to call AI service: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * applyDraft (owner: User, recipe: RecipeId, draftDetails: { ingredients: List[Ingredient], steps: Step[], notes: String }): Empty | (error: String)
   *
   * **purpose** Applies an approved AI draft to the original recipe, modifying it directly.
   *
   * **requires** owner = recipe.owner; draft details must be well-formed
   *
   * **effects** Updates the recipe's ingredients and steps with the draft content; adds notes to description; updates timestamp
   */
  async applyDraft({
    owner,
    recipe,
    draftDetails,
  }: {
    owner: User;
    recipe: RecipeId;
    draftDetails: {
      ingredients: Ingredient[];
      steps: Step[];
      notes: string;
    };
  }): Promise<Empty | { error: string }> {
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

      // Validate draft details
      if (
        !Array.isArray(draftDetails.ingredients) ||
        draftDetails.ingredients.length === 0
      ) {
        return { error: "Draft must have at least one ingredient." };
      }
      if (
        !Array.isArray(draftDetails.steps) ||
        draftDetails.steps.length === 0
      ) {
        return { error: "Draft must have at least one step." };
      }

      // Validate ingredients and steps structure
      for (const ing of draftDetails.ingredients) {
        if (!ing.name || !ing.quantity) {
          return { error: "Each ingredient must have a name and quantity." };
        }
      }
      for (const step of draftDetails.steps) {
        if (!step.description) {
          return { error: "Each step must have a description." };
        }
      }

      // Apply the draft changes to the recipe
      const updateFields: Partial<RecipeDoc> = {
        ingredients: draftDetails.ingredients,
        steps: draftDetails.steps,
        updated: new Date(),
      };

      // Optionally append the AI notes to the description
      if (draftDetails.notes) {
        const currentDesc = existingRecipe.description || "";
        const separator = currentDesc ? "\n\n" : "";
        updateFields.description =
          `${currentDesc}${separator}[AI Modification] ${draftDetails.notes}`;
      }

      const result = await this.recipes.updateOne(
        { _id: recipe },
        { $set: updateFields },
      );

      if (result.matchedCount === 0) {
        return { error: "Recipe not found during update." };
      }

      return {};
    } catch (e) {
      console.error(
        `Failed to apply draft to recipe ${recipe}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return { error: "Failed to apply draft due to a database error." };
    }
  }
}
