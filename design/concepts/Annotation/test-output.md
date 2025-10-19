## test output 1

`Check file:///Users/vivienhuang/6.1040/nibble/src/concepts/Annotation/AnnotationConcept.test.ts`
`running 1 test from ./src/concepts/Annotation/AnnotationConcept.test.ts`
`AnnotationConcept Functionality ...`
`------- output -------`
`--- Starting AnnotationConcept Tests ---`
`----- output end -----`
  `annotate: successfully creates a new annotation ...`
`------- output -------`

`Trace: annotate (success)`
`Attempting to create an annotation for user "user:Alice" on recipe "recipe:MatchaBrownies" (kind: Ingredient, index: 0) with text: "Use less salt, perhaps ½ tsp."`
`Assertion: New annotation successfully created with ID: 0199fa5b-3c1b-755b-9254-824f7916bafb`
`Confirmation: Annotation state verified via _getAnnotationById query.`
`----- output end -----`
  `annotate: successfully creates a new annotation ... ok (75ms)`
  `annotate: returns error for empty annotation text ...`
`------- output -------`

`Trace: annotate (empty text failure)`
`Attempting to create an annotation with empty text for user "user:Alice" on recipe "recipe:MatchaBrownies"`
`Assertion: Correctly returned error for empty text: "Annotation text cannot be empty."`
`----- output end -----`
  `annotate: returns error for empty annotation text ... ok (0ms)`
  `editAnnotation: successfully edits an existing annotation by its author ...`
`------- output -------`

`Trace: editAnnotation (success)`
`Attempting to edit annotation "0199fa5b-3c1b-755b-9254-824f7916bafb" by author "user:Alice" with new text: "Revised note: try ½ cup almond flour instead, for a nuttier flavor."`
`Assertion: editAnnotation returned empty success object indicating success.`
`Confirmation: Annotation text successfully updated in the database.`
`----- output end -----`
  `editAnnotation: successfully edits an existing annotation by its author ... ok (77ms)`
  `editAnnotation: returns error if a non-author attempts to edit ...`
`------- output -------`

`Trace: editAnnotation (non-author failure)`
`Attempting to edit annotation "0199fa5b-3c1b-755b-9254-824f7916bafb" by non-author "user:Bob"`
`Assertion: Correctly returned permission error: "Only the author can edit an annotation."`
`Confirmation: Annotation text was not updated by the unauthorized user.`
`----- output end -----`
  `editAnnotation: returns error if a non-author attempts to edit ... ok (64ms)`
  `editAnnotation: returns error for a non-existent annotation ...`
`------- output -------`

`Trace: editAnnotation (non-existent failure)`
`Attempting to edit non-existent annotation "0199fa5b-3cf5-7aa3-a18d-8c6b63d2ef96" by author "user:Alice"`
`Assertion: Correctly returned error for non-existent annotation: "Annotation not found."`
`----- output end -----`
  `editAnnotation: returns error for a non-existent annotation ... ok (19ms)`
  `editAnnotation: returns error for empty new text ...`
`------- output -------`

`Trace: editAnnotation (empty new text failure)`
`Attempting to edit annotation "0199fa5b-3c1b-755b-9254-824f7916bafb" with empty new text: "  "`
`Assertion: Correctly returned error for empty new text: "New annotation text cannot be empty."`
`----- output end -----`
  `editAnnotation: returns error for empty new text ... ok (0ms)`
  `resolveAnnotation: successfully resolves an annotation ...`
`------- output -------`

`Trace: resolveAnnotation (success)`
`Current state: annotation "0199fa5b-3c1b-755b-9254-824f7916bafb" is resolved=false.`
`Attempting to resolve annotation "0199fa5b-3c1b-755b-9254-824f7916bafb" to 'true' by resolver "user:Alice"`
`Assertion: resolveAnnotation returned empty success object.`
`----- output end -----`
  `resolveAnnotation: successfully resolves an annotation ... ok (81ms)`
  `resolveAnnotation: successfully unresolves an annotation ...`
`------- output -------`

`Trace: resolveAnnotation (unresolve success)`
`Attempting to unresolve annotation "0199fa5b-3c1b-755b-9254-824f7916bafb" to 'false' by resolver "user:Alice"`
`Assertion: resolveAnnotation returned empty success object for unresolve operation.`
`Confirmation: Annotation resolved status updated to false.`
`----- output end -----`
  `resolveAnnotation: successfully unresolves an annotation ... ok (82ms)`
  `resolveAnnotation: returns error for a non-existent annotation ...`
`------- output -------`

`Trace: resolveAnnotation (non-existent failure)`
`Attempting to resolve non-existent annotation "0199fa5b-3dac-78ed-8237-cd98893a11bd" by resolver "user:Alice"`
`Assertion: Correctly returned error for non-existent annotation: "Annotation not found."`
`----- output end -----`
  `resolveAnnotation: returns error for a non-existent annotation ... ok (24ms)`
  `deleteAnnotation: returns error if a non-author attempts to delete ...`
`------- output -------`

`Trace: deleteAnnotation (non-author failure)`
`Attempting to delete annotation "0199fa5b-3c1b-755b-9254-824f7916bafb" by non-author "user:Bob"`
`Assertion: Correctly returned permission error: "Only the author can delete an annotation."`
`Confirmation: Annotation was NOT deleted by the unauthorized user.`
`----- output end -----`
  `deleteAnnotation: returns error if a non-author attempts to delete ... ok (45ms)`
  `deleteAnnotation: returns error for a non-existent annotation ...`
`------- output -------`

`Trace: deleteAnnotation (non-existent failure)`
`Attempting to delete non-existent annotation "0199fa5b-3df0-70d3-997e-3b340a7177c0" by author "user:Alice"`
`Assertion: Correctly returned error for non-existent annotation: "Annotation not found."`
`----- output end -----`
  `deleteAnnotation: returns error for a non-existent annotation ... ok (20ms)`
  `deleteAnnotation: successfully deletes an existing annotation by its author ...`
`------- output -------`

`Trace: deleteAnnotation (success)`
`Attempting to delete annotation "0199fa5b-3c1b-755b-9254-824f7916bafb" by its author "user:Alice"`
`Assertion: deleteAnnotation returned empty success object.`
`----- output end -----`
  `deleteAnnotation: successfully deletes an existing annotation by its author ... FAILED (64ms)`
  `Principle: annotations enrich understanding while preserving recipe immutability. ...`
`------- output -------`

`--- Principle Test: Annotations Enrich Understanding ---`
`The principle states: 'annotations enrich understanding while preserving recipe immutability.'`
`This test demonstrates the first part (enrich understanding) by creating and retrieving annotations,`
`and confirms the second part (preserving immutability) by noting the Annotation concept's lack of recipe modification actions.`
`Simulating annotations for a conceptual recipe "0199fa5b-3e44-7efb-a6f8-ce36444e745e" by different users.`
`User "user:Alice" annotates an ingredient of recipe "0199fa5b-3e44-7efb-a6f8-ce36444e745e".`
`Created annotation ID: 0199fa5b-3e44-77cc-ba7a-0d1a50705015`
`User "user:Bob" annotates a step of the same recipe "0199fa5b-3e44-7efb-a6f8-ce36444e745e".`
`Created annotation ID: 0199fa5b-3e5a-7c85-8443-d0babbf45d86`
`Querying for all annotations linked to recipe "0199fa5b-3e44-7efb-a6f8-ce36444e745e".`
`Confirmation: Both annotations are successfully associated with the recipe and retrieved, enriching understanding.`
`The 'Annotation' concept's actions (annotate, editAnnotation, resolveAnnotation, deleteAnnotation) do not have any direct effects that would modify the state of the 'Recipe' concept itself (e.g., its title, ingredients list, or steps list). This responsibility lies with the 'Recipe' or 'Version' concepts. Therefore, the Annotation concept upholds the principle of 'preserving recipe immutability' from its perspective.`
`Assertion: The Annotation concept's behavior is consistent with its stated principle.`
`----- output end -----`
  `Principle: annotations enrich understanding while preserving recipe immutability. ... ok (63ms)`
`------- output -------`

`--- AnnotationConcept Tests Complete ---`
`----- output end -----`
`AnnotationConcept Functionality ... FAILED (due to 1 failed step) (1s)`

 `ERRORS` 

`AnnotationConcept Functionality ... deleteAnnotation: successfully deletes an existing annotation by its author => ./src/concepts/Annotation/AnnotationConcept.test.ts:545:11`
`error: AssertionError`
    `throw new AssertionError(msg);`
          `^`
    `at assert (https://jsr.io/@std/assert/1.0.7/assert.ts:21:11)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/Annotation/AnnotationConcept.test.ts:571:7`
    `at eventLoopTick (ext:core/01_core.js:179:7)`
    `at async innerWrapped (ext:cli/40_test.js:181:5)`
    `at async exitSanitizer (ext:cli/40_test.js:97:27)`
    `at async Object.outerWrapped [as fn] (ext:cli/40_test.js:124:14)`
    `at async TestContext.step (ext:cli/40_test.js:511:22)`
    `at async file:///Users/vivienhuang/6.1040/nibble/src/concepts/Annotation/AnnotationConcept.test.ts:545:3`

 `FAILURES` 

`AnnotationConcept Functionality ... deleteAnnotation: successfully deletes an existing annotation by its author => ./src/concepts/Annotation/AnnotationConcept.test.ts:545:11`

`FAILED | 0 passed (12 steps) | 1 failed (1 step) (1s)`

error: Test failed

## test output 2

```
Check file:///Users/vivienhuang/6.1040/nibble/src/concepts/Annotation/AnnotationConcept.test.ts
running 1 test from ./src/concepts/Annotation/AnnotationConcept.test.ts
AnnotationConcept Functionality ...
------- output -------
--- Starting AnnotationConcept Tests ---
----- output end -----
  annotate: successfully creates a new annotation ...
------- output -------

Trace: annotate (success)
Attempting to create an annotation for user "user:Alice" on recipe "recipe:MatchaBrownies" (kind: Ingredient, index: 0) with text: "Use less salt, perhaps ½ tsp."
Assertion: New annotation successfully created with ID: 0199fa62-8736-7133-b5eb-040807947a83
Confirmation: Annotation state verified via `_getAnnotationById` query.
----- output end -----
  annotate: successfully creates a new annotation ... ok (63ms)
  annotate: returns error for empty annotation text ...
------- output -------

Trace: annotate (empty text failure)
Attempting to create an annotation with empty text for user "user:Alice" on recipe "recipe:MatchaBrownies"
Assertion: Correctly returned error for empty text: "Annotation text cannot be empty."
----- output end -----
  annotate: returns error for empty annotation text ... ok (0ms)
  editAnnotation: successfully edits an existing annotation by its author ...
------- output -------

Trace: editAnnotation (success)
Attempting to edit annotation "0199fa62-8736-7133-b5eb-040807947a83" by author "user:Alice" with new text: "Revised note: try ½ cup almond flour instead, for a nuttier flavor."
Assertion: `editAnnotation` returned empty success object indicating success.
Confirmation: Annotation text successfully updated in the database.
----- output end -----
  editAnnotation: successfully edits an existing annotation by its author ... ok (56ms)
  editAnnotation: returns error if a non-author attempts to edit ...
------- output -------

Trace: editAnnotation (non-author failure)
Attempting to edit annotation "0199fa62-8736-7133-b5eb-040807947a83" by non-author "user:Bob"
Assertion: Correctly returned permission error: "Only the author can edit an annotation."
Confirmation: Annotation text was not updated by the unauthorized user.
----- output end -----
  editAnnotation: returns error if a non-author attempts to edit ... ok (50ms)
  editAnnotation: returns error for a non-existent annotation ...
------- output -------

Trace: editAnnotation (non-existent failure)
Attempting to edit non-existent annotation "0199fa62-87e0-7a90-b5be-2138f3ec77cd" by author "user:Alice"
Assertion: Correctly returned error for non-existent annotation: "Annotation not found."
----- output end -----
  editAnnotation: returns error for a non-existent annotation ... ok (17ms)
  editAnnotation: returns error for empty new text ...
------- output -------

Trace: editAnnotation (empty new text failure)
Attempting to edit annotation "0199fa62-8736-7133-b5eb-040807947a83" with empty new text: "  "
Assertion: Correctly returned error for empty new text: "New annotation text cannot be empty."
----- output end -----
  editAnnotation: returns error for empty new text ... ok (0ms)
  resolveAnnotation: successfully resolves an annotation ...
------- output -------

Trace: resolveAnnotation (success)
Current state: annotation "0199fa62-8736-7133-b5eb-040807947a83" is resolved=false.
Attempting to resolve annotation "0199fa62-8736-7133-b5eb-040807947a83" to 'true' by resolver "user:Alice"
Assertion: `resolveAnnotation` returned empty success object.
----- output end -----
  resolveAnnotation: successfully resolves an annotation ... ok (74ms)
  resolveAnnotation: successfully unresolves an annotation ...
------- output -------

Trace: resolveAnnotation (unresolve success)
Attempting to unresolve annotation "0199fa62-8736-7133-b5eb-040807947a83" to 'false' by resolver "user:Alice"
Assertion: `resolveAnnotation` returned empty success object for unresolve operation.
Confirmation: Annotation resolved status updated to false.
----- output end -----
  resolveAnnotation: successfully unresolves an annotation ... ok (62ms)
  resolveAnnotation: returns error for a non-existent annotation ...
------- output -------

Trace: resolveAnnotation (non-existent failure)
Attempting to resolve non-existent annotation "0199fa62-8878-716b-85e9-5910cc4c2d2c" by resolver "user:Alice"
Assertion: Correctly returned error for non-existent annotation: "Annotation not found."
----- output end -----
  resolveAnnotation: returns error for a non-existent annotation ... ok (26ms)
  deleteAnnotation: returns error if a non-author attempts to delete ...
------- output -------

Trace: deleteAnnotation (non-author failure)
Attempting to delete annotation "0199fa62-8736-7133-b5eb-040807947a83" by non-author "user:Bob"
Assertion: Correctly returned permission error: "Only the author can delete an annotation."
Confirmation: Annotation was NOT deleted by the unauthorized user.
----- output end -----
  deleteAnnotation: returns error if a non-author attempts to delete ... ok (35ms)
  deleteAnnotation: returns error for a non-existent annotation ...
------- output -------

Trace: deleteAnnotation (non-existent failure)
Attempting to delete non-existent annotation "0199fa62-88b5-708a-a248-853bba7a37dc" by author "user:Alice"
Assertion: Correctly returned error for non-existent annotation: "Annotation not found."
----- output end -----
  deleteAnnotation: returns error for a non-existent annotation ... ok (17ms)
  deleteAnnotation: successfully deletes an existing annotation by its author ...
------- output -------

Trace: deleteAnnotation (success)
Attempting to delete annotation "0199fa62-8736-7133-b5eb-040807947a83" by its author "user:Alice"
Assertion: `deleteAnnotation` returned empty success object.
----- output end -----
  deleteAnnotation: successfully deletes an existing annotation by its author ... ok (57ms)
  Principle: annotations enrich understanding while preserving recipe immutability. ...
------- output -------

--- Principle Test: Annotations Enrich Understanding ---
The principle states: 'annotations enrich understanding while preserving recipe immutability.'
This test demonstrates the first part (enrich understanding) by creating and retrieving annotations,
and confirms the second part (preserving immutability) by noting the Annotation concept's lack of recipe modification actions.
Simulating annotations for a conceptual recipe "0199fa62-88ff-767b-a857-8e30c781ed62" by different users.
User "user:Alice" annotates an ingredient of recipe "0199fa62-88ff-767b-a857-8e30c781ed62".
Created annotation ID: 0199fa62-88ff-767c-942e-d1022bb32f02
User "user:Bob" annotates a step of the same recipe "0199fa62-88ff-767b-a857-8e30c781ed62".
Created annotation ID: 0199fa62-8912-7a3a-b4d7-26b0b44811e5
Querying for all annotations linked to recipe "0199fa62-88ff-767b-a857-8e30c781ed62".
Confirmation: Both annotations are successfully associated with the recipe and retrieved, enriching understanding.
The 'Annotation' concept's actions (`annotate`, `editAnnotation`, `resolveAnnotation`, `deleteAnnotation`) do not have any direct effects that would modify the state of the 'Recipe' concept itself (e.g., its title, ingredients list, or steps list). This responsibility lies with the 'Recipe' or 'Version' concepts. Therefore, the Annotation concept upholds the principle of 'preserving recipe immutability' from its perspective.
Assertion: The Annotation concept's behavior is consistent with its stated principle.
----- output end -----
  Principle: annotations enrich understanding while preserving recipe immutability. ... ok (56ms)
------- output -------

--- AnnotationConcept Tests Complete ---
----- output end -----
AnnotationConcept Functionality ... ok (1s)

ok | 1 passed (13 steps) | 0 failed (1s)
```

## test output 3
