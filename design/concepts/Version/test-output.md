## test output 1

```
vivienhuang@H0K79H2RD4 nibble % deno test -A '/Users/vivienhuang/6.1040/nibble/src/concepts
/Version/VersionConcept.test.ts'
Check file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts
running 1 test from ./src/concepts/Version/VersionConcept.test.ts
VersionConcept Lifecycle Tests ...
  createVersion - successfully creates a new recipe version ...
------- output -------
--- Test: createVersion successful ---
createVersion result: { version: "0199fae5-d4c6-7813-a122-dbf44d74d186" }
Fetched version after creation: [
  {
    _id: "0199fae5-d4c6-7813-a122-dbf44d74d186",
    baseRecipe: "recipe:Brownies",
    versionNum: "1.0",
    author: "user:Alice",
    notes: "Initial recipe version.",
    ingredients: [
      { name: "Flour", quantity: "1 cup" },
      { name: "Sugar", quantity: "0.5 cup" }
    ],
    steps: [ { description: "Mix ingredients." } ],
    created: 2025-10-19T05:16:30.278Z,
    promptHistory: []
  }
]
--- End Test: createVersion successful ---
----- output end -----
  createVersion - successfully creates a new recipe version ... ok (111ms)
  createVersion - fails with duplicate versionNum for the same recipe ...
------- output -------
--- Test: createVersion duplicate versionNum ---
createVersion duplicate result: { error: "Version number '1.0' already exists for this recipe." }
--- End Test: createVersion duplicate versionNum ---
----- output end -----
  createVersion - fails with duplicate versionNum for the same recipe ... ok (20ms)
  createVersion - fails with invalid inputs ...
------- output -------
--- Test: createVersion invalid inputs ---
--- End Test: createVersion invalid inputs ---
----- output end -----
  createVersion - fails with invalid inputs ... ok (18ms)
  deleteVersion - successfully deletes a version by its author ...
------- output -------
--- Test: deleteVersion successful ---
Version created for deletion: 0199fae5-d565-7e48-8429-21e2a9418949
deleteVersion result: {}
Fetched version after deletion: []
--- End Test: deleteVersion successful ---
----- output end -----
  deleteVersion - successfully deletes a version by its author ... ok (90ms)
  deleteVersion - fails if requester is not the author ...
------- output -------
--- Test: deleteVersion non-author ---
deleteVersion by non-author result: { error: "Requester is not the author of this version." }
--- End Test: deleteVersion non-author ---
----- output end -----
  deleteVersion - fails if requester is not the author ... ok (83ms)
  draftVersionWithAI - successfully generates a draft output ...
------- output -------
--- Test: draftVersionWithAI successful ---
draftVersionWithAI output: {
  draftId: "0199fae5-d601-7470-970b-3c95e2dcd3e2",
  baseRecipe: "recipe:Brownies",
  requester: "user:Alice",
  goal: "Make it gluten-free.",
  ingredients: [
    { name: "Flour", quantity: "2 cups" },
    { name: "Sugar", quantity: "1 cup" },
    { name: "Eggs", quantity: "2 large" }
  ],
  steps: [
    { description: "Preheat oven to 350F.", duration: 10 },
    { description: "Mix dry ingredients.", duration: 5 },
    {
      description: "Add wet ingredients to dry and combine.",
      duration: 5
    },
    { description: "Bake for 30 minutes.", duration: 30 }
  ],
  notes: 'AI-generated draft based on goal: "Make it gluten-free.".',
  confidence: 0.85,
  created: 2025-10-19T05:16:30.593Z,
  expires: 2025-10-20T05:16:30.593Z
}
--- End Test: draftVersionWithAI successful ---
----- output end -----
  draftVersionWithAI - successfully generates a draft output ... ok (1ms)
  draftVersionWithAI - fails with invalid inputs ...
------- output -------
--- Test: draftVersionWithAI invalid inputs ---
--- End Test: draftVersionWithAI invalid inputs ---
----- output end -----
  draftVersionWithAI - fails with invalid inputs ... ok (0ms)
  approveDraft - successfully promotes a draft to a version (simulated sync) ...
------- output -------
--- Test: approveDraft successful (simulated sync) ---
VersionDraft created: 0199fae5-d602-7e74-bff3-80ff277ae912
approveDraft output: {
  newVersionId: "0199fae5-d65b-75fd-b73e-0eb71b9e5a54",
  author: "user:Alice",
  recipe: "recipe:Brownies",
  versionNum: "2.0",
  notes: 'AI-generated draft based on goal: "Add more chocolate.".',
  ingredients: [
    { name: "Flour", quantity: "2 cups" },
    { name: "Sugar", quantity: "1 cup" },
    { name: "Eggs", quantity: "2 large" }
  ],
  steps: [
    { description: "Preheat oven to 350F.", duration: 10 },
    { description: "Mix dry ingredients.", duration: 5 },
    {
      description: "Add wet ingredients to dry and combine.",
      duration: 5
    },
    { description: "Bake for 30 minutes.", duration: 30 }
  ],
  draftToDeleteId: "0199fae5-d602-7e74-bff3-80ff277ae912",
  promptHistoryEntry: {
    promptText: "Add more chocolate.",
    modelName: "SimulatedAIModel",
    timestamp: 2025-10-19T05:16:30.683Z,
    draftId: "0199fae5-d602-7e74-bff3-80ff277ae912",
    status: "Approved"
  }
}
----- output end -----
  approveDraft - successfully promotes a draft to a version (simulated sync) ... FAILED (133ms)
  rejectDraft - successfully rejects a draft (simulated sync) ...
------- output -------
--- Test: rejectDraft successful (simulated sync) ---
VersionDraft created for rejection: 0199fae5-d688-795e-a34d-7334db16c343
rejectDraft output: {
  draftToDeleteId: "0199fae5-d688-795e-a34d-7334db16c343",
  promptHistoryEntry: {
    promptText: "Make it spicier.",
    modelName: "SimulatedAIModel",
    timestamp: 2025-10-19T05:16:30.834Z,
    draftId: "0199fae5-d688-795e-a34d-7334db16c343",
    status: "Rejected"
  }
}
VersionDraft deleted via sync (rejected): 0199fae5-d688-795e-a34d-7334db16c343
--- End Test: rejectDraft successful (simulated sync) ---
----- output end -----
  rejectDraft - successfully rejects a draft (simulated sync) ... ok (163ms)
  Queries - retrieve versions by ID, recipe, and author ...
------- output -------
--- Test: Queries ---
----- output end -----
  Queries - retrieve versions by ID, recipe, and author ... FAILED (195ms)
  Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. ...
------- output -------
--- Trace: Principle Fulfillment ---
Trace Step 2: Manually create initial version (1.0)
Versions after manual 1.0: [ "1.0" ]
Trace Step 3: Draft new version with AI - 'Cut sugar by 20%'
Draft created: 0199fae5-d821-707f-93bc-8b9f2f96ac7b Goal: Cut sugar by 20%.
Trace Step 4: Approve AI draft 1 as new Version 1.1
Approved draft promoted to Version: 0199fae5-d859-7257-9961-4bd02be99b6c
Versions after approving 1.1: [ "1.0", "1.1" ]
Trace Step 5: Draft another version with AI - 'Make it vegan'
Second draft created: 0199fae5-d8ba-771c-bf04-e49f93437610 Goal: Make it vegan.
Trace Step 6: Reject AI draft 2
Rejected draft deleted: 0199fae5-d8ba-771c-bf04-e49f93437610
Versions after rejecting 2nd draft: [ "1.0", "1.1" ]
--- End Trace: Principle Fulfillment ---
----- output end -----
  Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. ... ok (316ms)
VersionConcept Lifecycle Tests ... FAILED (due to 2 failed steps) (1s)

 ERRORS 

VersionConcept Lifecycle Tests ... approveDraft - successfully promotes a draft to a version (simulated sync) => ./src/concepts/Version/VersionConcept.test.ts:277:11
error: AssertionError: Values are not equal.


    [Diff] Actual / Expected


    {
-     version: "0199fae5-d670-7f47-8e98-14a07cc74633",
+     version: "0199fae5-d65b-75fd-b73e-0eb71b9e5a54",
    }

  throw new AssertionError(message);
        ^
    at assertEquals (https://jsr.io/@std/assert/1.0.7/equals.ts:51:9)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts:349:7
    at eventLoopTick (ext:core/01_core.js:179:7)
    at async innerWrapped (ext:cli/40_test.js:181:5)
    at async exitSanitizer (ext:cli/40_test.js:97:27)
    at async Object.outerWrapped [as fn] (ext:cli/40_test.js:124:14)
    at async TestContext.step (ext:cli/40_test.js:511:22)
    at async file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts:277:3

VersionConcept Lifecycle Tests ... Queries - retrieve versions by ID, recipe, and author => ./src/concepts/Version/VersionConcept.test.ts:468:11
error: AssertionError: Values are not equal.


    [Diff] Actual / Expected


-   4
+   2

  throw new AssertionError(message);
        ^
    at assertEquals (https://jsr.io/@std/assert/1.0.7/equals.ts:51:9)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts:535:7
    at eventLoopTick (ext:core/01_core.js:179:7)
    at async innerWrapped (ext:cli/40_test.js:181:5)
    at async exitSanitizer (ext:cli/40_test.js:97:27)
    at async Object.outerWrapped [as fn] (ext:cli/40_test.js:124:14)
    at async TestContext.step (ext:cli/40_test.js:511:22)
    at async file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts:468:3

 FAILURES 

VersionConcept Lifecycle Tests ... approveDraft - successfully promotes a draft to a version (simulated sync) => ./src/concepts/Version/VersionConcept.test.ts:277:11
VersionConcept Lifecycle Tests ... Queries - retrieve versions by ID, recipe, and author => ./src/concepts/Version/VersionConcept.test.ts:468:11

FAILED | 0 passed (9 steps) | 1 failed (2 steps) (1s)

error: Test failed
```
## test output 2

```
vivienhuang@H0K79H2RD4 nibble % deno test -A '/Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts'
Check file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts
running 1 test from ./src/concepts/Version/VersionConcept.test.ts
VersionConcept Actions and Queries ...
  Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. ...
------- output -------
--- Trace: Testing the Version concept's principle ---
Principle: Users can create versions manually or use AI to draft one ('make this vegan', 'cut sugar by half', etc.); drafts are reviewed, edited, and either approved or rejected.

--- Sub-trace: Manual Version Creation ---
Action: createVersion(author=user:Alice, recipe=recipe:Brownies, versionNum="1.0", ...)
Effect confirmed: Manual Version 0199fd61-d0e8-7db2-ba2e-ec9d27bc52cf created.
Verification: Manual version created successfully without AI history.

--- Sub-trace: AI-Assisted Version Workflow (Approve) ---
Action: draftVersionWithAI(author=user:Alice, recipe=recipe:Brownies, goal="Cut sugar by half")
Effect confirmed: AI Draft 0199fd61-d131-7714-ac75-13f7e1d01927 generated.
Trace: User reviews AI Draft 0199fd61-d131-7714-ac75-13f7e1d01927, decides to approve.
Action: approveDraft(author=user:Alice, draftId=0199fd61-d131-7714-ac75-13f7e1d01927, recipe=recipe:Brownies, newVersionNum="1.1", ...)
Effect confirmed: Approved AI Draft converted to Version 0199fd61-d145-7fed-8910-e22bf066afed.
----- output end -----
  Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. ... FAILED (156ms)
  createVersion action tests ...
------- output -------

--- Testing createVersion action ---
Action: createVersion(author=0199fd61-d171-7812-9c0b-21faf456db19, recipe=0199fd61-d171-799c-b31c-7291fcffbc82, versionNum="1.0") -> version ID: 0199fd61-d186-7b82-9a7b-6748e210a196
Verification: _getVersionById(0199fd61-d186-7b82-9a7b-6748e210a196) confirmed version details.
Action: createVersion(versionNum="1.0" - duplicate) -> Error: Version number '1.0' already exists for this recipe.
Action: createVersion(author=empty) -> Error: Author ID must be provided.
Action: createVersion(recipe=empty) -> Error: Base recipe ID must be provided.
Action: createVersion(versionNum=empty) -> Error: Version number cannot be empty.
Action: createVersion(ingredients=[]) -> Error: Version must have at least one ingredient.
Action: createVersion(malformed ingredient) -> Error: Each ingredient must have a name and quantity.
----- output end -----
  createVersion action tests ... ok (103ms)
  deleteVersion action tests ...
------- output -------

--- Testing deleteVersion action ---
Setup: Created version 0199fd61-d1eb-7871-9311-65bdd7c1ab89 by 0199fd61-d1d8-7e93-aeec-232d87be04c5 for recipe 0199fd61-d1d8-7f0a-b6d6-e66a954b1336.
Action: deleteVersion(requester=0199fd61-d1d8-7e93-aeec-232d87be04c5, version=0199fd61-d1eb-7871-9311-65bdd7c1ab89) -> Success
Verification: _getVersionById(0199fd61-d1eb-7871-9311-65bdd7c1ab89) confirmed version is gone.
Setup: Created version 0199fd61-d254-7cdd-9368-47fcb1594073 by 0199fd61-d241-7643-acdc-3f679c93beaf for recipe 0199fd61-d241-7191-ba07-fcdd2c391392.
Action: deleteVersion(requester=0199fd61-d268-7bab-bf21-b15ea336141b, version=0199fd61-d254-7cdd-9368-47fcb1594073) -> Error: Requester is not the author of this version.
Verification: _getVersionById(0199fd61-d254-7cdd-9368-47fcb1594073) confirmed version still exists.
Action: deleteVersion(version=nonExistent) -> Error: Version with ID 0199fd61-d28c-7460-9668-7e5777fd62e5 not found.
Action: deleteVersion(requester=empty) -> Error: Requester ID must be provided.
----- output end -----
  deleteVersion action tests ... ok (200ms)
  draftVersionWithAI action tests ...
------- output -------

--- Testing draftVersionWithAI action ---
----- output end -----
  draftVersionWithAI action tests ... FAILED (1ms)
  approveDraft action tests ...
------- output -------

--- Testing approveDraft action ---
Action: approveDraft(...) -> New Version ID: 0199fd61-d2b4-7725-a696-7439f9a802fb, Draft to delete: 0199fd61-d2a1-710a-988c-ed4038b32f56
Setup: Created version 2.1 for recipe 0199fd61-d2a1-78d8-919a-c5a4ebc1e0a9.
Action: approveDraft(newVersionNum="2.1" - duplicate) -> Error: Version number '2.1' already exists for this recipe.
Action: approveDraft(author=empty) -> Error: Author ID must be provided.
----- output end -----
  approveDraft action tests ... FAILED (159ms)
  rejectDraft action tests ...
------- output -------

--- Testing rejectDraft action ---
Action: rejectDraft(...) -> Draft to delete: 0199fd61-d341-7f69-b4f3-5caacdef2a93, Status: Rejected
Action: rejectDraft(author=empty) -> Error: Author ID must be provided.
Action: rejectDraft(goal=empty) -> Error: Goal must be provided for logging.
----- output end -----
  rejectDraft action tests ... ok (0ms)
  Query methods tests ...
------- output -------

--- Testing Query Methods ---
Setup: Created versions: 0199fd61-d3cd-7c6e-a268-ed90cc95d0bf (R_A, A_1), 0199fd61-d3ff-725a-932a-3451d5faa5e9 (R_A, A_1), 0199fd61-d432-7da1-82fc-b91094319b24 (R_B, A_2).
Query: _getVersionById(0199fd61-d3cd-7c6e-a268-ed90cc95d0bf) -> Found version 1.0.
Query: _getVersionById(0199fd61-d3ff-725a-932a-3451d5faa5e9) -> Found version 1.1 with prompt history.
Query: _getVersionById(nonExistent) -> Empty array (correct).
Query: _listVersionsByRecipe(0199fd61-d3a4-79ba-9b63-8b2f13a755d1) -> Found 2 versions.
Query: _listVersionsByRecipe(0199fd61-d3a4-7728-a6c7-6b8f1f0e5a42) -> Found 1 version.
Query: _listVersionsByRecipe(recipeWithNoVersions) -> Empty array (correct).
Query: _listVersionsByAuthor(0199fd61-d3a4-76e9-96ea-31957e47c2b1) -> Found 2 versions.
Query: _listVersionsByAuthor(0199fd61-d3a4-7375-b2be-af2cfe2dd6a5) -> Found 1 version.
Query: _listVersionsByAuthor(authorWithNoVersions) -> Empty array (correct).
Query: _getVersionById(empty) -> Error: Version ID must be provided.
Query: _listVersionsByRecipe(empty) -> Error: Recipe ID must be provided.
Query: _listVersionsByAuthor(empty) -> Error: Author ID must be provided.
----- output end -----
  Query methods tests ... ok (436ms)
VersionConcept Actions and Queries ... FAILED (due to 3 failed steps) (1s)

 ERRORS 

VersionConcept Actions and Queries ... Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. => ./src/concepts/Version/VersionConcept.test.ts:58:11
error: AssertionError: Values are not equal: Version ID from approve and create should match.


    [Diff] Actual / Expected


-   0199fd61-d157-7494-b94d-51800f469f30
+   0199fd61-d145-7fed-8910-e22bf066afed


  throw new AssertionError(message);
        ^
    at assertEquals (https://jsr.io/@std/assert/1.0.15/equals.ts:65:9)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts:190:7
    at eventLoopTick (ext:core/01_core.js:179:7)
    at async innerWrapped (ext:cli/40_test.js:181:5)
    at async exitSanitizer (ext:cli/40_test.js:97:27)
    at async Object.outerWrapped [as fn] (ext:cli/40_test.js:124:14)
    at async TestContext.step (ext:cli/40_test.js:511:22)
    at async file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts:58:3

VersionConcept Actions and Queries ... draftVersionWithAI action tests => ./src/concepts/Version/VersionConcept.test.ts:663:11
error: AssertionError: Effects: Simulated vegan change for 'gluten-free' (as per internal mock logic).
    throw new AssertionError(msg);
          ^
    at assert (https://jsr.io/@std/assert/1.0.15/assert.ts:21:11)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts:696:5
    at eventLoopTick (ext:core/01_core.js:179:7)
    at async innerWrapped (ext:cli/40_test.js:181:5)
    at async exitSanitizer (ext:cli/40_test.js:97:27)
    at async Object.outerWrapped [as fn] (ext:cli/40_test.js:124:14)
    at async TestContext.step (ext:cli/40_test.js:511:22)
    at async file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts:663:3

VersionConcept Actions and Queries ... approveDraft action tests => ./src/concepts/Version/VersionConcept.test.ts:772:11
error: AssertionError: Expected actual: "undefined" to not be null or undefined: Requires: draftDetails complete. Effects: Should return error.
    throw new AssertionError(msg);
          ^
    at assertExists (https://jsr.io/@std/assert/1.0.15/exists.ts:29:11)
    at file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts:920:5
    at eventLoopTick (ext:core/01_core.js:179:7)
    at async innerWrapped (ext:cli/40_test.js:181:5)
    at async exitSanitizer (ext:cli/40_test.js:97:27)
    at async Object.outerWrapped [as fn] (ext:cli/40_test.js:124:14)
    at async TestContext.step (ext:cli/40_test.js:511:22)
    at async file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts:772:3

 FAILURES 

VersionConcept Actions and Queries ... Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. => ./src/concepts/Version/VersionConcept.test.ts:58:11
VersionConcept Actions and Queries ... draftVersionWithAI action tests => ./src/concepts/Version/VersionConcept.test.ts:663:11
VersionConcept Actions and Queries ... approveDraft action tests => ./src/concepts/Version/VersionConcept.test.ts:772:11

FAILED | 0 passed (4 steps) | 1 failed (3 steps) (1s)

```


## test output 3

```
vivienhuang@H0K79H2RD4 nibble % deno test -A '/Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts'
Check file:///Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts
running 1 test from ./src/concepts/Version/VersionConcept.test.ts
VersionConcept Actions and Queries ...
  Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. ...
------- output -------
--- Trace: Testing the Version concept's principle ---
Principle: Users can create versions manually or use AI to draft one ('make this vegan', 'cut sugar by half', etc.); drafts are reviewed, edited, and either approved or rejected.

--- Sub-trace: Manual Version Creation ---
Action: createVersion(author=user:Alice, recipe=recipe:Brownies, versionNum="1.0", ...)
Effect confirmed: Manual Version 0199fd69-2a45-762b-b63d-30f6a03997fb created.
Verification: Manual version created successfully without AI history.

--- Sub-trace: AI-Assisted Version Workflow (Approve) ---
Action: draftVersionWithAI(author=user:Alice, recipe=recipe:Brownies, goal="Cut sugar by half")
Effect confirmed: AI Draft 0199fd69-2ac7-7ad3-ac69-a8e42bc41ce6 generated.
Trace: User reviews AI Draft 0199fd69-2ac7-7ad3-ac69-a8e42bc41ce6, decides to approve.
Action: approveDraft(author=user:Alice, draftId=0199fd69-2ac7-7ad3-ac69-a8e42bc41ce6, recipe=recipe:Brownies, newVersionNum="1.1", ...)
Effect confirmed: Approved AI Draft converted to Version 0199fd69-2ad8-759a-bf33-cc2773f8045b.
Simulated Sync: createVersion action called with approved draft details.
Verification: AI-assisted version created with correct details and prompt history.

--- Sub-trace: AI-Assisted Version Workflow (Reject) ---
Action: draftVersionWithAI(author=user:Bob, recipe=recipe:Cookies, goal="Make it super spicy")
Effect confirmed: AI Draft 0199fd69-2b0f-784e-b4a1-1997f662b691 generated for rejection.
Trace: User reviews AI Draft 0199fd69-2b0f-784e-b4a1-1997f662b691, decides to reject.
Action: rejectDraft(author=user:Bob, draftId=0199fd69-2b0f-784e-b4a1-1997f662b691, recipe=recipe:Cookies, goal="Make it super spicy")
Effect confirmed: Rejected AI Draft 0199fd69-2b0f-784e-b4a1-1997f662b691 marked for deletion.
Principle Fulfilled: Both manual and AI-assisted version creation flows are demonstrated, with drafts being either approved into concrete versions with history, or rejected.
----- output end -----
  Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. ... ok (223ms)
  createVersion action tests ...
------- output -------

--- Testing createVersion action ---
Action: createVersion(author=0199fd69-2b0f-7f12-82f2-f41a539f68cd, recipe=0199fd69-2b0f-79f3-8a48-2b71eeae54ad, versionNum="1.0") -> version ID: 0199fd69-2b20-77dc-a320-825ae5b58240
Verification: _getVersionById(0199fd69-2b20-77dc-a320-825ae5b58240) confirmed version details.
Action: createVersion(versionNum="1.0" - duplicate) -> Error: Version number '1.0' already exists for this recipe.
Action: createVersion(author=empty) -> Error: Author ID must be provided.
Action: createVersion(recipe=empty) -> Error: Base recipe ID must be provided.
Action: createVersion(versionNum=empty) -> Error: Version number cannot be empty.
Action: createVersion(ingredients=[]) -> Error: Version must have at least one ingredient.
Action: createVersion(malformed ingredient) -> Error: Each ingredient must have a name and quantity.
----- output end -----
  createVersion action tests ... ok (85ms)
  deleteVersion action tests ...
------- output -------

--- Testing deleteVersion action ---
Setup: Created version 0199fd69-2b76-775b-ac13-2e8413b6d7b7 by 0199fd69-2b64-794c-9baa-aef2f861d7a5 for recipe 0199fd69-2b64-7938-a2e9-c7daf0a74afc.
Action: deleteVersion(requester=0199fd69-2b64-794c-9baa-aef2f861d7a5, version=0199fd69-2b76-775b-ac13-2e8413b6d7b7) -> Success
Verification: _getVersionById(0199fd69-2b76-775b-ac13-2e8413b6d7b7) confirmed version is gone.
Setup: Created version 0199fd69-2c2e-72fc-ba7a-2f35f50aea22 by 0199fd69-2c13-7bbf-909e-7bf98bf1fc0f for recipe 0199fd69-2c13-78b3-9a3c-a6936f8d159a.
Action: deleteVersion(requester=0199fd69-2c41-7d6e-ba80-6fdb8ad8fe37, version=0199fd69-2c2e-72fc-ba7a-2f35f50aea22) -> Error: Requester is not the author of this version.
Verification: _getVersionById(0199fd69-2c2e-72fc-ba7a-2f35f50aea22) confirmed version still exists.
Action: deleteVersion(version=nonExistent) -> Error: Version with ID 0199fd69-2cc0-7fe7-a7b0-114c224acaec not found.
Action: deleteVersion(requester=empty) -> Error: Requester ID must be provided.
----- output end -----
  deleteVersion action tests ... ok (365ms)
  draftVersionWithAI action tests ...
------- output -------

--- Testing draftVersionWithAI action ---
Action: draftVersionWithAI(goal="Make it vegan and add a banana.") -> Draft ID: 0199fd69-2cd1-776f-b725-172795e52d65, Notes: AI-generated draft based on goal: "Make it vegan and add a banana.". Modified to be vegan-friendly by substituting eggs/dairy.
Action: draftVersionWithAI(author=empty) -> Error: Author ID must be provided.
Action: draftVersionWithAI(recipe=empty) -> Error: Base recipe ID must be provided.
Action: draftVersionWithAI(goal=empty) -> Error: Goal cannot be empty.
----- output end -----
  draftVersionWithAI action tests ... ok (0ms)
  approveDraft action tests ...
------- output -------

--- Testing approveDraft action ---
Action: approveDraft(...) -> New Version ID: 0199fd69-2ceb-73f0-9e8d-9dadee91f537, Draft to delete: 0199fd69-2cd1-797d-8fb0-5d1fcc22b712
Setup: Created version 2.1 for recipe 0199fd69-2cd1-724d-8ab3-f6b85ea2e45d.
Action: approveDraft(newVersionNum="2.1" - duplicate) -> Error: Version number '2.1' already exists for this recipe.
Action: approveDraft(author=empty) -> Error: Author ID must be provided.
Action: approveDraft(incomplete draftDetails) -> Error: Incomplete draft details provided.
----- output end -----
  approveDraft action tests ... ok (80ms)
  rejectDraft action tests ...
------- output -------

--- Testing rejectDraft action ---
Action: rejectDraft(...) -> Draft to delete: 0199fd69-2d22-77db-800a-6192a25db1a0, Status: Rejected
Action: rejectDraft(author=empty) -> Error: Author ID must be provided.
Action: rejectDraft(goal=empty) -> Error: Goal must be provided for logging.
----- output end -----
  rejectDraft action tests ... ok (1ms)
  Query methods tests ...
------- output -------

--- Testing Query Methods ---
Setup: Created versions: 0199fd69-2d47-7562-b52a-3849f38c1c03 (R_A, A_1), 0199fd69-2d77-799e-a7d9-382320627b11 (R_A, A_1), 0199fd69-2d9d-7d7b-bec7-eb952f558769 (R_B, A_2).
Query: _getVersionById(0199fd69-2d47-7562-b52a-3849f38c1c03) -> Found version 1.0.
Query: _getVersionById(0199fd69-2d77-799e-a7d9-382320627b11) -> Found version 1.1 with prompt history.
Query: _getVersionById(nonExistent) -> Empty array (correct).
Query: _listVersionsByRecipe(0199fd69-2d36-7676-9db3-6a644725fdea) -> Found 2 versions.
Query: _listVersionsByRecipe(0199fd69-2d36-7dec-b90b-08385aead3bc) -> Found 1 version.
Query: _listVersionsByRecipe(recipeWithNoVersions) -> Empty array (correct).
Query: _listVersionsByAuthor(0199fd69-2d36-7999-a172-9a0385a6ff2c) -> Found 2 versions.
Query: _listVersionsByAuthor(0199fd69-2d36-72d1-9583-9555f0e36313) -> Found 1 version.
Query: _listVersionsByAuthor(authorWithNoVersions) -> Empty array (correct).
Query: _getVersionById(empty) -> Error: Version ID must be provided.
Query: _listVersionsByRecipe(empty) -> Error: Recipe ID must be provided.
Query: _listVersionsByAuthor(empty) -> Error: Author ID must be provided.
----- output end -----
  Query methods tests ... ok (483ms)
VersionConcept Actions and Queries ... ok (2s)

ok | 1 passed (7 steps) | 0 failed (2s)

```