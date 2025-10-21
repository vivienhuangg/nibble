---
timestamp: 'Mon Oct 20 2025 20:36:15 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_203615.6f78579a.md]]'
content_id: e418b7ca63412766033f4f19fee168d793981573fb100911db5e054d7fff6a80
---

# file: /Users/vivienhuang/6.1040/nibble-backend/src/concepts/Notebook/NotebookConcept.ts

```typescript
import type { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import type { Empty, ID } from "@utils/types.ts";

// Declare collection prefix, use concept name
const PREFIX = "Notebook" + ".";

// Generic types of this concept
type User = ID;
type Recipe = ID;

/**
 * A notebook is a shared collection of recipes.
 */
export interface NotebookDocument {
  _id: ID; // Maps to `id: UUID` in spec
  owner: User;
  title: string;
  description?: string;
  members: User[]; // Maps to `Set<User>` in spec
  recipes: Recipe[]; // Maps to `Set<Recipe>` in spec
  created: Date; // Maps to `DateTime` in spec
}

export default class NotebookConcept {
  notebooks: Collection<NotebookDocument>;

  constructor(private readonly db: Db) {
    this.notebooks = this.db.collection(PREFIX + "notebooks");
  }

  /**
   * createNotebook (owner: User, title: String, description?: String): (notebook: ID)
   *
   * **purpose** organize shared collections of recipes and manage collaborative access.
   *
   * **principle** membership defines access; shared recipes remain editable only by owners but viewable by all members.
   *
   * **requires** title ≠ ""
   *
   * **effects** creates new notebook with owner ∈ members, sets `created`
   */
  async createNotebook({
    owner,
    title,
    description,
  }: {
    owner: User;
    title: string;
    description?: string;
  }): Promise<{ notebook: ID } | { error: string }> {
    if (!title || title.trim() === "") {
      return { error: "Notebook title cannot be empty." };
    }

    const newNotebookId = freshID();
    const now = new Date();

    const newNotebook: NotebookDocument = {
      _id: newNotebookId,
      owner,
      title: title.trim(),
      description: description?.trim(),
      members: [owner], // Owner is automatically a member
      recipes: [],
      created: now,
    };

    await this.notebooks.insertOne(newNotebook);

    return { notebook: newNotebookId };
  }

  /**
   * inviteMember (owner: User, notebook: ID, member: User): Empty
   *
   * **requires** owner = notebook.owner ∧ member exists
   *
   * **effects** member ∈ notebook.members
   */
  async inviteMember({
    owner,
    notebook,
    member,
  }: {
    owner: User;
    notebook: ID;
    member: User;
  }): Promise<Empty | { error: string }> {
    const notebookDoc = await this.notebooks.findOne({ _id: notebook });
    if (!notebookDoc) {
      return { error: "Notebook not found." };
    }
    if (notebookDoc.owner !== owner) {
      return { error: "Only the notebook owner can invite members." };
    }
    // `member exists` is assumed to be handled by a sync/external validation if User is a separate concept
    // Check if member is already in the list
    if (notebookDoc.members.includes(member)) {
      return { error: "User is already a member of this notebook." };
    }

    await this.notebooks.updateOne(
      { _id: notebook },
      { $addToSet: { members: member } }, // $addToSet ensures uniqueness
    );

    return {};
  }

  /**
   * removeMember (owner: User, notebook: ID, member: User): Empty
   *
   * **requires** owner = notebook.owner ∧ member ∈ notebook.members ∧ member ≠ owner
   *
   * **effects** member ∉ notebook.members
   */
  async removeMember({
    owner,
    notebook,
    member,
  }: {
    owner: User;
    notebook: ID;
    member: User;
  }): Promise<Empty | { error: string }> {
    const notebookDoc = await this.notebooks.findOne({ _id: notebook });
    if (!notebookDoc) {
      return { error: "Notebook not found." };
    }
    if (notebookDoc.owner !== owner) {
      return { error: "Only the notebook owner can remove members." };
    }
    if (member === owner) {
      return { error: "The owner cannot remove themselves from the notebook." };
    }
    // Check if member is actually in the list
    if (!notebookDoc.members.includes(member)) {
      return { error: "User is not a member of this notebook." };
    }

    await this.notebooks.updateOne(
      { _id: notebook },
      { $pull: { members: member } },
    );

    return {};
  }

  /**
   * shareRecipe (sharer: User, recipe: Recipe, notebook: ID): Empty
   *
   * **requires** sharer = recipe.owner ∨ sharer ∈ notebook.members
   *              (Note: sharer = recipe.owner is expected to be enforced by a sync invoking this action)
   *
   * **effects** recipe ∈ notebook.recipes (if not already present)
   */
  async shareRecipe({
    sharer,
    recipe,
    notebook,
  }: {
    sharer: User;
    recipe: Recipe;
    notebook: ID;
  }): Promise<Empty | { error: string }> {
    const notebookDoc = await this.notebooks.findOne({ _id: notebook });
    if (!notebookDoc) {
      return { error: "Notebook not found." };
    }

    // This concept cannot verify `sharer = recipe.owner`.
    // It assumes this condition is met by an orchestrating sync or the `sharer` is a member.
    if (!notebookDoc.members.includes(sharer)) {
      // If the sharer is not a member, we assume they are the recipe owner.
      // A more robust system would involve the Recipe concept to verify recipe ownership here
      // or rely entirely on syncs to gate this action properly.
      // For this concept's independence, we proceed assuming the `requires` from the spec holds.
      // However, to prevent arbitrary users from sharing, we'll enforce sharer must be a member
      // unless specifically overridden by a sync that verifies recipe ownership externally.
      // For now, let's allow it as per "sharer = recipe.owner OR sharer is member" and assume the sync
      // calling this method ensures the "recipe.owner" part.
      // If we *only* allowed `sharer ∈ notebook.members`, then the concept would directly violate the `OR` clause.
      // The safest independent check is if the recipe is already there.
    }

    // Check if recipe is already in the notebook
    if (notebookDoc.recipes.includes(recipe)) {
      return { error: "Recipe is already shared in this notebook." };
    }

    await this.notebooks.updateOne(
      { _id: notebook },
      { $addToSet: { recipes: recipe } },
    );

    return {};
  }

  /**
   * unshareRecipe (requester: User, recipe: Recipe, notebook: ID): Empty
   *
   * **requires** requester = recipe.owner ∨ requester = notebook.owner
   *              (Note: requester = recipe.owner is expected to be enforced by a sync invoking this action)
   *
   * **effects** recipe ∉ notebook.recipes
   */
  async unshareRecipe({
    requester,
    recipe,
    notebook,
  }: {
    requester: User;
    recipe: Recipe;
    notebook: ID;
  }): Promise<Empty | { error: string }> {
    const notebookDoc = await this.notebooks.findOne({ _id: notebook });
    if (!notebookDoc) {
      return { error: "Notebook not found." };
    }

    // This concept cannot verify `requester = recipe.owner`.
    // It assumes this condition is met by an orchestrating sync or the `requester` is the notebook owner.
    if (notebookDoc.owner !== requester) {
      // If the requester is not the notebook owner, we assume they are the recipe owner.
      // Similar to shareRecipe, relying on syncs for external validation.
    }

    // Check if recipe is actually in the notebook
    if (!notebookDoc.recipes.includes(recipe)) {
      return { error: "Recipe is not shared in this notebook." };
    }

    await this.notebooks.updateOne(
      { _id: notebook },
      { $pull: { recipes: recipe } },
    );

    return {};
  }

  /**
   * deleteNotebook (owner: User, notebook: ID): Empty
   *
   * **requires** owner = notebook.owner
   *
   * **effects** removes notebook and triggers associated unsharing.
   */
  async deleteNotebook({
    owner,
    notebook,
  }: {
    owner: User;
    notebook: ID;
  }): Promise<Empty | { error: string }> {
    const notebookDoc = await this.notebooks.findOne({ _id: notebook });
    if (!notebookDoc) {
      return { error: "Notebook not found." };
    }
    if (notebookDoc.owner !== owner) {
      return { error: "Only the notebook owner can delete the notebook." };
    }

    await this.notebooks.deleteOne({ _id: notebook });

    // "triggers associated unsharing" implies syncs will handle reactions to this deletion,
    // such as unsharing recipes from this deleted notebook from other contexts, or notifying members.
    // The concept itself only performs its direct effect.

    return {};
  }

  // Queries (not explicitly required by the problem statement, but good for completeness)

  /**
   * _getNotebookById (notebook: ID): (notebook: NotebookDocument)
   *
   * **requires** notebook exists
   *
   * **effects** returns the notebook document
   */
  async _getNotebookById({
    notebook,
  }: {
    notebook: ID;
  }): Promise<NotebookDocument[] | { error: string }> {
    const notebookDoc = await this.notebooks.findOne({ _id: notebook });
    if (!notebookDoc) {
      return { error: "Notebook not found." };
    }
    return [notebookDoc];
  }

  /**
   * _getNotebooksByOwner (owner: User): (notebook: NotebookDocument)
   *
   * **requires** owner exists
   *
   * **effects** returns all notebooks owned by the specified user
   */
  async _getNotebooksByOwner({
    owner,
  }: {
    owner: User;
  }): Promise<NotebookDocument[] | { error: string }> {
    const notebooks = await this.notebooks.find({ owner: owner }).toArray();
    return notebooks;
  }

  /**
   * _getNotebooksWithMember (member: User): (notebook: NotebookDocument)
   *
   * **requires** member exists
   *
   * **effects** returns all notebooks where the user is a member
   */
  async _getNotebooksWithMember({
    member,
  }: {
    member: User;
  }): Promise<NotebookDocument[] | { error: string }> {
    const notebooks = await this.notebooks.find({ members: member }).toArray();
    return notebooks;
  }
}

```
