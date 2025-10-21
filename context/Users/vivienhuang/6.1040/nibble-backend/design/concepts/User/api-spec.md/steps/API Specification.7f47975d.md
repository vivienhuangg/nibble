---
timestamp: 'Mon Oct 20 2025 20:40:32 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_204032.5df05b24.md]]'
content_id: 7f47975d0da959460489f57987ad2484ddb3b3301c3f87e265151368d0ef1f79
---

# API Specification: User Concept

**Purpose:** represent an individual user within the system, enabling personalization, ownership, and access control.

***

## API Endpoints

### POST /api/User/registerUser

**Description:** Creates a new user in the system.

**Requirements:**

* no user with the given `email` already exists.
* `name` and `password` are non-empty strings.

**Effects:**

* creates a new user, stores `name`, `email`, and `passwordHash` (plain password for this exercise);
* initializes `preferences` to an empty map;
* returns the `ID` of the newly created user.

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
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

***

### POST /api/User/login

**Description:** Authenticates a user with the provided email and password.

**Requirements:**

* a user with the given `email` and `password` exists.

**Effects:**

* returns the `ID` of the authenticated user.

**Request Body:**

```json
{
  "email": "string",
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

***

### POST /api/User/updateProfile

**Description:** Updates the profile information for a specified user.

**Requirements:**

* the `user` identified by `user: ID` must exist.
* If `newEmail` is provided, it must be unique among other users.

**Effects:**

* updates the `name`, `email`, and/or `preferences` for the specified user.
* Returns an empty object on success.

**Request Body:**

```json
{
  "user": "ID",
  "newName": "string",
  "newEmail": "string",
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

***

### POST /api/User/\_getUserDetails

**Description:** Returns the details (name, email, preferences) of the specified user.

**Requirements:**

* a user with the given `user: ID` exists.

**Effects:**

* returns the details (name, email, preferences) of the specified user.

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
      "email": "string",
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

***

### POST /api/User/\_getUserIDByEmail

**Description:** Returns the ID of the user with the specified email.

**Requirements:**

* a user with the given `email` exists.

**Effects:**

* returns the ID of the user with the specified email.

**Request Body:**

```json
{
  "email": "string"
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

***
