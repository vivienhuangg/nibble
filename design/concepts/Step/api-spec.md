[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)
# Extracting from code

The following is an explanation of how concepts are implemented, for the purposes of understanding how to extract an API.

[@implementing-concepts](../../background/implementing-concepts.md)

# prompt: 

Now, analyze the following Concept Implementation and generate the API documentation based on these instructions.

[@StepConcept](../../../src/concepts/Step.ts)


# response:

# API Specification: Step Concept

**Purpose:** represent a single instruction in a recipe.

---

## API Endpoints

The `Step` concept, as described in its implementation, does not expose its own API endpoints. Instead, `Step` objects function as embedded documents or value objects within the state of other concepts, such as `Recipe` and `Version`.

Therefore, the creation, modification, and deletion of `Step` data are managed through the actions and queries of `RecipeConcept` and `VersionConcept`, rather than direct endpoints on a `StepConcept` itself.

There are no direct `POST /api/Step/{actionOrQueryName}` endpoints.