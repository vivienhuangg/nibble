---
timestamp: 'Sun Oct 19 2025 13:26:32 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_132632.d33b84f4.md]]'
content_id: b28c90eea9094895c9c2888909cd648f86b7ebd91730d3eabf98341a69465de3
---

# prompt: list only contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.

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
