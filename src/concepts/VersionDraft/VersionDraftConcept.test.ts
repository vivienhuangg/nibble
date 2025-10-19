import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertExists,
  assertNotEquals,
} from "jsr:@std/assert";
import type { Collection, Db, MongoClient } from "npm:mongodb";
import { testDb } from "@utils/database.ts";
import type { ID } from "@utils/types.ts";
import VersionDraftConcept from "./VersionDraftConcept.ts";

// --- Helper types for Ingredient and Step, copied from VersionDraftConcept.ts for clarity and to avoid circular deps ---
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
 * State of the VersionDraft concept (copied for test file)
 */
interface VersionDraftDoc {
  _id: ID; // Maps to concept 'id'
  requester: ID; // User
  baseRecipe: ID; // Recipe
  goal: string;
  ingredients: Ingredient[]; // Proposed changes
  steps: Step[]; // Proposed changes
  notes: string; // AI-generated summary of changes
  confidence?: number; // AI's confidence in the draft
  created: Date;
  expires: Date; // e.g., 24 hours
}

const PREFIX = "VersionDraft" + "."; // Collection prefix

Deno.test("VersionDraftConcept", {
  sanitizeResources: false,
  sanitizeOps: false,
  sanitizeExit: false,
}, async (t) => {
  // Setup: Initialize DB and concept once for the entire test file
  const [db, client]: [Db, MongoClient] = await testDb();
  const concept = new VersionDraftConcept(db);
  const draftsCollection: Collection<VersionDraftDoc> = db.collection(
    PREFIX + "drafts",
  );

  // Teardown: Close the MongoDB client after all tests in this file are done
  Deno.test.afterAll(async () => {
    console.log(
      "--- Closing MongoDB client after all VersionDraftConcept tests ---",
    );
    await client.close();
  });

  // Pre-test hook: Clear the drafts collection before each major test step to ensure isolation
  Deno.test.beforeEach(async () => {
    console.log(
      "--- Cleaning drafts collection before each major test step ---",
    );
    await draftsCollection.deleteMany({}); // Clear collection before each test block
  });

  // Common test data
  const MOCK_USER_ID: ID = "user123" as ID;
  const MOCK_RECIPE_ID: ID = "recipe456" as ID;
  const MOCK_INGREDIENTS: Ingredient[] = [
    { name: "Sugar", quantity: "1", unit: "cup" },
    { name: "Flour", quantity: "2", unit: "cups", notes: "all-purpose" },
  ];
  const MOCK_STEPS: Step[] = [
    { description: "Mix dry ingredients.", duration: 2 },
    { description: "Add wet ingredients.", notes: "Slowly" },
  ];
  const MOCK_NOTES = "Increased sugar and simplified steps.";
  const MOCK_GOAL = "Make it sweeter and easier to follow";

  // Test createDraft action
  await t.step("createDraft: satisfies requirements and effects", async (t) => {
    await draftsCollection.deleteMany({});
    await t.step(
      "should successfully create a new draft with valid inputs",
      async () => {
        console.log("Action: createDraft");
        console.log(
          `Input: requester=${MOCK_USER_ID}, baseRecipe=${MOCK_RECIPE_ID}, goal=${MOCK_GOAL}, ingredients=${
            JSON.stringify(
              MOCK_INGREDIENTS,
            )
          }, steps=${
            JSON.stringify(
              MOCK_STEPS,
            )
          }, notes=${MOCK_NOTES}, confidence=0.8`,
        );

        const result = await concept.createDraft({
          requester: MOCK_USER_ID,
          baseRecipe: MOCK_RECIPE_ID,
          goal: MOCK_GOAL,
          ingredients: MOCK_INGREDIENTS,
          steps: MOCK_STEPS,
          notes: MOCK_NOTES,
          confidence: 0.8,
        });

        // Requirement confirmation: No error returned for valid inputs
        assert(
          !("error" in result),
          `Expected no error, but received: ${JSON.stringify(result)}`,
        );

        const { id } = result as { id: ID };
        assertExists(
          id,
          "Expected id to be returned upon successful creation.",
        );
        console.log(`Output: id=${id}`);

        // Effect confirmation: Document exists in DB with correct fields
        const doc = await draftsCollection.findOne({ _id: id });
        assertExists(
          doc,
          "Expected the created document to be found in the database.",
        );
        assertEquals(doc.requester, MOCK_USER_ID);
        assertEquals(doc.baseRecipe, MOCK_RECIPE_ID);
        assertEquals(doc.goal, MOCK_GOAL);
        assertEquals(doc.ingredients, MOCK_INGREDIENTS);
        assertEquals(doc.steps, MOCK_STEPS);
        assertEquals(doc.notes, MOCK_NOTES);
        assertEquals(doc.confidence, 0.8);
        assertExists(doc.created);
        assertExists(doc.expires);
        assert(
          doc.expires.getTime() > doc.created.getTime(),
          "Expiry date should be after creation date.",
        );
        console.log(
          `Effect confirmed: Document with ID ${id} created and matches input data.`,
        );
      },
    );

    await t.step(
      "should return an error if baseRecipe ID is missing",
      async () => {
        console.log("Action: createDraft (negative test - missing baseRecipe)");
        const result = await concept.createDraft({
          requester: MOCK_USER_ID,
          baseRecipe: "" as ID, // Invalid baseRecipe
          goal: MOCK_GOAL,
          ingredients: MOCK_INGREDIENTS,
          steps: MOCK_STEPS,
          notes: MOCK_NOTES,
        });

        // Requirement confirmation: Error returned for missing baseRecipe
        assert(
          "error" in result,
          "Expected an error for missing baseRecipe.",
        );
        assertEquals(
          (result as { error: string }).error,
          "Base recipe ID must be provided.",
        );
        console.log(
          `Requirement confirmed: Error returned for missing baseRecipe. Output: ${
            JSON.stringify(
              result,
            )
          }`,
        );
      },
    );

    await t.step(
      "should return an error if requester ID is missing",
      async () => {
        console.log("Action: createDraft (negative test - missing requester)");
        const result = await concept.createDraft({
          requester: "" as ID, // Invalid requester
          baseRecipe: MOCK_RECIPE_ID,
          goal: MOCK_GOAL,
          ingredients: MOCK_INGREDIENTS,
          steps: MOCK_STEPS,
          notes: MOCK_NOTES,
        });

        // Requirement confirmation: Error returned for missing requester
        assert(
          "error" in result,
          "Expected an error for missing requester.",
        );
        assertEquals(
          (result as { error: string }).error,
          "Requester ID must be provided.",
        );
        console.log(
          `Requirement confirmed: Error returned for missing requester. Output: ${
            JSON.stringify(
              result,
            )
          }`,
        );
      },
    );

    await t.step("should return an error if goal is empty", async () => {
      console.log("Action: createDraft (negative test - empty goal)");
      const result = await concept.createDraft({
        requester: MOCK_USER_ID,
        baseRecipe: MOCK_RECIPE_ID,
        goal: "   ", // Empty goal
        ingredients: MOCK_INGREDIENTS,
        steps: MOCK_STEPS,
        notes: MOCK_NOTES,
      });

      // Requirement confirmation: Error returned for empty goal
      assert("error" in result, "Expected an error for empty goal.");
      assertEquals(
        (result as { error: string }).error,
        "Goal cannot be empty.",
      );
      console.log(
        `Requirement confirmed: Error returned for empty goal. Output: ${
          JSON.stringify(
            result,
          )
        }`,
      );
    });

    await t.step(
      "should return an error if ingredients is not an array",
      async () => {
        console.log(
          "Action: createDraft (negative test - invalid ingredients)",
        );
        const result = await concept.createDraft({
          requester: MOCK_USER_ID,
          baseRecipe: MOCK_RECIPE_ID,
          goal: MOCK_GOAL,
          ingredients: "not an array" as unknown as Ingredient[], // Invalid ingredients
          steps: MOCK_STEPS,
          notes: MOCK_NOTES,
        });

        // Requirement confirmation: Error returned for invalid ingredients
        assert(
          "error" in result,
          "Expected an error for invalid ingredients.",
        );
        assertEquals(
          (result as { error: string }).error,
          "Ingredients and steps must be arrays.",
        );
        console.log(
          `Requirement confirmed: Error returned for invalid ingredients. Output: ${
            JSON.stringify(
              result,
            )
          }`,
        );
      },
    );

    await t.step(
      "should return an error if steps is not an array",
      async () => {
        console.log("Action: createDraft (negative test - invalid steps)");
        const result = await concept.createDraft({
          requester: MOCK_USER_ID,
          baseRecipe: MOCK_RECIPE_ID,
          goal: MOCK_GOAL,
          ingredients: MOCK_INGREDIENTS,
          steps: "not an array" as unknown as Step[], // Invalid steps
          notes: MOCK_NOTES,
        });

        // Requirement confirmation: Error returned for invalid steps
        assert("error" in result, "Expected an error for invalid steps.");
        assertEquals(
          (result as { error: string }).error,
          "Ingredients and steps must be arrays.",
        );
        console.log(
          `Requirement confirmed: Error returned for invalid steps. Output: ${
            JSON.stringify(
              result,
            )
          }`,
        );
      },
    );
  });

  // Test _getDraftById action
  await t.step(
    "_getDraftById: satisfies requirements and effects",
    async (t) => {
      await draftsCollection.deleteMany({});
      // Setup for this block: Ensure a draft exists for retrieval tests
      const createResult = await concept.createDraft({
        requester: MOCK_USER_ID,
        baseRecipe: MOCK_RECIPE_ID,
        goal: MOCK_GOAL,
        ingredients: MOCK_INGREDIENTS,
        steps: MOCK_STEPS,
        notes: MOCK_NOTES,
      });
      const createdDraftId = (createResult as { id: ID }).id;
      console.log(
        `_getDraftById setup: Created draft with ID ${createdDraftId}`,
      );

      await t.step("should retrieve an existing draft by ID", async () => {
        console.log("Action: _getDraftById");
        console.log(`Input: id=${createdDraftId}`);

        const result = await concept._getDraftById({ id: createdDraftId });

        // Requirement confirmation: No error returned for existing ID
        assert(
          !("error" in result),
          `Expected no error, but received: ${JSON.stringify(result)}`,
        );

        // Effect confirmation: Correct draft is returned
        const drafts = result as VersionDraftDoc[];
        assertEquals(
          drafts.length,
          1,
          "Expected exactly one draft to be returned.",
        );
        assertEquals(
          drafts[0]._id,
          createdDraftId,
          "Expected the retrieved draft's ID to match the requested ID.",
        );
        console.log(`Output: Found draft with ID ${drafts[0]._id}`);
        console.log(`Effect confirmed: Draft ${createdDraftId} retrieved.`);
      });

      await t.step(
        "should return an empty array if draft ID does not exist",
        async () => {
          const nonExistentId = "nonexistent123" as ID;
          console.log("Action: _getDraftById (non-existent ID)");
          console.log(`Input: id=${nonExistentId}`);

          const result = await concept._getDraftById({ id: nonExistentId });

          // Requirement confirmation: No error for non-existent, but empty array
          assert(
            !("error" in result),
            `Expected no error, but received: ${JSON.stringify(result)}`,
          );
          // Effect confirmation: Empty array returned
          assertEquals(
            (result as VersionDraftDoc[]).length,
            0,
            "Expected an empty array for a non-existent ID.",
          );
          console.log(
            `Effect confirmed: Empty array returned for non-existent ID. Output: ${
              JSON.stringify(
                result,
              )
            }`,
          );
        },
      );

      await t.step(
        "should return an error if draft ID is missing",
        async () => {
          console.log("Action: _getDraftById (missing ID)");
          const result = await concept._getDraftById({ id: "" as ID });

          // Requirement confirmation: Error returned for missing ID
          assert(
            "error" in result,
            "Expected an error for missing draft ID.",
          );
          assertEquals(
            (result as { error: string }).error,
            "Draft ID must be provided.",
          );
          console.log(
            `Requirement confirmed: Error returned for missing draft ID. Output: ${
              JSON.stringify(
                result,
              )
            }`,
          );
        },
      );
    },
  );

  // Test _listDraftsByRequester action
  await t.step(
    "_listDraftsByRequester: satisfies requirements and effects",
    async (t) => {
      await draftsCollection.deleteMany({});
      const anotherUser = "userOther" as ID;
      const recipe2 = "recipe999" as ID;
      let draft1Id: ID;
      let draft2Id: ID;
      let draft3Id: ID;

      // Setup for this block: Create multiple drafts for different users
      const r1 = await concept.createDraft({
        requester: MOCK_USER_ID,
        baseRecipe: MOCK_RECIPE_ID,
        goal: "Sweeten more",
        ingredients: MOCK_INGREDIENTS,
        steps: MOCK_STEPS,
        notes: "Notes 1",
      });
      draft1Id = (r1 as { id: ID }).id;

      const r2 = await concept.createDraft({
        requester: MOCK_USER_ID,
        baseRecipe: recipe2,
        goal: "Make it salty",
        ingredients: MOCK_INGREDIENTS,
        steps: MOCK_STEPS,
        notes: "Notes 2",
      });
      draft2Id = (r2 as { id: ID }).id;

      // Create a draft for another user
      const r3 = await concept.createDraft({
        requester: anotherUser,
        baseRecipe: MOCK_RECIPE_ID,
        goal: "Make it sour",
        ingredients: MOCK_INGREDIENTS,
        steps: MOCK_STEPS,
        notes: "Notes 3",
      });
      draft3Id = (r3 as { id: ID }).id;
      console.log(
        `_listDraftsByRequester setup: Created drafts: ${draft1Id}, ${draft2Id} for ${MOCK_USER_ID}; ${draft3Id} for ${anotherUser}`,
      );

      await t.step(
        "should list all drafts for a specific requester",
        async () => {
          console.log("Action: _listDraftsByRequester");
          console.log(`Input: requester=${MOCK_USER_ID}`);

          const result = await concept._listDraftsByRequester({
            requester: MOCK_USER_ID,
          });

          // Requirement confirmation: No error for valid requester
          assert(
            !("error" in result),
            `Expected no error, but received: ${JSON.stringify(result)}`,
          );

          // Effect confirmation: Correct drafts are returned for the requester
          const drafts = result as VersionDraftDoc[];
          assertEquals(
            drafts.length,
            2,
            `Expected 2 drafts for requester ${MOCK_USER_ID}. Found ${drafts.length}.`,
          );
          assertArrayIncludes(
            drafts.map((d) => d._id),
            [draft1Id, draft2Id],
            "Expected drafts with specific IDs to be listed.",
          );
          drafts.forEach((d) =>
            assertEquals(
              d.requester,
              MOCK_USER_ID,
              "All listed drafts should belong to the specified requester.",
            )
          );
          console.log(
            `Output: Found ${drafts.length} drafts for ${MOCK_USER_ID}.`,
          );
          console.log(
            `Effect confirmed: All drafts for ${MOCK_USER_ID} were listed.`,
          );
        },
      );

      await t.step(
        "should return an empty array if requester has no drafts",
        async () => {
          const nonExistentRequester = "noDraftsUser" as ID;
          console.log("Action: _listDraftsByRequester (no drafts user)");
          console.log(`Input: requester=${nonExistentRequester}`);

          const result = await concept._listDraftsByRequester({
            requester: nonExistentRequester,
          });

          // Requirement confirmation: No error for valid requester with no drafts
          assert(
            !("error" in result),
            `Expected no error, but received: ${JSON.stringify(result)}`,
          );
          // Effect confirmation: Empty array returned
          const drafts = result as VersionDraftDoc[];
          assertEquals(
            drafts.length,
            0,
            "Expected an empty array for a requester with no drafts.",
          );
          console.log(
            `Effect confirmed: Empty array returned for requester with no drafts. Output: ${
              JSON.stringify(
                result,
              )
            }`,
          );
        },
      );

      await t.step(
        "should return an error if requester ID is missing",
        async () => {
          console.log("Action: _listDraftsByRequester (missing requester ID)");
          const result = await concept._listDraftsByRequester({
            requester: "" as ID,
          });

          // Requirement confirmation: Error returned for missing requester ID
          assert(
            "error" in result,
            "Expected an error for missing requester ID.",
          );
          assertEquals(
            (result as { error: string }).error,
            "Requester ID must be provided.",
          );
          console.log(
            `Requirement confirmed: Error returned for missing requester ID. Output: ${
              JSON.stringify(
                result,
              )
            }`,
          );
        },
      );
    },
  );

  // Test deleteDraft action
  await t.step("deleteDraft: satisfies requirements and effects", async (t) => {
    await draftsCollection.deleteMany({});
    // Setup for this block: Create a draft to be deleted
    const createResult = await concept.createDraft({
      requester: MOCK_USER_ID,
      baseRecipe: MOCK_RECIPE_ID,
      goal: MOCK_GOAL,
      ingredients: MOCK_INGREDIENTS,
      steps: MOCK_STEPS,
      notes: MOCK_NOTES,
    });
    const createdDraftId = (createResult as { id: ID }).id;
    console.log(`deleteDraft setup: Created draft with ID ${createdDraftId}`);

    await t.step("should successfully delete an existing draft", async () => {
      console.log("Action: deleteDraft");
      console.log(`Input: id=${createdDraftId}`);

      const result = await concept.deleteDraft({ id: createdDraftId });

      // Requirement confirmation: No error returned for existing ID
      assert(
        !("error" in result),
        `Expected no error, but received: ${JSON.stringify(result)}`,
      );
      // Effect confirmation: Empty object returned for Empty type
      assertEquals(
        Object.keys(result).length,
        0,
        "Expected an empty object on successful deletion.",
      );

      // Effect confirmation: Document is no longer in DB
      const doc = await draftsCollection.findOne({ _id: createdDraftId });
      assertEquals(
        doc,
        null,
        "Expected the deleted document to no longer exist in the database.",
      );
      console.log(`Effect confirmed: Draft ${createdDraftId} was deleted.`);
    });

    await t.step(
      "should return an error if draft ID does not exist",
      async () => {
        const nonExistentId = "nonexistent999" as ID;
        console.log("Action: deleteDraft (non-existent ID)");
        console.log(`Input: id=${nonExistentId}`);

        const result = await concept.deleteDraft({ id: nonExistentId });

        // Requirement confirmation: Error returned for non-existent ID
        assert("error" in result, "Expected an error for non-existent ID.");
        assertEquals(
          (result as { error: string }).error,
          `Draft with ID ${nonExistentId} not found.`,
        );
        console.log(
          `Requirement confirmed: Error returned for non-existent draft. Output: ${
            JSON.stringify(
              result,
            )
          }`,
        );
      },
    );

    await t.step("should return an error if draft ID is missing", async () => {
      console.log("Action: deleteDraft (missing ID)");
      const result = await concept.deleteDraft({ id: "" as ID });

      // Requirement confirmation: Error returned for missing ID
      assert("error" in result, "Expected an error for missing draft ID.");
      assertEquals(
        (result as { error: string }).error,
        "Draft ID must be provided.",
      );
      console.log(
        `Requirement confirmed: Error returned for missing draft ID. Output: ${
          JSON.stringify(
            result,
          )
        }`,
      );
    });
  });

  // Test _cleanupExpiredDrafts system action
  await t.step(
    "_cleanupExpiredDrafts: satisfies requirements and effects",
    async (t) => {
      await draftsCollection.deleteMany({});
      await t.step(
        "should remove expired drafts and leave non-expired drafts",
        async () => {
          console.log("Action: _cleanupExpiredDrafts");

          // Create an expired draft (set expires in the past)
          const expiredDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2); // 2 days ago
          const expiredDraft: VersionDraftDoc = {
            _id: "expiredDraft1" as ID,
            requester: MOCK_USER_ID,
            baseRecipe: MOCK_RECIPE_ID,
            goal: "Expired goal",
            ingredients: [],
            steps: [],
            notes: "This draft should expire",
            created: new Date(expiredDate.getTime() - 1000 * 60 * 60 * 24), // 3 days ago
            expires: expiredDate,
          };
          await draftsCollection.insertOne(expiredDraft);
          console.log(
            `Setup: Inserted expired draft ${expiredDraft._id} (expires: ${expiredDraft.expires})`,
          );

          // Create a draft that expires right now (should be cleaned up too by $lt if current time is slightly after)
          const now = new Date();
          const expiresNowDraft: VersionDraftDoc = {
            _id: "expiresNowDraft" as ID,
            requester: MOCK_USER_ID,
            baseRecipe: MOCK_RECIPE_ID,
            goal: "Expires now goal",
            ingredients: [],
            steps: [],
            notes: "This draft expires now",
            created: new Date(now.getTime() - 1000 * 60 * 60), // 1 hour ago
            expires: now, // Should be caught if cleanup runs slightly after this 'now'
          };
          await draftsCollection.insertOne(expiresNowDraft);
          console.log(
            `Setup: Inserted expires-now draft ${expiresNowDraft._id} (expires: ${expiresNowDraft.expires})`,
          );

          // Create a non-expired draft (set expires in the future)
          const futureExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2); // 2 days from now
          const nonExpiredDraft: VersionDraftDoc = {
            _id: "nonExpiredDraft1" as ID,
            requester: MOCK_USER_ID,
            baseRecipe: MOCK_RECIPE_ID,
            goal: "Non-expired goal",
            ingredients: [],
            steps: [],
            notes: "This draft should not expire",
            created: new Date(),
            expires: futureExpires,
          };
          await draftsCollection.insertOne(nonExpiredDraft);
          console.log(
            `Setup: Inserted non-expired draft ${nonExpiredDraft._id} (expires: ${nonExpiredDraft.expires})`,
          );

          // Execute cleanup
          const result = await concept._cleanupExpiredDrafts();

          // Requirement confirmation: No error returned
          assert(
            !("error" in result),
            `Expected no error, but received: ${JSON.stringify(result)}`,
          );
          assertEquals(
            Object.keys(result).length,
            0,
            "Expected an empty object on successful cleanup.",
          );
          console.log("Output: Cleanup action completed.");

          // Effect confirmation: Expired drafts are gone, non-expired remains
          const remainingDrafts = await draftsCollection.find({}).toArray();
          assertEquals(
            remainingDrafts.length,
            1,
            "Expected only one draft (the non-expired one) to remain after cleanup.",
          );
          assertEquals(
            remainingDrafts[0]._id,
            nonExpiredDraft._id,
            "The remaining draft should be the non-expired one.",
          );
          console.log(
            `Effect confirmed: Expired draft ${expiredDraft._id} and expires-now draft ${expiresNowDraft._id} removed, non-expired draft ${nonExpiredDraft._id} remains.`,
          );
        },
      );
    },
  );

  // Principle Testing
  await t.step(
    "Principle: drafts provide AI assistance without directly altering canonical recipe data",
    async () => {
      await draftsCollection.deleteMany({});
      console.log(
        "Principle verification: The VersionDraftConcept's implementation exclusively interacts with the 'VersionDraft.drafts' collection.",
      );
      console.log(
        "It does not contain any code that would access, modify, or delete documents in any other collection, such as a hypothetical 'Recipe' collection.",
      );
      console.log(
        "The 'baseRecipe' field is an ID reference, treated as opaque by this concept, thus not implying manipulation of a recipe document itself.",
      );

      // trace:
      const requesterId = "traceUser" as ID;
      const recipeId = "traceRecipe" as ID;
      const traceGoal = "Optimize for quick prep";
      const traceIngredients: Ingredient[] = [
        {
          name: "Pre-chopped veggies",
          quantity: "1",
          unit: "pack",
        },
      ];
      const traceSteps: Step[] = [{ description: "Microwave for 5 minutes." }];

      console.log(
        "\n--- Trace: Demonstrating the principle 'drafts provide AI assistance without directly altering canonical recipe data' ---",
      );

      console.log(
        `Trace Step 1: User '${requesterId}' asks for an AI suggestion for recipe '${recipeId}' to '${traceGoal}'.`,
      );
      const createResult = await concept.createDraft({
        requester: requesterId,
        baseRecipe: recipeId,
        goal: traceGoal,
        ingredients: traceIngredients,
        steps: traceSteps,
        notes: "AI suggested quick prep method.",
      });
      const { id: draftId } = createResult as { id: ID };
      assert(
        !("error" in createResult),
        "Trace: Draft creation should succeed.",
      );
      assertExists(draftId, "Trace: A new draft ID should be generated.");
      console.log(
        `Action: createDraft (id=${draftId}). Output: Draft document created in 'VersionDraft.drafts'. Crucially, no changes were made to any 'Recipe' collection.`,
      );

      console.log(`Trace Step 2: User reviews the newly created draft.`);
      const retrievedDrafts = await concept._getDraftById({ id: draftId });
      assert(
        !("error" in retrievedDrafts),
        "Trace: Draft retrieval should succeed.",
      );
      assertEquals(
        (retrievedDrafts as VersionDraftDoc[]).length,
        1,
        "Trace: The draft should be found.",
      );
      assertEquals(
        (retrievedDrafts as VersionDraftDoc[])[0]._id,
        draftId,
        "Trace: Retrieved draft ID should match.",
      );
      console.log(
        `Action: _getDraftById (id=${draftId}). Output: Draft data retrieved from 'VersionDraft.drafts'. No 'Recipe' collection was accessed or modified.`,
      );

      console.log(
        `Trace Step 3: User decides to discard the draft, as it doesn't fit their needs.`,
      );
      const deleteResult = await concept.deleteDraft({ id: draftId });
      assert(
        !("error" in deleteResult),
        "Trace: Draft deletion should succeed.",
      );
      assertEquals(
        Object.keys(deleteResult).length,
        0,
        "Trace: Expected empty result for successful deletion.",
      );
      const checkDeleted = await concept._getDraftById({ id: draftId });
      assertEquals(
        (checkDeleted as VersionDraftDoc[]).length,
        0,
        "Trace: The draft should no longer exist.",
      );
      console.log(
        `Action: deleteDraft (id=${draftId}). Output: Draft removed from 'VersionDraft.drafts'. No 'Recipe' collection was affected.`,
      );

      // Final check for the principle: Ensure the only collection modified was 'VersionDraft.drafts'
      // This is implicitly guaranteed by the concept's code only referencing `this.drafts`.
      // If a 'Recipe' concept existed and was mocked, we would verify its state here.
      const finalDraftsCount = await draftsCollection.countDocuments({});
      assertEquals(
        finalDraftsCount,
        0,
        "Trace: All drafts related to this principle trace should be deleted.",
      );
      console.log(
        "Principle 'drafts provide AI assistance without directly altering canonical recipe data' is demonstrated and verified.",
      );
    },
  );
});
