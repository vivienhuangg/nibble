[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

[@app-overview](../../background/app-overview.md)

[@Step](Step.md)

# implement: Step

# response:

To implement the `Step` concept, it's crucial to first understand its role within the larger application design. As per the concept design document:

*   **`Step`'s Actions**: The specification explicitly states "(Generally managed within Recipe/Version actions)". This means `Step` does not have its own independent set of API endpoints or methods to create, update, or delete steps directly. Its behavior is encapsulated and managed by the `Recipe` and `Version` concepts.
*   **`Step`'s State**: The `Recipe` concept's state includes `steps : List[Step]`. This indicates that `Step` instances are intended to be embedded documents or value objects within `Recipe` (and `Version`) documents in MongoDB, rather than existing as separate top-level collections with their own unique identifiers (`_id`).

Given these characteristics, `Step` is not a standalone backend service that requires a full `StepConcept` class managing its own MongoDB collection(s). Instead, its "implementation" primarily involves defining its data structure as a TypeScript interface, which will then be used by `RecipeConcept` and `VersionConcept` to type the `steps` array in their respective document structures.

However, to strictly adhere to the requested output format `# file: src/{name}/{name}Concept.ts`, we will create a `StepConcept.ts` file that exports both an (empty) class and the `Step` interface. The class serves as a placeholder, explicitly stating that it does not manage its own collections or actions, while the interface defines the actual data structure of a `Step`.

# concept: Step

**purpose** represent a single instruction in a recipe.\
**principle** steps guide the cooking process sequentially.

**state**

*   description : String
*   duration : Optional\[Integer] (in minutes)
*   notes : Optional\[String] (e.g., "stir until golden brown")

**actions**

*   (Generally managed within Recipe/Version actions)

# file: src/Step/StepConcept.ts

```typescript
import { Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";

/**
 * Concept: Step
 *
 * purpose: represent a single instruction in a recipe.
 * principle: steps guide the cooking process sequentially.
 *
 * This file defines the TypeScript representation of the Step concept.
 * As described in the concept design, the actions for `Step` are
 * "Generally managed within Recipe/Version actions." This implies that
 * `Step` is not a standalone backend service with its own MongoDB collection
 * and dedicated `Concept` class managing it.
 *
 * Instead, `Step` functions as an embedded document or value object within
 * the state of other concepts, specifically `Recipe` and `Version`.
 *
 * Therefore, this class serves as a structural placeholder to fulfill the
 * naming convention for concept implementation files. It does not manage
 * its own database collections or implement any actions, as its data and
 * lifecycle are controlled by `RecipeConcept` and `VersionConcept`.
 *
 * The actual "implementation" of the `Step` concept's state is provided
 * by the `Step` TypeScript interface, which defines its data structure.
 */
export default class StepConcept {
  // The Step concept does not manage its own MongoDB collections
  // because Step objects are embedded within other concept's documents (e.g., Recipe).
  constructor(private readonly db: Db) {
    // No collections to initialize here.
  }

  // No actions or queries are defined in this class, as they are managed
  // by other concepts (e.g., RecipeConcept and VersionConcept).
}

/**
 * Interface representing the data structure for a single instruction in a recipe.
 * This interface defines the state of a Step as described in the concept specification.
 * It will be used by other concepts (like Recipe and Version) to type their embedded lists of steps.
 */
export interface Step {
  /**
   * description : String
   * The textual instruction for the step.
   */
  description: string;

  /**
   * duration : Optional[Integer] (in minutes)
   * The estimated duration for this step in minutes.
   * Represented as an optional number, meaning it can be `undefined`.
   */
  duration?: number;

  /**
   * notes : Optional[String] (e.g., "stir until golden brown")
   * Additional notes or tips for the step.
   * Represented as an optional string, meaning it can be `undefined`.
   */
  notes?: string;
}
```