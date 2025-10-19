### concept User

**purpose** represent an individual user within the system, enabling personalization, ownership, and access control.\
**principle** users are the primary actors and owners of content.

**state**

*   id : UUID
*   name : String
*   email : String
*   preferences : Map\[String, Any]

**actions**

*   `registerUser(name, email, password) → user`
*   `login(email, password) → user`
*   `updateProfile(user, newName, newEmail, newPreferences)`
