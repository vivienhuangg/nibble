---
timestamp: 'Sun Oct 19 2025 14:06:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_140645.c032c783.md]]'
content_id: 1928dbda28c9f0129906d5436018cfa4c8f4b574997774f5175f0aa1ce2bba2f
---

# response:

Here are the contrasting major design changes from the `Annotation` concept specification to its implementation:

* **Validation Logic Deferral:** The `annotate` action's `requires` clauses (e.g., `recipe exists`, `0 ≤ index < |target list|`) and the `resolveAnnotation` action's `requires` clause (`resolver canView annotation.recipe`) are explicitly deferred to "higher-level logic or syncs" in the implementation. This emphasizes the strict independence of the `Annotation` concept, ensuring it doesn't need to understand the internal structure of a `Recipe` or external user permissions.
* **Addition of Explicit Queries:** The concept specification did not define any explicit query actions. The implementation adds `_getAnnotationsForRecipe` and `_getAnnotationById` methods to allow for direct retrieval of annotations, enhancing testability and practicality.
