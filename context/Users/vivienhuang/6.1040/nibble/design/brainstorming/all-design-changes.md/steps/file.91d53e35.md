---
timestamp: 'Sun Oct 19 2025 14:27:22 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_142722.bfd7c863.md]]'
content_id: 91d53e35e22d9c26e7967d6e77ede3edd019d151758d0229e14072068334076b
---

# file: /Users/vivienhuang/6.1040/nibble/src/concepts/Annotation/AnnotationConcept.ts

```typescript
import type { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import type { Empty, ID } from "@utils/types.ts";

// Declare collection prefix, use concept name
const PREFIX = "Annotation" + ".";

// Generic types of this concept (external IDs)
type User = ID;
type Recipe = ID;

/**
 * a set of Annotations with:
 *   id : UUID
 *   author : User
 *   recipe : Recipe
 *   targetKind : {Ingredient | Step}
 *   targetIndex : Integer
 *   text : String
 *   created : DateTime
 *   resolved : Boolean
 */
interface AnnotationDoc {
  _id: ID;
  author: User;
  recipe: Recipe;
  targetKind: "Ingredient" | "Step"; // Using string literals for specific kinds
  targetIndex: number;
  text: string;
  created: Date;
  resolved: boolean;
}

/**
 * AnnotationConcept: capture contextual notes on a specific ingredient or step without altering the recipe.
 *
 * principle: annotations enrich understanding while preserving recipe immutability.
 */
export default class AnnotationConcept {
  private annotations: Collection<AnnotationDoc>;

  constructor(private readonly db: Db) {
    this.annotations = this.db.collection(PREFIX + "annotations");
  }

  /**
   * annotate(author: User, recipe: Recipe, targetKind: "Ingredient" | "Step", index: number, text: string): (annotation: ID) | (error: string)
   *
   * **requires** recipe exists; text ≠ ""; 0 ≤ index < |target list| for targetKind
   *   (Note: `recipe exists` and `target list` validation are assumed to be handled by higher-level logic or syncs,
   *   as the Annotation concept operates polymorphically on Recipe IDs and doesn't know their internal structure.
   *   `text` emptiness is validated here.)
   *
   * **effects** adds new unresolved annotation, sets `created`
   */
  async annotate({
    author,
    recipe,
    targetKind,
    index,
    text,
  }: {
    author: User;
    recipe: Recipe;
    targetKind: "Ingredient" | "Step";
    index: number;
    text: string;
  }): Promise<{ annotation: ID } | { error: string }> {
    if (!text || text.trim() === "") {
      return { error: "Annotation text cannot be empty." };
    }

    const newAnnotationId = freshID();
    const newAnnotation: AnnotationDoc = {
      _id: newAnnotationId,
      author,
      recipe,
      targetKind,
      targetIndex: index,
      text: text.trim(),
      created: new Date(),
      resolved: false,
    };

    try {
      await this.annotations.insertOne(newAnnotation);
      return { annotation: newAnnotationId };
    } catch (e) {
      console.error("Failed to insert annotation:", e);
      return { error: "Failed to create annotation." };
    }
  }

  /**
   * editAnnotation(author: User, annotation: ID, newText: string): Empty | (error: string)
   *
   * **requires** annotation exists and author = annotation.author
   *
   * **effects** annotation.text := newText
   */
  async editAnnotation({
    author,
    annotation,
    newText,
  }: {
    author: User;
    annotation: ID;
    newText: string;
  }): Promise<Empty | { error: string }> {
    if (!newText || newText.trim() === "") {
      return { error: "New annotation text cannot be empty." };
    }

    const existingAnnotation = await this.annotations.findOne({
      _id: annotation,
    });
    if (!existingAnnotation) {
      return { error: "Annotation not found." };
    }
    if (existingAnnotation.author !== author) {
      return { error: "Only the author can edit an annotation." };
    }

    try {
      await this.annotations.updateOne(
        { _id: annotation },
        { $set: { text: newText.trim() } },
      );
      return {};
    } catch (e) {
      console.error("Failed to update annotation text:", e);
      return { error: "Failed to edit annotation." };
    }
  }

  /**
   * resolveAnnotation(resolver: User, annotation: ID, resolved: boolean): Empty | (error: string)
   *
   * **requires** annotation exists and resolver canView annotation.recipe
   *   (Note: `canView` validation is external to this concept and should be handled by higher-level logic or syncs.)
   *
   * **effects** annotation.resolved := resolved
   */
  async resolveAnnotation({
    resolver, // Kept for consistency with spec, but `canView` check is external.
    annotation,
    resolved,
  }: {
    resolver: User;
    annotation: ID;
    resolved: boolean;
  }): Promise<Empty | { error: string }> {
    const existingAnnotation = await this.annotations.findOne({
      _id: annotation,
    });
    if (!existingAnnotation) {
      return { error: "Annotation not found." };
    }
    // `resolver canView annotation.recipe` check is external to this concept.
    // For this implementation, we simply assume the caller has appropriate permissions.

    try {
      await this.annotations.updateOne(
        { _id: annotation },
        { $set: { resolved: resolved } },
      );
      return {};
    } catch (e) {
      console.error("Failed to update annotation resolution status:", e);
      return { error: "Failed to resolve annotation." };
    }
  }

  /**
   * deleteAnnotation(author: User, annotation: ID): Empty | (error: string)
   *
   * **requires** annotation exists and author = annotation.author
   *
   * **effects** removes annotation
   */
  async deleteAnnotation({
    author,
    annotation,
  }: {
    author: User;
    annotation: ID;
  }): Promise<Empty | { error: string }> {
    const existingAnnotation = await this.annotations.findOne({
      _id: annotation,
    });
    if (!existingAnnotation) {
      return { error: "Annotation not found." };
    }
    if (existingAnnotation.author !== author) {
      return { error: "Only the author can delete an annotation." };
    }

    try {
      await this.annotations.deleteOne({ _id: annotation });
      return {};
    } catch (e) {
      console.error("Failed to delete annotation:", e);
      return { error: "Failed to delete annotation." };
    }
  }

  // --- Queries ---
  // The concept specification did not explicitly list queries for Annotation,
  // but adding some basic ones for completeness and testability.

  /**
   * _getAnnotationsForRecipe(recipe: ID): (annotation: AnnotationDoc)[] | (error: string)
   *
   * **requires** recipe exists (implicitly, as it will return an empty array if no annotations are found for the given recipe ID)
   *
   * **effects** returns all annotations associated with the given recipe.
   */
  async _getAnnotationsForRecipe({
    recipe,
  }: {
    recipe: ID;
  }): Promise<{ annotation: AnnotationDoc }[] | { error: string }> {
    try {
      const annotations = await this.annotations.find({ recipe }).toArray();
      return annotations.map((a) => ({ annotation: a }));
    } catch (e) {
      console.error("Failed to retrieve annotations for recipe:", e);
      return { error: "Failed to retrieve annotations for recipe." };
    }
  }

  /**
   * _getAnnotationById(annotation: ID): (annotation: AnnotationDoc)[] | (error: string)
   *
   * **requires** annotation exists (implicitly, will return an empty array if not found)
   *
   * **effects** returns the specific annotation by its ID.
   */
  async _getAnnotationById({
    annotation,
  }: {
    annotation: ID;
  }): Promise<{ annotation: AnnotationDoc }[] | { error: string }> {
    try {
      const foundAnnotation = await this.annotations.findOne({
        _id: annotation,
      });
      return foundAnnotation ? [{ annotation: foundAnnotation }] : [];
    } catch (e) {
      console.error("Failed to retrieve annotation by ID:", e);
      return { error: "Failed to retrieve annotation by ID." };
    }
  }
}

```
