---
timestamp: 'Sun Oct 19 2025 11:41:06 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_114106.b5b31792.md]]'
content_id: 19d715a9829b69178f02545fa9f55e2d789c127deea33bdecfc009b37dd1d679
---

# implement: Notebook

```typescript
// file: src/Notebook/NotebookConcept.ts

import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "Notebook" + ".";

// Generic types of this concept
type User = ID;
type Recipe = ID;

/**
 * A notebook is a shared collection of recipes.
 * Its state maintains the ownership, membership, and shared recipes.
 */
interface NotebookDocument {
  _id: ID; // Maps to `id: UUID` in spec
  owner: User;
  title: string;
  description?: string;
  members: User[]; // Maps to `Set<User>` in spec, unique entries ensured by $addToSet
  recipes: Recipe[]; // Maps to `Set<Recipe>` in spec, unique entries ensured by $addToSet
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
  async createNotebook(
    { owner, title, description }: {
      owner: User;
      title: string;
      description?: string;
    },
  ): Promise<{ notebook: ID } | { error: string }> {
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

    try {
      await this.notebooks.insertOne(newNotebook);
      return { notebook: newNotebookId };
    } catch (e) {
      console.error(`Error creating notebook: ${e.message}`);
      return { error: "Failed to create notebook due to a database error." };
    }
  }

  /**
   * inviteMember (owner: User, notebook: ID, member: User): Empty
   *
   * **requires** owner = notebook.owner ∧ member exists
   *
   * **effects** member ∈ notebook.members
   */
  async inviteMember(
    { owner, notebook, member }: { owner: User; notebook: ID; member: User },
  ): Promise<Empty | { error: string }> {
    const notebookDoc = await this.notebooks.findOne({ _id: notebook });
    if (!notebookDoc) {
      return { error: "Notebook not found." };
    }
    if (notebookDoc.owner !== owner) {
      return { error: "Only the notebook owner can invite members." };
    }
    // `member exists` is an external requirement, assumed validated by a sync or calling context.
    // This action ensures the member is not already present to fulfill "member ∈ notebook.members" effect.
    if (notebookDoc.members.includes(member)) {
      return { error: "User is already a member of this notebook." };
    }

    try {
      await this.notebooks.updateOne(
        { _id: notebook },
        { $addToSet: { members: member } }, // $addToSet ensures uniqueness
      );
      return {};
    } catch (e) {
      console.error(`Error inviting member ${member} to notebook ${notebook}: ${e.message}`);
      return { error: "Failed to invite member due to a database error." };
    }
  }

  /**
   * removeMember (owner: User, notebook: ID, member: User): Empty
   *
   * **requires** owner = notebook.owner ∧ member ∈ notebook.members ∧ member ≠ owner
   *
   * **effects** member ∉ notebook.members
   */
  async removeMember(
    { owner, notebook, member }: { owner: User; notebook: ID; member: User },
  ): Promise<Empty | { error: string }> {
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
    if (!notebookDoc.members.includes(member)) {
      return { error: "User is not a member of this notebook." };
    }

    try {
      await this.notebooks.updateOne(
        { _id: notebook },
        { $pull: { members: member } },
      );
      return {};
    } catch (e) {
      console.error(`Error removing member ${member} from notebook ${notebook}: ${e.message}`);
      return { error: "Failed to remove member due to a database error." };
    }
  }

  /**
   * shareRecipe (sharer: User, recipe: Recipe, notebook: ID): Empty
   *
   * **requires** sharer = recipe.owner ∨ sharer ∈ notebook.members
   *              (Note: The `sharer = recipe.owner` part of the requirement is expected
   *              to be enforced by an external synchronization, as this concept is
   *              independent and does not have access to recipe ownership information.
   *              This action primarily ensures the recipe is not already present.)
   *
   * **effects** recipe ∈ notebook.recipes (if not already present)
   */
  async shareRecipe(
    { sharer, recipe, notebook }: {
      sharer: User; // The sharer's authorization is handled by syncs.
      recipe: Recipe;
      notebook: ID;
    },
  ): Promise<Empty | { error: string }> {
    const notebookDoc = await this.notebooks.findOne({ _id: notebook });
    if (!notebookDoc) {
      return { error: "Notebook not found." };
    }

    // This concept does not validate the `sharer`'s permissions (owner or member) directly.
    // It assumes a synchronization layer has already verified the `sharer`'s authority
    // as per the `requires` clause: `sharer = recipe.owner ∨ sharer ∈ notebook.members`.
    // The independence principle dictates that this concept focuses purely on its own state effects.

    if (notebookDoc.recipes.includes(recipe)) {
      return { error: "Recipe is already shared in this notebook." };
    }

    try {
      await this.notebooks.updateOne(
        { _id: notebook },
        { $addToSet: { recipes: recipe } },
      );
      return {};
    } catch (e) {
      console.error(`Error sharing recipe ${recipe} to notebook ${notebook}: ${e.message}`);
      return { error: "Failed to share recipe due to a database error." };
    }
  }

  /**
   * unshareRecipe (requester: User, recipe: Recipe, notebook: ID): Empty
   *
   * **requires** requester = recipe.owner ∨ requester = notebook.owner
   *              (Note: Similar to `shareRecipe`, the `requester = recipe.owner` part
   *              is expected to be enforced by an external synchronization. This action
   *              primarily ensures the recipe is currently present in the notebook.)
   *
   * **effects** recipe ∉ notebook.recipes
   */
  async unshareRecipe(
    { requester, recipe, notebook }: {
      requester: User; // The requester's authorization is handled by syncs.
      recipe: Recipe;
      notebook: ID;
    },
  ): Promise<Empty | { error: string }> {
    const notebookDoc = await this.notebooks.findOne({ _id: notebook });
    if (!notebookDoc) {
      return { error: "Notebook not found." };
    }

    // As with `shareRecipe`, this concept does not validate the `requester`'s permissions.
    // It assumes a synchronization layer has verified the `requester`'s authority
    // as per the `requires` clause: `requester = recipe.owner ∨ requester = notebook.owner`.

    if (!notebookDoc.recipes.includes(recipe)) {
      return { error: "Recipe is not shared in this notebook." };
    }

    try {
      await this.notebooks.updateOne(
        { _id: notebook },
        { $pull: { recipes: recipe } },
      );
      return {};
    } catch (e) {
      console.error(`Error unsharing recipe ${recipe} from notebook ${notebook}: ${e.message}`);
      return { error: "Failed to unshare recipe due to a database error." };
    }
  }

  /**
   * deleteNotebook (owner: User, notebook: ID): Empty
   *
   * **requires** owner = notebook.owner
   *
   * **effects** removes notebook and triggers associated unsharing.
   */
  async deleteNotebook(
    { owner, notebook }: { owner: User; notebook: ID },
  ): Promise<Empty | { error: string }> {
    const notebookDoc = await this.notebooks.findOne({ _id: notebook });
    if (!notebookDoc) {
      return { error: "Notebook not found." };
    }
    if (notebookDoc.owner !== owner) {
      return { error: "Only the notebook owner can delete the notebook." };
    }

    try {
      await this.notebooks.deleteOne({ _id: notebook });
      // "triggers associated unsharing" is an effect that syncs react to, not this concept directly.
      return {};
    } catch (e) {
      console.error(`Error deleting notebook ${notebook}: ${e.message}`);
      return { error: "Failed to delete notebook due to a database error." };
    }
  }

  // --- Queries ---

  /**
   * _getNotebookById (notebook: ID): (notebook: NotebookDocument)
   *
   * **requires** notebook exists
   *
   * **effects** returns the notebook document in an array
   */
  async _getNotebookById(
    { notebook }: { notebook: ID },
  ): Promise<NotebookDocument[] | { error: string }> {
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
   * **effects** returns all notebooks owned by the specified user as an array
   */
  async _getNotebooksByOwner(
    { owner }: { owner: User },
  ): Promise<NotebookDocument[] | { error: string }> {
    // `owner exists` is an external requirement, assumed validated.
    try {
      const notebooks = await this.notebooks.find({ owner: owner }).toArray();
      return notebooks;
    } catch (e) {
      console.error(`Error retrieving notebooks for owner ${owner}: ${e.message}`);
      return { error: "Failed to retrieve notebooks due to a database error." };
    }
  }

  /**
   * _getNotebooksWithMember (member: User): (notebook: NotebookDocument)
   *
   * **requires** member exists
   *
   * **effects** returns all notebooks where the user is a member as an array
   */
  async _getNotebooksWithMember(
    { member }: { member: User },
  ): Promise<NotebookDocument[] | { error: string }> {
    // `member exists` is an external requirement, assumed validated.
    try {
      const notebooks = await this.notebooks.find({ members: member }).toArray();
      return notebooks;
    } catch (e) {
      console.error(`Error retrieving notebooks with member ${member}: ${e.message}`);
      return { error: "Failed to retrieve notebooks due to a database error." };
    }
  }

  /**
   * _getRecipesInNotebook (notebook: ID): (recipe: Recipe)
   *
   * **requires** notebook exists
   *
   * **effects** returns the list of recipe IDs shared in the notebook
   */
  async _getRecipesInNotebook(
    { notebook }: { notebook: ID },
  ): Promise<{ recipe: Recipe }[] | { error: string }> {
    const notebookDoc = await this.notebooks.findOne({ _id: notebook });
    if (!notebookDoc) {
      return { error: "Notebook not found." };
    }
    return notebookDoc.recipes.map(recipe => ({ recipe }));
  }
}
```
