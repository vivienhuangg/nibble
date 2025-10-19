---
timestamp: 'Sun Oct 19 2025 14:02:40 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140240.7ef6a09a.md]]'
content_id: fd4037ebd904421fec1ff89479b60244004ce1d1707c920176efd45fe6c8c3a6
---

# prompt: list only contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.

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
