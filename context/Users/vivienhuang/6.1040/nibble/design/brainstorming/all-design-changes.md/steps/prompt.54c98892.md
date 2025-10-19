---
timestamp: 'Sun Oct 19 2025 14:06:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140645.c032c783.md]]'
content_id: 54c9889250df7997ecbfa97cc513344d2b1093383663e3c3ca9d9d2846da46cb
---

# prompt: list only contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.

### concept Recipe \[User, Ingredient, Step, Tag]

**purpose** represent a canonical recipe owned by a user, with its core ingredients, steps, and descriptive metadata.\
**principle** a recipe is authored once and remains the stable source for annotations and versions.

**state**

* id : UUID
* owner : User
* title : String
* description : Optional\[String]
* ingredients : List\[Ingredient]
* steps : List\[Step]
* tags : Set\[String]
* created : DateTime
* updated : DateTime

**actions**

* `createRecipe(owner, title, ingredients, steps, description?) → recipe`\
  requires owner exists; title ≠ ""; ingredients and steps well-formed\
  effects adds new recipe with empty tag set, sets creation/update times
* `addTag(recipe, tag)` requires recipe exists effects tag ∈ recipe.tags
* `removeTag(recipe, tag)` requires tag ∈ recipe.tags effects tag ∉ recipe.tags
* `deleteRecipe(requester, recipe)` requires requester = recipe.owner effects removes recipe and triggers cascade deletion of related Versions and Annotations (via sync)
* `updateRecipeDetails(owner, recipe, newTitle?, newDescription?, newIngredients?, newSteps?)` requires owner = recipe.owner effects updates specified fields and `updated` timestamp.
