---
timestamp: 'Sat Oct 18 2025 21:42:51 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_214251.8cc49fa2.md]]'
content_id: 6aab776369c0d57abb56c8b55deedf2b6683add3fed701473891b6e02eca3e9e
---

# file: src/concepts/User/UserConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

/**
 * @concept User
 * @purpose represent an individual user within the system, enabling personalization, ownership, and access control.
 * @principle users are the primary actors and owners of content.
 */

// Declare collection prefix, use concept name
const PREFIX = "User" + ".";

// Define the structure of a User document in MongoDB
interface UserDoc {
  _id: ID;
  name: string;
  email: string;
  // IMPORTANT: In a production environment, passwords should ALWAYS be hashed
  // (e.g., using bcrypt) and never stored in plain text.
  // For the purpose of this exercise, we store it as a string to simplify.
  passwordHash: string;
  preferences: Record<string, unknown>; // Maps[String, Any]
}

export default class UserConcept {
  users: Collection<UserDoc>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
    // Ensure email is indexed for uniqueness and efficient lookup
    this.users.createIndex({ email: 1 }, { unique: true });
  }

  /**
   * registerUser (name: String, email: String, password: String): (user: ID)
   *
   * @requires no user with the given `email` already exists. `name` and `password` are non-empty strings.
   * @effects creates a new user, stores `name`, `email`, and `passwordHash` (plain password for this exercise);
   *          initializes `preferences` to an empty map; returns the `ID` of the newly created user.
   */
  async registerUser({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: ID } | { error: string }> {
    console.log(`Action: registerUser (name: ${name}, email: ${email})`);

    // Requirement: non-empty name, email, password
    if (!name || !email || !password) {
      console.log("  Failed: Name, email, or password cannot be empty.");
      return { error: "Name, email, and password cannot be empty." };
    }

    // Requirement: no user with the given email already exists
    const existingUser = await this.users.findOne({ email });
    if (existingUser) {
      console.log(`  Failed: User with email '${email}' already exists.`);
      return { error: "A user with this email already exists." };
    }

    const newUserId = freshID();
    const newUser: UserDoc = {
      _id: newUserId,
      name,
      email,
      passwordHash: password, // Storing plain password for exercise
      preferences: {}, // Initialize with empty preferences
    };

    await this.users.insertOne(newUser);
    console.log(`  Effect: User '${name}' registered with ID: ${newUserId}`);
    return { user: newUserId };
  }

  /**
   * login (email: String, password: String): (user: ID)
   *
   * @requires a user with the given `email` and `password` exists.
   * @effects returns the `ID` of the authenticated user.
   */
  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ user: ID } | { error: string }> {
    console.log(`Action: login (email: ${email})`);

    if (!email || !password) {
      console.log("  Failed: Email and password cannot be empty.");
      return { error: "Email and password cannot be empty." };
    }

    const user = await this.users.findOne({ email });

    // Requirement: user exists and password matches
    // In a real app, 'password' would be hashed and compared securely
    if (!user || user.passwordHash !== password) {
      console.log("  Failed: Invalid email or password.");
      return { error: "Invalid email or password." };
    }

    console(`  Effect: User ID '${user._id}' logged in successfully.`);
    return { user: user._id };
  }

  /**
   * updateProfile (user: ID, newName?: String, newEmail?: String, newPreferences?: Map[String, Any]): Empty
   *
   * @requires the `user` identified by `user: ID` must exist. If `newEmail` is provided, it must be unique among other users.
   * @effects updates the `name`, `email`, and/or `preferences` for the specified user.
   *          Returns an empty object on success.
   */
  async updateProfile({
    user: userId,
    newName,
    newEmail,
    newPreferences,
  }: {
    user: ID;
    newName?: string;
    newEmail?: string;
    newPreferences?: Record<string, unknown>;
  }): Promise<Empty | { error: string }> {
    console.log(`Action: updateProfile (user: ${userId}, newName: ${newName}, newEmail: ${newEmail}, newPreferences: ${JSON.stringify(newPreferences)})`);

    const existingUser = await this.users.findOne({ _id: userId });
    // Requirement: user must exist
    if (!existingUser) {
      console.log(`  Failed: User with ID '${userId}' not found.`);
      return { error: "User not found." };
    }

    const updateFields: Partial<UserDoc> = {};

    if (newName !== undefined) {
      if (typeof newName !== "string" || newName.trim() === "") {
        console.log("  Failed: New name must be a non-empty string.");
        return { error: "New name must be a non-empty string." };
      }
      updateFields.name = newName;
      console.log(`  Updating name to: ${newName}`);
    }

    if (newEmail !== undefined) {
      if (typeof newEmail !== "string" || newEmail.trim() === "") {
        console.log("  Failed: New email must be a non-empty string.");
        return { error: "New email must be a non-empty string." };
      }
      // Requirement: new email must be unique
      const userWithNewEmail = await this.users.findOne({ email: newEmail });
      if (userWithNewEmail && userWithNewEmail._id !== userId) {
        console.log(`  Failed: Email '${newEmail}' is already taken by another user.`);
        return { error: "This email is already taken by another user." };
      }
      updateFields.email = newEmail;
      console.log(`  Updating email to: ${newEmail}`);
    }

    if (newPreferences !== undefined) {
      if (typeof newPreferences !== "object" || newPreferences === null) {
        console.log("  Failed: New preferences must be a valid object.");
        return { error: "New preferences must be a valid object." };
      }
      // Merge new preferences with existing ones
      updateFields.preferences = { ...existingUser.preferences, ...newPreferences };
      console.log(`  Updating preferences: ${JSON.stringify(updateFields.preferences)}`);
    }

    if (Object.keys(updateFields).length > 0) {
      await this.users.updateOne({ _id: userId }, { $set: updateFields });
      console.log(`  Effect: User '${userId}' profile updated.`);
    } else {
      console.log("  No fields provided for update. No changes made.");
    }

    return {}; // Success (Empty object)
  }

  // --- Queries (as defined by "Concept queries" section) ---
  /**
   * _getUserDetails (user: ID): (user: { name: String, email: String, preferences: Map[String, Any] })
   *
   * @requires a user with the given `user: ID` exists.
   * @effects returns the details (name, email, preferences) of the specified user as an array containing one dictionary.
   */
  async _getUserDetails({ user: userId }: {
    user: ID;
  }): Promise<
    Array<{
      user: { name: string; email: string; preferences: Record<string, unknown> };
    }> | { error: string }
  > {
    console.log(`Query: _getUserDetails (user: ${userId})`);

    const user = await this.users.findOne(
      { _id: userId },
      { projection: { name: 1, email: 1, preferences: 1, _id: 0 } }, // Exclude _id and passwordHash
    );

    if (!user) {
      console.log(`  Failed: User with ID '${userId}' not found.`);
      return { error: "User not found." };
    }

    console.log(`  Result: Found user details for ID '${userId}'.`);
    return [{ user: { name: user.name, email: user.email, preferences: user.preferences } }];
  }

  /**
   * _getUserIDByEmail (email: String): (user: ID)
   *
   * @requires a user with the given `email` exists.
   * @effects returns the ID of the user with the specified email as an array containing one dictionary.
   */
  async _getUserIDByEmail({ email }: { email: string }): Promise<Array<{ user: ID }> | { error: string }> {
    console.log(`Query: _getUserIDByEmail (email: ${email})`);

    if (!email) {
      console.log("  Failed: Email cannot be empty for query.");
      return { error: "Email cannot be empty." };
    }

    const user = await this.users.findOne({ email }, { projection: { _id: 1 } });
    if (!user) {
      console.log(`  Failed: User with email '${email}' not found.`);
      return { error: "User not found." };
    }

    console.log(`  Result: Found user ID '${user._id}' for email '${email}'.`);
    return [{ user: user._id }];
  }
}
```
