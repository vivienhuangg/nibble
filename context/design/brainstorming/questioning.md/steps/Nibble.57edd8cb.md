---
timestamp: 'Sat Oct 18 2025 16:34:04 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_163404.8e534b69.md]]'
content_id: 57edd8cb357a69bf78cb16fb53ae224f6e3b9ea950b02d09c6b37984949671c5
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

### concept Recipe \[User, Ingredient, Step, Tag]

**purpose** represent a canonical recipe owned by a user, with its core ingredients, steps, and descriptive metadata.\
**principle** a recipe is authored once and remains the stable source for annotations and versions.

**state**

* owner : User
* title : String
* ingredients : List\[Ingredient]
* steps : List\[Step]
* tags : Set\[Tag]

**actions**

* `createRecipe(owner, title, ingredients, steps) → recipe`\
  requires owner exists; title ≠ ""; ingredients and steps well-formed\
  effects adds new recipe with empty tag set
* `addTag(recipe, tag)` requires recipe exists effects tag ∈ recipe.tags
* `removeTag(recipe, tag)` requires tag ∈ recipe.tags effects tag ∉ recipe.tags
* `deleteRecipe(requester, recipe)` requires requester = recipe.owner effects removes recipe and triggers cascade deletion of related Versions and Annotations (via sync)

***

### concept Annotation \[User, Recipe]

**purpose** capture contextual notes on a specific ingredient or step without altering the recipe.\
**principle** annotations enrich understanding while preserving recipe immutability.

**state**

* author : User
* recipe : Recipe
* targetKind : {Ingredient | Step}
* targetIndex : Integer
* text : String
* created : DateTime
* resolved : Boolean

**actions**

* `annotate(author, recipe, targetKind, index, text) → annotation`\
  requires recipe exists; text ≠ ""; 0 ≤ index < |target list|\
  effects adds new unresolved annotation
* `editAnnotation(author, annotation, newText)`\
  requires author = annotation.author effects annotation.text := newText
* `resolveAnnotation(resolver, annotation, resolved)`\
  requires resolver canView annotation.recipe effects annotation.resolved := resolved
* `deleteAnnotation(author, annotation)`\
  requires author = annotation.author effects removes annotation

***

### concept Version \[User, Recipe] (AI-Augmented)

**purpose** capture concrete modifications to a recipe as immutable snapshots — with optional AI assistance that can propose draft versions from natural-language goals.\
**principle** users can create versions manually or use AI to draft one (“make this vegan”, “cut sugar by half”, etc.); drafts are reviewed, edited, and either approved or rejected.

**state**

* baseRecipe : Recipe
* versionNum : Float
* author : User
* notes : String
* ingredients : List\[Ingredient]
* steps : List\[Step]
* created : DateTime
* suggestedDrafts : Set\[VersionDraft] (transient)
* promptHistory : List\[(promptText, modelName, timestamp, draftId, status)]

**actions**

* `createVersion(author, recipe, versionNum, notes, ingredients, steps) → version`\
  requires recipe exists; versionNum unique for recipe\
  effects adds new version linked to recipe
* `deleteVersion(requester, version)`\
  requires requester = version.author ∨ requester = recipe.owner\
  effects removes version
* `draftVersionWithAI(author, recipe, goal, options) → draft`\
  requires recipe exists; goal ≠ ""\
  effects call LLM with (recipe.ingredients, recipe.steps, goal, options) → VersionDraft {ingredients, steps, notes, confidence}; store in suggestedDrafts and promptHistory
* `approveDraft(author, draft, number) → version`\
  requires draft ∈ suggestedDrafts ∧ author = draft.requester ∧ number unused\
  effects promote draft to official Version and remove from suggestedDrafts
* `rejectDraft(author, draft)`\
  requires draft exists ∧ author = draft.requester\
  effects remove draft from suggestedDrafts and log status “rejected”

***

### concept Notebook \[User, Recipe]

**purpose** organize shared collections of recipes and manage collaborative access.\
**principle** membership defines access; shared recipes remain editable only by owners but viewable by all members.

**state**

* owner : User
* title : String
* members : Set\[User]
* recipes : Set\[Recipe]

**actions**

* `createNotebook(owner, title) → notebook`\
  requires title ≠ "" effects creates new notebook with owner ∈ members
* `inviteMember(owner, notebook, member)` requires owner = notebook.owner effects member ∈ notebook.members
* `removeMember(owner, notebook, member)` requires owner = notebook.owner ∧ member ∈ members effects member ∉ members
* `shareRecipe(sharer, recipe, notebook)` requires sharer = recipe.owner ∨ sharer ∈ notebook.members effects recipe ∈ notebook.recipes
* `unshareRecipe(requester, recipe, notebook)` requires requester = recipe.owner ∨ requester = notebook.owner effects recipe ∉ notebook.recipes

***

## Synchronizations

| **Sync** | **Trigger** | **Effect** |
|-----------|-------------|------------|
| Recipe Sharing → Access | when `shareRecipe` adds recipe to notebook | all notebook.members gain view permission to recipe, versions, annotations |
| Notify on New Version | when `createVersion` creates version and recipe ∈ notebook.recipes | notify members (except author) with (recipe, versionNum, notes) |
| Cascade Deletes | when `deleteRecipe` removes recipe | delete related Versions and Annotations; unshare from notebooks |
| Guard Annotation Indices | when `createVersion` runs | annotations keep ref to base recipe; UI may show drift |
| Member Access | when `inviteMember` adds member | new member can view all existing and future recipes in the notebook |

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
|----------------|-------------|--------------------|
| **Ingredient Drift** | prevent unrelated substitutions | overlap < 70% → `IngredientDriftError` |
| **Orphan References** | ensure step ↔ ingredient consistency | missing token match → `OrphanReferenceError` |
| **Quantity & Unit Sanity** | block extreme or invalid quantities | bound checks + whitelist → `QuantityOutOfRangeError` |

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

* **Separation of Concerns** - Recipe, Annotation, Version, Notebook are independent concepts.
* **Access Control** - governed through Notebook membership and syncs.
* **AI Augmentation** - extends Version without breaking concept purity: manual workflow still works offline.
* **Future Implementation** - Deno (TypeScript) + MongoDB for persistence; LLM calls via Context tool (Gemini).
* **Educational Goal** - showcase incremental LLM-assisted design aligned with 6.1040’s principles of reflection and modularity.

***
