
vivienhuang@H0K79H2RD4 nibble % deno test -A --trace-leaks '/Users/vivienhuang/6.1040/nibble/src/concepts/Version/VersionConcept.test.ts'
running 1 test from ./src/concepts/Version/VersionConcept.test.ts
VersionConcept Lifecycle Tests ...
  createVersion - successfully creates a new recipe version ...
------- output -------
--- Test: createVersion successful ---
createVersion result: { version: "0199fb06-2737-7caf-84bb-7d0268938401" }
Fetched version after creation: [
  {
    _id: "0199fb06-2737-7caf-84bb-7d0268938401",
    baseRecipe: "recipe:Brownies",
    versionNum: "1.0",
    author: "user:Alice",
    notes: "Initial recipe version.",
    ingredients: [
      { name: "Flour", quantity: "1 cup" },
      { name: "Sugar", quantity: "0.5 cup" }
    ],
    steps: [ { description: "Mix ingredients." } ],
    created: 2025-10-19T05:51:48.535Z,
    promptHistory: []
  }
]
--- End Test: createVersion successful ---
----- output end -----
  createVersion - successfully creates a new recipe version ... ok (76ms)
  createVersion - fails with duplicate versionNum for the same recipe ...
------- output -------
--- Test: createVersion duplicate versionNum ---
createVersion duplicate result: { error: "Version number '1.0' already exists for this recipe." }
--- End Test: createVersion duplicate versionNum ---
----- output end -----
  createVersion - fails with duplicate versionNum for the same recipe ... ok (21ms)
  createVersion - fails with invalid inputs ...
------- output -------
--- Test: createVersion invalid inputs ---
--- End Test: createVersion invalid inputs ---
----- output end -----
  createVersion - fails with invalid inputs ... ok (19ms)
  deleteVersion - successfully deletes a version by its author ...
------- output -------
--- Test: deleteVersion successful ---
Version created for deletion: 0199fb06-27a9-7c0c-8de3-c7178d4bcca4
deleteVersion result: {}
Fetched version after deletion: []
--- End Test: deleteVersion successful ---
----- output end -----
  deleteVersion - successfully deletes a version by its author ... ok (97ms)
  deleteVersion - fails if requester is not the author ...
------- output -------
--- Test: deleteVersion non-author ---
deleteVersion by non-author result: { error: "Requester is not the author of this version." }
--- End Test: deleteVersion non-author ---
----- output end -----
  deleteVersion - fails if requester is not the author ... ok (72ms)
  draftVersionWithAI - successfully generates a draft output ...
------- output -------
--- Test: draftVersionWithAI successful ---
draftVersionWithAI output: {
  draftId: "0199fb06-2840-703f-b490-573ea2a96f7c",
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
  created: 2025-10-19T05:51:48.800Z,
  expires: 2025-10-20T05:51:48.800Z
}
--- End Test: draftVersionWithAI successful ---
----- output end -----
  draftVersionWithAI - successfully generates a draft output ... ok (0ms)
  draftVersionWithAI - fails with invalid inputs ...
------- output -------
--- Test: draftVersionWithAI invalid inputs ---
--- End Test: draftVersionWithAI invalid inputs ---
----- output end -----
  draftVersionWithAI - fails with invalid inputs ... ok (1ms)
  approveDraft - successfully promotes a draft to a version (simulated sync) ...
------- output -------
--- Test: approveDraft successful (simulated sync) ---
VersionDraft created: 0199fb06-2841-7928-bd62-70a7ee172794
approveDraft output: {
  newVersionId: "0199fb06-28d3-7032-aeba-af175ae7509d",
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
  draftToDeleteId: "0199fb06-2841-7928-bd62-70a7ee172794",
  promptHistoryEntry: {
    promptText: "Add more chocolate.",
    modelName: "SimulatedAIModel",
    timestamp: 2025-10-19T05:51:48.947Z,
    draftId: "0199fb06-2841-7928-bd62-70a7ee172794",
    status: "Approved"
  }
}
New Version created via sync: 0199fb06-28e9-761f-8a61-e96e4727fb8b
VersionDraft deleted via sync: 0199fb06-2841-7928-bd62-70a7ee172794
Fetched new version: [
  {
    _id: "0199fb06-28e9-761f-8a61-e96e4727fb8b",
    baseRecipe: "recipe:Brownies",
    versionNum: "2.0",
    author: "user:Alice",
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
    created: 2025-10-19T05:51:48.969Z,
    promptHistory: [
      {
        promptText: "Add more chocolate.",
        modelName: "SimulatedAIModel",
        timestamp: 2025-10-19T05:51:48.947Z,
        draftId: "0199fb06-2841-7928-bd62-70a7ee172794",
        status: "Approved"
      }
    ]
  }
]
--- End Test: approveDraft successful (simulated sync) ---
----- output end -----
  approveDraft - successfully promotes a draft to a version (simulated sync) ... ok (303ms)
  rejectDraft - successfully rejects a draft (simulated sync) ...
------- output -------
--- Test: rejectDraft successful (simulated sync) ---
VersionDraft created for rejection: 0199fb06-2970-7f62-b5dc-cddb60ada072
rejectDraft output: {
  draftToDeleteId: "0199fb06-2970-7f62-b5dc-cddb60ada072",
  promptHistoryEntry: {
    promptText: "Make it spicier.",
    modelName: "SimulatedAIModel",
    timestamp: 2025-10-19T05:51:49.145Z,
    draftId: "0199fb06-2970-7f62-b5dc-cddb60ada072",
    status: "Rejected"
  }
}
VersionDraft deleted via sync (rejected): 0199fb06-2970-7f62-b5dc-cddb60ada072
--- End Test: rejectDraft successful (simulated sync) ---
----- output end -----
  rejectDraft - successfully rejects a draft (simulated sync) ... ok (102ms)
  Queries - retrieve versions by ID, recipe, and author ...
------- output -------
--- Test: Queries ---
Actual recipe1 versions: [ "1.0", "1.2", "2.0", "3.0" ]
Alice's versions: [
  "1.0 (recipe:Brownies)",
  "1.0 (recipe:Pizza)",
  "1.2 (recipe:Brownies)",
  "2.0 (recipe:Brownies)",
  "3.0 (recipe:Brownies)"
]
--- End Test: Queries ---
----- output end -----
  Queries - retrieve versions by ID, recipe, and author ... ok (448ms)
  Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. ...
------- output -------
--- Trace: Principle Fulfillment ---
Trace Step 2: Manually create initial version (1.0)
Versions after manual 1.0: [ "1.0" ]
Trace Step 3: Draft new version with AI - 'Cut sugar by 20%'
Draft created: 0199fb06-2bd1-7e75-aabc-e657e1b9dcf4 Goal: Cut sugar by 20%.
Trace Step 4: Approve AI draft 1 as new Version 1.1
Approved draft promoted to Version: 0199fb06-2c0a-7f47-8040-56ff774afdc5
Versions after approving 1.1: [ "1.0", "1.1" ]
Trace Step 5: Draft another version with AI - 'Make it vegan'
Second draft created: 0199fb06-2c81-707a-8424-3ea8f215742d Goal: Make it vegan.
Trace Step 6: Reject AI draft 2
Rejected draft deleted: 0199fb06-2c81-707a-8424-3ea8f215742d
Versions after rejecting 2nd draft: [ "1.0", "1.1" ]
--- End Trace: Principle Fulfillment ---
----- output end -----
  Principle: Users can create versions manually or use AI to draft one; drafts are reviewed, edited, and either approved or rejected. ... ok (435ms)
VersionConcept Lifecycle Tests ... FAILED (2s)

 ERRORS 

VersionConcept Lifecycle Tests => ./src/concepts/Version/VersionConcept.test.ts:21:6
error: Leaks detected:
  - 3 timers were started in this test, but never completed. This is often caused by not calling `clearTimeout`. The operation were started here:
    at Object.queueUserTimer (ext:core/01_core.js:795:9)
    at setTimeout (ext:deno_web/02_timers.js:64:15)
    at Timeout.<computed> (ext:deno_node/internal/timers.mjs:76:7)
    at Timeout.refresh (ext:deno_node/internal/timers.mjs:102:39)
    at TLSSocket.Socket._unrefTimer (node:net:972:19)
    at WriteWrap.onWriteComplete [as oncomplete] (ext:deno_node/internal/stream_base_commons.ts:98:23)
    at TCP.#write (ext:deno_node/internal_binding/stream_wrap.ts:324:11)
    at eventLoopTick (ext:core/01_core.js:218:9)
  - 3 timers were started in this test, but never completed. This is often caused by not calling `clearTimeout`. The operation were started here:
    at Object.queueUserTimer (ext:core/01_core.js:795:9)
    at setTimeout (ext:deno_web/02_timers.js:64:15)
    at Timeout.<computed> (ext:deno_node/internal/timers.mjs:76:7)
    at new Timeout (ext:deno_node/internal/timers.mjs:57:37)
    at setTimeout (node:timers:15:10)
    at new RTTPinger (file:///Users/vivienhuang/Library/Caches/deno/npm/registry.npmjs.org/mongodb/6.10.0/lib/sdam/monitor.js:338:52)
    at checkServer (file:///Users/vivienhuang/Library/Caches/deno/npm/registry.npmjs.org/mongodb/6.10.0/lib/sdam/monitor.js:241:33)
    at MonitorInterval.fn (file:///Users/vivienhuang/Library/Caches/deno/npm/registry.npmjs.org/mongodb/6.10.0/lib/sdam/monitor.js:302:9)
    at Timeout.MonitorInterval._executeAndReschedule [as _onTimeout] (file:///Users/vivienhuang/Library/Caches/deno/npm/registry.npmjs.org/mongodb/6.10.0/lib/sdam/monitor.js:403:18)
    at cb (ext:deno_node/internal/timers.mjs:66:49)
  - 4 async calls to op_read were started in this test, but never completed. The operation were started here:
    at Object.op_read (ext:core/00_infra.js:298:13)
    at TlsConn.read (ext:deno_net/01_net.js:143:26)
    at TCP.#read (ext:deno_node/internal_binding/stream_wrap.ts:250:46)
    at eventLoopTick (ext:core/01_core.js:179:7)
  - A TLS connection was opened/accepted during the test, but not closed during the test. Close the TLS connection by calling `tlsConn.close()`.

 FAILURES 

VersionConcept Lifecycle Tests => ./src/concepts/Version/VersionConcept.test.ts:21:6

FAILED | 0 passed (11 steps) | 1 failed (2s)

error: Test failed