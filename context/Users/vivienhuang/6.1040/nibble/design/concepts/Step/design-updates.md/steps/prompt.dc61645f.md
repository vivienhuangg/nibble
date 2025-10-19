---
timestamp: 'Sat Oct 18 2025 21:53:55 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_215355.74dd6e31.md]]'
content_id: dc61645ffacce74051addb6b82c78e38a00100af1660e8d0521b7549ebb42b1f
---

# prompt: list any design changes from the concept spec to the implementation and testing.

### concept Step

**purpose** represent a single instruction in a recipe.\
**principle** steps guide the cooking process sequentially.

**state**

* description : String
* duration : Optional\[Integer] (in minutes)
* notes : Optional\[String] (e.g., "stir until golden brown")

**actions**

* (Generally managed within Recipe/Version actions)
