---
timestamp: 'Sun Oct 19 2025 14:02:40 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140240.7ef6a09a.md]]'
content_id: 19aa4f97b4625d59db2d48def7c73016e6cbbd1f7cebab44d574a8bcbb97d7f5
---

# file: /Users/vivienhuang/6.1040/nibble/src/concepts/VersionDraft/VersionDraftConcept.ts

```typescript
import type { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import type { Empty, ID } from "@utils/types.ts";

/**
 * concept VersionDraft [User, Recipe] (Transient)
 *
 * purpose represent a temporary, AI-generated suggestion for a recipe modification, awaiting user review.
 * principle drafts provide AI assistance without directly altering canonical recipe data.
 */
// Declare collection prefix, use concept name
const PREFIX = "VersionDraft" + ".";

// Generic types of this concept
type User = ID;
type Recipe = ID;

// --- Helper types for Ingredient and Step, based on Recipe concept's state ---
/**
 * represents a specific item needed for a recipe.
 */
interface Ingredient {
  name: string;
  quantity: string;
  unit?: string; // e.g., "cup", "tbsp", "g"
  notes?: string; // e.g., "freshly chopped"
}

/**
 * represents a single instruction in a recipe.
 */
interface Step {
  description: string;
  duration?: number; // in minutes
  notes?: string; // e.g., "stir until golden brown"
}
// -----------------------------------------------------------------------------

/**
 * State of the VersionDraft concept
 *
 * a set of VersionDrafts with
 *  id : UUID
 *  requester : User
 *  baseRecipe : Recipe
 *  goal : String
 *  ingredients : List[Ingredient]
 *  steps : List[Step]
 *  notes : String
 *  confidence : Optional[Float]
 *  created : DateTime
 *  expires : DateTime
 */
interface VersionDraftDoc {
  _id: ID; // Maps to concept 'id'
  requester: User;
  baseRecipe: Recipe;
  goal: string;
  ingredients: Ingredient[]; // Proposed changes
  steps: Step[]; // Proposed changes
  notes: string; // AI-generated summary of changes
  confidence?: number; // AI's confidence in the draft
  created: Date;
  expires: Date; // e.g., 24 hours
}

export default class VersionDraftConcept {
  drafts: Collection<VersionDraftDoc>;

  constructor(private readonly db: Db) {
    this.drafts = this.db.collection(PREFIX + "drafts");
  }

  /**
   * createDraft (requester: User, baseRecipe: Recipe, goal: String, ingredients: List[Ingredient], steps: List[Step], notes: String, confidence?: Float): (id: UUID) | (error: String)
   *
   * **purpose** Creates a new transient AI-generated version draft.
   *
   * **requires** baseRecipe exists; goal is not empty; ingredients and steps are well-formed.
   *
   * **effects** A new VersionDraft document is created with a fresh ID,
   *            associated with the requester, baseRecipe, and AI-generated content.
   *            `created` and `expires` timestamps are set. Returns the ID of the new draft.
   */
  async createDraft({
    requester,
    baseRecipe,
    goal,
    ingredients,
    steps,
    notes,
    confidence,
  }: {
    requester: User;
    baseRecipe: Recipe;
    goal: string;
    ingredients: Ingredient[];
    steps: Step[];
    notes: string;
    confidence?: number;
  }): Promise<{ id: ID } | { error: string }> {
    if (!baseRecipe) {
      return { error: "Base recipe ID must be provided." };
    }
    if (!requester) {
      return { error: "Requester ID must be provided." };
    }
    if (!goal || goal.trim() === "") {
      return { error: "Goal cannot be empty." };
    }
    // Basic validation for ingredients and steps structure (can be extended)
    if (!Array.isArray(ingredients) || !Array.isArray(steps)) {
      return { error: "Ingredients and steps must be arrays." };
    }

    const newId = freshID();
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const newDraft: VersionDraftDoc = {
      _id: newId,
      requester,
      baseRecipe,
      goal,
      ingredients,
      steps,
      notes,
      confidence,
      created: now,
      expires,
    };

    try {
      await this.drafts.insertOne(newDraft);
      return { id: newId };
    } catch (e) {
      console.error("Error creating draft:", e);
      return {
        error: `Failed to create draft: ${
          e instanceof Error ? e.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * deleteDraft (id: UUID): Empty | (error: String)
   *
   * **purpose** Removes a transient AI-generated version draft.
   *
   * **requires** A VersionDraft with the given `id` exists.
   *
   * **effects** The VersionDraft document with the specified `id` is removed from the system.
   */
  async deleteDraft({ id }: { id: ID }): Promise<Empty | { error: string }> {
    if (!id) {
      return { error: "Draft ID must be provided." };
    }

    try {
      const result = await this.drafts.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        return { error: `Draft with ID ${id} not found.` };
      }
      return {};
    } catch (e) {
      console.error("Error deleting draft:", e);
      return {
        error: `Failed to delete draft: ${
          e instanceof Error ? e.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * _getDraftById (id: UUID): VersionDraftDoc[] | (error: String)
   *
   * **purpose** Retrieves a specific version draft by its ID.
   *
   * **requires** A VersionDraft with the given `id` exists.
   *
   * **effects** Returns an array containing the VersionDraft document if found, otherwise an empty array or an error.
   */
  async _getDraftById({
    id,
  }: {
    id: ID;
  }): Promise<VersionDraftDoc[] | { error: string }> {
    if (!id) {
      return { error: "Draft ID must be provided." };
    }

    try {
      const draft = await this.drafts.findOne({ _id: id });
      return draft ? [draft] : [];
    } catch (e) {
      console.error("Error retrieving draft by ID:", e);
      return {
        error: `Failed to retrieve draft: ${
          e instanceof Error ? e.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * _listDraftsByRequester (requester: User): VersionDraftDoc[] | (error: String)
   *
   * **purpose** Lists all version drafts requested by a specific user.
   *
   * **requires** The requester ID is valid.
   *
   * **effects** Returns an array of VersionDraft documents associated with the requester, or an empty array.
   */
  async _listDraftsByRequester({
    requester,
  }: {
    requester: User;
  }): Promise<VersionDraftDoc[] | { error: string }> {
    if (!requester) {
      return { error: "Requester ID must be provided." };
    }

    try {
      const drafts = await this.drafts.find({ requester }).toArray();
      return drafts;
    } catch (e) {
      console.error("Error listing drafts by requester:", e);
      return {
        error: `Failed to list drafts: ${
          e instanceof Error ? e.message : "Unknown error"
        }`,
      };
    }
  }

  // --- Optional System Action for cleanup, not explicitly in spec but good practice for transient data ---
  /**
   * system _cleanupExpiredDrafts (): Empty | (error: String)
   *
   * **purpose** Automatically removes version drafts that have passed their expiry time.
   *
   * **requires** The current time is after a draft's `expires` timestamp.
   *
   * **effects** All expired VersionDraft documents are removed from the system.
   */
  async _cleanupExpiredDrafts(): Promise<Empty | { error: string }> {
    try {
      const now = new Date();
      const result = await this.drafts.deleteMany({ expires: { $lt: now } });
      console.log(`Cleaned up ${result.deletedCount} expired drafts.`);
      return {};
    } catch (e) {
      console.error("Error cleaning up expired drafts:", e);
      return {
        error: `Failed to clean up expired drafts: ${
          e instanceof Error ? e.message : "Unknown error"
        }`,
      };
    }
  }
}

```
