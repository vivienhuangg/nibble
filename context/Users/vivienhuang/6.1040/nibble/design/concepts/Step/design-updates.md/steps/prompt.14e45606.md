---
timestamp: 'Sat Oct 18 2025 21:59:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_215945.65e615a7.md]]'
content_id: 14e45606ae584d9089fe1a092c4a101711dd4b0cb8ba02e3f4bc7528212692df
---

# prompt: list only explicit, contrasting major design changes from the concept spec to its implementation. this should brief and bullet-pointed. if there are no changes, simply state "There were no changes."

### concept Step

**purpose** represent a single instruction in a recipe.\
**principle** steps guide the cooking process sequentially.

**state**

* description : String
* duration : Optional\[Integer] (in minutes)
* notes : Optional\[String] (e.g., "stir until golden brown")

**actions**

* (Generally managed within Recipe/Version actions)
