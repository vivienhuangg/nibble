---
timestamp: 'Sun Oct 19 2025 13:28:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_132801.e1c2ecab.md]]'
content_id: 8ee16e5b04a4b12093be724d5b691c7da9071ffe92a628849fe116e007ef2b78
---

# prompt: list only contrasting major design conceptual (not implementation-specific) changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.

### concept VersionDraft \[User, Recipe] (Transient)

**purpose** represent a temporary, AI-generated suggestion for a recipe modification, awaiting user review.\
**principle** drafts provide AI assistance without directly altering canonical recipe data.

**state**

* id : UUID
* requester : User
* baseRecipe : Recipe
* goal : String (the prompt given to the AI)
* ingredients : List\[Ingredient] (proposed changes)
* steps : List\[Step] (proposed changes)
* notes : String (AI-generated summary of changes)
* confidence : Optional\[Float] (AI's confidence in the draft)
* created : DateTime
* expires : DateTime (e.g., 24 hours)

**actions**

* (Managed by `draftVersionWithAI`, `approveDraft`, `rejectDraft` actions on the `Version` concept)
