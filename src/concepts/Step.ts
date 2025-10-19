import type { Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";

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
