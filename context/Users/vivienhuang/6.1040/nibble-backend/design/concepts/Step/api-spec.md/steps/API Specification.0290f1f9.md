---
timestamp: 'Mon Oct 20 2025 20:40:10 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_204010.188e4deb.md]]'
content_id: 0290f1f967585ec739df37dc2ee0f5a728ded5b861fcaab4a0c4d65081516c49
---

# API Specification: Step Concept

**Purpose:** represent a single instruction in a recipe.

***

## API Endpoints

The `Step` concept, as described in its implementation, does not expose its own API endpoints. Instead, `Step` objects function as embedded documents or value objects within the state of other concepts, such as `Recipe` and `Version`.

Therefore, the creation, modification, and deletion of `Step` data are managed through the actions and queries of `RecipeConcept` and `VersionConcept`, rather than direct endpoints on a `StepConcept` itself.

There are no direct `POST /api/Step/{actionOrQueryName}` endpoints.
