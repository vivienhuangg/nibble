---
timestamp: 'Sun Oct 19 2025 01:47:26 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_014726.92590bfb.md]]'
content_id: 5020c3441726d8d054403b97e82ab3b4493ec6c53b975f14fc5a6aafe267443a
---

# file: /Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.ts

```typescript
import type { Collection, Db } from "npm:mongodb";
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
  public versions: Collection<VersionDoc>;

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
  async createVersion({
    author,
    recipe,
    versionNum,
    notes,
    ingredients,
    steps,
    promptHistory,
  }: {
    author: User;
    recipe: Recipe;
    versionNum: string;
    notes: string;
    ingredients: Ingredient[];
    steps: Step[];
    promptHistory?: PromptHistoryEntry[]; // Optional, for versions created via AI approval
  }): Promise<{ version: ID } | { error: string }> {
    if (!author) return { error: "Author ID must be provided." };
    if (!recipe) return { error: "Base recipe ID must be provided." };
    if (!versionNum || versionNum.trim() === "") {
      return { error: "Version number cannot be empty." };
    }
    if (notes === undefined || notes === null) {
      // Allow empty string notes
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
      return {
        error: `Failed to create version: ${
          e instanceof Error ? e.message : String(e)
        }`,
      };
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
  async deleteVersion({
    requester,
    version,
  }: {
    requester: User;
    version: ID;
  }): Promise<Empty | { error: string }> {
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
      return {
        error: `Failed to delete version: ${
          e instanceof Error ? e.message : String(e)
        }`,
      };
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
  async draftVersionWithAI({
    author,
    recipe,
    goal,
    options,
  }: {
    author: User;
    recipe: Recipe; // The base recipe ID for which a draft is being created
    goal: string;
    options?: Record<string, any>;
  }): Promise<
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
    const simulatedExpires = new Date(
      simulatedCreated.getTime() + 24 * 60 * 60 * 1000,
    );
    const simulatedConfidence = 0.85; // Example confidence score from AI

    let simulatedIngredients: Ingredient[] = [
      { name: "Flour", quantity: "2 cups" },
      { name: "Sugar", quantity: "1 cup" },
      { name: "Eggs", quantity: "2 large" },
    ];
    const simulatedSteps: Step[] = [
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
      simulatedNotes +=
        " Modified to be vegan-friendly by substituting eggs/dairy.";
    } else if (goal.toLowerCase().includes("cut sugar by half")) {
      simulatedIngredients = simulatedIngredients.map((ing) => {
        if (
          ing.name.toLowerCase() === "sugar" &&
          ing.quantity.includes("cup")
        ) {
          return { ...ing, quantity: "0.5 cup" }; // Halving 1 cup
        }
        return ing;
      });
      simulatedNotes += " Reduced sugar by 50%.";
    } else if (
      goal.toLowerCase().includes("add heat") ||
      goal.toLowerCase().includes("spicy")
    ) {
      simulatedIngredients.push({
        name: "Red pepper flakes",
        quantity: "1 tsp",
        notes: "adjust to taste",
      });
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
  async approveDraft({
    author,
    draftId,
    baseRecipe,
    newVersionNum,
    draftDetails,
  }: {
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
  }): Promise<
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
      !draftDetails ||
      !Array.isArray(draftDetails.ingredients) ||
      !Array.isArray(draftDetails.steps) ||
      !draftDetails.notes
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
  async rejectDraft({
    author,
    draftId,
    baseRecipe,
    goal,
  }: {
    author: User;
    draftId: ID;
    baseRecipe: Recipe;
    goal: string; // Original goal to record in promptHistoryEntry
  }): Promise<
    | { draftToDeleteId: ID; promptHistoryEntry: PromptHistoryEntry }
    | { error: string }
  > {
    if (!author) return { error: "Author ID must be provided." };
    if (!draftId) return { error: "Draft ID must be provided." };
    if (!baseRecipe) return { error: "Base recipe ID must be provided." };
    if (!goal || goal.trim() === "") {
      return { error: "Goal must be provided for logging." };
    }

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
  async _getVersionById({
    version,
  }: {
    version: ID;
  }): Promise<VersionDoc[] | { error: string }> {
    if (!version) return { error: "Version ID must be provided." };

    try {
      const foundVersion = await this.versions.findOne({ _id: version });
      return foundVersion ? [foundVersion] : []; // Queries return an array
    } catch (e) {
      console.error("Error retrieving version by ID:", e);
      return {
        error: `Failed to retrieve version: ${
          e instanceof Error ? e.message : String(e)
        }`,
      };
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
  async _listVersionsByRecipe({
    recipe,
  }: {
    recipe: Recipe;
  }): Promise<VersionDoc[] | { error: string }> {
    if (!recipe) return { error: "Recipe ID must be provided." };

    try {
      const foundVersions = await this.versions
        .find({ baseRecipe: recipe })
        .sort({ created: 1 }) // Order by creation time
        .toArray();
      return foundVersions;
    } catch (e) {
      console.error("Error listing versions by recipe:", e);
      return {
        error: `Failed to list versions: ${
          e instanceof Error ? e.message : String(e)
        }`,
      };
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
  async _listVersionsByAuthor({
    author,
  }: {
    author: User;
  }): Promise<VersionDoc[] | { error: string }> {
    if (!author) return { error: "Author ID must be provided." };

    try {
      const foundVersions = await this.versions.find({ author }).toArray();
      return foundVersions;
    } catch (e) {
      console.error("Error listing versions by author:", e);
      return {
        error: `Failed to list versions: ${
          e instanceof Error ? e.message : String(e)
        }`,
      };
    }
  }
}

```

vivienhuang@H0K79H2RD4 nibble % deno test -A '/Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts'
Check file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts
running 1 test from ./src/concepts/Version/VersionConcept.test.ts
VersionConcept Lifecycle Tests ...
createVersion - successfully creates a new recipe version ...
\------- output -------
\--- Test: createVersion successful ---
createVersion result: { version: "0199fb01-2a6d-7946-9014-f9bd8082225b" }
Fetched version after creation: \[
{
\_id: "0199fb01-2a6d-7946-9014-f9bd8082225b",
baseRecipe: "recipe:Brownies",
versionNum: "1.0",
author: "user:Alice",
notes: "Initial recipe version.",
ingredients: \[
{ name: "Flour", quantity: "1 cup" },
{ name: "Sugar", quantity: "0.5 cup" }
],
steps: \[ { description: "Mix ingredients." } ],
created: 2025-10-19T05:46:21.677Z,
promptHistory: \[]
}
]
\--- End Test: createVersion successful ---
\----- output end -----
createVersion - successfully creates a new recipe version ... ok (98ms)
createVersion - fails with duplicate versionNum for the same recipe ...
\------- output -------
\--- Test: createVersion duplicate versionNum ---
createVersion duplicate result: { error: "Version number '1.0' already exists for this recipe." }
\--- End Test: createVersion duplicate versionNum ---
\----- output end -----
createVersion - fails with duplicate versionNum for the same recipe ... ok (18ms)
createVersion - fails with invalid inputs ...
\------- output -------
\--- Test: createVersion invalid inputs ---
\--- End Test: createVersion invalid inputs ---
\----- output end -----
createVersion - fails with invalid inputs ... ok (19ms)
deleteVersion - successfully deletes a version by its author ...
\------- output -------
\--- Test: deleteVersion successful ---
Version created for deletion: 0199fb01-2af2-76c3-b1c7-a917bd3b5972
deleteVersion result: {}
Fetched version after deletion: \[]
\--- End Test: deleteVersion successful ---
\----- output end -----
deleteVersion - successfully deletes a version by its author ... ok (203ms)
deleteVersion - fails if requester is not the author ...
\------- output -------
\--- Test: deleteVersion non-author ---
deleteVersion by non-author result: { error: "Requester is not the author of this version." }
\--- End Test: deleteVersion non-author ---
\----- output end -----
deleteVersion - fails if requester is not the author ... ok (75ms)
draftVersionWithAI - successfully generates a draft output ...
\------- output -------
\--- Test: draftVersionWithAI successful ---
draftVersionWithAI output: {
draftId: "0199fb01-2bf6-7e76-8fda-67fe06afa802",
baseRecipe: "recipe:Brownies",
requester: "user:Alice",
goal: "Make it gluten-free.",
ingredients: \[
{ name: "Flour", quantity: "2 cups" },
{ name: "Sugar", quantity: "1 cup" },
{ name: "Eggs", quantity: "2 large" }
],
steps: \[
{ description: "Preheat oven to 350F.", duration: 10 },
{ description: "Mix dry ingredients.", duration: 5 },
{
description: "Add wet ingredients to dry and combine.",
duration: 5
},
{ description: "Bake for 30 minutes.", duration: 30 }
],
notes: 'AI-generated draft based on goal: "Make it gluten-free.".',
confidence: 0.85,
created: 2025-10-19T05:46:22.070Z,
expires: 2025-10-20T05:46:22.070Z
}
\--- End Test: draftVersionWithAI successful ---
\----- output end -----
draftVersionWithAI - successfully generates a draft output ... ok (1ms)
draftVersionWithAI - fails with invalid inputs ...
\------- output -------
\--- Test: draftVersionWithAI invalid inputs ---
\--- End Test: draftVersionWithAI invalid inputs ---
\----- output end -----
draftVersionWithAI - fails with invalid inputs ... ok (0ms)
approveDraft - successfully promotes a draft to a version (simulated sync) ...
\------- output -------
\--- Test: approveDraft successful (simulated sync) ---
VersionDraft created: 0199fb01-2bf6-798d-9f36-c0331f924673
approveDraft output: {
newVersionId: "0199fb01-2c3e-7708-9a58-d83f9a21b3fb",
author: "user:Alice",
recipe: "recipe:Brownies",
versionNum: "2.0",
notes: 'AI-generated draft based on goal: "Add more chocolate.".',
ingredients: \[
{ name: "Flour", quantity: "2 cups" },
{ name: "Sugar", quantity: "1 cup" },
{ name: "Eggs", quantity: "2 large" }
],
steps: \[
{ description: "Preheat oven to 350F.", duration: 10 },
{ description: "Mix dry ingredients.", duration: 5 },
{
description: "Add wet ingredients to dry and combine.",
duration: 5
},
{ description: "Bake for 30 minutes.", duration: 30 }
],
draftToDeleteId: "0199fb01-2bf6-798d-9f36-c0331f924673",
promptHistoryEntry: {
promptText: "Add more chocolate.",
modelName: "SimulatedAIModel",
timestamp: 2025-10-19T05:46:22.142Z,
draftId: "0199fb01-2bf6-798d-9f36-c0331f924673",
status: "Approved"
}
}
New Version created via sync: 0199fb01-2c53-72ad-a0bd-166bf1890be8
VersionDraft deleted via sync: 0199fb01-2bf6-798d-9f36-c0331f924673
Fetched new version: \[
{
\_id: "0199fb01-2c53-72ad-a0bd-166bf1890be8",
baseRecipe: "recipe:Brownies",
versionNum: "2.0",
author: "user:Alice",
notes: 'AI-generated draft based on goal: "Add more chocolate.".',
ingredients: \[
{ name: "Flour", quantity: "2 cups" },
{ name: "Sugar", quantity: "1 cup" },
{ name: "Eggs", quantity: "2 large" }
],
steps: \[
{ description: "Preheat oven to 350F.", duration: 10 },
{ description: "Mix dry ingredients.", duration: 5 },
{
description: "Add wet ingredients to dry and combine.",
duration: 5
},
{ description: "Bake for 30 minutes.", duration: 30 }
],
created: 2025-10-19T05:46:22.163Z,
promptHistory: \[
{
promptText: "Add more chocolate.",
modelName: "SimulatedAIModel",
timestamp: 2025-10-19T05:46:22.142Z,
draftId: "0199fb01-2bf6-798d-9f36-c0331f924673",
status: "Approved"
}
]
}
]
\--- End Test: approveDraft successful (simulated sync) ---
\----- output end -----
approveDraft - successfully promotes a draft to a version (simulated sync) ... ok (179ms)
rejectDraft - successfully rejects a draft (simulated sync) ...
\------- output -------
\--- Test: rejectDraft successful (simulated sync) ---
VersionDraft created for rejection: 0199fb01-2ca9-7723-bef2-e41fddef1761
rejectDraft output: {
draftToDeleteId: "0199fb01-2ca9-7723-bef2-e41fddef1761",
promptHistoryEntry: {
promptText: "Make it spicier.",
modelName: "SimulatedAIModel",
timestamp: 2025-10-19T05:46:22.293Z,
draftId: "0199fb01-2ca9-7723-bef2-e41fddef1761",
status: "Rejected"
}
}
VersionDraft deleted via sync (rejected): 0199fb01-2ca9-7723-bef2-e41fddef1761
\--- End Test: rejectDraft successful (simulated sync) ---
\----- output end -----
rejectDraft - successfully rejects a draft (simulated sync) ... ok (116ms)
Queries - retrieve versions by ID, recipe, and author ...
\------- output -------
\--- Test: Queries ---
Actual recipe1 versions: \[ "1.0", "1.2", "2.0", "3.0" ]
Alice's versions: \[
"1.0 (recipe:Brownies)",
"1.0 (recipe:Pizza)",
"1.2 (recipe:Brownies)",
"2.0 (recipe:Brownies)",
"3.0 (recipe:Brownies)"
]
\--- End Test: Queries ---
\----- output end -----
Queries - retrieve versions by ID, recipe, and author ... ok (453ms)
Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. ...
\------- output -------
\--- Trace: Principle Fulfillment ---
Trace Step 2: Manually create initial version (1.0)
Versions after manual 1.0: \[ "1.0" ]
Trace Step 3: Draft new version with AI - 'Cut sugar by 20%'
Draft created: 0199fb01-2f8c-7d8b-8c0c-afb80393c306 Goal: Cut sugar by 20%.
Trace Step 4: Approve AI draft 1 as new Version 1.1
Approved draft promoted to Version: 0199fb01-2fcd-742f-9a1d-0fd44c510c8c
Versions after approving 1.1: \[ "1.0", "1.1" ]
Trace Step 5: Draft another version with AI - 'Make it vegan'
Second draft created: 0199fb01-303a-7ec5-a2ea-2ec1da0c6ff4 Goal: Make it vegan.
Trace Step 6: Reject AI draft 2
Rejected draft deleted: 0199fb01-303a-7ec5-a2ea-2ec1da0c6ff4
Versions after rejecting 2nd draft: \[ "1.0", "1.1" ]
\--- End Trace: Principle Fulfillment ---
\----- output end -----
Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. ... ok (442ms)
VersionConcept Lifecycle Tests ... FAILED (2s)

ERRORS

VersionConcept Lifecycle Tests => ./src/concepts/Version/VersionConcept.test.ts:21:6
error: Leaks detected:

* 4 async calls to op\_read were started in this test, but never completed.
* 6 timers were started in this test, but never completed. This is often caused by not calling `clearTimeout`.
* A TLS connection was opened/accepted during the test, but not closed during the test. Close the TLS connection by calling `tlsConn.close()`.
  To get more details where leaks occurred, run again with the --trace-leaks flag.

FAILURES

VersionConcept Lifecycle Tests => ./src/concepts/Version/VersionConcept.test.ts:21:6

FAILED | 0 passed (11 steps) | 1 failed (2s)

error: Test failed
