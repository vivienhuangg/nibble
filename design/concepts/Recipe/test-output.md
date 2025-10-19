## test output 1

`vivienhuang@H0K79H2RD4 nibble % deno test '/Users/vivienhuang/6.1040/nibble/src/concepts/Recipe/RecipeConc`
`ept.test.ts' -A`
`Check file:///Users/vivienhuang/6.1040/nibble/src/concepts/Recipe/RecipeConcept.test.ts`
`running 1 test from ./src/concepts/Recipe/RecipeConcept.test.ts`
`RecipeConcept ...`
  `Principle: A recipe is authored once and remains the stable source. ...`
`------- output -------`
`--- Trace: Testing the Recipe concept's principle ---`
`Principle: A recipe is authored once and remains the stable source for annotations and versions.`
`Action: createRecipe(owner=user:Alice, title="Principle Brownies", ...) -> recipe ID: 0199fa50-f80b-7bc7-a3db-04344b29b6ad`
`Query: _getRecipeById(0199fa50-f80b-7bc7-a3db-04344b29b6ad) -> Verified initial state details.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa50-f80b-7bc7-a3db-04344b29b6ad, newTitle, newDescription, newIngredients, newSteps)`
`Query: _getRecipeById(0199fa50-f80b-7bc7-a3db-04344b29b6ad) -> Verified updated state details.`
`Conclusion: The recipe's identity (ID) remains constant while its content can be modified by the owner, fulfilling its role as a stable, evolving source.`
`----- output end -----`
  `Principle: A recipe is authored once and remains the stable source. ... ok (197ms)`
  `createRecipe action tests ...`
`------- output -------`

`--- Testing createRecipe action ---`
`Action: createRecipe(owner=user:Alice, title="Chocolate Chip Cookies", ...) -> recipe ID: 0199fa50-f8cf-7126-ae0a-51640892d6e2`
`Verification: _getRecipeById(0199fa50-f8cf-7126-ae0a-51640892d6e2) confirmed recipe details and empty tags.`
`Action: createRecipe(owner=empty, title="Invalid Recipe") -> Error: Owner ID must be provided.`
`Action: createRecipe(owner=user:Alice, title=empty, ingredients, steps) -> Error: Recipe title cannot be empty.`
`Action: createRecipe(owner=user:Alice, title="No Ingredients", ingredients=[], steps) -> Error: Recipe must have at least one ingredient.`
`Action: createRecipe(owner=user:Alice, title="No Steps", ingredients, steps=[]) -> Error: Recipe must have at least one step.`
`Action: createRecipe(owner=user:Alice, title="Malformed Ingredient", ingredients=[{name:'Salt', quantity:''}], steps) -> Error: Each ingredient must have a name and quantity.`
`----- output end -----`
  `createRecipe action tests ... ok (39ms)`
  `addTag action tests ...`
`------- output -------`

`--- Testing addTag action ---`
`Setup: Created recipe 0199fa50-f8f6-77da-af5c-0e14daf1c425 for tagging tests.`
`Action: addTag(recipe=0199fa50-f8f6-77da-af5c-0e14daf1c425, tag="dessert")`
`Verification: _getRecipeById(0199fa50-f8f6-77da-af5c-0e14daf1c425) confirmed 'dessert' tag added.`
`Action: addTag(recipe=0199fa50-f8f6-77da-af5c-0e14daf1c425, tag="easy")`
`Verification: _getRecipeById(0199fa50-f8f6-77da-af5c-0e14daf1c425) confirmed 'easy' tag added.`
`Action: addTag(recipe=0199fa50-f8f6-77da-af5c-0e14daf1c425, tag="dessert") (again)`
`Verification: _getRecipeById(0199fa50-f8f6-77da-af5c-0e14daf1c425) confirmed tag count remains 2.`
`Action: addTag(recipe=nonExistentRecipe, tag="nonexistent") -> Error: Recipe not found.`
`Action: addTag(recipe=0199fa50-f8f6-77da-af5c-0e14daf1c425, tag=empty) -> Error: Tag cannot be empty.`
`----- output end -----`
  `addTag action tests ... ok (166ms)`
  `removeTag action tests ...`
`------- output -------`

`--- Testing removeTag action ---`
`Setup: Created recipe 0199fa50-f99d-7a98-9288-90b50115ebcd with tags 'healthy', 'lunch'.`
`Action: removeTag(recipe=0199fa50-f99d-7a98-9288-90b50115ebcd, tag="healthy")`
`Verification: _getRecipeById(0199fa50-f99d-7a98-9288-90b50115ebcd) confirmed 'healthy' tag removed.`
`Action: removeTag(recipe=0199fa50-f99d-7a98-9288-90b50115ebcd, tag="dinner") -> Error: Recipe not found or tag is not present on recipe.`
`Verification: _getRecipeById(0199fa50-f99d-7a98-9288-90b50115ebcd) confirmed tag count still 1.`
`Action: removeTag(recipe=nonExistentRecipe, tag="any") -> Error: Recipe not found or tag is not present on recipe.`
`Action: removeTag(recipe=0199fa50-f99d-7a98-9288-90b50115ebcd, tag=empty) -> Error: Tag cannot be empty.`
`----- output end -----`
  `removeTag action tests ... ok (288ms)`
  `deleteRecipe action tests ...`
`------- output -------`

`--- Testing deleteRecipe action ---`
`Setup: Created recipe 0199fa50-fabd-764a-a87d-7fb1002c4408 (owner: user:Alice) and 0199fa50-fad1-7345-97f3-49232601b12d (owner: user:Bob).`
`Action: deleteRecipe(requester=user:Alice, recipe=0199fa50-fabd-764a-a87d-7fb1002c4408)`
`Verification: _getRecipeById(0199fa50-fabd-764a-a87d-7fb1002c4408) confirmed recipe is gone.`
`Action: deleteRecipe(requester=user:Alice, recipe=0199fa50-fad1-7345-97f3-49232601b12d) (non-owner) -> Error: Requester is not the owner of the recipe and cannot delete it.`
`Verification: _getRecipeById(0199fa50-fad1-7345-97f3-49232601b12d) confirmed recipe still exists.`
`Action: deleteRecipe(requester=user:Alice, recipe=nonExistentRecipe) -> Error: Recipe not found.`
`Action: deleteRecipe(requester=empty, recipe=0199fa50-fad1-7345-97f3-49232601b12d) -> Error: Requester ID and Recipe ID must be provided.`
`----- output end -----`
  `deleteRecipe action tests ... ok (151ms)`
  `updateRecipeDetails action tests ...`
`------- output -------`

`--- Testing updateRecipeDetails action ---`
`Setup: Created recipe 0199fa50-fb54-7f3a-a8bc-d2f163db427f (owner: user:Alice). Initial updated: 2025-10-19T02:33:55.284Z`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa50-fb54-7f3a-a8bc-d2f163db427f, newTitle, newDescription)`
`Verification: _getRecipeById(0199fa50-fb54-7f3a-a8bc-d2f163db427f) confirmed title and description updates.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa50-fb54-7f3a-a8bc-d2f163db427f, newIngredients, newSteps)`
`Verification: _getRecipeById(0199fa50-fb54-7f3a-a8bc-d2f163db427f) confirmed ingredients and steps updates.`
`Action: updateRecipeDetails(owner=user:Bob, recipe=0199fa50-fb54-7f3a-a8bc-d2f163db427f, newTitle) (non-owner) -> Error: Provided owner is not the actual owner of the recipe and cannot update it.`
`Verification: _getRecipeById(0199fa50-fb54-7f3a-a8bc-d2f163db427f) confirmed no change after failed non-owner update.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=nonExistentRecipe, newTitle) -> Error: Recipe not found.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa50-fb54-7f3a-a8bc-d2f163db427f, newTitle=empty) -> Error: New title cannot be empty.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa50-fb54-7f3a-a8bc-d2f163db427f, newIngredients=[]) -> Error: New ingredients list cannot be empty.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa50-fb54-7f3a-a8bc-d2f163db427f, newIngredients=[malformed]) -> Error: Each new ingredient must have a name and quantity.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa50-fb54-7f3a-a8bc-d2f163db427f) (no content updates)`
`Verification: _getRecipeById(0199fa50-fb54-7f3a-a8bc-d2f163db427f) confirmed timestamp updated.`
`----- output end -----`
  `updateRecipeDetails action tests ... ok (411ms)`
  `Query methods tests ...`
`------- output -------`

`--- Testing Query Methods ---`
`Setup: Created 3 recipes for query tests: 0199fa50-fcef-7945-ab12-ec813b45a410, 0199fa50-fd15-7341-a28e-519910c19379, 0199fa50-fd5c-702a-ae94-95da3d59653e.`
`Query: _getRecipeById(0199fa50-fcef-7945-ab12-ec813b45a410) -> found recipe: Query Recipe 1.`
`Query: _getRecipeById(nonExistent) -> Error: Recipe not found.`
`----- output end -----`
  `Query methods tests ... FAILED (209ms)`
`RecipeConcept ... FAILED (due to 1 failed step) (2s)`

 `ERRORS` 

`RecipeConcept ... Query methods tests => ./src/concepts/Recipe/RecipeConcept.test.ts:948:11`
`error: AssertionError: Values are not equal: Effects: Should return two recipes for testUser1.`


    `[Diff] Actual / Expected`


-   `7`
+   `2`

  `throw new AssertionError(message);`
        `^`
    `at assertEquals (https://jsr.io/@std/assert/1.0.7/equals.ts:51:9)`
    `at file:///Users/vivienhuang/6.1040/nibble/src/concepts/Recipe/RecipeConcept.test.ts:1036:5`
    `at eventLoopTick (ext:core/01_core.js:179:7)`
    `at async innerWrapped (ext:cli/40_test.js:181:5)`
    `at async exitSanitizer (ext:cli/40_test.js:97:27)`
    `at async Object.outerWrapped [as fn] (ext:cli/40_test.js:124:14)`
    `at async TestContext.step (ext:cli/40_test.js:511:22)`
    `at async file:///Users/vivienhuang/6.1040/nibble/src/concepts/Recipe/RecipeConcept.test.ts:948:3`

 `FAILURES` 

`RecipeConcept ... Query methods tests => ./src/concepts/Recipe/RecipeConcept.test.ts:948:11`

`FAILED | 0 passed (6 steps) | 1 failed (1 step) (2s)`

`error: Test failed`
## test output 2

`vivienhuang@H0K79H2RD4 nibble % deno test '/Users/vivienhuang/6.1040/nibble/src/concepts/Recipe/RecipeConcept.test.ts' -A`
`Check file:///Users/vivienhuang/6.1040/nibble/src/concepts/Recipe/RecipeConcept.test.ts`
`running 1 test from ./src/concepts/Recipe/RecipeConcept.test.ts`
`RecipeConcept ...`
  `Principle: A recipe is authored once and remains the stable source. ...`
`------- output -------`
`--- Trace: Testing the Recipe concept's principle ---`
`Principle: A recipe is authored once and remains the stable source for annotations and versions.`
`Action: createRecipe(owner=user:Alice, title="Principle Brownies", ...) -> recipe ID: 0199fa51-d39a-7767-8c38-dae7f24ae57f`
`Query: _getRecipeById(0199fa51-d39a-7767-8c38-dae7f24ae57f) -> Verified initial state details.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa51-d39a-7767-8c38-dae7f24ae57f, newTitle, newDescription, newIngredients, newSteps)`
`Query: _getRecipeById(0199fa51-d39a-7767-8c38-dae7f24ae57f) -> Verified updated state details.`
`Conclusion: The recipe's identity (ID) remains constant while its content can be modified by the owner, fulfilling its role as a stable, evolving source.`
`----- output end -----`
  `Principle: A recipe is authored once and remains the stable source. ... ok (148ms)`
  `createRecipe action tests ...`
`------- output -------`

`--- Testing createRecipe action ---`
`Action: createRecipe(owner=user:Alice, title="Chocolate Chip Cookies", ...) -> recipe ID: 0199fa51-d42d-76d2-9406-e3ed83f00253`
`Verification: _getRecipeById(0199fa51-d42d-76d2-9406-e3ed83f00253) confirmed recipe details and empty tags.`
`Action: createRecipe(owner=empty, title="Invalid Recipe") -> Error: Owner ID must be provided.`
`Action: createRecipe(owner=user:Alice, title=empty, ingredients, steps) -> Error: Recipe title cannot be empty.`
`Action: createRecipe(owner=user:Alice, title="No Ingredients", ingredients=[], steps) -> Error: Recipe must have at least one ingredient.`
`Action: createRecipe(owner=user:Alice, title="No Steps", ingredients, steps=[]) -> Error: Recipe must have at least one step.`
`Action: createRecipe(owner=user:Alice, title="Malformed Ingredient", ingredients=[{name:'Salt', quantity:''}], steps) -> Error: Each ingredient must have a name and quantity.`
`----- output end -----`
  `createRecipe action tests ... ok (39ms)`
  `addTag action tests ...`
`------- output -------`

`--- Testing addTag action ---`
`Setup: Created recipe 0199fa51-d454-74fb-a2ee-1ec1b304ab37 for tagging tests.`
`Action: addTag(recipe=0199fa51-d454-74fb-a2ee-1ec1b304ab37, tag="dessert")`
`Verification: _getRecipeById(0199fa51-d454-74fb-a2ee-1ec1b304ab37) confirmed 'dessert' tag added.`
`Action: addTag(recipe=0199fa51-d454-74fb-a2ee-1ec1b304ab37, tag="easy")`
`Verification: _getRecipeById(0199fa51-d454-74fb-a2ee-1ec1b304ab37) confirmed 'easy' tag added.`
`Action: addTag(recipe=0199fa51-d454-74fb-a2ee-1ec1b304ab37, tag="dessert") (again)`
`Verification: _getRecipeById(0199fa51-d454-74fb-a2ee-1ec1b304ab37) confirmed tag count remains 2.`
`Action: addTag(recipe=nonExistentRecipe, tag="nonexistent") -> Error: Recipe not found.`
`Action: addTag(recipe=0199fa51-d454-74fb-a2ee-1ec1b304ab37, tag=empty) -> Error: Tag cannot be empty.`
`----- output end -----`
  `addTag action tests ... ok (206ms)`
  `removeTag action tests ...`
`------- output -------`

`--- Testing removeTag action ---`
`Setup: Created recipe 0199fa51-d523-7473-83e7-ebe621f418b5 with tags 'healthy', 'lunch'.`
`Action: removeTag(recipe=0199fa51-d523-7473-83e7-ebe621f418b5, tag="healthy")`
`Verification: _getRecipeById(0199fa51-d523-7473-83e7-ebe621f418b5) confirmed 'healthy' tag removed.`
`Action: removeTag(recipe=0199fa51-d523-7473-83e7-ebe621f418b5, tag="dinner") -> Error: Recipe not found or tag is not present on recipe.`
`Verification: _getRecipeById(0199fa51-d523-7473-83e7-ebe621f418b5) confirmed tag count still 1.`
`Action: removeTag(recipe=nonExistentRecipe, tag="any") -> Error: Recipe not found or tag is not present on recipe.`
`Action: removeTag(recipe=0199fa51-d523-7473-83e7-ebe621f418b5, tag=empty) -> Error: Tag cannot be empty.`
`----- output end -----`
  `removeTag action tests ... ok (307ms)`
  `deleteRecipe action tests ...`
`------- output -------`

`--- Testing deleteRecipe action ---`
`Setup: Created recipe 0199fa51-d658-73b5-9003-dd34d894ee32 (owner: user:Alice) and 0199fa51-d66f-7f1c-86fe-614177abfdb0 (owner: user:Bob).`
`Action: deleteRecipe(requester=user:Alice, recipe=0199fa51-d658-73b5-9003-dd34d894ee32)`
`Verification: _getRecipeById(0199fa51-d658-73b5-9003-dd34d894ee32) confirmed recipe is gone.`
`Action: deleteRecipe(requester=user:Alice, recipe=0199fa51-d66f-7f1c-86fe-614177abfdb0) (non-owner) -> Error: Requester is not the owner of the recipe and cannot delete it.`
`Verification: _getRecipeById(0199fa51-d66f-7f1c-86fe-614177abfdb0) confirmed recipe still exists.`
`Action: deleteRecipe(requester=user:Alice, recipe=nonExistentRecipe) -> Error: Recipe not found.`
`Action: deleteRecipe(requester=empty, recipe=0199fa51-d66f-7f1c-86fe-614177abfdb0) -> Error: Requester ID and Recipe ID must be provided.`
`----- output end -----`
  `deleteRecipe action tests ... ok (170ms)`
  `updateRecipeDetails action tests ...`
`------- output -------`

`--- Testing updateRecipeDetails action ---`
`Setup: Created recipe 0199fa51-d702-7edb-b3f2-01a211ff176a (owner: user:Alice). Initial updated: 2025-10-19T02:34:51.522Z`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa51-d702-7edb-b3f2-01a211ff176a, newTitle, newDescription)`
`Verification: _getRecipeById(0199fa51-d702-7edb-b3f2-01a211ff176a) confirmed title and description updates.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa51-d702-7edb-b3f2-01a211ff176a, newIngredients, newSteps)`
`Verification: _getRecipeById(0199fa51-d702-7edb-b3f2-01a211ff176a) confirmed ingredients and steps updates.`
`Action: updateRecipeDetails(owner=user:Bob, recipe=0199fa51-d702-7edb-b3f2-01a211ff176a, newTitle) (non-owner) -> Error: Provided owner is not the actual owner of the recipe and cannot update it.`
`Verification: _getRecipeById(0199fa51-d702-7edb-b3f2-01a211ff176a) confirmed no change after failed non-owner update.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=nonExistentRecipe, newTitle) -> Error: Recipe not found.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa51-d702-7edb-b3f2-01a211ff176a, newTitle=empty) -> Error: New title cannot be empty.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa51-d702-7edb-b3f2-01a211ff176a, newIngredients=[]) -> Error: New ingredients list cannot be empty.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa51-d702-7edb-b3f2-01a211ff176a, newIngredients=[malformed]) -> Error: Each new ingredient must have a name and quantity.`
`Action: updateRecipeDetails(owner=user:Alice, recipe=0199fa51-d702-7edb-b3f2-01a211ff176a) (no content updates)`
`Verification: _getRecipeById(0199fa51-d702-7edb-b3f2-01a211ff176a) confirmed timestamp updated.`
`----- output end -----`
  `updateRecipeDetails action tests ... ok (504ms)`
  `Query methods tests ...`
`------- output -------`

`--- Testing Query Methods ---`
`Setup: Created 3 recipes for query tests: 0199fa51-d915-7615-8125-d452b626da76, 0199fa51-d959-7961-b966-a7d8d776a05a, 0199fa51-d9ee-7883-8b1b-84baff4fb30f.`
`Query: _getRecipeById(0199fa51-d915-7615-8125-d452b626da76) -> found recipe: Query Recipe 1.`
`Query: _getRecipeById(nonExistent) -> Error: Recipe not found.`
`Query: _listRecipesByOwner(user:Alice) -> found 2 recipes.`
`Query: _listRecipesByOwner(userWithNoRecipes) -> found 0 recipes.`
`Query: _searchRecipesByTag("dinner") -> found 2 recipes.`
`Query: _searchRecipesByTag("vegan") -> found 0 recipes.`
`Query: _searchRecipesByTag("") -> Error: Tag cannot be empty for search.`
`----- output end -----`
  `Query methods tests ... ok (406ms)`
`RecipeConcept ... ok (2s)`

`ok | 1 passed (7 steps) | 0 failed (2s)`

`vivienhuang@H0K79H2RD4 nibble %` 

## test output 3
