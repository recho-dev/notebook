/**
 * @title recho.button(label[, id], callback)
 */

/**
 * ============================================================================
 * =                  recho.button(label[, id], callback)                    =
 * ============================================================================
 *
 * Creates an interactive button that executes a callback function when clicked.
 * In the editor, this renders as a clickable button with the specified label.
 *
 * By default, the label is used as the button ID. If you have multiple buttons
 * with the same label, you must provide a custom ID as the second parameter.
 *
 * @param {string} label - The text to display on the button.
 * @param {string} [id] - Optional custom ID (required for duplicate labels).
 * @param {Function} callback - The function to execute when the button is clicked.
 * @returns {undefined}
 */

// Basic button example (label is used as ID)
recho.button("Click me!", () => {
  alert("Button clicked!");
});

recho.button("Click me!", "click_me", () => {
  alert("You clicked the button!");
});

const [items, setItems] = recho.state([]);

// Button that modifies data
recho.button("Add Random Number", () => {
  setItems(oldItems => [...oldItems, Math.floor(Math.random() * 100)]);
});

echo(items);

recho.button("Remove a Random Item", () => setItems(oldItems => {
  if (oldItems.length === 0) return oldItems;
  const index = _.random(0, oldItems.length - 1);
  echo(`Removed ${oldItems[index]} at index ${index} from the array.`);
  return oldItems.slice(0, index).concat(oldItems.slice(index + 1));
}));

const _ = recho.require("lodash");
