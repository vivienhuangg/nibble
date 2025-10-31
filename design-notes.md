# Nibble Backend - Design Documentation

## Project Overview

Nibble is a collaborative recipe management platform that allows users to create, share, annotate, and modify recipes. The backend implements a concept-based architecture with six core concepts working together to provide rich recipe management functionality.

---

## Major Design Changes Summary

### 1. Removal of Version and VersionDraft Concepts

**What Changed:**

- Completely removed the `Version` and `VersionDraft` concepts from the application
- Deleted approximately 2,170 lines of code across implementation and test files

**Original Design:**

- `Version` concept: Created immutable snapshots of recipe adaptations with AI-assisted versioning
- `VersionDraft` concept: Managed transient AI-generated recipe suggestions before user approval
- These concepts included sophisticated features like:
  - `promptHistory` tracking AI interaction lineage
  - AI-generated recipe modifications via `draftVersionWithAI()`
  - Approval/rejection workflow with `approveDraft()` and `rejectDraft()`
  - Automatic expiration of drafts after 24 hours

**Why Changed:**
The Version/VersionDraft concepts added significant complexity for a feature that was not essential to the core MVP. For frontend integration, the simpler fork-based recipe modification workflow proved more practical and user-friendly.

---

### 2. Integration of AI Features Directly into Recipe Concept

**What Changed:**

- Moved AI recipe modification capabilities directly into `RecipeConcept`
- Added two new actions to `RecipeConcept`:
  - `draftRecipeWithAI()`: Generates AI-suggested recipe modifications
  - `applyDraft()`: Applies approved AI modifications to the recipe

**Implementation Details:**

The `draftRecipeWithAI()` action:

- Takes a recipe and a user goal (e.g., "make this vegan", "reduce sugar by half")
- Calls the Gemini AI API with structured prompting
- Returns a temporary draft with suggested ingredients, steps, notes, and confidence score
- Draft expires after 24 hours (ephemeral state)

The `applyDraft()` action:

- Validates that the requester is the recipe owner
- Applies the AI-suggested ingredients and steps to the recipe
- Appends AI modification notes to the recipe description
- Updates the recipe's timestamp

**Architectural Simplification:**
Instead of complex concept synchronization between Recipe, Version, and VersionDraft concepts, AI features are now self-contained within Recipe with a simpler, more direct workflow.

---

### 3. Simplified Recipe Modification Model

**What Changed:**

- Pivoted from an immutable versioning model to a mutable recipe model with forking
- Recipe modifications now update recipes in-place rather than creating new versions
- Added `forkedFrom` field to track recipe genealogy

**New Workflow:**

1. User finds a recipe they want to modify
2. User can either:
   - Fork the recipe (creating a new recipe with `forkedFrom` link)
   - Request AI assistance with `draftRecipeWithAI()`
3. If using AI, user reviews the draft and can apply it with `applyDraft()`
4. Original recipe can be modified directly by its owner

**Benefits:**

- More intuitive for users (similar to GitHub forks)
- Simpler backend architecture
- Still maintains recipe lineage through `forkedFrom` tracking
- Reduces database complexity (no version history collections)

---

## Current Architecture

### Core Concepts

**1. User Concept**

- Purpose: Represent individual users with authentication and profiles
- Key Features:
  - User registration and login
  - Profile management (name, username, preferences)
  - User lookup by username or ID

**2. Recipe Concept**

- Purpose: Represent canonical recipes with ingredients, steps, and metadata
- Key Features:
  - Recipe creation and ownership
  - Tag-based categorization and search
  - Recipe forking with genealogy tracking
  - AI-assisted recipe modification (new)
  - Direct recipe updates by owner

**3. Annotation Concept**

- Purpose: Capture contextual notes on specific ingredients or steps
- Key Features:
  - Target-specific annotations (ingredient or step)
  - Author-based editing and deletion
  - Resolution status tracking
  - Recipe-based annotation queries

**4. Notebook Concept**

- Purpose: Organize shared collections of recipes
- Key Features:
  - Collaborative notebook ownership and membership
  - Recipe sharing into notebooks
  - Member invitation and removal
  - Multi-notebook recipe organization

**5. Step & Ingredient (Value Objects)**

- Purpose: Represent recipe components as embedded data structures
- Implementation: TypeScript interfaces embedded within Recipe documents
- Not exposed as separate API endpoints

---

## Design Principles Applied

### 1. Concept Self-Containment

Each concept is implemented as an independent module with its own:

- State (MongoDB collection)
- Actions (public methods)
- Queries (prefixed with `_`)
- Type definitions (even if duplicated across concepts)

This ensures modularity and independent deployability.

### 2. Embedded vs. Referenced Entities

- **Embedded**: `Ingredient` and `Step` are stored within Recipe documents for data locality
- **Referenced**: Recipes, Users, Notebooks reference each other by ID

### 3. AI Integration Philosophy

- AI features are capabilities, not core concepts
- Integrated directly into the concept that uses them (Recipe)
- Ephemeral AI-generated data (drafts) handled as return values, not persistent state
- User maintains control with explicit approval step

---

## API Structure

All endpoints follow the pattern: `POST /api/{Concept}/{action}`

**Example endpoints:**

- User: `/api/User/registerUser`, `/api/User/login`
- Recipe: `/api/Recipe/createRecipe`, `/api/Recipe/draftRecipeWithAI`, `/api/Recipe/applyDraft`
- Annotation: `/api/Annotation/annotate`, `/api/Annotation/resolveAnnotation`
- Notebook: `/api/Notebook/createNotebook`, `/api/Notebook/shareRecipe`

Query endpoints (read-only) are prefixed with `_`:

- `/api/Recipe/_getRecipeById`
- `/api/Recipe/_listRecipesByOwner`
- `/api/Notebook/_getNotebooksContainingRecipe`

Full API specification available in [api-spec.md](api-spec.md)

---

## Implementation Notes

### Technology Stack

- **Runtime**: Deno
- **Database**: MongoDB Atlas
- **AI Integration**: Google Gemini API
- **Testing**: Deno test framework

### Key Implementation Decisions

**1. Recipe Genealogy**

- Recipes can track their origin via `forkedFrom: RecipeId`
- Enables fork count queries and fork listing
- Maintains recipe evolution history without full versioning

**2. AI Draft Lifecycle**

- AI drafts are returned as structured data, not persisted
- 24-hour expiration communicated to frontend
- Frontend responsible for temporary storage if needed
- Simplifies backend state management

**3. Authorization Patterns**

- Recipe operations: owner-based authorization
- Annotation operations: author can edit/delete, anyone with recipe access can resolve
- Notebook operations: owner manages members, members can share recipes

---

## Testing Strategy

Each concept includes comprehensive test coverage:

- ✅ User: 11 test cases
- ✅ Recipe: 24 test cases (including AI draft tests)
- ✅ Annotation: 10 test cases
- ✅ Notebook: 13 test cases

Tests validate:

- Success paths for all actions
- Error handling and validation
- Authorization checks
- Data integrity constraints

---

## Lessons Learned

### 1. Complexity vs. Practicality

The removal of Version/VersionDraft concepts demonstrates the importance of:

- Starting with MVP features
- Adding complexity only when needed
- Prioritizing frontend integration feasibility

### 2. AI as Enhancement, Not Core Architecture

- AI features work best when integrated into existing concepts
- Avoid creating entire concepts just for AI workflows
- Keep AI interactions transient where possible

### 3. Concept Independence

- Data structure duplication across concepts (Ingredient, Step interfaces) initially seems wasteful
- But it ensures true concept independence and evolutionary flexibility
- Each concept can modify its internal structures without breaking others

---

## Future Considerations

If the application scales, the following could be reconsidered:

**1. Version History**

- Could add back a simplified Version concept if users demand history tracking
- Would be simpler than original design: just snapshots without AI integration

**2. Enhanced AI Features**

- Multi-turn AI conversations for recipe refinement
- AI-suggested ingredient substitutions based on dietary restrictions
- Cooking technique explanations

**3. Social Features**

- Recipe ratings and reviews (could be new concepts)
- User following/followers
- Recipe recommendations based on user preferences

---

## References

- Full API Specification: [api-spec.md](api-spec.md)
- Concept Design Changes: [design/brainstorming/all-design-changes.md](design/brainstorming/all-design-changes.md)
- Individual Concept Documentation: `design/concepts/{Concept}/`
