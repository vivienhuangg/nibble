### concept VersionDraft \[User, Recipe] (Transient)

**purpose** represent a temporary, AI-generated suggestion for a recipe modification, awaiting user review.\
**principle** drafts provide AI assistance without directly altering canonical recipe data.

**state**

*   id : UUID
*   requester : User
*   baseRecipe : Recipe
*   goal : String (the prompt given to the AI)
*   ingredients : List\[Ingredient] (proposed changes)
*   steps : List\[Step] (proposed changes)
*   notes : String (AI-generated summary of changes)
*   confidence : Optional\[Float] (AI's confidence in the draft)
*   created : DateTime
*   expires : DateTime (e.g., 24 hours)

**actions**

*   (Managed by `draftVersionWithAI`, `approveDraft`, `rejectDraft` actions on the `Version` concept)
