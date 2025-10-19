---
timestamp: 'Sun Oct 19 2025 12:35:47 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_123547.df8777b2.md]]'
content_id: 56ef8c5604b9f5e7fa4b504a465a45653556013e4db087ab95909c676402aca2
---

# file: /Users/vivienhuang/6.1040/nibble/src/concept\_server.ts

```typescript
import { Hono } from "jsr:@hono/hono";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { walk } from "jsr:@std/fs";
import { toFileUrl } from "jsr:@std/path/to-file-url";
import { getDb } from "@utils/database.ts";

// Parse command-line arguments for port and base URL
const flags = parseArgs(Deno.args, {
  string: ["port", "baseUrl"],
  default: {
    port: "8000",
    baseUrl: "/api",
  },
});

const PORT = parseInt(flags.port, 10);
const BASE_URL = flags.baseUrl;
const CONCEPTS_DIR = "src/concepts";

/**
 * Main server function to initialize DB, load concepts, and start the server.
 */
async function main() {
  const [db] = await getDb();
  const app = new Hono();

  app.get("/", (c) => c.text("Concept Server is running."));

  // --- Dynamic Concept Loading and Routing ---
  console.log(`Scanning for concepts in ./${CONCEPTS_DIR}...`);

  for await (
    const entry of walk(CONCEPTS_DIR, {
      maxDepth: 1,
      includeDirs: true,
      includeFiles: false,
    })
  ) {
    if (entry.path === CONCEPTS_DIR) continue; // Skip the root directory

    const conceptName = entry.name;
    const conceptFilePath = `${entry.path}/${conceptName}Concept.ts`;

    try {
      const modulePath = toFileUrl(Deno.realPathSync(conceptFilePath)).href;
      const module = await import(modulePath);
      const ConceptClass = module.default;

      if (
        typeof ConceptClass !== "function" ||
        !ConceptClass.name.endsWith("Concept")
      ) {
        console.warn(
          `! No valid concept class found in ${conceptFilePath}. Skipping.`,
        );
        continue;
      }

      const instance = new ConceptClass(db);
      const conceptApiName = conceptName;
      console.log(
        `- Registering concept: ${conceptName} at ${BASE_URL}/${conceptApiName}`,
      );

      const methodNames = Object.getOwnPropertyNames(
        Object.getPrototypeOf(instance),
      ).filter(
        (name) =>
          name !== "constructor" && typeof instance[name] === "function",
      );

      for (const methodName of methodNames) {
        const actionName = methodName;
        const route = `${BASE_URL}/${conceptApiName}/${actionName}`;

        app.post(route, async (c) => {
          try {
            const body = await c.req.json().catch(() => ({})); // Handle empty body
            const result = await instance[methodName](body);
            return c.json(result);
          } catch (e) {
            console.error(`Error in ${conceptName}.${methodName}:`, e);
            return c.json({ error: "An internal server error occurred." }, 500);
          }
        });
        console.log(`  - Endpoint: POST ${route}`);
      }
    } catch (e) {
      console.error(`! Error loading concept from ${conceptFilePath}:`, e);
    }
  }

  console.log(`\nServer listening on http://localhost:${PORT}`);
  Deno.serve({ port: PORT }, app.fetch);
}

// Run the server
main();

```

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

## test output 3
