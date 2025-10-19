---
timestamp: 'Sun Oct 19 2025 14:06:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140645.c032c783.md]]'
content_id: 9969cecc8f1769f789145249cb5de00a3075e96ac7b70110c49f997c6f8e9284
---

# response:

```typescript
// file: src/concepts/Version/VersionConcept.test.ts
import {
  assert,
  assertEquals,
  assertExists,
  assertNotEquals,
  assertObjectMatch,
} from "jsr:@std/assert";
import { freshID, testDb } from "@utils/database.ts";
import type { Empty, ID } from "@utils/types.ts";
import VersionConcept from "./VersionConcept.ts";

// Helper types for Ingredient and Step for consistency with the concept's internal types
// These are duplicated here for self-containment as per concept design rules
interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
  notes?: string;
}

interface Step {
  description: string;
  duration?: number; // in minutes
  notes?: string; // e.g., "stir until golden brown"
}

interface PromptHistoryEntry {
  promptText: string;
  modelName: string;
  timestamp: Date;
  draftId: ID;
  status: "Approved" | "Rejected" | "Generated" | "Failed";
}

Deno.test("VersionConcept Actions and Queries", async (t) => {
  const [db, client] = await testDb();
  const concept = new VersionConcept(db);

  const testUser1: ID = "user:Alice" as ID;
  const testUser2: ID = "user:Bob" as ID;
  const testRecipe1: ID = "recipe:Brownies" as ID;
  const testRecipe2: ID = "recipe:Cookies" as ID;

  // Helper for creating consistent ingredient and step data for tests
  const createTestIngredients = () => [
    { name: "Flour", quantity: "2 cups" },
    { name: "Sugar", quantity: "1 cup" },
  ];
  const createTestSteps = () => [
    { description: "Mix dry ingredients." },
    { description: "Bake at 350F." },
  ];

  Deno.test.afterAll(async () => {
    await client.close();
  });

  await t.step(
    "Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected.",
    async () => {
      console.log("--- Trace: Testing the Version concept's principle ---");
      console.log(
        "Principle: Users can create versions manually or use AI to draft one ('make this vegan', 'cut sugar by half', etc.); drafts are reviewed, edited, and either approved or rejected.",
      );

      // --- Part 1: Manual Version Creation ---
      console.log("\n--- Sub-trace: Manual Version Creation ---");
      const manualVersionNum = "1.0";
      const manualNotes = "Initial stable version.";
      console.log(
        `Action: createVersion(author=${testUser1}, recipe=${testRecipe1}, versionNum="${manualVersionNum}", ...)`,
      );
      const manualCreateResult = await concept.createVersion({
        author: testUser1,
        recipe: testRecipe1,
        versionNum: manualVersionNum,
        notes: manualNotes,
        ingredients: createTestIngredients(),
        steps: createTestSteps(),
      });
      assertExists(
        (manualCreateResult as { version: ID }).version,
        "Requires: Valid inputs. Effects: Returns new version ID.",
      );
      const manualVersionId = (manualCreateResult as { version: ID }).version;
      console.log(`Effect confirmed: Manual Version ${manualVersionId} created.`);

      // Verify the manually created version
      const retrievedManualVersion = await concept._getVersionById({
        version: manualVersionId,
      });
      assert(
        Array.isArray(retrievedManualVersion),
        "Query should return an array",
      );
      assertEquals(retrievedManualVersion.length, 1, "Should find manual version");
      assertEquals(
        retrievedManualVersion[0].versionNum,
        manualVersionNum,
        "Manual version number matches.",
      );
      assertEquals(
        retrievedManualVersion[0].promptHistory.length,
        0,
        "Manual version should have empty prompt history.",
      );
      console.log(
        "Verification: Manual version created successfully without AI history.",
      );

      // --- Part 2: AI-Assisted Version Workflow (Draft, Approve) ---
      console.log("\n--- Sub-trace: AI-Assisted Version Workflow (Approve) ---");
      const aiGoal = "Cut sugar by half";
      const draftVersionNum = "1.1";
      console.log(
        `Action: draftVersionWithAI(author=${testUser1}, recipe=${testRecipe1}, goal="${aiGoal}")`,
      );
      const draftResult = await concept.draftVersionWithAI({
        author: testUser1,
        recipe: testRecipe1,
        goal: aiGoal,
      });
      assertExists(
        (draftResult as { draftId: ID }).draftId,
        "Requires: Valid inputs. Effects: Outputs draft details.",
      );
      if ("error" in draftResult) {
        throw new Error(`Failed to draft with AI: ${draftResult.error}`);
      }
      const draftId = draftResult.draftId;
      console.log(`Effect confirmed: AI Draft ${draftId} generated.`);
      console.log(
        `Trace: User reviews AI Draft ${draftId}, decides to approve.`,
      );

      const approvedNotes = "Sugar reduced by 50% via AI suggestion.";
      const updatedIngredients = createTestIngredients().map((ing) =>
        ing.name === "Sugar" ? { ...ing, quantity: "0.5 cup" } : ing
      );
      console.log(
        `Action: approveDraft(author=${testUser1}, draftId=${draftId}, recipe=${testRecipe1}, newVersionNum="${draftVersionNum}", ...)`,
      );
      const approveResult = await concept.approveDraft({
        author: testUser1,
        draftId: draftId,
        baseRecipe: testRecipe1,
        newVersionNum: draftVersionNum,
        draftDetails: {
          ingredients: updatedIngredients,
          steps: createTestSteps(), // Assuming steps didn't change for this goal
          notes: approvedNotes,
          goal: aiGoal,
          confidence: 0.95,
        },
      });
      assertExists(
        (approveResult as { newVersionId: ID }).newVersionId,
        "Requires: Valid draft, unique versionNum. Effects: Outputs new version and draft deletion data.",
      );
      if ("error" in approveResult) {
        throw new Error(`Failed to approve draft: ${approveResult.error}`);
      }
      const approvedVersionId = approveResult.newVersionId;
      console.log(
        `Effect confirmed: Approved AI Draft converted to Version ${approvedVersionId}.`,
      );
      // In a real system, syncs would now call `createVersion` and `deleteDraft` for VersionDraft.
      // We simulate `createVersion` here using the output from `approveDraft`.
      const finalApprovedVersion = await concept.createVersion({
        author: approveResult.author,
        recipe: approveResult.recipe,
        versionNum: approveResult.versionNum,
        notes: approveResult.notes,
        ingredients: approveResult.ingredients,
        steps: approveResult.steps,
        promptHistory: [approveResult.promptHistoryEntry], // This is key for history tracking
      });
      assertExists(
        (finalApprovedVersion as { version: ID }).version,
        "Simulated createVersion after approve should succeed.",
      );
      assertEquals(
        (finalApprovedVersion as { version: ID }).version,
        approvedVersionId,
        "Version ID from approve and create should match.",
      );
      console.log(
        `Simulated Sync: createVersion action called with approved draft details.`,
      );

      // Verify the AI-assisted version
      const retrievedApprovedVersion = await concept._getVersionById({
        version: approvedVersionId,
      });
      assert(
        Array.isArray(retrievedApprovedVersion),
        "Query should return an array",
      );
      assertEquals(
        retrievedApprovedVersion.length,
        1,
        "Should find approved version",
      );
      assertEquals(
        retrievedApprovedVersion[0].versionNum,
        draftVersionNum,
        "Approved version number matches.",
      );
      assertEquals(
        retrievedApprovedVersion[0].notes,
        approvedNotes,
        "Approved version notes matches.",
      );
      assertEquals(
        retrievedApprovedVersion[0].ingredients[1].quantity,
        "0.5 cup",
        "Approved version ingredients updated.",
      );
      assertEquals(
        retrievedApprovedVersion[0].promptHistory.length,
        1,
        "Approved version should have one prompt history entry.",
      );
      assertEquals(
        retrievedApprovedVersion[0].promptHistory[0].goal,
        aiGoal,
        "Prompt history goal matches original AI goal.",
      );
      assertEquals(
        retrievedApprovedVersion[0].promptHistory[0].status,
        "Approved",
        "Prompt history status is 'Approved'.",
      );
      console.log(
        "Verification: AI-assisted version created with correct details and prompt history.",
      );

      // --- Part 3: AI-Assisted Version Workflow (Draft, Reject) ---
      console.log("\n--- Sub-trace: AI-Assisted Version Workflow (Reject) ---");
      const rejectGoal = "Make it super spicy";
      console.log(
        `Action: draftVersionWithAI(author=${testUser2}, recipe=${testRecipe2}, goal="${rejectGoal}")`,
      );
      const rejectDraftResult = await concept.draftVersionWithAI({
        author: testUser2,
        recipe: testRecipe2,
        goal: rejectGoal,
      });
      assertExists(
        (rejectDraftResult as { draftId: ID }).draftId,
        "Requires: Valid inputs. Effects: Outputs draft details.",
      );
      if ("error" in rejectDraftResult) {
        throw new Error(`Failed to draft with AI: ${rejectDraftResult.error}`);
      }
      const rejectedDraftId = rejectDraftResult.draftId;
      console.log(
        `Effect confirmed: AI Draft ${rejectedDraftId} generated for rejection.`,
      );
      console.log(
        `Trace: User reviews AI Draft ${rejectedDraftId}, decides to reject.`,
      );

      console.log(
        `Action: rejectDraft(author=${testUser2}, draftId=${rejectedDraftId}, recipe=${testRecipe2}, goal="${rejectGoal}")`,
      );
      const rejectResult = await concept.rejectDraft({
        author: testUser2,
        draftId: rejectedDraftId,
        baseRecipe: testRecipe2,
        goal: rejectGoal,
      });
      assertExists(
        (rejectResult as { draftToDeleteId: ID }).draftToDeleteId,
        "Requires: Valid draft. Effects: Outputs draft deletion and rejected history data.",
      );
      if ("error" in rejectResult) {
        throw new Error(`Failed to reject draft: ${rejectResult.error}`);
      }
      assertEquals(
        rejectResult.draftToDeleteId,
        rejectedDraftId,
        "Rejected draft ID matches.",
      );
      assertEquals(
        rejectResult.promptHistoryEntry.status,
        "Rejected",
        "Prompt history status is 'Rejected'.",
      );
      console.log(
        `Effect confirmed: Rejected AI Draft ${rejectedDraftId} marked for deletion.`,
      );
      console.log(
        "Principle Fulfilled: Both manual and AI-assisted version creation flows are demonstrated, with drafts being either approved into concrete versions with history, or rejected.",
      );
    },
  );

  await t.step("createVersion action tests", async () => {
    console.log("\n--- Testing createVersion action ---");
    const testRecipe = freshID(); // Simulate a recipe ID
    const testAuthor = freshID(); // Simulate an author ID

    // Test 1: Successful creation
    const ingredients = createTestIngredients();
    const steps = createTestSteps();
    const result1 = await concept.createVersion({
      author: testAuthor,
      recipe: testRecipe,
      versionNum: "1.0",
      notes: "Initial version.",
      ingredients,
      steps,
    });
    assertExists(
      (result1 as { version: ID }).version,
      "Effects: Should return a version ID for valid input.",
    );
    if ("error" in result1) {
      throw new Error(`Failed to create version: ${result1.error}`);
    }
    const newVersionId = result1.version;
    console.log(
      `Action: createVersion(author=${testAuthor}, recipe=${testRecipe}, versionNum="1.0") -> version ID: ${newVersionId}`,
    );

    // Verify effects
    const createdVersion = await concept._getVersionById({
      version: newVersionId,
    });
    assert(Array.isArray(createdVersion), "Query should return an array");
    assertEquals(createdVersion.length, 1, "Should find the created version.");
    assertEquals(
      createdVersion[0].versionNum,
      "1.0",
      "Effects: Created version should have correct version number.",
    );
    assertEquals(
      createdVersion[0].author,
      testAuthor,
      "Effects: Created version should have correct author.",
    );
    assertEquals(
      createdVersion[0].baseRecipe,
      testRecipe,
      "Effects: Created version should link to correct base recipe.",
    );
    assertEquals(
      createdVersion[0].promptHistory.length,
      0,
      "Effects: Manual version should have empty prompt history.",
    );
    console.log(
      `Verification: _getVersionById(${newVersionId}) confirmed version details.`,
    );

    // Test 2: Duplicate versionNum for the same recipe
    const result2 = await concept.createVersion({
      author: testAuthor,
      recipe: testRecipe,
      versionNum: "1.0", // Duplicate
      notes: "Another initial version attempt.",
      ingredients,
      steps,
    });
    assertExists(
      (result2 as { error: string }).error,
      "Requires: versionNum unique. Effects: Should return error for duplicate versionNum.",
    );
    assertEquals(
      (result2 as { error: string }).error,
      `Version number '1.0' already exists for this recipe.`,
      "Error message should indicate duplicate version number.",
    );
    console.log(
      `Action: createVersion(versionNum="1.0" - duplicate) -> Error: ${
        "error" in result2 ? result2.error : "Unknown error"
      }`,
    );

    // Test 3: Missing author
    const result3 = await concept.createVersion({
      author: "" as ID,
      recipe: testRecipe,
      versionNum: "1.2",
      notes: "Missing author.",
      ingredients,
      steps,
    });
    assertExists(
      (result3 as { error: string }).error,
      "Requires: Author ID. Effects: Should return error for missing author.",
    );
    assertEquals(
      (result3 as { error: string }).error,
      "Author ID must be provided.",
      "Error message should indicate missing author ID.",
    );
    console.log(
      `Action: createVersion(author=empty) -> Error: ${
        "error" in result3 ? result3.error : "Unknown error"
      }`,
    );

    // Test 4: Missing recipe
    const result4 = await concept.createVersion({
      author: testAuthor,
      recipe: "" as ID,
      versionNum: "1.2",
      notes: "Missing recipe.",
      ingredients,
      steps,
    });
    assertExists(
      (result4 as { error: string }).error,
      "Requires: Recipe ID. Effects: Should return error for missing recipe.",
    );
    assertEquals(
      (result4 as { error: string }).error,
      "Base recipe ID must be provided.",
      "Error message should indicate missing base recipe ID.",
    );
    console.log(
      `Action: createVersion(recipe=empty) -> Error: ${
        "error" in result4 ? result4.error : "Unknown error"
      }`,
    );

    // Test 5: Empty versionNum
    const result5 = await concept.createVersion({
      author: testAuthor,
      recipe: testRecipe,
      versionNum: "",
      notes: "Empty versionNum.",
      ingredients,
      steps,
    });
    assertExists(
      (result5 as { error: string }).error,
      "Requires: versionNum not empty. Effects: Should return error for empty versionNum.",
    );
    assertEquals(
      (result5 as { error: string }).error,
      "Version number cannot be empty.",
      "Error message should indicate empty version number.",
    );
    console.log(
      `Action: createVersion(versionNum=empty) -> Error: ${
        "error" in result5 ? result5.error : "Unknown error"
      }`,
    );

    // Test 6: Empty ingredients list
    const result6 = await concept.createVersion({
      author: testAuthor,
      recipe: testRecipe,
      versionNum: "1.3",
      notes: "No ingredients.",
      ingredients: [],
      steps,
    });
    assertExists(
      (result6 as { error: string }).error,
      "Requires: ingredients well-formed. Effects: Should return error.",
    );
    assertEquals(
      (result6 as { error: string }).error,
      "Version must have at least one ingredient.",
      "Error message should indicate empty ingredients list.",
    );
    console.log(
      `Action: createVersion(ingredients=[]) -> Error: ${
        "error" in result6 ? result6.error : "Unknown error"
      }`,
    );

    // Test 7: Malformed ingredient (missing name)
    const malformedIngredients = [
      { name: "", quantity: "1 unit" },
    ] as Ingredient[];
    const result7 = await concept.createVersion({
      author: testAuthor,
      recipe: testRecipe,
      versionNum: "1.4",
      notes: "Malformed ingredient.",
      ingredients: malformedIngredients,
      steps,
    });
    assertExists(
      (result7 as { error: string }).error,
      "Requires: ingredients well-formed. Effects: Should return error.",
    );
    assertEquals(
      (result7 as { error: string }).error,
      "Each ingredient must have a name and quantity.",
      "Error message should indicate malformed ingredient.",
    );
    console.log(
      `Action: createVersion(malformed ingredient) -> Error: ${
        "error" in result7 ? result7.error : "Unknown error"
      }`,
    );
  });

  await t.step("deleteVersion action tests", async () => {
    console.log("\n--- Testing deleteVersion action ---");
    const owner1: ID = freshID();
    const recipe1 = freshID();
    const ingredients = createTestIngredients();
    const steps = createTestSteps();

    // Setup: Create a version to delete
    const createResult = await concept.createVersion({
      author: owner1,
      recipe: recipe1,
      versionNum: "1.0",
      notes: "Test version for deletion.",
      ingredients,
      steps,
    });
    if ("error" in createResult) {
      throw new Error(`Failed to create setup version: ${createResult.error}`);
    }
    const versionIdToDelete = (createResult as { version: ID }).version;
    console.log(
      `Setup: Created version ${versionIdToDelete} by ${owner1} for recipe ${recipe1}.`,
    );

    // Test 1: Successful deletion by author
    const deleteResult1 = await concept.deleteVersion({
      requester: owner1,
      version: versionIdToDelete,
    });
    assertEquals(
      deleteResult1,
      {},
      "Effects: Should return empty object on successful deletion.",
    );
    console.log(
      `Action: deleteVersion(requester=${owner1}, version=${versionIdToDelete}) -> Success`,
    );

    // Verify effects
    const deletedVersion = await concept._getVersionById({
      version: versionIdToDelete,
    });
    assert(Array.isArray(deletedVersion), "Query should return an array");
    assertEquals(
      deletedVersion.length,
      0,
      "Effects: Deleted version should no longer be found.",
    );
    console.log(
      `Verification: _getVersionById(${versionIdToDelete}) confirmed version is gone.`,
    );

    // Setup: Create another version by a different author for non-author deletion test
    const owner2: ID = freshID();
    const recipe2 = freshID();
    const createResult2 = await concept.createVersion({
      author: owner2,
      recipe: recipe2,
      versionNum: "1.0",
      notes: "Another test version.",
      ingredients,
      steps,
    });
    if ("error" in createResult2) {
      throw new Error(
        `Failed to create setup version 2: ${createResult2.error}`,
      );
    }
    const versionIdToAttemptDelete = (createResult2 as { version: ID }).version;
    console.log(
      `Setup: Created version ${versionIdToAttemptDelete} by ${owner2} for recipe ${recipe2}.`,
    );

    // Test 2: Attempt to delete by non-author
    const nonAuthor: ID = freshID(); // Not owner1 or owner2
    const deleteResult2 = await concept.deleteVersion({
      requester: nonAuthor,
      version: versionIdToAttemptDelete,
    });
    assertExists(
      (deleteResult2 as { error: string }).error,
      "Requires: requester is author. Effects: Should return error for non-author deletion.",
    );
    assertEquals(
      (deleteResult2 as { error: string }).error,
      "Requester is not the author of this version.",
      "Error message should indicate non-author.",
    );
    console.log(
      `Action: deleteVersion(requester=${nonAuthor}, version=${versionIdToAttemptDelete}) -> Error: ${
        "error" in deleteResult2 ? deleteResult2.error : "Unknown error"
      }`,
    );

    // Verify version still exists after failed attempt
    const existingVersion = await concept._getVersionById({
      version: versionIdToAttemptDelete,
    });
    assert(Array.isArray(existingVersion), "Query should return an array");
    assertEquals(
      existingVersion.length,
      1,
      "Effects: Version should still exist after failed deletion.",
    );
    console.log(
      `Verification: _getVersionById(${versionIdToAttemptDelete}) confirmed version still exists.`,
    );

    // Test 3: Delete non-existent version
    const nonExistentVersionId = freshID();
    const deleteResult3 = await concept.deleteVersion({
      requester: owner1,
      version: nonExistentVersionId,
    });
    assertExists(
      (deleteResult3 as { error: string }).error,
      "Requires: Version exists. Effects: Should return error for non-existent version.",
    );
    assertEquals(
      (deleteResult3 as { error: string }).error,
      `Version with ID ${nonExistentVersionId} not found.`,
      "Error message should indicate version not found.",
    );
    console.log(
      `Action: deleteVersion(version=nonExistent) -> Error: ${
        "error" in deleteResult3 ? deleteResult3.error : "Unknown error"
      }`,
    );

    // Test 4: Missing requester ID
    const deleteResult4 = await concept.deleteVersion({
      requester: "" as ID,
      version: versionIdToAttemptDelete,
    });
    assertExists(
      (deleteResult4 as { error: string }).error,
      "Requires: requester ID. Effects: Should return error for missing requester ID.",
    );
    assertEquals(
      (deleteResult4 as { error: string }).error,
      "Requester ID must be provided.",
      "Error message should indicate missing requester ID.",
    );
    console.log(
      `Action: deleteVersion(requester=empty) -> Error: ${
        "error" in deleteResult4 ? deleteResult4.error : "Unknown error"
      }`,
    );
  });

  await t.step("draftVersionWithAI action tests", async () => {
    console.log("\n--- Testing draftVersionWithAI action ---");
    const testAuthor = freshID();
    const testRecipe = freshID();
    const goal = "Make it gluten-free and add a banana.";

    // Test 1: Successful draft generation
    const draftResult1 = await concept.draftVersionWithAI({
      author: testAuthor,
      recipe: testRecipe,
      goal: goal,
    });
    assertExists(
      (draftResult1 as { draftId: ID }).draftId,
      "Effects: Should return a draft ID.",
    );
    if ("error" in draftResult1) {
      throw new Error(`Failed to draft with AI: ${draftResult1.error}`);
    }
    assertEquals(
      draftResult1.requester,
      testAuthor,
      "Effects: Requester should match author.",
    );
    assertEquals(
      draftResult1.baseRecipe,
      testRecipe,
      "Effects: Base recipe should match.",
    );
    assert(
      draftResult1.notes.includes(goal),
      "Effects: Notes should reflect the goal.",
    );
    assert(
      draftResult1.ingredients.some((i) => i.name === "Plant-based milk"),
      "Effects: Simulated vegan change for 'gluten-free' (as per internal mock logic).",
    );
    assert(
      draftResult1.expires.getTime() > draftResult1.created.getTime(),
      "Effects: Expires date should be set after created date.",
    );
    console.log(
      `Action: draftVersionWithAI(goal="${goal}") -> Draft ID: ${draftResult1.draftId}, Notes: ${draftResult1.notes}`,
    );

    // Test 2: Missing author
    const draftResult2 = await concept.draftVersionWithAI({
      author: "" as ID,
      recipe: testRecipe,
      goal: "Some goal",
    });
    assertExists(
      (draftResult2 as { error: string }).error,
      "Requires: Author ID. Effects: Should return error.",
    );
    assertEquals(
      (draftResult2 as { error: string }).error,
      "Author ID must be provided.",
      "Error message should indicate missing author.",
    );
    console.log(
      `Action: draftVersionWithAI(author=empty) -> Error: ${
        "error" in draftResult2 ? draftResult2.error : "Unknown error"
      }`,
    );

    // Test 3: Missing recipe
    const draftResult3 = await concept.draftVersionWithAI({
      author: testAuthor,
      recipe: "" as ID,
      goal: "Some goal",
    });
    assertExists(
      (draftResult3 as { error: string }).error,
      "Requires: Recipe ID. Effects: Should return error.",
    );
    assertEquals(
      (draftResult3 as { error: string }).error,
      "Base recipe ID must be provided.",
      "Error message should indicate missing recipe.",
    );
    console.log(
      `Action: draftVersionWithAI(recipe=empty) -> Error: ${
        "error" in draftResult3 ? draftResult3.error : "Unknown error"
      }`,
    );

    // Test 4: Empty goal
    const draftResult4 = await concept.draftVersionWithAI({
      author: testAuthor,
      recipe: testRecipe,
      goal: "",
    });
    assertExists(
      (draftResult4 as { error: string }).error,
      "Requires: Goal not empty. Effects: Should return error.",
    );
    assertEquals(
      (draftResult4 as { error: string }).error,
      "Goal cannot be empty.",
      "Error message should indicate empty goal.",
    );
    console.log(
      `Action: draftVersionWithAI(goal=empty) -> Error: ${
        "error" in draftResult4 ? draftResult4.error : "Unknown error"
      }`,
    );
  });

  await t.step("approveDraft action tests", async () => {
    console.log("\n--- Testing approveDraft action ---");
    const testAuthor = freshID();
    const testRecipe = freshID();
    const testDraftId = freshID();
    const newVersionNum = "2.0";
    const draftGoal = "Make it low-fat.";
    const draftNotes = "AI suggested low-fat substitutions.";
    const draftIngredients: Ingredient[] = [
      { name: "Skim Milk", quantity: "1 cup" },
    ];
    const draftSteps = [{ description: "Use skim milk." }];

    // Test 1: Successful approval output
    const approveResult1 = await concept.approveDraft({
      author: testAuthor,
      draftId: testDraftId,
      baseRecipe: testRecipe,
      newVersionNum: newVersionNum,
      draftDetails: {
        ingredients: draftIngredients,
        steps: draftSteps,
        notes: draftNotes,
        goal: draftGoal,
        confidence: 0.8,
      },
    });
    assertExists(
      (approveResult1 as { newVersionId: ID }).newVersionId,
      "Effects: Should return a new version ID and other details.",
    );
    if ("error" in approveResult1) {
      throw new Error(`Failed to approve draft: ${approveResult1.error}`);
    }
    assertEquals(
      approveResult1.author,
      testAuthor,
      "Effects: Author should match.",
    );
    assertEquals(
      approveResult1.recipe,
      testRecipe,
      "Effects: Recipe should match.",
    );
    assertEquals(
      approveResult1.versionNum,
      newVersionNum,
      "Effects: New version number should match.",
    );
    assertEquals(
      approveResult1.notes,
      draftNotes,
      "Effects: Notes should be from draft details.",
    );
    assertEquals(
      approveResult1.promptHistoryEntry.status,
      "Approved",
      "Effects: Prompt history status should be 'Approved'.",
    );
    assertEquals(
      approveResult1.draftToDeleteId,
      testDraftId,
      "Effects: Draft ID to delete should match.",
    );
    console.log(
      `Action: approveDraft(...) -> New Version ID: ${approveResult1.newVersionId}, Draft to delete: ${approveResult1.draftToDeleteId}`,
    );

    // Test 2: newVersionNum already exists for this recipe
    // First, create the version that will make the number duplicate
    await concept.createVersion({
      author: testAuthor,
      recipe: testRecipe,
      versionNum: "2.1",
      notes: "Existing version.",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
    });
    console.log(`Setup: Created version 2.1 for recipe ${testRecipe}.`);

    const approveResult2 = await concept.approveDraft({
      author: testAuthor,
      draftId: freshID(),
      baseRecipe: testRecipe,
      newVersionNum: "2.1", // Duplicate
      draftDetails: {
        ingredients: draftIngredients,
        steps: draftSteps,
        notes: draftNotes,
        goal: draftGoal,
      },
    });
    assertExists(
      (approveResult2 as { error: string }).error,
      "Requires: newVersionNum unique. Effects: Should return error.",
    );
    assertEquals(
      (approveResult2 as { error: string }).error,
      `Version number '2.1' already exists for this recipe.`,
      "Error message should indicate duplicate version number.",
    );
    console.log(
      `Action: approveDraft(newVersionNum="2.1" - duplicate) -> Error: ${
        "error" in approveResult2 ? approveResult2.error : "Unknown error"
      }`,
    );

    // Test 3: Missing author
    const approveResult3 = await concept.approveDraft({
      author: "" as ID,
      draftId: testDraftId,
      baseRecipe: testRecipe,
      newVersionNum: "2.2",
      draftDetails: {
        ingredients: draftIngredients,
        steps: draftSteps,
        notes: draftNotes,
        goal: draftGoal,
      },
    });
    assertExists(
      (approveResult3 as { error: string }).error,
      "Requires: Author ID. Effects: Should return error.",
    );
    assertEquals(
      (approveResult3 as { error: string }).error,
      "Author ID must be provided.",
      "Error message should indicate missing author.",
    );
    console.log(
      `Action: approveDraft(author=empty) -> Error: ${
        "error" in approveResult3 ? approveResult3.error : "Unknown error"
      }`,
    );

    // Test 4: Incomplete draft details
    const approveResult4 = await concept.approveDraft({
      author: testAuthor,
      draftId: testDraftId,
      baseRecipe: testRecipe,
      newVersionNum: "2.3",
      draftDetails: {
        ingredients: [], // Empty ingredients
        steps: draftSteps,
        notes: draftNotes,
        goal: draftGoal,
      },
    });
    assertExists(
      (approveResult4 as { error: string }).error,
      "Requires: draftDetails complete. Effects: Should return error.",
    );
    assertEquals(
      (approveResult4 as { error: string }).error,
      "Incomplete draft details provided.",
      "Error message should indicate incomplete draft details.",
    );
    console.log(
      `Action: approveDraft(incomplete draftDetails) -> Error: ${
        "error" in approveResult4 ? approveResult4.error : "Unknown error"
      }`,
    );
  });

  await t.step("rejectDraft action tests", async () => {
    console.log("\n--- Testing rejectDraft action ---");
    const testAuthor = freshID();
    const testRecipe = freshID();
    const testDraftId = freshID();
    const goal = "Make it extra-salty.";

    // Test 1: Successful rejection output
    const rejectResult1 = await concept.rejectDraft({
      author: testAuthor,
      draftId: testDraftId,
      baseRecipe: testRecipe,
      goal: goal,
    });
    assertExists(
      (rejectResult1 as { draftToDeleteId: ID }).draftToDeleteId,
      "Effects: Should return draft ID to delete and prompt history entry.",
    );
    if ("error" in rejectResult1) {
      throw new Error(`Failed to reject draft: ${rejectResult1.error}`);
    }
    assertEquals(
      rejectResult1.draftToDeleteId,
      testDraftId,
      "Effects: Draft ID to delete should match.",
    );
    assertEquals(
      rejectResult1.promptHistoryEntry.status,
      "Rejected",
      "Effects: Prompt history status should be 'Rejected'.",
    );
    assertEquals(
      rejectResult1.promptHistoryEntry.promptText,
      goal,
      "Effects: Prompt history text should match goal.",
    );
    console.log(
      `Action: rejectDraft(...) -> Draft to delete: ${rejectResult1.draftToDeleteId}, Status: ${rejectResult1.promptHistoryEntry.status}`,
    );

    // Test 2: Missing author
    const rejectResult2 = await concept.rejectDraft({
      author: "" as ID,
      draftId: testDraftId,
      baseRecipe: testRecipe,
      goal: goal,
    });
    assertExists(
      (rejectResult2 as { error: string }).error,
      "Requires: Author ID. Effects: Should return error.",
    );
    assertEquals(
      (rejectResult2 as { error: string }).error,
      "Author ID must be provided.",
      "Error message should indicate missing author.",
    );
    console.log(
      `Action: rejectDraft(author=empty) -> Error: ${
        "error" in rejectResult2 ? rejectResult2.error : "Unknown error"
      }`,
    );

    // Test 3: Missing goal (empty string)
    const rejectResult3 = await concept.rejectDraft({
      author: testAuthor,
      draftId: testDraftId,
      baseRecipe: testRecipe,
      goal: "",
    });
    assertExists(
      (rejectResult3 as { error: string }).error,
      "Requires: Goal not empty. Effects: Should return error.",
    );
    assertEquals(
      (rejectResult3 as { error: string }).error,
      "Goal must be provided for logging.",
      "Error message should indicate missing goal.",
    );
    console.log(
      `Action: rejectDraft(goal=empty) -> Error: ${
        "error" in rejectResult3 ? rejectResult3.error : "Unknown error"
      }`,
    );
  });

  await t.step("Query methods tests", async () => {
    console.log("\n--- Testing Query Methods ---");

    // Clear existing versions to ensure clean test state
    await db.collection("Version.versions").deleteMany({});

    const author1: ID = freshID();
    const author2: ID = freshID();
    const recipeA: ID = freshID();
    const recipeB: ID = freshID();

    // Setup: Create some versions
    const createV1 = await concept.createVersion({
      author: author1,
      recipe: recipeA,
      versionNum: "1.0",
      notes: "First version of recipe A.",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
    });
    if ("error" in createV1) throw new Error(createV1.error);
    const version1Id = createV1.version;

    const createV2 = await concept.createVersion({
      author: author1,
      recipe: recipeA,
      versionNum: "1.1",
      notes: "Second version of recipe A (by same author).",
      ingredients: [
        { name: "Flour", quantity: "2 cups" },
        { name: "Sugar", quantity: "0.5 cup" },
      ],
      steps: createTestSteps(),
      promptHistory: [{
        promptText: "Cut sugar by half",
        modelName: "AI",
        timestamp: new Date(),
        draftId: freshID(),
        status: "Approved",
      }],
    });
    if ("error" in createV2) throw new Error(createV2.error);
    const version2Id = createV2.version;

    const createV3 = await concept.createVersion({
      author: author2,
      recipe: recipeB,
      versionNum: "1.0",
      notes: "First version of recipe B (by different author).",
      ingredients: [{ name: "Milk", quantity: "1 cup" }],
      steps: [{ description: "Heat milk." }],
    });
    if ("error" in createV3) throw new Error(createV3.error);
    const version3Id = createV3.version;

    console.log(
      `Setup: Created versions: ${version1Id} (R_A, A_1), ${version2Id} (R_A, A_1), ${version3Id} (R_B, A_2).`,
    );

    // Test 1: _getVersionById - existing version
    const getResult1 = await concept._getVersionById({ version: version1Id });
    assert(Array.isArray(getResult1), "Query should return an array");
    assertEquals(getResult1.length, 1, "Effects: Should return one version.");
    assertEquals(
      getResult1[0]._id,
      version1Id,
      "Effects: Should return the correct version.",
    );
    assertEquals(
      getResult1[0].promptHistory.length,
      0,
      "Effects: Version 1 has no prompt history.",
    );
    console.log(
      `Query: _getVersionById(${version1Id}) -> Found version ${getResult1[0].versionNum}.`,
    );

    // Test 2: _getVersionById - version with prompt history
    const getResult2 = await concept._getVersionById({ version: version2Id });
    assert(Array.isArray(getResult2), "Query should return an array");
    assertEquals(getResult2.length, 1, "Effects: Should return one version.");
    assertEquals(
      getResult2[0]._id,
      version2Id,
      "Effects: Should return the correct version.",
    );
    assertEquals(
      getResult2[0].promptHistory.length,
      1,
      "Effects: Version 2 has one prompt history entry.",
    );
    assertEquals(
      getResult2[0].promptHistory[0].status,
      "Approved",
      "Effects: Prompt history status is 'Approved'.",
    );
    console.log(
      `Query: _getVersionById(${version2Id}) -> Found version ${getResult2[0].versionNum} with prompt history.`,
    );

    // Test 3: _getVersionById - non-existent version
    const nonExistentVersionId = freshID();
    const getResult3 = await concept._getVersionById({
      version: nonExistentVersionId,
    });
    assert(Array.isArray(getResult3), "Query should return an array");
    assertEquals(
      getResult3.length,
      0,
      "Effects: Should return empty array for non-existent version.",
    );
    console.log(
      `Query: _getVersionById(nonExistent) -> Empty array (correct).`,
    );

    // Test 4: _listVersionsByRecipe - multiple versions for one recipe
    const listByRecipe1 = await concept._listVersionsByRecipe({
      recipe: recipeA,
    });
    assert(Array.isArray(listByRecipe1), "Query should return an array");
    assertEquals(
      listByRecipe1.length,
      2,
      "Effects: Should return two versions for recipe A.",
    );
    assertEquals(
      listByRecipe1[0]._id,
      version1Id,
      "Effects: Should be ordered by creation (V1.0 first).",
    );
    assertEquals(
      listByRecipe1[1]._id,
      version2Id,
      "Effects: Should be ordered by creation (V1.1 second).",
    );
    console.log(
      `Query: _listVersionsByRecipe(${recipeA}) -> Found ${listByRecipe1.length} versions.`,
    );

    // Test 5: _listVersionsByRecipe - single version for another recipe
    const listByRecipe2 = await concept._listVersionsByRecipe({
      recipe: recipeB,
    });
    assert(Array.isArray(listByRecipe2), "Query should return an array");
    assertEquals(
      listByRecipe2.length,
      1,
      "Effects: Should return one version for recipe B.",
    );
    assertEquals(
      listByRecipe2[0]._id,
      version3Id,
      "Effects: Should return the correct version.",
    );
    console.log(
      `Query: _listVersionsByRecipe(${recipeB}) -> Found ${listByRecipe2.length} version.`,
    );

    // Test 6: _listVersionsByRecipe - no versions for a recipe
    const listByRecipe3 = await concept._listVersionsByRecipe({
      recipe: freshID(),
    });
    assert(Array.isArray(listByRecipe3), "Query should return an array");
    assertEquals(
      listByRecipe3.length,
      0,
      "Effects: Should return empty array for recipe with no versions.",
    );
    console.log(
      `Query: _listVersionsByRecipe(recipeWithNoVersions) -> Empty array (correct).`,
    );

    // Test 7: _listVersionsByAuthor - multiple versions by one author
    const listByAuthor1 = await concept._listVersionsByAuthor({
      author: author1,
    });
    assert(Array.isArray(listByAuthor1), "Query should return an array");
    assertEquals(
      listByAuthor1.length,
      2,
      "Effects: Should return two versions for author 1.",
    );
    assert(
      listByAuthor1.every((v) => v.author === author1),
      "Effects: All returned versions should be by author 1.",
    );
    console.log(
      `Query: _listVersionsByAuthor(${author1}) -> Found ${listByAuthor1.length} versions.`,
    );

    // Test 8: _listVersionsByAuthor - single version by another author
    const listByAuthor2 = await concept._listVersionsByAuthor({
      author: author2,
    });
    assert(Array.isArray(listByAuthor2), "Query should return an array");
    assertEquals(
      listByAuthor2.length,
      1,
      "Effects: Should return one version for author 2.",
    );
    assertEquals(
      listByAuthor2[0]._id,
      version3Id,
      "Effects: Should return the correct version.",
    );
    console.log(
      `Query: _listVersionsByAuthor(${author2}) -> Found ${listByAuthor2.length} version.`,
    );

    // Test 9: _listVersionsByAuthor - no versions by an author
    const listByAuthor3 = await concept._listVersionsByAuthor({
      author: freshID(),
    });
    assert(Array.isArray(listByAuthor3), "Query should return an array");
    assertEquals(
      listByAuthor3.length,
      0,
      "Effects: Should return empty array for author with no versions.",
    );
    console.log(
      `Query: _listVersionsByAuthor(authorWithNoVersions) -> Empty array (correct).`,
    );

    // Test 10: Query for missing IDs (error cases)
    const errorGetVersion = await concept._getVersionById({ id: "" as ID });
    assertExists(
      (errorGetVersion as { error: string }).error,
      "Should return error for missing version ID",
    );
    console.log(
      `Query: _getVersionById(empty) -> Error: ${
        "error" in errorGetVersion ? errorGetVersion.error : "Unknown error"
      }`,
    );

    const errorListByRecipe = await concept._listVersionsByRecipe({
      recipe: "" as ID,
    });
    assertExists(
      (errorListByRecipe as { error: string }).error,
      "Should return error for missing recipe ID",
    );
    console.log(
      `Query: _listVersionsByRecipe(empty) -> Error: ${
        "error" in errorListByRecipe ? errorListByRecipe.error : "Unknown error"
      }`,
    );

    const errorListByAuthor = await concept._listVersionsByAuthor({
      author: "" as ID,
    });
    assertExists(
      (errorListByAuthor as { error: string }).error,
      "Should return error for missing author ID",
    );
    console.log(
      `Query: _listVersionsByAuthor(empty) -> Error: ${
        "error" in errorListByAuthor ? errorListByAuthor.error : "Unknown error"
      }`,
    );
  });
});
```
