---
timestamp: 'Mon Oct 20 2025 20:10:13 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_201013.a5ff5d4e.md]]'
content_id: 46cd8d68e98f0d815968e7eb708ea2d3631dd8c8c79bea3bdde369ade9e81246
---

# API Specification: Annotation Concept

**Purpose:** capture contextual notes on a specific ingredient or step without altering the recipe.

***

## API Endpoints

### POST /api/Annotation/annotate

**Description:** Adds a new contextual note to a specific ingredient or step of a recipe.

**Requirements:**

* recipe exists;
* text ≠ "";
* 0 ≤ index < |target list| for targetKind (Note: `recipe exists` and `target list` validation are assumed to be handled by higher-level logic or syncs, as the Annotation concept operates polymorphically on Recipe IDs and doesn't know their internal structure. `text` emptiness is validated here.)

**Effects:**

* adds new unresolved annotation, sets `created`

**Request Body:**

```json
{
  "author": "string",
  "recipe": "string",
  "targetKind": "string",
  "index": "number",
  "text": "string"
}
```

**Success Response Body (Action):**

```json
{
  "annotation": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Annotation/editAnnotation

**Description:** Modifies the text of an existing annotation.

**Requirements:**

* annotation exists and author = annotation.author

**Effects:**

* annotation.text := newText

**Request Body:**

```json
{
  "author": "string",
  "annotation": "string",
  "newText": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Annotation/resolveAnnotation

**Description:** Changes the resolution status of an annotation (marks it as resolved or unresolved).

**Requirements:**

* annotation exists and resolver canView annotation.recipe (Note: `canView` validation is external to this concept and should be handled by higher-level logic or syncs.)

**Effects:**

* annotation.resolved := resolved

**Request Body:**

```json
{
  "resolver": "string",
  "annotation": "string",
  "resolved": "boolean"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Annotation/deleteAnnotation

**Description:** Removes an annotation from the system.

**Requirements:**

* annotation exists and author = annotation.author

**Effects:**

* removes annotation

**Request Body:**

```json
{
  "author": "string",
  "annotation": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Annotation/\_getAnnotationsForRecipe

**Description:** Retrieves all annotations associated with a specific recipe.

**Requirements:**

* recipe exists (implicitly, as it will return an empty array if no annotations are found for the given recipe ID)

**Effects:**

* returns all annotations associated with the given recipe.

**Request Body:**

```json
{
  "recipe": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "annotation": {
      "_id": "string",
      "author": "string",
      "recipe": "string",
      "targetKind": "string",
      "targetIndex": "number",
      "text": "string",
      "created": "string",
      "resolved": "boolean"
    }
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Annotation/\_getAnnotationById

**Description:** Retrieves a specific annotation by its ID.

**Requirements:**

* annotation exists (implicitly, will return an empty array if not found)

**Effects:**

* returns the specific annotation by its ID.

**Request Body:**

```json
{
  "annotation": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "annotation": {
      "_id": "string",
      "author": "string",
      "recipe": "string",
      "targetKind": "string",
      "targetIndex": "number",
      "text": "string",
      "created": "string",
      "resolved": "boolean"
    }
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
