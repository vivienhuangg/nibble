---
timestamp: 'Mon Oct 20 2025 20:34:41 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_203441.854559ec.md]]'
content_id: 54597a0b248963df5cd98be876a40f661cfa66653b146d0b79cc91d25cd08d15
---

# API Specification: Annotation Concept

**Purpose:** capture contextual notes on a specific ingredient or step without altering the recipe.

***

## API Endpoints

### POST /api/Annotation/annotate

**Description:** Creates a new annotation for a specific ingredient or step within a recipe.

**Requirements:**

* `recipe` exists
* `text` is not empty (`text ≠ ""`)
* `index` is a valid position within the target list (`0 ≤ index < |target list| for targetKind`)

**Effects:**

* Adds a new unresolved annotation.
* Sets the `created` timestamp for the new annotation.

**Request Body:**

```json
{
  "author": "string", // User ID
  "recipe": "string", // Recipe ID
  "targetKind": "string", // "Ingredient" or "Step"
  "index": "number",
  "text": "string"
}
```

**Success Response Body (Action):**

```json
{
  "annotation": "string" // ID of the newly created annotation
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

* The `author` of the request must be the same as the `annotation`'s author (`author = annotation.author`).

**Effects:**

* Updates the `text` of the specified `annotation` to `newText` (`annotation.text := newText`).

**Request Body:**

```json
{
  "author": "string", // User ID
  "annotation": "string", // Annotation ID
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

**Description:** Sets the resolved status of an annotation.

**Requirements:**

* The `resolver` must have permission to view the `annotation`'s recipe (`resolver canView annotation.recipe`).

**Effects:**

* Updates the `resolved` status of the specified `annotation` to the provided `resolved` value (`annotation.resolved := resolved`).

**Request Body:**

```json
{
  "resolver": "string", // User ID
  "annotation": "string", // Annotation ID
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

**Description:** Deletes an existing annotation.

**Requirements:**

* The `author` of the request must be the same as the `annotation`'s author (`author = annotation.author`).

**Effects:**

* Removes the specified `annotation` from the system.

**Request Body:**

```json
{
  "author": "string", // User ID
  "annotation": "string" // Annotation ID
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
