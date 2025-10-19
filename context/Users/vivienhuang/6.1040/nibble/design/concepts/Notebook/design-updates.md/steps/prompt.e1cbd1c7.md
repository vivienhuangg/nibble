---
timestamp: 'Sun Oct 19 2025 13:14:28 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_131428.ac81dbc1.md]]'
content_id: e1cbd1c7f7a37eb7f761c30828a4cb273434cb199a59cd8e4f23a6dccf21edf9
---

# prompt: list any design changes from the concept spec to the implementation and testing.

### concept Notebook \[User, Recipe]

**purpose** organize shared collections of recipes and manage collaborative access.\
**principle** membership defines access; shared recipes remain editable only by owners but viewable by all members.

**state**

* id : UUID
* owner : User
* title : String
* description : Optional\[String]
* members : Set\[User] (Users who can view recipes in this notebook)
* recipes : Set\[Recipe] (Recipes shared into this notebook)
* created : DateTime

**actions**

* `createNotebook(owner, title, description?) → notebook`\
  requires title ≠ "" effects creates new notebook with owner ∈ members, sets `created`
* `inviteMember(owner, notebook, member)` requires owner = notebook.owner ∧ member exists effects member ∈ notebook.members
* `removeMember(owner, notebook, member)`      requires owner = notebook.owner ∧ member ∈ notebook.members ∧ member ≠ owner effects member ∉ notebook.members
* `shareRecipe(sharer, recipe, notebook)` requires sharer = recipe.owner ∨ sharer ∈ notebook.members effects recipe ∈ notebook.recipes (if not already present)
* `unshareRecipe(requester, recipe, notebook)`      requires requester = recipe.owner ∨ requester = notebook.owner effects recipe ∉ notebook.recipes
* `deleteNotebook(owner, notebook)` requires owner = notebook.owner effects removes notebook and triggers associated unsharing.
