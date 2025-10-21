[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)
# Extracting from code

The following is an explanation of how concepts are implemented, for the purposes of understanding how to extract an API.

[@implementing-concepts](../../background/implementing-concepts.md)

# prompt: 

Now, analyze the following Concept Implementation and generate the API documentation based on these instructions.

[@NotebookConcept](../../../src/concepts/Notebook/NotebookConcept.ts)
# response:

# API Specification: Notebook Concept

**Purpose:** organize shared collections of recipes and manage collaborative access.

---

## API Endpoints

### POST /api/Notebook/createNotebook

**Description:** Creates a new notebook with a specified owner and title, optionally including a description.

**Requirements:**
- title ≠ ""

**Effects:**
- creates new notebook with owner ∈ members, sets `created`

**Request Body:**
```json
{
  "owner": "ID",
  "title": "string",
  "description": "string"
}
```

**Success Response Body (Action):**
```json
{
  "notebook": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Notebook/inviteMember

**Description:** Invites a user to become a member of an existing notebook.

**Requirements:**
- owner = notebook.owner ∧ member exists

**Effects:**
- member ∈ notebook.members

**Request Body:**
```json
{
  "owner": "ID",
  "notebook": "ID",
  "member": "ID"
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

### POST /api/Notebook/removeMember

**Description:** Removes a member from a notebook.

**Requirements:**
- owner = notebook.owner ∧ member ∈ notebook.members ∧ member ≠ owner

**Effects:**
- member ∉ notebook.members

**Request Body:**
```json
{
  "owner": "ID",
  "notebook": "ID",
  "member": "ID"
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

### POST /api/Notebook/shareRecipe

**Description:** Shares a recipe into a specific notebook.

**Requirements:**
- sharer = recipe.owner ∨ sharer ∈ notebook.members

**Effects:**
- recipe ∈ notebook.recipes (if not already present)

**Request Body:**
```json
{
  "sharer": "ID",
  "recipe": "ID",
  "notebook": "ID"
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

### POST /api/Notebook/unshareRecipe

**Description:** Unshares a recipe from a specific notebook.

**Requirements:**
- requester = recipe.owner ∨ requester = notebook.owner

**Effects:**
- recipe ∉ notebook.recipes

**Request Body:**
```json
{
  "requester": "ID",
  "recipe": "ID",
  "notebook": "ID"
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

### POST /api/Notebook/deleteNotebook

**Description:** Deletes an existing notebook.

**Requirements:**
- owner = notebook.owner

**Effects:**
- removes notebook and triggers associated unsharing.

**Request Body:**
```json
{
  "owner": "ID",
  "notebook": "ID"
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

### POST /api/Notebook/_getNotebookById

**Description:** Retrieves a specific notebook document by its ID.

**Requirements:**
- notebook exists

**Effects:**
- returns the notebook document

**Request Body:**
```json
{
  "notebook": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "ID",
    "owner": "ID",
    "title": "string",
    "description": "string",
    "members": "ID[]",
    "recipes": "ID[]",
    "created": "string"
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

### POST /api/Notebook/_getNotebooksByOwner

**Description:** Retrieves all notebooks owned by a specified user.

**Requirements:**
- owner exists

**Effects:**
- returns all notebooks owned by the specified user

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
    "_id": "ID",
    "owner": "ID",
    "title": "string",
    "description": "string",
    "members": "ID[]",
    "recipes": "ID[]",
    "created": "string"
  }
]
```

**Error Response Body:**
```json
{
