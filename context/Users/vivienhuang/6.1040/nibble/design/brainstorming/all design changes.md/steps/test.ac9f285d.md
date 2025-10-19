---
timestamp: 'Sun Oct 19 2025 14:02:40 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140240.7ef6a09a.md]]'
content_id: ac9f285d5dafd665b594f282a2be55fb91459816ee4c54836c4bfeb6fb76b863
---

# test: Notebook

```typescript
// file: src/Notebook/NotebookConcept.test.ts

import { assertEquals, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import NotebookConcept from "./NotebookConcept.ts";

Deno.test("Notebook Concept", async (t) => {
  const [db, client] = await testDb();
  const notebookConcept = new NotebookConcept(db);

  // Define some test IDs
  const userA = "user:alice" as ID;
  const userB = "user:bob" as ID;
  const userC = "user:charlie" as ID;
  const recipe1 = "recipe:brownies" as ID;
  const recipe2 = "recipe:pizza" as ID;
  const recipe3 = "recipe:salad" as ID;

  await t.step("createNotebook: should successfully create a notebook", async () => {
    console.log("--- Test: createNotebook (success) ---");
    const result = await notebookConcept.createNotebook({
      owner: userA,
      title: "Alice's Recipes",
      description: "My favorite recipes",
    });

    assertNotEquals((result as { error: string }).error, undefined, "Should not return an error");
    const notebookId = (result as { notebook: ID }).notebook;
    assertNotEquals(notebookId, undefined, "Notebook ID should be returned");
    console.log(`Action: createNotebook(${userA}, "Alice's Recipes") -> ${notebookId}`);

    const retrieved = await notebookConcept._getNotebookById({ notebook: notebookId });
    assertEquals((retrieved as { error: string }).error, undefined, "Should retrieve notebook without error");
    assertEquals(retrieved.length, 1, "Should retrieve one notebook");
    const notebook = (retrieved as any[])[0];
    assertEquals(notebook.owner, userA, "Notebook owner should be Alice");
    assertEquals(notebook.title, "Alice's Recipes", "Notebook title should match");
    assertArrayIncludes(notebook.members, [userA], "Owner should automatically be a member");
    assertEquals(notebook.recipes.length, 0, "New notebook should have no recipes");
    assertNotEquals(notebook.created, undefined, "Creation timestamp should be set");
    console.log("Effect: Notebook created, owner is member, state verified.");
  });

  await t.step("createNotebook: should return error for empty title", async () => {
    console.log("--- Test: createNotebook (empty title) ---");
    const result = await notebookConcept.createNotebook({
      owner: userA,
      title: "",
    });
    assertEquals((result as { error: string }).error, "Notebook title cannot be empty.", "Should return error for empty title");
    console.log("Requirement: title ≠ '' is enforced. Action failed as expected.");
  });

  let aliceNotebookId: ID;
  let bobNotebookId: ID;

  await t.step("setup: create initial notebooks for further tests", async () => {
    const res1 = await notebookConcept.createNotebook({ owner: userA, title: "Alice's Main Cookbook" });
    aliceNotebookId = (res1 as { notebook: ID }).notebook;
    const res2 = await notebookConcept.createNotebook({ owner: userB, title: "Bob's Baking Book" });
    bobNotebookId = (res2 as { notebook: ID }).notebook;
    console.log(`Setup: Alice's notebook ${aliceNotebookId}, Bob's notebook ${bobNotebookId}`);
  });

  await t.step("inviteMember: should allow owner to invite a member", async () => {
    console.log("--- Test: inviteMember (success) ---");
    const result = await notebookConcept.inviteMember({ owner: userA, notebook: aliceNotebookId, member: userB });
    assertEquals((result as { error: string }).error, undefined, "Should not return an error");
    console.log(`Action: inviteMember(${userA}, ${aliceNotebookId}, ${userB})`);

    const notebook = (await notebookConcept._getNotebookById({ notebook: aliceNotebookId }) as any[])[0];
    assertArrayIncludes(notebook.members, [userA, userB], "User B should be a member of Alice's notebook");
    assertEquals(notebook.members.length, 2, "There should be 2 members");
    console.log("Effect: User B added to members list. State verified.");
  });

  await t.step("inviteMember: should return error if not owner", async () => {
    console.log("--- Test: inviteMember (not owner) ---");
    const result = await notebookConcept.inviteMember({ owner: userB, notebook: aliceNotebookId, member: userC });
    assertEquals((result as { error: string }).error, "Only the notebook owner can invite members.", "Should return error for non-owner inviting");
    console.log("Requirement: owner = notebook.owner is enforced. Action failed as expected.");
  });

  await t.step("inviteMember: should return error if member already exists", async () => {
    console.log("--- Test: inviteMember (member exists) ---");
    const result = await notebookConcept.inviteMember({ owner: userA, notebook: aliceNotebookId, member: userB });
    assertEquals((result as { error: string }).error, "User is already a member of this notebook.", "Should return error for inviting existing member");
    console.log("Requirement: member not already in notebook.members is enforced. Action failed as expected.");
  });

  await t.step("removeMember: should allow owner to remove a member", async () => {
    console.log("--- Test: removeMember (success) ---");
    const result = await notebookConcept.removeMember({ owner: userA, notebook: aliceNotebookId, member: userB });
    assertEquals((result as { error: string }).error, undefined, "Should not return an error");
    console.log(`Action: removeMember(${userA}, ${aliceNotebookId}, ${userB})`);

    const notebook = (await notebookConcept._getNotebookById({ notebook: aliceNotebookId }) as any[])[0];
    assertEquals(notebook.members.includes(userB), false, "User B should no longer be a member");
    assertEquals(notebook.members.length, 1, "There should be 1 member (owner A)");
    console.log("Effect: User B removed from members list. State verified.");
  });

  await t.step("removeMember: should return error if not owner", async () => {
    console.log("--- Test: removeMember (not owner) ---");
    await notebookConcept.inviteMember({ owner: userA, notebook: aliceNotebookId, member: userB }); // Re-add userB for this test
    const result = await notebookConcept.removeMember({ owner: userC, notebook: aliceNotebookId, member: userB });
    assertEquals((result as { error: string }).error, "Only the notebook owner can remove members.", "Should return error for non-owner removing");
    console.log("Requirement: owner = notebook.owner is enforced. Action failed as expected.");
  });

  await t.step("removeMember: should return error if removing self (owner)", async () => {
    console.log("--- Test: removeMember (removing owner) ---");
    const result = await notebookConcept.removeMember({ owner: userA, notebook: aliceNotebookId, member: userA });
    assertEquals((result as { error: string }).error, "The owner cannot remove themselves from the notebook.", "Should return error for owner removing self");
    console.log("Requirement: member ≠ owner is enforced. Action failed as expected.");
  });

  await t.step("removeMember: should return error if member not found", async () => {
    console.log("--- Test: removeMember (member not found) ---");
    const result = await notebookConcept.removeMember({ owner: userA, notebook: aliceNotebookId, member: userC });
    assertEquals((result as { error: string }).error, "User is not a member of this notebook.", "Should return error if member is not in notebook");
    console.log("Requirement: member ∈ notebook.members is enforced. Action failed as expected.");
  });

  await t.step("shareRecipe: should allow sharing a recipe to a notebook", async () => {
    console.log("--- Test: shareRecipe (success) ---");
    // Assuming sharer is authorized by a sync (e.g., userA is recipe1 owner or a member)
    const result = await notebookConcept.shareRecipe({ sharer: userA, recipe: recipe1, notebook: aliceNotebookId });
    assertEquals((result as { error: string }).error, undefined, "Should not return an error");
    console.log(`Action: shareRecipe(${userA}, ${recipe1}, ${aliceNotebookId})`);

    const notebook = (await notebookConcept._getNotebookById({ notebook: aliceNotebookId }) as any[])[0];
    assertArrayIncludes(notebook.recipes, [recipe1], "Recipe 1 should be shared in Alice's notebook");
    console.log("Effect: Recipe 1 added to shared recipes. State verified.");
  });

  await t.step("shareRecipe: should return error if recipe already shared", async () => {
    console.log("--- Test: shareRecipe (already shared) ---");
    const result = await notebookConcept.shareRecipe({ sharer: userA, recipe: recipe1, notebook: aliceNotebookId });
    assertEquals((result as { error: string }).error, "Recipe is already shared in this notebook.", "Should return error for already shared recipe");
    console.log("Requirement: recipe not already in notebook.recipes is enforced. Action failed as expected.");
  });

  await t.step("unshareRecipe: should allow unsharing a recipe from a notebook", async () => {
    console.log("--- Test: unshareRecipe (success) ---");
    // Assuming requester is authorized by a sync (e.g., userA is recipe1 owner or notebook owner)
    const result = await notebookConcept.unshareRecipe({ requester: userA, recipe: recipe1, notebook: aliceNotebookId });
    assertEquals((result as { error: string }).error, undefined, "Should not return an error");
    console.log(`Action: unshareRecipe(${userA}, ${recipe1}, ${aliceNotebookId})`);

    const notebook = (await notebookConcept._getNotebookById({ notebook: aliceNotebookId }) as any[])[0];
    assertEquals(notebook.recipes.includes(recipe1), false, "Recipe 1 should no longer be in Alice's notebook");
    console.log("Effect: Recipe 1 removed from shared recipes. State verified.");
  });

  await t.step("unshareRecipe: should return error if recipe not shared", async () => {
    console.log("--- Test: unshareRecipe (not shared) ---");
    const result = await notebookConcept.unshareRecipe({ requester: userA, recipe: recipe1, notebook: aliceNotebookId });
    assertEquals((result as { error: string }).error, "Recipe is not shared in this notebook.", "Should return error for unsharing unshared recipe");
    console.log("Requirement: recipe ∈ notebook.recipes is enforced. Action failed as expected.");
  });

  await t.step("deleteNotebook: should allow owner to delete notebook", async () => {
    console.log("--- Test: deleteNotebook (success) ---");
    const result = await notebookConcept.deleteNotebook({ owner: bobNotebookId, notebook: bobNotebookId }); // Bob is owner of his notebook.
    assertEquals((result as { error: string }).error, undefined, "Should not return an error");
    console.log(`Action: deleteNotebook(${userB}, ${bobNotebookId})`);

    const retrieved = await notebookConcept._getNotebookById({ notebook: bobNotebookId });
    assertEquals((retrieved as { error: string }).error, "Notebook not found.", "Should return error for deleted notebook");
    console.log("Effect: Bob's notebook deleted. State verified via query.");
  });

  await t.step("deleteNotebook: should return error if not owner", async () => {
    console.log("--- Test: deleteNotebook (not owner) ---");
    const result = await notebookConcept.deleteNotebook({ owner: userB, notebook: aliceNotebookId });
    assertEquals((result as { error: string }).error, "Only the notebook owner can delete the notebook.", "Should return error for non-owner deleting");
    console.log("Requirement: owner = notebook.owner is enforced. Action failed as expected.");
  });

  await t.step("--- Principle Test: Membership defines access; shared recipes remain editable only by owners but viewable by all members ---", async () => {
    console.log("\n--- Fulfilling Notebook Principle ---");
    const vivien = "user:vivien" as ID;
    const roommate1 = "user:roommate1" as ID;
    const roommate2 = "user:roommate2" as ID;
    const matchaBrownies = "recipe:matcha_brownies" as ID;
    const pastaCarbonara = "recipe:pasta_carbonara" as ID;

    console.log("1. Vivien creates a 'Roommate Meals' notebook.");
    const vivienNotebookRes = await notebookConcept.createNotebook({
      owner: vivien,
      title: "Roommate Meals",
      description: "Shared recipes for our communal dinners",
    });
    const vivienNotebookId = (vivienNotebookRes as { notebook: ID }).notebook;
    assertNotEquals(vivienNotebookId, undefined);
    console.log(`   Action: createNotebook(${vivien}, "Roommate Meals") -> ${vivienNotebookId}`);

    console.log("2. Vivien invites roommates to the notebook.");
    await notebookConcept.inviteMember({ owner: vivien, notebook: vivienNotebookId, member: roommate1 });
    await notebookConcept.inviteMember({ owner: vivien, notebook: vivienNotebookId, member: roommate2 });
    console.log(`   Actions: inviteMember(${vivien}, ${vivienNotebookId}, ${roommate1})`);
    console.log(`            inviteMember(${vivien}, ${vivienNotebookId}, ${roommate2})`);

    let notebookDoc = (await notebookConcept._getNotebookById({ notebook: vivienNotebookId }) as any[])[0];
    assertArrayIncludes(notebookDoc.members, [vivien, roommate1, roommate2], "All roommates should be members");
    assertEquals(notebookDoc.members.length, 3, "Expected 3 members");
    console.log("   Effect: All specified users are members of the notebook.");

    console.log("3. Vivien shares 'Matcha Brownies' recipe into the notebook.");
    // Assume sync ensures vivien is owner of matchaBrownies or is a member of the notebook (which she is)
    await notebookConcept.shareRecipe({ sharer: vivien, recipe: matchaBrownies, notebook: vivienNotebookId });
    console.log(`   Action: shareRecipe(${vivien}, ${matchaBrownies}, ${vivienNotebookId})`);

    notebookDoc = (await notebookConcept._getNotebookById({ notebook: vivienNotebookId }) as any[])[0];
    assertArrayIncludes(notebookDoc.recipes, [matchaBrownies], "Matcha Brownies should be in the notebook");
    console.log("   Effect: Matcha Brownies recipe added to the notebook.");

    console.log("4. Roommate 1 shares 'Pasta Carbonara' recipe into the notebook.");
    // Assume sync ensures roommate1 is owner of pastaCarbonara or is a member of the notebook (which they are)
    await notebookConcept.shareRecipe({ sharer: roommate1, recipe: pastaCarbonara, notebook: vivienNotebookId });
    console.log(`   Action: shareRecipe(${roommate1}, ${pastaCarbonara}, ${vivienNotebookId})`);

    notebookDoc = (await notebookConcept._getNotebookById({ notebook: vivienNotebookId }) as any[])[0];
    assertArrayIncludes(notebookDoc.recipes, [matchaBrownies, pastaCarbonara], "Both recipes should be in the notebook");
    assertEquals(notebookDoc.recipes.length, 2, "Expected 2 recipes");
    console.log("   Effect: Pasta Carbonara recipe added to the notebook.");

    console.log("5. Verify access: all members can view the shared recipes.");
    const vivienNotebooks = await notebookConcept._getNotebooksWithMember({ member: vivien });
    assertEquals(vivienNotebooks.length, 1, "Vivien should see her notebook");
    assertArrayIncludes((vivienNotebooks[0] as any).recipes, [matchaBrownies, pastaCarbonara], "Vivien can view all shared recipes.");
    console.log(`   Query: _getNotebooksWithMember(${vivien}) -> Vivien sees notebook with recipes.`);

    const roommate1Notebooks = await notebookConcept._getNotebooksWithMember({ member: roommate1 });
    assertEquals(roommate1Notebooks.length, 1, "Roommate 1 should see the shared notebook");
    assertArrayIncludes((roommate1Notebooks[0] as any).recipes, [matchaBrownies, pastaCarbonara], "Roommate 1 can view all shared recipes.");
    console.log(`   Query: _getNotebooksWithMember(${roommate1}) -> Roommate 1 sees notebook with recipes.`);

    const roommate2Notebooks = await notebookConcept._getNotebooksWithMember({ member: roommate2 });
    assertEquals(roommate2Notebooks.length, 1, "Roommate 2 should see the shared notebook");
    assertArrayIncludes((roommate2Notebooks[0] as any).recipes, [matchaBrownies, pastaCarbonara], "Roommate 2 can view all shared recipes.");
    console.log(`   Query: _getNotebooksWithMember(${roommate2}) -> Roommate 2 sees notebook with recipes.`);

    console.log("Principle Fulfilled: Membership defines access; all members can view the shared recipes. The 'editable only by owners' part is outside this concept's direct control, handled by syncs acting on the Recipe concept.");
  });

  await client.close();
});
```
