---
timestamp: 'Mon Oct 20 2025 20:40:03 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_204003.b0f655b8.md]]'
content_id: 9fff6405803a7afff91f24a36e5b7165600b5a39508de601331f143e546b153d
---

# prompt:

Now, analyze the following Concept Specification and generate the API documentation based on these instructions.

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
