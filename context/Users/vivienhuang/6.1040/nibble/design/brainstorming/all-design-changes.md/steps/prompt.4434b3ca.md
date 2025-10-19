---
timestamp: 'Sun Oct 19 2025 14:06:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140645.c032c783.md]]'
content_id: 4434b3ca73a58cb9ecf6c9e4882898e84addc26f3b3f7c4e9cde2c82cd70dfb0
---

# prompt: list only contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.

### concept Annotation \[User, Recipe]

**purpose** capture contextual notes on a specific ingredient or step without altering the recipe.\
**principle** annotations enrich understanding while preserving recipe immutability.

**state**

* id : UUID
* author : User
* recipe : Recipe
* targetKind : {Ingredient | Step}
* targetIndex : Integer (index in the respective `ingredients` or `steps` list of the `recipe`)
* text : String
* created : DateTime
* resolved : Boolean

**actions**

* `annotate(author, recipe, targetKind, index, text) → annotation`\
  requires recipe exists; text ≠ ""; 0 ≤ index < |target list| for targetKind\
  effects adds new unresolved annotation, sets `created`
* `editAnnotation(author, annotation, newText)`\
  requires author = annotation.author effects annotation.text := newText
* `resolveAnnotation(resolver, annotation, resolved)`\
  requires resolver canView annotation.recipe effects annotation.resolved := resolved
* `deleteAnnotation(author, annotation)`\
  requires author = annotation.author effects removes annotation
