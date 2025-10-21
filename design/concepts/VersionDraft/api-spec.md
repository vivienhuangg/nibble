[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)
# Extracting from code

The following is an explanation of how concepts are implemented, for the purposes of understanding how to extract an API.

[@implementing-concepts](../../background/implementing-concepts.md)

# prompt: 

Now, analyze the following Concept Implementation and generate the API documentation based on these instructions.

[@VersionDraftConcept](../../../src/concepts/VersionDraft/VersionDraftConcept.ts)

# response:

```markdown
# API Specification: VersionDraft Concept

**Purpose:** represent a temporary, AI-generated suggestion for a recipe modification, awaiting user review.

---

## API Endpoints

### POST /api/VersionDraft/createDraft

**Description:** Creates a new transient AI-generated version draft.

**Requirements:**
- baseRecipe exists
- goal is not empty
- ingredients and steps are well-formed.

**Effects:**
- A new VersionDraft document is created with a fresh ID, associated with the requester, baseRecipe, and AI-generated content.
- `created` and `expires` timestamps are set.
- Returns the ID of the new draft.

**Request Body:**
```json
{
  "requester": "string",  // User ID
  "baseRecipe": "string", // Recipe ID
  "goal": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "string",    // (optional)
      "notes": "string"    // (optional)
    }
  ],
  "steps": [
    {
      "description": "string",
      "duration": 0,       // (optional) in minutes
      "notes": "string"    // (optional)
    }
  ],
  "notes": "string",
  "confidence": 0.0      // (optional) float
}
```

**Success Response Body (Action):**
```json
{
  "id": "string" // UUID of the created draft
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/VersionDraft/deleteDraft

**Description:** Removes a transient AI-generated version draft.

**Requirements:**
- A VersionDraft with the given `id` exists.

**Effects:**
- The VersionDraft document with the specified `id` is removed from the system.

**Request Body:**
```json
{
  "id": "string" // UUID of the draft to delete
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

### POST /api/VersionDraft/_getDraftById

**Description:** Retrieves a specific version draft by its ID.

**Requirements:**
- A VersionDraft with the given `id` exists.

**Effects:**
- Returns an array containing the VersionDraft document if found, otherwise an empty array or an error.

**Request Body:**
```json
{
  "id": "string" // UUID of the draft to retrieve
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string", // UUID of the draft
    "requester": "string",
    "baseRecipe": "string",
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
        "duration": 0,
        "notes": "string"
      }
    ],
    "notes": "string",
    "confidence": 0.0,
    "created": "YYYY-MM-DDTHH:MM:SS.sssZ", // ISO 8601 format
    "expires": "YYYY-MM-DDTHH:MM:SS.sssZ"  // ISO 8601 format
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

### POST /api/VersionDraft/_listDraftsByRequester

**Description:** Lists all version drafts requested by a specific user.

**Requirements:**
- The requester ID is valid.

**Effects:**
- Returns an array of VersionDraft documents associated with the requester, or an empty array.

**Request Body:**
```json
{
  "requester": "string" // User ID
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string", // UUID of the draft
    "requester": "string",
    "baseRecipe": "string",
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
        "duration": 0,
        "notes": "string"
      }
    ],
    "notes": "string",
    "confidence": 0.0,
    "created": "YYYY-MM-DDTHH:MM:SS.sssZ",
    "expires": "YYYY-MM-DDTHH:MM:SS.sssZ"
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

### POST /api/VersionDraft/_cleanupExpiredDrafts

**Description:** Automatically removes version drafts that have passed their expiry time. (System Action)

**Requirements:**
- The current time is after a draft's `expires` timestamp.

**Effects:**
- All expired VersionDraft documents are removed from the system.

**Request Body:**
```json
{}
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
```