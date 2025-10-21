---
timestamp: 'Mon Oct 20 2025 20:41:39 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_204139.44ceff06.md]]'
content_id: d73c28ccaa367f7623977bad0e762d5c7bdbd406fd58c93615a9e77d5fc8ecab
---

# API Specification: Version Concept

**Purpose:** capture concrete modifications to a recipe as immutable snapshots — with optional AI assistance that can propose draft versions from natural-language goals.

***

## API Endpoints

### POST /api/Version/createVersion

**Description:** Creates a new immutable version of a recipe.

**Requirements:**

* recipe exists
* versionNum unique for recipe (e.g., "1.0", "1.1", "2.0")
* ingredients/steps must be well-formed.

**Effects:**

* adds new version linked to recipe, sets `created`
* returns the ID of the new version.

**Request Body:**

```json
{
  "author": "string",
  "recipe": "string",
  "versionNum": "string",
  "notes": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "string",
      "notes": "string"
    }
  ],
  "steps": [
    {
      "description": "string",
      "duration": "number",
      "notes": "string"
    }
  ],
  "promptHistory": [
    {
      "promptText": "string",
      "modelName": "string",
      "timestamp": "string (ISO 8601)",
      "draftId": "string",
      "status": "Approved | Rejected | Generated | Failed"
    }
  ]
}
```

**Success Response Body (Action):**

```json
{
  "version": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Version/deleteVersion

**Description:** Deletes a specific recipe version.

**Requirements:**

* requester = version.author OR requester = recipe.owner (the latter check is typically handled by sync with Recipe concept).

**Effects:**

* removes version.

**Request Body:**

```json
{
  "requester": "string",
  "version": "string"
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

### POST /api/Version/draftVersionWithAI

**Description:** Initiates an AI-driven process to suggest modifications to a recipe, outputting data to create a transient draft.

**Requirements:**

* recipe exists
* goal ≠ ""
* (LLM service available externally).

**Effects:**

* Simulates an LLM call to get proposed changes
* outputs all data necessary for a sync to create a `VersionDraft`.
* Does not directly modify `Version` concept state, as `promptHistory` is populated when a draft is approved into a concrete version.

**Request Body:**

```json
{
  "author": "string",
  "recipe": "string",
  "goal": "string",
  "options": {}
}
```

**Success Response Body (Action):**

```json
{
  "draftId": "string",
  "baseRecipe": "string",
  "requester": "string",
  "goal": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "string",
      "notes": "string"
    }
  ],
  "steps": [
    {
      "description": "string",
      "duration": "number",
      "notes": "string"
    }
  ],
  "notes": "string",
  "confidence": "number",
  "created": "string (ISO 8601)",
  "expires": "string (ISO 8601)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Version/approveDraft

**Description:** Approves a specific AI-generated draft, initiating its promotion to an official immutable version and the deletion of the transient draft.

**Requirements:**

* draft exists (implicitly, as `draftId` and `draftDetails` are passed)
* author is the requester of the draft (implicitly handled by sync/client)
* newVersionNum unique for recipe.

**Effects:**

* Outputs data to trigger: 1) creation of a new `Version` (including the approved `promptHistoryEntry`), and 2) deletion of the `VersionDraft`.
* This action does not directly modify `Version` concept state, but prepares the data for a new `Version` record to be created via sync.

**Request Body:**

```json
{
  "author": "string",
  "draftId": "string",
  "baseRecipe": "string",
  "newVersionNum": "string",
  "draftDetails": {
    "ingredients": [
      {
        "name": "string",
        "quantity": "string",
        "unit": "string",
        "notes": "string"
      }
    ],
    "steps": [
      {
        "description": "string",
        "duration": "number",
        "notes": "string"
      }
    ],
    "notes": "string",
    "goal": "string",
    "confidence": "number"
  }
}
```

**Success Response Body (Action):**

```json
{
  "newVersionId": "string",
  "author": "string",
  "recipe": "string",
  "versionNum": "string",
  "notes": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "string",
      "notes": "string"
    }
  ],
  "steps": [
    {
      "description": "string",
      "duration": "number",
      "notes": "string"
    }
  ],
  "draftToDeleteId": "string",
  "promptHistoryEntry": {
    "promptText": "string",
    "modelName": "string",
    "timestamp": "string (ISO 8601)",
    "draftId": "string",
    "status": "Approved | Rejected | Generated | Failed"
  }
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Version/rejectDraft

**Description:** Rejects a specific AI-generated draft, initiating its removal from transient drafts.

**Requirements:**

* draft exists (implicitly via `draftId`)
* author is the requester of the draft (implicitly handled by sync/client).

**Effects:**

* Outputs data to trigger deletion of the `VersionDraft`.
* Also outputs a `promptHistoryEntry` with "Rejected" status.
* This `promptHistoryEntry` is not stored within the `Version` concept itself by this action, as no `VersionDoc` is created from a rejected draft.

**Request Body:**

```json
{
  "author": "string",
  "draftId": "string",
  "baseRecipe": "string",
  "goal": "string"
}
```

**Success Response Body (Action):**

```json
{
  "draftToDeleteId": "string",
  "promptHistoryEntry": {
    "promptText": "string",
    "modelName": "string",
    "timestamp": "string (ISO 8601)",
    "draftId": "string",
    "status": "Approved | Rejected | Generated | Failed"
  }
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Version/\_getVersionById

**Description:** Retrieves a specific recipe version by its ID.

**Requirements:**

* The version ID exists.

**Effects:**

* Returns an array containing the Version document if found, otherwise an empty array or an error.

**Request Body:**

```json
{
  "version": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "baseRecipe": "string",
    "versionNum": "string",
    "author": "string",
    "notes": "string",
    "ingredients": [
      {
        "name": "string",
        "quantity": "string",
        "unit": "string",
        "notes": "string"
      }
    ],
    "steps": [
      {
        "description": "string",
        "duration": "number",
        "notes": "string"
      }
    ],
    "created": "string (ISO 8601)",
    "promptHistory": [
      {
        "promptText": "string",
        "modelName": "string",
        "timestamp": "string (ISO 8601)",
        "draftId": "string",
        "status": "Approved | Rejected | Generated | Failed"
      }
    ]
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

### POST /api/Version/\_listVersionsByRecipe

**Description:** Lists all versions associated with a specific base recipe.

**Requirements:**

* The recipe ID exists.

**Effects:**

* Returns an array of Version documents for the given recipe, ordered by creation time.

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
    "id": "string",
    "baseRecipe": "string",
    "versionNum": "string",
    "author": "string",
    "notes": "string",
    "ingredients": [
      {
        "name": "string",
        "quantity": "string",
        "unit": "string",
        "notes": "string"
      }
    ],
    "steps": [
      {
        "description": "string",
        "duration": "number",
        "notes": "string"
      }
    ],
    "created": "string (ISO 8601)",
    "promptHistory": [
      {
        "promptText": "string",
        "modelName": "string",
        "timestamp": "string (ISO 8601)",
        "draftId": "string",
        "status": "Approved | Rejected | Generated | Failed"
      }
    ]
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

### POST /api/Version/\_listVersionsByAuthor

**Description:** Lists all versions authored by a specific user.

**Requirements:**

* The author ID exists.

**Effects:**

* Returns an array of Version documents authored by the given user.

**Request Body:**

```json
{
  "author": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "baseRecipe": "string",
    "versionNum": "string",
    "author": "string",
    "notes": "string",
    "ingredients": [
      {
        "name": "string",
        "quantity": "string",
        "unit": "string",
        "notes": "string"
      }
    ],
    "steps": [
      {
        "description": "string",
        "duration": "number",
        "notes": "string"
      }
    ],
    "created": "string (ISO 8601)",
    "promptHistory": [
      {
        "promptText": "string",
        "modelName": "string",
        "timestamp": "string (ISO 8601)",
        "draftId": "string",
        "status": "Approved | Rejected | Generated | Failed"
      }
    ]
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
