import {
  assertEquals,
  assertNotEquals,
  assertObjectMatch,
} from "jsr:@std/assert";
import { freshID, testDb } from "@utils/database.ts";
import type { Empty, ID } from "@utils/types.ts";
import RecipeConcept from "./RecipeConcept.ts";

Deno.test("RecipeConcept", async (t) => {
  const [db, client] = await testDb();
  const recipeConcept = new RecipeConcept(db);

  const testUser1 = "user:Alice" as ID;
  const testUser2 = "user:Bob" as ID;

  // Helper for creating consistent ingredient and step data for tests
  const createTestIngredients = () => [
    { name: "Flour", quantity: "2 cups", unit: "cup", notes: "all-purpose" },
    { name: "Sugar", quantity: "1 cup", unit: "cup", notes: "granulated" },
  ];
  const createTestSteps = () => [
    { description: "Mix dry ingredients thoroughly.", duration: 2 },
    { description: "Combine with wet ingredients until smooth.", duration: 5 },
  ];

  await t.step(
    "Principle: A recipe is authored once and remains the stable source.",
    async () => {
      console.log("--- Trace: Testing the Recipe concept's principle ---");
      console.log(
        "Principle: A recipe is authored once and remains the stable source for annotations and versions.",
      );

      // Action 1: Author a recipe (createRecipe)
      const createResult = await recipeConcept.createRecipe({
        owner: testUser1,
        title: "Principle Brownies",
        ingredients: createTestIngredients(),
        steps: createTestSteps(),
        description:
          "A foundational brownie recipe demonstrating concept stability.",
      });
      assertEquals(
        typeof (createResult as { recipe: ID }).recipe,
        "string",
        "Requires: Valid owner, title, ingredients, steps. Effects: Returns recipe ID.",
      );
      if ("error" in createResult) {
        throw new Error(`Failed to create recipe: ${createResult.error}`);
      }
      const recipeId = (createResult as { recipe: ID }).recipe;
      console.log(
        `Action: createRecipe(owner=${testUser1}, title="Principle Brownies", ...) -> recipe ID: ${recipeId}`,
      );

      // Verification 1: Confirm initial state using query
      const initialRecipe = await recipeConcept._getRecipeById({
        recipe: recipeId,
      });
      if ("error" in initialRecipe) {
        throw new Error(`Failed to get recipe: ${initialRecipe.error}`);
      }
      assertEquals(
        initialRecipe.recipe.length,
        1,
        "Effects: Recipe should exist and be retrievable.",
      );
      assertEquals(
        initialRecipe.recipe[0].title,
        "Principle Brownies",
        "Effects: Recipe title should match.",
      );
      assertEquals(
        initialRecipe.recipe[0].owner,
        testUser1,
        "Effects: Recipe owner should be correct.",
      );
      assertEquals(
        initialRecipe.recipe[0].ingredients.length,
        2,
        "Effects: Recipe should have 2 ingredients.",
      );
      assertEquals(
        initialRecipe.recipe[0].tags.length,
        0,
        "Effects: Recipe should start with no tags.",
      );
      const initialCreated = initialRecipe.recipe[0].created;
      const initialUpdated = initialRecipe.recipe[0].updated;
      assertEquals(
        initialCreated?.getTime(),
        initialUpdated?.getTime(),
        "Effects: Created and updated timestamps should initially be the same.",
      );
      console.log(
        `Query: _getRecipeById(${recipeId}) -> Verified initial state details.`,
      );

      // Action 2: Update the recipe (updateRecipeDetails)
      // This demonstrates that the *same* recipe (identified by its ID) can evolve,
      // thereby remaining a stable *source* that future versions/annotations can link to.
      const newIngredientsForUpdate = [
        { name: "Dark Chocolate", quantity: "1 cup", unit: "cup" },
        { name: "Eggs", quantity: "2 large" },
      ];
      const newStepsForUpdate = [{ description: "Melt chocolate and butter." }];
      const updateResult = await recipeConcept.updateRecipeDetails({
        owner: testUser1,
        recipe: recipeId,
        newTitle: "Principle Brownies (Evolved)",
        newDescription: "Updated for richer flavor.",
        newIngredients: newIngredientsForUpdate,
        newSteps: newStepsForUpdate,
      });
      assertObjectMatch(
        updateResult as Empty,
        {},
        "Requires: Owner matches. Effects: Should successfully update details.",
      );
      console.log(
        `Action: updateRecipeDetails(owner=${testUser1}, recipe=${recipeId}, newTitle, newDescription, newIngredients, newSteps)`,
      );

      // Verification 2: Confirm updated state
      const updatedRecipe = await recipeConcept._getRecipeById({
        recipe: recipeId,
      });
      if ("error" in updatedRecipe) {
        throw new Error(`Failed to get recipe: ${updatedRecipe.error}`);
      }
      assertEquals(
        updatedRecipe.recipe.length,
        1,
        "Effects: Recipe should still exist.",
      );
      assertEquals(
        updatedRecipe.recipe[0].title,
        "Principle Brownies (Evolved)",
        "Effects: Title should be updated.",
      );
      assertEquals(
        updatedRecipe.recipe[0].description,
        "Updated for richer flavor.",
        "Effects: Description should be updated.",
      );
      assertEquals(
        updatedRecipe.recipe[0].ingredients.length,
        2,
        "Effects: Ingredients count should match new list.",
      );
      assertEquals(
        updatedRecipe.recipe[0].ingredients[0].name,
        "Dark Chocolate",
        "Effects: New ingredient should be present.",
      );
      assertEquals(
        updatedRecipe.recipe[0].steps.length,
        1,
        "Effects: Steps count should match new list.",
      );
      assertEquals(
        updatedRecipe.recipe[0].steps[0].description,
        "Melt chocolate and butter.",
        "Effects: New step should be present.",
      );
      assertNotEquals(
        updatedRecipe.recipe[0].created.getTime(),
        updatedRecipe.recipe[0].updated.getTime(),
        "Effects: Updated timestamp should be different from created timestamp.",
      );
      console.log(
        `Query: _getRecipeById(${recipeId}) -> Verified updated state details.`,
      );
      console.log(
        "Conclusion: The recipe's identity (ID) remains constant while its content can be modified by the owner, fulfilling its role as a stable, evolving source.",
      );
    },
  );

  await t.step("createRecipe action tests", async () => {
    console.log("\n--- Testing createRecipe action ---");

    // Test 1: Successful creation
    const result1 = await recipeConcept.createRecipe({
      owner: testUser1,
      title: "Chocolate Chip Cookies",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
      description: "Classic chocolate chip cookies.",
    });
    assertEquals(
      typeof (result1 as { recipe: ID }).recipe,
      "string",
      "Effects: Should return a recipe ID for valid input.",
    );
    if ("error" in result1) {
      throw new Error(`Failed to create recipe: ${result1.error}`);
    }
    assertNotEquals(
      result1.recipe,
      undefined,
      "Effects: Recipe ID should not be undefined.",
    );
    console.log(
      `Action: createRecipe(owner=${testUser1}, title="Chocolate Chip Cookies", ...) -> recipe ID: ${result1.recipe}`,
    );

    // Verify effects
    const createdRecipe = await recipeConcept._getRecipeById({
      recipe: result1.recipe,
    });
    if ("error" in createdRecipe) {
      throw new Error(`Failed to get recipe: ${createdRecipe.error}`);
    }
    assertEquals(
      createdRecipe.recipe[0].title,
      "Chocolate Chip Cookies",
      "Effects: Created recipe should have correct title.",
    );
    assertEquals(
      createdRecipe.recipe[0].owner,
      testUser1,
      "Effects: Created recipe should have correct owner.",
    );
    assertEquals(
      createdRecipe.recipe[0].tags.length,
      0,
      "Effects: Created recipe should have no tags initially.",
    );
    assertEquals(
      createdRecipe.recipe[0].ingredients.length,
      2,
      "Effects: Created recipe should have ingredients.",
    );
    console.log(
      `Verification: _getRecipeById(${result1.recipe}) confirmed recipe details and empty tags.`,
    );

    // Test 2: Missing owner (empty string)
    const result2 = await recipeConcept.createRecipe({
      owner: "" as ID,
      title: "Invalid Recipe",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
    });
    assertObjectMatch(
      result2,
      { error: "Owner ID must be provided." },
      "Requires: Owner ID must be provided. Effects: Should return error.",
    );
    console.log(
      `Action: createRecipe(owner=empty, title="Invalid Recipe") -> Error: ${
        "error" in result2 ? result2.error : "Unknown error"
      }`,
    );

    // Test 3: Empty title
    const result3 = await recipeConcept.createRecipe({
      owner: testUser1,
      title: "",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
    });
    assertObjectMatch(
      result3,
      { error: "Recipe title cannot be empty." },
      "Requires: Title not empty. Effects: Should return error.",
    );
    console.log(
      `Action: createRecipe(owner=${testUser1}, title=empty, ingredients, steps) -> Error: ${
        "error" in result3 ? result3.error : "Unknown error"
      }`,
    );

    // Test 4: Missing ingredients (empty array)
    const result4 = await recipeConcept.createRecipe({
      owner: testUser1,
      title: "No Ingredients",
      ingredients: [],
      steps: createTestSteps(),
    });
    assertObjectMatch(
      result4,
      { error: "Recipe must have at least one ingredient." },
      "Requires: Ingredients well-formed. Effects: Should return error.",
    );
    console.log(
      `Action: createRecipe(owner=${testUser1}, title="No Ingredients", ingredients=[], steps) -> Error: ${
        "error" in result4 ? result4.error : "Unknown error"
      }`,
    );

    // Test 5: Missing steps (empty array)
    const result5 = await recipeConcept.createRecipe({
      owner: testUser1,
      title: "No Steps",
      ingredients: createTestIngredients(),
      steps: [],
    });
    assertObjectMatch(
      result5,
      { error: "Recipe must have at least one step." },
      "Requires: Steps well-formed. Effects: Should return error.",
    );
    console.log(
      `Action: createRecipe(owner=${testUser1}, title="No Steps", ingredients, steps=[]) -> Error: ${
        "error" in result5 ? result5.error : "Unknown error"
      }`,
    );

    // Test 6: Malformed ingredient (missing required field 'quantity')
    const result6 = await recipeConcept.createRecipe({
      owner: testUser1,
      title: "Malformed Ingredient",
      ingredients: [{ name: "Salt", quantity: "" }], // quantity is empty
      steps: createTestSteps(),
    });
    assertObjectMatch(
      result6,
      { error: "Each ingredient must have a name and quantity." },
      "Requires: Ingredients well-formed. Effects: Should return error for malformed ingredient.",
    );
    console.log(
      `Action: createRecipe(owner=${testUser1}, title="Malformed Ingredient", ingredients=[{name:'Salt', quantity:''}], steps) -> Error: ${
        "error" in result6 ? result6.error : "Unknown error"
      }`,
    );
  });

  await t.step("addTag action tests", async () => {
    console.log("\n--- Testing addTag action ---");
    const createResult = await recipeConcept.createRecipe({
      owner: testUser1,
      title: "Test Cake",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
    });
    if ("error" in createResult) {
      throw new Error(`Failed to create recipe: ${createResult.error}`);
    }
    const recipeId = createResult.recipe;
    console.log(`Setup: Created recipe ${recipeId} for tagging tests.`);

    // Test 1: Add a new tag successfully
    const addTagResult1 = await recipeConcept.addTag({
      recipe: recipeId,
      tag: "dessert",
    });
    assertObjectMatch(
      addTagResult1 as Empty,
      {},
      "Effects: Should successfully add a new tag.",
    );
    console.log(`Action: addTag(recipe=${recipeId}, tag="dessert")`);

    // Verify effects
    const recipeWithTag1 = await recipeConcept._getRecipeById({
      recipe: recipeId,
    });
    if ("error" in recipeWithTag1) {
      throw new Error(`Failed to get recipe: ${recipeWithTag1.error}`);
    }
    assertEquals(
      recipeWithTag1.recipe[0].tags.includes("dessert"),
      true,
      "Effects: Recipe should now contain 'dessert' tag.",
    );
    assertEquals(
      recipeWithTag1.recipe[0].tags.length,
      1,
      "Effects: Recipe should have one tag.",
    );
    console.log(
      `Verification: _getRecipeById(${recipeId}) confirmed 'dessert' tag added.`,
    );

    // Test 2: Add another tag
    const addTagResult2 = await recipeConcept.addTag({
      recipe: recipeId,
      tag: "easy",
    });
    assertObjectMatch(
      addTagResult2 as Empty,
      {},
      "Effects: Should successfully add another tag.",
    );
    console.log(`Action: addTag(recipe=${recipeId}, tag="easy")`);

    // Verify effects
    const recipeWithTag2 = await recipeConcept._getRecipeById({
      recipe: recipeId,
    });
    if ("error" in recipeWithTag2) {
      throw new Error(`Failed to get recipe: ${recipeWithTag2.error}`);
    }
    assertEquals(
      recipeWithTag2.recipe[0].tags.includes("easy"),
      true,
      "Effects: Recipe should now contain 'easy' tag.",
    );
    assertEquals(
      recipeWithTag2.recipe[0].tags.length,
      2,
      "Effects: Recipe should have two tags.",
    );
    console.log(
      `Verification: _getRecipeById(${recipeId}) confirmed 'easy' tag added.`,
    );

    // Test 3: Add an existing tag (should be idempotent, no change in count, no error)
    const addTagResult3 = await recipeConcept.addTag({
      recipe: recipeId,
      tag: "dessert",
    });
    assertObjectMatch(
      addTagResult3 as Empty,
      {},
      "Effects: Adding an existing tag should succeed (idempotent).",
    );
    console.log(`Action: addTag(recipe=${recipeId}, tag="dessert") (again)`);
    const recipeWithTag3 = await recipeConcept._getRecipeById({
      recipe: recipeId,
    });
    if ("error" in recipeWithTag3) {
      throw new Error(`Failed to get recipe: ${recipeWithTag3.error}`);
    }
    assertEquals(
      recipeWithTag3.recipe[0].tags.length,
      2,
      "Effects: Tag count should remain 2 after adding existing tag.",
    );
    console.log(
      `Verification: _getRecipeById(${recipeId}) confirmed tag count remains 2.`,
    );

    // Test 4: Add tag to non-existent recipe
    const nonExistentRecipeId = freshID();
    const addTagResult4 = await recipeConcept.addTag({
      recipe: nonExistentRecipeId,
      tag: "nonexistent",
    });
    assertObjectMatch(
      addTagResult4,
      { error: "Recipe not found." },
      "Requires: Recipe exists. Effects: Should return error.",
    );
    console.log(
      `Action: addTag(recipe=nonExistentRecipe, tag="nonexistent") -> Error: ${addTagResult4.error}`,
    );

    // Test 5: Add empty tag
    const addTagResult5 = await recipeConcept.addTag({
      recipe: recipeId,
      tag: "",
    });
    assertObjectMatch(
      addTagResult5,
      { error: "Tag cannot be empty." },
      "Effects: Should return error for empty tag.",
    );
    console.log(
      `Action: addTag(recipe=${recipeId}, tag=empty) -> Error: ${addTagResult5.error}`,
    );
  });

  await t.step("removeTag action tests", async () => {
    console.log("\n--- Testing removeTag action ---");
    const createResult = await recipeConcept.createRecipe({
      owner: testUser1,
      title: "Test Salad",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
    });
    if ("error" in createResult) {
      throw new Error(`Failed to create recipe: ${createResult.error}`);
    }
    const recipeId = createResult.recipe;
    await recipeConcept.addTag({ recipe: recipeId, tag: "healthy" });
    await recipeConcept.addTag({ recipe: recipeId, tag: "lunch" });
    console.log(
      `Setup: Created recipe ${recipeId} with tags 'healthy', 'lunch'.`,
    );

    // Test 1: Remove an existing tag successfully
    const removeTagResult1 = await recipeConcept.removeTag({
      recipe: recipeId,
      tag: "healthy",
    });
    assertObjectMatch(
      removeTagResult1 as Empty,
      {},
      "Effects: Should successfully remove an existing tag.",
    );
    console.log(`Action: removeTag(recipe=${recipeId}, tag="healthy")`);

    // Verify effects
    const recipeWithoutTag1 = await recipeConcept._getRecipeById({
      recipe: recipeId,
    });
    if ("error" in recipeWithoutTag1) {
      throw new Error(`Failed to get recipe: ${recipeWithoutTag1.error}`);
    }
    assertEquals(
      recipeWithoutTag1.recipe[0].tags.includes("healthy"),
      false,
      "Effects: Recipe should no longer contain 'healthy' tag.",
    );
    assertEquals(
      recipeWithoutTag1.recipe[0].tags.length,
      1,
      "Effects: Recipe should have one tag left.",
    );
    console.log(
      `Verification: _getRecipeById(${recipeId}) confirmed 'healthy' tag removed.`,
    );

    // Test 2: Attempt to remove a non-existent tag
    const removeTagResult2 = await recipeConcept.removeTag({
      recipe: recipeId,
      tag: "dinner",
    });
    assertObjectMatch(
      removeTagResult2,
      { error: "Recipe not found or tag is not present on recipe." },
      "Requires: Tag exists. Effects: Should return error.",
    );
    console.log(
      `Action: removeTag(recipe=${recipeId}, tag="dinner") -> Error: ${removeTagResult2.error}`,
    );
    const recipeWithoutTag2 = await recipeConcept._getRecipeById({
      recipe: recipeId,
    });
    if ("error" in recipeWithoutTag2) {
      throw new Error(`Failed to get recipe: ${recipeWithoutTag2.error}`);
    }
    assertEquals(
      recipeWithoutTag2.recipe[0].tags.length,
      1,
      "Effects: Tag count should remain 1 after attempting to remove non-existent tag.",
    );
    console.log(
      `Verification: _getRecipeById(${recipeId}) confirmed tag count still 1.`,
    );

    // Test 3: Remove tag from non-existent recipe
    const nonExistentRecipeId = freshID();
    const removeTagResult3 = await recipeConcept.removeTag({
      recipe: nonExistentRecipeId,
      tag: "any",
    });
    assertObjectMatch(
      removeTagResult3,
      { error: "Recipe not found or tag is not present on recipe." },
      "Requires: Recipe exists. Effects: Should return error.",
    );
    console.log(
      `Action: removeTag(recipe=nonExistentRecipe, tag="any") -> Error: ${removeTagResult3.error}`,
    );

    // Test 4: Remove empty tag
    const removeTagResult4 = await recipeConcept.removeTag({
      recipe: recipeId,
      tag: "",
    });
    assertObjectMatch(
      removeTagResult4,
      { error: "Tag cannot be empty." },
      "Effects: Should return error for empty tag.",
    );
    console.log(
      `Action: removeTag(recipe=${recipeId}, tag=empty) -> Error: ${removeTagResult4.error}`,
    );
  });

  await t.step("deleteRecipe action tests", async () => {
    console.log("\n--- Testing deleteRecipe action ---");
    const createResult1 = await recipeConcept.createRecipe({
      owner: testUser1,
      title: "Recipe to Delete 1",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
    });
    if ("error" in createResult1) {
      throw new Error(`Failed to create recipe: ${createResult1.error}`);
    }
    const recipeId1 = createResult1.recipe;
    const createResult2 = await recipeConcept.createRecipe({
      owner: testUser2,
      title: "Recipe to Delete 2",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
    });
    if ("error" in createResult2) {
      throw new Error(`Failed to create recipe: ${createResult2.error}`);
    }
    const recipeId2 = createResult2.recipe;
    console.log(
      `Setup: Created recipe ${recipeId1} (owner: ${testUser1}) and ${recipeId2} (owner: ${testUser2}).`,
    );

    // Test 1: Delete by owner (successful)
    const deleteResult1 = await recipeConcept.deleteRecipe({
      requester: testUser1,
      recipe: recipeId1,
    });
    assertObjectMatch(
      deleteResult1 as Empty,
      {},
      "Effects: Should successfully delete recipe by owner.",
    );
    console.log(
      `Action: deleteRecipe(requester=${testUser1}, recipe=${recipeId1})`,
    );

    // Verify effects
    const deletedRecipe1 = await recipeConcept._getRecipeById({
      recipe: recipeId1,
    });
    assertEquals(
      "error" in deletedRecipe1 ? deletedRecipe1.error : "Unknown error",
      "Recipe not found.",
      "Effects: Deleted recipe should no longer be found.",
    );
    console.log(
      `Verification: _getRecipeById(${recipeId1}) confirmed recipe is gone.`,
    );

    // Test 2: Attempt to delete by non-owner
    const deleteResult2 = await recipeConcept.deleteRecipe({
      requester: testUser1,
      recipe: recipeId2,
    });
    assertObjectMatch(
      deleteResult2,
      {
        error: "Requester is not the owner of the recipe and cannot delete it.",
      },
      "Requires: Requester is owner. Effects: Should return error for non-owner deletion.",
    );
    console.log(
      `Action: deleteRecipe(requester=${testUser1}, recipe=${recipeId2}) (non-owner) -> Error: ${deleteResult2.error}`,
    );

    // Verify state for non-owner delete attempt (recipe should still exist)
    const existingRecipe2 = await recipeConcept._getRecipeById({
      recipe: recipeId2,
    });
    if ("error" in existingRecipe2) {
      throw new Error(`Failed to get recipe: ${existingRecipe2.error}`);
    }
    assertNotEquals(
      "error" in existingRecipe2 ? existingRecipe2.error : "Unknown error",
      "Recipe not found.",
      "Effects: Recipe should still exist after failed non-owner delete.",
    );
    assertEquals(
      existingRecipe2.recipe[0]._id,
      recipeId2,
      "Effects: Recipe ID should match.",
    );
    console.log(
      `Verification: _getRecipeById(${recipeId2}) confirmed recipe still exists.`,
    );

    // Test 3: Delete non-existent recipe
    const nonExistentRecipeId = freshID();
    const deleteResult3 = await recipeConcept.deleteRecipe({
      requester: testUser1,
      recipe: nonExistentRecipeId,
    });
    assertObjectMatch(
      deleteResult3,
      { error: "Recipe not found." },
      "Requires: Recipe exists. Effects: Should return error for deleting non-existent recipe.",
    );
    console.log(
      `Action: deleteRecipe(requester=${testUser1}, recipe=nonExistentRecipe) -> Error: ${deleteResult3.error}`,
    );

    // Test 4: Missing requester/recipe ID
    const deleteResult4 = await recipeConcept.deleteRecipe({
      requester: "" as ID,
      recipe: recipeId2,
    });
    assertObjectMatch(
      deleteResult4,
      { error: "Requester ID and Recipe ID must be provided." },
      "Effects: Should return error for missing requester ID.",
    );
    console.log(
      `Action: deleteRecipe(requester=empty, recipe=${recipeId2}) -> Error: ${deleteResult4.error}`,
    );
  });

  await t.step("updateRecipeDetails action tests", async () => {
    console.log("\n--- Testing updateRecipeDetails action ---");
    const createResult = await recipeConcept.createRecipe({
      owner: testUser1,
      title: "Original Title",
      description: "Original description.",
      ingredients: [{ name: "Original Ing", quantity: "1 unit" }],
      steps: [{ description: "Original Step 1" }],
    });
    if ("error" in createResult) {
      throw new Error(`Failed to create recipe: ${createResult.error}`);
    }
    const recipeId = createResult.recipe;
    const initialRecipeResult = await recipeConcept._getRecipeById({
      recipe: recipeId,
    });
    if ("error" in initialRecipeResult) {
      throw new Error(`Failed to get recipe: ${initialRecipeResult.error}`);
    }
    const initialUpdatedTimestamp = initialRecipeResult.recipe[0].updated;
    console.log(
      `Setup: Created recipe ${recipeId} (owner: ${testUser1}). Initial updated: ${initialUpdatedTimestamp?.toISOString()}`,
    );

    // Test 1: Update title and description by owner
    const updateResult1 = await recipeConcept.updateRecipeDetails({
      owner: testUser1,
      recipe: recipeId,
      newTitle: "New Title",
      newDescription: "New description.",
    });
    assertObjectMatch(
      updateResult1 as Empty,
      {},
      "Effects: Should successfully update title and description.",
    );
    console.log(
      `Action: updateRecipeDetails(owner=${testUser1}, recipe=${recipeId}, newTitle, newDescription)`,
    );

    // Verify effects
    const updatedRecipe1 = await recipeConcept._getRecipeById({
      recipe: recipeId,
    });
    if ("error" in updatedRecipe1) {
      throw new Error(`Failed to get recipe: ${updatedRecipe1.error}`);
    }
    assertEquals(
      updatedRecipe1.recipe[0].title,
      "New Title",
      "Effects: Title should be updated.",
    );
    assertEquals(
      updatedRecipe1.recipe[0].description,
      "New description.",
      "Effects: Description should be updated.",
    );
    assertNotEquals(
      updatedRecipe1.recipe[0].updated.getTime(),
      initialUpdatedTimestamp.getTime(),
      "Effects: Updated timestamp should change.",
    );
    console.log(
      `Verification: _getRecipeById(${recipeId}) confirmed title and description updates.`,
    );

    // Test 2: Update ingredients and steps by owner
    const newIngredients = [
      { name: "New Ing 1", quantity: "2 units" },
      { name: "New Ing 2", quantity: "3 units" },
    ];
    const newSteps = [
      { description: "New Step 1" },
      { description: "New Step 2" },
    ];
    const updateResult2 = await recipeConcept.updateRecipeDetails({
      owner: testUser1,
      recipe: recipeId,
      newIngredients: newIngredients,
      newSteps: newSteps,
    });
    assertObjectMatch(
      updateResult2 as Empty,
      {},
      "Effects: Should successfully update ingredients and steps.",
    );
    console.log(
      `Action: updateRecipeDetails(owner=${testUser1}, recipe=${recipeId}, newIngredients, newSteps)`,
    );

    // Verify effects
    const updatedRecipe2 = await recipeConcept._getRecipeById({
      recipe: recipeId,
    });
    if ("error" in updatedRecipe2) {
      throw new Error(`Failed to get recipe: ${updatedRecipe2.error}`);
    }
    assertEquals(
      updatedRecipe2.recipe[0].ingredients.length,
      2,
      "Effects: Ingredients count should be updated.",
    );
    assertEquals(
      updatedRecipe2.recipe[0].ingredients[0].name,
      "New Ing 1",
      "Effects: First ingredient name should be updated.",
    );
    assertEquals(
      updatedRecipe2.recipe[0].steps.length,
      2,
      "Effects: Steps count should be updated.",
    );
    assertEquals(
      updatedRecipe2.recipe[0].steps[0].description,
      "New Step 1",
      "Effects: First step description should be updated.",
    );
    console.log(
      `Verification: _getRecipeById(${recipeId}) confirmed ingredients and steps updates.`,
    );

    // Test 3: Attempt to update by non-owner
    const updateResult3 = await recipeConcept.updateRecipeDetails({
      owner: testUser2, // Different user
      recipe: recipeId,
      newTitle: "Attempted Update",
    });
    assertObjectMatch(
      updateResult3,
      {
        error:
          "Provided owner is not the actual owner of the recipe and cannot update it.",
      },
      "Requires: Owner matches. Effects: Should return error for non-owner update.",
    );
    console.log(
      `Action: updateRecipeDetails(owner=${testUser2}, recipe=${recipeId}, newTitle) (non-owner) -> Error: ${updateResult3.error}`,
    );

    // Verify recipe remains unchanged after failed non-owner update
    const recipeAfterFailedUpdate = await recipeConcept._getRecipeById({
      recipe: recipeId,
    });
    if ("error" in recipeAfterFailedUpdate) {
      throw new Error(`Failed to get recipe: ${recipeAfterFailedUpdate.error}`);
    }
    assertEquals(
      recipeAfterFailedUpdate.recipe[0].title,
      "New Title",
      "Effects: Recipe title should not have changed.",
    );
    console.log(
      `Verification: _getRecipeById(${recipeId}) confirmed no change after failed non-owner update.`,
    );

    // Test 4: Update non-existent recipe
    const nonExistentRecipeId = freshID();
    const updateResult4 = await recipeConcept.updateRecipeDetails({
      owner: testUser1,
      recipe: nonExistentRecipeId,
      newTitle: "Ghost Recipe",
    });
    assertObjectMatch(
      updateResult4,
      { error: "Recipe not found." },
      "Requires: Recipe exists. Effects: Should return error for updating non-existent recipe.",
    );
    console.log(
      `Action: updateRecipeDetails(owner=${testUser1}, recipe=nonExistentRecipe, newTitle) -> Error: ${updateResult4.error}`,
    );

    // Test 5: Empty new title
    const updateResult5 = await recipeConcept.updateRecipeDetails({
      owner: testUser1,
      recipe: recipeId,
      newTitle: "",
    });
    assertObjectMatch(
      updateResult5,
      { error: "New title cannot be empty." },
      "Effects: Should return error for empty new title.",
    );
    console.log(
      `Action: updateRecipeDetails(owner=${testUser1}, recipe=${recipeId}, newTitle=empty) -> Error: ${updateResult5.error}`,
    );

    // Test 6: Empty new ingredients list
    const updateResult6 = await recipeConcept.updateRecipeDetails({
      owner: testUser1,
      recipe: recipeId,
      newIngredients: [],
    });
    assertObjectMatch(
      updateResult6,
      { error: "New ingredients list cannot be empty." },
      "Effects: Should return error for empty new ingredients list.",
    );
    console.log(
      `Action: updateRecipeDetails(owner=${testUser1}, recipe=${recipeId}, newIngredients=[]) -> Error: ${updateResult6.error}`,
    );

    // Test 7: Malformed new ingredient (missing quantity)
    const updateResult7 = await recipeConcept.updateRecipeDetails({
      owner: testUser1,
      recipe: recipeId,
      newIngredients: [{ name: "Salt", quantity: "" }],
    });
    assertObjectMatch(
      updateResult7,
      { error: "Each new ingredient must have a name and quantity." },
      "Effects: Should return error for malformed new ingredient.",
    );
    console.log(
      `Action: updateRecipeDetails(owner=${testUser1}, recipe=${recipeId}, newIngredients=[malformed]) -> Error: ${updateResult7.error}`,
    );

    // Test 8: Call with no specific content updates (should still update timestamp)
    const originalRecipeResult = await recipeConcept._getRecipeById({
      recipe: recipeId,
    });
    if ("error" in originalRecipeResult) {
      throw new Error(`Failed to get recipe: ${originalRecipeResult.error}`);
    }
    const originalUpdated = originalRecipeResult.recipe[0].updated;
    const updateResult8 = await recipeConcept.updateRecipeDetails({
      owner: testUser1,
      recipe: recipeId,
    });
    assertObjectMatch(
      updateResult8 as Empty,
      {},
      "Effects: Should succeed even with no content updates, just updating timestamp.",
    );
    console.log(
      `Action: updateRecipeDetails(owner=${testUser1}, recipe=${recipeId}) (no content updates)`,
    );
    const updatedRecipe8 = await recipeConcept._getRecipeById({
      recipe: recipeId,
    });
    if ("error" in updatedRecipe8) {
      throw new Error(`Failed to get recipe: ${updatedRecipe8.error}`);
    }
    assertNotEquals(
      updatedRecipe8.recipe[0].updated.getTime(),
      originalUpdated.getTime(),
      "Effects: Timestamp should still be updated.",
    );
    console.log(
      `Verification: _getRecipeById(${recipeId}) confirmed timestamp updated.`,
    );
  });

  await t.step("Query methods tests", async () => {
    console.log("\n--- Testing Query Methods ---");

    // Clear existing recipes to ensure clean test state
    await db.collection("Recipe.recipes").deleteMany({});
    const createResult1 = await recipeConcept.createRecipe({
      owner: testUser1,
      title: "Query Recipe 1",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
    });
    if ("error" in createResult1) {
      throw new Error(`Failed to create recipe: ${createResult1.error}`);
    }
    const recipeId1 = createResult1.recipe;
    await recipeConcept.addTag({ recipe: recipeId1, tag: "dinner" });

    const createResult2 = await recipeConcept.createRecipe({
      owner: testUser1,
      title: "Query Recipe 2",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
    });
    if ("error" in createResult2) {
      throw new Error(`Failed to create recipe: ${createResult2.error}`);
    }
    const recipeId2 = createResult2.recipe;
    await recipeConcept.addTag({ recipe: recipeId2, tag: "dinner" });
    await recipeConcept.addTag({ recipe: recipeId2, tag: "quick" });

    const createResult3 = await recipeConcept.createRecipe({
      owner: testUser2,
      title: "Query Recipe 3",
      ingredients: createTestIngredients(),
      steps: createTestSteps(),
    });
    if ("error" in createResult3) {
      throw new Error(`Failed to create recipe: ${createResult3.error}`);
    }
    const recipeId3 = createResult3.recipe;
    await recipeConcept.addTag({ recipe: recipeId3, tag: "breakfast" });

    console.log(
      `Setup: Created 3 recipes for query tests: ${recipeId1}, ${recipeId2}, ${recipeId3}.`,
    );

    // Test 1: _getRecipeById - existing recipe
    const getResult1 = await recipeConcept._getRecipeById({
      recipe: recipeId1,
    });
    if ("error" in getResult1) {
      throw new Error(`Failed to get recipe: ${getResult1.error}`);
    }
    assertEquals(
      getResult1.recipe.length,
      1,
      "Effects: Should return one recipe.",
    );
    assertEquals(
      getResult1.recipe[0]._id,
      recipeId1,
      "Effects: Should return the correct recipe.",
    );
    console.log(
      `Query: _getRecipeById(${recipeId1}) -> found recipe: ${
        getResult1.recipe[0].title
      }.`,
    );

    // Test 2: _getRecipeById - non-existent recipe
    const getResult2 = await recipeConcept._getRecipeById({
      recipe: freshID(),
    });
    assertEquals(
      "error" in getResult2 ? getResult2.error : "Unknown error",
      "Recipe not found.",
      "Effects: Should return error for non-existent recipe.",
    );
    console.log(
      `Query: _getRecipeById(nonExistent) -> Error: ${
        "error" in getResult2 ? getResult2.error : "Unknown error"
      }`,
    );

    // Test 3: _listRecipesByOwner - owner with recipes
    const listResult1 = await recipeConcept._listRecipesByOwner({
      owner: testUser1,
    });
    if ("error" in listResult1) {
      throw new Error(`Failed to list recipes: ${listResult1.error}`);
    }
    assertEquals(
      listResult1.recipe.length,
      2,
      "Effects: Should return two recipes for testUser1.",
    );
    assertEquals(
      listResult1.recipe[0].owner,
      testUser1,
      "Effects: Owner should match.",
    );
    console.log(
      `Query: _listRecipesByOwner(${testUser1}) -> found ${listResult1.recipe.length} recipes.`,
    );

    // Test 4: _listRecipesByOwner - owner with no recipes
    const listResult2 = await recipeConcept._listRecipesByOwner({
      owner: freshID(),
    });
    if ("error" in listResult2) {
      throw new Error(`Failed to list recipes: ${listResult2.error}`);
    }
    assertEquals(
      listResult2.recipe.length,
      0,
      "Effects: Should return no recipes for owner with no recipes.",
    );
    console.log(
      `Query: _listRecipesByOwner(userWithNoRecipes) -> found ${listResult2.recipe.length} recipes.`,
    );

    // Test 5: _searchRecipesByTag - existing tag
    const searchResult1 = await recipeConcept._searchRecipesByTag({
      tag: "dinner",
    });
    if ("error" in searchResult1) {
      throw new Error(`Failed to search recipes: ${searchResult1.error}`);
    }
    assertEquals(
      searchResult1.recipe.length,
      2,
      "Effects: Should return two recipes for 'dinner' tag.",
    );
    assertEquals(
      searchResult1.recipe.every((r) => r.tags.includes("dinner")),
      true,
      "Effects: All returned recipes should have 'dinner' tag.",
    );
    console.log(
      `Query: _searchRecipesByTag("dinner") -> found ${searchResult1.recipe.length} recipes.`,
    );

    // Test 6: _searchRecipesByTag - non-existent tag
    const searchResult2 = await recipeConcept._searchRecipesByTag({
      tag: "vegan",
    });
    if ("error" in searchResult2) {
      throw new Error(`Failed to search recipes: ${searchResult2.error}`);
    }
    assertEquals(
      searchResult2.recipe.length,
      0,
      "Effects: Should return no recipes for non-existent tag.",
    );
    console.log(
      `Query: _searchRecipesByTag("vegan") -> found ${searchResult2.recipe.length} recipes.`,
    );

    // Test 7: _searchRecipesByTag - empty tag
    const searchResult3 = await recipeConcept._searchRecipesByTag({ tag: "" });
    assertObjectMatch(
      searchResult3,
      { error: "Tag cannot be empty for search." },
      "Effects: Should return error for empty tag search.",
    );
    console.log(
      `Query: _searchRecipesByTag("") -> Error: ${
        "error" in searchResult3 ? searchResult3.error : "Unknown error"
      }`,
    );
  });

  await client.close();
});
