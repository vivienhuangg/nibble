[@implementation](implementation.md)

[@testing-concepts](../../background/testing-concepts.md)

# test: User


# response:

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

# file: src/concepts/User/UserConcept.test.ts

```typescript
import { assertEquals, assertExists, assertFalse, assertNotEquals, assertObjectMatch, assertRejects, assertStringIncludes, assertStrictEquals, assertTrue } from "jsr:@std/assert";
import { Collection, Db, MongoClient } from "npm:mongodb";
import { testDb } from "@utils/database.ts";
import UserConcept from "./UserConcept.ts";
import { ID } from "@utils/types.ts";

Deno.test("UserConcept: Core User Lifecycle", async (t) => {
  let db: Db;
  let client: MongoClient;
  let userConcept: UserConcept;

  Deno.test.beforeEach(async () => {
    [db, client] = await testDb();
    userConcept = new UserConcept(db);
    console.log("\n--- New Test Scenario ---");
  });

  Deno.test.afterEach(async () => {
    await client.close();
  });

  await t.step("should register a new user successfully", async () => {
    console.log("\nTest: Registering a new user (Alice)");
    const result = await userConcept.registerUser({
      name: "Alice Smith",
      email: "alice@example.com",
      password: "password123",
    });

    assertExists((result as { user: ID }).user, "User ID should be returned on successful registration.");
    assertFalse((result as { error: string }).error, "No error should occur.");

    const userId = (result as { user: ID }).user;
    console.log(`  Registered user with ID: ${userId}`);

    // Verify effects via query
    const userDetails = await userConcept._getUserDetails({ user: userId });
    assertExists(userDetails, "User details should be retrievable.");
    assertFalse((userDetails as { error: string }).error, "No error on getting user details.");
    assertEquals(
      (userDetails as Array<{ user: { name: string } }>)[0].user.name,
      "Alice Smith",
      "User name should match.",
    );
    assertEquals(
      (userDetails as Array<{ user: { email: string } }>)[0].user.email,
      "alice@example.com",
      "User email should match.",
    );
  });

  await t.step("should prevent registration with an existing email", async () => {
    console.log("\nTest: Attempting to register with an existing email");
    // First, register Alice
    await userConcept.registerUser({
      name: "Alice Smith",
      email: "alice@example.com",
      password: "password123",
    });

    // Try to register Bob with Alice's email
    const result = await userConcept.registerUser({
      name: "Bob Johnson",
      email: "alice@example.com",
      password: "securepassword",
    });

    assertExists((result as { error: string }).error, "An error should be returned.");
    assertStringIncludes(
      (result as { error: string }).error,
      "email already exists",
      "Error message should indicate existing email.",
    );
    console.log(`  Expected error received: ${(result as { error: string }).error}`);
  });

  await t.step("should prevent registration with empty fields", async () => {
    console.log("\nTest: Attempting to register with empty fields");

    const result1 = await userConcept.registerUser({ name: "", email: "test@example.com", password: "pwd" });
    assertExists((result1 as { error: string }).error, "Error expected for empty name.");
    assertStringIncludes((result1 as { error: string }).error, "cannot be empty", "Error message should indicate empty fields.");

    const result2 = await userConcept.registerUser({ name: "Test", email: "", password: "pwd" });
    assertExists((result2 as { error: string }).error, "Error expected for empty email.");
    assertStringIncludes((result2 as { error: string }).error, "cannot be empty", "Error message should indicate empty fields.");

    const result3 = await userConcept.registerUser({ name: "Test", email: "test@example.com", password: "" });
    assertExists((result3 as { error: string }).error, "Error expected for empty password.");
    assertStringIncludes((result3 as { error: string }).error, "cannot be empty", "Error message should indicate empty fields.");

    console.log("  Successfully prevented registration with empty fields.");
  });

  await t.step("should log in an existing user successfully", async () => {
    console.log("\nTest: Logging in an existing user (Bob)");
    // Register Bob first
    const registerResult = await userConcept.registerUser({
      name: "Bob Johnson",
      email: "bob@example.com",
      password: "securepassword",
    });
    const bobId = (registerResult as { user: ID }).user;
    assertExists(bobId);

    // Now, log in Bob
    const loginResult = await userConcept.login({
      email: "bob@example.com",
      password: "securepassword",
    });

    assertExists((loginResult as { user: ID }).user, "User ID should be returned on successful login.");
    assertEquals((loginResult as { user: ID }).user, bobId, "Logged in user ID should match registered ID.");
    assertFalse((loginResult as { error: string }).error, "No error should occur.");
    console.log(`  Successfully logged in user with ID: ${bobId}`);
  });

  await t.step("should prevent login with incorrect password", async () => {
    console.log("\nTest: Attempting to log in with incorrect password");
    // Register Charlie
    await userConcept.registerUser({
      name: "Charlie Brown",
      email: "charlie@example.com",
      password: "correctpassword",
    });

    // Try to log in with wrong password
    const loginResult = await userConcept.login({
      email: "charlie@example.com",
      password: "wrongpassword",
    });

    assertExists((loginResult as { error: string }).error, "An error should be returned.");
    assertStringIncludes(
      (loginResult as { error: string }).error,
      "Invalid email or password",
      "Error message should indicate invalid credentials.",
    );
    console.log(`  Expected error received: ${(loginResult as { error: string }).error}`);
  });

  await t.step("should prevent login for non-existent email", async () => {
    console.log("\nTest: Attempting to log in with non-existent email");

    const loginResult = await userConcept.login({
      email: "nonexistent@example.com",
      password: "anypassword",
    });

    assertExists((loginResult as { error: string }).error, "An error should be returned.");
    assertStringIncludes(
      (loginResult as { error: string }).error,
      "Invalid email or password",
      "Error message should indicate invalid credentials.",
    );
    console.log(`  Expected error received: ${(loginResult as { error: string }).error}`);
  });

  await t.step("should prevent login with empty credentials", async () => {
    console.log("\nTest: Attempting to log in with empty credentials");

    const result1 = await userConcept.login({ email: "", password: "pwd" });
    assertExists((result1 as { error: string }).error, "Error expected for empty email.");
    assertStringIncludes((result1 as { error: string }).error, "cannot be empty", "Error message should indicate empty fields.");

    const result2 = await userConcept.login({ email: "test@example.com", password: "" });
    assertExists((result2 as { error: string }).error, "Error expected for empty password.");
    assertStringIncludes((result2 as { error: string }).error, "cannot be empty", "Error message should indicate empty fields.");

    console.log("  Successfully prevented login with empty credentials.");
  });

  await t.step("should update user name and preferences successfully", async () => {
    console.log("\nTest: Updating user name and preferences (Diana)");
    // Register Diana
    const registerResult = await userConcept.registerUser({
      name: "Diana Prince",
      email: "diana@example.com",
      password: "wonderwoman",
    });
    const dianaId = (registerResult as { user: ID }).user;
    assertExists(dianaId);

    // Update Diana's name and add a preference
    const updateResult = await userConcept.updateProfile({
      user: dianaId,
      newName: "Diana Wayne",
      newPreferences: { theme: "dark", notifications: true },
    });

    assertFalse((updateResult as { error: string }).error, "No error should occur during update.");
    assertObjectMatch(updateResult, {}, "Update should return an empty object on success.");

    // Verify effects via query
    const updatedDetails = await userConcept._getUserDetails({ user: dianaId });
    assertFalse((updatedDetails as { error: string }).error, "No error on getting updated user details.");
    assertEquals(
      (updatedDetails as Array<{ user: { name: string } }>)[0].user.name,
      "Diana Wayne",
      "User name should be updated.",
    );
    assertObjectMatch(
      (updatedDetails as Array<{ user: { preferences: Record<string, unknown> } }>)[0].user
        .preferences,
      { theme: "dark", notifications: true },
      "Preferences should be updated.",
    );
    console.log(`  User '${dianaId}' updated successfully.`);
  });

  await t.step("should update user email successfully", async () => {
    console.log("\nTest: Updating user email (Eve)");
    const registerResult = await userConcept.registerUser({
      name: "Eve Adams",
      email: "eve@oldmail.com",
      password: "evepassword",
    });
    const eveId = (registerResult as { user: ID }).user;
    assertExists(eveId);

    const updateResult = await userConcept.updateProfile({
      user: eveId,
      newEmail: "eve@newmail.com",
    });

    assertFalse((updateResult as { error: string }).error, "No error should occur during update.");

    // Verify effects
    const updatedDetails = await userConcept._getUserDetails({ user: eveId });
    assertEquals(
      (updatedDetails as Array<{ user: { email: string } }>)[0].user.email,
      "eve@newmail.com",
      "User email should be updated.",
    );
    console.log(`  User '${eveId}' email updated successfully.`);
  });

  await t.step("should prevent updating email to an already taken one", async () => {
    console.log("\nTest: Attempting to update email to an already taken one");
    // Register two users
    const aliceResult = await userConcept.registerUser({
      name: "Alice",
      email: "alice@test.com",
      password: "pwd",
    });
    const aliceId = (aliceResult as { user: ID }).user;

    await userConcept.registerUser({
      name: "Bob",
      email: "bob@test.com",
      password: "pwd",
    });

    // Try to change Alice's email to Bob's email
    const updateResult = await userConcept.updateProfile({
      user: aliceId,
      newEmail: "bob@test.com",
    });

    assertExists((updateResult as { error: string }).error, "An error should be returned.");
    assertStringIncludes(
      (updateResult as { error: string }).error,
      "email is already taken",
      "Error message should indicate email is taken.",
    );
    console.log(`  Expected error received: ${(updateResult as { error: string }).error}`);
  });

  await t.step("should prevent updating a non-existent user", async () => {
    console.log("\nTest: Attempting to update a non-existent user");
    const nonExistentId = "nonexistent_user_id" as ID;
    const updateResult = await userConcept.updateProfile({
      user: nonExistentId,
      newName: "Fake User",
    });

    assertExists((updateResult as { error: string }).error, "An error should be returned.");
    assertStringIncludes(
      (updateResult as { error: string }).error,
      "User not found",
      "Error message should indicate user not found.",
    );
    console.log(`  Expected error received: ${(updateResult as { error: string }).error}`);
  });

  await t.step("should correctly retrieve user details", async () => {
    console.log("\nTest: Retrieving user details (Frank)");
    const registerResult = await userConcept.registerUser({
      name: "Frank",
      email: "frank@example.com",
      password: "frankspassword",
    });
    const frankId = (registerResult as { user: ID }).user;

    const details = await userConcept._getUserDetails({ user: frankId });
    assertFalse((details as { error: string }).error, "No error on retrieving details.");
    assertExists(details, "Details should be returned.");
    assertEquals(details.length, 1, "Should return exactly one user.");
    assertEquals(details[0].user.name, "Frank");
    assertEquals(details[0].user.email, "frank@example.com");
    assertObjectMatch(details[0].user.preferences, {}); // Initial preferences are empty
    console.log(`  Successfully retrieved details for user '${frankId}'.`);
  });

  await t.step("should return error for non-existent user details query", async () => {
    console.log("\nTest: Querying details for a non-existent user");
    const nonExistentId = "fakeid123" as ID;
    const details = await userConcept._getUserDetails({ user: nonExistentId });
    assertExists((details as { error: string }).error, "Error expected for non-existent user.");
    assertStringIncludes((details as { error: string }).error, "User not found");
    console.log(`  Expected error received: ${(details as { error: string }).error}`);
  });

  await t.step("should correctly retrieve user ID by email", async () => {
    console.log("\nTest: Retrieving user ID by email (Grace)");
    const registerResult = await userConcept.registerUser({
      name: "Grace",
      email: "grace@example.com",
      password: "gracepassword",
    });
    const graceId = (registerResult as { user: ID }).user;

    const result = await userConcept._getUserIDByEmail({ email: "grace@example.com" });
    assertFalse((result as { error: string }).error, "No error on retrieving ID by email.");
    assertExists(result, "Result should be returned.");
    assertEquals(result.length, 1, "Should return exactly one user ID.");
    assertEquals(result[0].user, graceId);
    console.log(`  Successfully retrieved ID for email 'grace@example.com'.`);
  });

  await t.step("should return error for non-existent user ID by email query", async () => {
    console.log("\nTest: Querying ID by email for a non-existent user");
    const result = await userConcept._getUserIDByEmail({ email: "unknown@example.com" });
    assertExists((result as { error: string }).error, "Error expected for non-existent email.");
    assertStringIncludes((result as { error: string }).error, "User not found");
    console.log(`  Expected error received: ${(result as { error: string }).error}`);
  });

  // Trace: Demonstrates the principle "users are the primary actors and owners of content."
  // This principle is demonstrated by a user's ability to register, log in, and manage their own profile,
  // establishing them as a distinct and manageable entity within the system.
  await t.step("trace: User principle fulfillment (Alice's Journey)", async () => {
    console.log("\n--- Trace: Alice's Journey to fulfill User concept principle ---");
    console.log("Principle: Users are the primary actors and owners of content.");

    // Alice registers
    console.log("Step 1: Alice registers.");
    const registerResult = await userConcept.registerUser({
      name: "Alice Principle",
      email: "alice.principle@example.com",
      password: "securepassword",
    });
    assertFalse((registerResult as { error: string }).error, "Registration should succeed.");
    const aliceId = (registerResult as { user: ID }).user;
    assertExists(aliceId);
    console.log(`  Alice registered with ID: ${aliceId}`);

    // Alice logs in
    console.log("Step 2: Alice logs in.");
    const loginResult = await userConcept.login({
      email: "alice.principle@example.com",
      password: "securepassword",
    });
    assertFalse((loginResult as { error: string }).error, "Login should succeed.");
    assertEquals((loginResult as { user: ID }).user, aliceId);
    console.log(`  Alice logged in successfully.`);

    // Alice updates her profile (demonstrates ownership/control over her content)
    console.log("Step 3: Alice updates her profile with new name and preferences.");
    const updateResult = await userConcept.updateProfile({
      user: aliceId,
      newName: "Alice P. Smith",
      newPreferences: { "fav_color": "blue", "notifications": false },
    });
    assertFalse((updateResult as { error: string }).error, "Profile update should succeed.");
    console.log(`  Alice's profile updated.`);

    // Verify her updated profile
    console.log("Step 4: Verify Alice's updated profile.");
    const updatedDetails = await userConcept._getUserDetails({ user: aliceId });
    assertFalse((updatedDetails as { error: string }).error, "Query for updated details should succeed.");
    assertEquals(
      (updatedDetails as Array<{ user: { name: string } }>)[0].user.name,
      "Alice P. Smith",
      "Name should be updated.",
    );
    assertObjectMatch(
      (updatedDetails as Array<{ user: { preferences: Record<string, unknown> } }>)[0].user
        .preferences,
      { "fav_color": "blue", "notifications": false },
      "Preferences should be updated and merged.",
    );
    console.log("  Alice's updated profile verified. She clearly acts as a primary actor and owner of her data.");
    console.log("--- End Trace: User concept principle fulfilled ---");
  });
});
```
