---
timestamp: 'Sat Oct 18 2025 21:55:02 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_215502.1892a1b6.md]]'
content_id: dabe3549ed0d4e8ed05a5f737c48843816d2f370a0cc6ed7fa5b0e8eccd2bb81
---

# prompt: list only contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.

### concept Step

**purpose** represent a single instruction in a recipe.\
**principle** steps guide the cooking process sequentially.

**state**

* description : String
* duration : Optional\[Integer] (in minutes)
* notes : Optional\[String] (e.g., "stir until golden brown")

**actions**

* (Generally managed within Recipe/Version actions)
