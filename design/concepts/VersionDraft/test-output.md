## test output 1

```
vivienhuang@H0K79H2RD4 nibble % deno test -A '/Users/vivienhuang/6.1040/nibble/src/concepts/VersionDraft/VersionDraftConcept.test.ts'
running 1 test from ./src/concepts/VersionDraft/VersionDraftConcept.test.ts
VersionDraftConcept ...
  createDraft: satisfies requirements and effects ...
    should successfully create a new draft with valid inputs ...
------- output -------
Action: createDraft
Input: requester=user123, baseRecipe=recipe456, goal=Make it sweeter and easier to follow, ingredients=[{"name":"Sugar","quantity":"1","unit":"cup"},{"name":"Flour","quantity":"2","unit":"cups","notes":"all-purpose"}], steps=[{"description":"Mix dry ingredients.","duration":2},{"description":"Add wet ingredients.","notes":"Slowly"}], notes=Increased sugar and simplified steps., confidence=0.8
Output: id=0199fd90-ac91-70e6-955d-cfdae825d81e
Effect confirmed: Document with ID 0199fd90-ac91-70e6-955d-cfdae825d81e created and matches input data.
----- output end -----
    should successfully create a new draft with valid inputs ... ok (52ms)
    should return an error if baseRecipe ID is missing ...
------- output -------
Action: createDraft (negative test - missing baseRecipe)
Requirement confirmed: Error returned for missing baseRecipe. Output: {"error":"Base recipe ID must be provided."}
----- output end -----
    should return an error if baseRecipe ID is missing ... ok (0ms)
    should return an error if requester ID is missing ...
------- output -------
Action: createDraft (negative test - missing requester)
Requirement confirmed: Error returned for missing requester. Output: {"error":"Requester ID must be provided."}
----- output end -----
    should return an error if requester ID is missing ... ok (0ms)
    should return an error if goal is empty ...
------- output -------
Action: createDraft (negative test - empty goal)
Requirement confirmed: Error returned for empty goal. Output: {"error":"Goal cannot be empty."}
----- output end -----
    should return an error if goal is empty ... ok (0ms)
    should return an error if ingredients is not an array ...
------- output -------
Action: createDraft (negative test - invalid ingredients)
Requirement confirmed: Error returned for invalid ingredients. Output: {"error":"Ingredients and steps must be arrays."}
----- output end -----
    should return an error if ingredients is not an array ... ok (0ms)
    should return an error if steps is not an array ...
------- output -------
Action: createDraft (negative test - invalid steps)
Requirement confirmed: Error returned for invalid steps. Output: {"error":"Ingredients and steps must be arrays."}
----- output end -----
    should return an error if steps is not an array ... ok (0ms)
  createDraft: satisfies requirements and effects ... ok (71ms)
  _getDraftById: satisfies requirements and effects ...
------- output -------
_getDraftById setup: Created draft with ID 0199fd90-acd8-7912-bfac-649ac074d6f7
----- output end -----
    should retrieve an existing draft by ID ...
------- output -------
Action: _getDraftById
Input: id=0199fd90-acd8-7912-bfac-649ac074d6f7
Output: Found draft with ID 0199fd90-acd8-7912-bfac-649ac074d6f7
Effect confirmed: Draft 0199fd90-acd8-7912-bfac-649ac074d6f7 retrieved.
----- output end -----
    should retrieve an existing draft by ID ... ok (17ms)
    should return an empty array if draft ID does not exist ...
------- output -------
Action: _getDraftById (non-existent ID)
Input: id=nonexistent123
Effect confirmed: Empty array returned for non-existent ID. Output: []
----- output end -----
    should return an empty array if draft ID does not exist ... ok (16ms)
    should return an error if draft ID is missing ...
------- output -------
Action: _getDraftById (missing ID)
Requirement confirmed: Error returned for missing draft ID. Output: {"error":"Draft ID must be provided."}
----- output end -----
    should return an error if draft ID is missing ... ok (0ms)
  _getDraftById: satisfies requirements and effects ... ok (73ms)
  _listDraftsByRequester: satisfies requirements and effects ...
------- output -------
_listDraftsByRequester setup: Created drafts: 0199fd90-ad21-7012-9bc9-2f888a068e39, 0199fd90-ad33-7a36-898d-8b13a316e947 for user123; 0199fd90-ad45-78c7-80e2-9931f9068570 for userOther
----- output end -----
    should list all drafts for a specific requester ...
------- output -------
Action: _listDraftsByRequester
Input: requester=user123
Output: Found 2 drafts for user123.
Effect confirmed: All drafts for user123 were listed.
----- output end -----
    should list all drafts for a specific requester ... ok (18ms)
    should return an empty array if requester has no drafts ...
------- output -------
Action: _listDraftsByRequester (no drafts user)
Input: requester=noDraftsUser
Effect confirmed: Empty array returned for requester with no drafts. Output: []
----- output end -----
    should return an empty array if requester has no drafts ... ok (43ms)
    should return an error if requester ID is missing ...
------- output -------
Action: _listDraftsByRequester (missing requester ID)
Requirement confirmed: Error returned for missing requester ID. Output: {"error":"Requester ID must be provided."}
----- output end -----
    should return an error if requester ID is missing ... ok (0ms)
  _listDraftsByRequester: satisfies requirements and effects ... ok (139ms)
  deleteDraft: satisfies requirements and effects ...
------- output -------
deleteDraft setup: Created draft with ID 0199fd90-adad-7d26-9f29-64d39ce22e63
----- output end -----
    should successfully delete an existing draft ...
------- output -------
Action: deleteDraft
Input: id=0199fd90-adad-7d26-9f29-64d39ce22e63
Effect confirmed: Draft 0199fd90-adad-7d26-9f29-64d39ce22e63 was deleted.
----- output end -----
    should successfully delete an existing draft ... ok (34ms)
    should return an error if draft ID does not exist ...
------- output -------
Action: deleteDraft (non-existent ID)
Input: id=nonexistent999
Requirement confirmed: Error returned for non-existent draft. Output: {"error":"Draft with ID nonexistent999 not found."}
----- output end -----
    should return an error if draft ID does not exist ... ok (16ms)
    should return an error if draft ID is missing ...
------- output -------
Action: deleteDraft (missing ID)
Requirement confirmed: Error returned for missing draft ID. Output: {"error":"Draft ID must be provided."}
----- output end -----
    should return an error if draft ID is missing ... ok (0ms)
  deleteDraft: satisfies requirements and effects ... ok (91ms)
  _cleanupExpiredDrafts: satisfies requirements and effects ...
    should remove expired drafts and leave non-expired drafts ...
------- output -------
Action: _cleanupExpiredDrafts
Setup: Inserted expired draft expiredDraft1 (expires: Fri Oct 17 2025 13:42:21 GMT-0400 (Eastern Daylight Time))
Setup: Inserted expires-now draft expiresNowDraft (expires: Sun Oct 19 2025 13:42:21 GMT-0400 (Eastern Daylight Time))
Setup: Inserted non-expired draft nonExpiredDraft1 (expires: Tue Oct 21 2025 13:42:21 GMT-0400 (Eastern Daylight Time))
Cleaned up 2 expired drafts.
Output: Cleanup action completed.
Effect confirmed: Expired draft expiredDraft1 and expires-now draft expiresNowDraft removed, non-expired draft nonExpiredDraft1 remains.
----- output end -----
    should remove expired drafts and leave non-expired drafts ... ok (121ms)
  _cleanupExpiredDrafts: satisfies requirements and effects ... ok (138ms)
  Principle: drafts provide AI assistance without directly altering canonical recipe data ...
------- output -------
Principle verification: The VersionDraftConcept's implementation exclusively interacts with the 'VersionDraft.drafts' collection.
It does not contain any code that would access, modify, or delete documents in any other collection, such as a hypothetical 'Recipe' collection.
The 'baseRecipe' field is an ID reference, treated as opaque by this concept, thus not implying manipulation of a recipe document itself.

--- Trace: Demonstrating the principle 'drafts provide AI assistance without directly altering canonical recipe data' ---
Trace Step 1: User 'traceUser' asks for an AI suggestion for recipe 'traceRecipe' to 'Optimize for quick prep'.
Action: createDraft (id=0199fd90-ae90-72e3-b6d9-6982ab28e4ed). Output: Draft document created in 'VersionDraft.drafts'. Crucially, no changes were made to any 'Recipe' collection.
Trace Step 2: User reviews the newly created draft.
Action: _getDraftById (id=0199fd90-ae90-72e3-b6d9-6982ab28e4ed). Output: Draft data retrieved from 'VersionDraft.drafts'. No 'Recipe' collection was accessed or modified.
Trace Step 3: User decides to discard the draft, as it doesn't fit their needs.
Action: deleteDraft (id=0199fd90-ae90-72e3-b6d9-6982ab28e4ed). Output: Draft removed from 'VersionDraft.drafts'. No 'Recipe' collection was affected.
Principle 'drafts provide AI assistance without directly altering canonical recipe data' is demonstrated and verified.
----- output end -----
  Principle: drafts provide AI assistance without directly altering canonical recipe data ... ok (110ms)
VersionDraftConcept ... FAILED (1s)

 ERRORS 

VersionDraftConcept => ./src/concepts/VersionDraft/VersionDraftConcept.test.ts:52:6
error: Leaks detected:
  - 4 async calls to op_read were started in this test, but never completed.
  - 6 timers were started in this test, but never completed. This is often caused by not calling `clearTimeout`.
  - A TLS connection was opened/accepted during the test, but not closed during the test. Close the TLS connection by calling `tlsConn.close()`.
To get more details where leaks occurred, run again with the --trace-leaks flag.

 FAILURES 

VersionDraftConcept => ./src/concepts/VersionDraft/VersionDraftConcept.test.ts:52:6

FAILED | 0 passed (22 steps) | 1 failed (1s)

error: Test failed
```

## test output 2

```
vivienhuang@H0K79H2RD4 nibble % deno test -A '/Users/vivienhuang/6.1040/nibble/src/concepts/VersionDraft/VersionDraftConcept.test.ts'
Check file:///Users/vivienhuang/6.1040/nibble/src/concepts/VersionDraft/VersionDraftConcept.test.ts
running 1 test from ./src/concepts/VersionDraft/VersionDraftConcept.test.ts
VersionDraftConcept ...
  createDraft: satisfies requirements and effects ...
    should successfully create a new draft with valid inputs ...
------- output -------
Action: createDraft
Input: requester=user123, baseRecipe=recipe456, goal=Make it sweeter and easier to follow, ingredients=[{"name":"Sugar","quantity":"1","unit":"cup"},{"name":"Flour","quantity":"2","unit":"cups","notes":"all-purpose"}], steps=[{"description":"Mix dry ingredients.","duration":2},{"description":"Add wet ingredients.","notes":"Slowly"}], notes=Increased sugar and simplified steps., confidence=0.8
Output: id=0199fd92-fd73-7751-833c-8f1b7bbdabd6
Effect confirmed: Document with ID 0199fd92-fd73-7751-833c-8f1b7bbdabd6 created and matches input data.
----- output end -----
    should successfully create a new draft with valid inputs ... ok (56ms)
    should return an error if baseRecipe ID is missing ...
------- output -------
Action: createDraft (negative test - missing baseRecipe)
Requirement confirmed: Error returned for missing baseRecipe. Output: {"error":"Base recipe ID must be provided."}
----- output end -----
    should return an error if baseRecipe ID is missing ... ok (1ms)
    should return an error if requester ID is missing ...
------- output -------
Action: createDraft (negative test - missing requester)
Requirement confirmed: Error returned for missing requester. Output: {"error":"Requester ID must be provided."}
----- output end -----
    should return an error if requester ID is missing ... ok (0ms)
    should return an error if goal is empty ...
------- output -------
Action: createDraft (negative test - empty goal)
Requirement confirmed: Error returned for empty goal. Output: {"error":"Goal cannot be empty."}
----- output end -----
    should return an error if goal is empty ... ok (0ms)
    should return an error if ingredients is not an array ...
------- output -------
Action: createDraft (negative test - invalid ingredients)
Requirement confirmed: Error returned for invalid ingredients. Output: {"error":"Ingredients and steps must be arrays."}
----- output end -----
    should return an error if ingredients is not an array ... ok (0ms)
    should return an error if steps is not an array ...
------- output -------
Action: createDraft (negative test - invalid steps)
Requirement confirmed: Error returned for invalid steps. Output: {"error":"Ingredients and steps must be arrays."}
----- output end -----
    should return an error if steps is not an array ... ok (0ms)
  createDraft: satisfies requirements and effects ... ok (79ms)
  _getDraftById: satisfies requirements and effects ...
------- output -------
_getDraftById setup: Created draft with ID 0199fd92-fdc0-75a4-b2a8-a975f6c78d0d
----- output end -----
    should retrieve an existing draft by ID ...
------- output -------
Action: _getDraftById
Input: id=0199fd92-fdc0-75a4-b2a8-a975f6c78d0d
Output: Found draft with ID 0199fd92-fdc0-75a4-b2a8-a975f6c78d0d
Effect confirmed: Draft 0199fd92-fdc0-75a4-b2a8-a975f6c78d0d retrieved.
----- output end -----
    should retrieve an existing draft by ID ... ok (19ms)
    should return an empty array if draft ID does not exist ...
------- output -------
Action: _getDraftById (non-existent ID)
Input: id=nonexistent123
Effect confirmed: Empty array returned for non-existent ID. Output: []
----- output end -----
    should return an empty array if draft ID does not exist ... ok (18ms)
    should return an error if draft ID is missing ...
------- output -------
Action: _getDraftById (missing ID)
Requirement confirmed: Error returned for missing draft ID. Output: {"error":"Draft ID must be provided."}
----- output end -----
    should return an error if draft ID is missing ... ok (0ms)
  _getDraftById: satisfies requirements and effects ... ok (81ms)
  _listDraftsByRequester: satisfies requirements and effects ...
------- output -------
_listDraftsByRequester setup: Created drafts: 0199fd92-fe10-7669-8405-f6d28eccbe9e, 0199fd92-fe23-70af-a1fc-a4e563fa5b8b for user123; 0199fd92-fe45-7aa3-bb1a-de6adf6889c9 for userOther
----- output end -----
    should list all drafts for a specific requester ...
------- output -------
Action: _listDraftsByRequester
Input: requester=user123
Output: Found 2 drafts for user123.
Effect confirmed: All drafts for user123 were listed.
----- output end -----
    should list all drafts for a specific requester ... ok (19ms)
    should return an empty array if requester has no drafts ...
------- output -------
Action: _listDraftsByRequester (no drafts user)
Input: requester=noDraftsUser
Effect confirmed: Empty array returned for requester with no drafts. Output: []
----- output end -----
    should return an empty array if requester has no drafts ... ok (17ms)
    should return an error if requester ID is missing ...
------- output -------
Action: _listDraftsByRequester (missing requester ID)
Requirement confirmed: Error returned for missing requester ID. Output: {"error":"Requester ID must be provided."}
----- output end -----
    should return an error if requester ID is missing ... ok (0ms)
  _listDraftsByRequester: satisfies requirements and effects ... ok (136ms)
  deleteDraft: satisfies requirements and effects ...
------- output -------
deleteDraft setup: Created draft with ID 0199fd92-fe99-739b-809c-b71a4660de13
----- output end -----
    should successfully delete an existing draft ...
------- output -------
Action: deleteDraft
Input: id=0199fd92-fe99-739b-809c-b71a4660de13
Effect confirmed: Draft 0199fd92-fe99-739b-809c-b71a4660de13 was deleted.
----- output end -----
    should successfully delete an existing draft ... ok (37ms)
    should return an error if draft ID does not exist ...
------- output -------
Action: deleteDraft (non-existent ID)
Input: id=nonexistent999
Requirement confirmed: Error returned for non-existent draft. Output: {"error":"Draft with ID nonexistent999 not found."}
----- output end -----
    should return an error if draft ID does not exist ... ok (28ms)
    should return an error if draft ID is missing ...
------- output -------
Action: deleteDraft (missing ID)
Requirement confirmed: Error returned for missing draft ID. Output: {"error":"Draft ID must be provided."}
----- output end -----
    should return an error if draft ID is missing ... ok (0ms)
  deleteDraft: satisfies requirements and effects ... ok (108ms)
  _cleanupExpiredDrafts: satisfies requirements and effects ...
    should remove expired drafts and leave non-expired drafts ...
------- output -------
Action: _cleanupExpiredDrafts
Setup: Inserted expired draft expiredDraft1 (expires: Fri Oct 17 2025 13:44:53 GMT-0400 (Eastern Daylight Time))
Setup: Inserted expires-now draft expiresNowDraft (expires: Sun Oct 19 2025 13:44:53 GMT-0400 (Eastern Daylight Time))
Setup: Inserted non-expired draft nonExpiredDraft1 (expires: Tue Oct 21 2025 13:44:53 GMT-0400 (Eastern Daylight Time))
Cleaned up 2 expired drafts.
Output: Cleanup action completed.
Effect confirmed: Expired draft expiredDraft1 and expires-now draft expiresNowDraft removed, non-expired draft nonExpiredDraft1 remains.
----- output end -----
    should remove expired drafts and leave non-expired drafts ... ok (104ms)
  _cleanupExpiredDrafts: satisfies requirements and effects ... ok (124ms)
  Principle: drafts provide AI assistance without directly altering canonical recipe data ...
------- output -------
Principle verification: The VersionDraftConcept's implementation exclusively interacts with the 'VersionDraft.drafts' collection.
It does not contain any code that would access, modify, or delete documents in any other collection, such as a hypothetical 'Recipe' collection.
The 'baseRecipe' field is an ID reference, treated as opaque by this concept, thus not implying manipulation of a recipe document itself.

--- Trace: Demonstrating the principle 'drafts provide AI assistance without directly altering canonical recipe data' ---
Trace Step 1: User 'traceUser' asks for an AI suggestion for recipe 'traceRecipe' to 'Optimize for quick prep'.
Action: createDraft (id=0199fd92-ff83-7a34-82f0-827ddfae2448). Output: Draft document created in 'VersionDraft.drafts'. Crucially, no changes were made to any 'Recipe' collection.
Trace Step 2: User reviews the newly created draft.
Action: _getDraftById (id=0199fd92-ff83-7a34-82f0-827ddfae2448). Output: Draft data retrieved from 'VersionDraft.drafts'. No 'Recipe' collection was accessed or modified.
Trace Step 3: User decides to discard the draft, as it doesn't fit their needs.
Action: deleteDraft (id=0199fd92-ff83-7a34-82f0-827ddfae2448). Output: Draft removed from 'VersionDraft.drafts'. No 'Recipe' collection was affected.
Principle 'drafts provide AI assistance without directly altering canonical recipe data' is demonstrated and verified.
----- output end -----
  Principle: drafts provide AI assistance without directly altering canonical recipe data ... ok (115ms)
VersionDraftConcept ... ok (1s)

ok | 1 passed (22 steps) | 0 failed (1s)

```

## test output 3
