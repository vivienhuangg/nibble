
[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)
# Extracting from code

The following is an explanation of how concepts are implemented, for the purposes of understanding how to extract an API.

[@implementing-concepts](../../background/implementing-concepts.md)

# prompt: 

Now, analyze the following Concept Implementation and generate the API documentation based on these instructions.

[@AnnotationConcept](../../../src/concepts/Annotation/AnnotationConcept.ts)
# response:

# API Specification: Annotation Concept

**Purpose:** capture contextual notes on a specific ingredient or step without altering the recipe.

---

## API Endpoints

### POST /api/Annotation/annotate

**Description:** Adds a new unresolved annotation to a recipe, associating text with a specific ingredient or step.

**Requirements:**
- recipe exists
- text ≠ ""
- 0 ≤ index < |target list| for targetKind

**Effects:**
- adds new unresolved annotation
- sets `created`

**Request Body:**
```json
{
  "author": "string (User ID)",
  "recipe": "string (Recipe ID)",
  "targetKind": "string ('Ingredient' | 'Step')",
  "index": "number",
  "text": "string"
}
```

**Success Response Body (Action):**
```json
{
  "annotation": "string (Annotation ID)"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Annotation/editAnnotation

**Description:** Allows the author to modify the text of an existing annotation.

**Requirements:**
- annotation exists
- author = annotation.author

**Effects:**
- annotation.text := newText

**Request Body:**
```json
{
  "author": "string (User ID)",
  "annotation": "string (Annotation ID)",
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

---

### POST /api/Annotation/resolveAnnotation

**Description:** Changes the resolution status of an annotation.

**Requirements:**
- annotation exists
- resolver canView annotation.recipe

**Effects:**
- annotation.resolved := resolved

**Request Body:**
```json
{
  "resolver": "string (User ID)",
  "annotation": "string (Annotation ID)",
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

---

### POST /api/Annotation/deleteAnnotation

**Description:** Removes an existing annotation, but only if performed by its author.

**Requirements:**
- annotation exists
- author = annotation.author

**Effects:**
- removes annotation

**Request Body:**
```json
{
  "author": "string (User ID)",
  "annotation": "string (Annotation ID)"
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

---

### POST /api/Annotation/_getAnnotationsForRecipe

**Description:** Retrieves all annotations associated with a specific recipe.

**Requirements:**
- recipe exists (implicitly, as it will return an empty array if no annotations are found for the given recipe ID)

**Effects:**
- returns all annotations associated with the given recipe.

**Request Body:**
```json
{
  "recipe": "string (Recipe ID)"
}
```

**Success Response Body (Query):**
```json
[
  {
    "annotation": {
      "_id": "string (Annotation ID)",
      "author": "string (User ID)",
      "recipe": "string (Recipe ID)",
      "targetKind": "string ('Ingredient' | 'Step')",
      "targetIndex": "number",
      "text": "string",
      "created": "string (ISO 8601 DateTime)",
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

---

### POST /api/Annotation/_getAnnotationById

**Description:** Retrieves a specific annotation by its unique ID.

**Requirements:**
- annotation exists (implicitly, will return an empty array if not found)

**Effects:**
- returns the specific annotation by its ID.

**Request Body:**
```json
{
  "annotation": "string (Annotation ID)"
}
```

**Success Response Body (Query):**
```json
[
  {
    "annotation": {
      "_id": "string (Annotation ID)",
      "author": "string (User ID)",
      "recipe": "string (Recipe ID)",
      "targetKind": "string ('Ingredient' | 'Step')",
      "targetIndex": "number",
      "text": "string",
      "created": "string (ISO 8601 DateTime)",
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