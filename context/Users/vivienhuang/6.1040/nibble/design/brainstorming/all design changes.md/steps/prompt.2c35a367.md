---
timestamp: 'Sun Oct 19 2025 14:02:40 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140240.7ef6a09a.md]]'
content_id: 2c35a367c0918738b03641526ceb574dab1fb72ae399c91bb618fe002aad2ae9
---

# prompt: list only contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.

### concept Version \[User, Recipe] (AI-Augmented)

**purpose** capture concrete modifications to a recipe as immutable snapshots — with optional AI assistance that can propose draft versions from natural-language goals.\
**principle** users can create versions manually or use AI to draft one ("make this vegan", "cut sugar by half", etc.); drafts are reviewed, edited, and either approved or rejected.

**state**

* id : UUID
* baseRecipe : Recipe
* versionNum : String (e.g., "1.0", "1.1", "2.0") - *changed from Float for clarity and robustness*
* author : User
* notes : String (describing changes from the base recipe or previous version)
* ingredients : List\[Ingredient]
* steps : List\[Step]
* created : DateTime
* promptHistory : List\[(promptText: String, modelName: String, timestamp: DateTime, draftId: UUID, status: {Approved | Rejected | Generated | Failed})]

**actions**

* `createVersion(author, recipe, versionNum, notes, ingredients, steps) → version`\
  requires recipe exists; versionNum unique for recipe (e.g., "1.0", "1.1", "2.0"); ingredients/steps must be well-formed\
  effects adds new version linked to recipe, sets `created`
* `deleteVersion(requester, version)`\
  requires requester = version.author  requester = recipe.owner\
  effects removes version
* `draftVersionWithAI(author, recipe, goal, options) → VersionDraft`\
  requires recipe exists; goal ≠ ""\
  effects calls LLM with (recipe.ingredients, recipe.steps, goal, options) → VersionDraft {id, ingredients, steps, notes, confidence}; stores in a transient collection and logs to `promptHistory`
* `approveDraft(author, draft, newVersionNum) → version`\
  requires draft exists ∧ author = draft.requester ∧ newVersionNum unique for recipe\
  effects promotes draft to official Version, removes from transient drafts, logs status "Approved" in `promptHistory`, sets `version.notes` from `draft.notes`.
* `rejectDraft(author, draft)`\
  requires draft exists ∧ author = draft.requester\
  effects removes draft from transient drafts and logs status "Rejected" in `promptHistory`
