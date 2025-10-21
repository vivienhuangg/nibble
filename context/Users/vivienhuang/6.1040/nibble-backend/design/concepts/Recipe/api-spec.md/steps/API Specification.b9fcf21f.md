---
timestamp: 'Mon Oct 20 2025 20:39:46 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_203946.db1c486a.md]]'
content_id: b9fcf21f119d92834419777be10e0a02aca28946358a268ea35b4516105afd5f
---

# API Specification: Recipe Concept

**Purpose:** represent a canonical recipe owned by a user, with its core ingredients, steps, and descriptive metadata.

***

## API Endpoints

### POST /api/Recipe/createRecipe

**Description:** Adds a new recipe with an empty tag set, sets creation and update times, and returns the new recipe's ID.

**Requirements:**

* owner exists; title ≠ ""; ingredients and steps well-formed

**Effects:**

* adds new recipe with empty tag set, sets creation/update times; returns the new recipe's ID

**Request Body:**

```json
{
  "owner": "ID",
  "title": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "string (optional)",
      "notes": "string (optional)"
    }
  ],
  "steps": [
    {
      "description": "string",
      "duration": "number (optional)",
      "notes": "string (optional)"
    }
  ],
  "description": "string (optional)"
}
```

**Success Response Body (Action):**

```json
{
  "recipe": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Recipe/addTag

**Description:** Adds a tag to an existing recipe.

**Requirements:**

* recipe exists

**Effects:**

* tag ∈ recipe.tags

**Request Body:**

```json
{
  "recipe": "ID",
  "tag": "string"
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

### POST /api/Recipe/removeTag

**Description:** Removes a tag from an existing recipe.

**Requirements:**

* tag ∈ recipe.tags

**Effects:**

* tag ∉ recipe.tags

**Request Body:**

```json
{
  "recipe": "ID",
  "tag": "string"
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

### POST /api/Recipe/deleteRecipe

**Description:** Removes a recipe and triggers cascade deletion of related Versions and Annotations (via sync).

**Requirements:**

* requester = recipe.owner

**Effects:**

* removes recipe and triggers cascade deletion of related Versions and Annotations (via sync)

**Request Body:**

```json
{
  "requester": "ID",
  "recipe": "ID"
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

### POST /api/Recipe/updateRecipeDetails

**Description:** Updates specified fields of a recipe and its `updated` timestamp.

**Requirements:**

* owner = recipe.owner

**Effects:**

* updates specified fields and `updated` timestamp.

**Request Body:**

```json
{
  "owner": "ID",
  "recipe": "ID",
  "newTitle": "string (optional)",
  "newDescription": "string (optional)",
  "newIngredients": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "string (optional)",
      "notes": "string (optional)"
    }
  ],
  "newSteps": [
    {
      "description": "string",
      "duration": "number (optional)",
      "notes": "string (optional)"
    }
  ]
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

### POST /api/Recipe/\_getRecipeById

**Description:** Returns the full Recipe document for a given recipe ID.

**Requirements:**

* recipe exists

**Effects:**

* returns the full Recipe document

**Request Body:**

```json
{
  "recipe": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "recipe": {
      "_id": "ID",
      "owner": "ID",
      "title": "string",
      "description": "string (optional)",
      "ingredients": [
        {
          "name": "string",
          "quantity": "string",
          "unit": "string (optional)",
          "notes": "string (optional)"
        }
      ],
      "steps": [
        {
          "description": "string",
          "duration": "number (optional)",
          "notes": "string (optional)"
        }
      ],
      "tags": ["string"],
      "created": "Date (ISO 8601 string)",
      "updated": "Date (ISO 8601 string)"
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

### POST /api/Recipe/\_listRecipesByOwner

**Description:** Returns all recipes owned by the specified user.

**Requirements:**

* owner exists

**Effects:**

* returns all recipes owned by the specified user

**Request Body:**

```json
{
  "owner": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "recipe": {
      "_id": "ID",
      "owner": "ID",
      "title": "string",
      "description": "string (optional)",
      "ingredients": [
        {
          "name": "string",
          "quantity": "string",
          "unit": "string (optional)",
          "notes": "string (optional)"
        }
      ],
      "steps": [
        {
          "description": "string",
          "duration": "number (optional)",
          "notes": "string (optional)"
        }
      ],
      "tags": ["string"],
      "created": "Date (ISO 8601 string)",
      "updated": "Date (ISO 8601 string)"
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

### POST /api/Recipe/\_searchRecipesByTag

**Description:** Returns all recipes containing the specified tag.

**Requirements:**

* tag is non-empty

**Effects:**

* returns all recipes containing the specified tag

**Request Body:**

```json
{
  "tag": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "recipe": {
      "_id": "ID",
      "owner": "ID",
      "title": "string",
      "description": "string (optional)",
      "ingredients": [
        {
          "name": "string",
          "quantity": "string",
          "unit": "string (optional)",
          "notes": "string (optional)"
        }
      ],
      "steps": [
        {
          "description": "string",
          "duration": "number (optional)",
          "notes": "string (optional)"
        }
      ],
      "tags": ["string"],
      "created": "Date (ISO 8601 string)",
      "updated": "Date (ISO 8601 string)"
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
