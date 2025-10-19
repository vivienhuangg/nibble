---
timestamp: 'Sat Oct 18 2025 21:59:08 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_215908.348bcd6e.md]]'
content_id: db75526c435968eeb9ae2c3b6d96ad438aee136b2d437a4c06ebefc13701fa24
---

# prompt: list only explicit, contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, state it.

### concept Step

**purpose** represent a single instruction in a recipe.\
**principle** steps guide the cooking process sequentially.

**state**

* description : String
* duration : Optional\[Integer] (in minutes)
* notes : Optional\[String] (e.g., "stir until golden brown")

**actions**

* (Generally managed within Recipe/Version actions)
