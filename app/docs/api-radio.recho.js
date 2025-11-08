/**
 * @title recho.radio(index, options)
 * @order 18
 */

/**
 * ============================================================================
 * =                      recho.radio(index, options)                        =
 * ============================================================================
 *
 * Creates an interactive radio button group that returns the selected option.
 * In the editor, this renders as radio buttons next to each option in the array.
 *
 * @param {number} index - The index of the selected option (0-based).
 * @param {Array} options - The array of options to choose from.
 * @returns {any} The selected option from the options array.
 */

const size = recho.radio(1, ["small", "medium", "large"]);

const color = recho.radio(0, ["red", "green", "blue"]);

//➜ "This is a red medium button."
echo(`This is a ${color} ${size} button.`);

