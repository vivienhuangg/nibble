import type { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import type { Empty, ID } from "@utils/types.ts";

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
  username: string;
  // IMPORTANT: In a production environment, passwords should ALWAYS be hashed
  // (e.g., using bcrypt) and never stored in plain text.
  // For the purpose of this exercise, we store it as a string.
  passwordHash: string;
  preferences: Record<string, unknown>; // Map[String, Any]
}

export default class UserConcept {
  users: Collection<UserDoc>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
    // Ensure username is indexed for uniqueness and efficient lookup
    this.users.createIndex({ username: 1 }, { unique: true });
  }

  /**
   * registerUser (name: String, username: String, password: String): (user: ID)
   *
   * @requires no user with the given `username` already exists. `name` and `password` are non-empty strings.
   * @effects creates a new user, stores `name`, `username`, and `passwordHash` (plain password for this exercise);
   *          initializes `preferences` to an empty map; returns the `ID` of the newly created user.
   */
  async registerUser({
    name,
    username,
    password,
  }: {
    name: string;
    username: string;
    password: string;
  }): Promise<{ user: ID } | { error: string }> {
    if (!name || !username || !password) {
      return { error: "Name, username, and password cannot be empty." };
    }

    // Check if user with this username already exists
    const existingUser = await this.users.findOne({ username });
    if (existingUser) {
      return { error: "A user with this username already exists." };
    }

    const newUserId = freshID();
    const newUser: UserDoc = {
      _id: newUserId,
      name,
      username,
      passwordHash: password, // Storing plain password for exercise, see security note above
      preferences: {},
    };

    await this.users.insertOne(newUser);
    return { user: newUserId };
  }

  /**
   * login (username: String, password: String): (user: ID)
   *
   * @requires a user with the given `username` and `password` exists.
   * @effects returns the `ID` of the authenticated user.
   */
  async login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ user: ID } | { error: string }> {
    if (!username || !password) {
      return { error: "Username and password cannot be empty." };
    }

    const user = await this.users.findOne({ username });

    // In a real app, 'password' would be hashed and compared securely
    if (!user || user.passwordHash !== password) {
      return { error: "Invalid username or password." };
    }

    return { user: user._id };
  }

  /**
   * updateProfile (user: ID, newName?: String, newUsername?: String, newPreferences?: Map[String, Any]): Empty
   *
   * @requires the `user` identified by `user: ID` must exist. If `newUsername` is provided, it must be unique among other users.
   * @effects updates the `name`, `username`, and/or `preferences` for the specified user.
   *          Returns an empty object on success.
   */
  async updateProfile({
    user: userId,
    newName,
    newUsername,
    newPreferences,
  }: {
    user: ID;
    newName?: string;
    newUsername?: string;
    newPreferences?: Record<string, unknown>;
  }): Promise<Empty | { error: string }> {
    const existingUser = await this.users.findOne({ _id: userId });
    if (!existingUser) {
      return { error: "User not found." };
    }

    const updateFields: Partial<UserDoc> = {};

    if (newName !== undefined) {
      if (typeof newName !== "string" || newName.trim() === "") {
        return { error: "New name must be a non-empty string." };
      }
      updateFields.name = newName;
    }

    if (newUsername !== undefined) {
      if (typeof newUsername !== "string" || newUsername.trim() === "") {
        return { error: "New username must be a non-empty string." };
      }
      // Check if new username is already taken by another user
      const userWithNewUsername = await this.users.findOne({ username: newUsername });
      if (userWithNewUsername && userWithNewUsername._id !== userId) {
        return { error: "This username is already taken by another user." };
      }
      updateFields.username = newUsername;
    }

    if (newPreferences !== undefined) {
      if (typeof newPreferences !== "object" || newPreferences === null) {
        return { error: "New preferences must be a valid object." };
      }
      updateFields.preferences = {
        ...existingUser.preferences,
        ...newPreferences,
      };
    }

    if (Object.keys(updateFields).length > 0) {
      await this.users.updateOne({ _id: userId }, { $set: updateFields });
    }

    return {}; // Success
  }

  // --- Queries (not explicitly required by the problem statement for User, but good practice) ---
  /**
   * _getUserDetails (user: ID): (user: { name: String, username: String, preferences: Map[String, Any] })
   *
   * @requires a user with the given `user: ID` exists.
   * @effects returns the details (name, username, preferences) of the specified user.
   */
  async _getUserDetails({ user: userId }: { user: ID }): Promise<
    | Array<{
      user: {
        name: string;
        username: string;
        preferences: Record<string, unknown>;
      };
    }>
    | { error: string }
  > {
    const user = await this.users.findOne(
      { _id: userId },
      { projection: { name: 1, username: 1, preferences: 1, _id: 0 } }, // Exclude _id and password
    );

    if (!user) {
      return { error: "User not found." };
    }

    return [
      {
        user: {
          name: user.name,
          username: user.username,
          preferences: user.preferences,
        },
      },
    ];
  }

  /**
   * _getUserIDByUsername (username: String): (user: ID)
   *
   * @requires a user with the given `username` exists.
   * @effects returns the ID of the user with the specified username.
   */
  async _getUserIDByUsername({
    username,
  }: {
    username: string;
  }): Promise<Array<{ user: ID }> | { error: string }> {
    if (!username) {
      return { error: "Username cannot be empty." };
    }

    const user = await this.users.findOne(
      { username },
      { projection: { _id: 1 } },
    );
    if (!user) {
      return { error: "User not found." };
    }

    return [{ user: user._id }];
  }
}
