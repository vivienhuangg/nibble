---
timestamp: 'Sat Oct 18 2025 22:59:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_225952.1bc0cce6.md]]'
content_id: 2c15986be45a87551e6cbcd0e8132b0208550a57ba7f034cb4528ce21e1981e2
---

# concept: VersionDraft

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

* `createDraft(requester, baseRecipe, goal, ingredients, steps, notes, confidence?, created?, expires?) → versionDraft`
* `_getDraftById(id) → versionDraft`
* `deleteDraft(id)`
