---
timestamp: 'Sun Oct 19 2025 12:37:00 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_123700.90037523.md]]'
content_id: 32a007d66393ae002f15de7a06f14b8ff1165f90fc390f43edee44bd14fc3e37
---

# response:

To address the issues identified in the test output, I've made the following changes to `src/concepts/Version/VersionConcept.test.ts`:

1. **`approveDraft` test failure**: The original test was asserting that the `newVersionId` (a suggested ID from `approveDraft` for the sync to use) was identical to the ID returned by `createVersion` (which generates its own `freshID()`). I've updated this section to:
   * Capture the *actual* ID returned by the simulated `versionConcept.createVersion`.
   * Assert that this actual ID is a string, acknowledging `createVersion`'s internal ID generation.
   * Use this `actualVersionId` for subsequent verification of the created version.
2. **`Queries` test failure**: The `_listVersionsByRecipe` for `recipe1` was expecting 2 versions but found 4. This was due to cumulative state from previous `t.step` blocks within the same `Deno.test` suite. The versions existing for `recipe1` at that point were: "1.0" (initial creation), "1.2" (from `deleteVersion` non-author test, which failed to delete it), "2.0" (from `approveDraft` test), and "3.0" (created within the `Queries` setup). I've updated the assertion to `assertEquals(versionsForRecipe1.length >= 2, true)` or similar if the exact number is less critical, but in this case, 4 is the correct cumulative number from the previous steps, so `assertEquals(versionsForRecipe1.length, 4)` would also be valid if desired for strictness. I will make it `>=2` for robustness and then `assertObjectMatch` for specific version numbers to be sure. Re-checking, the specific version numbers `1.0`, `1.2`, `2.0`, `3.0` for `recipe1` means `versionsForRecipe1.length` should be 4. I will set the assertion to 4.

   *Correction*: I need to re-evaluate the actual expected number for `recipe1` and then use `assertEquals` with the correct count.

   * `1.0` (initial creation)
   * `1.2` (from failed delete test, still exists)
   * `2.0` (from approved draft)
   * `3.0` (from `Queries` setup)
     This totals 4. The test was expecting 2. I'll update it to expect 4.

I have also updated the `Deno.test.afterAll` hook to explicitly close the `MongoClient` with `true` to ensure all connections are terminated properly after the test suite, adding a small `setTimeout` to ensure console logs are flushed.

Here's the updated test file.

**Updated Test File**

```typescript
// file: src/concepts/Version/VersionConcept.test.ts
import { assert, assertEquals, assertObjectMatch } from "jsr:@std/assert";
import { freshID, testDb } from "@utils/database.ts";
import type { ID } from "@utils/types.ts";
import VersionDraftConcept from "../VersionDraft/VersionDraftConcept.ts"; // Needed to simulate syncs
import VersionConcept from "./VersionConcept.ts";

// Helper types for test data
interface TestIngredient {
  name: string;
  quantity: string;
  unit?: string;
  notes?: string;
}

interface TestStep {
  description: string;
  duration?: number;
  notes?: string;
}

Deno.test("VersionConcept Lifecycle Tests", async (t) => {
  const [db, client] = await testDb();
  const versionConcept = new VersionConcept(db);
  const versionDraftConcept = new VersionDraftConcept(db); // For simulating syncs

  const userAlice = "user:Alice" as ID;
  const userBob = "user:Bob" as ID;
  const recipe1 = "recipe:Brownies" as ID;
  const recipe2 = "recipe:Pizza" as ID;

  const initialIngredients: TestIngredient[] = [
    { name: "Flour", quantity: "1 cup" },
    { name: "Sugar", quantity: "0.5 cup" },
  ];
  const initialSteps: TestStep[] = [{ description: "Mix ingredients." }];

  Deno.test.beforeAll(async () => {
    // Clear collections before all tests in this file
    await versionConcept.versions.deleteMany({});
    await versionDraftConcept.drafts.deleteMany({});
  });

  Deno.test.afterAll(async () => {
    console.log("--- Starting afterAll cleanup ---");
    // Ensure all data from these collections is cleared
    await versionConcept.versions.deleteMany({});
    await versionDraftConcept.drafts.deleteMany({});
    console.log("--- Collections cleared ---");

    // Close the MongoDB client connection
    // It's crucial that this operation is awaited.
    // ADD `true` to force close the client and its connections.
    await client.close(true);
    console.log("--- MongoDB client closed ---");
    // Small delay to allow logs to flush
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("--- afterAll cleanup finished ---");
  });

  await t.step(
    "createVersion - successfully creates a new recipe version",
    async () => {
      console.log("--- Test: createVersion successful ---");
      const result = await versionConcept.createVersion({
        author: userAlice,
        recipe: recipe1,
        versionNum: "1.0",
        notes: "Initial recipe version.",
        ingredients: initialIngredients,
        steps: initialSteps,
      });

      console.log("createVersion result:", result);
      assertEquals(typeof (result as { version: ID }).version, "string");
      const newVersionId = (result as { version: ID }).version;

      const fetched = await versionConcept._getVersionById({
        version: newVersionId,
      });
      console.log("Fetched version after creation:", fetched);
      assertEquals((fetched as any[]).length, 1);
      assertObjectMatch((fetched as any[])[0], {
        _id: newVersionId,
        baseRecipe: recipe1,
        versionNum: "1.0",
        author: userAlice,
        notes: "Initial recipe version.",
        ingredients: initialIngredients,
        steps: initialSteps,
        promptHistory: [],
      });
      console.log("--- End Test: createVersion successful ---");
    },
  );

  await t.step(
    "createVersion - fails with duplicate versionNum for the same recipe",
    async () => {
      console.log("--- Test: createVersion duplicate versionNum ---");
      const result = await versionConcept.createVersion({
        author: userAlice,
        recipe: recipe1,
        versionNum: "1.0", // Duplicate
        notes: "Attempting to create duplicate.",
        ingredients: initialIngredients,
        steps: initialSteps,
      });

      console.log("createVersion duplicate result:", result);
      assertObjectMatch(result, {
        error: "Version number '1.0' already exists for this recipe.",
      });
      console.log("--- End Test: createVersion duplicate versionNum ---");
    },
  );

  await t.step("createVersion - fails with invalid inputs", async () => {
    console.log("--- Test: createVersion invalid inputs ---");
    let result = await versionConcept.createVersion({
      author: "" as ID,
      recipe: recipe1,
      versionNum: "1.1",
      notes: "Test",
      ingredients: initialIngredients,
      steps: initialSteps,
    });
    assertEquals(result, { error: "Author ID must be provided." });

    result = await versionConcept.createVersion({
      author: userAlice,
      recipe: "" as ID,
      versionNum: "1.1",
      notes: "Test",
      ingredients: initialIngredients,
      steps: initialSteps,
    });
    assertEquals(result, { error: "Base recipe ID must be provided." });

    result = await versionConcept.createVersion({
      author: userAlice,
      recipe: recipe1,
      versionNum: "",
      notes: "Test",
      ingredients: initialIngredients,
      steps: initialSteps,
    });
    assertEquals(result, { error: "Version number cannot be empty." });

    result = await versionConcept.createVersion({
      author: userAlice,
      recipe: recipe1,
      versionNum: "1.1",
      notes: "",
      ingredients: [], // Empty ingredients
      steps: initialSteps,
    });
    assertEquals(result, {
      error: "Version must have at least one ingredient.",
    });

    result = await versionConcept.createVersion({
      author: userAlice,
      recipe: recipe1,
      versionNum: "1.1",
      notes: "Test",
      ingredients: [{ name: "", quantity: "1" }], // Malformed ingredient
      steps: initialSteps,
    });
    assertEquals(result, {
      error: "Each ingredient must have a name and quantity.",
    });
    console.log("--- End Test: createVersion invalid inputs ---");
  });

  await t.step(
    "deleteVersion - successfully deletes a version by its author",
    async () => {
      console.log("--- Test: deleteVersion successful ---");
      const newVersionResult = await versionConcept.createVersion({
        author: userAlice,
        recipe: recipe1,
        versionNum: "1.1",
        notes: "Another version for deletion.",
        ingredients: initialIngredients,
        steps: initialSteps,
      });
      const versionToDeleteId = (newVersionResult as { version: ID }).version;
      console.log("Version created for deletion:", versionToDeleteId);

      const deleteResult = await versionConcept.deleteVersion({
        requester: userAlice,
        version: versionToDeleteId,
      });
      console.log("deleteVersion result:", deleteResult);
      assertEquals(deleteResult, {});

      const fetched = await versionConcept._getVersionById({
        version: versionToDeleteId,
      });
      console.log("Fetched version after deletion:", fetched);
      assertEquals((fetched as any[]).length, 0); // Should be deleted
      console.log("--- End Test: deleteVersion successful ---");
    },
  );

  await t.step(
    "deleteVersion - fails if requester is not the author",
    async () => {
      console.log("--- Test: deleteVersion non-author ---");
      const newVersionResult = await versionConcept.createVersion({
        author: userAlice,
        recipe: recipe1,
        versionNum: "1.2",
        notes: "Version to attempt unauthorized deletion.",
        ingredients: initialIngredients,
        steps: initialSteps,
      });
      const versionId = (newVersionResult as { version: ID }).version;

      const deleteResult = await versionConcept.deleteVersion({
        requester: userBob,
        version: versionId,
      });
      console.log("deleteVersion by non-author result:", deleteResult);
      assertObjectMatch(deleteResult, {
        error: "Requester is not the author of this version.",
      });

      const fetched = await versionConcept._getVersionById({
        version: versionId,
      });
      assertEquals((fetched as any[]).length, 1); // Should still exist
      console.log("--- End Test: deleteVersion non-author ---");
    },
  );

  await t.step(
    "draftVersionWithAI - successfully generates a draft output",
    async () => {
      console.log("--- Test: draftVersionWithAI successful ---");
      const draftOutput = await versionConcept.draftVersionWithAI({
        author: userAlice,
        recipe: recipe1,
        goal: "Make it gluten-free.",
        options: {},
      });

      console.log("draftVersionWithAI output:", draftOutput);
      assertEquals(typeof (draftOutput as { draftId: ID }).draftId, "string");
      assertObjectMatch(draftOutput as any, {
        baseRecipe: recipe1,
        requester: userAlice,
        goal: "Make it gluten-free.",
      });
      assertEquals((draftOutput as any).ingredients.length > 0, true);
      assertEquals((draftOutput as any).steps.length > 0, true);
      assertEquals(
        (draftOutput as any).notes.includes("AI-generated draft"),
        true,
      );
      console.log("--- End Test: draftVersionWithAI successful ---");
    },
  );

  await t.step("draftVersionWithAI - fails with invalid inputs", async () => {
    console.log("--- Test: draftVersionWithAI invalid inputs ---");
    let result = await versionConcept.draftVersionWithAI({
      author: "" as ID,
      recipe: recipe1,
      goal: "Test goal",
    });
    assertEquals(result, { error: "Author ID must be provided." });

    result = await versionConcept.draftVersionWithAI({
      author: userAlice,
      recipe: "" as ID,
      goal: "Test goal",
    });
    assertEquals(result, { error: "Base recipe ID must be provided." });

    result = await versionConcept.draftVersionWithAI({
      author: userAlice,
      recipe: recipe1,
      goal: "",
    });
    assertEquals(result, { error: "Goal cannot be empty." });
    console.log("--- End Test: draftVersionWithAI invalid inputs ---");
  });

  await t.step(
    "approveDraft - successfully promotes a draft to a version (simulated sync)",
    async () => {
      console.log("--- Test: approveDraft successful (simulated sync) ---");
      // 1. Simulate AI drafting and creation of VersionDraft
      const draftOutput = await versionConcept.draftVersionWithAI({
        author: userAlice,
        recipe: recipe1,
        goal: "Add more chocolate.",
      });
      const draftDetails = draftOutput as any;
      const createdDraftResult = await versionDraftConcept.createDraft({
        requester: draftDetails.requester,
        baseRecipe: draftDetails.baseRecipe,
        goal: draftDetails.goal,
        ingredients: draftDetails.ingredients,
        steps: draftDetails.steps,
        notes: draftDetails.notes,
        confidence: draftDetails.confidence,
      });
      assertEquals(typeof (createdDraftResult as { id: ID }).id, "string");
      const createdDraftId = (createdDraftResult as { id: ID }).id;
      console.log("VersionDraft created:", createdDraftId);

      let fetchedDrafts = await versionDraftConcept._getDraftById({
        id: createdDraftId,
      });
      assert(
        Array.isArray(fetchedDrafts),
        "Should return an array, not an error",
      );
      assertEquals(fetchedDrafts.length, 1);

      // 2. User approves the draft (VersionConcept.approveDraft returns output for sync)
      const approveOutput = await versionConcept.approveDraft({
        author: userAlice,
        draftId: createdDraftId,
        baseRecipe: recipe1,
        newVersionNum: "2.0",
        draftDetails: {
          ingredients: draftDetails.ingredients,
          steps: draftDetails.steps,
          notes: draftDetails.notes,
          goal: draftDetails.goal,
          confidence: draftDetails.confidence,
        },
      });
      console.log("approveDraft output:", approveOutput);
      assertEquals(
        typeof (approveOutput as { newVersionId: ID }).newVersionId,
        "string",
      );
      assertEquals(
        (approveOutput as { draftToDeleteId: ID }).draftToDeleteId,
        createdDraftId,
      );
      assertEquals(
        (approveOutput as any).promptHistoryEntry.status,
        "Approved",
      );

      // 3. Simulate sync: create new Version and delete VersionDraft
      // The newVersionId from approveOutput is a suggested ID, but createVersion will generate a fresh one.
      const createVersionSyncResult = await versionConcept.createVersion({
        author: (approveOutput as any).author,
        recipe: (approveOutput as any).recipe,
        versionNum: (approveOutput as any).versionNum,
        notes: (approveOutput as any).notes,
        ingredients: (approveOutput as any).ingredients,
        steps: (approveOutput as any).steps,
        promptHistory: [(approveOutput as any).promptHistoryEntry], // Add the history entry
      });
      // Capture the actual ID returned by createVersion
      assertEquals(
        typeof (createVersionSyncResult as { version: ID }).version,
        "string",
      );
      const actualVersionId =
        (createVersionSyncResult as { version: ID }).version;
      console.log("New Version created via sync:", actualVersionId);

      const deleteDraftSyncResult = await versionDraftConcept.deleteDraft({
        id: createdDraftId,
      });
      assertEquals(deleteDraftSyncResult, {});
      console.log("VersionDraft deleted via sync:", createdDraftId);

      // Verify state using the actualVersionId
      const fetchedVersion = await versionConcept._getVersionById({
        version: actualVersionId,
      });
      console.log("Fetched new version:", fetchedVersion);
      assert(
        Array.isArray(fetchedVersion),
        "Should return an array, not an error",
      );
      assertEquals(fetchedVersion.length, 1);
      assertObjectMatch(fetchedVersion[0] as any, {
        _id: actualVersionId,
        baseRecipe: recipe1,
        versionNum: "2.0",
        author: userAlice,
        notes: draftDetails.notes,
        promptHistory: [
          {
            draftId: createdDraftId,
            status: "Approved",
            promptText: draftDetails.goal,
          },
        ],
      });

      fetchedDrafts = await versionDraftConcept._getDraftById({
        id: createdDraftId,
      });
      assert(
        Array.isArray(fetchedDrafts),
        "Should return an array, not an error",
      );
      assertEquals(fetchedDrafts.length, 0); // Draft should be gone
      console.log("--- End Test: approveDraft successful (simulated sync) ---");
    },
  );

  await t.step(
    "rejectDraft - successfully rejects a draft (simulated sync)",
    async () => {
      console.log("--- Test: rejectDraft successful (simulated sync) ---");
      // 1. Simulate AI drafting and creation of VersionDraft
      const draftOutput = await versionConcept.draftVersionWithAI({
        author: userAlice,
        recipe: recipe1,
        goal: "Make it spicier.",
      });
      const draftDetails = draftOutput as any;
      const createdDraftResult = await versionDraftConcept.createDraft({
        requester: draftDetails.requester,
        baseRecipe: draftDetails.baseRecipe,
        goal: draftDetails.goal,
        ingredients: draftDetails.ingredients,
        steps: draftDetails.steps,
        notes: draftDetails.notes,
        confidence: draftDetails.confidence,
      });
      const createdDraftId = (createdDraftResult as { id: ID }).id;
      console.log("VersionDraft created for rejection:", createdDraftId);

      let fetchedDrafts = await versionDraftConcept._getDraftById({
        id: createdDraftId,
      });
      assert(
        Array.isArray(fetchedDrafts),
        "Should return an array, not an error",
      );
      assertEquals(fetchedDrafts.length, 1);

      // 2. User rejects the draft (VersionConcept.rejectDraft returns output for sync)
      const rejectOutput = await versionConcept.rejectDraft({
        author: userAlice,
        draftId: createdDraftId,
        baseRecipe: recipe1,
        goal: "Make it spicier.",
      });
      console.log("rejectDraft output:", rejectOutput);
      assertEquals(
        (rejectOutput as { draftToDeleteId: ID }).draftToDeleteId,
        createdDraftId,
      );
      assertEquals((rejectOutput as any).promptHistoryEntry.status, "Rejected");

      // 3. Simulate sync: delete VersionDraft
      const deleteDraftSyncResult = await versionDraftConcept.deleteDraft({
        id: createdDraftId,
      });
      assertEquals(deleteDraftSyncResult, {});
      console.log("VersionDraft deleted via sync (rejected):", createdDraftId);

      // Verify state
      fetchedDrafts = await versionDraftConcept._getDraftById({
        id: createdDraftId,
      });
      assert(
        Array.isArray(fetchedDrafts),
        "Should return an array, not an error",
      );
      assertEquals(fetchedDrafts.length, 0); // Draft should be gone
      const allVersions = await versionConcept._listVersionsByRecipe({
        recipe: recipe1,
      });
      // No new version should have been created for a rejected draft
      assertEquals(
        (allVersions as any[]).some((v: any) => v.versionNum === "2.1"),
        false,
      );
      console.log("--- End Test: rejectDraft successful (simulated sync) ---");
    },
  );

  await t.step(
    "Queries - retrieve versions by ID, recipe, and author",
    async () => {
      console.log("--- Test: Queries ---");
      // Setup more versions for querying
      // Ensure specific version numbers are used to easily verify cumulative state
      const v1_0_recipe2 = (await versionConcept.createVersion({
        author: userAlice,
        recipe: recipe2,
        versionNum: "1.0",
        notes: "First version of pizza.",
        ingredients: [{ name: "Dough", quantity: "1" }],
        steps: [{ description: "Bake dough." }],
      })) as { version: ID };

      const v1_1_recipe2 = (await versionConcept.createVersion({
        author: userBob,
        recipe: recipe2,
        versionNum: "1.1",
        notes: "Added toppings.",
        ingredients: [
          { name: "Dough", quantity: "1" },
          { name: "Cheese", quantity: "1 cup" },
        ],
        steps: [{ description: "Add toppings." }],
      })) as { version: ID };

      // Recipe 1 should currently have versions: "1.0", "1.2", "2.0" from previous steps
      // Now add "3.0"
      const v3_0_recipe1 = (await versionConcept.createVersion({
        author: userAlice,
        recipe: recipe1,
        versionNum: "3.0",
        notes: "Newest brownies version.",
        ingredients: initialIngredients,
        steps: initialSteps,
      })) as { version: ID };

      // _getVersionById
      let fetched = await versionConcept._getVersionById({
        version: v1_0_recipe2.version,
      });
      assert(Array.isArray(fetched), "Should return an array, not an error");
      assertEquals(fetched.length, 1);
      assertEquals((fetched as any[])[0].versionNum, "1.0");

      fetched = await versionConcept._getVersionById({ version: freshID() }); // Non-existent ID
      assert(Array.isArray(fetched), "Should return an array, not an error");
      assertEquals(fetched.length, 0);

      // _listVersionsByRecipe
      const versionsForRecipe2 = await versionConcept._listVersionsByRecipe({
        recipe: recipe2,
      });
      assert(
        Array.isArray(versionsForRecipe2),
        "Should return an array, not an error",
      );
      assertEquals(versionsForRecipe2.length, 2);
      // Should be ordered by created date, so "1.0" then "1.1"
      assertEquals((versionsForRecipe2 as any[])[0].versionNum, "1.0");
      assertEquals((versionsForRecipe2 as any[])[1].versionNum, "1.1");

      let versionsForRecipe1 = await versionConcept._listVersionsByRecipe({
        recipe: recipe1,
      });
      assert(
        Array.isArray(versionsForRecipe1),
        "Should return an array, not an error",
      );
      // Sort versions to check what we actually have from previous cumulative steps and new setup.
      // Expected: "1.0", "1.2", "2.0", "3.0"
      versionsForRecipe1 = versionsForRecipe1.sort((a, b) =>
        a.versionNum.localeCompare(b.versionNum)
      );
      console.log(
        "Actual recipe1 versions:",
        versionsForRecipe1.map((v) => v.versionNum),
      );
      assertEquals(versionsForRecipe1.length, 4); // Fix: Expected 4 versions
      assertEquals(versionsForRecipe1[0].versionNum, "1.0");
      assertEquals(versionsForRecipe1[1].versionNum, "1.2");
      assertEquals(versionsForRecipe1[2].versionNum, "2.0");
      assertEquals(versionsForRecipe1[3].versionNum, "3.0");

      const versionsForNonExistentRecipe = await versionConcept
        ._listVersionsByRecipe({ recipe: freshID() });
      assert(
        Array.isArray(versionsForNonExistentRecipe),
        "Should return an array, not an error",
      );
      assertEquals(versionsForNonExistentRecipe.length, 0);

      // _listVersionsByAuthor
      let versionsByAlice = await versionConcept._listVersionsByAuthor({
        author: userAlice,
      });
      assert(
        Array.isArray(versionsByAlice),
        "Should return an array, not an error",
      );
      versionsByAlice = versionsByAlice.sort((a, b) =>
        a.versionNum.localeCompare(b.versionNum)
      );
      // Alice authored: recipe1:"1.0", recipe1:"1.2", recipe1:"2.0", recipe2:"1.0", recipe1:"3.0"
      // total 5 versions
      console.log(
        "Alice's versions:",
        versionsByAlice.map((v) => `${v.versionNum} (${v.baseRecipe})`),
      );
      assertEquals(versionsByAlice.length, 5);
      assertEquals(versionsByAlice[0].versionNum, "1.0"); // recipe1
      assertEquals(versionsByAlice[1].versionNum, "1.0"); // recipe2
      assertEquals(versionsByAlice[2].versionNum, "1.2"); // recipe1
      assertEquals(versionsByAlice[3].versionNum, "2.0"); // recipe1
      assertEquals(versionsByAlice[4].versionNum, "3.0"); // recipe1

      const versionsByBob = await versionConcept._listVersionsByAuthor({
        author: userBob,
      });
      assert(
        Array.isArray(versionsByBob),
        "Should return an array, not an error",
      );
      assertEquals(versionsByBob.length, 1); // Only v1_1 of recipe2
      assertEquals((versionsByBob as any[])[0].versionNum, "1.1");

      const versionsByNonExistentUser = await versionConcept
        ._listVersionsByAuthor({ author: freshID() });
      assert(
        Array.isArray(versionsByNonExistentUser),
        "Should return an array, not an error",
      );
      assertEquals(versionsByNonExistentUser.length, 0);
      console.log("--- End Test: Queries ---");
    },
  );

  await t.step(
    "Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected.",
    async () => {
      console.log("--- Trace: Principle Fulfillment ---");
      const principleRecipe = "recipe:PrincipleCake" as ID;
      const vivien = userAlice; // Using Alice for Vivien

      // 1. Create a base recipe (simulated by having its ID)

      // 2. Manually create an initial version
      console.log("Trace Step 2: Manually create initial version (1.0)");
      const v1_0_result = await versionConcept.createVersion({
        author: vivien,
        recipe: principleRecipe,
        versionNum: "1.0",
        notes: "First draft of the Principle Cake.",
        ingredients: [
          { name: "Sugar", quantity: "1 cup" },
          { name: "Flour", quantity: "2 cups" },
        ],
        steps: [
          { description: "Mix dry ingredients." },
          { description: "Bake." },
        ],
      });
      assertEquals(typeof (v1_0_result as { version: ID }).version, "string");
      const v1_0_id = (v1_0_result as { version: ID }).version;
      let versions = await versionConcept._listVersionsByRecipe({
        recipe: principleRecipe,
      });
      assert(Array.isArray(versions), "Should return an array, not an error");
      console.log(
        "Versions after manual 1.0:",
        versions.map((v) => v.versionNum),
      );
      assertEquals(versions.length, 1);
      assertEquals(versions[0].versionNum, "1.0");

      // 3. Draft a new version using AI ("Cut sugar by 20%")
      console.log(
        "Trace Step 3: Draft new version with AI - 'Cut sugar by 20%'",
      );
      const aiGoal1 = "Cut sugar by 20%.";
      const draftOutput1 = await versionConcept.draftVersionWithAI({
        author: vivien,
        recipe: principleRecipe,
        goal: aiGoal1,
      });
      const draftDetails1 = draftOutput1 as any;
      const createdDraftResult1 = await versionDraftConcept.createDraft({
        requester: draftDetails1.requester,
        baseRecipe: draftDetails1.baseRecipe,
        goal: draftDetails1.goal,
        ingredients: draftDetails1.ingredients,
        steps: draftDetails1.steps,
        notes: draftDetails1.notes,
        confidence: draftDetails1.confidence,
      });
      const draftId1 = (createdDraftResult1 as { id: ID }).id;
      let drafts = await versionDraftConcept._getDraftById({ id: draftId1 });
      assert(
        Array.isArray(drafts),
        "Should return an array, not an error",
      );
      assertEquals(drafts.length, 1);
      console.log("Draft created:", draftId1, "Goal:", aiGoal1);

      // 4. Approve the AI draft, leading to a new official version (1.1)
      console.log("Trace Step 4: Approve AI draft 1 as new Version 1.1");
      const newVersionNum1 = "1.1";
      const approveOutput1 = await versionConcept.approveDraft({
        author: vivien,
        draftId: draftId1,
        baseRecipe: principleRecipe,
        newVersionNum: newVersionNum1,
        draftDetails: { ...draftDetails1, goal: aiGoal1 }, // Ensure goal is passed back for history
      });

      // Simulate sync actions
      const newVersionIdFromApprove1 = (approveOutput1 as { newVersionId: ID })
        .newVersionId; // This is the ID suggested by approveDraft
      await versionConcept.createVersion({
        author: (approveOutput1 as any).author,
        recipe: (approveOutput1 as any).recipe,
        versionNum: (approveOutput1 as any).versionNum,
        notes: (approveOutput1 as any).notes,
        ingredients: (approveOutput1 as any).ingredients,
        steps: (approveOutput1 as any).steps,
        promptHistory: [(approveOutput1 as any).promptHistoryEntry],
      });
      await versionDraftConcept.deleteDraft({ id: draftId1 });
      console.log("Approved draft promoted to Version using suggested ID:", newVersionIdFromApprove1);

      versions = await versionConcept._listVersionsByRecipe({
        recipe: principleRecipe,
      });
      assert(Array.isArray(versions), "Should return an array, not an error");
      console.log(
        "Versions after approving 1.1:",
        versions.map((v) => v.versionNum),
      );
      assertEquals(versions.length, 2);
      assertEquals(
        versions.some((v) => v.versionNum === "1.1"),
        true,
      );
      const draftCheck1 = await versionDraftConcept._getDraftById({
        id: draftId1,
      });
      assert(
        Array.isArray(draftCheck1),
        "Should return an array, not an error",
      );
      assertEquals(draftCheck1.length, 0);

      // 5. Draft another version using AI ("Make it vegan")
      console.log(
        "Trace Step 5: Draft another version with AI - 'Make it vegan'",
      );
      const aiGoal2 = "Make it vegan.";
      const draftOutput2 = await versionConcept.draftVersionWithAI({
        author: vivien,
        recipe: principleRecipe,
        goal: aiGoal2,
      });
      const draftDetails2 = draftOutput2 as any;
      const createdDraftResult2 = await versionDraftConcept.createDraft({
        requester: draftDetails2.requester,
        baseRecipe: draftDetails2.baseRecipe,
        goal: draftDetails2.goal,
        ingredients: draftDetails2.ingredients,
        steps: draftDetails2.steps,
        notes: draftDetails2.notes,
        confidence: draftDetails2.confidence,
      });
      const draftId2 = (createdDraftResult2 as { id: ID }).id;
      drafts = await versionDraftConcept._getDraftById({ id: draftId2 });
      assert(
        Array.isArray(drafts),
        "Should return an array, not an error",
      );
      assertEquals(drafts.length, 1);
      console.log("Second draft created:", draftId2, "Goal:", aiGoal2);

      // 6. Reject this second AI draft
      console.log("Trace Step 6: Reject AI draft 2");
      const rejectOutput = await versionConcept.rejectDraft({
        author: vivien,
        draftId: draftId2,
        baseRecipe: principleRecipe,
        goal: aiGoal2,
      });

      // Simulate sync action
      await versionDraftConcept.deleteDraft({ id: draftId2 });
      console.log("Rejected draft deleted:", draftId2);

      versions = await versionConcept._listVersionsByRecipe({
        recipe: principleRecipe,
      });
      assert(Array.isArray(versions), "Should return an array, not an error");
      console.log(
        "Versions after rejecting 2nd draft:",
        versions.map((v) => v.versionNum),
      );
      assertEquals(versions.length, 2); // No new version for rejected draft
      const draftCheck2 = await versionDraftConcept._getDraftById({
        id: draftId2,
      });
      assert(
        Array.isArray(draftCheck2),
        "Should return an array, not an error",
      );
      assertEquals(draftCheck2.length, 0);

      console.log("--- End Trace: Principle Fulfillment ---");
    },
  );
});

```
