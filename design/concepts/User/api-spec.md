[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)
# Extracting from code

The following is an explanation of how concepts are implemented, for the purposes of understanding how to extract an API.

[@implementing-concepts](../../background/implementing-concepts.md)

# prompt: 

Now, analyze the following Concept Implementation and generate the API documentation based on these instructions.

[@UserConcept](../../../src/concepts/User/UserConcept.ts)
# response:

# API Specification: User Concept

**Purpose:** represent an individual user within the system, enabling personalization, ownership, and access control.

---

## API Endpoints

### POST /api/User/registerUser

**Description:** Creates a new user in the system.

**Requirements:**
- no user with the given `username` already exists.
- `name` and `password` are non-empty strings.

**Effects:**
- creates a new user, stores `name`, `username`, and `passwordHash` (plain password for this exercise);
- initializes `preferences` to an empty map;
- returns the `ID` of the newly created user.

**Request Body:**
```json
{
  "name": "string",
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/User/login

**Description:** Authenticates a user with the provided username and password.

**Requirements:**
- a user with the given `username` and `password` exists.

**Effects:**
- returns the `ID` of the authenticated user.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/User/updateProfile

**Description:** Updates the profile information for a specified user.

**Requirements:**
- the `user` identified by `user: ID` must exist.
- If `newUsername` is provided, it must be unique among other users.

**Effects:**
- updates the `name`, `username`, and/or `preferences` for the specified user.
- Returns an empty object on success.

**Request Body:**
```json
{
  "user": "ID",
  "newName": "string",
  "newUsername": "string",
  "newPreferences": {
    "key": "any"
  }
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

### POST /api/User/_getUserDetails

**Description:** Returns the details (name, username, preferences) of the specified user.

**Requirements:**
- a user with the given `user: ID` exists.

**Effects:**
- returns the details (name, username, preferences) of the specified user.

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": {
      "name": "string",
      "username": "string",
      "preferences": {
        "key": "any"
      }
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

### POST /api/User/_getUserIDByUsername

**Description:** Returns the ID of the user with the specified username.

**Requirements:**
- a user with the given `username` exists.

**Effects:**
- returns the ID of the user with the specified username.

**Request Body:**
```json
{
  "username": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "user": "ID"
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