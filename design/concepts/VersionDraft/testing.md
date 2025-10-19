[@implementation](implementation.md)

[@testing-concepts](../../background/testing-concepts.md)

# test: VersionDraft


# response:

```typescript
// file: src/VersionDraft/VersionDraftConcept.test.ts
import {
  assertEquals,
  assertExists,
  assertNotEquals,
  assert,
} from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import VersionDraftConcept from "./VersionDraftConcept.ts";

// Helper types for Ingredient and Step for consistency with the concept's internal types
interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
  notes?: string;
}

interface Step {
  description: string;
  duration?: number;
  notes?: string;
}

Deno.test("VersionDraft Concept Actions and Queries", async (t) => {
  const [db, client] = await testDb();
  const concept = new VersionDraftConcept(db);

  const userA: ID = "user:Alice" as ID;
  const recipe1: ID = "recipe:MatchaBrownies" as ID;

  Deno.test.afterAll(async () => {
    await client.close();
  });

  await t.step("createDraft: successfully creates a new version draft", async () => {
    console.log("--- Test: createDraft success ---");
    const goal = "Cut sugar by 20% for potluck.";
    const ingredients: Ingredient[] = [
      { name: "Sugar", quantity: "0.8 cup", unit: "cup" },
    ];
    const steps: Step[] = [{ description: "Mix dry ingredients." }];
    const notes = "Reduced sugar based on AI suggestion.";
    const confidence = 0.9;

    console.log(
      `Attempting to create a draft for user ${userA}, recipe ${recipe1} with goal: "${goal}"`,
    );
    const result = await concept.createDraft({
      requester: userA,
      baseRecipe: recipe1,
      goal,
      ingredients,
      steps,
      notes,
      confidence,
    });

    assertExists((result as { id: ID }).id, "createDraft should return an ID on success");
    const newDraftId = (result as { id: ID }).id;
    console.log(`Effect confirmed: New draft created with ID: ${newDraftId}`);

    // Verify state change
    const retrievedDraft = await concept._getDraftById({ id: newDraftId });
    assert(Array.isArray(retrievedDraft), "retrievedDraft should be an array");
    assertEquals(retrievedDraft.length, 1, "Should find exactly one draft");
    assertEquals(
      retrievedDraft[0].requester,
      userA,
      "Retrieved draft requester should match",
    );
    assertEquals(
      retrievedDraft[0].baseRecipe,
      recipe1,
      "Retrieved draft baseRecipe should match",
    );
    assertEquals(retrievedDraft[0].goal, goal, "Retrieved draft goal should match");
    assertEquals(
      retrievedDraft[0].ingredients[0].name,
      ingredients[0].name,
      "Retrieved draft ingredients should match",
    );
    assert(
      retrievedDraft[0].created instanceof Date,
      "Created timestamp should be a Date object",
    );
    assert(
      retrievedDraft[0].expires instanceof Date,
      "Expires timestamp should be a Date object",
    );
    assert(
      retrievedDraft[0].expires.getTime() > retrievedDraft[0].created.getTime(),
      "Expires should be after created",
    );
    console.log("Requirement met: All input fields are valid.");
    console.log("Effect confirmed: Draft properties verified in database.");
  });

  await t.step(
    "createDraft: returns error for missing required fields",
    async () => {
      console.log("--- Test: createDraft error cases ---");
      const ingredients: Ingredient[] = [{ name: "Salt", quantity: "1 tsp" }];
      const steps: Step[] = [{ description: "Add salt." }];
      const notes = "Basic notes.";

      // Missing baseRecipe
      console.log("Attempting to create draft with missing baseRecipe...");
      let result = await concept.createDraft({
        requester: userA,
        baseRecipe: "" as ID,
        goal: "Test goal",
        ingredients,
        steps,
        notes,
      });
      assertExists((result as { error: string }).error, "Should return an error for missing baseRecipe");
      assertEquals(
        (result as { error: string }).error,
        "Base recipe ID must be provided.",
        "Error message should indicate missing baseRecipe",
      );
      console.log(
        `Requirement not met: Missing baseRecipe. Effect confirmed: Error returned "${(result as { error: string }).error}"`,
      );

      // Missing requester
      console.log("Attempting to create draft with missing requester...");
      result = await concept.createDraft({
        requester: "" as ID,
        baseRecipe: recipe1,
        goal: "Test goal",
        ingredients,
        steps,
        notes,
      });
      assertExists((result as { error: string }).error, "Should return an error for missing requester");
      assertEquals(
        (result as { error: string }).error,
        "Requester ID must be provided.",
        "Error message should indicate missing requester",
      );
      console.log(
        `Requirement not met: Missing requester. Effect confirmed: Error returned "${(result as { error: string }).error}"`,
      );

      // Empty goal
      console.log("Attempting to create draft with empty goal...");
      result = await concept.createDraft({
        requester: userA,
        baseRecipe: recipe1,
        goal: "",
        ingredients,
        steps,
        notes,
      });
      assertExists((result as { error: string }).error, "Should return an error for empty goal");
      assertEquals(
        (result as { error: string }).error,
        "Goal cannot be empty.",
        "Error message should indicate empty goal",
      );
      console.log(
        `Requirement not met: Empty goal. Effect confirmed: Error returned "${(result as { error: string }).error}"`,
      );

      // Invalid ingredients (not array)
      console.log("Attempting to create draft with invalid ingredients...");
      result = await concept.createDraft({
        requester: userA,
        baseRecipe: recipe1,
        goal: "Valid goal",
        ingredients: "not an array" as unknown as Ingredient[],
        steps,
        notes,
      });
      assertExists((result as { error: string }).error, "Should return an error for invalid ingredients");
      assertEquals(
        (result as { error: string }).error,
        "Ingredients and steps must be arrays.",
        "Error message should indicate invalid ingredients",
      );
      console.log(
        `Requirement not met: Invalid ingredients. Effect confirmed: Error returned "${(result as { error: string }).error}"`,
      );
    },
  );

  await t.step("deleteDraft: successfully deletes an existing version draft", async () => {
    console.log("--- Test: deleteDraft success ---");
    const userB: ID = "user:Bob" as ID;
    const recipe2: ID = "recipe:SpicyChili" as ID;
    const createResult = await concept.createDraft({
      requester: userB,
      baseRecipe: recipe2,
      goal: "Make it spicier",
      ingredients: [{ name: "Chili flakes", quantity: "1 tsp" }],
      steps: [{ description: "Add chili." }],
      notes: "Increased spice level.",
    });
    const draftIdToDelete = (createResult as { id: ID }).id;
    assertExists(draftIdToDelete, "Pre-condition: Draft to delete must exist.");
    console.log(`Pre-condition: Created draft with ID: ${draftIdToDelete}`);

    console.log(`Attempting to delete draft with ID: ${draftIdToDelete}`);
    const deleteResult = await concept.deleteDraft({ id: draftIdToDelete });
    assertEquals(deleteResult, {}, "deleteDraft should return empty object on success");
    console.log("Effect confirmed: deleteDraft returned empty object.");

    // Verify state change
    const retrievedDraft = await concept._getDraftById({ id: draftIdToDelete });
    assertEquals(
      retrievedDraft.length,
      0,
      "Should find no drafts after deletion",
    );
    console.log("Requirement met: Draft with ID exists. Effect confirmed: Draft is no longer in database.");
  });

  await t.step(
    "deleteDraft: returns error for non-existent or missing ID",
    async () => {
      console.log("--- Test: deleteDraft error cases ---");
      const nonExistentId: ID = freshID();

      // Non-existent ID
      console.log(
        `Attempting to delete non-existent draft with ID: ${nonExistentId}`,
      );
      let result = await concept.deleteDraft({ id: nonExistentId });
      assertExists((result as { error: string }).error, "Should return an error for non-existent draft");
      assertEquals(
        (result as { error: string }).error,
        `Draft with ID ${nonExistentId} not found.`,
        "Error message should indicate draft not found",
      );
      console.log(
        `Requirement not met: Draft does not exist. Effect confirmed: Error returned "${(result as { error: string }).error}"`,
      );

      // Missing ID
      console.log("Attempting to delete draft with missing ID...");
      result = await concept.deleteDraft({ id: "" as ID });
      assertExists((result as { error: string }).error, "Should return an error for missing ID");
      assertEquals(
        (result as { error: string }).error,
        "Draft ID must be provided.",
        "Error message should indicate missing ID",
      );
      console.log(
        `Requirement not met: Missing ID. Effect confirmed: Error returned "${(result as { error: string }).error}"`,
      );
    },
  );

  await t.step("_getDraftById: retrieves a draft successfully", async () => {
    console.log("--- Test: _getDraftById success ---");
    const userC: ID = "user:Charlie" as ID;
    const recipe3: ID = "recipe:Smoothie" as ID;
    const goal = "Add more protein.";
    const notes = "Added protein powder.";
    const createResult = await concept.createDraft({
      requester: userC,
      baseRecipe: recipe3,
      goal,
      ingredients: [{ name: "Protein powder", quantity: "1 scoop" }],
      steps: [{ description: "Blend all ingredients." }],
      notes,
    });
    const draftIdToRetrieve = (createResult as { id: ID }).id;
    assertExists(draftIdToRetrieve, "Pre-condition: Draft to retrieve must exist.");
    console.log(`Pre-condition: Created draft with ID: ${draftIdToRetrieve}`);

    console.log(`Attempting to retrieve draft with ID: ${draftIdToRetrieve}`);
    const retrievedDrafts = await concept._getDraftById({ id: draftIdToRetrieve });

    assertEquals(retrievedDrafts.length, 1, "Should retrieve exactly one draft");
    assertEquals(
      retrievedDrafts[0].requester,
      userC,
      "Retrieved draft requester should match",
    );
    assertEquals(retrievedDrafts[0].goal, goal, "Retrieved draft goal should match");
    console.log("Requirement met: Draft exists. Effect confirmed: Draft retrieved with correct properties.");
  });

  await t.step(
    "_getDraftById: returns empty array for non-existent ID",
    async () => {
      console.log("--- Test: _getDraftById non-existent ---");
      const nonExistentId: ID = freshID();
      console.log(
        `Attempting to retrieve draft with non-existent ID: ${nonExistentId}`,
      );
      const result = await concept._getDraftById({ id: nonExistentId });
      assertEquals(result, [], "Should return an empty array for non-existent ID");
      console.log("Requirement not met: Draft does not exist. Effect confirmed: Empty array returned.");
    },
  );

  await t.step(
    "_getDraftById: returns error for missing ID",
    async () => {
      console.log("--- Test: _getDraftById missing ID ---");
      console.log("Attempting to retrieve draft with missing ID...");
      const result = await concept._getDraftById({ id: "" as ID });
      assertExists((result as { error: string }).error, "Should return an error for missing ID");
      assertEquals(
        (result as { error: string }).error,
        "Draft ID must be provided.",
        "Error message should indicate missing ID",
      );
      console.log(
        `Requirement not met: Missing ID. Effect confirmed: Error returned "${(result as { error: string }).error}"`,
      );
    },
  );

  await t.step("_listDraftsByRequester: retrieves all drafts for a user", async () => {
    console.log("--- Test: _listDraftsByRequester success ---");
    const userD: ID = "user:Denise" as ID;
    const recipe4: ID = "recipe:Pasta" as ID;
    const recipe5: ID = "recipe:Salad" as ID;

    console.log(`Pre-condition: Creating multiple drafts for user ${userD}...`);
    await concept.createDraft({
      requester: userD,
      baseRecipe: recipe4,
      goal: "Make it gluten-free",
      ingredients: [],
      steps: [],
      notes: "GF version.",
    });
    await concept.createDraft({
      requester: userD,
      baseRecipe: recipe5,
      goal: "Lighten it up",
      ingredients: [],
      steps: [],
      notes: "Lighter version.",
    });
    // Another user's draft to ensure separation
    await concept.createDraft({
      requester: userA,
      baseRecipe: recipe1,
      goal: "Something else",
      ingredients: [],
      steps: [],
      notes: "Other notes.",
    });

    console.log(`Attempting to list drafts for requester: ${userD}`);
    const userDDrafts = await concept._listDraftsByRequester({ requester: userD });

    assertEquals(
      userDDrafts.length,
      2,
      "Should retrieve exactly two drafts for user Denise",
    );
    assert(
      userDDrafts.every((d) => d.requester === userD),
      "All retrieved drafts should belong to user Denise",
    );
    console.log("Requirement met: Requester ID is valid. Effect confirmed: Correct drafts retrieved.");
  });

  await t.step(
    "_listDraftsByRequester: returns empty array for user with no drafts",
    async () => {
      console.log("--- Test: _listDraftsByRequester no drafts ---");
      const userE: ID = "user:Eve" as ID; // User with no drafts created
      console.log(`Attempting to list drafts for user ${userE} (no drafts expected)`);
      const result = await concept._listDraftsByRequester({ requester: userE });
      assertEquals(
        result,
        [],
        "Should return an empty array for a user with no drafts",
      );
      console.log("Requirement met: Requester ID is valid. Effect confirmed: Empty array returned.");
    },
  );

  await t.step(
    "_listDraftsByRequester: returns error for missing requester ID",
    async () => {
      console.log("--- Test: _listDraftsByRequester missing ID ---");
      console.log("Attempting to list drafts with missing requester ID...");
      const result = await concept._listDraftsByRequester({ requester: "" as ID });
      assertExists((result as { error: string }).error, "Should return an error for missing requester ID");
      assertEquals(
        (result as { error: string }).error,
        "Requester ID must be provided.",
        "Error message should indicate missing requester ID",
      );
      console.log(
        `Requirement not met: Missing requester ID. Effect confirmed: Error returned "${(result as { error: string }).error}"`,
      );
    },
  );

  await t.step("_cleanupExpiredDrafts: removes expired drafts", async () => {
    console.log("--- Test: _cleanupExpiredDrafts ---");
    const userF: ID = "user:Frank" as ID;
    const recipe6: ID = "recipe:Soup" as ID;

    // Create an expired draft
    const expiredDraftId = freshID();
    const expiredDate = new Date(Date.now() - 1000 * 60 * 60 * 2); // 2 hours ago
    await concept.drafts.insertOne({
      _id: expiredDraftId,
      requester: userF,
      baseRecipe: recipe6,
      goal: "Expired goal",
      ingredients: [],
      steps: [],
      notes: "Expired notes.",
      created: new Date(expiredDate.getTime() - 1000 * 60 * 60), // Created 3 hours ago
      expires: expiredDate,
    });
    console.log(`Pre-condition: Created an expired draft with ID: ${expiredDraftId}`);

    // Create a non-expired draft
    const nonExpiredDraftId = freshID();
    const nonExpiredDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
    await concept.drafts.insertOne({
      _id: nonExpiredDraftId,
      requester: userF,
      baseRecipe: recipe6,
      goal: "Non-expired goal",
      ingredients: [],
      steps: [],
      notes: "Non-expired notes.",
      created: new Date(),
      expires: nonExpiredDate,
    });
    console.log(`Pre-condition: Created a non-expired draft with ID: ${nonExpiredDraftId}`);

    console.log("Attempting to run cleanup for expired drafts...");
    const cleanupResult = await concept._cleanupExpiredDrafts();
    assertEquals(cleanupResult, {}, "cleanup should return empty object on success");
    console.log("Effect confirmed: cleanup returned empty object.");

    // Verify state after cleanup
    const retrievedExpired = await concept._getDraftById({ id: expiredDraftId });
    assertEquals(
      retrievedExpired.length,
      0,
      "Expired draft should be deleted",
    );
    console.log(`Effect confirmed: Expired draft ${expiredDraftId} is deleted.`);

    const retrievedNonExpired = await concept._getDraftById({ id: nonExpiredDraftId });
    assertEquals(
      retrievedNonExpired.length,
      1,
      "Non-expired draft should remain",
    );
    console.log(`Effect confirmed: Non-expired draft ${nonExpiredDraftId} remains.`);
  });

  await t.step("Principle: drafts provide AI assistance without directly altering canonical recipe data", async () => {
    console.log("--- Principle Test: VersionDraft Transient Nature ---");
    const userP: ID = "user:PrincipleTester" as ID;
    const recipeP: ID = "recipe:PrincipleRecipe" as ID;
    const goalP = "Make it more principles-aligned.";
    const notesP = "Demonstrating transient nature.";

    // 1. Create a draft
    console.log(`Trace: User ${userP} requests an AI draft for recipe ${recipeP}.`);
    const createResult = await concept.createDraft({
      requester: userP,
      baseRecipe: recipeP,
      goal: goalP,
      ingredients: [{ name: "Principle", quantity: "1 unit" }],
      steps: [{ description: "Follow principles." }],
      notes: notesP,
    });
    const draftId = (createResult as { id: ID }).id;
    assertExists(draftId, "Draft creation should succeed as part of the principle.");
    console.log(`Trace: Draft ${draftId} is created and available for review.`);

    // 2. Verify its transient existence
    let currentDrafts = await concept._getDraftById({ id: draftId });
    assertEquals(currentDrafts.length, 1, "Draft should exist after creation.");
    assertEquals(currentDrafts[0].requester, userP, "Draft properties match.");
    console.log(
      `Trace: Draft ${draftId} is present and verifiable, awaiting user decision (approve/reject).`,
    );

    // 3. Delete the draft (simulating rejection or expiration)
    console.log(`Trace: User ${userP} rejects draft ${draftId}.`);
    const deleteResult = await concept.deleteDraft({ id: draftId });
    assertEquals(deleteResult, {}, "Draft deletion should succeed.");
    console.log(`Trace: Draft ${draftId} is removed.`);

    // 4. Verify its non-existence, confirming it did not alter canonical recipe data
    currentDrafts = await concept._getDraftById({ id: draftId });
    assertEquals(
      currentDrafts.length,
      0,
      "Draft should no longer exist after deletion.",
    );
    console.log(
      "Principle fulfilled: The draft existed as a temporary suggestion and was subsequently removed without affecting the base recipe. It provided 'AI assistance' (creation) but remained 'transient' (existence and deletion) and did not 'directly alter canonical recipe data' (as it's removed and not a permanent version yet).",
    );
  });
});
```