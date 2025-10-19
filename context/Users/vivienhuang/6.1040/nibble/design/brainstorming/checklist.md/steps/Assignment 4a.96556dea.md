---
timestamp: 'Sun Oct 19 2025 13:20:00 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_132000.020b5f4c.md]]'
content_id: 96556deaf81d55b9882c125e59bc5111038b29286709775bfe58f1ee900eb850
---

# Assignment 4a: Backend Concept Coding Checklist - Nibble

This checklist guides you through implementing and testing your "Nibble" application's backend concepts, adhering to the principles of incremental development, intentional LLM usage, and reflective practice outlined in the assignment.

**Reference Resources:**

* [Assignment 4a Overview & Philosophy](https://61040-fa25.github.io/assignments/assignment-4a)
* [Implementing Concepts](https://61040-fa25.github.io/assignments/assignment-4a#concept-implementation) (within assignment doc)
* [Concept Testing](https://61040-fa25.github.io/assignments/assignment-4a#concept-testing) (within assignment doc)
* `design/background/implementing-concepts.md`
* `design/background/testing-concepts.md`
* `design/background/concept-design-overview.md` (for reviewing design principles)
* `design/background/llm-best-practices.md` (for effective LLM prompting)
* Your `design/concepts` folder for individual concept specifications.

***

## Part 1: Setup and Exercise 0

These steps ensure your development environment is correctly configured and you are familiar with the `ctx` tool.

* \[ ] **0. Fork and Rename Repository:**
  * \[ ] Fork the `concept_backend` template repo.
  * \[ ] Rename your forked repository to your desired project name ("Nibble").
* \[ ] **1. Install Deno:**
  * \[ ] Install Deno from [deno.com](https://deno.com).
  * \[ ] (VSCode users) Install the Deno [extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).
* \[ ] **2. Compile Context Tool:**
  * \[ ] Run `deno compile -A --output ctx .ctx/context.ts` from the repo root.
* \[ ] **3. Setup Gemini API Key:**
  * \[ ] Copy `.env.template` to `.env`.
  * \[ ] Insert your `GEMINI_API_KEY` into `.env`.
  * \[ ] (Optional) Adjust `GEMINI_MODEL` in `.env` or `./geminiConfig.json` for desired model/parameters.
* \[ ] **4. Setup MongoDB Atlas Cluster:**
  * \[ ] Create a free MongoDB Atlas account.
  * \[ ] Create an M0 free tier cluster.
  * \[ ] Configure IP access (allow all for simplicity during development, or specific IPs).
  * \[ ] Create a database user.
  * \[ ] Get the SRV connection string and add it to `MONGODB_URL` in `.env`.
  * \[ ] Add your desired `DB_NAME` to `.env`.
* \[ ] **5. Install Obsidian (Recommended):**
  * \[ ] Install [Obsidian](https://obsidian.md).
  * \[ ] Confirm Obsidian link settings (Relative path to file, Wikilinks disabled, Detect all file extensions enabled).
* \[ ] **Exercise 0 - Context Tool Familiarization:**
  * \[ ] **0. Note:** Understand that the `context` directory must *never* be modified manually.
  * \[ ] **1. Getting Started:** Complete the `# prompt: Why ... ?` in `design/brainstorming/questioning.md` and run `./ctx prompt design/brainstorming/questioning.md`.
  * \[ ] **2. Including Context:** Drag `concept-design-overview.md` into `design/learning/understanding-concepts.md`, add `@` to the link text, add a `# question: ...`, and run `./ctx prompt design/learning/understanding-concepts.md`.
  * \[ ] **3. Viewing Context:**
    * \[ ] Find the LLM's response in the `context` folder for `design/brainstorming/questioning.md` and link to it in `design/learning/exercise-0.md`.
    * \[ ] Manually edit the response in `design/brainstorming/questioning.md` with your own answer.
    * \[ ] Run `./ctx save design/brainstorming/questioning.md` and link the updated version in `design/learning/exercise-0.md`.
    * \[ ] Use `ctx save` to snapshot `design/learning/exercise-0.md`.
* \[ ] **Confirm Deno Test Setup:**
  * \[ ] Run `deno test -A` from the repo root. Confirm tests run and interact with MongoDB Atlas. (You may delete `src/concepts/LikertSurvey/LikertSurvey.test.ts` to prevent it from running if you don't need it for your project).

***

## Part 2: Implementing and Testing Concepts (Iterative Process for each Concept)

This section outlines the steps to be repeated for *each* concept defined in your "Nibble" application.
**Concepts to Implement:** `User`, `Recipe` (and embedded `Ingredient`/`Step`), `Annotation`, `Version` (managing `VersionDraft`), `Notebook`.

### General Advice for all Concepts:

* **Work incrementally:** Implement and test *one action at a time*.
* **Use LLMs intentionally:** `ctx prompt` for generation, refinement, debugging, or brainstorming.
* **Document every significant step:** Use `ctx save` for manual edits, `ctx prompt` automatically records both before and after versions.
* **Push frequently** to GitHub.
* **Ask for help** on Piazza or office hours when stuck.
* **Error Handling:** For expected errors, return a record `{error: "message"}` instead of throwing an exception. Only throw for truly exceptional, unrecoverable errors.
* **IDs:** Use `ID` type branding and `freshID()` utility for `_id` when inserting new documents.

***

### **For Concept: User**

* \[ ] **2a. Review/Refactor Concept Specification (`design/concepts/User.md`):**
  * \[ ] Ensure `User.md` is fully updated and consistent with your current understanding.
  * \[ ] Check for common flaws: composite objects, conflation, data structure, interdependencies.
  * \[ ] Refine `state` and `actions` syntax if needed (e.g., all arguments/results are primitive or ID, no composite objects).
  * \[ ] (`ctx save design/concepts/User.md` after any manual edits, or if using LLM to refine spec, use `ctx prompt` on a prompt linking to it.)
* \[ ] **2b. Implement Concept (`src/concepts/User/UserConcept.ts`):**
  * \[ ] Create `UserConcept.ts` in `src/concepts/User/`.
  * \[ ] Define `User` and `Preferences` interfaces reflecting `state` (remember `_id: ID`).
  * \[ ] Initialize MongoDB `Collection`s in the constructor.
  * \[ ] Implement `registerUser` action:
    * \[ ] Handle `requires` (e.g., email uniqueness).
    * \[ ] Perform `effects` (insert new user document, set `_id` with `freshID()`, return user ID).
    * \[ ] Return `{error: "message"}` for invalid inputs (e.g., email already exists).
  * \[ ] Implement `login` action:
    * \[ ] Handle `requires` (e.g., valid email and password).
    * \[ ] Perform `effects` (return user ID on success, or error).
  * \[ ] Implement `updateProfile` action:
    * \[ ] Handle `requires` (e.g., `user` ID exists, requester matches user being updated).
    * \[ ] Perform `effects` (update specified fields in the database, return empty object `{}`).
  * \[ ] Add inline JSDoc comments for purpose, state types, and each action (including `signature`, `requires`, and `effects`).
  * \[ ] (`ctx prompt src/concepts/User/UserConcept.ts` or `ctx save src/concepts/User/UserConcept.ts` frequently to capture iterations.)
* \[ ] **2c. Test Concept (`src/concepts/User/UserConcept.test.ts`):**
  * \[ ] Create `UserConcept.test.ts` in `src/concepts/User/`.
  * \[ ] Use `testDb()` to get a clean database instance, and ensure `client.close()` is called in the test.
  * \[ ] **Operational Principle Test:**
    * \[ ] Write a single test sequence covering `registerUser`, `login`, and `updateProfile` actions in a typical flow.
    * \[ ] Ensure legible console output (print action inputs and outputs for clarity).
    * \[ ] (`ctx save test_output/User_principle_trace.md` after running and copy-pasting console output from Deno test runner.)
  * \[ ] **Variant/Edge Case Tests (3-5 scenarios):**
    * \[ ] Test `registerUser` with an existing email (expect error).
    * \[ ] Test `login` with incorrect credentials (expect error).
    * \[ ] Test `updateProfile` with partial updates (e.g., only changing `name`).
    * \[ ] Test `updateProfile` for a non-existent user or by an unauthorized requester (expect error).
    * \[ ] Ensure every action is successfully executed in at least one scenario.
    * \[ ] Use `assertEquals` (from `jsr:@std/assert`) for programmatic checks.
    * \[ ] Ensure legible console output for each scenario.
    * \[ ] (`ctx save test_output/User_variants_trace.md` after running and copy-pasting console output.)
* \[ ] **2d. Document Design Changes (`design/concept_notes/User_design_notes.md`):**
  * \[ ] Create `User_design_notes.md` in `design/concept_notes/`.
  * \[ ] Summarize any changes made to the `User` concept from Assignment 2 (e.g., how `password` handling was simplified, or `preferences` structure).
  * \[ ] Record 1-2 "interesting moments" during implementation/testing with linked snapshots (e.g., an LLM's good/bad code for password hashing, a subtle bug in `updateProfile` logic, a design simplification to `preferences`).

***

### **For Concept: Recipe**

* \[ ] **2a. Review/Refactor Concept Specification (`design/concepts/Recipe.md`):**
  * \[ ] Ensure `Recipe.md` is complete and consistent, especially with `ingredients` (List of `Ingredient` objects) and `steps` (List of `Step` objects) as *embedded documents*.
  * \[ ] `Ingredient` and `Step` are not separate concepts but are defined as interfaces for the embedded types.
  * \[ ] (`ctx save design/concepts/Recipe.md` after any manual edits.)
* \[ ] **2b. Implement Concept (`src/concepts/Recipe/RecipeConcept.ts`):**
  * \[ ] Create `RecipeConcept.ts` in `src/concepts/Recipe/`.
  * \[ ] Define `Ingredient` and `Step` interfaces to represent the structure of embedded documents.
  * \[ ] Initialize MongoDB `Collection` for `recipes`.
  * \[ ] Implement `createRecipe`:
    * \[ ] Validate `owner` (conceptual existence, as `User` is separate), `title` not empty.
    * \[ ] Ensure `ingredients` and `steps` lists are well-formed (even if just checking they are arrays).
    * \[ ] Set `created` and `updated` timestamps, initialize `tags` as an empty set.
  * \[ ] Implement `addTag`, `removeTag`:
    * \[ ] Validate `recipe` exists.
    * \[ ] Correctly add/remove tags from the `tags` array field.
  * \[ ] Implement `deleteRecipe`:
    * \[ ] Validate `requester` ownership.
    * \[ ] Remove the recipe document. (Note: cascade deletions for `Versions` and `Annotations` will be handled by synchronizations in a later assignment; here, only remove the recipe itself).
  * \[ ] Implement `updateRecipeDetails`:
    * \[ ] Validate `owner` ownership.
    * \[ ] Update specified fields (e.g., `newTitle`, `newDescription`, `newIngredients`, `newSteps`).
    * \[ ] Update the `updated` timestamp.
  * \[ ] Add inline JSDoc comments for types and actions.
  * \[ ] (`ctx prompt src/concepts/Recipe/RecipeConcept.ts` or `ctx save src/concepts/Recipe/RecipeConcept.ts` frequently.)
* \[ ] **2c. Test Concept (`src/concepts/Recipe/RecipeConcept.test.ts`):**
  * \[ ] Create test file.
  * \[ ] **Operational Principle Test:**
    * \[ ] Sequence: `createRecipe`, `addTag`, `updateRecipeDetails` (e.g., change description), `removeTag`.
    * \[ ] Ensure legible console output.
    * \[ ] (`ctx save test_output/Recipe_principle_trace.md`.)
  * \[ ] **Variant/Edge Case Tests (3-5 scenarios):**
    * \[ ] Test `createRecipe` with empty title or invalid ingredients/steps (expect error).
    * \[ ] Test adding multiple tags, and removing a non-existent tag.
    * \[ ] Test `updateRecipeDetails` with only one field changed, or with new ingredient/step lists.
    * \[ ] Test `deleteRecipe` without ownership (expect error).
    * \[ ] Test `deleteRecipe` for a non-existent recipe (expect error/no-op).
    * \[ ] (`ctx save test_output/Recipe_variants_trace.md`.)
* \[ ] **2d. Document Design Changes (`design/concept_notes/Recipe_design_notes.md`):**
  * \[ ] Note how `Ingredient` and `Step` are handled as embedded documents within `Recipe` state, and why this design choice was made (e.g., to uphold modularity, as they aren't independent concepts).
  * \[ ] Record interesting moments (e.g., LLM's approach to embedding sub-objects, handling `Set` for `tags` in MongoDB, logic for updating `ingredients` and `steps` arrays).

***

### **For Concept: Annotation**

* \[ ] **2a. Review/Refactor Concept Specification (`design/concepts/Annotation.md`):**
  * \[ ] Pay close attention to `targetKind` (`Ingredient` or `Step`) and `targetIndex`.
  * \[ ] Clarify `resolver canView annotation.recipe` - for now, this can be simplified to just checking if the `resolver` exists, or if `resolver` is `author`, as full access control is for syncs.
  * \[ ] (`ctx save design/concepts/Annotation.md`.)
* \[ ] **2b. Implement Concept (`src/concepts/Annotation/AnnotationConcept.ts`):**
  * \[ ] Create `AnnotationConcept.ts` in `src/concepts/Annotation/`.
  * \[ ] Define `Annotation` interface.
  * \[ ] Initialize MongoDB `Collection` for `annotations`.
  * \[ ] Implement `annotate`:
    * \[ ] Validate `recipe` exists (conceptual ID check), `text` not empty.
    * \[ ] Validate `targetKind` and `index` (e.g., `0 <= index`). Actual bounds checking against recipe lists can be simplified/deferred if `Recipe` data isn't directly accessed.
    * \[ ] Add `created` timestamp, set `resolved` to `false`.
  * \[ ] Implement `editAnnotation`:
    * \[ ] Validate `author` ownership of the annotation.
    * \[ ] Update `text`.
  * \[ ] Implement `resolveAnnotation`:
    * \[ ] Validate `annotation` exists.
    * \[ ] Validate `resolver` permissions (simplified for now, e.g., if `resolver` is the author or a known admin ID).
    * \[ ] Update `resolved` boolean.
  * \[ ] Implement `deleteAnnotation`:
    * \[ ] Validate `author` ownership of the annotation.
    * \[ ] Remove the annotation document.
  * \[ ] Add inline JSDoc comments for types and actions.
  * \[ ] (`ctx prompt src/concepts/Annotation/AnnotationConcept.ts` or `ctx save src/concepts/Annotation/AnnotationConcept.ts` frequently.)
* \[ ] **2c. Test Concept (`src/concepts/Annotation/AnnotationConcept.test.ts`):**
  * \[ ] Create test file.
  * \[ ] **Operational Principle Test:**
    * \[ ] Sequence: `annotate`, `editAnnotation`, `resolveAnnotation`. (Requires a dummy `recipeId` and `authorId` to exist for the `annotate` action).
    * \[ ] Ensure legible console output.
    * \[ ] (`ctx save test_output/Annotation_principle_trace.md`.)
  * \[ ] **Variant/Edge Case Tests (3-5 scenarios):**
    * \[ ] Test `annotate` with invalid `targetIndex` (e.g., negative), empty text, non-existent `recipe` (expect error).
    * \[ ] Test `editAnnotation` by a non-owner (expect error).
    * \[ ] Test `resolveAnnotation` by a non-authorized user (expect error, based on your simplified permission check).
    * \[ ] Test deleting a non-existent annotation.
    * \[ ] Test `deleteAnnotation` by a non-owner (expect error).
    * \[ ] (`ctx save test_output/Annotation_variants_trace.md`.)
* \[ ] **2d. Document Design Changes (`design/concept_notes/Annotation_design_notes.md`):**
  * \[ ] Discuss challenges or simplifications made regarding `targetIndex` validation or `resolver` permissions.
  * \[ ] Record interesting moments (e.g., LLM's handling of `targetKind` enum, how to conceptualize `recipe` existence without direct database access to `RecipeConcept`).

***

### **For Concept: Version**

* \[ ] **2a. Review/Refactor Concept Specification (`design/concepts/Version.md`):**
  * \[ ] Note this concept is "AI-Augmented" and interacts closely with `VersionDraft`.
  * \[ ] Ensure `versionNum` is a `String` and its uniqueness requirement for a given `baseRecipe`.
  * \[ ] Clarify `promptHistory` structure (List of `PromptHistoryEntry` objects).
  * \[ ] `VersionDraft` is a transient concept, its state is explicitly defined here and will have its own collection.
  * \[ ] (`ctx save design/concepts/Version.md`.)
* \[ ] **2b. Implement Concept (`src/concepts/Version/VersionConcept.ts`):**
  * \[ ] Create `VersionConcept.ts` in `src/concepts/Version/`.
  * \[ ] Define `Version`, `VersionDraft`, and `PromptHistoryEntry` interfaces.
  * \[ ] Initialize separate MongoDB `Collection`s for `versions` and `versionDrafts`.
  * \[ ] Implement `createVersion` (manual version creation):
    * \[ ] Validate `baseRecipe` exists (conceptual ID check), `versionNum` uniqueness for that recipe.
    * \[ ] Set `created` timestamp, store `notes`, `ingredients`, `steps`.
  * \[ ] Implement `deleteVersion`:
    * \[ ] Validate `requester` ownership (author or recipe owner).
    * \[ ] Remove the version document.
  * \[ ] Implement `draftVersionWithAI`:
    * \[ ] This is your LLM integration point. For this assignment, **mock the LLM response.** You should return a *mock* `VersionDraft` object that simulates proposed changes and notes based on the `goal` prompt. You do *not* need to make an actual external LLM API call for this assignment to manage costs/complexity.
    * \[ ] Store the mock `VersionDraft` in the `versionDrafts` collection.
    * \[ ] Log the call to the `promptHistory` field (which should be part of the `Version` state or a separate collection as decided in your spec). A new `PromptHistoryEntry` is created.
    * \[ ] Set `created` and `expires` (e.g., `Date.now() + 24 * 60 * 60 * 1000`).
  * \[ ] Implement `approveDraft`:
    * \[ ] Validate `draft` exists and `author` matches `draft.requester`.
    * \[ ] Validate `newVersionNum` uniqueness for the `baseRecipe`.
    * \[ ] Promote the `draft` data into a new `Version` document in the `versions` collection.
    * \[ ] Remove the `draft` from the `versionDrafts` collection.
    * \[ ] Update the corresponding `promptHistory` entry (set status to "Approved").
  * \[ ] Implement `rejectDraft`:
    * \[ ] Validate `draft` exists and `author` matches `draft.requester`.
    * \[ ] Remove the `draft` from the `versionDrafts` collection.
    * \[ ] Update the corresponding `promptHistory` entry (set status to "Rejected").
  * \[ ] Add inline JSDoc comments for types and actions.
  * \[ ] (`ctx prompt src/concepts/Version/VersionConcept.ts` or `ctx save src/concepts/Version/VersionConcept.ts` frequently.)
* \[ ] **2c. Test Concept (`src/concepts/Version/VersionConcept.test.ts`):**
  * \[ ] Create test file.
  * \[ ] **Operational Principle Test:**
    * \[ ] Sequence: `createVersion` (manual), `draftVersionWithAI` (using mock LLM), `approveDraft`.
    * \[ ] Ensure legible console output.
    * \[ ] (`ctx save test_output/Version_principle_trace.md`.)
  * \[ ] **Variant/Edge Case Tests (3-5 scenarios):**
    * \[ ] Test `createVersion` with a duplicate `versionNum` for the same `baseRecipe` (expect error).
    * \[ ] Test `draftVersionWithAI` with an empty `goal`.
    * \[ ] Test `rejectDraft` with a valid draft.
    * \[ ] Test `approveDraft`/`rejectDraft` for a non-existent draft or by a non-requester (expect error).
    * \[ ] Test `deleteVersion` (manual deletion of a full version).
    * \[ ] Verify `promptHistory` is updated correctly after `draftVersionWithAI`, `approveDraft`, `rejectDraft`.
    * \[ ] (`ctx save test_output/Version_variants_trace.md`.)
* \[ ] **2d. Document Design Changes (`design/concept_notes/Version_design_notes.md`):**
  * \[ ] Discuss how `VersionDraft` is managed as a transient collection and its lifecycle (creation, approval, rejection).
  * \[ ] Explain your approach to `draftVersionWithAI` (e.g., specific mocking strategy used, how you simulated LLM output, why actual LLM calls were deferred for this assignment).
  * \[ ] Record interesting moments (e.g., LLM's suggestions for `promptHistory` structure, challenges in managing transient state, the design decision to make `versionNum` a `String`).

***

### **For Concept: Notebook**

* \[ ] **2a. Review/Refactor Concept Specification (`design/concepts/Notebook.md`):**
  * \[ ] Pay close attention to `members` (Set of User IDs) and `recipes` (Set of Recipe IDs).
  * \[ ] Validate `removeMember` edge case: `member ≠ owner`.
  * \[ ] (`ctx save design/concepts/Notebook.md`.)
* \[ ] **2b. Implement Concept (`src/concepts/Notebook/NotebookConcept.ts`):**
  * \[ ] Create `NotebookConcept.ts` in `src/concepts/Notebook/`.
  * \[ ] Define `Notebook` interface.
  * \[ ] Initialize MongoDB `Collection` for `notebooks`.
  * \[ ] Implement `createNotebook`:
    * \[ ] Validate `title` not empty.
    * \[ ] Add `owner` to `members` set, set `created` timestamp.
  * \[ ] Implement `inviteMember`:
    * \[ ] Validate `owner` ownership of notebook.
    * \[ ] Validate `member` ID exists (conceptual check).
    * \[ ] Add `member` to the `members` set.
  * \[ ] Implement `removeMember`:
    * \[ ] Validate `owner` ownership.
    * \[ ] Ensure `member` is not the `owner` of the notebook.
    * \[ ] Remove `member` from the `members` set.
  * \[ ] Implement `shareRecipe`:
    * \[ ] Validate `sharer` permissions (either `recipe.owner` or `sharer ∈ notebook.members`).
    * \[ ] Validate `recipe` exists (conceptual ID check).
    * \[ ] Add `recipe` ID to the `recipes` set.
  * \[ ] Implement `unshareRecipe`:
    * \[ ] Validate `requester` permissions (either `recipe.owner` or `notebook.owner`).
    * \[ ] Remove `recipe` ID from the `recipes` set.
  * \[ ] Implement `deleteNotebook`:
    * \[ ] Validate `owner` ownership.
    * \[ ] Remove the notebook document. (Note: unsharing recipes from this notebook will be handled by synchronizations later).
  * \[ ] Add inline JSDoc comments for types and actions.
  * \[ ] (`ctx prompt src/concepts/Notebook/NotebookConcept.ts` or `ctx save src/concepts/Notebook/NotebookConcept.ts` frequently.)
* \[ ] **2c. Test Concept (`src/concepts/Notebook/NotebookConcept.test.ts`):**
  * \[ ] Create test file.
  * \[ ] **Operational Principle Test:**
    * \[ ] Sequence: `createNotebook`, `inviteMember`, `shareRecipe`, `unshareRecipe`, `removeMember` (for a non-owner).
    * \[ ] Requires dummy `userIds` and `recipeIds` for these actions.
    * \[ ] Ensure legible console output.
    * \[ ] (`ctx save test_output/Notebook_principle_trace.md`.)
  * \[ ] **Variant/Edge Case Tests (3-5 scenarios):**
    * \[ ] Test `createNotebook` with empty title.
    * \[ ] Test `inviteMember` for an already existing member.
    * \[ ] Test `removeMember` on the `owner` (expect error).
    * \[ ] Test `shareRecipe` without adequate permissions (expect error).
    * \[ ] Test `unshareRecipe` for a recipe not in the notebook.
    * \[ ] Test `deleteNotebook` by a non-owner (expect error).
    * \[ ] (`ctx save test_output/Notebook_variants_trace.md`.)
* \[ ] **2d. Document Design Changes (`design/concept_notes/Notebook_design_notes.md`):**
  * \[ ] Discuss how membership and recipe sharing are managed using sets of IDs.
  * \[ ] Explain how access control checks (e.g., `sharer` permissions) are handled within the concept's `requires` for this assignment, recognizing that full enforcement will come with syncs.
  * \[ ] Record interesting moments (e.g., LLM's handling of `Set` types in MongoDB for `members` and `recipes`, complexity of permission checks on `shareRecipe`/`unshareRecipe`).

***

## Part 3: Application-Wide Deliverables and Submission

These are the final steps for your submission, synthesizing your work and ensuring proper documentation.

* \[ ] **Application Design Notes (`design/app_design_notes.md`):**
  * \[ ] Create `app_design_notes.md` in the `design/` folder.
  * \[ ] Summarize any significant changes made to the overall application design from your initial Assignment 2 proposal.
  * \[ ] Include **5-10 pointers to "interesting moments"** from your development process:
    * \[ ] For each moment, provide a succinct but compelling explanation (e.g., "LLM generated unexpected but useful code here," "Discovered a flaw in `targetIndex` logic during testing," "Simplified `VersionDraft` lifecycle after realizing...").
    * \[ ] Link directly to the relevant **snapshot** in the `context` area (e.g., `[LLM Response for X](/context/2025-10-10T12_30_00_000Z.abc1234.md/steps/_2.def5678.md)` for an LLM response, or `[Version of Test File](/context/2025-10-10T12_45_00_000Z.ghi9012.ts)` for a code snapshot). Remember to use the absolute path from the repo root to the `context` folder snapshot.
* \[ ] **Review all Concept Specifications:**
  * \[ ] Double-check that all `design/concepts/*.md` files are **complete and consistent** with their corresponding implementations.
  * \[ ] Ensure structured specification notation is used correctly.
  * \[ ] (`ctx save` any last-minute spec changes.)
* \[ ] **Review `context` Folder Integrity:**
  * \[ ] Verify that you have **not modified, moved, deleted, or renamed** any files within the `context` directory.
  * \[ ] This folder should contain a complete and unmodified history of all your LLM calls and saved snapshots.
* \[ ] **Final Test Run:**
  * \[ ] Run `deno test -A` one last time from the repo root to ensure all tests pass.
  * \[ ] Ensure all saved test output files (`test_output/*.md`) reflect successful test runs.
* \[ ] **Environment Variables:**
  * \[ ] Confirm your `GEMINI_API_KEY` and `MONGODB_URL` are *only* in your `.env` file and **not committed** to your repository. The provided template handles this correctly, but a final check is good practice.
* \[ ] **Commit and Push:**
  * \[ ] Commit all your work to your GitHub repository.
  * \[ ] Push all changes to GitHub **by the assignment deadline**.
  * \[ ] Save the final commit hash.
* \[ ] **Submission Form:**
  * \[ ] Fill in the [submission form](https://forms.gle/7Yq3sKESEtJ3vMBa7) with your GitHub repo link and commit hash \*\*by the assignment deadline\`.
* \[ ] **Survey Form:**
  * \[ ] Fill in the [survey form](https://forms.gle/FjqjYT1oo5hEknEa6) \*\*within 24 hours after the assignment deadline\`.
