/**
 * @title recho.toggle(value)
 */

/**
 * ============================================================================
 * =                         recho.toggle(value)                             =
 * ============================================================================
 *
 * Creates an interactive toggle (checkbox) control that returns the boolean
 * value. In the editor, this renders as a clickable checkbox that updates the
 * code when toggled.
 *
 * @param {boolean} value - The initial boolean value.
 * @returns {boolean} The boolean value.
 */

const isEnabled = recho.toggle(true);

const isVisible = recho.toggle(false);

//➜ "The button is enabled."
//➜ "The button is hidden."
{
  echo(`The button is ${isEnabled ? "enabled" : "disabled"}.`);
  echo(`The button is ${isVisible ? "visible" : "hidden"}.`);
}

