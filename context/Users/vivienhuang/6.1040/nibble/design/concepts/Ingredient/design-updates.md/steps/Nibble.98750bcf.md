---
timestamp: 'Sat Oct 18 2025 21:31:13 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_213113.938aed55.md]]'
content_id: 98750bcf360f28e57505e2f05d7835553fb6f00879c909d9833c5bad75866d02
---

# Nibble: Functional and AI-Augmented Design

## Problem Statement

### Domain: Keeping Track of Recipes

Cooking has become an essential part of my daily life, first in a cook-for-yourself dorm and now living off-campus. My inspiration usually comes from friends or social media, but keeping these recipes organized has always been a struggle. Screenshots pile up in my camera roll, TikTok saves get buried, and text messages with recipes quickly disappear. Cooking is both creative and social — yet the messy way I track recipes undermines the joy and repeatability of it.

### Problem: Adding Notes on Recipes

When I adapt a recipe — for example, using less salt or adding more spice — I have no good way to record those tweaks. Existing apps (NYT Cooking, AllRecipes) don’t prioritize personal annotation, and my ad-hoc methods are fragmented. The result: forgotten adjustments, repeated mistakes, and lost opportunities to share reliable versions.

### Stakeholders

* **Home Cooks (Users)** - want to save personalized tweaks to recipes.
* **Friends & Family** - share and reuse annotated versions.
* **Recipe Creators & Publishers** - authors whose work inspires adaptations.

### Evidence & Comparables

* **College Students Cook Often** - frequent cooking supports need for organization.
* **Cooking Education Boosts Skills** - more learning ⇒ more adaptations to remember.
* **Home Cooking and Diet Quality** - better diet outcomes from repeatable home cooking.
* **Food Waste (USDA)** - failed recipes waste food; saved tweaks reduce that.
* **Existing Apps** - NYT Cooking (limited notes), Paprika Manager (poor sharing), AnyList (no versioning), Samsung Food (focus on saving, not evolving).

***

## Application Pitch

### Name

**Nibble**

### Motivation

Cooks constantly tweak recipes but lack an easy way to record and reuse those personal changes.

### Key Features

1. **Inline Recipe Annotations** - highlight ingredients or steps and attach notes (e.g., “use ½ tsp salt”). Keeps insights contextual.
2. **Version Control for Recipes** - save new versions with notes and modifications, creating a living history of adaptations.
3. **Shared Recipe Notebooks** - collaborate with friends or family; everyone benefits from each other’s tweaks.

**Nibble** turns messy screenshots into an evolving, shareable cooking journal.

***

## Concept Design

### concept User

**purpose** represent an individual user within the system, enabling personalization, ownership, and access control.\
**principle** users are the primary actors and owners of content.

**state**

* id : UUID
* name : String
* email : String
* preferences : Map\[String, Any]

**actions**

* `registerUser(name, email, password) → user`
* `login(email, password) → user`
* `updateProfile(user, newName, newEmail, newPreferences)`

### concept Ingredient

**purpose** represent a specific item needed for a recipe.\
**principle** ingredients are foundational building blocks of recipes.

**state**

* name : String
* quantity : String (e.g., "1 cup", "2 tablespoons", "to taste")
* unit : Optional\[String] (e.g., "cup", "tbsp", "g")
* notes : Optional\[String] (e.g., "freshly chopped")

**actions**

* (Generally managed within Recipe/Version actions)

### concept Step

**purpose** represent a single instruction in a recipe.\
**principle** steps guide the cooking process sequentially.

**state**

* description : String
* duration : Optional\[Integer] (in minutes)
* notes : Optional\[String] (e.g., "stir until golden brown")

**actions**

* (Generally managed within Recipe/Version actions)

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
* `addTag(recipe, tag)` requires recipe exists effects tag ∈ recipe.tags
* `removeTag(recipe, tag)` requires tag ∈ recipe.tags effects tag ∉ recipe.tags
* `deleteRecipe(requester, recipe)` requires requester = recipe.owner effects removes recipe and triggers cascade deletion of related Versions and Annotations (via sync)
* `updateRecipeDetails(owner, recipe, newTitle?, newDescription?, newIngredients?, newSteps?)` requires owner = recipe.owner effects updates specified fields and `updated` timestamp.

***

### concept Annotation \[User, Recipe]

**purpose** capture contextual notes on a specific ingredient or step without altering the recipe.\
**principle** annotations enrich understanding while preserving recipe immutability.

**state**

* id : UUID
* author : User
* recipe : Recipe
* targetKind : {Ingredient | Step}
* targetIndex : Integer (index in the respective `ingredients` or `steps` list of the `recipe`)
* text : String
* created : DateTime
* resolved : Boolean

**actions**

* `annotate(author, recipe, targetKind, index, text) → annotation`\
  requires recipe exists; text ≠ ""; 0 ≤ index < |target list| for targetKind\
  effects adds new unresolved annotation, sets `created`
* `editAnnotation(author, annotation, newText)`\
  requires author = annotation.author effects annotation.text := newText
* `resolveAnnotation(resolver, annotation, resolved)`\
  requires resolver canView annotation.recipe effects annotation.resolved := resolved
* `deleteAnnotation(author, annotation)`\
  requires author = annotation.author effects removes annotation

***

### concept VersionDraft \[User, Recipe] (Transient)

**purpose** represent a temporary, AI-generated suggestion for a recipe modification, awaiting user review.\
**principle** drafts provide AI assistance without directly altering canonical recipe data.

**state**

* id : UUID
* requester : User
* baseRecipe : Recipe
* goal : String (the prompt given to the AI)
* ingredients : List\[Ingredient] (proposed changes)
* steps : List\[Step] (proposed changes)
* notes : String (AI-generated summary of changes)
* confidence : Optional\[Float] (AI's confidence in the draft)
* created : DateTime
* expires : DateTime (e.g., 24 hours)

**actions**

* (Managed by `draftVersionWithAI`, `approveDraft`, `rejectDraft` actions on the `Version` concept)

### concept Version \[User, Recipe] (AI-Augmented)

**purpose** capture concrete modifications to a recipe as immutable snapshots — with optional AI assistance that can propose draft versions from natural-language goals.\
**principle** users can create versions manually or use AI to draft one (“make this vegan”, “cut sugar by half”, etc.); drafts are reviewed, edited, and either approved or rejected.

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
  requires requester = version.author ∨ requester = recipe.owner\
  effects removes version
* `draftVersionWithAI(author, recipe, goal, options) → VersionDraft`\
  requires recipe exists; goal ≠ ""\
  effects calls LLM with (recipe.ingredients, recipe.steps, goal, options) → VersionDraft {id, ingredients, steps, notes, confidence}; stores in a transient collection and logs to `promptHistory`
* `approveDraft(author, draft, newVersionNum) → version`\
  requires draft exists ∧ author = draft.requester ∧ newVersionNum unique for recipe\
  effects promotes draft to official Version, removes from transient drafts, logs status "Approved" in `promptHistory`, sets `version.notes` from `draft.notes`.
* `rejectDraft(author, draft)`\
  requires draft exists ∧ author = draft.requester\
  effects removes draft from transient drafts and logs status “Rejected” in `promptHistory`

***

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
  requires title ≠ "" effects creates new notebook with owner ∈ members, sets `created`
* `inviteMember(owner, notebook, member)` requires owner = notebook.owner ∧ member exists effects member ∈ notebook.members
* `removeMember(owner, notebook, member)`      requires owner = notebook.owner ∧ member ∈ notebook.members ∧ member ≠ owner effects member ∉ notebook.members
* `shareRecipe(sharer, recipe, notebook)` requires sharer = recipe.owner ∨ sharer ∈ notebook.members effects recipe ∈ notebook.recipes (if not already present)
* `unshareRecipe(requester, recipe, notebook)`      requires requester = recipe.owner ∨ requester = notebook.owner effects recipe ∉ notebook.recipes
* `deleteNotebook(owner, notebook)` requires owner = notebook.owner effects removes notebook and triggers associated unsharing.

***

## Synchronizations

| **Sync** | **Trigger** | **Effect** |
|:----------|:------------|:-----------|
| Recipe Sharing → Access | when `shareRecipe` adds recipe to notebook | all `notebook.members` gain view permission to `recipe`, its `Versions`, and its `Annotations`. |
| Notify on New Version | when `createVersion` creates version and `recipe` is in `notebook.recipes` | notify `notebook.members` (except author) with (recipe, versionNum, notes) |
| Cascade Deletes | when `deleteRecipe` removes recipe | delete related `Versions` and `Annotations`; unshare from `Notebooks` (remove `recipe` from `notebook.recipes` where applicable) |
| Guard Annotation Indices | when `createVersion` runs (implicitly) | `Annotations` keep reference to base recipe's ingredient/step list; UI should handle potential drift when displaying annotations on newer `Versions` (e.g., highlight if index no longer valid, or attempt to match by content). |
| Member Access | when `inviteMember` adds member | new member can view all existing and future recipes in the `notebook`. |
| Notebook Deletion | when `deleteNotebook` removes notebook | all `recipes` are implicitly unshared from this notebook; notifications may be sent to members. |

***

## AI Version Extension — Prompting & Validation Framework

### Prompt Variants

**Variant A - Strict JSON + Guardrails**\
Return only JSON; omit unknowns; no hallucinated quantities. Used for “make it vegan” (no-ops).

**Variant B - Few-shot + ‘Omit if Absent’**\
Includes tiny before/after examples; if ingredient absent → no change. Used for “cut sugar by half”.

**Variant C - Constrained Additions + Simplicity**\
Allow ≤ 2 new ingredients with justification; merge steps; use beginner-friendly language. Used for “add heat & simplify”.

***

### Validators

| **Validator** | **Purpose** | **Method / Error** |
|:---------------|:------------|:-------------------|
| **Ingredient Drift** | prevent unrelated substitutions | overlap < 70% of ingredient names (ignoring quantity/unit) → `IngredientDriftError` |
| **Orphan References** | ensure step ↔ ingredient consistency | missing token match in new steps for ingredients mentioned, or vice-versa → `OrphanReferenceError` |
| **Quantity & Unit Sanity** | block extreme or invalid quantities | bound checks (e.g., 0 < sugar < 500g) + whitelist of units (e.g., 'cup', 'tbsp', 'g', 'ml') → `QuantityOutOfRangeError` |
| **Semantic Integrity** | check for logical consistency (e.g., "add salt" then "remove salt") | basic NLP checks on sequential steps → `LogicalInconsistencyError` |

***

## Representative AI Test Scenarios

### Scenario 1 - “Make it Vegan”

Goal: *Preserve flavor but remove animal products.*\
Result: model detects already vegan → no change; strict JSON output.\
Outcome: **Pass**, validators clean.

### Scenario 2 - “Cut Sugar by Half”

Goal: *Reduce sugar by 50 % without changing texture.*\
Few-shot variant prevents hallucinated sweeteners.\
Outcome: **Pass**, no new ingredients.

### Scenario 3 - “Add Heat + Simplify for Beginners”

Goal: *Make slightly spicy and simpler.*\
Model adds 1 ingredient (red pepper flakes), simplifies steps.\
Outcome: **Pass**, all validators satisfied.

***

## UI Sketches & Journeys

### Sketch 1 - Cookbook View

Shows multiple notebooks and recipe cards with tags.

### Sketch 2 - Recipe View

Displays title, version info, annotations inline, and share context.

### Sketch 3 - Version History / AI Draft Flow

User presses **Draft with AI**, enters goal prompt, reviews draft, and approves or rejects.\
*(see `version-ai-flow.jpeg`)*

***

## User Journey

1. **Trigger** - Vivien and roommates plan dessert for a potluck; open Nibble.
2. **Browse Cookbook** - In *Roommate Meals* notebook, they find *Matcha Brownies* (tagged *dessert, potluck*).
3. **View Recipe** - They see inline annotations and Version 3.7 “Gluten-Free Version”.
4. **AI Draft Flow** - Vivien presses *Draft with AI*, types “Cut sugar by 20 % for potluck.” LLM returns draft with note explaining change.
5. **Approve Draft** - Vivien reviews and saves as Version 3.8, tagged *potluck hit*.
6. **Outcome** - Roommates share an evolving recipe record: annotations capture insight, versions track changes, AI assists future tweaks.

***

## Notes on Design and Architecture

* **Separation of Concerns** - `Recipe`, `Annotation`, `Version`, `Notebook` are independent concepts, promoting modularity.
* **Access Control** - governed through `Notebook` membership and syncs, ensuring data privacy and sharing capabilities.
* **AI Augmentation** - extends `Version` without breaking concept purity: the manual workflow still works independently. The `VersionDraft` concept helps manage the AI's ephemeral suggestions.
* **Data Retrieval (Queries)** - While explicit "query" actions are not detailed, it is assumed that standard CRUD operations and indexed lookups (e.g., `getRecipeById`, `listRecipesByOwner`, `getAnnotationsForRecipe`) are available based on the defined `state` and `id` attributes.
* **Future Implementation** - Deno (TypeScript) + MongoDB for persistence; LLM calls via Context tool (e.g., Google Gemini, OpenAI API).
* **Educational Goal** - showcase incremental LLM-assisted design aligned with 6.1040’s principles of reflection and modularity.

```
```

### concept Ingredient

**purpose** represent a specific item needed for a recipe.\
**principle** ingredients are foundational building blocks of recipes.

**state**

* name : String
* quantity : String (e.g., "1 cup", "2 tablespoons", "to taste")
* unit : Optional\[String] (e.g., "cup", "tbsp", "g")
* notes : Optional\[String] (e.g., "freshly chopped")

**actions**

* (Generally managed within Recipe/Version actions)
