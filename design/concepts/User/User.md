### concept User

**purpose** represent an individual user within the system, enabling personalization, ownership, and access control.\
**principle** users are the primary actors and owners of content.

**state**

*   id : UUID
*   name : String
*   username : String
*   preferences : Map\[String, Any]

**actions**

*   `registerUser(name, username, password) → user`
*   `login(username, password) → user`
*   `updateProfile(user, newName, newUsername, newPreferences)`
