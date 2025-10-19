## test output 1

```
vivienhuang@H0K79H2RD4 nibble % deno test -A '/Users/vivienhuang/6.1040/nibble/src/concepts
/Notebook/NotebookConcept.test.ts'
Check file:///Users/vivienhuang/6.1040/nibble/src/concepts/Notebook/NotebookConcept.test.ts
running 1 test from ./src/concepts/Notebook/NotebookConcept.test.ts
Notebook Concept ...
  createNotebook: should successfully create a notebook ...
------- output -------
--- Test: createNotebook (success) ---
----- output end -----
  createNotebook: should successfully create a notebook ... FAILED (50ms)
  createNotebook: should return error for empty title ...
------- output -------
--- Test: createNotebook (empty title) ---
Requirement: title ≠ '' is enforced. Action failed as expected.
----- output end -----
  createNotebook: should return error for empty title ... ok (0ms)
  setup: create initial notebooks for further tests ...
------- output -------
Setup: Alice's notebook 0199fd29-0823-7862-9074-1ab8511712ef, Bob's notebook 0199fd29-0838-780c-8e56-47864cfffbc5
----- output end -----
  setup: create initial notebooks for further tests ... ok (41ms)
  inviteMember: should allow owner to invite a member ...
------- output -------
--- Test: inviteMember (success) ---
Action: inviteMember(user:alice, 0199fd29-0823-7862-9074-1ab8511712ef, user:bob)
Effect: User B added to members list. State verified.
----- output end -----
  inviteMember: should allow owner to invite a member ... ok (62ms)
  inviteMember: should return error if not owner ...
------- output -------
--- Test: inviteMember (not owner) ---
Requirement: owner = notebook.owner is enforced. Action failed as expected.
----- output end -----
  inviteMember: should return error if not owner ... ok (18ms)
  inviteMember: should return error if member already exists ...
------- output -------
--- Test: inviteMember (member exists) ---
Requirement: member not already in notebook.members is enforced. Action failed as expected.
----- output end -----
  inviteMember: should return error if member already exists ... ok (20ms)
  removeMember: should allow owner to remove a member ...
------- output -------
--- Test: removeMember (success) ---
Action: removeMember(user:alice, 0199fd29-0823-7862-9074-1ab8511712ef, user:bob)
Effect: User B removed from members list. State verified.
----- output end -----
  removeMember: should allow owner to remove a member ... ok (62ms)
  removeMember: should return error if not owner ...
------- output -------
--- Test: removeMember (not owner) ---
Requirement: owner = notebook.owner is enforced. Action failed as expected.
----- output end -----
  removeMember: should return error if not owner ... ok (56ms)
  removeMember: should return error if removing self (owner) ...
------- output -------
--- Test: removeMember (removing owner) ---
Requirement: member ≠ owner is enforced. Action failed as expected.
----- output end -----
  removeMember: should return error if removing self (owner) ... ok (33ms)
  removeMember: should return error if member not found ...
------- output -------
--- Test: removeMember (member not found) ---
Requirement: member ∈ notebook.members is enforced. Action failed as expected.
----- output end -----
  removeMember: should return error if member not found ... ok (21ms)
  shareRecipe: should allow sharing a recipe to a notebook ...
------- output -------
--- Test: shareRecipe (success) ---
Action: shareRecipe(user:alice, recipe:brownies, 0199fd29-0823-7862-9074-1ab8511712ef)
Effect: Recipe 1 added to shared recipes. State verified.
----- output end -----
  shareRecipe: should allow sharing a recipe to a notebook ... ok (56ms)
  shareRecipe: should return error if recipe already shared ...
------- output -------
--- Test: shareRecipe (already shared) ---
Requirement: recipe not already in notebook.recipes is enforced. Action failed as expected.
----- output end -----
  shareRecipe: should return error if recipe already shared ... ok (21ms)
  unshareRecipe: should allow unsharing a recipe from a notebook ...
------- output -------
--- Test: unshareRecipe (success) ---
Action: unshareRecipe(user:alice, recipe:brownies, 0199fd29-0823-7862-9074-1ab8511712ef)
Effect: Recipe 1 removed from shared recipes. State verified.
----- output end -----
  unshareRecipe: should allow unsharing a recipe from a notebook ... ok (74ms)
  unshareRecipe: should return error if recipe not shared ...
------- output -------
--- Test: unshareRecipe (not shared) ---
Requirement: recipe ∈ notebook.recipes is enforced. Action failed as expected.
----- output end -----
  unshareRecipe: should return error if recipe not shared ... ok (21ms)
  deleteNotebook: should allow owner to delete notebook ...
------- output -------
--- Test: deleteNotebook (success) ---
----- output end -----
  deleteNotebook: should allow owner to delete notebook ... FAILED (23ms)
  deleteNotebook: should return error if not owner ...
------- output -------
--- Test: deleteNotebook (not owner) ---
Requirement: owner = notebook.owner is enforced. Action failed as expected.
----- output end -----
  deleteNotebook: should return error if not owner ... ok (18ms)
  --- Principle Test: Membership defines access; shared recipes remain editable only by owners but viewable by all members --- ...
------- output -------

--- Fulfilling Notebook Principle ---
1. Vivien creates a 'Roommate Meals' notebook.
   Action: createNotebook(user:vivien, "Roommate Meals") -> 0199fd29-0a33-7f01-b730-2e57d223460d
2. Vivien invites roommates to the notebook.
   Actions: inviteMember(user:vivien, 0199fd29-0a33-7f01-b730-2e57d223460d, user:roommate1)
            inviteMember(user:vivien, 0199fd29-0a33-7f01-b730-2e57d223460d, user:roommate2)
   Effect: All specified users are members of the notebook.
3. Vivien shares 'Matcha Brownies' recipe into the notebook.
   Action: shareRecipe(user:vivien, recipe:matcha_brownies, 0199fd29-0a33-7f01-b730-2e57d223460d)
   Effect: Matcha Brownies recipe added to the notebook.
4. Roommate 1 shares 'Pasta Carbonara' recipe into the notebook.
   Action: shareRecipe(user:roommate1, recipe:pasta_carbonara, 0199fd29-0a33-7f01-b730-2e57d223460d)
   Effect: Pasta Carbonara recipe added to the notebook.
5. Verify access: all members can view the shared recipes.
   Query: _getNotebooksWithMember(user:vivien) -> Vivien sees notebook with recipes.
   Query: _getNotebooksWithMember(user:roommate1) -> Roommate 1 sees notebook with recipes.
   Query: _getNotebooksWithMember(user:roommate2) -> Roommate 2 sees notebook with recipes.
Principle Fulfilled: Membership defines access; all members can view the shared recipes. The 'editable only by owners' part is outside this concept's direct control, handled by syncs acting on the Recipe concept.
----- output end -----
  --- Principle Test: Membership defines access; shared recipes remain editable only by owners but viewable by all members --- ... ok (296ms)
Notebook Concept ... FAILED (due to 2 failed steps) (1s)

 ERRORS 

Notebook Concept ... createNotebook: should successfully create a notebook => ./src/concepts/Notebook/NotebookConcept.test.ts:22:11
error: AssertionError: Expected actual: undefined not to be: undefined: Should not return an error
  throw new AssertionError(
        ^
    at assertNotEquals (https://jsr.io/@std/assert/1.0.7/not_equals.ts:33:9)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/Notebook/NotebookConcept.test.ts:32:7
    at eventLoopTick (ext:core/01_core.js:179:7)
    at async innerWrapped (ext:cli/40_test.js:181:5)
    at async exitSanitizer (ext:cli/40_test.js:97:27)
    at async Object.outerWrapped [as fn] (ext:cli/40_test.js:124:14)
    at async TestContext.step (ext:cli/40_test.js:511:22)
    at async file:///Users/vivienhuang/6.1040/nibble/src/concepts/Notebook/NotebookConcept.test.ts:22:3

Notebook Concept ... deleteNotebook: should allow owner to delete notebook => ./src/concepts/Notebook/NotebookConcept.test.ts:400:11
error: AssertionError: Values are not equal: Should not return an error


    [Diff] Actual / Expected


-   "Only the notebook owner can delete the notebook."
+   undefined

  throw new AssertionError(message);
        ^
    at assertEquals (https://jsr.io/@std/assert/1.0.7/equals.ts:51:9)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/Notebook/NotebookConcept.test.ts:408:7
    at eventLoopTick (ext:core/01_core.js:179:7)
    at async innerWrapped (ext:cli/40_test.js:181:5)
    at async exitSanitizer (ext:cli/40_test.js:97:27)
    at async Object.outerWrapped [as fn] (ext:cli/40_test.js:124:14)
    at async TestContext.step (ext:cli/40_test.js:511:22)
    at async file:///Users/vivienhuang/6.1040/nibble/src/concepts/Notebook/NotebookConcept.test.ts:400:3

 FAILURES 

Notebook Concept ... createNotebook: should successfully create a notebook => ./src/concepts/Notebook/NotebookConcept.test.ts:22:11
Notebook Concept ... deleteNotebook: should allow owner to delete notebook => ./src/concepts/Notebook/NotebookConcept.test.ts:400:11

FAILED | 0 passed (15 steps) | 1 failed (2 steps) (1s)

error: Test failed
```

## test output 2

```
vivienhuang@H0K79H2RD4 nibble % deno test -A '/Users/vivienhuang/6.1040/nibble/src/concepts/Notebook/NotebookConcept.test.ts'
Check file:///Users/vivienhuang/6.1040/nibble/src/concepts/Notebook/NotebookConcept.test.ts
running 1 test from ./src/concepts/Notebook/NotebookConcept.test.ts
Notebook Concept ...
  createNotebook: should successfully create a notebook ...
------- output -------
--- Test: createNotebook (success) ---
Action: createNotebook(user:alice, "Alice's Recipes") -> 0199fd2a-45ff-7d61-a3d2-a96fddd2c365
Effect: Notebook created, owner is member, state verified.
----- output end -----
  createNotebook: should successfully create a notebook ... ok (65ms)
  createNotebook: should return error for empty title ...
------- output -------
--- Test: createNotebook (empty title) ---
Requirement: title ≠ '' is enforced. Action failed as expected.
----- output end -----
  createNotebook: should return error for empty title ... ok (0ms)
  setup: create initial notebooks for further tests ...
------- output -------
Setup: Alice's notebook 0199fd2a-4641-7b03-b2c7-3b4c1c446b6b, Bob's notebook 0199fd2a-465a-7485-b4ae-148d061ef452
----- output end -----
  setup: create initial notebooks for further tests ... ok (49ms)
  inviteMember: should allow owner to invite a member ...
------- output -------
--- Test: inviteMember (success) ---
Action: inviteMember(user:alice, 0199fd2a-4641-7b03-b2c7-3b4c1c446b6b, user:bob)
Effect: User B added to members list. State verified.
----- output end -----
  inviteMember: should allow owner to invite a member ... ok (60ms)
  inviteMember: should return error if not owner ...
------- output -------
--- Test: inviteMember (not owner) ---
Requirement: owner = notebook.owner is enforced. Action failed as expected.
----- output end -----
  inviteMember: should return error if not owner ... ok (21ms)
  inviteMember: should return error if member already exists ...
------- output -------
--- Test: inviteMember (member exists) ---
Requirement: member not already in notebook.members is enforced. Action failed as expected.
----- output end -----
  inviteMember: should return error if member already exists ... ok (16ms)
  removeMember: should allow owner to remove a member ...
------- output -------
--- Test: removeMember (success) ---
Action: removeMember(user:alice, 0199fd2a-4641-7b03-b2c7-3b4c1c446b6b, user:bob)
Effect: User B removed from members list. State verified.
----- output end -----
  removeMember: should allow owner to remove a member ... ok (60ms)
  removeMember: should return error if not owner ...
------- output -------
--- Test: removeMember (not owner) ---
Requirement: owner = notebook.owner is enforced. Action failed as expected.
----- output end -----
  removeMember: should return error if not owner ... ok (70ms)
  removeMember: should return error if removing self (owner) ...
------- output -------
--- Test: removeMember (removing owner) ---
Requirement: member ≠ owner is enforced. Action failed as expected.
----- output end -----
  removeMember: should return error if removing self (owner) ... ok (20ms)
  removeMember: should return error if member not found ...
------- output -------
--- Test: removeMember (member not found) ---
Requirement: member ∈ notebook.members is enforced. Action failed as expected.
----- output end -----
  removeMember: should return error if member not found ... ok (18ms)
  shareRecipe: should allow sharing a recipe to a notebook ...
------- output -------
--- Test: shareRecipe (success) ---
Action: shareRecipe(user:alice, recipe:brownies, 0199fd2a-4641-7b03-b2c7-3b4c1c446b6b)
Effect: Recipe 1 added to shared recipes. State verified.
----- output end -----
  shareRecipe: should allow sharing a recipe to a notebook ... ok (64ms)
  shareRecipe: should return error if recipe already shared ...
------- output -------
--- Test: shareRecipe (already shared) ---
Requirement: recipe not already in notebook.recipes is enforced. Action failed as expected.
----- output end -----
  shareRecipe: should return error if recipe already shared ... ok (17ms)
  unshareRecipe: should allow unsharing a recipe from a notebook ...
------- output -------
--- Test: unshareRecipe (success) ---
Action: unshareRecipe(user:alice, recipe:brownies, 0199fd2a-4641-7b03-b2c7-3b4c1c446b6b)
Effect: Recipe 1 removed from shared recipes. State verified.
----- output end -----
  unshareRecipe: should allow unsharing a recipe from a notebook ... ok (58ms)
  unshareRecipe: should return error if recipe not shared ...
------- output -------
--- Test: unshareRecipe (not shared) ---
Requirement: recipe ∈ notebook.recipes is enforced. Action failed as expected.
----- output end -----
  unshareRecipe: should return error if recipe not shared ... ok (17ms)
  deleteNotebook: should allow owner to delete notebook ...
------- output -------
--- Test: deleteNotebook (success) ---
Action: deleteNotebook(user:bob, 0199fd2a-465a-7485-b4ae-148d061ef452)
Effect: Bob's notebook deleted. State verified via query.
----- output end -----
  deleteNotebook: should allow owner to delete notebook ... ok (56ms)
  deleteNotebook: should return error if not owner ...
------- output -------
--- Test: deleteNotebook (not owner) ---
Requirement: owner = notebook.owner is enforced. Action failed as expected.
----- output end -----
  deleteNotebook: should return error if not owner ... ok (16ms)
  --- Principle Test: Membership defines access; shared recipes remain editable only by owners but viewable by all members --- ...
------- output -------

--- Fulfilling Notebook Principle ---
1. Vivien creates a 'Roommate Meals' notebook.
   Action: createNotebook(user:vivien, "Roommate Meals") -> 0199fd2a-4866-7b7d-a6ba-323a8c171319
2. Vivien invites roommates to the notebook.
   Actions: inviteMember(user:vivien, 0199fd2a-4866-7b7d-a6ba-323a8c171319, user:roommate1)
            inviteMember(user:vivien, 0199fd2a-4866-7b7d-a6ba-323a8c171319, user:roommate2)
   Effect: All specified users are members of the notebook.
3. Vivien shares 'Matcha Brownies' recipe into the notebook.
   Action: shareRecipe(user:vivien, recipe:matcha_brownies, 0199fd2a-4866-7b7d-a6ba-323a8c171319)
   Effect: Matcha Brownies recipe added to the notebook.
4. Roommate 1 shares 'Pasta Carbonara' recipe into the notebook.
   Action: shareRecipe(user:roommate1, recipe:pasta_carbonara, 0199fd2a-4866-7b7d-a6ba-323a8c171319)
   Effect: Pasta Carbonara recipe added to the notebook.
5. Verify access: all members can view the shared recipes.
   Query: _getNotebooksWithMember(user:vivien) -> Vivien sees notebook with recipes.
   Query: _getNotebooksWithMember(user:roommate1) -> Roommate 1 sees notebook with recipes.
   Query: _getNotebooksWithMember(user:roommate2) -> Roommate 2 sees notebook with recipes.
Principle Fulfilled: Membership defines access; all members can view the shared recipes. The 'editable only by owners' part is outside this concept's direct control, handled by syncs acting on the Recipe concept.
----- output end -----
  --- Principle Test: Membership defines access; shared recipes remain editable only by owners but viewable by all members --- ... ok (426ms)
Notebook Concept ... ok (1s)

ok | 1 passed (17 steps) | 0 failed (1s)

```
## test output 3
