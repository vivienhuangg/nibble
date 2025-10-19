# prompt: list only contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.         


[@Ingredient](Ingredient.md)

[@implementation](implementation.md)

[@testing](testing.md)

[@README](../../../README.md)

[@rubric](../../background/rubric.md)

[@concept-state](../../background/detailed/concept-state.md)

[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)


# response:

- **Nature of Implementation:** The concept specification describes `Ingredient` as a `concept`, implying it *could* be implemented as a standalone service with its own persistent state and actions. However, the implementation treats `Ingredient` purely as a **reusable data structure (TypeScript interface)**, intended to be embedded within other concepts (like `Recipe` or `Version`), rather than a full concept class managing its own dedicated MongoDB collection and lifecycle.
- **State Management:** While the concept spec outlines `Ingredient`'s state, the implementation **does not create a dedicated MongoDB collection** for ingredients. Instead, `Ingredient` objects (defined by the interface) are stored as embedded sub-documents within the state of other concepts.