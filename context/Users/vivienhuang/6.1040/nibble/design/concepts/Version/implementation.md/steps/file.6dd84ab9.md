---
timestamp: 'Sat Oct 18 2025 22:59:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_225952.1bc0cce6.md]]'
content_id: 6dd84ab91d0ecedb768452f6cf32b67789e3374af0a4fa733ffb2cf567df4fc5
---

# file: src/concepts/Version/VersionConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import RecipeConcept, { Ingredient, Step, RecipeID, UserID } from "@concepts/Recipe/RecipeConcept.ts";
import VersionDraftConcept, { VersionDraftDoc } from "@concepts/Version/VersionDraftConcept.ts";

const PREFIX = "Version" + ".";

/**
 * Interface for an entry in the prompt history, tracking AI interactions.
 */
interface PromptHistoryEntry {
  promptText: string;
  modelName: string;
  timestamp: Date;
  draftId: ID; // Refers to a VersionDraft's ID
  status: "Approved" | "Rejected" | "Generated" | "Failed";
}

/**
 * Interface representing the state of a Version concept.
 * Each Version captures immutable modifications to a base recipe.
 */
export interface VersionDoc {
  _id: ID; // Version ID
  baseRecipe: RecipeID;
  versionNum: string;
  author: UserID;
  notes: string;
  ingredients: Ingredient[];
  steps: Step[];
  created: Date;
  promptHistory: PromptHistoryEntry[];
}

/**
 * Implements the Version concept, allowing users to create and manage
 * different versions of recipes, with optional AI assistance for drafting.
 */
export default class VersionConcept {
  versions: Collection<VersionDoc>;
  private recipeConcept: RecipeConcept;
  private versionDraftConcept: VersionDraftConcept;

  constructor(private readonly db: Db) {
    this.versions = this.db.collection(PREFIX + "versions");
    this.recipeConcept = new RecipeConcept(db); // Initialize dependency
    this.versionDraftConcept = new VersionDraftConcept(db); // Initialize dependency
  }

  /**
   * createVersion(author: UserID, recipe: RecipeID, versionNum: string, notes: string, ingredients: Ingredient[], steps: Step[]) -> (version: VersionDoc)
   *
   * **requires** recipe exists; versionNum unique for recipe (e.g., "1.0", "1.1", "2.0"); ingredients/steps must be well-formed
   *
   * **effects** adds new version linked to recipe, sets `created`
   */
  async createVersion(
    { author, recipe, versionNum, notes, ingredients, steps }: {
      author: UserID;
      recipe: RecipeID;
      versionNum: string;
      notes: string;
      ingredients: Ingredient[];
      steps: Step[];
    },
  ): Promise<{ version: VersionDoc } | { error: string }> {
    // 1. Check if baseRecipe exists
    const baseRecipeDoc = await this.recipeConcept._getRecipeById(recipe);
    if (!baseRecipeDoc) {
      return { error: `Base recipe with ID '${recipe}' does not exist.` };
    }

    // 2. Check if versionNum is unique for this recipe
    const existingVersion = await this.versions.findOne({
      baseRecipe: recipe,
      versionNum: versionNum,
    });
    if (existingVersion) {
      return { error: `Version number '${versionNum}' already exists for this recipe.` };
    }

    // 3. Basic check for well-formed ingredients/steps
    if (!ingredients || !Array.isArray(ingredients) || !steps || !Array.isArray(steps)) {
      return { error: "Ingredients and steps must be well-formed arrays." };
    }
    for (const ingredient of ingredients) {
        if (!ingredient.name || !ingredient.quantity) return { error: "Ingredient missing name or quantity" };
    }
    for (const step of steps) {
        if (!step.description) return { error: "Step missing description" };
    }

    // 4. Create and insert the new Version document
    const newVersion: VersionDoc = {
      _id: freshID(),
      baseRecipe: recipe,
      versionNum,
      author,
      notes,
      ingredients,
      steps,
      created: new Date(),
      promptHistory: [], // New version starts with an empty prompt history
    };

    try {
      await this.versions.insertOne(newVersion);
      return { version: newVersion };
    } catch (e) {
      console.error("Error creating version:", e);
      return { error: "Failed to create version due to database error." };
    }
  }

  /**
   * deleteVersion(requester: UserID, version: ID) -> Empty
   *
   * **requires** requester = version.author OR requester = recipe.owner
   *
   * **effects** removes version
   */
  async deleteVersion(
    { requester, version: versionId }: { requester: UserID; version: ID },
  ): Promise<Empty | { error: string }> {
    const existingVersion = await this.versions.findOne({ _id: versionId });
    if (!existingVersion) {
      return { error: `Version with ID '${versionId}' not found.` };
    }

    const baseRecipeDoc = await this.recipeConcept._getRecipeById(
      existingVersion.baseRecipe,
    );
    // If the base recipe is somehow gone, we log a warning but proceed, as deleting the version is still valid.
    if (!baseRecipeDoc) {
      console.warn(
        `Base recipe ${existingVersion.baseRecipe} not found for version ${versionId}. Proceeding with version deletion.`,
      );
    }

    // Check authorization: requester must be the version's author OR the base recipe's owner
    if (
      existingVersion.author !== requester &&
      (!baseRecipeDoc || baseRecipeDoc.owner !== requester)
    ) {
      return {
        error: "Only the version author or recipe owner can delete this version.",
      };
    }

    try {
      await this.versions.deleteOne({ _id: versionId });
      return {};
    } catch (e) {
      console.error("Error deleting version:", e);
      return { error: "Failed to delete version due to database error." };
    }
  }

  /**
   * draftVersionWithAI(author: UserID, recipe: RecipeID, goal: string, options: Record<string, any>) -> (versionDraft: VersionDraftDoc)
   *
   * **requires** recipe exists; goal ≠ ""
   *
   * **effects** calls LLM with (recipe.ingredients, recipe.steps, goal, options) → VersionDraft {id, ingredients, steps, notes, confidence}; stores in a transient collection and returns the generated draft.
   */
  async draftVersionWithAI(
    { author, recipe, goal, options = {} }: {
      author: UserID;
      recipe: RecipeID;
      goal: string;
      options?: Record<string, any>; // LLM options
    },
  ): Promise<{ versionDraft: VersionDraftDoc } | { error: string }> {
    const baseRecipeDoc = await this.recipeConcept._getRecipeById(recipe);
    if (!baseRecipeDoc) {
      return { error: `Base recipe with ID '${recipe}' does not exist.` };
    }
    if (!goal) {
      return { error: "Goal cannot be empty." };
    }

    // --- Mock LLM Call ---
    // In a real scenario, this would involve an external LLM service call.
    // The LLM would typically take the base recipe's ingredients/steps, the user's goal,
    // and any specific options to generate a proposed modification.
    const mockLLMResponse = {
      ingredients: [
        ...baseRecipeDoc.ingredients,
        { name: "Red Pepper Flakes", quantity: "1 tsp", notes: "for heat" },
      ],
      steps: [
        ...baseRecipeDoc.steps,
        { description: "Add red pepper flakes with other spices.", duration: 1 },
      ],
      notes: `AI generated draft: Modified recipe to "${goal}". Added heat with red pepper flakes.`,
      confidence: 0.9,
      modelName: "MockLLM_v1", // Simulated model name
    };
    // --- End Mock LLM Call ---

    // Create a VersionDraft using the VersionDraftConcept
    const { versionDraft, error: createDraftError } = await this.versionDraftConcept.createDraft({
      requester: author,
      baseRecipe: recipe,
      goal,
      ingredients: mockLLMResponse.ingredients,
      steps: mockLLMResponse.steps,
      notes: mockLLMResponse.notes,
      confidence: mockLLMResponse.confidence,
    });

    if (createDraftError) {
      return { error: `Failed to create version draft: ${createDraftError}` };
    }

    return { versionDraft };
  }

  /**
   * approveDraft(author: UserID, draft: ID, newVersionNum: string) -> (version: VersionDoc)
   *
   * **requires** draft exists ∧ author = draft.requester ∧ newVersionNum unique for recipe
   *
   * **effects** promotes draft to official Version, removes from transient drafts, logs status "Approved" in `promptHistory` of the new version, sets `version.notes` from `draft.notes`.
   */
  async approveDraft(
    { author, draft: draftId, newVersionNum }: {
      author: UserID;
      draft: ID;
      newVersionNum: string;
    },
  ): Promise<{ version: VersionDoc } | { error: string }> {
    // 1. Get the draft
    const { versionDraft: draft, error: draftError } = await this.versionDraftConcept._getDraftById({ id: draftId });
    if (draftError) {
      return { error: `Failed to approve: ${draftError}` };
    }

    // 2. Check authorization: Only the requester of the draft can approve it.
    if (draft.requester !== author) {
      return { error: "Only the requester of the draft can approve it." };
    }

    // 3. Check if newVersionNum is unique for the baseRecipe
    const existingVersion = await this.versions.findOne({
      baseRecipe: draft.baseRecipe,
      versionNum: newVersionNum,
    });
    if (existingVersion) {
      return { error: `Version number '${newVersionNum}' already exists for this recipe.` };
    }

    // 4. Create the new Version based on the draft
    const newVersion: VersionDoc = {
      _id: freshID(),
      baseRecipe: draft.baseRecipe,
      versionNum: newVersionNum,
      author: author, // The approver is the author of this version
      notes: draft.notes, // Use notes from the AI draft
      ingredients: draft.ingredients,
      steps: draft.steps,
      created: new Date(),
      promptHistory: [{ // Log this approval in the new version's history
        promptText: draft.goal,
        modelName: "MockLLM", // Model name used during drafting (can be passed via options)
        timestamp: new Date(),
        draftId: draft._id,
        status: "Approved",
      }],
    };

    try {
      await this.versions.insertOne(newVersion);

      // 5. Remove the draft from transient drafts
      await this.versionDraftConcept.deleteDraft({ id: draftId });

      return { version: newVersion };
    } catch (e) {
      console.error("Error approving draft and creating version:", e);
      return { error: "Failed to approve draft due to database error." };
    }
  }

  /**
   * rejectDraft(author: UserID, draft: ID) -> Empty
   *
   * **requires** draft exists ∧ author = draft.requester
   *
   * **effects** removes draft from transient drafts.
   *
   * **Note on promptHistory**: The specification mentions "logs status 'Rejected' in `promptHistory`".
   * As `promptHistory` is part of a `Version` object, and rejecting a draft does not create a new `Version`,
   * this action, as currently implemented, does not update any `Version`'s `promptHistory`.
   * If tracking rejected drafts is crucial for a `Version`'s lineage, the `promptHistory` field
   * might need to be associated with the `Recipe` concept or a dedicated `PromptLog` concept instead.
   */
  async rejectDraft(
    { author, draft: draftId }: { author: UserID; draft: ID },
  ): Promise<Empty | { error: string }> {
    // 1. Get the draft
    const { versionDraft: draft, error: draftError } = await this.versionDraftConcept._getDraftById({ id: draftId });
    if (draftError) {
      return { error: `Failed to reject: ${draftError}` };
    }

    // 2. Check authorization: Only the requester of the draft can reject it.
    if (draft.requester !== author) {
      return { error: "Only the requester of the draft can reject it." };
    }

    // 3. Remove the draft from transient drafts
    try {
      await this.versionDraftConcept.deleteDraft({ id: draftId });
      // No promptHistory update on Version concept as no new Version is created.
      return {};
    } catch (e) {
      console.error("Error deleting draft:", e);
      return { error: "Failed to reject draft due to database error." };
    }
  }

  // --- Queries ---

  /**
   * _getVersionById (id: ID): (version: VersionDoc)
   *
   * **requires** A version with the given ID exists.
   *
   * **effects** Returns the Version document corresponding to the ID.
   */
  async _getVersionById(
    { id }: { id: ID },
  ): Promise<Array<{ version: VersionDoc }> | { error: string }> {
    const version = await this.versions.findOne({ _id: id });
    if (!version) {
      return { error: `Version with ID '${id}' not found.` };
    }
    return [{ version }];
  }

  /**
   * _listVersionsForRecipe (recipeId: RecipeID): (version: VersionDoc)[]
   *
   * **requires** The recipe exists.
   *
   * **effects** Returns an array of Version documents associated with the given recipe ID, ordered by versionNum.
   */
  async _listVersionsForRecipe(
    { recipeId }: { recipeId: RecipeID },
  ): Promise<Array<{ version: VersionDoc }> | { error: string }> {
    // Check if recipe exists (optional, but good practice for 'requires')
    const baseRecipeDoc = await this.recipeConcept._getRecipeById(recipeId);
    if (!baseRecipeDoc) {
      return { error: `Recipe with ID '${recipeId}' does not exist.` };
    }

    const versions = await this.versions.find({ baseRecipe: recipeId })
      .sort({ versionNum: 1 }) // Lexical sort (e.g., "1.10" comes before "1.2")
      .toArray();

    // It's acceptable for a recipe to have no versions yet. Return empty array rather than error.
    return versions.map(v => ({ version: v }));
  }
}
```
