---
timestamp: 'Sat Oct 18 2025 22:59:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_225952.1bc0cce6.md]]'
content_id: 6f7c087e052b1315915efa963bc6e2acac9f87c17bf2ab7e2c1fdd146e37f19c
---

# file: src/concepts/Version/VersionDraftConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { Ingredient, Step, RecipeID, UserID } from "@concepts/Recipe/RecipeConcept.ts"; // Re-use types from Recipe

const PREFIX = "VersionDraft" + ".";

/**
 * Interface representing the state of a VersionDraft concept.
 * These are transient, AI-generated suggestions for recipe modifications.
 */
export interface VersionDraftDoc {
  _id: ID; // id : UUID
  requester: UserID;
  baseRecipe: RecipeID;
  goal: string;
  ingredients: Ingredient[];
  steps: Step[];
  notes: string;
  confidence?: number; // Float
  created: Date;
  expires: Date;
}

/**
 * Implements the VersionDraft concept, managing temporary, AI-generated
 * recipe modification suggestions.
 */
export default class VersionDraftConcept {
  drafts: Collection<VersionDraftDoc>;

  constructor(private readonly db: Db) {
    this.drafts = this.db.collection(PREFIX + "drafts");
  }

  /**
   * createDraft(requester: UserID, baseRecipe: RecipeID, goal: string, ingredients: Ingredient[], steps: Step[], notes: string, confidence?: number, created?: Date, expires?: Date) -> (versionDraft: VersionDraftDoc)
   *
   * **requires** requester exists, baseRecipe exists, goal is not empty, ingredients and steps are well-formed.
   *
   * **effects** Creates a new VersionDraft document, assigns a fresh ID, sets creation and expiration times, and returns the created draft.
   */
  async createDraft(
    { requester, baseRecipe, goal, ingredients, steps, notes, confidence, created, expires }: {
      requester: UserID;
      baseRecipe: RecipeID;
      goal: string;
      ingredients: Ingredient[];
      steps: Step[];
      notes: string;
      confidence?: number;
      created?: Date;
      expires?: Date;
    },
  ): Promise<{ versionDraft: VersionDraftDoc } | { error: string }> {
    if (!requester || !baseRecipe || !goal) {
      return { error: "Requester, baseRecipe, and goal are required." };
    }
    if (!ingredients || !Array.isArray(ingredients) || !steps || !Array.isArray(steps)) {
      return { error: "Ingredients and steps must be well-formed arrays." };
    }
    for (const ingredient of ingredients) {
        if (!ingredient.name || !ingredient.quantity) return { error: "Ingredient missing name or quantity" };
    }
    for (const step of steps) {
        if (!step.description) return { error: "Step missing description" };
    }


    const newDraft: VersionDraftDoc = {
      _id: freshID(),
      requester,
      baseRecipe,
      goal,
      ingredients,
      steps,
      notes,
      confidence,
      created: created || new Date(),
      expires: expires || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24-hour expiry
    };

    try {
      await this.drafts.insertOne(newDraft);
      return { versionDraft: newDraft };
    } catch (e) {
      console.error("Error creating draft:", e);
      return { error: "Failed to create version draft due to database error." };
    }
  }

  /**
   * _getDraftById (id: ID): (versionDraft: VersionDraftDoc)
   *
   * **requires** A draft with the given ID exists.
   *
   * **effects** Returns the VersionDraft document corresponding to the ID.
   */
  async _getDraftById(
    { id }: { id: ID },
  ): Promise<{ versionDraft: VersionDraftDoc } | { error: string }> {
    const draft = await this.drafts.findOne({ _id: id });
    if (!draft) {
      return { error: `VersionDraft with ID '${id}' not found.` };
    }
    return { versionDraft: draft };
  }

  /**
   * deleteDraft (id: ID): Empty
   *
   * **requires** A draft with the given ID exists.
   *
   * **effects** Removes the VersionDraft document corresponding to the ID.
   */
  async deleteDraft({ id }: { id: ID }): Promise<Empty> {
    await this.drafts.deleteOne({ _id: id });
    return {};
  }
}
```

Finally, the `Version` concept implementation.
