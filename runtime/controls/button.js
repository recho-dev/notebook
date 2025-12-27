/**
 * ButtonRegistry manages callback functions for button widgets.
 * Each runtime instance has its own ButtonRegistry to avoid conflicts.
 */
export class ButtonRegistry {
  constructor() {
    // Maps button ID -> callback function
    this.callbackMap = new Map();

    // Maps block ID -> Set of button IDs
    this.blockCallbacks = new Map();

    // Track button IDs registered in the current execution cycle
    // Used to detect duplicates within a single execution
    this.currentExecutionIds = new Set();
  }

  /**
   * Register a button callback.
   * Called during notebook evaluation.
   *
   * @param {string} id - Unique identifier for this button
   * @param {Function} callback - Function to execute when button is clicked
   * @returns {boolean} true if successful, false if duplicate in current execution
   */
  register(id, callback) {
    this.callbackMap.set(id, callback);
    this.currentExecutionIds.add(id);
    return true;
  }

  /**
   * Start a new execution cycle.
   * Clears the tracking of IDs registered in the current execution.
   */
  startExecution() {
    this.currentExecutionIds.clear();
  }

  /**
   * Retrieve a callback function by button ID.
   *
   * @param {string} id - Button ID
   * @returns {Function|undefined} The callback function, or undefined if not found
   */
  getCallback(id) {
    return this.callbackMap.get(id);
  }

  /**
   * Execute a button callback by ID.
   * Catches and logs errors to prevent runtime crashes.
   *
   * @param {string} id - Button ID
   * @returns {*} The return value of the callback, or undefined if callback not found
   */
  executeCallback(id) {
    const callback = this.callbackMap.get(id);
    if (!callback) {
      console.warn(`Button callback not found for ID: ${id}`);
      return undefined;
    }

    try {
      return callback();
    } catch (error) {
      console.error(`Error executing button callback (${id}):`, error);
      throw error; // Re-throw so it can be handled by the runtime
    }
  }

  /**
   * Register button IDs for a specific block.
   * Used for tracking which buttons belong to which block.
   *
   * @param {string} blockId - Block/cell identifier
   * @param {string[]} buttonIds - Array of button IDs in this block
   */
  registerBlock(blockId, buttonIds) {
    this.blockCallbacks.set(blockId, new Set(buttonIds));
  }

  /**
   * Clean up callbacks for a specific block.
   * Called when a block is re-evaluated or destroyed.
   *
   * @param {string} blockId - Block/cell identifier
   */
  cleanupBlock(blockId) {
    const buttonIds = this.blockCallbacks.get(blockId);
    if (buttonIds) {
      for (const id of buttonIds) {
        this.callbackMap.delete(id);
      }
      this.blockCallbacks.delete(blockId);
    }
  }

  /**
   * Clear all callbacks (useful for resetting the entire runtime).
   */
  clear() {
    this.callbackMap.clear();
    this.blockCallbacks.clear();
    this.currentExecutionIds.clear();
  }
}

/**
 * Factory to create a button function bound to a specific ButtonRegistry.
 *
 * Usage:
 *   const button = makeButton(registry);
 *   button(label, callback) or button(label, id, callback)
 *
 * @param {ButtonRegistry} registry - The button registry instance
 * @returns {Function} button function
 */
export function makeButton(registry) {
  /**
   * Button control for executing callbacks on click.
   *
   * Two usage patterns:
   * 1. button(label, callback) - Uses label as ID
   * 2. button(label, id, callback) - Uses custom ID (for duplicate labels)
   *
   * @param {string} label - Button label text
   * @param {string|Function} idOrCallback - Either custom ID or callback function
   * @param {Function} [callback] - Callback function (if custom ID provided)
   * @returns {undefined}
   */
  function button(label, idOrCallback, callback) {
    if (!registry) {
      console.warn("Button registry not initialized");
      return undefined;
    }
    let id;
    let actualCallback;
    // Determine if we have 2 or 3 arguments
    if (typeof idOrCallback === "function") {
      // button(label, callback) - use label as ID
      id = label;
      actualCallback = idOrCallback;
    } else if (typeof idOrCallback === "string" && typeof callback === "function") {
      // button(label, id, callback) - use custom ID
      id = idOrCallback;
      actualCallback = callback;
    } else {
      throw new Error("Invalid button arguments. Expected: button(label, callback) or button(label, id, callback)");
    }
    // Try to register the button
    const success = registry.register(id, actualCallback);
    if (!success) {
      // Duplicate ID detected in current execution
      throw new Error(
        `Duplicate button ID "${id}" in the same execution. ` +
          (id === label
            ? `Either change the label or provide a custom ID: recho.button("${label}", "unique_id", callback)`
            : `The ID "${id}" is already in use. Please use a different ID.`),
      );
    }
    return undefined;
  }
  return button;
}

export const button = 0;
