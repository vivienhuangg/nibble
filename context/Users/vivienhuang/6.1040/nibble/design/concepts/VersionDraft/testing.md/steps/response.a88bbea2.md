---
timestamp: 'Sun Oct 19 2025 13:31:59 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_133159.a3802408.md]]'
content_id: a88bbea2c0ccb11bf2d50f9de695e79fb8790ce78aff7207f8cd5b21f85b09de
---

# response:

```typescript
// file: src/VersionDraft/VersionDraftConcept.test.ts
import { assertEquals, assertNotEquals, assert } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import VersionDraftConcept from "@concepts/VersionDraft/VersionDraftConcept.ts";
import { ID } from "@utils/types.ts";

Deno.test("VersionDraft Concept", async (test) => {
  const [db, client] = await testDb();
  const concept = new VersionDraftConcept(db);

  const userA: ID = "user:alice" as ID;
  const recipe1: ID = "recipe:brownies" as ID;
  const recipe2: ID = "recipe:pizza" as ID;

  // Mock ingredients and steps
  const mockIngredients = [{ name: "Flour", quantity: "2 cups" }];
  const mockSteps = [{ description: "Mix ingredients." }];
  const mockNotes = "AI suggested some changes.";
  const mockGoal = "Make it gluten-free.";

  await test.step("createDraft: successfully creates a new draft", async () => {
    console.log(
      "--- Test: createDraft - successfully creates a new draft ---",
    );
    const result = await concept.createDraft({
      requester: userA,
      baseRecipe: recipe1,
      goal: mockGoal,
      ingredients: mockIngredients,
      steps: mockSteps,
      notes: mockNotes,
      confidence: 0.9,
    });

    assert("id" in result, `Expected success, got error: ${result.error}`);
    const draftId = result.id;
    assertNotEquals(draftId, null, "Draft ID should not be null");

    const fetchedDraft = await concept._getDraftById({ id: draftId });
    assert(
      Array.isArray(fetchedDraft) && fetchedDraft.length > 0,
      `Expected to find created draft, got: ${fetchedDraft}`,
    );
    assertEquals(fetchedDraft[0].requester, userA);
    assertEquals(fetchedDraft[0].baseRecipe, recipe1);
    assertEquals(fetchedDraft[0].goal, mockGoal);
    assertEquals(fetchedDraft[0].notes, mockNotes);
    assertEquals(fetchedDraft[0].confidence, 0.9);
    assertEquals(
      fetchedDraft[0].ingredients[0].name,
      mockIngredients[0].name,
    );
    console.log(`✅ Draft created successfully with ID: ${draftId}`);
  });

  await test.step("createDraft: handles validation errors for missing fields", async () => {
    console.log(
      "--- Test: createDraft - handles validation errors for missing fields ---",
    );
    // Missing baseRecipe
    const missingRecipeResult = await concept.createDraft({
      requester: userA,
      baseRecipe: "" as ID,
      goal: mockGoal,
      ingredients: mockIngredients,
      steps: mockSteps,
      notes: mockNotes,
    });
    assert("error" in missingRecipeResult, "Expected an error for missing recipe");
    assertEquals(
      missingRecipeResult.error,
      "Base recipe ID must be provided.",
    );
    console.log(
      `✅ Correctly rejected for missing baseRecipe: ${missingRecipeResult.error}`,
    );

    // Missing goal
    const missingGoalResult = await concept.createDraft({
      requester: userA,
      baseRecipe: recipe1,
      goal: "",
      ingredients: mockIngredients,
      steps: mockSteps,
      notes: mockNotes,
    });
    assert("error" in missingGoalResult, "Expected an error for missing goal");
    assertEquals(missingGoalResult.error, "Goal cannot be empty.");
    console.log(
      `✅ Correctly rejected for empty goal: ${missingGoalResult.error}`,
    );

    // Malformed ingredients/steps
    const malformedIngredientsResult = await concept.createDraft({
      requester: userA,
      baseRecipe: recipe1,
      goal: mockGoal,
      ingredients: null as any, // Intentionally pass null to test array validation
      steps: mockSteps,
      notes: mockNotes,
    });
    assert("error" in malformedIngredientsResult);
    assertEquals(
      malformedIngredientsResult.error,
      "Ingredients and steps must be arrays.",
    );
    console.log(
      `✅ Correctly rejected for malformed ingredients: ${malformedIngredientsResult.error}`,
    );
  });

  let createdDraftId: ID; // To be used in subsequent tests

  await test.step("deleteDraft: successfully deletes an existing draft", async () => {
    console.log(
      "--- Test: deleteDraft - successfully deletes an existing draft ---",
    );
    const createResult = await concept.createDraft({
      requester: userA,
      baseRecipe: recipe1,
      goal: "Delete me",
      ingredients: mockIngredients,
      steps: mockSteps,
      notes: "This draft will be deleted.",
    });
    assert("id" in createResult, `Expected success, got error: ${createResult.error}`);
    createdDraftId = createResult.id;
    console.log(`  Draft created for deletion with ID: ${createdDraftId}`);

    const deleteResult = await concept.deleteDraft({ id: createdDraftId });
    assert(!("error" in deleteResult), `Expected success, got error: ${deleteResult.error}`);
    assertEquals(Object.keys(deleteResult).length, 0, "Expected empty result for successful deletion");

    const fetchedDraft = await concept._getDraftById({ id: createdDraftId });
    assertEquals(
      fetchedDraft.length,
      0,
      "Deleted draft should not be found.",
    );
    console.log(`✅ Draft with ID ${createdDraftId} deleted successfully.`);
  });

  await test.step("deleteDraft: returns error for non-existent draft", async () => {
    console.log(
      "--- Test: deleteDraft - returns error for non-existent draft ---",
    );
    const nonExistentId: ID = "nonExistentDraft:123" as ID;
    const deleteResult = await concept.deleteDraft({ id: nonExistentId });
    assert("error" in deleteResult, "Expected an error for non-existent draft");
    assertEquals(
      deleteResult.error,
      `Draft with ID ${nonExistentId} not found.`,
    );
    console.log(
      `✅ Correctly returned error for non-existent draft: ${deleteResult.error}`,
    );
  });

  await test.step("_getDraftById: retrieves a specific draft", async () => {
    console.log("--- Test: _getDraftById - retrieves a specific draft ---");
    const createResult = await concept.createDraft({
      requester: userA,
      baseRecipe: recipe2,
      goal: "Get me by ID",
      ingredients: mockIngredients,
      steps: mockSteps,
      notes: "Retrieve test",
    });
    assert("id" in createResult, `Expected success, got error: ${createResult.error}`);
    const draftId = createResult.id;
    console.log(`  Draft created with ID: ${draftId}`);

    const fetchedDraft = await concept._getDraftById({ id: draftId });
    assert(
      Array.isArray(fetchedDraft) && fetchedDraft.length === 1,
      "Expected to find one draft",
    );
    assertEquals(fetchedDraft[0]._id, draftId);
    assertEquals(fetchedDraft[0].baseRecipe, recipe2);
    console.log(`✅ Draft retrieved by ID ${draftId} successfully.`);

    const notFound = await concept._getDraftById({ id: "nonexistent" as ID });
    assertEquals(notFound.length, 0, "Expected no draft for non-existent ID");
    console.log(`✅ Correctly returned empty for non-existent ID.`);
  });

  await test.step("_listDraftsByRequester: lists drafts for a user", async () => {
    console.log(
      "--- Test: _listDraftsByRequester - lists drafts for a user ---",
    );
    const userB: ID = "user:bob" as ID;
    await concept.createDraft({
      requester: userA,
      baseRecipe: recipe1,
      goal: "List A1",
      ingredients: mockIngredients,
      steps: mockSteps,
      notes: "",
    });
    await concept.createDraft({
      requester: userA,
      baseRecipe: recipe2,
      goal: "List A2",
      ingredients: mockIngredients,
      steps: mockSteps,
      notes: "",
    });
    await concept.createDraft({
      requester: userB,
      baseRecipe: recipe1,
      goal: "List B1",
      ingredients: mockIngredients,
      steps: mockSteps,
      notes: "",
    });

    const userADrafts = await concept._listDraftsByRequester({
      requester: userA,
    });
    assert(Array.isArray(userADrafts), `Expected array, got: ${userADrafts}`);
    assertEquals(userADrafts.length, 2, "Expected 2 drafts for userA");
    assert(
      userADrafts.every((d) => d.requester === userA),
      "All listed drafts should belong to userA",
    );
    console.log(`✅ Listed 2 drafts for userA.`);

    const userBDrafts = await concept._listDraftsByRequester({
      requester: userB,
    });
    assert(Array.isArray(userBDrafts));
    assertEquals(userBDrafts.length, 1, "Expected 1 draft for userB");
    assertEquals(userBDrafts[0].requester, userB);
    console.log(`✅ Listed 1 draft for userB.`);

    const userCDrafts = await concept._listDraftsByRequester({
      requester: "user:charlie" as ID,
    });
    assert(Array.isArray(userCDrafts));
    assertEquals(userCDrafts.length, 0, "Expected 0 drafts for non-existent user");
    console.log(`✅ Listed 0 drafts for non-existent user.`);
  });

  await test.step("_cleanupExpiredDrafts: removes only expired drafts", async () => {
    console.log(
      "--- Test: _cleanupExpiredDrafts - removes only expired drafts ---",
    );
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days from now
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7); // 7 days ago

    // Create an unexpired draft
    const unexpiredResult = await concept.createDraft({
      requester: userA,
      baseRecipe: recipe1,
      goal: "Unexpired",
      ingredients: mockIngredients,
      steps: mockSteps,
      notes: "",
    });
    assert("id" in unexpiredResult, `Expected success, got error: ${unexpiredResult.error}`);
    const unexpiredDraftId = unexpiredResult.id;
    await concept.drafts.updateOne(
      { _id: unexpiredDraftId },
      { $set: { expires: futureDate } },
    );
    console.log(`  Unexpired draft created with ID: ${unexpiredDraftId}`);

    // Create an expired draft
    const expiredResult = await concept.createDraft({
      requester: userA,
      baseRecipe: recipe2,
      goal: "Expired",
      ingredients: mockIngredients,
      steps: mockSteps,
      notes: "",
    });
    assert("id" in expiredResult, `Expected success, got error: ${expiredResult.error}`);
    const expiredDraftId = expiredResult.id;
    await concept.drafts.updateOne(
      { _id: expiredDraftId },
      { $set: { expires: pastDate } },
    );
    console.log(`  Expired draft created with ID: ${expiredDraftId}`);

    // Run cleanup
    const cleanupResult = await concept._cleanupExpiredDrafts();
    assert(!("error" in cleanupResult), `Cleanup failed with error: ${cleanupResult.error}`);
    console.log(`  Cleanup completed.`);

    // Verify
    const remainingUnexpired = await concept._getDraftById({
      id: unexpiredDraftId,
    });
    assertEquals(remainingUnexpired.length, 1, "Unexpired draft should remain.");
    console.log(
      `✅ Unexpired draft (ID: ${unexpiredDraftId}) correctly remained.`,
    );

    const removedExpired = await concept._getDraftById({ id: expiredDraftId });
    assertEquals(removedExpired.length, 0, "Expired draft should be removed.");
    console.log(`✅ Expired draft (ID: ${expiredDraftId}) correctly removed.`);
  });

  await test.step("Principle Trace: Drafts provide AI assistance without directly altering canonical recipe data", async () => {
    console.log(
      "--- Principle Trace: Drafts provide AI assistance without directly altering canonical recipe data ---",
    );

    const userC: ID = "user:carol" as ID;
    const recipe3: ID = "recipe:curry" as ID;
    const initialIngredients = [{ name: "Chicken", quantity: "1 lb" }];
    const initialSteps = [{ description: "Cook chicken." }];

    // 1. Simulate AI drafting (this would normally be triggered by VersionConcept.draftVersionWithAI
    // which then syncs to VersionDraft.createDraft)
    console.log(
      "  Action: Simulate VersionDraft.createDraft as if from an AI prompt",
    );
    const draftContent = {
      requester: userC,
      baseRecipe: recipe3,
      goal: "Make it vegetarian",
      ingredients: [{ name: "Tofu", quantity: "1 lb" }],
      steps: [{ description: "Cook tofu." }],
      notes: "AI suggested vegetarian version",
      confidence: 0.95,
    };
    const createDraftResult = await concept.createDraft(draftContent);
    assert("id" in createDraftResult, `Expected success, got error: ${createDraftResult.error}`);
    const draftId = createDraftResult.id;
    console.log(`  -> Draft created with ID: ${draftId}`);

    // 2. Verify the draft exists as a transient state
    const fetchedDraft = await concept._getDraftById({ id: draftId });
    assertEquals(fetchedDraft.length, 1, "Draft should exist after creation.");
    assertEquals(
      fetchedDraft[0].notes,
      "AI suggested vegetarian version",
      "Draft content should match AI suggestion.",
    );
    console.log("  -> Verified draft exists as transient data.");

    // 3. Simulate user rejecting the draft (this would normally be triggered by VersionConcept.rejectDraft
    // which then syncs to VersionDraft.deleteDraft)
    console.log("  Action: Simulate VersionDraft.deleteDraft (user rejection)");
    const deleteDraftResult = await concept.deleteDraft({ id: draftId });
    assert(!("error" in deleteDraftResult), `Expected success, got error: ${deleteDraftResult.error}`);
    console.log(`  -> Draft ${draftId} deleted.`);

    // 4. Verify the draft is removed and base recipe remains unaltered
    const noDraft = await concept._getDraftById({ id: draftId });
    assertEquals(
      noDraft.length,
      0,
      "Draft should be removed after rejection.",
    );
    // (Implicitly, the Recipe concept state for recipe3 would not have changed at all,
    // demonstrating that the draft was transient and did not impact canonical data.)
    console.log(
      "  -> Verified draft is removed and original recipe (conceptually) remains untouched.",
    );
    console.log(
      "The trace demonstrates that VersionDraft correctly holds ephemeral, AI-generated suggestions that can be managed and removed without permanent impact on core recipe data.",
    );
  });

  await client.close();
});
```
