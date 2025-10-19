---
timestamp: 'Sun Oct 19 2025 01:09:17 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_010917.6643b1f9.md]]'
content_id: d0345e4b38d16f94a4475557c863ad531a5c4b10bfa241699ea0a1ee749fde9c
---

# response:

```typescript
// file: src/concepts/Version/VersionConcept.ts
import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import type { Empty, ID } from "@utils/types.ts";

// Declare collection prefix, use concept name
const PREFIX = "Version" + ".";

// Generic types of this concept
type User = ID; // Refers to the User concept's ID
type Recipe = ID; // Refers to the Recipe concept's ID

/**
 * Represents a specific item needed for a recipe.
 * Copied from RecipeConcept for self-containment as per concept design rules.
 */
interface Ingredient {
  name: string;
  quantity: string; // e.g., "1 cup", "2 tablespoons", "to taste"
  unit?: string; // e.g., "cup", "tbsp", "g"
  notes?: string; // e.g., "freshly chopped"
}

/**
 * Represents a single instruction in a recipe.
 * Copied from RecipeConcept for self-containment as per concept design rules.
 */
interface Step {
  description: string;
  duration?: number; // in minutes
  notes?: string; // e.g., "stir until golden brown"
}

/**
 * Represents an entry in the prompt history, tracking AI interactions
 * related to the creation or modification of this specific version.
 */
interface PromptHistoryEntry {
  promptText: string;
  modelName: string;
  timestamp: Date;
  draftId: ID; // Refers to a VersionDraft ID
  status: "Approved" | "Rejected" | "Generated" | "Failed";
}

/**
 * concept Version [User, Recipe] (AI-Augmented)
 *
 * purpose capture concrete modifications to a recipe as immutable snapshots — with optional AI assistance that can propose draft versions from natural-language goals.
 * principle users can create versions manually or use AI to draft one (“make this vegan”, “cut sugar by half”, etc.); drafts are reviewed, edited, and either approved or rejected.
 */
interface VersionDoc {
  _id: ID; // Maps to concept 'id'
  baseRecipe: Recipe;
  versionNum: string; // e.g., "1.0", "1.1", "2.0"
  author: User;
  notes: string; // describing changes from the base recipe or previous version
  ingredients: Ingredient[];
  steps: Step[];
  created: Date;
  promptHistory: PromptHistoryEntry[];
}

export default class VersionConcept {
  private versions: Collection<VersionDoc>;

  constructor(private readonly db: Db) {
    this.versions = this.db.collection(PREFIX + "versions");
  }

  /**
   * createVersion (author: User, recipe: Recipe, versionNum: String, notes: String, ingredients: List[Ingredient], steps: List[Step]): (version: ID) | (error: String)
   *
   * **purpose** Creates a new immutable version of a recipe.
   *
   * **requires** recipe exists; versionNum unique for recipe (e.g., "1.0", "1.1", "2.0"); ingredients/steps must be well-formed.
   *
   * **effects** adds new version linked to recipe, sets `created`; returns the ID of the new version.
   */
  async createVersion(
    { author, recipe, versionNum, notes, ingredients, steps, promptHistory }: {
      author: User;
      recipe: Recipe;
      versionNum: string;
      notes: string;
      ingredients: Ingredient[];
      steps: Step[];
      promptHistory?: PromptHistoryEntry[]; // Optional, for versions created via AI approval
    },
  ): Promise<{ version: ID } | { error: string }> {
    if (!author) return { error: "Author ID must be provided." };
    if (!recipe) return { error: "Base recipe ID must be provided." };
    if (!versionNum || versionNum.trim() === "") {
      return { error: "Version number cannot be empty." };
    }
    if (notes === undefined || notes === null) { // Allow empty string notes
      return { error: "Notes for the version must be provided." };
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return { error: "Version must have at least one ingredient." };
    }
    if (!Array.isArray(steps) || steps.length === 0) {
      return { error: "Version must have at least one step." };
    }

    // Check for versionNum uniqueness for this recipe
    const existingVersion = await this.versions.findOne({
      baseRecipe: recipe,
      versionNum: versionNum,
    });
    if (existingVersion) {
      return {
        error: `Version number '${versionNum}' already exists for this recipe.`,
      };
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

    const newId = freshID();
    const now = new Date();

    const newVersion: VersionDoc = {
      _id: newId,
      baseRecipe: recipe,
      versionNum,
      author,
      notes,
      ingredients,
      steps,
      created: now,
      promptHistory: promptHistory || [], // Populate if provided (from AI approval), otherwise empty
    };

    try {
      await this.versions.insertOne(newVersion);
      return { version: newId };
    } catch (e) {
      console.error("Error creating version:", e);
      return { error: `Failed to create version: ${e.message}` };
    }
  }

  /**
   * deleteVersion (requester: User, version: ID): Empty | (error: String)
   *
   * **purpose** Deletes a specific recipe version.
   *
   * **requires** requester = version.author OR requester = recipe.owner (the latter check is typically handled by sync with Recipe concept).
   *
   * **effects** removes version.
   */
  async deleteVersion(
    { requester, version }: { requester: User; version: ID },
  ): Promise<Empty | { error: string }> {
    if (!requester) return { error: "Requester ID must be provided." };
    if (!version) return { error: "Version ID must be provided." };

    try {
      const existingVersion = await this.versions.findOne({ _id: version });
      if (!existingVersion) {
        return { error: `Version with ID ${version} not found.` };
      }

      // This check ensures the requester is the original author of this version.
      // If `recipe.owner` is allowed to delete any version of their recipe,
      // a synchronization would trigger this `deleteVersion` action with `recipe.owner` as the `requester`.
      if (existingVersion.author !== requester) {
        return {
          error: "Requester is not the author of this version.",
        };
      }

      const result = await this.versions.deleteOne({ _id: version });
      if (result.deletedCount === 0) {
        return { error: `Failed to delete version with ID ${version}.` };
      }
      return {};
    } catch (e) {
      console.error("Error deleting version:", e);
      return { error: `Failed to delete version: ${e.message}` };
    }
  }

  /**
   * draftVersionWithAI (author: User, recipe: Recipe, goal: String, options?: Record<string, any>):
   *   (draftId: ID, baseRecipe: Recipe, requester: User, goal: String, ingredients: List[Ingredient], steps: List[Step], notes: String, confidence?: Float, created: DateTime, expires: DateTime) | (error: String)
   *
   * **purpose** Initiates an AI-driven process to suggest modifications to a recipe, outputting data to create a transient draft.
   *
   * **requires** recipe exists; goal ≠ ""; (LLM service available externally).
   *
   * **effects** Simulates an LLM call to get proposed changes; outputs all data necessary for a sync to create a `VersionDraft`.
   *            Does not directly modify `Version` concept state, as `promptHistory` is populated when a draft is approved into a concrete version.
   */
  async draftVersionWithAI(
    { author, recipe, goal, options }: {
      author: User;
      recipe: Recipe; // The base recipe ID for which a draft is being created
      goal: string;
      options?: Record<string, any>;
    },
  ): Promise<
    | {
      draftId: ID;
      baseRecipe: Recipe;
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
    if (!recipe) return { error: "Base recipe ID must be provided." };
    if (!goal || goal.trim() === "") return { error: "Goal cannot be empty." };

    // --- Simulate LLM call and draft generation ---
    const simulatedDraftId = freshID();
    const simulatedCreated = new Date();
    // Drafts expire after 24 hours
    const simulatedExpires = new Date(simulatedCreated.getTime() + 24 * 60 * 60 * 1000);
    const simulatedConfidence = 0.85; // Example confidence score from AI

    let simulatedIngredients: Ingredient[] = [
      { name: "Flour", quantity: "2 cups" },
      { name: "Sugar", quantity: "1 cup" },
      { name: "Eggs", quantity: "2 large" },
    ];
    let simulatedSteps: Step[] = [
      { description: "Preheat oven to 350F.", duration: 10 },
      { description: "Mix dry ingredients.", duration: 5 },
      { description: "Add wet ingredients to dry and combine.", duration: 5 },
      { description: "Bake for 30 minutes.", duration: 30 },
    ];
    let simulatedNotes = `AI-generated draft based on goal: "${goal}".`;

    // Apply simple logic based on goal for simulation purposes
    if (goal.toLowerCase().includes("vegan")) {
      simulatedIngredients = [
        { name: "All-purpose flour", quantity: "2 cups" },
        { name: "Granulated sugar", quantity: "1 cup" },
        { name: "Cocoa powder", quantity: "0.5 cup" },
        { name: "Plant-based milk", quantity: "1 cup" },
        { name: "Vegetable oil", quantity: "0.5 cup" },
        { name: "Baking powder", quantity: "1 tsp" },
      ];
      simulatedNotes += " Modified to be vegan-friendly by substituting eggs/dairy.";
    } else if (goal.toLowerCase().includes("cut sugar by half")) {
      simulatedIngredients = simulatedIngredients.map((ing) => {
        if (ing.name.toLowerCase() === "sugar" && ing.quantity.includes("cup")) {
          return { ...ing, quantity: "0.5 cup" }; // Halving 1 cup
        }
        return ing;
      });
      simulatedNotes += " Reduced sugar by 50%.";
    } else if (goal.toLowerCase().includes("add heat") || goal.toLowerCase().includes("spicy")) {
      simulatedIngredients.push({ name: "Red pepper flakes", quantity: "1 tsp", notes: "adjust to taste" });
      simulatedNotes += " Added a kick of heat with red pepper flakes.";
    }
    // --- End Simulation ---

    // This action *outputs* the data needed for a sync to create a VersionDraft.
    // The Version concept itself does not hold the transient draft state.
    return {
      draftId: simulatedDraftId,
      baseRecipe: recipe,
      requester: author,
      goal,
      ingredients: simulatedIngredients,
      steps: simulatedSteps,
      notes: simulatedNotes,
      confidence: simulatedConfidence,
      created: simulatedCreated,
      expires: simulatedExpires,
    };
  }

  /**
   * approveDraft (author: User, draftId: ID, baseRecipe: Recipe, newVersionNum: String, draftDetails: { ingredients: List[Ingredient], steps: List[Step], notes: String, goal: String, confidence?: Float }):
   *   (newVersionId: ID, author: User, recipe: Recipe, versionNum: String, notes: String, ingredients: List[Ingredient], steps: List[Step], draftToDeleteId: ID, promptHistoryEntry: PromptHistoryEntry) | (error: String)
   *
   * **purpose** Approves a specific AI-generated draft, initiating its promotion to an official immutable version and the deletion of the transient draft.
   *
   * **requires** draft exists (implicitly, as `draftId` and `draftDetails` are passed); author is the requester of the draft (implicitly handled by sync/client); newVersionNum unique for recipe.
   *
   * **effects** Outputs data to trigger: 1) creation of a new `Version` (including the approved `promptHistoryEntry`), and 2) deletion of the `VersionDraft`.
   *            This action does not directly modify `Version` concept state, but prepares the data for a new `Version` record to be created via sync.
   */
  async approveDraft(
    { author, draftId, baseRecipe, newVersionNum, draftDetails }: {
      author: User;
      draftId: ID;
      baseRecipe: Recipe;
      newVersionNum: string;
      draftDetails: {
        ingredients: Ingredient[];
        steps: Step[];
        notes: string;
        goal: string; // Original goal to record in promptHistory
        confidence?: number;
      };
    },
  ): Promise<
    | {
      newVersionId: ID;
      author: User;
      recipe: Recipe;
      versionNum: string;
      notes: string;
      ingredients: Ingredient[];
      steps: Step[];
      draftToDeleteId: ID;
      promptHistoryEntry: PromptHistoryEntry; // The entry to be added to the new Version
    }
    | { error: string }
  > {
    if (!author) return { error: "Author ID must be provided." };
    if (!draftId) return { error: "Draft ID must be provided." };
    if (!baseRecipe) return { error: "Base recipe ID must be provided." };
    if (!newVersionNum || newVersionNum.trim() === "") {
      return { error: "New version number cannot be empty." };
    }
    if (
      !draftDetails || !Array.isArray(draftDetails.ingredients) ||
      !Array.isArray(draftDetails.steps) || !draftDetails.notes
    ) {
      return { error: "Incomplete draft details provided." };
    }

    // Check newVersionNum uniqueness for this base recipe
    const existingVersionWithNewNum = await this.versions.findOne({
      baseRecipe: baseRecipe,
      versionNum: newVersionNum,
    });
    if (existingVersionWithNewNum) {
      return {
        error:
          `Version number '${newVersionNum}' already exists for this recipe.`,
      };
    }

    // Prepare the PromptHistoryEntry for the NEW version being created.
    // This is derived from the draftDetails passed.
    const promptHistoryEntry: PromptHistoryEntry = {
      promptText: draftDetails.goal,
      modelName: "SimulatedAIModel", // Placeholder for actual LLM used
      timestamp: new Date(),
      draftId: draftId,
      status: "Approved",
    };

    const newVersionId = freshID();

    // Output all necessary info for syncs to create a new Version and delete the VersionDraft.
    // The `createVersion` action (above) will use `newVersionId` and `promptHistoryEntry`.
    return {
      newVersionId: newVersionId,
      author: author,
      recipe: baseRecipe,
      versionNum: newVersionNum,
      notes: draftDetails.notes,
      ingredients: draftDetails.ingredients,
      steps: draftDetails.steps,
      draftToDeleteId: draftId,
      promptHistoryEntry: promptHistoryEntry,
    };
  }

  /**
   * rejectDraft (author: User, draftId: ID, baseRecipe: Recipe, goal: String): (draftToDeleteId: ID, promptHistoryEntry: PromptHistoryEntry) | (error: String)
   *
   * **purpose** Rejects a specific AI-generated draft, initiating its removal from transient drafts.
   *
   * **requires** draft exists (implicitly via `draftId`); author is the requester of the draft (implicitly handled by sync/client).
   *
   * **effects** Outputs data to trigger deletion of the `VersionDraft`. Also outputs a `promptHistoryEntry` with "Rejected" status.
   *            This `promptHistoryEntry` is not stored within the `Version` concept itself by this action,
   *            as no `VersionDoc` is created from a rejected draft.
   */
  async rejectDraft(
    { author, draftId, baseRecipe, goal }: {
      author: User;
      draftId: ID;
      baseRecipe: Recipe;
      goal: string; // Original goal to record in promptHistoryEntry
    },
  ): Promise<
    | { draftToDeleteId: ID; promptHistoryEntry: PromptHistoryEntry }
    | { error: string }
  > {
    if (!author) return { error: "Author ID must be provided." };
    if (!draftId) return { error: "Draft ID must be provided." };
    if (!baseRecipe) return { error: "Base recipe ID must be provided." };
    if (!goal || goal.trim() === "") return { error: "Goal must be provided for logging." };

    // Prepare the PromptHistoryEntry for the rejected draft.
    const promptHistoryEntry: PromptHistoryEntry = {
      promptText: goal,
      modelName: "SimulatedAIModel", // Placeholder for actual LLM used
      timestamp: new Date(),
      draftId: draftId,
      status: "Rejected",
    };

    // This action doesn't modify the VersionConcept's state directly.
    // It outputs the draftId to be deleted and the history entry for potential logging elsewhere.
    return { draftToDeleteId: draftId, promptHistoryEntry: promptHistoryEntry };
  }

  // --- Queries ---

  /**
   * _getVersionById (version: ID): VersionDoc[] | (error: String)
   *
   * **purpose** Retrieves a specific recipe version by its ID.
   *
   * **requires** The version ID exists.
   *
   * **effects** Returns an array containing the Version document if found, otherwise an empty array or an error.
   */
  async _getVersionById(
    { version }: { version: ID },
  ): Promise<VersionDoc[] | { error: string }> {
    if (!version) return { error: "Version ID must be provided." };

    try {
      const foundVersion = await this.versions.findOne({ _id: version });
      return foundVersion ? [foundVersion] : []; // Queries return an array
    } catch (e) {
      console.error("Error retrieving version by ID:", e);
      return { error: `Failed to retrieve version: ${e.message}` };
    }
  }

  /**
   * _listVersionsByRecipe (recipe: Recipe): VersionDoc[] | (error: String)
   *
   * **purpose** Lists all versions associated with a specific base recipe.
   *
   * **requires** The recipe ID exists.
   *
   * **effects** Returns an array of Version documents for the given recipe, ordered by creation time.
   */
  async _listVersionsByRecipe(
    { recipe }: { recipe: Recipe },
  ): Promise<VersionDoc[] | { error: string }> {
    if (!recipe) return { error: "Recipe ID must be provided." };

    try {
      const foundVersions = await this.versions.find({ baseRecipe: recipe })
        .sort({ created: 1 }) // Order by creation time
        .toArray();
      return foundVersions;
    } catch (e) {
      console.error("Error listing versions by recipe:", e);
      return { error: `Failed to list versions: ${e.message}` };
    }
  }

  /**
   * _listVersionsByAuthor (author: User): VersionDoc[] | (error: String)
   *
   * **purpose** Lists all versions authored by a specific user.
   *
   * **requires** The author ID exists.
   *
   * **effects** Returns an array of Version documents authored by the given user.
   */
  async _listVersionsByAuthor(
    { author }: { author: User },
  ): Promise<VersionDoc[] | { error: string }> {
    if (!author) return { error: "Author ID must be provided." };

    try {
      const foundVersions = await this.versions.find({ author }).toArray();
      return foundVersions;
    } catch (e) {
      console.error("Error listing versions by author:", e);
      return { error: `Failed to list versions: ${e.message}` };
    }
  }
}
```
